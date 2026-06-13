"""
Test signal binding (TestResult → Workspace).

Coverage:
6. Enlace TestResult → Workspace
   - acepta TestResult válido (mcmi4-signal)
   - rechaza TestResult inexistente
   - rechaza TestResult de otro usuario
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from api.mcmi4_signal_public_name import (
    MCMI4_SIGNAL_PUBLIC_DESCRIPTION,
    MCMI4_SIGNAL_PUBLIC_NAME,
)
from api.test_models import TestModule, TestResult
from swm.mcmi4.models import WorkspaceDefinition, WorkspaceInstance
from swm.mcmi4.services.workspace_service import WorkspaceService

User = get_user_model()


class SignalBindingTestCase(TestCase):
    def setUp(self):
        self.creator_user = User.objects.create_user(
            username='creator_signal',
            password='testpass123',
        )
        self.subject_user = User.objects.create_user(
            username='subject_signal',
            password='testpass123',
        )
        self.other_user = User.objects.create_user(
            username='other_signal',
            password='testpass123',
        )
        
        self.workspace_def = WorkspaceDefinition.objects.create(
            code='MCMI4_MYSTIC',
            name='MCMI-4 Místico',
            version='1.0',
            is_active=True,
        )
        
        self.signal_module = TestModule.objects.create(
            code='mcmi4-signal',
            name=MCMI4_SIGNAL_PUBLIC_NAME,
            public_name=MCMI4_SIGNAL_PUBLIC_NAME,
            description=MCMI4_SIGNAL_PUBLIC_DESCRIPTION,
            test_type='holistic_screening',
            domain=TestModule.Domain.TECHNICAL,
            is_active=True,
            is_assignable=False,
            is_internal=True,
        )
        
        self.other_module = TestModule.objects.create(
            code='other-test',
            name='Other Test',
            public_name='Other Test',
            description='Other test',
            test_type='holistic_screening',
            domain=TestModule.Domain.HOLISTIC,
            is_active=True,
        )
        
        self.client = APIClient()
        self.client.force_authenticate(user=self.creator_user)
    
    def test_accepts_valid_mcmi4_signal_testresult(self):
        """Test that valid mcmi4-signal TestResult is accepted."""
        test_result = TestResult.objects.create(
            user=self.subject_user,
            test_module=self.signal_module,
            input_data={'test': 'data'},
            result_data={'result': 'data'}
        )
        
        # Create workspace with valid TestResult
        workspace = WorkspaceService.create_workspace(
            creator_user=self.creator_user,
            subject_user=self.subject_user,
            mcmi4_source_data_id=str(test_result.id)
        )
        
        self.assertIsNotNone(workspace.id)
        self.assertEqual(workspace.mcmi4_source_data_id, str(test_result.id))
    
    def test_rejects_nonexistent_testresult_via_api(self):
        """Test that nonexistent TestResult is rejected via API."""
        resp = self.client.post(
            '/api/swm/mcmi4/create',
            {
                'subject_user_id': self.subject_user.id,
                'mcmi4_source_data_id': '999999999',
            },
            format='json',
        )
        
        self.assertEqual(resp.status_code, 422)
        error_msg = resp.data.get('error', '').lower()
        self.assertTrue('testresult' in error_msg or 'not found' in error_msg)
    
    def test_rejects_testresult_wrong_module(self):
        """Test that TestResult with wrong module code is rejected."""
        test_result = TestResult.objects.create(
            user=self.subject_user,
            test_module=self.other_module,  # Not mcmi4-signal
            input_data={'test': 'data'}
        )
        
        resp = self.client.post(
            '/api/swm/mcmi4/create',
            {
                'subject_user_id': self.subject_user.id,
                'mcmi4_source_data_id': str(test_result.id),
            },
            format='json',
        )
        
        self.assertEqual(resp.status_code, 422)
        self.assertIn('mcmi4-signal', resp.data.get('error', '').lower())
    
    def test_rejects_testresult_wrong_user(self):
        """Test that TestResult belonging to different user is rejected."""
        test_result = TestResult.objects.create(
            user=self.other_user,  # Different user
            test_module=self.signal_module,
            input_data={'test': 'data'}
        )
        
        resp = self.client.post(
            '/api/swm/mcmi4/create',
            {
                'subject_user_id': self.subject_user.id,
                'mcmi4_source_data_id': str(test_result.id),
            },
            format='json',
        )
        
        self.assertEqual(resp.status_code, 422)
        error_msg = resp.data.get('error', '').lower()
        self.assertTrue('belongs to subject' in error_msg or 'mismatch' in error_msg)
    
    def test_workspace_instance_stores_source_reference(self):
        """Test that WorkspaceInstance correctly stores mcmi4_source_data_id."""
        test_result = TestResult.objects.create(
            user=self.subject_user,
            test_module=self.signal_module,
            input_data={'test': 'data'}
        )
        
        workspace = WorkspaceService.create_workspace(
            creator_user=self.creator_user,
            subject_user=self.subject_user,
            mcmi4_source_data_id=str(test_result.id)
        )
        
        workspace.refresh_from_db()
        self.assertEqual(workspace.mcmi4_source_data_id, str(test_result.id))
        
        # Verify we can retrieve the TestResult
        retrieved_result = TestResult.objects.get(id=int(workspace.mcmi4_source_data_id))
        self.assertEqual(retrieved_result, test_result)
    
    def test_cannot_create_duplicate_workspace_same_source(self):
        """Test that duplicate workspace for same source is prevented."""
        test_result = TestResult.objects.create(
            user=self.subject_user,
            test_module=self.signal_module,
            input_data={'test': 'data'}
        )
        
        # Create first workspace
        WorkspaceService.create_workspace(
            creator_user=self.creator_user,
            subject_user=self.subject_user,
            mcmi4_source_data_id=str(test_result.id)
        )
        
        # Try to create duplicate
        with self.assertRaises(ValueError) as cm:
            WorkspaceService.create_workspace(
                creator_user=self.creator_user,
                subject_user=self.subject_user,
                mcmi4_source_data_id=str(test_result.id)
            )
        self.assertIn('already exists', str(cm.exception).lower())
