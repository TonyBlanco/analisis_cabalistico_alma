from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from api.test_models import TestModule, UserTestAccess, TestResult
from api.models import Patient, UserProfile


class AssignedExecutionTestCase(TestCase):
    def setUp(self):
        # Therapist
        self.therapist = User.objects.create_user(username='thera_test', password='pass')
        self.thera_profile, _ = UserProfile.objects.get_or_create(user=self.therapist)
        self.thera_profile.user_type = 'therapist'
        self.thera_profile.save()

        # Patient
        self.patient_user = User.objects.create_user(username='patient_test', password='pass')
        self.patient_profile, _ = UserProfile.objects.get_or_create(user=self.patient_user)
        self.patient_profile.user_type = 'patient'
        self.patient_profile.save()
        self.patient = Patient.objects.create(
            therapist=self.therapist,
            user=self.patient_user,
            first_name='Paciente',
            last_name='Test',
            email='patient_test@example.com',
            birth_date='1990-01-01'
        )

        # Create a test module that is therapist-only (not available for personal)
        self.test_module = TestModule.objects.create(
            code='test-assigned-1',
            name='Test Assigned 1',
            is_active=True,
            available_for_personal=False,
            available_for_therapists=True,
            test_type='wellness'
        )

        # Assign special access to patient
        self.user_access = UserTestAccess.objects.create(user=self.patient_user, test_module=self.test_module, has_special_access=True)

        self.client = APIClient()

    def test_assigned_patient_can_execute_and_result_created(self):
        # Authenticate as patient
        self.client.force_authenticate(user=self.patient_user)

        payload = {
            'test_module_code': self.test_module.code,
            'input_data': {'fecha': '2026-01-08', 'responses': {}},
            'save_result': True
        }

        resp = self.client.post('/api/tests/execute/', payload, format='json')
        self.assertIn(resp.status_code, (200, 201))

        # Ensure a TestResult was created for this patient and module
        tr = TestResult.objects.filter(user=self.patient_user, test_module=self.test_module).order_by('-created_at').first()
        self.assertIsNotNone(tr, msg='Expected TestResult to be created for assigned patient execution')
        self.assertEqual(tr.patient.user, self.patient_user)
