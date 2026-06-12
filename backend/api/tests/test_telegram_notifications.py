"""Tests for Telegram webhook, deep links and resend rate limit."""
from datetime import date
from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import override_settings
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from api.models import Patient, TelegramLinkToken, UserProfile
from api.notifications.dispatch import PatientAccessNotificationResult


@override_settings(
    TELEGRAM_ENABLED=True,
    TELEGRAM_BOT_TOKEN='test-token',
    TELEGRAM_BOT_USERNAME='Studios33Bot',
    TELEGRAM_WEBHOOK_SECRET='test-secret',
)
class TelegramNotificationsTests(APITestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()

        self.therapist = User.objects.create_user('therapist_tg', 'therapist@tg.test', 'pass')
        tp = UserProfile.objects.get(user=self.therapist)
        tp.user_type = 'therapist'
        tp.full_name = 'Terapeuta TG'
        tp.save()
        self.token = Token.objects.create(user=self.therapist).key
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')

    @patch('api.views.notify_patient_account_access')
    def test_create_patient_returns_telegram_link(self, mock_notify):
        mock_notify.return_value = PatientAccessNotificationResult(
            welcome_url='https://studios33.app/welcome/patient?token=test',
            telegram_link='https://t.me/Studios33Bot?start=pabc123',
            email_sent=True,
            telegram_sent=False,
            whatsapp_sent=False,
        )
        response = self.client.post(
            '/api/therapist/patients/create/',
            {
                'first_name': 'Tg',
                'last_name': 'User',
                'email': 'tg.user@example.com',
                'birth_date': '1991-01-01',
                'telegram': 'tguser',
                'send_via': ['email', 'telegram'],
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data.get('email_sent'))
        self.assertIn('telegram_link', response.data)
        self.assertTrue(response.data['telegram_link'].startswith('https://t.me/'))
        mock_notify.assert_called_once()
        self.assertEqual(mock_notify.call_args.kwargs['send_via'], ['email', 'telegram'])

    def test_webhook_rejects_missing_header(self):
        response = self.client.post(
            '/api/telegram/webhook/',
            {'message': {'chat': {'id': 1}, 'text': '/start'}},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @override_settings(TELEGRAM_WEBHOOK_SECRET='')
    def test_webhook_rejects_when_secret_not_configured(self):
        response = self.client.post(
            '/api/telegram/webhook/',
            {'message': {'chat': {'id': 1}, 'text': '/start'}},
            format='json',
            HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN='anything',
        )
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @patch('api.telegram_views.send_patient_account_telegram', return_value=True)
    def test_webhook_links_chat_on_start(self, mock_send):
        user = User.objects.create_user('patient_tg', 'patient@tg.test', 'pass')
        profile = UserProfile.objects.get(user=user)
        profile.user_type = 'patient'
        profile.save()

        patient = Patient.objects.create(
            therapist=self.therapist,
            user=user,
            first_name='Pat',
            last_name='Tg',
            full_name='Pat Tg',
            email='patient@tg.test',
            birth_date=date(1990, 1, 1),
        )

        from django.utils import timezone
        from datetime import timedelta

        link = TelegramLinkToken.objects.create(
            code='abc12345',
            purpose='patient_welcome',
            user_id=user.id,
            patient_id=patient.id,
            context={'username': user.username, 'temp_password': 'Alma2026!'},
            expires_at=timezone.now() + timedelta(days=1),
        )

        response = self.client.post(
            '/api/telegram/webhook/',
            {'message': {'chat': {'id': 999888777}, 'text': '/start pabc12345'}},
            format='json',
            HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN='test-secret',
        )
        self.assertEqual(response.status_code, 200)
        profile.refresh_from_db()
        self.assertEqual(profile.telegram_chat_id, 999888777)
        link.refresh_from_db()
        self.assertIsNotNone(link.consumed_at)
        self.assertTrue(mock_send.called)

    @patch('api.views.notify_patient_account_access')
    def test_resend_credentials_rate_limited(self, mock_notify):
        mock_notify.return_value = PatientAccessNotificationResult(
            welcome_url='https://studios33.app/welcome/patient?token=test',
            telegram_link='https://t.me/Studios33Bot?start=pabc',
            email_sent=True,
            telegram_sent=False,
            whatsapp_sent=False,
        )
        user = User.objects.create_user('resend_pat', 'resend@example.com', 'pass')
        profile = UserProfile.objects.get(user=user)
        profile.user_type = 'patient'
        profile.save()
        patient = Patient.objects.create(
            therapist=self.therapist,
            user=user,
            first_name='Re',
            last_name='Send',
            full_name='Re Send',
            email='resend@example.com',
            birth_date=date(1990, 1, 1),
            send_credentials_via=['email'],
        )

        first = self.client.post(f'/api/therapist/patients/{patient.id}/resend-credentials/')
        self.assertEqual(first.status_code, status.HTTP_200_OK)

        second = self.client.post(f'/api/therapist/patients/{patient.id}/resend-credentials/')
        self.assertEqual(second.status_code, status.HTTP_429_TOO_MANY_REQUESTS)