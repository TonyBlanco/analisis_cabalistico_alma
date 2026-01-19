"""
Tests for editable artifacts via SessionService.record_progress(generate_artifact).

Scope:
- notes artifact (upsert by artifact_type)
- phase:<name> artifacts (upsert by artifact_type)
"""

from django.test import TestCase
from django.contrib.auth import get_user_model

from swm.mcmi4.models import WorkspaceDefinition, WorkspaceInstance, WorkspaceSession, WorkspacePermission, WorkspaceArtifact
from swm.mcmi4.services.session_service import SessionService

User = get_user_model()


class EditableArtifactsTestCase(TestCase):
    def setUp(self):
        self.creator_user = User.objects.create_user(username='creator_artifacts', password='testpass123')
        self.subject_user = User.objects.create_user(username='subject_artifacts', password='testpass123')
        self.executor_user = User.objects.create_user(username='executor_artifacts', password='testpass123')

        self.workspace_def = WorkspaceDefinition.objects.create(
            code='MCMI4_MYSTIC',
            name='MCMI-4 Místico',
            version='1.0',
            is_active=True,
        )

        self.workspace = WorkspaceInstance.objects.create(
            workspace_definition=self.workspace_def,
            creator_user=self.creator_user,
            subject_user=self.subject_user,
            status='in_progress',
            mcmi4_source_data_id='1',
        )

        WorkspacePermission.objects.create(
            workspace_instance=self.workspace,
            user=self.executor_user,
            permission_type='executor',
            granted_by=self.creator_user,
        )

        self.session = WorkspaceSession.objects.create(
            workspace_instance=self.workspace,
            executor_user=self.executor_user,
            current_phase='discovery',
            session_state={},
            is_active=True,
        )

    def test_notes_upsert_keeps_single_row(self):
        first = SessionService.record_progress(
            session=self.session,
            user=self.executor_user,
            action='generate_artifact',
            payload={'artifact_type': 'notes', 'content': {'text': 'a'}},
        )
        self.assertIsNotNone(first.get('artifact_created'))
        self.assertEqual(
            WorkspaceArtifact.objects.filter(workspace_instance=self.workspace, artifact_type='notes').count(),
            1,
        )

        second = SessionService.record_progress(
            session=self.session,
            user=self.executor_user,
            action='generate_artifact',
            payload={'artifact_type': 'notes', 'content': {'text': 'b'}},
        )
        self.assertEqual(first['artifact_created'], second['artifact_created'])

        row = WorkspaceArtifact.objects.filter(workspace_instance=self.workspace, artifact_type='notes').first()
        self.assertEqual(row.content.get('text'), 'b')

    def test_phase_artifact_upsert(self):
        SessionService.record_progress(
            session=self.session,
            user=self.executor_user,
            action='generate_artifact',
            payload={'artifact_type': 'phase:discovery', 'content': {'text': 'd1'}},
        )
        SessionService.record_progress(
            session=self.session,
            user=self.executor_user,
            action='generate_artifact',
            payload={'artifact_type': 'phase:discovery', 'content': {'text': 'd2'}},
        )

        self.assertEqual(
            WorkspaceArtifact.objects.filter(workspace_instance=self.workspace, artifact_type='phase:discovery').count(),
            1,
        )
        row = WorkspaceArtifact.objects.filter(workspace_instance=self.workspace, artifact_type='phase:discovery').first()
        self.assertEqual(row.content.get('text'), 'd2')

    def test_phase_name_validation(self):
        with self.assertRaises(ValueError):
            SessionService.record_progress(
                session=self.session,
                user=self.executor_user,
                action='generate_artifact',
                payload={'artifact_type': 'phase:not-allowed', 'content': {'text': 'x'}},
            )

