"""
Model Tests for SWM Tarot Evolutivo.

Tests the Django models for workspace definition, instances,
sessions, artifacts, permissions, and audit logs.
"""

import uuid
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

from swm.tarot.models import (
    WorkspaceDefinition,
    WorkspaceInstance,
    WorkspaceSession,
    WorkspaceArtifact,
    WorkspacePermission,
    WorkspaceAuditLog,
    SpreadType,
    TarotSystem,
    WorkspaceStatus,
    ArtifactType,
    PermissionLevel,
    SessionPhase,
)

User = get_user_model()


class WorkspaceDefinitionTestCase(TestCase):
    """Tests for WorkspaceDefinition model."""
    
    def test_create_definition(self):
        """Test creating a workspace definition."""
        definition = WorkspaceDefinition.objects.create(
            code='TEST_TAROT',
            name='Test Tarot Workspace',
            description='A test workspace definition',
            version='1.0.0',
            config_schema={'test': True}
        )
        
        self.assertIsNotNone(definition.id)
        self.assertEqual(definition.code, 'TEST_TAROT')
        self.assertTrue(definition.is_active)
    
    def test_definition_code_unique(self):
        """Test that definition codes must be unique."""
        WorkspaceDefinition.objects.create(
            code='UNIQUE_CODE',
            name='First Definition'
        )
        
        with self.assertRaises(Exception):  # IntegrityError
            WorkspaceDefinition.objects.create(
                code='UNIQUE_CODE',
                name='Second Definition'
            )
    
    def test_definition_str(self):
        """Test string representation."""
        definition = WorkspaceDefinition.objects.create(
            code='STR_TEST',
            name='String Test',
            version='2.0.0'
        )
        
        self.assertEqual(str(definition), 'STR_TEST v2.0.0')


class WorkspaceInstanceTestCase(TestCase):
    """Tests for WorkspaceInstance model."""
    
    def setUp(self):
        """Set up test data."""
        self.definition = WorkspaceDefinition.objects.create(
            code='TAROT_TEST',
            name='Test Tarot'
        )
        self.therapist = User.objects.create_user(
            username='therapist',
            email='therapist@test.com',
            password='testpass123'
        )
        self.patient = User.objects.create_user(
            username='patient',
            email='patient@test.com',
            password='testpass123'
        )
    
    def test_create_instance(self):
        """Test creating a workspace instance."""
        instance = WorkspaceInstance.objects.create(
            definition=self.definition,
            subject_user=self.patient,
            creator_user=self.therapist,
            spread_type=SpreadType.TREE_OF_LIFE,
            tarot_system=TarotSystem.RIDER_WAITE
        )
        
        self.assertIsNotNone(instance.id)
        self.assertEqual(instance.status, WorkspaceStatus.CREATED)
        self.assertEqual(instance.spread_type, SpreadType.TREE_OF_LIFE)
    
    def test_creator_cannot_be_subject(self):
        """Test that creator and subject must be different."""
        instance = WorkspaceInstance(
            definition=self.definition,
            subject_user=self.therapist,
            creator_user=self.therapist
        )
        
        with self.assertRaises(ValidationError):
            instance.clean()
    
    def test_default_values(self):
        """Test default values are set correctly."""
        instance = WorkspaceInstance.objects.create(
            definition=self.definition,
            subject_user=self.patient,
            creator_user=self.therapist
        )
        
        self.assertEqual(instance.spread_type, SpreadType.FREE)
        self.assertEqual(instance.tarot_system, TarotSystem.RIDER_WAITE)
        self.assertTrue(instance.has_reversed)
        self.assertEqual(instance.total_cards, 0)


