"""Tests for federation consent grant/revoke and feed unlock."""

from datetime import date

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from api.models import FederationAuditLog, Patient, UserProfile


class FederationConsentFlowTestCase(APITestCase):
    def setUp(self):
        self.therapist_user = User.objects.create_user(
            username='fed_consent_therapist',
            email='fed_therapist@test.com',
            password='testpass123',
        )
        self.therapist_profile, _ = UserProfile.objects.get_or_create(
            user=self.therapist_user,
            defaults={'user_type': 'therapist', 'full_name': 'Dr. Fed Therapist'},
        )
        self.therapist_profile.user_type = 'therapist'
        self.therapist_profile.save()

        self.patient_user = User.objects.create_user(
            username='fed_consent_patient',
            email='fed_patient@test.com',
            password='testpass123',
        )
        self.patient_profile, _ = UserProfile.objects.get_or_create(
            user=self.patient_user,
            defaults={'user_type': 'patient', 'full_name': 'Fed Patient User'},
        )
        self.patient_profile.user_type = 'patient'
        self.patient_profile.save()

        self.patient = Patient.objects.create(
            therapist=self.therapist_user,
            user=self.patient_user,
            first_name='Fed',
            last_name='Patient',
            email='fed_patient@test.com',
            birth_date=date(1992, 3, 15),
            consent_federation=False,
        )

        self.client = APIClient()

    def _feed_url(self):
        return '/api/federation/hub-feed/'

    def test_no_consent_blocks_feed_403(self):
        self.client.force_authenticate(user=self.therapist_user)
        response = self.client.get(
            self._feed_url(),
            {'patient_id': self.patient.id, 'hub': 'SCDF'},
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('consent', response.data['error'].lower())

    def test_patient_portal_grant_unlocks_feed(self):
        self.client.force_authenticate(user=self.patient_user)
        grant = self.client.post(
            '/api/patient/federation-consent/',
            {'consent': True},
            format='json',
        )
        self.assertEqual(grant.status_code, status.HTTP_200_OK)
        self.assertTrue(grant.data['consent_federation'])
        self.assertTrue(grant.data['changed'])

        self.patient.refresh_from_db()
        self.assertTrue(self.patient.consent_federation)
        self.assertIsNotNone(self.patient.consent_federation_date)

        audit = FederationAuditLog.objects.filter(
            subject_patient=self.patient,
            scope__event='federation_consent_change',
        ).first()
        self.assertIsNotNone(audit)
        self.assertEqual(audit.scope['source'], 'patient_portal')

        self.client.force_authenticate(user=self.therapist_user)
        feed = self.client.get(
            self._feed_url(),
            {'patient_id': self.patient.id, 'hub': 'SCDF'},
        )
        self.assertEqual(feed.status_code, status.HTTP_200_OK)

    def test_revoke_blocks_feed_again(self):
        self.patient.consent_federation = True
        self.patient.save(update_fields=['consent_federation'])

        self.client.force_authenticate(user=self.patient_user)
        revoke = self.client.post(
            '/api/patient/federation-consent/',
            {'consent': False},
            format='json',
        )
        self.assertEqual(revoke.status_code, status.HTTP_200_OK)
        self.assertFalse(revoke.data['consent_federation'])

        self.client.force_authenticate(user=self.therapist_user)
        feed = self.client.get(
            self._feed_url(),
            {'patient_id': self.patient.id, 'hub': 'SCDF'},
        )
        self.assertEqual(feed.status_code, status.HTTP_403_FORBIDDEN)

    def test_therapist_in_person_grant(self):
        self.client.force_authenticate(user=self.therapist_user)
        response = self.client.post(
            f'/api/therapist/patients/{self.patient.id}/federation-consent/',
            {'consent': True},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['consent_federation'])

        audit = FederationAuditLog.objects.filter(
            subject_patient=self.patient,
            scope__source='therapist_in_person',
        ).first()
        self.assertIsNotNone(audit)

        feed = self.client.get(
            self._feed_url(),
            {'patient_id': self.patient.id, 'hub': 'MSHE'},
        )
        self.assertEqual(feed.status_code, status.HTTP_200_OK)

    def test_grant_idempotent(self):
        self.client.force_authenticate(user=self.patient_user)
        first = self.client.post(
            '/api/patient/federation-consent/',
            {'consent': True},
            format='json',
        )
        second = self.client.post(
            '/api/patient/federation-consent/',
            {'consent': True},
            format='json',
        )
        self.assertTrue(first.data['changed'])
        self.assertFalse(second.data['changed'])