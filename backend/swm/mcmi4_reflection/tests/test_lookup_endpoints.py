"""
Tests for lookup endpoints: by-signal and by-user.
"""

import pytest
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from api.mcmi4_signal_public_name import (
    MCMI4_SIGNAL_PUBLIC_DESCRIPTION,
    MCMI4_SIGNAL_PUBLIC_NAME,
)
from api.test_models import TestModule, TestResult
from swm.mcmi4_reflection.models import WorkspaceDefinition, WorkspaceInstance, WorkspaceArtifact

User = get_user_model()


class TestReflectionBySignalView(TestCase):
    """Test GET /api/swm/mcmi4-reflection/by-signal/{signal_id}"""
    
    def setUp(self):
        """Set up test data."""
        self.workspace_definition = WorkspaceDefinition.objects.create(
            code='MCMI4_REFLECTION',
            name='MCMI-4 Reflection',
            version='1.0',
            is_active=True
        )
        self.consultant_user = User.objects.create_user(
            username='consultant_test',
            password='testpass123'
        )
        self.test_module = TestModule.objects.create(
            code='mcmi4-signal',
            name=MCMI4_SIGNAL_PUBLIC_NAME,
            public_name=MCMI4_SIGNAL_PUBLIC_NAME,
            description=MCMI4_SIGNAL_PUBLIC_DESCRIPTION,
            test_type='personality'
        )
        self.signal_result = TestResult.objects.create(
            user=self.consultant_user,
            test_module=self.test_module,
            result_data={'mean': 2.5, 'stdev': 0.8, 'total_items': 100}
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.consultant_user)
    
    def test_by_signal_returns_workspace(self):
        """Should return workspace when it exists."""
        workspace = WorkspaceInstance.objects.create(
            workspace_definition=self.workspace_definition,
            consultant_user=self.consultant_user,
            linked_test_result_id=str(self.signal_result.id),
            status='draft'
        )
        artifact = WorkspaceArtifact.objects.create(
            workspace_instance=workspace,
            created_by=self.consultant_user,
            content={
                'schema_version': 'mcmi4-reflection:v1',
                'linked_test_result_id': str(self.signal_result.id),
                'answers': {'q1': 'Test answer'},
                'status': 'draft'
            }
        )
        
        response = self.client.get(f'/api/swm/mcmi4-reflection/by-signal/{self.signal_result.id}')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['workspace_id'], str(workspace.id))
        self.assertEqual(response.data['status'], 'draft')
    
    def test_by_signal_404_when_missing(self):
        """Should return 404 when no workspace exists for signal."""
        response = self.client.get('/api/swm/mcmi4-reflection/by-signal/99999')
        
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.data)


class TestReflectionByUserView(TestCase):
    """Test GET /api/swm/mcmi4-reflection/by-user/{user_id}"""
    
    def setUp(self):
        """Set up test data."""
        self.workspace_definition = WorkspaceDefinition.objects.create(
            code='MCMI4_REFLECTION',
            name='MCMI-4 Reflection',
            version='1.0',
            is_active=True
        )
        self.consultant_user = User.objects.create_user(
            username='consultant_test',
            password='testpass123'
        )
        self.test_module = TestModule.objects.create(
            code='mcmi4-signal',
            name=MCMI4_SIGNAL_PUBLIC_NAME,
            public_name=MCMI4_SIGNAL_PUBLIC_NAME,
            description=MCMI4_SIGNAL_PUBLIC_DESCRIPTION,
            test_type='personality'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.consultant_user)
    
    def test_by_user_prefers_sealed_over_draft(self):
        """Should return sealed workspace when both exist."""
        # Create draft workspace
        signal_draft = TestResult.objects.create(
            user=self.consultant_user,
            test_module=self.test_module,
            result_data={}
        )
        draft_ws = WorkspaceInstance.objects.create(
            workspace_definition=self.workspace_definition,
            consultant_user=self.consultant_user,
            linked_test_result_id=str(signal_draft.id),
            status='draft'
        )
        WorkspaceArtifact.objects.create(
            workspace_instance=draft_ws,
            created_by=self.consultant_user,
            content={
                'schema_version': 'mcmi4-reflection:v1',
                'linked_test_result_id': str(signal_draft.id),
                'answers': {},
                'status': 'draft'
            }
        )
        
        # Create sealed workspace (should be preferred)
        signal_sealed = TestResult.objects.create(
            user=self.consultant_user,
            test_module=self.test_module,
            result_data={'mean': 2.5}
        )
        sealed_ws = WorkspaceInstance.objects.create(
            workspace_definition=self.workspace_definition,
            consultant_user=self.consultant_user,
            linked_test_result_id=str(signal_sealed.id),
            status='sealed'
        )
        WorkspaceArtifact.objects.create(
            workspace_instance=sealed_ws,
            created_by=self.consultant_user,
            content={
                'schema_version': 'mcmi4-reflection:v1',
                'linked_test_result_id': str(signal_sealed.id),
                'answers': {'q1': 'Sealed answer'},
                'status': 'sealed'
            },
            is_sealed=True
        )
        
        response = self.client.get(f'/api/swm/mcmi4-reflection/by-user/{self.consultant_user.id}')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['workspace_id'], str(sealed_ws.id))
        self.assertEqual(response.data['status'], 'sealed')
    
    def test_by_user_returns_draft_when_no_sealed(self):
        """Should return draft when no sealed exists."""
        signal_result = TestResult.objects.create(
            user=self.consultant_user,
            test_module=self.test_module,
            result_data={}
        )
        workspace = WorkspaceInstance.objects.create(
            workspace_definition=self.workspace_definition,
            consultant_user=self.consultant_user,
            linked_test_result_id=str(signal_result.id),
            status='draft'
        )
        WorkspaceArtifact.objects.create(
            workspace_instance=workspace,
            created_by=self.consultant_user,
            content={
                'schema_version': 'mcmi4-reflection:v1',
                'linked_test_result_id': str(signal_result.id),
                'answers': {},
                'status': 'draft'
            }
        )
        
        response = self.client.get(f'/api/swm/mcmi4-reflection/by-user/{self.consultant_user.id}')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['workspace_id'], str(workspace.id))
        self.assertEqual(response.data['status'], 'draft')
    
    def test_by_user_404_when_none(self):
        """Should return 404 when user has no reflections."""
        response = self.client.get(f'/api/swm/mcmi4-reflection/by-user/{self.consultant_user.id}')
        
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.data)
