"""
Test workspace lifecycle (create, session start, session end).

Coverage:
1. Create WorkspaceInstance correctly
2. Create WorkspaceSession
3. Finalize session
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db import IntegrityError

from swm.mcmi4.models import (
    WorkspaceDefinition,
    WorkspaceInstance,
    WorkspaceSession
)
from swm.mcmi4.services.workspace_service import WorkspaceService
from swm.mcmi4.services.session_service import SessionService

User = get_user_model()


class WorkspaceLifecycleTestCase(TestCase):
    def setUp(self):
        self.creator_user = User.objects.create_user(
            username='creator_lifecycle',
            password='testpass123',
        )
        self.subject_user = User.objects.create_user(
            username='subject_lifecycle',
            password='testpass123',
        )
        
        self.workspace_def = WorkspaceDefinition.objects.create(
            code='MCMI4_MYSTIC',
            name='MCMI-4 Místico',
            version='1.0',
            is_active=True,
        )
    
    def test_create_workspace_instance_valid(self):
        """Test creating WorkspaceInstance with valid users and definition."""
        workspace = WorkspaceService.create_workspace(
            creator_user=self.creator_user,
            subject_user=self.subject_user,
            mcmi4_source_data_id='test-source-123',
            config={'test': 'config'},
            metadata={'test': 'metadata'}
        )
        
        self.assertIsNotNone(workspace.id)
        self.assertEqual(workspace.creator_user, self.creator_user)
        self.assertEqual(workspace.subject_user, self.subject_user)
        self.assertEqual(workspace.workspace_definition, self.workspace_def)
        self.assertEqual(workspace.status, 'created')
        self.assertEqual(workspace.mcmi4_source_data_id, 'test-source-123')
    
    def test_create_workspace_rejects_same_creator_subject(self):
        """Test that creator and subject cannot be the same user."""
        with self.assertRaises(ValueError) as cm:
            WorkspaceService.create_workspace(
                creator_user=self.creator_user,
                subject_user=self.creator_user,
                mcmi4_source_data_id='test-source-123'
            )
        self.assertIn('Creator and subject cannot be the same', str(cm.exception))
    
    def test_start_session_creates_active_session(self):
        """Test start_session creates an active session."""
        workspace = WorkspaceService.create_workspace(
            creator_user=self.creator_user,
            subject_user=self.subject_user,
            mcmi4_source_data_id='test-source-456'
        )
        
        session = SessionService.start_session(
            workspace=workspace,
            executor_user=self.creator_user
        )
        
        self.assertIsNotNone(session.id)
        self.assertEqual(session.workspace_instance, workspace)
        self.assertEqual(session.executor_user, self.creator_user)
        self.assertTrue(session.is_active)
        self.assertIsNone(session.ended_at)
    
    def test_start_session_rejects_duplicate_active(self):
        """Test that starting a second session without ending the first fails."""
        workspace = WorkspaceService.create_workspace(
            creator_user=self.creator_user,
            subject_user=self.subject_user,
            mcmi4_source_data_id='test-source-789'
        )
        
        SessionService.start_session(
            workspace=workspace,
            executor_user=self.creator_user
        )
        
        # Try to start another session
        with self.assertRaises(ValueError) as cm:
            SessionService.start_session(
                workspace=workspace,
                executor_user=self.creator_user
            )
        self.assertIn('already has an active session', str(cm.exception))
    
    def test_end_session_marks_inactive(self):
        """Test end_session marks session correctly."""
        workspace = WorkspaceService.create_workspace(
            creator_user=self.creator_user,
            subject_user=self.subject_user,
            mcmi4_source_data_id='test-source-end'
        )
        
        session = SessionService.start_session(
            workspace=workspace,
            executor_user=self.creator_user
        )
        
        ended_session = SessionService.end_session(
            session=session,
            user=self.creator_user
        )
        
        self.assertFalse(ended_session.is_active)
        self.assertIsNotNone(ended_session.ended_at)
    
    def test_end_session_rejects_double_close(self):
        """Test that ending an inactive session fails."""
        workspace = WorkspaceService.create_workspace(
            creator_user=self.creator_user,
            subject_user=self.subject_user,
            mcmi4_source_data_id='test-source-double-end'
        )
        
        session = SessionService.start_session(
            workspace=workspace,
            executor_user=self.creator_user
        )
        
        SessionService.end_session(session=session, user=self.creator_user)
        
        # Try to end again
        with self.assertRaises(ValueError) as cm:
            SessionService.end_session(session=session, user=self.creator_user)
        self.assertIn('already ended', str(cm.exception))
    
    def test_unique_active_session_constraint(self):
        """Test database constraint: only 1 active session per workspace."""
        workspace = WorkspaceInstance.objects.create(
            workspace_definition=self.workspace_def,
            subject_user=self.subject_user,
            creator_user=self.creator_user,
            mcmi4_source_data_id='constraint-test'
        )
        
        WorkspaceSession.objects.create(
            workspace_instance=workspace,
            executor_user=self.creator_user,
            is_active=True
        )
        
        # Try to create another active session directly (bypassing service)
        with self.assertRaises(IntegrityError):
            WorkspaceSession.objects.create(
                workspace_instance=workspace,
                executor_user=self.creator_user,
                is_active=True
            )
