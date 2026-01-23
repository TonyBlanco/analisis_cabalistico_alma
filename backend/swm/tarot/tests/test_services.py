"""
Service Tests for SWM Tarot Evolutivo.

Tests the business logic services for workspace management,
session handling, and audit logging.
"""

from django.test import TestCase
from django.core.exceptions import ValidationError, PermissionDenied
from django.contrib.auth import get_user_model

from swm.tarot.models import (
    WorkspaceDefinition,
    WorkspaceInstance,
    WorkspaceSession,
    WorkspaceArtifact,
    WorkspacePermission,
    WorkspaceStatus,
    SpreadType,
    TarotSystem,
    ArtifactType,
    PermissionLevel,
)
from swm.tarot.services.workspace_service import WorkspaceService
from swm.tarot.services.session_service import SessionService
from swm.tarot.services.audit_service import AuditService

User = get_user_model()


class WorkspaceServiceTestCase(TestCase):
    """Tests for WorkspaceService."""
    
    def setUp(self):
        """Set up test data."""
        self.definition = WorkspaceDefinition.objects.create(
            code='TAROT_EVOLUTIVO',
            name='Tarot Evolutivo',
            is_active=True
        )
        self.therapist = User.objects.create_user(
            username='ws_therapist',
            email='ws_therapist@test.com',
            password='testpass123'
        )
        self.patient = User.objects.create_user(
            username='ws_patient',
            email='ws_patient@test.com',
            password='testpass123'
        )
        self.reviewer = User.objects.create_user(
            username='ws_reviewer',
            email='ws_reviewer@test.com',
            password='testpass123'
        )
    
    def test_get_definition(self):
        """Test getting the workspace definition."""
        definition = WorkspaceService.get_definition()
        self.assertEqual(definition.code, 'TAROT_EVOLUTIVO')
    
    def test_create_workspace(self):
        """Test creating a workspace."""
        instance = WorkspaceService.create_workspace(
            creator_user=self.therapist,
            subject_user=self.patient,
            spread_type=SpreadType.TREE_OF_LIFE,
            tarot_system=TarotSystem.THOTH
        )
        
        self.assertIsNotNone(instance.id)
        self.assertEqual(instance.status, WorkspaceStatus.CREATED)
        self.assertEqual(instance.spread_type, SpreadType.TREE_OF_LIFE)
        self.assertEqual(instance.tarot_system, TarotSystem.THOTH)
        
        # Check executor permission was created
        perm = WorkspacePermission.objects.filter(
            instance=instance,
            user=self.therapist,
            level=PermissionLevel.EXECUTOR
        ).first()
        self.assertIsNotNone(perm)
    
    def test_create_workspace_same_user_fails(self):
        """Test that creator cannot be subject."""
        with self.assertRaises(ValidationError):
            WorkspaceService.create_workspace(
                creator_user=self.therapist,
                subject_user=self.therapist
            )
    
    def test_create_duplicate_workspace_fails(self):
        """Test that duplicate active workspaces are rejected."""
        WorkspaceService.create_workspace(
            creator_user=self.therapist,
            subject_user=self.patient
        )
        
        with self.assertRaises(ValidationError):
            WorkspaceService.create_workspace(
                creator_user=self.therapist,
                subject_user=self.patient
            )
    
    def test_transition_status(self):
        """Test status transitions."""
        instance = WorkspaceService.create_workspace(
            creator_user=self.therapist,
            subject_user=self.patient
        )
        
        # Transition to in_progress
        instance = WorkspaceService.transition_status(
            instance=instance,
            new_status=WorkspaceStatus.IN_PROGRESS,
            user=self.therapist
        )
        self.assertEqual(instance.status, WorkspaceStatus.IN_PROGRESS)
        
        # Transition to sealed
        instance = WorkspaceService.transition_status(
            instance=instance,
            new_status=WorkspaceStatus.SEALED,
            user=self.therapist
        )
        self.assertEqual(instance.status, WorkspaceStatus.SEALED)
    
    def test_invalid_transition_fails(self):
        """Test that invalid transitions are rejected."""
        instance = WorkspaceService.create_workspace(
            creator_user=self.therapist,
            subject_user=self.patient
        )
        
        # Cannot go directly from created to sealed
        with self.assertRaises(ValidationError):
            WorkspaceService.transition_status(
                instance=instance,
                new_status=WorkspaceStatus.SEALED,
                user=self.therapist
            )
    
    def test_save_spread(self):
        """Test saving a spread."""
        instance = WorkspaceService.create_workspace(
            creator_user=self.therapist,
            subject_user=self.patient
        )
        
        # Must be in progress
        WorkspaceService.transition_status(
            instance=instance,
            new_status=WorkspaceStatus.IN_PROGRESS,
            user=self.therapist
        )
        
        cards = [
            {'position': 1, 'card_id': 'major_01', 'reversed': False},
            {'position': 2, 'card_id': 'major_02', 'reversed': True}
        ]
        
        artifact = WorkspaceService.save_spread(
            instance=instance,
            user=self.therapist,
            cards=cards,
            therapist_notes='Test notes'
        )
        
        self.assertIsNotNone(artifact.id)
        self.assertEqual(artifact.artifact_type, ArtifactType.SPREAD)
        self.assertEqual(len(artifact.content['cards']), 2)
    
    def test_check_permission(self):
        """Test permission checking."""
        instance = WorkspaceService.create_workspace(
            creator_user=self.therapist,
            subject_user=self.patient
        )
        
        # Creator has executor permission
        self.assertTrue(
            WorkspaceService.check_permission(
                instance, self.therapist, PermissionLevel.EXECUTOR
            )
        )
        
        # Patient has no permission
        self.assertFalse(
            WorkspaceService.check_permission(
                instance, self.patient, PermissionLevel.EXECUTOR
            )
        )


