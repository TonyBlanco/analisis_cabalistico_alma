"""Tests for phone/telegram/send_via on patient creation."""
from unittest.mock import patch

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from api.models import Patient, UserProfile
from api.notifications.dispatch import PatientAccessNotificationResult


class CreatePatientChannelsTests(APITestCase):
    def setUp(self):
        self.therapist = User.objects.create_user('therapist_channels', 'therapist@channels.test', 'pass')
        profile = UserProfile.objects.get(user=self.therapist)
        profile.user_type = 'therapist'
        profile.full_name = 'Terapeuta Canales'
        profile.save()
        self.token = Token.objects.create(user=self.therapist).key
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')

    @patch('api.views.notify_patient_account_access')
    def test_create_patient_with_phone_telegram_and_send_via(self, mock_notify):
        mock_notify.return_value = PatientAccessNotificationResult(
            welcome_url='https://studios33.app/welcome/patient?token=test',
            telegram_link='https://t.me/Studios33Bot?start=pabc',
            email_sent=True,
            telegram_sent=False,
            whatsapp_sent=False,
        )
        response = self.client.post(
            '/api/therapist/patients/create/',
            {
                'first_name': 'Ana',
                'last_name': 'López',
                'email': 'ana.lopez@example.com',
                'birth_date': '1992-06-15',
                'phone': '+34 600 000 000',
                'telegram': '@analopez',
                'send_via': ['email', 'telegram'],
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data.get('email_sent'))
        self.assertIn('telegram_link', response.data)

        patient = Patient.objects.get(email='ana.lopez@example.com')
        self.assertEqual(patient.phone, '+34 600 000 000')
        self.assertEqual(patient.telegram, 'analopez')
        self.assertEqual(patient.send_credentials_via, ['email', 'telegram'])
        mock_notify.assert_called_once()

    def test_telegram_required_when_channel_selected(self):
        response = self.client.post(
            '/api/therapist/patients/create/',
            {
                'first_name': 'Sin',
                'last_name': 'Telegram',
                'email': 'sin.telegram@example.com',
                'birth_date': '1990-01-01',
                'send_via': ['telegram'],
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('telegram', response.data)

    def test_invalid_phone_rejected(self):
        response = self.client.post(
            '/api/therapist/patients/create/',
            {
                'first_name': 'Mal',
                'last_name': 'Teléfono',
                'email': 'mal.telefono@example.com',
                'birth_date': '1990-01-01',
                'phone': 'abc',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('phone', response.data)

    def test_invalid_send_via_channel_rejected(self):
        response = self.client.post(
            '/api/therapist/patients/create/',
            {
                'first_name': 'Canal',
                'last_name': 'Inválido',
                'email': 'canal.invalido@example.com',
                'birth_date': '1990-01-01',
                'send_via': ['whatsapp'],
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('send_via', response.data)