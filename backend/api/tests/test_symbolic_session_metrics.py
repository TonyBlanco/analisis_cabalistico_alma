"""
Tests para la observabilidad D6 del Modo Híbrido:
- POST /api/symbolic/session-events/
- GET  /api/therapist/hybrid-metrics/

Verifica autenticación, rol therapist, validación de event_type, resolución de
rol server-side, agregación de conteos, aislamiento entre terapeutas.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from api.models import Patient

EVENTS_URL = '/api/symbolic/session-events/'
METRICS_URL = '/api/therapist/hybrid-metrics/'
User = get_user_model()


def _make_therapist(username):
    user = User.objects.create_user(username, f'{username}@test.com', 'pass')
    user.profile.user_type = 'therapist'
    user.profile.save()
    token = Token.objects.create(user=user)
    return user, token.key


def _make_patient(therapist, index=1):
    return Patient.objects.create(
        therapist=therapist,
        first_name=f'Paciente{index}',
        last_name='Test',
        email=f'patient{index}_{therapist.username}@test.com',
        full_name=f'Paciente{index} Test',
        birth_date='1990-01-01',
    )


class SessionEventAuthTests(TestCase):
    def test_unauthenticated_returns_401(self):
        resp = APIClient().post(EVENTS_URL, {'event_type': 'session_started'}, format='json')
        self.assertEqual(resp.status_code, 401)

    def test_personal_user_returns_403(self):
        user = User.objects.create_user('personal_evt', 'pe@test.com', 'pass')
        user.profile.user_type = 'personal'
        user.profile.save()
        token = Token.objects.create(user=user).key
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        resp = client.post(EVENTS_URL, {'event_type': 'session_started'}, format='json')
        self.assertEqual(resp.status_code, 403)


class SessionEventCreateTests(TestCase):
    def setUp(self):
        self.therapist, self.token = _make_therapist('t_evt')
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')

    def test_valid_event_created(self):
        resp = self.client.post(
            EVENTS_URL,
            {'event_type': 'session_started', 'workspace': 'cabala-applied'},
            format='json',
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['event_type'], 'session_started')
        self.assertEqual(resp.json()['workspace'], 'cabala-applied')

    def test_invalid_event_type_returns_400(self):
        resp = self.client.post(EVENTS_URL, {'event_type': 'nope'}, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_role_resolved_server_side_not_from_client(self):
        # El cliente pretende rol clínico; debe ignorarse (observacional por defecto).
        resp = self.client.post(
            EVENTS_URL,
            {'event_type': 'interpretation_generated', 'role': 'clinical'},
            format='json',
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['role'], 'observational')

    def test_foreign_patient_returns_403(self):
        other, _ = _make_therapist('t_other')
        foreign_patient = _make_patient(other)
        resp = self.client.post(
            EVENTS_URL,
            {'event_type': 'session_started', 'patient_id': foreign_patient.id},
            format='json',
        )
        self.assertEqual(resp.status_code, 403)


class HybridMetricsTests(TestCase):
    def setUp(self):
        self.therapist, self.token = _make_therapist('t_metrics')
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')
        for et in ['session_started', 'session_started', 'interpretation_generated',
                   'interpretation_accepted', 'exercise_completed', 'anti_fraud_block']:
            self.client.post(EVENTS_URL, {'event_type': et}, format='json')

    def test_requires_therapist(self):
        user = User.objects.create_user('personal_m', 'pm2@test.com', 'pass')
        user.profile.user_type = 'personal'
        user.profile.save()
        token = Token.objects.create(user=user).key
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        self.assertEqual(client.get(METRICS_URL).status_code, 403)

    def test_kpi_counts(self):
        kpi = self.client.get(METRICS_URL).json()['kpi']
        self.assertEqual(kpi['sessions_started'], 2)
        self.assertEqual(kpi['interpretations_generated'], 1)
        self.assertEqual(kpi['interpretations_accepted'], 1)
        self.assertEqual(kpi['exercises_completed'], 1)
        self.assertEqual(kpi['anti_fraud_blocks'], 1)

    def test_top_level_keys(self):
        data = self.client.get(METRICS_URL).json()
        for key in ('kpi', 'kpi_this_month', 'events_by_month', 'by_workspace', 'role_breakdown'):
            self.assertIn(key, data)

    def test_isolation_between_therapists(self):
        _other, other_token = _make_therapist('t_metrics_other')
        oc = APIClient()
        oc.credentials(HTTP_AUTHORIZATION=f'Token {other_token}')
        kpi = oc.get(METRICS_URL).json()['kpi']
        self.assertEqual(kpi['sessions_started'], 0)