class SessionServiceTestCase(TestCase):
    """Tests for SessionService."""
    
    def setUp(self):
        """Set up test data."""
        self.definition = WorkspaceDefinition.objects.create(
            code='TAROT_EVOLUTIVO',
            name='Tarot Evolutivo',
            is_active=True
        )
        self.therapist = User.objects.create_user(
            username='session_therapist',
            email='session_therapist@test.com',
            password='testpass123'
        )
        self.patient = User.objects.create_user(
            username='session_patient',
            email='session_patient@test.com',
            password='testpass123'
        )
        self.instance = WorkspaceService.create_workspace(
            creator_user=self.therapist,
            subject_user=self.patient
        )
    
    def test_start_session(self):
        """Test starting a session."""
        session = SessionService.start_session(
            instance=self.instance,
            user=self.therapist
        )
        
        self.assertIsNotNone(session.id)
        self.assertTrue(session.is_active)
        
        # Instance should be in_progress
        self.instance.refresh_from_db()
        self.assertEqual(self.instance.status, WorkspaceStatus.IN_PROGRESS)
    
    def test_start_session_ends_previous(self):
        """Test that starting a new session ends the previous one."""
        session1 = SessionService.start_session(
            instance=self.instance,
            user=self.therapist
        )
        
        session2 = SessionService.start_session(
            instance=self.instance,
            user=self.therapist
        )
        
        session1.refresh_from_db()
        self.assertFalse(session1.is_active)
        self.assertTrue(session2.is_active)
    
    def test_end_session(self):
        """Test ending a session."""
        session = SessionService.start_session(
            instance=self.instance,
            user=self.therapist
        )
        
        session = SessionService.end_session(
            session=session,
            user=self.therapist
        )
        
        self.assertFalse(session.is_active)
        self.assertIsNotNone(session.ended_at)
    
    def test_get_active_session(self):
        """Test getting active session."""
        # No active session initially
        self.assertIsNone(SessionService.get_active_session(self.instance))
        
        # Start session
        SessionService.start_session(
            instance=self.instance,
            user=self.therapist
        )
        
        # Now there's an active session
        active = SessionService.get_active_session(self.instance)
        self.assertIsNotNone(active)
        self.assertTrue(active.is_active)


class AuditServiceTestCase(TestCase):
    """Tests for AuditService."""
    
    def setUp(self):
        """Set up test data."""
        self.definition = WorkspaceDefinition.objects.create(
            code='TAROT_EVOLUTIVO',
            name='Tarot Evolutivo',
            is_active=True
        )
        self.therapist = User.objects.create_user(
            username='audit_therapist',
            email='audit_therapist@test.com',
            password='testpass123'
        )
        self.patient = User.objects.create_user(
            username='audit_patient',
            email='audit_patient@test.com',
            password='testpass123'
        )
        self.instance = WorkspaceService.create_workspace(
            creator_user=self.therapist,
            subject_user=self.patient
        )
    
    def test_log_action(self):
        """Test logging an action."""
        log = AuditService.log_action(
            instance=self.instance,
            action='test_action',
            user=self.therapist,
            details={'test': True},
            ip_address='127.0.0.1'
        )
        
        self.assertIsNotNone(log.id)
        self.assertEqual(log.action, 'test_action')
        self.assertEqual(log.ip_address, '127.0.0.1')
    
    def test_get_audit_trail(self):
        """Test getting audit trail."""
        # Create some logs
        for i in range(5):
            AuditService.log_action(
                instance=self.instance,
                action=f'action_{i}',
                user=self.therapist
            )
        
        # Note: create_workspace already creates a log
        logs = AuditService.get_audit_trail(self.instance.id)
        
        # Should have 6 logs (1 from create + 5 new)
        self.assertEqual(len(logs), 6)
    
    def test_get_audit_trail_filtered(self):
        """Test getting filtered audit trail."""
        AuditService.log_action(
            instance=self.instance,
            action='specific_action',
            user=self.therapist
        )
        AuditService.log_action(
            instance=self.instance,
            action='other_action',
            user=self.therapist
        )
        
        logs = AuditService.get_audit_trail(
            self.instance.id,
            action_filter='specific_action'
        )
        
        self.assertEqual(len(logs), 1)
        self.assertEqual(logs[0].action, 'specific_action')
