"""
Test workspace permissions.

Coverage:
4. Permisos básicos (creator_user tiene permiso total, usuario sin permiso no puede escribir)
"""

from django.test import TestCase
from django.contrib.auth import get_user_model

from swm.mcmi4.models import (
    WorkspaceDefinition,
    WorkspaceInstance,
    WorkspacePermission
)
from swm.mcmi4.services.workspace_service import WorkspaceService
from swm.mcmi4.services.session_service import SessionService

User = get_user_model()


class PermissionsTestCase(TestCase):
    def setUp(self):
        self.creator_user = User.objects.create_user(
            username='creator_perms',
            password='testpass123',
        )
        self.subject_user = User.objects.create_user(
            username='subject_perms',
            password='testpass123',
        )
        self.other_user = User.objects.create_user(
            username='other_perms',
            password='testpass123',
        )
        
        self.workspace_def = WorkspaceDefinition.objects.create(
            code='MCMI4_MYSTIC',
            name='MCMI-4 Místico',
            version='1.0',
            is_active=True,
        )
        
        self.workspace = WorkspaceService.create_workspace(
            creator_user=self.creator_user,
            subject_user=self.subject_user,
            mcmi4_source_data_id='perms-test-source'
        )
    
    def test_creator_has_admin_permission(self):
        """Test that creator_user has admin permission."""
        self.assertTrue(
            self.workspace.has_permission(self.creator_user, 'admin')
        )
    
    def test_creator_has_executor_permission(self):
        """Test that creator_user has executor permission."""
        self.assertTrue(
            self.workspace.has_permission(self.creator_user, 'executor')
        )
    
    def test_creator_has_observer_permission(self):
        """Test that creator_user has observer permission."""
        self.assertTrue(
            self.workspace.has_permission(self.creator_user, 'observer')
        )
    
    def test_creator_has_reviewer_permission(self):
        """Test that creator_user has reviewer permission."""
        self.assertTrue(
            self.workspace.has_permission(self.creator_user, 'reviewer')
        )
    
    def test_user_without_permission_cannot_execute(self):
        """Test that user without permission cannot start session (executor)."""
        with self.assertRaises(ValueError) as cm:
            SessionService.start_session(
                workspace=self.workspace,
                executor_user=self.other_user
            )
        self.assertIn('does not have executor permission', str(cm.exception))
    
    def test_explicit_permission_grants_access(self):
        """Test that explicit permission grant allows access."""
        # Grant executor permission to other_user
        WorkspacePermission.objects.create(
            workspace_instance=self.workspace,
            user=self.other_user,
            permission_type='executor',
            granted_by=self.creator_user,
            is_active=True
        )
        
        # Now other_user should have executor permission
        self.assertTrue(
            self.workspace.has_permission(self.other_user, 'executor')
        )
        
        # And should be able to start session
        session = SessionService.start_session(
            workspace=self.workspace,
            executor_user=self.other_user
        )
        self.assertIsNotNone(session.id)
        self.assertEqual(session.executor_user, self.other_user)
    
    def test_inactive_permission_does_not_grant_access(self):
        """Test that inactive permissions don't grant access."""
        # Create inactive permission
        WorkspacePermission.objects.create(
            workspace_instance=self.workspace,
            user=self.other_user,
            permission_type='executor',
            granted_by=self.creator_user,
            is_active=False
        )
        
        # other_user should NOT have executor permission
        self.assertFalse(
            self.workspace.has_permission(self.other_user, 'executor')
        )
    
    def test_subject_user_has_no_implicit_permissions(self):
        """Test that subject_user does not have implicit permissions."""
        # Subject user is not the creator, so no implicit permissions
        self.assertFalse(
            self.workspace.has_permission(self.subject_user, 'executor')
        )
        self.assertFalse(
            self.workspace.has_permission(self.subject_user, 'admin')
        )
