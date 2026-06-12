from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from typing import Iterable

from django.core.management.base import BaseCommand, CommandError

from api.models import AnalysisRecord, Patient
from api.models_astrology import AstrologySessionReport
from api.services.holistic_records import (
    build_astrology_module_payload,
    build_bioemotional_module_payload,
    build_tarot_module_payload,
    build_transgenerational_module_payload,
    predict_module_synthesis_outcome,
    record_module_synthesis,
)
from swm.tarot.models import WorkspaceInstance, WorkspaceStatus
from swm.transgenerational.models import TransgenerationalSession


MODULE_CHOICES = ('tarot', 'transgenerational', 'astrology', 'biodecoding', 'kabbalah', 'all')


@dataclass
class ModuleStats:
    created: int = 0
    updated: int = 0
    skipped: int = 0
    errors: int = 0
    error_patients: set[int] = field(default_factory=set)


class Command(BaseCommand):
    help = 'Backfill normalized AnalysisRecord rows for existing historical module data.'

    def add_arguments(self, parser):
        parser.add_argument('--patient', type=int, help='Process only one patient id.')
        parser.add_argument(
            '--module',
            choices=MODULE_CHOICES,
            default='all',
            help='Module to process (default: all).',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Do not write AnalysisRecord rows; only report what would happen.',
        )
        parser.add_argument(
            '--since',
            type=lambda value: date.fromisoformat(value),
            help='Only process sources on/after YYYY-MM-DD.',
        )

    def handle(self, *args, **options):
        patients = self._get_patients(patient_id=options.get('patient'))
        selected_modules = (
            ['tarot', 'transgenerational', 'astrology', 'biodecoding', 'kabbalah']
            if options['module'] == 'all'
            else [options['module']]
        )
        dry_run = bool(options['dry_run'])
        since = options.get('since')

        summary = {module: ModuleStats() for module in selected_modules}

        for module in selected_modules:
            processor = getattr(self, f'_process_{module}')
            processor(
                patients=patients,
                since=since,
                dry_run=dry_run,
                stats=summary[module],
            )

        mode = 'DRY-RUN' if dry_run else 'APPLY'
        self.stdout.write(self.style.SUCCESS(f'backfill_analysis_records completed ({mode})'))
        for module in selected_modules:
            stats = summary[module]
            error_patients = ', '.join(str(pid) for pid in sorted(stats.error_patients)) or '-'
            self.stdout.write(
                (
                    f'[{module}] created={stats.created} updated={stats.updated} '
                    f'skipped={stats.skipped} errors={stats.errors} error_patients={error_patients}'
                )
            )

    def _get_patients(self, *, patient_id: int | None) -> list[Patient]:
        queryset = Patient.objects.select_related('therapist', 'user').order_by('id')
        if patient_id is not None:
            patient = queryset.filter(pk=patient_id).first()
            if patient is None:
                raise CommandError(f'Patient {patient_id} not found.')
            return [patient]
        return list(queryset.filter(is_active=True))

    def _apply_payload(self, payload: dict, *, dry_run: bool) -> str:
        outcome = predict_module_synthesis_outcome(**payload)
        if dry_run or outcome == 'skipped':
            return outcome
        record = record_module_synthesis(**payload)
        if record is None:
            raise RuntimeError('record_module_synthesis returned None')
        return outcome

    def _track_outcome(self, stats: ModuleStats, outcome: str) -> None:
        if outcome == 'created':
            stats.created += 1
        elif outcome == 'updated':
            stats.updated += 1
        else:
            stats.skipped += 1

    def _process_payloads(self, payloads: Iterable[dict], *, stats: ModuleStats, dry_run: bool) -> None:
        for payload in payloads:
            patient = payload['patient']
            try:
                outcome = self._apply_payload(payload, dry_run=dry_run)
                self._track_outcome(stats, outcome)
            except Exception:
                stats.errors += 1
                stats.error_patients.add(patient.id)
                self.stderr.write(
                    self.style.ERROR(
                        f'Error processing module={payload["kind"]} patient_id={patient.id}'
                    )
                )

    def _process_tarot(self, *, patients: list[Patient], since: date | None, dry_run: bool, stats: ModuleStats) -> None:
        subject_user_ids = [patient.user_id for patient in patients if patient.user_id]
        therapist_ids = list({patient.therapist_id for patient in patients})
        if not subject_user_ids or not therapist_ids:
            return

        query = WorkspaceInstance.objects.filter(
            status=WorkspaceStatus.SEALED,
            creator_user_id__in=therapist_ids,
            subject_user_id__in=subject_user_ids,
        ).select_related('creator_user', 'subject_user')
        if since:
            query = query.filter(sealed_at__date__gte=since)

        payloads = (
            payload
            for instance in query.order_by('sealed_at', 'created_at')
            for payload in [build_tarot_module_payload(instance)]
            if payload and payload['patient'].id in {patient.id for patient in patients}
        )
        self._process_payloads(payloads, stats=stats, dry_run=dry_run)

    def _process_transgenerational(
        self,
        *,
        patients: list[Patient],
        since: date | None,
        dry_run: bool,
        stats: ModuleStats,
    ) -> None:
        subject_user_ids = [patient.user_id for patient in patients if patient.user_id]
        therapist_ids = list({patient.therapist_id for patient in patients})
        if not subject_user_ids or not therapist_ids:
            return

        query = TransgenerationalSession.objects.filter(
            status='closed',
            therapist_id__in=therapist_ids,
            patient_id__in=subject_user_ids,
        ).select_related('therapist', 'patient')
        if since:
            query = query.filter(closed_at__date__gte=since)

        payloads = (
            payload
            for session in query.order_by('closed_at', 'created_at')
            for payload in [build_transgenerational_module_payload(session)]
            if payload and payload['patient'].id in {patient.id for patient in patients}
        )
        self._process_payloads(payloads, stats=stats, dry_run=dry_run)

    def _process_astrology(
        self,
        *,
        patients: list[Patient],
        since: date | None,
        dry_run: bool,
        stats: ModuleStats,
    ) -> None:
        patient_ids = [patient.id for patient in patients]
        if not patient_ids:
            return

        query = AstrologySessionReport.objects.filter(
            status='final',
            patient_id__in=patient_ids,
        ).select_related('created_by', 'patient', 'natal_chart')
        if since:
            query = query.filter(created_at__date__gte=since)

        payloads = (
            payload
            for report in query.order_by('created_at')
            for payload in [build_astrology_module_payload(report)]
            if payload
        )
        self._process_payloads(payloads, stats=stats, dry_run=dry_run)

    def _process_biodecoding(
        self,
        *,
        patients: list[Patient],
        since: date | None,
        dry_run: bool,
        stats: ModuleStats,
    ) -> None:
        for patient in patients:
            try:
                payload = build_bioemotional_module_payload(patient)
                if payload is None:
                    continue
                if since:
                    last_session_date = payload['computed_result']['snapshot']['last_session_date'][:10]
                    if last_session_date < since.isoformat():
                        continue
                outcome = self._apply_payload(payload, dry_run=dry_run)
                self._track_outcome(stats, outcome)
            except Exception:
                stats.errors += 1
                stats.error_patients.add(patient.id)
                self.stderr.write(
                    self.style.ERROR(
                        f'Error processing module=biodecoding patient_id={patient.id}'
                    )
                )

    def _process_kabbalah(
        self,
        *,
        patients: list[Patient],
        since: date | None,
        dry_run: bool,
        stats: ModuleStats,
    ) -> None:
        del dry_run

        patient_ids = [patient.id for patient in patients]
        if not patient_ids:
            return

        query = AnalysisRecord.objects.filter(kind='kabbalah', patient_id__in=patient_ids)
        if since:
            query = query.filter(created_at__date__gte=since)

        stats.skipped += query.count()
