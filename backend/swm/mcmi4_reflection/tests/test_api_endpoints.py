"""
Test API endpoints for MCMI-4 Reflection.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from api.test_models import TestModule, TestResult
from swm.mcmi4_reflection.models import WorkspaceDefinition

User = get_user_model()


class ReflectionAPITestCase(TestCase):
    def setUp(self):
        self.consultant_user = User.objects.create_user(
            username='consultant_api',
            password='testpass123',
        )
        self.other_user = User.objects.create_user(
            username='other_api',
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
            name='MCMI-4 SIGNAL',
            public_name='MCMI-4 SIGNAL',
            description='Signal module',
            test_type='holistic_screening',
            domain=TestModule.Domain.TECHNICAL,
            is_active=True,
        )
        
        self.test_result = TestResult.objects.create(
            user=self.consultant_user,
            test_module=self.signal_module,
            input_data={'test': 'data'}
        )
        
        self.client = APIClient()
        self.client.force_authenticate(user=self.consultant_user)
    
    def test_create_reflection_api(self):
        """Test POST /api/swm/mcmi4-reflection/create."""
        resp = self.client.post(
            '/api/swm/mcmi4-reflection/create',
            {
                'linked_test_result_id': str(self.test_result.id),
                'initial_answers': {'q1': 'Initial answer'}
            },
            format='json'
        )
        
        self.assertEqual(resp.status_code, 201)
        self.assertIn('workspace_id', resp.data)
        self.assertEqual(resp.data['status'], 'draft')
    
    def test_get_reflection_api(self):
        """Test GET /api/swm/mcmi4-reflection/{workspace_id}."""
        # Create workspace
        create_resp = self.client.post(
            '/api/swm/mcmi4-reflection/create',
            {'linked_test_result_id': str(self.test_result.id)},
            format='json'
        )
        workspace_id = create_resp.data['workspace_id']
        
        # Get workspace
        get_resp = self.client.get(f'/api/swm/mcmi4-reflection/{workspace_id}')
        
        self.assertEqual(get_resp.status_code, 200)
        self.assertEqual(get_resp.data['workspace_id'], workspace_id)
        self.assertEqual(get_resp.data['status'], 'draft')
        self.assertTrue(get_resp.data['can_edit'])
    
    def test_update_reflection_api(self):
        """Test PATCH /api/swm/mcmi4-reflection/{workspace_id}."""
        # Create workspace
        create_resp = self.client.post(
            '/api/swm/mcmi4-reflection/create',
            {'linked_test_result_id': str(self.test_result.id)},
            format='json'
        )
        workspace_id = create_resp.data['workspace_id']
        
        # Update reflection
        update_resp = self.client.patch(
            f'/api/swm/mcmi4-reflection/{workspace_id}',
            {'answers': {'q1': 'Updated answer', 'q2': 'Second answer'}},
            format='json'
        )
        
        self.assertEqual(update_resp.status_code, 200)
        self.assertIn('artifact_id', update_resp.data)
    
    def test_seal_reflection_api(self):
        """Test POST /api/swm/mcmi4-reflection/{workspace_id}/seal."""
        # Create workspace
        create_resp = self.client.post(
            '/api/swm/mcmi4-reflection/create',
            {'linked_test_result_id': str(self.test_result.id)},
            format='json'
        )
        workspace_id = create_resp.data['workspace_id']
        
        # Seal workspace
        seal_resp = self.client.post(
            f'/api/swm/mcmi4-reflection/{workspace_id}/seal'
        )
        
        self.assertEqual(seal_resp.status_code, 200)
        self.assertEqual(seal_resp.data['status'], 'sealed')
        self.assertIsNotNone(seal_resp.data['sealed_at'])
    
    def test_update_sealed_reflection_fails(self):
        """Test that updating sealed reflection fails."""
        # Create and seal
        create_resp = self.client.post(
            '/api/swm/mcmi4-reflection/create',
            {'linked_test_result_id': str(self.test_result.id)},
            format='json'
        )
        workspace_id = create_resp.data['workspace_id']
        
        self.client.post(f'/api/swm/mcmi4-reflection/{workspace_id}/seal')
        
        # Try to update
        update_resp = self.client.patch(
            f'/api/swm/mcmi4-reflection/{workspace_id}',
            {'answers': {'q1': 'Should fail'}},
            format='json'
        )
        
        self.assertEqual(update_resp.status_code, 422)
        self.assertIn('sealed', update_resp.data['error'].lower())
