from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.test import TestCase
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient

User = get_user_model()


class PasswordResetApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='reset_user',
            email='reset@example.com',
            password='OldPass123!',
        )

    def test_request_requires_email(self):
        response = self.client.post('/api/password-reset/request/', {}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['error'], 'validation')

    def test_request_always_returns_success_message(self):
        response = self.client.post(
            '/api/password-reset/request/',
            {'email': 'missing@example.com'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)

    def test_confirm_updates_password(self):
        token = default_token_generator.make_token(self.user)
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        response = self.client.post(
            '/api/password-reset/confirm/',
            {
                'uid': uid,
                'token': token,
                'password': 'NewPass456!',
                'confirm_password': 'NewPass456!',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass456!'))

    def test_confirm_rejects_invalid_token(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        response = self.client.post(
            '/api/password-reset/confirm/',
            {
                'uid': uid,
                'token': 'invalid-token',
                'password': 'NewPass456!',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['error'], 'invalid_link')