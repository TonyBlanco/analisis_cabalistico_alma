from __future__ import annotations

from io import StringIO

from django.contrib.auth.models import User
from django.core.management import call_command
from django.test import TestCase
from django.utils import timezone

from api.bioemotional.models import BioEmotionalObservation, BioEmotionalSession
from api.models import AnalysisRecord, Patient
from api.models_astrology import AstrologyNatalChart, AstrologySessionReport


def _sample_chart_payload():
    return {
        'planetas': [
            {'nombre': 'sun', 'signo': 'Leo', 'grados': 10, 'longitud_ecliptica': 130, 'casa': 10},
        ],
        'casas': [
            {'numero': index, 'signo': 'Aries', 'cuspide_grados': 0, 'cuspide_longitud': (index - 1) * 30}
            for index in range(1, 13)
        ],
        'aspectos': [],
        'metadatos': {'sistema_casas': 'P'},
    }


class BackfillAnalysisRecordsCommandTests(TestCase):
    def setUp(self):
        self.therapist = User.objects.create_user(username='backfill_therapist', password='pass')
        self.therapist.profile.user_type = 'therapist'
        self.therapist.profile.full_name = 'Backfill Therapist'
        self.therapist.profile.save()

        self.patient_user = User.objects.create_user(username='backfill_patient', password='pass')
        self.patient_user.profile.user_type = 'patient'
        self.patient_user.profile.save()

        self.patient = Patient.objects.create(
            therapist=self.therapist,
            user=self.patient_user,
            first_name='Ada',
            last_name='History',
            email='ada.history@example.com',
            full_name='Ada History',
            birth_date='1990-05-15',
            birth_time='14:30:00',
            birth_city='Madrid',
            birth_country='ES',
            birth_latitude=40.4168,
            birth_longitude=-3.7038,
            birth_timezone='Europe/Madrid',
            is_active=True,
        )

        self.empty_patient_user = User.objects.create_user(username='empty_patient', password='pass')
        self.empty_patient_user.profile.user_type = 'patient'
        self.empty_patient_user.profile.save()

        self.empty_patient = Patient.objects.create(
            therapist=self.therapist,
            user=self.empty_patient_user,
            first_name='Empty',
            last_name='Patient',
            email='empty.patient@example.com',
            full_name='Empty Patient',
            birth_date='1991-06-20',
            is_active=True,
        )

    def _create_astrology_history(self) -> AstrologySessionReport:
        chart = AstrologyNatalChart.objects.create(
            patient=self.patient,
            created_by=self.therapist,
            house_system='P',
            source='swiss_ephemeris',
            chart_payload=_sample_chart_payload(),
            input_snapshot={'zodiac_type': 'tropical', 'house_system': 'P'},
        )
        return AstrologySessionReport.objects.create(
            patient=self.patient,
            created_by=self.therapist,
            natal_chart=chart,
            title='Informe histórico',
            status='final',
            visibility='therapist',
            report_payload={'active_layers': ['natal', 'transits']},
            interpretation_ids=['int-1', 'int-2'],
        )

    def _create_bio_history(self) -> BioEmotionalSession:
        session = BioEmotionalSession.objects.create(
            patient=self.patient,
            therapist=self.therapist,
            emotional_state='better',
            heatmap_data={'chest_center': 8, 'spine': 6},
            is_closed=True,
            closed_at=timezone.now(),
        )
        BioEmotionalObservation.objects.create(
            therapist=self.therapist,
            patient=self.patient,
            region_id='chest_center',
            note_text='Opresión histórica',
        )
        return session

    def test_dry_run_does_not_write_records(self):
        self._create_astrology_history()
        self._create_bio_history()
        stdout = StringIO()

        call_command(
            'backfill_analysis_records',
            patient=self.patient.id,
            module='all',
            dry_run=True,
            stdout=stdout,
        )

        self.assertEqual(AnalysisRecord.objects.count(), 0)
        output = stdout.getvalue()
        self.assertIn('[astrology] created=1 updated=0 skipped=0 errors=0', output)
        self.assertIn('[biodecoding] created=1 updated=0 skipped=0 errors=0', output)

    def test_creates_records_for_patient_with_two_historical_modules(self):
        report = self._create_astrology_history()
        session = self._create_bio_history()
        stdout = StringIO()

        call_command(
            'backfill_analysis_records',
            patient=self.patient.id,
            module='all',
            stdout=stdout,
        )

        astrology_record = AnalysisRecord.objects.get(patient=self.patient, kind='astrology')
        biodecoding_record = AnalysisRecord.objects.get(patient=self.patient, kind='biodecoding')

        self.assertEqual(astrology_record.module_code, 'ASTRO_SESSION_REPORT')
        self.assertEqual(astrology_record.raw_input['report_id'], str(report.id))
        self.assertEqual(astrology_record.raw_input['source_id'], str(report.id))
        self.assertEqual(biodecoding_record.module_code, 'BIOEMO_MSHE_SNAPSHOT')
        self.assertEqual(biodecoding_record.raw_input['source_id'], str(session.id))
        self.assertIn('biodecoding', biodecoding_record.computed_result)

    def test_rerun_is_idempotent(self):
        self._create_astrology_history()
        self._create_bio_history()
        call_command('backfill_analysis_records', patient=self.patient.id, module='all')
        stdout = StringIO()

        call_command(
            'backfill_analysis_records',
            patient=self.patient.id,
            module='all',
            stdout=stdout,
        )

        self.assertEqual(AnalysisRecord.objects.filter(patient=self.patient, kind='astrology').count(), 1)
        self.assertEqual(AnalysisRecord.objects.filter(patient=self.patient, kind='biodecoding').count(), 1)
        output = stdout.getvalue()
        self.assertIn('[astrology] created=0 updated=0 skipped=1 errors=0', output)
        self.assertIn('[biodecoding] created=0 updated=0 skipped=1 errors=0', output)

    def test_module_without_data_creates_nothing_and_does_not_fail(self):
        stdout = StringIO()

        call_command(
            'backfill_analysis_records',
            patient=self.empty_patient.id,
            module='tarot',
            stdout=stdout,
        )

        self.assertEqual(AnalysisRecord.objects.count(), 0)
        self.assertIn('[tarot] created=0 updated=0 skipped=0 errors=0', stdout.getvalue())
