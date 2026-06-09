"""
Tests for GET /api/therapist/metrics/

Verifica: autenticación requerida, rol therapist requerido,
shape del payload, conteos correctos, aislamiento entre terapeutas,
y ausencia de PII en la respuesta.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from api.models import Patient, Session

URL = '/api/therapist/metrics/'
User = get_user_model()


def _make_therapist(username: str) -> tuple:
    """Helper: crea un usuario therapist y devuelve (user, token_key)."""
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
    )


class TherapistMetricsAuthTests(TestCase):
    def test_unauthenticated_returns_401(self):
        resp = APIClient().get(URL)
        self.assertEqual(resp.status_code, 401)

    def test_personal_user_returns_403(self):
        user = User.objects.create_user('personal_met', 'pm@test.com', 'pass')
        user.profile.user_type = 'personal'
        user.profile.save()
        token = Token.objects.create(user=user).key

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        resp = client.get(URL)
        self.assertEqual(resp.status_code, 403)


class TherapistMetricsShapeTests(TestCase):
    def setUp(self):
        self.therapist, self.token = _make_therapist('t_shape')
        self.patient = _make_patient(self.therapist)
        Session.objects.create(
            therapist=self.therapist,
            patient=self.patient,
            session_date=timezone.now(),
        )
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')

    def test_returns_200(self):
        self.assertEqual(self.client.get(URL).status_code, 200)

    def test_top_level_keys(self):
        data = self.client.get(URL).json()
        for key in ('kpi', 'sessions_by_month', 'fichas_by_month',
                    'therapy_status_breakdown', 'consent_breakdown'):
            self.assertIn(key, data, f'Missing top-level key: {key}')

    def test_kpi_keys(self):
        kpi = self.client.get(URL).json()['kpi']
        for key in ('total_patients', 'active_patients_30d',
                    'sessions_this_month', 'fichas_this_month', 'new_patients_30d'):
            self.assertIn(key, kpi, f'Missing KPI key: {key}')

    def test_series_entry_format(self):
        data = self.client.get(URL).json()
        for series_key in ('sessions_by_month', 'fichas_by_month'):
            for entry in data[series_key]:
                self.assertIn('month', entry)
                self.assertIn('count', entry)
                # Must be YYYY-MM
                self.assertRegex(entry['month'], r'^\d{4}-\d{2}$')

    def test_consent_breakdown_keys(self):
        cb = self.client.get(URL).json()['consent_breakdown']
        self.assertIn('with_consent', cb)
        self.assertIn('without_consent', cb)


class TherapistMetricsCountTests(TestCase):
    def setUp(self):
        self.therapist, self.token = _make_therapist('t_counts')
        self.p1 = _make_patient(self.therapist, 1)
        self.p2 = _make_patient(self.therapist, 2)
        Session.objects.create(
            therapist=self.therapist, patient=self.p1, session_date=timezone.now()
        )
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')

    def test_total_patients(self):
        self.assertEqual(self.client.get(URL).json()['kpi']['total_patients'], 2)

    def test_sessions_this_month(self):
        self.assertEqual(self.client.get(URL).json()['kpi']['sessions_this_month'], 1)

    def test_active_patients_30d(self):
        # p1 has a session today → 1 active patient in last 30 days
        self.assertEqual(self.client.get(URL).json()['kpi']['active_patients_30d'], 1)


class TherapistMetricsIsolationTest(TestCase):
    """A therapist must not see another therapist's data."""

    def setUp(self):
        self.t1, self.tok1 = _make_therapist('t_iso1')
        self.t2, self.tok2 = _make_therapist('t_iso2')

        _make_patient(self.t1, 1)
        _make_patient(self.t1, 2)
        _make_patient(self.t2, 1)  # belongs to t2 — must not appear in t1's count

    def test_only_own_patients_counted(self):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Token {self.tok1}')
        self.assertEqual(client.get(URL).json()['kpi']['total_patients'], 2)


class TherapistMetricsNoPIITest(TestCase):
    """Response body must not contain any patient PII."""

    def setUp(self):
        self.therapist, self.token = _make_therapist('t_nopii')
        self.patient = _make_patient(self.therapist)

    def test_no_patient_name_in_response(self):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')
        body = client.get(URL).content.decode()
        self.assertNotIn('Paciente1', body)
        self.assertNotIn(self.patient.email, body)
        self.assertNotIn(self.patient.first_name, body)
        self.assertNotIn(self.patient.last_name, body)
