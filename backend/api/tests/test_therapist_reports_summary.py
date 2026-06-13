"""
Tests for GET /api/therapist/reports/summary/
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from api.models import Patient, Session
from api.test_models import TestModule, TestResult

URL = '/api/therapist/reports/summary/'
User = get_user_model()


def _make_therapist(username: str) -> tuple:
    user = User.objects.create_user(username, f'{username}@test.com', 'pass')
    user.profile.user_type = 'therapist'
    user.profile.save()
    token = Token.objects.create(user=user)
    return user, token.key


def _make_patient(therapist, index: int = 1) -> Patient:
    return Patient.objects.create(
        therapist=therapist,
        first_name=f'Paciente{index}',
        last_name='Test',
        email=f'patient{index}_{therapist.username}@test.com',
        full_name=f'Paciente{index} Test',
        birth_date='1990-01-01',
        therapy_status='active',
    )


def _make_test_module(code: str, name: str) -> TestModule:
    return TestModule.objects.create(
        code=code,
        name=name,
        description=f'Test {name}',
        is_active=True,
        available_for_personal=False,
        available_for_therapists=True,
        test_type='wellness',
    )


class TherapistReportsAuthTests(TestCase):
    def test_unauthenticated_returns_401(self):
        self.assertEqual(APIClient().get(URL).status_code, 401)

    def test_personal_user_returns_403(self):
        user = User.objects.create_user('personal_reports', 'pm@test.com', 'pass')
        user.profile.user_type = 'personal'
        user.profile.save()
        token = Token.objects.create(user=user).key
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        self.assertEqual(client.get(URL).status_code, 403)


class TherapistReportsSummaryTests(TestCase):
    def setUp(self):
        self.therapist, self.token = _make_therapist('t_reports')
        self.other_therapist, other_token = _make_therapist('t_reports_other')
        self.patient = _make_patient(self.therapist)
        self.other_patient = Patient.objects.create(
            therapist=self.other_therapist,
            first_name='Otro',
            last_name='Consultante',
            email=f'other_{self.other_therapist.username}@test.com',
            full_name='Otro Consultante',
            birth_date='1985-05-05',
            therapy_status='active',
        )
        self.module = _make_test_module('phq9', 'PHQ-9')
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')

        TestResult.objects.create(
            user=self.therapist,
            patient=self.patient,
            test_module=self.module,
            result_data={
                'structured_data': {
                    'referral_recommended': True,
                    'severity_label': 'Moderada',
                }
            },
        )
        TestResult.objects.create(
            user=self.other_therapist,
            patient=self.other_patient,
            test_module=self.module,
            result_data={'structured_data': {'referral_recommended': True}},
        )
        Session.objects.create(
            therapist=self.therapist,
            patient=self.patient,
            session_date=timezone.now(),
            session_type='individual',
            duration_minutes=50,
        )

    def test_returns_200_with_expected_keys(self):
        resp = self.client.get(URL)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        for key in (
            'generated_at',
            'disclaimer',
            'portfolio',
            'alerts_open',
            'recent_results',
            'patients',
            'sessions',
        ):
            self.assertIn(key, data, f'Missing key: {key}')

    def test_portfolio_counts_reflect_workload(self):
        data = self.client.get(URL).json()
        total = data['portfolio']['total']
        self.assertEqual(total['patients_active'], 1)
        self.assertEqual(total['tests_completed'], 1)

    def test_recent_results_include_alert(self):
        data = self.client.get(URL).json()
        self.assertEqual(len(data['recent_results']), 1)
        row = data['recent_results'][0]
        self.assertTrue(row['referral_recommended'])
        self.assertTrue(row['alert'])
        self.assertEqual(row['patient_display_name'], self.patient.full_name)
        self.assertIn('/dashboard/therapist/tests/results/', row['href'])

    def test_isolation_between_therapists(self):
        other_client = APIClient()
        other_token = Token.objects.get(user=self.other_therapist).key
        other_client.credentials(HTTP_AUTHORIZATION=f'Token {other_token}')
        data = other_client.get(URL).json()
        self.assertEqual(len(data['recent_results']), 1)
        self.assertEqual(data['recent_results'][0]['patient_display_name'], 'Otro Consultante')
        self.assertNotIn(self.patient.full_name, [r['patient_display_name'] for r in data['recent_results']])

    def test_sessions_block_present(self):
        data = self.client.get(URL).json()
        self.assertEqual(data['sessions']['total'], 1)
        self.assertEqual(len(data['sessions']['recent']), 1)