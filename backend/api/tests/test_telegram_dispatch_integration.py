"""Integration smoke: dispatch genera telegram_link sin mocks del orquestador."""
from datetime import date
from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import override_settings
from rest_framework.test import APITestCase

from api.models import Patient, TelegramLinkToken, UserProfile
from api.notifications.dispatch import notify_patient_account_access


@override_settings(
    TELEGRAM_ENABLED=True,
    TELEGRAM_BOT_TOKEN='integration-test-token',
    TELEGRAM_BOT_USERNAME='Studios33Bot',
    WHATSAPP_ENABLED=False,
)
class TelegramDispatchIntegrationTests(APITestCase):
    @patch('api.notifications.dispatch.send_patient_account_credentials_email', return_value=True)
    def test_notify_generates_deep_link_and_email(self, _mock_email):
        therapist = User.objects.create_user('therapist_int', 'therapist@int.test', 'pass')
        tp = UserProfile.objects.get(user=therapist)
        tp.user_type = 'therapist'
        tp.full_name = 'Terapeuta Int'
        tp.save()

        user = User.objects.create_user('patient_int', 'patient@int.test', 'pass')
        pp = UserProfile.objects.get(user=user)
        pp.user_type = 'patient'
        pp.save()

        patient = Patient.objects.create(
            therapist=therapist,
            user=user,
            first_name='Int',
            last_name='Test',
            full_name='Int Test',
            email='patient@int.test',
            birth_date=date(1990, 5, 5),
            telegram='intuser',
            send_credentials_via=['email', 'telegram'],
        )

        result = notify_patient_account_access(
            patient_id=patient.id,
            user_id=user.id,
            patient_email=patient.email,
            patient_phone='',
            patient_first_name=patient.first_name,
            username=user.username,
            temp_password='Alma2026!',
            therapist_name='Terapeuta Int',
            send_via=['email', 'telegram'],
        )

        self.assertTrue(result.email_sent)
        self.assertTrue(result.telegram_link.startswith('https://t.me/Studios33Bot?start=p'))
        self.assertFalse(result.telegram_sent)
        self.assertTrue(TelegramLinkToken.objects.filter(patient_id=patient.id).exists())