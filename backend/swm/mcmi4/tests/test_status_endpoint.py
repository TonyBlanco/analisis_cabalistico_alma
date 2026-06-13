"""
Tests for MCMI-4 process status endpoint.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from api.mcmi4_signal_public_name import (
    MCMI4_SIGNAL_PUBLIC_DESCRIPTION,
    MCMI4_SIGNAL_PUBLIC_NAME,
)
from api.test_models import TestModule, TestResult, Assignment
from swm.mcmi4.models import WorkspaceDefinition as McmiDefinition, WorkspaceInstance as McmiWorkspace
from swm.mcmi4_reflection.models import WorkspaceDefinition as ReflectionDefinition, WorkspaceInstance as ReflectionWorkspace

User = get_user_model()


class ProcessStatusEndpointTest(TestCase):
    """Test GET /api/swm/mcmi4/status/<user_id>/"""
    
    def setUp(self):
        """Set up test data."""
        self.therapist = User.objects.create_user(
            username='therapist_test',
            password='testpass123'
        )
        self.patient = User.objects.create_user(
            username='patient_test',
            password='testpass123'
        )
        self.test_module = TestModule.objects.create(
            code='mcmi4-signal',
            name=MCMI4_SIGNAL_PUBLIC_NAME,
            public_name=MCMI4_SIGNAL_PUBLIC_NAME,
            description=MCMI4_SIGNAL_PUBLIC_DESCRIPTION,
            test_type='personality'
        )
        self.mcmi_definition = McmiDefinition.objects.get_or_create(
            code='MCMI4_MYSTIC',
            defaults={'name': 'MCMI-4 Místico', 'version': '1.0', 'is_active': True}
        )[0]
        self.reflection_definition = ReflectionDefinition.objects.get_or_create(
            code='MCMI4_REFLECTION',
            defaults={'name': 'MCMI-4 Reflection', 'version': '1.0', 'is_active': True}
        )[0]
        
        self.client = APIClient()
        self.client.force_authenticate(user=self.therapist)
    
    def test_no_data(self):
        """Should return all false when no data exists."""
        response = self.client.get(f'/api/swm/mcmi4/status/{self.patient.id}/')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['assignment']['exists'], False)
        self.assertEqual(response.data['signal']['exists'], False)
        self.assertIsNone(response.data['signal']['test_result_id'])
        self.assertEqual(response.data['reflection']['exists'], False)
        self.assertEqual(response.data['workspace']['exists'], False)
    
    def test_signal_completed(self):
        """Should detect signal TestResult."""
        result = TestResult.objects.create(
            user=self.patient,
            test_module=self.test_module,
            result_data={'mean': 2.5, 'stdev': 0.8}
        )
        
        response = self.client.get(f'/api/swm/mcmi4/status/{self.patient.id}/')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['signal']['exists'], True)
        self.assertEqual(response.data['signal']['test_result_id'], result.id)
        self.assertIsNotNone(response.data['signal']['completed_at'])
    
    def test_reflection_draft(self):
        """Should detect draft reflection."""
        ReflectionWorkspace.objects.create(
            workspace_definition=self.reflection_definition,
            consultant_user=self.patient,
            linked_test_result_id='123',
            status='draft'
        )
        
        response = self.client.get(f'/api/swm/mcmi4/status/{self.patient.id}/')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['reflection']['exists'], True)
        self.assertEqual(response.data['reflection']['sealed'], False)
    
    def test_reflection_sealed(self):
        """Should detect sealed reflection."""
        ws = ReflectionWorkspace.objects.create(
            workspace_definition=self.reflection_definition,
            consultant_user=self.patient,
            linked_test_result_id='123',
            status='sealed'
        )
        
        response = self.client.get(f'/api/swm/mcmi4/status/{self.patient.id}/')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['reflection']['exists'], True)
        self.assertEqual(response.data['reflection']['sealed'], True)
        self.assertEqual(response.data['reflection']['workspace_id'], str(ws.id))
    
    def test_workspace_created(self):
        """Should detect místico workspace."""
        ws = McmiWorkspace.objects.create(
            workspace_definition=self.mcmi_definition,
            subject_user=self.patient,
            creator_user=self.therapist,
            mcmi4_source_data_id='123'
        )
        
        response = self.client.get(f'/api/swm/mcmi4/status/{self.patient.id}/')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['workspace']['exists'], True)
        self.assertEqual(response.data['workspace']['workspace_id'], str(ws.id))
    
    def test_prefers_sealed_reflection(self):
        """Should prefer sealed over draft reflection."""
        draft = ReflectionWorkspace.objects.create(
            workspace_definition=self.reflection_definition,
            consultant_user=self.patient,
            linked_test_result_id='123',
            status='draft'
        )
        sealed = ReflectionWorkspace.objects.create(
            workspace_definition=self.reflection_definition,
            consultant_user=self.patient,
            linked_test_result_id='456',
            status='sealed'
        )
        
        response = self.client.get(f'/api/swm/mcmi4/status/{self.patient.id}/')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['reflection']['workspace_id'], str(sealed.id))
        self.assertEqual(response.data['reflection']['sealed'], True)
    
    def test_most_recent_signal(self):
        """Should return most recent signal."""
        old_result = TestResult.objects.create(
            user=self.patient,
            test_module=self.test_module,
            result_data={'mean': 2.0}
        )
        new_result = TestResult.objects.create(
            user=self.patient,
            test_module=self.test_module,
            result_data={'mean': 3.0}
        )
        
        response = self.client.get(f'/api/swm/mcmi4/status/{self.patient.id}/')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['signal']['test_result_id'], new_result.id)
    
    def test_user_not_found(self):
        """Should return 404 for non-existent user."""
        response = self.client.get('/api/swm/mcmi4/status/99999/')
        
        self.assertEqual(response.status_code, 404)
    
    def test_assignment_detection(self):
        """Should detect assignment."""
        Assignment.objects.create(
            subject_user=self.patient,
            assigned_by_user=self.therapist,
            assigned_to_user=self.patient,
            test_type='mcmi4-signal',
            status='assigned'
        )
        
        response = self.client.get(f'/api/swm/mcmi4/status/{self.patient.id}/')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['assignment']['exists'], True)
