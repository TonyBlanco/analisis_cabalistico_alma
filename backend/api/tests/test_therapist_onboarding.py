"""
Tests for GET /api/therapist/onboarding/
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from api.models import AnalysisRecord, Patient

URL = '/api/therapist/onboarding/'
User = get_user_model()


def _make_therapist(username: str) -> tuple:
    user = User.objects.create_user(username, f'{username}@test.com', 'pass')
    profile = user.profile
    profile.user_type = 'therapist'
    profile.full_name = 'Ana Terapeuta'
    profile.legal_full_name = 'Ana Terapeuta'
    profile.profession = 'Acompañamiento simbólico'
    profile.phone = '+34600000000'
    profile.save()
    token = Token.objects.create(user=user)
    return user, token.key


def _make_patient(therapist, index: int = 1) -> Patient:
    return Patient.objects.create(
        therapist=therapist,
        first_name=f'Consultante{index}',
        last_name='Test',
        email=f'patient{index}_{therapist.username}@test.com',
        full_name=f'Consultante{index} Test',
        birth_date='1990-01-01',
    )


class TherapistOnboardingAuthTests(TestCase):
    def test_unauthenticated_returns_401(self):
        resp = APIClient().get(URL)
        self.assertEqual(resp.status_code, 401)

    def test_personal_user_returns_403(self):
        user = User.objects.create_user('personal_onb', 'pm@test.com', 'pass')
        user.profile.user_type = 'personal'
        user.profile.save()
        token = Token.objects.create(user=user).key

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        resp = client.get(URL)
        self.assertEqual(resp.status_code, 403)


class TherapistOnboardingShapeTests(TestCase):
    def setUp(self):
        self.therapist, self.token = _make_therapist('t_onb_shape')
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')

    def test_response_shape(self):
        resp = self.client.get(URL)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn('steps', data)
        self.assertIn('all_backend_complete', data)
        steps = data['steps']
        self.assertEqual(
            set(steps.keys()),
            {'profile_complete', 'has_patient', 'has_tree_analysis'},
        )
        for value in steps.values():
            self.assertIsInstance(value, bool)


class TherapistOnboardingProgressTests(TestCase):
    def setUp(self):
        self.therapist, self.token = _make_therapist('t_onb_prog')
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')

    def test_profile_incomplete_without_profession(self):
        profile = self.therapist.profile
        profile.profession = ''
        profile.save(update_fields=['profession'])

        resp = self.client.get(URL)
        self.assertFalse(resp.json()['steps']['profile_complete'])

    def test_has_patient_when_active_exists(self):
        _make_patient(self.therapist)
        resp = self.client.get(URL)
        self.assertTrue(resp.json()['steps']['has_patient'])

    def test_has_tree_analysis_with_cabala_aplicada_record(self):
        patient = _make_patient(self.therapist)
        AnalysisRecord.objects.create(
            kind='kabbalah',
            module_code='CABALA_APLICADA_arbol-vida',
            role_context='therapist',
            birth_data_snapshot={'legal_name': patient.full_name},
            algorithm_snapshot={'engine': 'test'},
            created_by_user=self.therapist,
            therapist=self.therapist,
            patient=patient,
        )

        resp = self.client.get(URL)
        self.assertTrue(resp.json()['steps']['has_tree_analysis'])

    def test_all_backend_complete_when_every_step_done(self):
        patient = _make_patient(self.therapist)
        AnalysisRecord.objects.create(
            kind='kabbalah',
            module_code='CABALA_APLICADA_gematria',
            role_context='therapist',
            birth_data_snapshot={'legal_name': patient.full_name},
            algorithm_snapshot={'engine': 'test'},
            created_by_user=self.therapist,
            therapist=self.therapist,
            patient=patient,
        )

        resp = self.client.get(URL)
        data = resp.json()
        self.assertTrue(data['all_backend_complete'])
        self.assertTrue(all(data['steps'].values()))