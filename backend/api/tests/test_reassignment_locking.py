from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from api.models import UserProfile, Patient
from api.test_models import TestModule, TestResult, UserTestAccess


class ReassignmentLockingTestCase(TestCase):
    def setUp(self):
        # Therapist
        self.therapist = User.objects.create_user(username='thera_lock', password='pass')
        up, _ = UserProfile.objects.get_or_create(user=self.therapist)
        up.user_type = 'therapist'
        up.save()

        # Patient + user
        self.patient_user = User.objects.create_user(username='patient_lock', password='pass')
        pup, _ = UserProfile.objects.get_or_create(user=self.patient_user)
        pup.user_type = 'patient'
        pup.save()
        self.patient = Patient.objects.create(
            therapist=self.therapist,
            user=self.patient_user,
            first_name='Lock', last_name='Patient', email='lock@example.com', birth_date='1990-01-01'
        )

        # Test module
        self.test_module = TestModule.objects.create(
            code='lock-test', name='Lock Test', is_active=True,
            available_for_therapists=True, available_for_personal=False, test_type='wellness'
        )

        self.client = APIClient()

    def test_block_reassign_when_active_result(self):
        # Create active TestResult
        tr = TestResult.objects.create(
            user=self.therapist,
            patient=self.patient,
            test_module=self.test_module,
            input_data={}, result_data={'note': 'done'},
        )

        # Attempt to assign
        self.client.force_authenticate(user=self.therapist)
        resp = self.client.post('/api/tests/assign-to-patient/', {'patient_id': self.patient.id, 'test_code': self.test_module.code}, format='json')
        self.assertEqual(resp.status_code, 409)

    def test_catalog_flags_and_unblock_after_archive(self):
        # Initially no result -> assign should succeed
        self.client.force_authenticate(user=self.therapist)
        resp_ok = self.client.post('/api/tests/assign-to-patient/', {'patient_id': self.patient.id, 'test_code': self.test_module.code}, format='json')
        self.assertIn(resp_ok.status_code, (200, 201))

        # Now GET available tests with patient_id and check flags
        resp = self.client.get(f'/api/tests/?patient_id={self.patient.id}')
        self.assertEqual(resp.status_code, 200)
        tests = resp.data.get('tests', [])
        found = None
        for t in tests:
            if t.get('code') == self.test_module.code:
                found = t
                break
        self.assertIsNotNone(found, msg='Test must be present in catalog')
        self.assertTrue(found.get('already_assigned'))
        self.assertTrue(found.get('locked'))
        self.assertEqual(found.get('lock_reason'), 'assigned_pending')

        # Create a TestResult (complete) and ensure lock reason becomes 'completed'
        tr = TestResult.objects.create(user=self.therapist, patient=self.patient, test_module=self.test_module, input_data={}, result_data={'note': 'done'})
        resp2 = self.client.get(f'/api/tests/?patient_id={self.patient.id}')
        tests2 = resp2.data.get('tests', [])
        for t in tests2:
            if t.get('code') == self.test_module.code:
                self.assertTrue(t.get('locked'))
                self.assertEqual(t.get('lock_reason'), 'completed')
                break

        # Archive the TestResult and check reassignment allowed
        tr.is_archived = True
        tr.save()
        resp3 = self.client.post('/api/tests/assign-to-patient/', {'patient_id': self.patient.id, 'test_code': self.test_module.code}, format='json')
        self.assertIn(resp3.status_code, (200, 201))
