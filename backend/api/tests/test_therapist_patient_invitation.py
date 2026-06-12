"""Tests for therapist ↔ personal user patient linking invitations."""
from datetime import date
from unittest.mock import patch

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from api.models import Patient, TherapistPatientInvitation, UserProfile


class TherapistPatientInvitationTests(APITestCase):
    def setUp(self):
        self.therapist = User.objects.create_user('therapist1', 'therapist@test.com', 'pass')
        tp = UserProfile.objects.get(user=self.therapist)
        tp.user_type = 'therapist'
        tp.full_name = 'Terapeuta Uno'
        tp.save()

        self.personal = User.objects.create_user('personal1', 'personal@gmail.com', 'pass')
        pp = UserProfile.objects.get(user=self.personal)
        pp.user_type = 'personal'
        pp.full_name = 'Usuario Personal'
        pp.google_id = 'google-sub-123'
        pp.birth_date = date(1990, 5, 15)
        pp.save()

        self.therapist_token = Token.objects.create(user=self.therapist).key
        self.personal_token = Token.objects.create(user=self.personal).key

    def _auth(self, token: str):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')

    def test_lookup_finds_personal_user(self):
        self._auth(self.therapist_token)
        response = self.client.post(
            '/api/therapist/patients/lookup/',
            {'email': 'personal@gmail.com'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'found_personal')
        self.assertTrue(response.data['can_invite'])
        self.assertTrue(response.data['uses_google'])

    def test_lookup_not_found(self):
        self._auth(self.therapist_token)
        response = self.client.post(
            '/api/therapist/patients/lookup/',
            {'email': 'nobody@example.com'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'not_found')
        self.assertFalse(response.data['can_invite'])

    @patch('api.therapist_patient_invitation_views.send_therapist_patient_invitation_email', return_value=True)
    def test_invite_and_accept_flow(self, _mock_email):
        self._auth(self.therapist_token)
        invite = self.client.post(
            '/api/therapist/patients/invite/',
            {'email': 'personal@gmail.com', 'message': 'Hola, únete a mi consulta.'},
            format='json',
        )
        self.assertEqual(invite.status_code, status.HTTP_201_CREATED)
        self.assertTrue(invite.data.get('email_sent'))

        inv = TherapistPatientInvitation.objects.get(target_user=self.personal)
        self.assertEqual(inv.status, 'pending')

        self._auth(self.personal_token)
        listing = self.client.get('/api/personal/therapist-invitations/')
        self.assertEqual(listing.status_code, status.HTTP_200_OK)
        self.assertEqual(len(listing.data['invitations']), 1)

        accept = self.client.post(f'/api/personal/therapist-invitations/{inv.id}/accept/')
        self.assertEqual(accept.status_code, status.HTTP_200_OK)
        self.assertEqual(accept.data['status'], 'accepted')

        inv.refresh_from_db()
        self.assertEqual(inv.status, 'accepted')
        self.assertIsNotNone(inv.patient_id)

        patient = Patient.objects.get(user=self.personal)
        self.assertEqual(patient.therapist_id, self.therapist.id)
        self.personal.profile.refresh_from_db()
        self.assertEqual(self.personal.profile.user_type, 'patient')

    def test_create_patient_blocks_duplicate_email(self):
        """Existing create flow still rejects registered emails."""
        self._auth(self.therapist_token)
        response = self.client.post(
            '/api/therapist/patients/create/',
            {
                'first_name': 'Test',
                'last_name': 'User',
                'email': 'personal@gmail.com',
                'birth_date': '1990-01-01',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data.get('error', '').lower() + str(response.data))

    @patch('api.emails.send_patient_account_credentials_email', return_value=True)
    def test_create_patient_sends_credentials_email(self, mock_email):
        self._auth(self.therapist_token)
        response = self.client.post(
            '/api/therapist/patients/create/',
            {
                'first_name': 'Nuevo',
                'last_name': 'Consultante',
                'email': 'nuevo.consultante@example.com',
                'birth_date': '1990-01-01',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data.get('email_sent'))
        self.assertIn('credentials', response.data)
        mock_email.assert_called_once()

    @patch('api.therapist_patient_invitation_views.send_therapist_patient_invitation_email', return_value=True)
    def test_cancel_pending_invitation(self, _mock_email):
        self._auth(self.therapist_token)
        self.client.post(
            '/api/therapist/patients/invite/',
            {'email': 'personal@gmail.com'},
            format='json',
        )
        inv = TherapistPatientInvitation.objects.get(target_user=self.personal)
        cancel = self.client.post(f'/api/therapist/patients/invitations/{inv.id}/cancel/')
        self.assertEqual(cancel.status_code, status.HTTP_200_OK)
        inv.refresh_from_db()
        self.assertEqual(inv.status, 'cancelled')

    @patch('api.therapist_patient_invitation_views.send_therapist_patient_invitation_email', return_value=True)
    def test_reject_invitation(self, _mock_email):
        self._auth(self.therapist_token)
        self.client.post(
            '/api/therapist/patients/invite/',
            {'email': 'personal@gmail.com'},
            format='json',
        )
        inv = TherapistPatientInvitation.objects.get(target_user=self.personal)

        self._auth(self.personal_token)
        reject = self.client.post(f'/api/personal/therapist-invitations/{inv.id}/reject/')
        self.assertEqual(reject.status_code, status.HTTP_200_OK)
        inv.refresh_from_db()
        self.assertEqual(inv.status, 'rejected')
        self.assertFalse(Patient.objects.filter(user=self.personal).exists())