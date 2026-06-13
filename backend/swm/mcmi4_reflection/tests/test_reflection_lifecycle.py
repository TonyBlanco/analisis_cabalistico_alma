"""
Test reflection workspace lifecycle (create, update, seal).
"""

from django.test import TestCase
from django.contrib.auth import get_user_model

from api.mcmi4_signal_public_name import (
    MCMI4_SIGNAL_PUBLIC_DESCRIPTION,
    MCMI4_SIGNAL_PUBLIC_NAME,
)
from api.test_models import TestModule, TestResult
from swm.mcmi4_reflection.models import WorkspaceDefinition, WorkspaceInstance
from swm.mcmi4_reflection.services.workspace_service import WorkspaceService

User = get_user_model()


class ReflectionLifecycleTestCase(TestCase):
    def setUp(self):
        self.consultant_user = User.objects.create_user(
            username='consultant_reflection',
            password='testpass123',
        )
        self.other_user = User.objects.create_user(
            username='other_reflection',
            password='testpass123',
        )
        
        self.workspace_def = WorkspaceDefinition.objects.create(
            code='MCMI4_REFLECTION',
            name='MCMI-4 Reflection',
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
        )
        
        self.test_result = TestResult.objects.create(
            user=self.consultant_user,
            test_module=self.signal_module,
            input_data={'test': 'data'},
            result_data={'result': 'data'}
        )
    
    def test_create_reflection_workspace(self):
        """Test creating reflection workspace."""
        workspace, artifact = WorkspaceService.create_workspace(
            consultant_user=self.consultant_user,
            linked_test_result_id=str(self.test_result.id)
        )
        
        self.assertIsNotNone(workspace.id)
        self.assertEqual(workspace.consultant_user, self.consultant_user)
        self.assertEqual(workspace.status, 'draft')
        self.assertEqual(workspace.linked_test_result_id, str(self.test_result.id))
        
        self.assertIsNotNone(artifact.id)
        self.assertEqual(artifact.artifact_type, 'reflection:v1')
        self.assertFalse(artifact.is_sealed)
        self.assertEqual(artifact.content['schema_version'], 'mcmi4-reflection:v1')
    
    def test_create_rejects_nonexistent_testresult(self):
        """Test that nonexistent TestResult is rejected."""
        with self.assertRaises(ValueError) as cm:
            WorkspaceService.create_workspace(
                consultant_user=self.consultant_user,
                linked_test_result_id='999999'
            )
        self.assertIn('not found', str(cm.exception))
    
    def test_create_rejects_wrong_user_testresult(self):
        """Test that TestResult from different user is rejected."""
        other_result = TestResult.objects.create(
            user=self.other_user,
            test_module=self.signal_module,
            input_data={}
        )
        
        with self.assertRaises(ValueError) as cm:
            WorkspaceService.create_workspace(
                consultant_user=self.consultant_user,
                linked_test_result_id=str(other_result.id)
            )
        self.assertIn('does not belong', str(cm.exception))
    
    def test_create_rejects_duplicate_reflection(self):
        """Test that duplicate reflection is prevented."""
        WorkspaceService.create_workspace(
            consultant_user=self.consultant_user,
            linked_test_result_id=str(self.test_result.id)
        )
        
        with self.assertRaises(ValueError) as cm:
            WorkspaceService.create_workspace(
                consultant_user=self.consultant_user,
                linked_test_result_id=str(self.test_result.id)
            )
        self.assertIn('already exists', str(cm.exception))
    
    def test_update_reflection_draft(self):
        """Test updating reflection in draft status."""
        workspace, _ = WorkspaceService.create_workspace(
            consultant_user=self.consultant_user,
            linked_test_result_id=str(self.test_result.id)
        )
        
        answers = {
            'q1': 'Answer 1',
            'q2': 'Answer 2'
        }
        
        artifact = WorkspaceService.update_reflection(
            workspace=workspace,
            user=self.consultant_user,
            answers=answers
        )
        
        self.assertEqual(artifact.content['answers'], answers)
    
    def test_update_rejects_non_consultant(self):
        """Test that only consultant can update."""
        workspace, _ = WorkspaceService.create_workspace(
            consultant_user=self.consultant_user,
            linked_test_result_id=str(self.test_result.id)
        )
        
        with self.assertRaises(ValueError) as cm:
            WorkspaceService.update_reflection(
                workspace=workspace,
                user=self.other_user,
                answers={'q1': 'test'}
            )
        self.assertIn('Only consultant', str(cm.exception))
    
    def test_seal_reflection(self):
        """Test sealing reflection workspace."""
        workspace, _ = WorkspaceService.create_workspace(
            consultant_user=self.consultant_user,
            linked_test_result_id=str(self.test_result.id)
        )
        
        WorkspaceService.update_reflection(
            workspace=workspace,
            user=self.consultant_user,
            answers={'q1': 'Final answer'}
        )
        
        sealed_workspace = WorkspaceService.seal_reflection(
            workspace=workspace,
            user=self.consultant_user
        )
        
        self.assertEqual(sealed_workspace.status, 'sealed')
        self.assertIsNotNone(sealed_workspace.sealed_at)
        self.assertFalse(sealed_workspace.can_edit())
    
    def test_update_rejects_sealed_workspace(self):
        """Test that sealed workspace cannot be updated."""
        workspace, _ = WorkspaceService.create_workspace(
            consultant_user=self.consultant_user,
            linked_test_result_id=str(self.test_result.id)
        )
        
        WorkspaceService.seal_reflection(
            workspace=workspace,
            user=self.consultant_user
        )
        
        with self.assertRaises(ValueError) as cm:
            WorkspaceService.update_reflection(
                workspace=workspace,
                user=self.consultant_user,
                answers={'q1': 'Should fail'}
            )
        self.assertIn('Cannot update sealed', str(cm.exception))
    
    def test_seal_rejects_non_consultant(self):
        """Test that only consultant can seal."""
        workspace, _ = WorkspaceService.create_workspace(
            consultant_user=self.consultant_user,
            linked_test_result_id=str(self.test_result.id)
        )
        
        with self.assertRaises(ValueError) as cm:
            WorkspaceService.seal_reflection(
                workspace=workspace,
                user=self.other_user
            )
        self.assertIn('Only consultant', str(cm.exception))
    
    def test_seal_rejects_already_sealed(self):
        """Test that already sealed workspace cannot be sealed again."""
        workspace, _ = WorkspaceService.create_workspace(
            consultant_user=self.consultant_user,
            linked_test_result_id=str(self.test_result.id)
        )
        
        WorkspaceService.seal_reflection(
            workspace=workspace,
            user=self.consultant_user
        )
        
        with self.assertRaises(ValueError) as cm:
            WorkspaceService.seal_reflection(
                workspace=workspace,
                user=self.consultant_user
            )
        self.assertIn('already sealed', str(cm.exception))
