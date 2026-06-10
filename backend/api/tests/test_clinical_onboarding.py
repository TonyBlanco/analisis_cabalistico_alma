"""
Tests del onboarding de beta tester médica (Modo Híbrido — Step 9):
- POST /api/profile/clinical-mode-request/
- POST /api/beta-feedback/

Verifica auth, rol therapist, validación de credencial/aceptación, idempotencia
de la solicitud y registro de feedback.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

REQUEST_URL = '/api/profile/clinical-mode-request/'
FEEDBACK_URL = '/api/beta-feedback/'
User = get_user_model()

VALID_PAYLOAD = {
    'license_number': 'COL-12345',
    'specialty': 'Psiquiatría',
    'professional_body': 'Colegio de Médicos',
    'responsible_use_accepted': True,
    'anti_fraud_rail_accepted': True,
    'notes': 'Beta tester médica.',
}


def _user(username, user_type='therapist'):
    user = User.objects.create_user(username, f'{username}@test.com', 'pass')
    user.profile.user_type = user_type
    user.profile.save()
    token = Token.objects.create(user=user)
    return user, token.key


def _auth(token):
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
    return client


class ClinicalModeRequestTests(TestCase):
    def test_unauthenticated_returns_401(self):
        self.assertEqual(
            APIClient().post(REQUEST_URL, VALID_PAYLOAD, format='json').status_code, 401
        )

    def test_personal_user_returns_403(self):
        _u, token = _user('cmr_personal', 'personal')
        self.assertEqual(
            _auth(token).post(REQUEST_URL, VALID_PAYLOAD, format='json').status_code, 403
        )

    def test_missing_credential_returns_400(self):
        _u, token = _user('cmr_missing')
        resp = _auth(token).post(
            REQUEST_URL,
            {'responsible_use_accepted': True, 'anti_fraud_rail_accepted': True},
            format='json',
        )
        self.assertEqual(resp.status_code, 400)

    def test_missing_acceptance_returns_400(self):
        _u, token = _user('cmr_noaccept')
        resp = _auth(token).post(
            REQUEST_URL, {'license_number': 'X', 'specialty': 'Y'}, format='json'
        )
        self.assertEqual(resp.status_code, 400)

    def test_valid_request_created(self):
        _u, token = _user('cmr_ok')
        resp = _auth(token).post(REQUEST_URL, VALID_PAYLOAD, format='json')
        self.assertEqual(resp.status_code, 201)
        body = resp.json()
        self.assertEqual(body['status'], 'requested')
        self.assertTrue(body['clinical_mode_requested'])
        self.assertIsNotNone(body['request_id'])

    def test_duplicate_request_returns_already_requested(self):
        _u, token = _user('cmr_dup')
        client = _auth(token)
        client.post(REQUEST_URL, VALID_PAYLOAD, format='json')
        resp = client.post(REQUEST_URL, VALID_PAYLOAD, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['status'], 'already_requested')


class BetaFeedbackTests(TestCase):
    def test_unauthenticated_returns_401(self):
        self.assertEqual(
            APIClient().post(FEEDBACK_URL, {'message': 'hola'}, format='json').status_code, 401
        )

    def test_valid_feedback_created(self):
        _u, token = _user('fb_ok', 'personal')
        resp = _auth(token).post(
            FEEDBACK_URL,
            {'category': 'bug', 'severity': 'high', 'message': 'Algo falla', 'page_context': '/dashboard'},
            format='json',
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['status'], 'received')
        self.assertIsNotNone(resp.json()['feedback_id'])

    def test_empty_message_returns_400(self):
        _u, token = _user('fb_empty', 'personal')
        resp = _auth(token).post(FEEDBACK_URL, {'message': '   '}, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_invalid_category_coerced(self):
        _u, token = _user('fb_cat', 'personal')
        resp = _auth(token).post(FEEDBACK_URL, {'category': 'nope', 'message': 'x'}, format='json')
        self.assertEqual(resp.status_code, 201)
