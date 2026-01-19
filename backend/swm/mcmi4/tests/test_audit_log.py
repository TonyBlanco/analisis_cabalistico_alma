"""
Test WorkspaceAuditLog.

Coverage:
7. WorkspaceAuditLog
   - se crea al menos un evento al crear workspace
   - eventos no son mutables (inmutabilidad lógica)
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

from swm.mcmi4.models import (
    WorkspaceDefinition,
    WorkspaceInstance,
    WorkspaceAuditLog
)
from swm.mcmi4.services.workspace_service import WorkspaceService
from swm.mcmi4.services.audit_service import AuditService

User = get_user_model()


class AuditLogTestCase(TestCase):
    def setUp(self):
        self.creator_user = User.objects.create_user(
            username='creator_audit',
            password='testpass123',
        )
        self.subject_user = User.objects.create_user(
            username='subject_audit',
            password='testpass123',
        )
        
        self.workspace_def = WorkspaceDefinition.objects.create(
            code='MCMI4_MYSTIC',
            name='MCMI-4 Místico',
            version='1.0',
            is_active=True,
        )
    
    def test_audit_log_created_on_workspace_creation(self):
        """Test that at least one audit log is created when workspace is created."""
        workspace = WorkspaceService.create_workspace(
            creator_user=self.creator_user,
            subject_user=self.subject_user,
            mcmi4_source_data_id='audit-test-source'
        )
        
        # Check audit logs exist
        audit_logs = WorkspaceAuditLog.objects.filter(
            workspace_instance=workspace
        )
        
        self.assertGreater(audit_logs.count(), 0)
        
        # Verify workspace_created action exists
        created_log = audit_logs.filter(action='workspace_created').first()
        self.assertIsNotNone(created_log)
        self.assertEqual(created_log.user, self.creator_user)
        self.assertEqual(created_log.workspace_instance, workspace)
    
    def test_audit_log_contains_details(self):
        """Test that audit log contains relevant details."""
        workspace = WorkspaceService.create_workspace(
            creator_user=self.creator_user,
            subject_user=self.subject_user,
            mcmi4_source_data_id='audit-details-test'
        )
        
        audit_log = WorkspaceAuditLog.objects.filter(
            workspace_instance=workspace,
            action='workspace_created'
        ).first()
        
        self.assertIsNotNone(audit_log.details)
        self.assertIn('workspace_id', audit_log.details)
        self.assertIn('subject_user_id', audit_log.details)
        self.assertIn('mcmi4_source_data_id', audit_log.details)
    
    def test_audit_log_immutable_update_raises_error(self):
        """Test that updating an audit log raises ValidationError."""
        workspace = WorkspaceService.create_workspace(
            creator_user=self.creator_user,
            subject_user=self.subject_user,
            mcmi4_source_data_id='immutable-test'
        )
        
        audit_log = WorkspaceAuditLog.objects.filter(
            workspace_instance=workspace
        ).first()
        
        # Try to update audit log
        audit_log.action = 'modified_action'
        
        with self.assertRaises(ValidationError) as cm:
            audit_log.save()
        
        self.assertIn('immutable', str(cm.exception).lower())
    
    def test_audit_log_records_multiple_actions(self):
        """Test that multiple actions are recorded in audit log."""
        workspace = WorkspaceService.create_workspace(
            creator_user=self.creator_user,
            subject_user=self.subject_user,
            mcmi4_source_data_id='multi-action-test'
        )
        
        # Create additional audit log entry
        AuditService.log_action(
            workspace_instance=workspace,
            user=self.creator_user,
            action='custom_action',
            details={'custom': 'data'}
        )
        
        audit_logs = WorkspaceAuditLog.objects.filter(
            workspace_instance=workspace
        ).order_by('timestamp')
        
        self.assertGreaterEqual(audit_logs.count(), 2)
        
        actions = [log.action for log in audit_logs]
        self.assertIn('workspace_created', actions)
        self.assertIn('custom_action', actions)
    
    def test_audit_log_ordered_by_timestamp(self):
        """Test that audit logs are correctly ordered by timestamp."""
        workspace = WorkspaceService.create_workspace(
            creator_user=self.creator_user,
            subject_user=self.subject_user,
            mcmi4_source_data_id='ordering-test'
        )
        
        # Create multiple audit entries
        AuditService.log_action(
            workspace_instance=workspace,
            user=self.creator_user,
            action='action_1',
            details={}
        )
        AuditService.log_action(
            workspace_instance=workspace,
            user=self.creator_user,
            action='action_2',
            details={}
        )
        
        # Get audit trail
        audit_trail = AuditService.get_workspace_audit_trail(workspace)

        # Verify ordering (DESC by timestamp)
        self.assertGreaterEqual(len(audit_trail), 3)
        timestamps = [entry['timestamp'] for entry in audit_trail]
        # Ensure timestamps are non-increasing (most recent first)
        for i in range(len(timestamps) - 1):
            self.assertGreaterEqual(timestamps[i], timestamps[i + 1])
    
    def test_audit_log_with_ip_address(self):
        """Test that audit log can store IP address from request context."""
        workspace = WorkspaceInstance.objects.create(
            workspace_definition=self.workspace_def,
            subject_user=self.subject_user,
            creator_user=self.creator_user,
            mcmi4_source_data_id='ip-test'
        )
        
        # Create audit log with IP
        audit_log = AuditService.log_action(
            workspace_instance=workspace,
            user=self.creator_user,
            action='test_action',
            details={},
            request_context={'ip_address': '192.168.1.1'}
        )
        
        self.assertEqual(audit_log.ip_address, '192.168.1.1')
    
    def test_audit_log_without_session(self):
        """Test that audit log can be created without session."""
        workspace = WorkspaceInstance.objects.create(
            workspace_definition=self.workspace_def,
            subject_user=self.subject_user,
            creator_user=self.creator_user,
            mcmi4_source_data_id='no-session-test'
        )
        
        audit_log = AuditService.log_action(
            workspace_instance=workspace,
            user=self.creator_user,
            action='workspace_level_action',
            details={},
            session=None
        )
        
        self.assertIsNone(audit_log.session)
        self.assertEqual(audit_log.workspace_instance, workspace)
