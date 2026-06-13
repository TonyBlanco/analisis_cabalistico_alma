from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError

from api.models import Patient
from api.services.federation_consent_service import set_patient_federation_consent


class Command(BaseCommand):
    help = (
        'Grant or revoke federation consent for patient(s). Idempotent. '
        'Prod: docker exec studio33_api python manage.py grant_federation_consent --patient-id 1'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--patient-id',
            type=int,
            help='Patient primary key to update',
        )
        parser.add_argument(
            '--all-of-therapist',
            type=int,
            help='Therapist user id — update all active patients of this therapist',
        )
        parser.add_argument(
            '--revoke',
            action='store_true',
            help='Revoke consent instead of granting (default: grant)',
        )

    def handle(self, *args, **options):
        patient_id = options.get('patient_id')
        therapist_id = options.get('all_of_therapist')
        consent = not options.get('revoke')

        if not patient_id and not therapist_id:
            raise CommandError('Provide --patient-id and/or --all-of-therapist')

        patients = Patient.objects.filter(is_active=True)
        if patient_id:
            patients = patients.filter(id=patient_id)
        if therapist_id:
            if not User.objects.filter(id=therapist_id).exists():
                raise CommandError(f'Therapist user id={therapist_id} not found')
            patients = patients.filter(therapist_id=therapist_id)

        patients = list(patients.select_related('therapist'))
        if not patients:
            raise CommandError('No matching active patients found')

        updated = 0
        skipped = 0
        for patient in patients:
            actor = patient.therapist
            _, changed = set_patient_federation_consent(
                patient=patient,
                consent=consent,
                actor_user=actor,
                source='management_command',
            )
            if changed:
                updated += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'patient_id={patient.id} consent_federation={consent}',
                    ),
                )
            else:
                skipped += 1
                self.stdout.write(
                    f'patient_id={patient.id} already consent_federation={consent} (skipped)',
                )

        self.stdout.write(
            self.style.SUCCESS(f'Done: {updated} updated, {skipped} unchanged ({len(patients)} total)'),
        )