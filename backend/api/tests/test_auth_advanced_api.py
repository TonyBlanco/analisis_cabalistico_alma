from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient

from api.models_auth_advanced import AuthOneTimeCode
from api.services.auth_advanced import _generate_otp_code, _hash_secret

User = get_user_model()


class AuthAdvancedApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='advanced_user',
            email='advanced@example.com',
            password='OldPass123!',
        )

    def test_magic_link_request_requires_email(self):
        response = self.client.post('/api/auth/magic-link/request/', {}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_magic_link_request_generic_success(self):
        response = self.client.post(
            '/api/auth/magic-link/request/',
            {'email': 'missing@example.com'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)

    def test_otp_login_flow(self):
        code = _generate_otp_code()
        AuthOneTimeCode.objects.create(
            user=self.user,
            purpose=AuthOneTimeCode.PURPOSE_LOGIN_OTP,
            code_hash=_hash_secret(code),
            expires_at=timezone.now() + timedelta(minutes=10),
        )
        response = self.client.post(
            '/api/auth/otp/verify-login/',
            {'email': self.user.email, 'code': code},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.data)

    def test_otp_password_reset_flow(self):
        code = _generate_otp_code()
        AuthOneTimeCode.objects.create(
            user=self.user,
            purpose=AuthOneTimeCode.PURPOSE_PASSWORD_RESET,
            code_hash=_hash_secret(code),
            expires_at=timezone.now() + timedelta(minutes=10),
        )
        response = self.client.post(
            '/api/auth/otp/verify-password-reset/',
            {
                'email': self.user.email,
                'code': code,
                'password': 'NewPass456!',
                'confirm_password': 'NewPass456!',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass456!'))