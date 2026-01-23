"""
API Tests for SWM Tarot Evolutivo.

Tests the REST API endpoints for workspace management.
"""

import uuid
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status as http_status
from django.contrib.auth import get_user_model

from swm.tarot.models import (
    WorkspaceDefinition,
    WorkspaceInstance,
    WorkspaceStatus,
    SpreadType,
    TarotSystem,
)
from swm.tarot.services.workspace_service import WorkspaceService

User = get_user_model()


class TarotAPITestCase(TestCase):
    """Base test case with common setup."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        
        # Create or get definition
        self.definition, _ = WorkspaceDefinition.objects.get_or_create(
            code='TAROT_EVOLUTIVO',
            defaults={
                'name': 'Tarot Evolutivo',
                'is_active': True
            }
        )
        
        # Create users
        self.therapist = User.objects.create_user(
            username='api_therapist',
            email='api_therapist@test.com',
            password='testpass123'
        )
        self.patient = User.objects.create_user(
            username='api_patient',
            email='api_patient@test.com',
            password='testpass123'
        )
        
        # Authenticate
        self.client.force_authenticate(user=self.therapist)


class WorkspaceDefinitionAPITest(TarotAPITestCase):
    """Tests for /api/swm/tarot/definition endpoint."""
    
    def test_get_definition(self):
        """Test getting workspace definition."""
        response = self.client.get('/api/swm/tarot/definition')
        
        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        self.assertEqual(response.data['code'], 'TAROT_EVOLUTIVO')
    
    def test_get_definition_unauthenticated(self):
        """Test that unauthenticated requests are rejected."""
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/swm/tarot/definition')
        
        self.assertEqual(response.status_code, http_status.HTTP_401_UNAUTHORIZED)


class CreateWorkspaceAPITest(TarotAPITestCase):
    """Tests for /api/swm/tarot/create endpoint."""
    
    def test_create_workspace(self):
        """Test creating a workspace."""
        response = self.client.post('/api/swm/tarot/create', {
            'subject_user_id': self.patient.id,
            'spread_type': 'tree_of_life',
            'tarot_system': 'thoth'
        }, format='json')
        
        if response.status_code != http_status.HTTP_201_CREATED:
            print(f"Response data: {response.data}")
        
        self.assertEqual(response.status_code, http_status.HTTP_201_CREATED)
        self.assertEqual(response.data['spread_type'], 'tree_of_life')
        self.assertEqual(response.data['tarot_system'], 'thoth')
    
    def test_create_workspace_defaults(self):
        """Test creating with default values."""
        response = self.client.post('/api/swm/tarot/create', {
            'subject_user_id': self.patient.id
        }, format='json')
        
        self.assertEqual(response.status_code, http_status.HTTP_201_CREATED)
        self.assertEqual(response.data['spread_type'], 'free')
        self.assertEqual(response.data['tarot_system'], 'rider-waite')
    
    def test_create_workspace_invalid_user(self):
        """Test creating with invalid user ID."""
        response = self.client.post('/api/swm/tarot/create', {
            'subject_user_id': 999999
        }, format='json')
        
        self.assertEqual(response.status_code, http_status.HTTP_400_BAD_REQUEST)


class ListWorkspacesAPITest(TarotAPITestCase):
    """Tests for /api/swm/tarot/list endpoint."""
    
    def test_list_empty(self):
        """Test listing when no workspaces exist."""
        response = self.client.get('/api/swm/tarot/list')
        
        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)
    
    def test_list_workspaces(self):
        """Test listing workspaces."""
        # Create some workspaces
        WorkspaceService.create_workspace(
            creator_user=self.therapist,
            subject_user=self.patient
        )
        
        response = self.client.get('/api/swm/tarot/list')
        
        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
    
    def test_list_filtered_by_status(self):
        """Test filtering by status."""
        instance = WorkspaceService.create_workspace(
            creator_user=self.therapist,
            subject_user=self.patient
        )
        
        response = self.client.get('/api/swm/tarot/list?status=created')
        self.assertEqual(response.data['count'], 1)
        
        response = self.client.get('/api/swm/tarot/list?status=sealed')
        self.assertEqual(response.data['count'], 0)


class StartSessionAPITest(TarotAPITestCase):
    """Tests for /api/swm/tarot/start endpoint."""
    
    def test_start_session(self):
        """Test starting a session."""
        instance = WorkspaceService.create_workspace(
            creator_user=self.therapist,
            subject_user=self.patient
        )
        
        response = self.client.post('/api/swm/tarot/start', {
            'instance_id': str(instance.id)
        }, format='json')
        
        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        self.assertIn('session', response.data)
        self.assertTrue(response.data['session']['is_active'])
    
    def test_start_session_unauthorized(self):
        """Test starting session without permission."""
        instance = WorkspaceService.create_workspace(
            creator_user=self.therapist,
            subject_user=self.patient
        )
        
        # Switch to patient user
        self.client.force_authenticate(user=self.patient)
        
        response = self.client.post('/api/swm/tarot/start', {
            'instance_id': str(instance.id)
        }, format='json')
        
        self.assertEqual(response.status_code, http_status.HTTP_403_FORBIDDEN)


class SaveSpreadAPITest(TarotAPITestCase):
    """Tests for /api/swm/tarot/save-spread endpoint."""
    
    def test_save_spread(self):
        """Test saving a spread."""
        instance = WorkspaceService.create_workspace(
            creator_user=self.therapist,
            subject_user=self.patient
        )
        
        # Start session first
        self.client.post('/api/swm/tarot/start', {
            'instance_id': str(instance.id)
        }, format='json')
        
        response = self.client.post('/api/swm/tarot/save-spread', {
            'instance_id': str(instance.id),
            'cards': [
                {'position': 1, 'card_id': 'major_01', 'reversed': False},
                {'position': 2, 'card_id': 'major_02', 'reversed': True}
            ],
            'therapist_notes': 'Test session'
        }, format='json')
        
        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        self.assertIn('artifact', response.data)
    
    def test_save_spread_invalid_cards(self):
        """Test saving with invalid card data."""
        instance = WorkspaceService.create_workspace(
            creator_user=self.therapist,
            subject_user=self.patient
        )
        
        self.client.post('/api/swm/tarot/start', {
            'instance_id': str(instance.id)
        }, format='json')
        
        # Missing card_id
        response = self.client.post('/api/swm/tarot/save-spread', {
            'instance_id': str(instance.id),
            'cards': [
                {'position': 1}
            ]
        }, format='json')
        
        self.assertEqual(response.status_code, http_status.HTTP_400_BAD_REQUEST)


class SealWorkspaceAPITest(TarotAPITestCase):
    """Tests for /api/swm/tarot/seal endpoint."""
    
    def test_seal_workspace(self):
        """Test sealing a workspace."""
        instance = WorkspaceService.create_workspace(
            creator_user=self.therapist,
            subject_user=self.patient
        )
        
        # Start session
        self.client.post('/api/swm/tarot/start', {
            'instance_id': str(instance.id)
        }, format='json')
        
        # Seal
        response = self.client.post('/api/swm/tarot/seal', {
            'instance_id': str(instance.id)
        }, format='json')
        
        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        self.assertEqual(response.data['instance']['status'], 'sealed')
    
    def test_seal_not_in_progress(self):
        """Test sealing workspace not in progress."""
        instance = WorkspaceService.create_workspace(
            creator_user=self.therapist,
            subject_user=self.patient
        )
        
        # Try to seal without starting
        response = self.client.post('/api/swm/tarot/seal', {
            'instance_id': str(instance.id)
        }, format='json')
        
        self.assertEqual(response.status_code, http_status.HTTP_400_BAD_REQUEST)


class AuditTrailAPITest(TarotAPITestCase):
    """Tests for /api/swm/tarot/audit endpoint."""
    
    def test_get_audit_trail(self):
        """Test getting audit trail."""
        instance = WorkspaceService.create_workspace(
            creator_user=self.therapist,
            subject_user=self.patient
        )
        
        response = self.client.get(f'/api/swm/tarot/audit?instance_id={instance.id}')
        
        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        self.assertGreater(response.data['count'], 0)
    
    def test_get_audit_trail_missing_id(self):
        """Test getting audit without instance_id."""
        response = self.client.get('/api/swm/tarot/audit')
        
        self.assertEqual(response.status_code, http_status.HTTP_400_BAD_REQUEST)
