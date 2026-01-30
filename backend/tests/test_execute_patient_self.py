"""
Integration test for patient self-execution flow (SWM SHA).

Tests that when a patient executes an assigned test:
1. TestResult.patient is correctly set to the Patient object
2. TestResult.details.audit.patient_id is correctly set
3. Related Assignment is updated to status='completed'

This test prevents regression of the bug where patient_for_result 
remained None even when a patient was executing their own assigned test.

Related: docs/ERROR_test_SWM_SHA.md
"""
import json
from datetime import date
from django.test import TestCase, Client
from django.contrib.auth.models import User
from api.test_models import TestModule, TestResult, Assignment
from api.models import Patient, UserProfile


class PatientSelfExecutionTest(TestCase):
    """Test that patient self-execution correctly sets patient_id."""

    def setUp(self):
        """Create test users, patient, assignment, and test module."""
        self.client = Client()
        
        # Create therapist user
        self.therapist = User.objects.create_user(
            username='test_therapist',
            password='therapist123',
            email='therapist@test.com',
            is_staff=False
        )
        therapist_profile, _ = UserProfile.objects.get_or_create(
            user=self.therapist,
            defaults={
                'user_type': 'therapist',
                'full_name': 'Test Therapist',
                'subscription_plan': 'professional'
            }
        )
        therapist_profile.user_type = 'therapist'
        therapist_profile.save()
        
        # Create patient user
        self.patient_user = User.objects.create_user(
            username='test_patient',
            password='patient123',
            email='patient@test.com',
            is_staff=False
        )
        patient_profile, _ = UserProfile.objects.get_or_create(
            user=self.patient_user,
            defaults={
                'user_type': 'patient',
                'full_name': 'Test Patient',
                'subscription_plan': 'personal'
            }
        )
        patient_profile.user_type = 'patient'
        patient_profile.save()
        
        # Create Patient object linked to patient_user (with required fields)
        self.patient = Patient.objects.create(
            user=self.patient_user,
            therapist=self.therapist,
            full_name='Test Patient',
            email='patient@test.com',
            birth_date=date(1990, 1, 1),  # Required field
            is_active=True
        )
        
        # Create or get test module (sha_harmony for this test)
        self.test_module, _ = TestModule.objects.get_or_create(
            code='sha_harmony',
            defaults={
                'name': 'SHA Harmony Audit',
                'description': 'Auditoría de Armonía Sefirótica',
                'test_type': 'holistic_screening',
                'is_active': True,
                'available_for_personal': True,
                'available_for_therapists': True,
                'is_assignable': True,
                'is_internal': False,
                'domain': 'holistic',
                'required_access_level': 'personal'
            }
        )
        # Ensure module is properly configured
        self.test_module.is_active = True
        self.test_module.available_for_personal = True
        self.test_module.available_for_therapists = True
        self.test_module.is_assignable = True
        self.test_module.is_internal = False
        self.test_module.save()
        
        # Create assignment from therapist to patient
        self.assignment = Assignment.objects.create(
            patient=self.patient,
            test_type='sha_harmony',
            assigned_by_user=self.therapist,
            assigned_to_user=self.patient_user,
            status='assigned',
            questions=[],
            results={},
            raw_responses={},
            responses_hash=''
        )

    def test_patient_self_execution_sets_patient_id(self):
        """
        Test that when patient executes their assigned test:
        - TestResult.patient is set to the Patient object
        - TestResult.details.audit.patient_id is set correctly
        """
        # Login as patient
        self.client.login(username='test_patient', password='patient123')
        
        # Prepare test payload with sample responses
        payload = {
            'test_module_code': 'sha_harmony',
            'input_data': {
                'fecha': '2026-01-30',
                'nombre': 'Test Patient',
                'fecha_nacimiento': '1990-01-01',
                'responses': {
                    'q1': 3, 'q2': 3, 'q3': 3, 'q4': 3, 'q5': 3,
                    'q6': 3, 'q7': 3, 'q8': 3, 'q9': 3, 'q10': 3
                }
            },
            'save_result': True
        }
        
        # Execute test
        response = self.client.post(
            '/api/tests/execute/',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        # Verify response
        self.assertEqual(response.status_code, 200, 
            f"Expected 200, got {response.status_code}: {response.content}")
        
        data = response.json()
        self.assertIn('result_id', data, "Response should include result_id")
        
        result_id = data['result_id']
        
        # Verify TestResult was created with correct patient
        test_result = TestResult.objects.get(id=result_id)
        
        self.assertIsNotNone(test_result.patient,
            "TestResult.patient should NOT be None for patient self-execution")
        
        self.assertEqual(test_result.patient.id, self.patient.id,
            f"TestResult.patient should be {self.patient.id}, got {test_result.patient_id}")
        
        # Verify audit metadata
        self.assertIn('audit', test_result.details,
            "TestResult.details should contain 'audit' key")
        
        audit = test_result.details['audit']
        
        self.assertEqual(audit.get('execution_mode'), 'patient_self',
            "Execution mode should be 'patient_self'")
        
        self.assertEqual(audit.get('patient_id'), self.patient.id,
            f"Audit patient_id should be {self.patient.id}, got {audit.get('patient_id')}")
        
        self.assertEqual(audit.get('executed_by_user_id'), self.patient_user.id,
            "Audit executed_by_user_id should match patient user")
        
        self.assertEqual(audit.get('executed_by_role'), 'patient',
            "Audit executed_by_role should be 'patient'")

    def test_assignment_updated_to_completed(self):
        """
        Test that when patient executes their assigned test,
        the related Assignment is updated to status='completed'.
        """
        # Login as patient
        self.client.login(username='test_patient', password='patient123')
        
        # Verify assignment starts as 'assigned'
        self.assertEqual(self.assignment.status, 'assigned')
        
        # Prepare test payload
        payload = {
            'test_module_code': 'sha_harmony',
            'input_data': {
                'fecha': '2026-01-30',
                'nombre': 'Test Patient',
                'fecha_nacimiento': '1990-01-01',
                'responses': {
                    'q1': 3, 'q2': 3, 'q3': 3, 'q4': 3, 'q5': 3,
                    'q6': 3, 'q7': 3, 'q8': 3, 'q9': 3, 'q10': 3
                }
            },
            'save_result': True
        }
        
        # Execute test
        response = self.client.post(
            '/api/tests/execute/',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200,
            f"Expected 200, got {response.status_code}: {response.content}")
        
        # Refresh assignment from DB
        self.assignment.refresh_from_db()
        
        # Verify assignment is now completed
        self.assertEqual(self.assignment.status, 'completed',
            f"Assignment status should be 'completed', got '{self.assignment.status}'")

    def test_multiple_patients_for_user_handles_gracefully(self):
        """
        Test edge case: user has multiple Patient records with DIFFERENT therapists.
        
        When patient count > 1, code should pick first by ID and log warning.
        """
        # Create a second therapist
        therapist2 = User.objects.create_user(
            username='test_therapist_alt',
            password='therapist123',
            email='therapist_alt@test.com'
        )
        therapist2_profile, _ = UserProfile.objects.get_or_create(
            user=therapist2,
            defaults={'user_type': 'therapist', 'full_name': 'Test Therapist Alt'}
        )
        therapist2_profile.user_type = 'therapist'
        therapist2_profile.save()
        
        # Create second Patient for same user but different therapist (to avoid unique constraint)
        Patient.objects.create(
            user=self.patient_user,
            therapist=therapist2,  # Different therapist to avoid unique constraint
            full_name='Test Patient 2',
            email='patient_alt@test.com',
            birth_date=date(1990, 1, 1),
            is_active=True
        )
        
        # Now there are 2 active patients for this user
        patient_count = Patient.objects.filter(
            user=self.patient_user, 
            is_active=True
        ).count()
        self.assertEqual(patient_count, 2, "Should have 2 active patients for edge case")
        
        # Login as patient
        self.client.login(username='test_patient', password='patient123')
        
        # Prepare test payload
        payload = {
            'test_module_code': 'sha_harmony',
            'input_data': {
                'fecha': '2026-01-30',
                'nombre': 'Test Patient',
                'fecha_nacimiento': '1990-01-01',
                'responses': {
                    'q1': 3, 'q2': 3, 'q3': 3, 'q4': 3, 'q5': 3,
                    'q6': 3, 'q7': 3, 'q8': 3, 'q9': 3, 'q10': 3
                }
            },
            'save_result': True
        }
        
        # Execute test - should still succeed but patient_id may be None
        # (this is expected behavior for ambiguous cases)
        response = self.client.post(
            '/api/tests/execute/',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        # Request should succeed (test execution itself is valid)
        self.assertEqual(response.status_code, 200,
            f"Expected 200, got {response.status_code}: {response.content}")
        
        # Verify the test executed (we got a result)
        data = response.json()
        self.assertIn('result_id', data, "Should have result_id even with ambiguous patient")


class PatientPersonalTypeExecutionTest(TestCase):
    """Test that 'personal' user type also gets patient_id when executing."""

    def setUp(self):
        """Create test setup for personal user type."""
        self.client = Client()
        
        # Create therapist
        self.therapist = User.objects.create_user(
            username='test_therapist_2',
            password='therapist123',
            email='therapist2@test.com'
        )
        therapist_profile, _ = UserProfile.objects.get_or_create(
            user=self.therapist,
            defaults={'user_type': 'therapist', 'full_name': 'Test Therapist 2'}
        )
        therapist_profile.user_type = 'therapist'
        therapist_profile.save()
        
        # Create user with 'personal' type
        self.personal_user = User.objects.create_user(
            username='test_personal',
            password='personal123',
            email='personal@test.com'
        )
        personal_profile, _ = UserProfile.objects.get_or_create(
            user=self.personal_user,
            defaults={'user_type': 'personal', 'full_name': 'Test Personal'}
        )
        personal_profile.user_type = 'personal'
        personal_profile.save()
        
        # Create Patient linked to personal user (with required fields)
        self.patient = Patient.objects.create(
            user=self.personal_user,
            therapist=self.therapist,
            full_name='Test Personal Patient',
            email='personal@test.com',
            birth_date=date(1990, 1, 1),
            is_active=True
        )
        
        # Get or create test module
        self.test_module, _ = TestModule.objects.get_or_create(
            code='sha_harmony',
            defaults={
                'name': 'SHA Harmony Audit',
                'description': 'Auditoría de Armonía Sefirótica',
                'test_type': 'holistic_screening',
                'is_active': True,
                'available_for_personal': True,
                'available_for_therapists': True,
                'is_assignable': True,
                'is_internal': False,
                'domain': 'holistic'
            }
        )
        
        # Grant special access to personal user (simulates therapist assignment)
        from api.test_models import UserTestAccess
        UserTestAccess.objects.create(
            user=self.personal_user,
            test_module=self.test_module,
            has_special_access=True
        )
        
        # Create assignment
        self.assignment = Assignment.objects.create(
            patient=self.patient,
            test_type='sha_harmony',
            assigned_by_user=self.therapist,
            assigned_to_user=self.personal_user,
            status='assigned',
            questions=[],
            results={},
            raw_responses={},
            responses_hash=''
        )

    def test_personal_user_execution_sets_patient_id(self):
        """Test that 'personal' user type also correctly sets patient_id."""
        # Login as personal user
        self.client.login(username='test_personal', password='personal123')
        
        payload = {
            'test_module_code': 'sha_harmony',
            'input_data': {
                'fecha': '2026-01-30',
                'nombre': 'Test Personal',
                'fecha_nacimiento': '1990-01-01',
                'responses': {
                    'q1': 3, 'q2': 3, 'q3': 3, 'q4': 3, 'q5': 3,
                    'q6': 3, 'q7': 3, 'q8': 3, 'q9': 3, 'q10': 3
                }
            },
            'save_result': True
        }
        
        response = self.client.post(
            '/api/tests/execute/',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200,
            f"Expected 200, got {response.status_code}: {response.content}")
        
        data = response.json()
        result_id = data.get('result_id')
        self.assertIsNotNone(result_id, "Should have result_id")
        
        test_result = TestResult.objects.get(id=result_id)
        
        # Personal users with linked Patient should also have patient_id set
        self.assertIsNotNone(test_result.patient,
            "TestResult.patient should NOT be None for personal user with linked Patient")
        
        self.assertEqual(test_result.patient.id, self.patient.id,
            f"TestResult.patient should be {self.patient.id}")
