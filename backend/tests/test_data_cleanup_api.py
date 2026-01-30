"""Test cleanup API endpoint with therapist user."""
import json
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from api.models import Patient
from api.test_models import TestResult, Assignment, TestModule

User = get_user_model()


class DataCleanupAPITest(APITestCase):
    """Test the data cleanup endpoint for therapists."""
    
    def setUp(self):
        # Create therapist
        self.therapist = User.objects.create_user(
            username='therapist_cleanup',
            email='therapist_cleanup@test.com',
            password='testpass123'
        )
        self.therapist.profile.user_type = 'therapist'
        self.therapist.profile.full_name = 'Test Therapist'
        self.therapist.profile.save()
        
        # Create patient with user
        self.patient_user = User.objects.create_user(
            username='patient_cleanup',
            email='patient_cleanup@test.com',
            password='testpass123'
        )
        self.patient_user.profile.user_type = 'patient'
        self.patient_user.profile.full_name = 'Test Patient'
        self.patient_user.profile.save()
        
        self.patient = Patient.objects.create(
            therapist=self.therapist,
            user=self.patient_user,
            first_name='Test',
            last_name='Patient',
            email='patient_cleanup@test.com',
            birth_date='1990-01-01',
            full_name='Test Patient'
        )
        
        # Create test module
        self.test_module = TestModule.objects.create(
            code='test_cleanup_module',
            name='Test Module Cleanup',
            test_type='wellness',
            description='Test',
            is_active=True,
            is_assignable=False
        )
        
        # Authenticate as therapist
        self.client.force_authenticate(user=self.therapist)
    
    def test_get_patients_list(self):
        """Test GET endpoint returns therapist's patients with counts."""
        response = self.client.get('/api/therapist/cleanup/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertIn('patients', data)
        self.assertEqual(len(data['patients']), 1)
        
        patient_data = data['patients'][0]
        self.assertEqual(patient_data['full_name'], 'Test Patient')
        self.assertIn('counts', patient_data)
    
    def test_cleanup_dry_run(self):
        """Test dry-run doesn't delete data."""
        # Create test data
        TestResult.objects.create(
            user=self.patient_user,
            test_module=self.test_module,
            patient=self.patient
        )
        
        initial_count = TestResult.objects.count()
        
        response = self.client.post('/api/therapist/cleanup/', {
            'patient_id': self.patient.id,
            'dry_run': True
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertTrue(data['dry_run'])
        self.assertIn('counts', data)
        
        # Verify nothing was deleted
        self.assertEqual(TestResult.objects.count(), initial_count)
    
    def test_cleanup_execution(self):
        """Test actual cleanup deletes data."""
        # Create test data
        TestResult.objects.create(
            user=self.patient_user,
            test_module=self.test_module,
            patient=self.patient
        )
        
        response = self.client.post('/api/therapist/cleanup/', {
            'patient_id': self.patient.id,
            'dry_run': False
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertFalse(data['dry_run'])
        self.assertIn('deleted', data)
        
        # Verify data was deleted
        self.assertEqual(TestResult.objects.filter(patient=self.patient).count(), 0)
    
    def test_non_therapist_forbidden(self):
        """Test non-therapist users cannot access."""
        # Authenticate as patient
        self.client.force_authenticate(user=self.patient_user)
        
        response = self.client.get('/api/therapist/cleanup/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_therapist_cannot_clean_other_therapist_patients(self):
        """Test therapist can only clean their own patients."""
        # Create another therapist with their patient
        other_therapist = User.objects.create_user(
            username='other_therapist',
            email='other@test.com',
            password='test123'
        )
        other_therapist.profile.user_type = 'therapist'
        other_therapist.profile.save()
        
        other_patient_user = User.objects.create_user(
            username='other_patient',
            email='otherpatient@test.com',
            password='test123'
        )
        
        other_patient = Patient.objects.create(
            therapist=other_therapist,
            user=other_patient_user,
            first_name='Other',
            last_name='Patient',
            email='otherpatient@test.com',
            birth_date='1990-01-01',
            full_name='Other Patient'
        )
        
        # Try to clean other therapist's patient
        response = self.client.post('/api/therapist/cleanup/', {
            'patient_id': other_patient.id,
            'dry_run': True
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