class WorkspaceSessionTestCase(TestCase):
    """Tests for WorkspaceSession model."""
    
    def setUp(self):
        """Set up test data."""
        self.definition = WorkspaceDefinition.objects.create(
            code='SESSION_TEST',
            name='Session Test'
        )
        self.therapist = User.objects.create_user(
            username='therapist_session',
            email='therapist_session@test.com',
            password='testpass123'
        )
        self.patient = User.objects.create_user(
            username='patient_session',
            email='patient_session@test.com',
            password='testpass123'
        )
        self.instance = WorkspaceInstance.objects.create(
            definition=self.definition,
            subject_user=self.patient,
            creator_user=self.therapist
        )
    
    def test_create_session(self):
        """Test creating a workspace session."""
        session = WorkspaceSession.objects.create(
            instance=self.instance,
            user=self.therapist,
            phase=SessionPhase.SETUP
        )
        
        self.assertIsNotNone(session.id)
        self.assertTrue(session.is_active)
        self.assertEqual(session.phase, SessionPhase.SETUP)
    
    def test_session_phases(self):
        """Test session phase transitions."""
        session = WorkspaceSession.objects.create(
            instance=self.instance,
            user=self.therapist
        )
        
        # Update phase
        session.phase = SessionPhase.SELECTION
        session.save()
        
        session.refresh_from_db()
        self.assertEqual(session.phase, SessionPhase.SELECTION)


class WorkspaceArtifactTestCase(TestCase):
    """Tests for WorkspaceArtifact model."""
    
    def setUp(self):
        """Set up test data."""
        self.definition = WorkspaceDefinition.objects.create(
            code='ARTIFACT_TEST',
            name='Artifact Test'
        )
        self.therapist = User.objects.create_user(
            username='therapist_artifact',
            email='therapist_artifact@test.com',
            password='testpass123'
        )
        self.patient = User.objects.create_user(
            username='patient_artifact',
            email='patient_artifact@test.com',
            password='testpass123'
        )
        self.instance = WorkspaceInstance.objects.create(
            definition=self.definition,
            subject_user=self.patient,
            creator_user=self.therapist
        )
    
    def test_create_artifact(self):
        """Test creating a workspace artifact."""
        artifact = WorkspaceArtifact.objects.create(
            instance=self.instance,
            artifact_type=ArtifactType.SPREAD,
            content={'cards': [{'position': 1, 'card_id': 'major_01'}]},
            created_by=self.therapist
        )
        
        self.assertIsNotNone(artifact.id)
        self.assertFalse(artifact.is_sealed)
        self.assertEqual(artifact.version, 1)
    
    def test_sealed_artifact_immutable(self):
        """Test that sealed artifacts cannot be modified."""
        artifact = WorkspaceArtifact.objects.create(
            instance=self.instance,
            artifact_type=ArtifactType.SPREAD,
            content={'test': True},
            created_by=self.therapist,
            is_sealed=True
        )
        
        artifact.content = {'modified': True}
        
        with self.assertRaises(ValidationError):
            artifact.clean()


class WorkspaceAuditLogTestCase(TestCase):
    """Tests for WorkspaceAuditLog model."""
    
    def setUp(self):
        """Set up test data."""
        self.definition = WorkspaceDefinition.objects.create(
            code='AUDIT_TEST',
            name='Audit Test'
        )
        self.therapist = User.objects.create_user(
            username='therapist_audit',
            email='therapist_audit@test.com',
            password='testpass123'
        )
        self.patient = User.objects.create_user(
            username='patient_audit',
            email='patient_audit@test.com',
            password='testpass123'
        )
        self.instance = WorkspaceInstance.objects.create(
            definition=self.definition,
            subject_user=self.patient,
            creator_user=self.therapist
        )
    
    def test_create_audit_log(self):
        """Test creating an audit log entry."""
        log = WorkspaceAuditLog.objects.create(
            instance=self.instance,
            action='test_action',
            user=self.therapist,
            details={'test': True}
        )
        
        self.assertIsNotNone(log.id)
        self.assertIsNotNone(log.timestamp)
    
    def test_audit_log_immutable(self):
        """Test that audit logs cannot be modified."""
        log = WorkspaceAuditLog.objects.create(
            instance=self.instance,
            action='immutable_test',
            user=self.therapist
        )
        
        log.action = 'modified_action'
        
        with self.assertRaises(ValidationError):
            log.save()
    
    def test_audit_log_cannot_delete(self):
        """Test that audit logs cannot be deleted."""
        log = WorkspaceAuditLog.objects.create(
            instance=self.instance,
            action='delete_test',
            user=self.therapist
        )
        
        with self.assertRaises(ValidationError):
            log.delete()
