"""Tests para POST /api/bioemotional/mshe-import/ (integración BioEmotional → MSHE)."""
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient

from api.bioemotional.serializers import (
    BioEmotionalSessionListSerializer,
    BioEmotionalSessionSerializer,
)
from api.models import AnalysisRecord, Patient
from api.bioemotional.models import BioEmotionalObservation, BioEmotionalSession

MSHE_IMPORT_URL = '/api/bioemotional/mshe-import/'
BIOEMOTIONAL_SESSIONS_URL = '/api/bioemotional/sessions/'


class MSHEImportBioEmotionalTestCase(APITestCase):
    def setUp(self):
        self.therapist = User.objects.create_user(username='therapist_mshe', password='pass')
        self.therapist.profile.user_type = 'therapist'
        self.therapist.profile.full_name = 'Therapist MSHE'
        self.therapist.profile.save()

        self.patient_user = User.objects.create_user(username='patient_mshe', password='pass')
        self.patient_user.profile.user_type = 'patient'
        self.patient_user.profile.save()

        self.patient = Patient.objects.create(
            therapist=self.therapist,
            user=self.patient_user,
            first_name='Pat',
            last_name='MSHE',
            email='pmshe@example.com',
            full_name='Pat MSHE',
            birth_date='1990-01-01',
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.therapist)

    def _create_closed_session(self):
        session = BioEmotionalSession.objects.create(
            patient=self.patient,
            therapist=self.therapist,
            emotional_state='better',
            is_closed=True,
            closed_at=timezone.now(),
        )
        return session

    def test_import_requires_patient_id(self):
        resp = self.client.post(MSHE_IMPORT_URL, {}, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_import_without_closed_sessions_returns_400(self):
        resp = self.client.post(MSHE_IMPORT_URL, {'patient_id': self.patient.id}, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_export_for_swm_returns_200(self):
        """Regresión: AttributeError por patient.nombre causaba Error 500."""
        session = self._create_closed_session()
        session.heatmap_data = {'chest_center': 7}
        session.save()
        BioEmotionalObservation.objects.create(
            therapist=self.therapist,
            patient=self.patient,
            region_id='chest_center',
            note_text='Tensión torácica',
        )
        resp = self.client.get(f'/api/bioemotional/export/{self.patient.id}/')
        self.assertEqual(resp.status_code, 200, getattr(resp, 'data', resp.content))
        self.assertEqual(resp.data['patient_id'], self.patient.id)
        self.assertEqual(resp.data['patient_name'], 'Pat MSHE')
        self.assertEqual(resp.data['total_sessions'], 1)

    def test_session_serializer_uses_patient_full_name(self):
        session = self._create_closed_session()

        data = BioEmotionalSessionSerializer(instance=session).data

        self.assertEqual(data['patient_name'], self.patient.full_name)

    def test_session_list_serializer_uses_patient_full_name(self):
        session = self._create_closed_session()

        data = BioEmotionalSessionListSerializer(instance=session).data

        self.assertEqual(data['patient_name'], self.patient.full_name)

    def test_sessions_list_endpoint_returns_patient_full_name(self):
        session = self._create_closed_session()

        resp = self.client.get(f'{BIOEMOTIONAL_SESSIONS_URL}?patient_id={self.patient.id}')

        self.assertEqual(resp.status_code, 200, getattr(resp, 'data', resp.content))
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]['id'], str(session.id))
        self.assertEqual(resp.data[0]['patient_name'], self.patient.full_name)

    def test_import_with_closed_session_succeeds(self):
        session = self._create_closed_session()
        BioEmotionalObservation.objects.create(
            therapist=self.therapist,
            patient=self.patient,
            region_id='chest_center',
            note_text='Tensión torácica',
        )
        resp = self.client.post(MSHE_IMPORT_URL, {'patient_id': self.patient.id}, format='json')
        self.assertEqual(resp.status_code, 200, getattr(resp, 'data', resp.content))
        self.assertTrue(resp.data['integrated'])
        self.assertEqual(resp.data['bioemotional_snapshot_id'], str(session.id))

    def test_import_persists_biodecoding_analysis_record(self):
        """El import debe crear el AnalysisRecord normalizado que lee el MSHE."""
        session = self._create_closed_session()
        session.heatmap_data = {'chest_center': 8, 'spine': 6}
        session.save()
        BioEmotionalObservation.objects.create(
            therapist=self.therapist,
            patient=self.patient,
            region_id='chest_center',
            note_text='Opresión en el pecho',
        )

        resp = self.client.post(MSHE_IMPORT_URL, {'patient_id': self.patient.id}, format='json')
        self.assertEqual(resp.status_code, 200, getattr(resp, 'data', resp.content))

        record = AnalysisRecord.objects.filter(
            patient=self.patient, kind='biodecoding'
        ).order_by('-created_at').first()
        self.assertIsNotNone(record)
        self.assertEqual(record.module_code, 'BIOEMO_MSHE_SNAPSHOT')
        self.assertEqual(record.therapist, self.therapist)

        biodecoding = record.computed_result['biodecoding']
        # chest_center → emotional_blockages: 8*10 + 1 obs*5 = 85
        self.assertEqual(biodecoding['emotional_blockages'], 85.0)
        # spine → generational_patterns: 6*10 = 60 (sin observaciones)
        self.assertEqual(biodecoding['generational_patterns'], 60.0)
        # Sin datos en piernas/abdomen bajo → 0
        self.assertEqual(biodecoding['life_transitions'], 0.0)

    def test_synthesis_engine_reads_biodecoding_record(self):
        """Cross real: el record biodecoding entra en la síntesis MSHE."""
        from api.holistic_synthesis_engine import HolisticSynthesisEngine

        session = self._create_closed_session()
        session.heatmap_data = {'chest_center': 8}
        session.save()
        self.client.post(MSHE_IMPORT_URL, {'patient_id': self.patient.id}, format='json')

        engine = HolisticSynthesisEngine(self.patient, self.therapist)
        synthesis = engine.compute_synthesis()

        self.assertEqual(synthesis['metadata']['total_records'], 1)
        contributions = synthesis['axis_contributions']['emotion_regulation']
        self.assertTrue(
            any(c['source'] == 'biodecoding' for c in contributions),
            'biodecoding no aparece como fuente del eje emotion_regulation',
        )
        self.assertGreater(synthesis['scores']['emotion_regulation'], 0)
