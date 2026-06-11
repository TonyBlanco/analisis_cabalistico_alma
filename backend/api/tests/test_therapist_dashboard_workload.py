"""
Tests for GET /api/therapist/dashboard/ workload block.

Verifica: autenticación requerida, rol therapist requerido,
shape del payload workload, conteos de tests, aislamiento entre terapeutas,
y ausencia de PII/PHI en workload.
"""
import json

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from api.models import Patient, Session
from api.test_models import TestModule, TestResult, UserTestAccess

URL = '/api/therapist/dashboard/'
User = get_user_model()


def _make_therapist(username: str) -> tuple:
    user = User.objects.create_user(username, f'{username}@test.com', 'pass')
    user.profile.user_type = 'therapist'
    user.profile.save()
    token = Token.objects.create(user=user)
    return user, token.key


def _make_patient_user(username: str) -> User:
    user = User.objects.create_user(username, f'{username}@test.com', 'pass')
    user.profile.user_type = 'patient'
    user.profile.save()
    return user


def _make_patient(therapist, index: int = 1, *, with_login: bool = False) -> Patient:
    user = _make_patient_user(f'patient_u{index}_{therapist.username}') if with_login else None
    return Patient.objects.create(
        therapist=therapist,
        user=user,
        first_name=f'Paciente{index}',
        last_name='Test',
        email=f'patient{index}_{therapist.username}@test.com',
        phone=f'+3460000{index:04d}',
        full_name=f'Paciente{index} Test',
        birth_date='1990-01-01',
        main_complaint='Ansiedad severa confidencial',
        clinical_history='Historial clínico privado',
        notes='Notas privadas del terapeuta',
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


class TherapistDashboardWorkloadAuthTests(TestCase):
    def test_unauthenticated_returns_401(self):
        resp = APIClient().get(URL)
        self.assertEqual(resp.status_code, 401)

    def test_personal_user_returns_403(self):
        user = User.objects.create_user('personal_dash', 'pm@test.com', 'pass')
        user.profile.user_type = 'personal'
        user.profile.save()
        token = Token.objects.create(user=user).key

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        resp = client.get(URL)
        self.assertEqual(resp.status_code, 403)


class TherapistDashboardWorkloadShapeTests(TestCase):
    def setUp(self):
        self.therapist, self.token = _make_therapist('t_dash_shape')
        self.patient = _make_patient(self.therapist, with_login=True)
        Session.objects.create(
            therapist=self.therapist,
            patient=self.patient,
            session_date=timezone.now(),
        )
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')

    def test_returns_200(self):
        self.assertEqual(self.client.get(URL).status_code, 200)

    def test_legacy_keys_preserved(self):
        data = self.client.get(URL).json()
        for key in (
            'total_patients',
            'sessions_this_month',
            'fichas_this_month',
            'recent_sessions',
            'subscription_status',
            'subscription_end_date',
            'workload',
        ):
            self.assertIn(key, data, f'Missing top-level key: {key}')

    def test_workload_keys(self):
        workload = self.client.get(URL).json()['workload']
        for key in ('summary', 'patients', 'action_items'):
            self.assertIn(key, workload, f'Missing workload key: {key}')

    def test_workload_summary_keys(self):
        summary = self.client.get(URL).json()['workload']['summary']
        for key in (
            'patients_active',
            'tests_assigned_total',
            'tests_pending_total',
            'tests_completed_total',
            'action_items_total',
        ):
            self.assertIn(key, summary, f'Missing summary key: {key}')

    def test_patient_entry_keys(self):
        patients = self.client.get(URL).json()['workload']['patients']
        self.assertEqual(len(patients), 1)
        patient = patients[0]
        for key in (
            'id',
            'display_name',
            'therapy_status',
            'therapy_level',
            'has_login',
            'profile_complete',
            'last_session_at',
            'sessions_count',
            'tests',
            'tests_recent',
            'progress',
            'action_items',
        ):
            self.assertIn(key, patient, f'Missing patient key: {key}')

        for key in ('assigned', 'pending', 'completed'):
            self.assertIn(key, patient['tests'], f'Missing tests key: {key}')

        for key in ('stage', 'sessions_count', 'last_activity_at'):
            self.assertIn(key, patient['progress'], f'Missing progress key: {key}')


class TherapistDashboardWorkloadTestCountTests(TestCase):
    def setUp(self):
        self.therapist, self.token = _make_therapist('t_dash_counts')
        self.patient = _make_patient(self.therapist, with_login=True)

        self.phq9 = _make_test_module('phq9', 'PHQ-9')
        self.gad7 = _make_test_module('gad7', 'GAD-7')

        UserTestAccess.objects.create(
            user=self.patient.user,
            test_module=self.phq9,
            has_special_access=True,
        )
        UserTestAccess.objects.create(
            user=self.patient.user,
            test_module=self.gad7,
            has_special_access=True,
        )
        TestResult.objects.create(
            user=self.patient.user,
            test_module=self.gad7,
            patient=self.patient,
            client_name=self.patient.full_name,
            client_birth_date=self.patient.birth_date,
            score=8,
            result_data={'total': 8},
        )

        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')

    def test_patient_test_counts(self):
        patients = self.client.get(URL).json()['workload']['patients']
        self.assertEqual(len(patients), 1)
        tests = patients[0]['tests']
        self.assertEqual(tests['assigned'], 2)
        self.assertEqual(tests['pending'], 1)
        self.assertEqual(tests['completed'], 1)

    def test_summary_test_counts(self):
        summary = self.client.get(URL).json()['workload']['summary']
        self.assertEqual(summary['tests_assigned_total'], 2)
        self.assertEqual(summary['tests_pending_total'], 1)
        self.assertEqual(summary['tests_completed_total'], 1)

    def test_tests_recent_statuses(self):
        patients = self.client.get(URL).json()['workload']['patients']
        statuses = {item['test_code']: item['status'] for item in patients[0]['tests_recent']}
        self.assertEqual(statuses['phq9'], 'pending')
        self.assertEqual(statuses['gad7'], 'completed')

    def test_completed_generates_global_action_item(self):
        action_items = self.client.get(URL).json()['workload']['action_items']
        completed_items = [item for item in action_items if item['type'] == 'completed_unreviewed']
        self.assertEqual(len(completed_items), 1)
        self.assertEqual(completed_items[0]['test_code'], 'gad7')
        self.assertEqual(completed_items[0]['patient_id'], self.patient.id)


class TherapistDashboardWorkloadIsolationTest(TestCase):
    def setUp(self):
        self.t1, self.tok1 = _make_therapist('t_iso_dash1')
        self.t2, self.tok2 = _make_therapist('t_iso_dash2')

        self.p1 = _make_patient(self.t1, 1, with_login=True)
        self.p2 = _make_patient(self.t2, 1, with_login=True)

        self.tm1 = _make_test_module('iso-phq9', 'ISO PHQ-9')
        self.tm2 = _make_test_module('iso-gad7', 'ISO GAD-7')

        UserTestAccess.objects.create(
            user=self.p1.user,
            test_module=self.tm1,
            has_special_access=True,
        )
        UserTestAccess.objects.create(
            user=self.p2.user,
            test_module=self.tm2,
            has_special_access=True,
        )

    def test_only_own_patients_in_workload(self):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Token {self.tok1}')
        data = client.get(URL).json()

        self.assertEqual(data['total_patients'], 1)
        self.assertEqual(len(data['workload']['patients']), 1)
        self.assertEqual(data['workload']['patients'][0]['id'], self.p1.id)
        self.assertEqual(data['workload']['summary']['tests_assigned_total'], 1)

    def test_other_therapist_tests_not_visible(self):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Token {self.tok1}')
        workload = client.get(URL).json()['workload']
        patient_ids = {patient['id'] for patient in workload['patients']}
        test_codes = {
            item['test_code']
            for patient in workload['patients']
            for item in patient['tests_recent']
        }
        self.assertNotIn(self.p2.id, patient_ids)
        self.assertNotIn('iso-gad7', test_codes)
        self.assertIn(self.p1.id, patient_ids)
        self.assertIn('iso-phq9', test_codes)


class TherapistDashboardWorkloadNoPIITest(TestCase):
    FORBIDDEN_KEYS = {
        'email',
        'phone',
        'main_complaint',
        'clinical_history',
        'notes',
        'private_notes',
        'score',
        'result_data',
        'input_data',
        'clinical_diagnosis',
    }

    def setUp(self):
        self.therapist, self.token = _make_therapist('t_dash_nopii')
        self.patient = _make_patient(self.therapist, with_login=True)
        tm = _make_test_module('nopii-test', 'NoPII Test')
        UserTestAccess.objects.create(
            user=self.patient.user,
            test_module=tm,
            has_special_access=True,
        )
        TestResult.objects.create(
            user=self.patient.user,
            test_module=tm,
            patient=self.patient,
            client_name=self.patient.full_name,
            client_birth_date=self.patient.birth_date,
            score=15,
            result_data={'total': 15, 'answers': [1, 2, 3]},
            notes='Notas del resultado confidenciales',
        )

    def _walk_keys(self, obj, prefix=''):
        if isinstance(obj, dict):
            for key, value in obj.items():
                yield key
                yield from self._walk_keys(value, f'{prefix}.{key}')
        elif isinstance(obj, list):
            for item in obj:
                yield from self._walk_keys(item, prefix)

    def test_workload_has_no_forbidden_keys(self):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')
        workload = client.get(URL).json()['workload']
        found_keys = set(self._walk_keys(workload))
        leaked = found_keys & self.FORBIDDEN_KEYS
        self.assertEqual(leaked, set(), f'Forbidden keys in workload: {leaked}')

    def test_workload_body_has_no_pii_strings(self):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')
        workload_json = json.dumps(client.get(URL).json()['workload'])

        self.assertNotIn(self.patient.email, workload_json)
        self.assertNotIn(self.patient.phone, workload_json)
        self.assertNotIn('Ansiedad severa confidencial', workload_json)
        self.assertNotIn('Historial clínico privado', workload_json)
        self.assertNotIn('Notas privadas del terapeuta', workload_json)
        self.assertNotIn('Notas del resultado confidenciales', workload_json)