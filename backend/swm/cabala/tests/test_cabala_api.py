"""
Tests for Cábala Aplicada SWM API endpoints.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
import uuid

from swm.cabala.models import (
    CabalaSession,
    SefirahObservation,
    PathObservation,
    CabalaSessionSnapshot,
)
from swm.cabala.services.tree_calculator import TreeCalculator

User = get_user_model()


class CabalaSessionAPITest(TestCase):
    """Test cases for CabalaSession API endpoints."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Create test users
        self.therapist = User.objects.create_user(
            username='test_therapist',
            email='therapist@test.com',
            password='testpass123'
        )
        self.patient = User.objects.create_user(
            username='test_patient',
            email='patient@test.com',
            password='testpass123'
        )
        
        # Add therapist to therapist group
        from django.contrib.auth.models import Group
        therapist_group, _ = Group.objects.get_or_create(name='therapist')
        self.therapist.groups.add(therapist_group)
        
        # Create API client
        self.client = APIClient()
    
    def test_create_session_as_therapist(self):
        """Test that a therapist can create a Cábala session."""
        self.client.force_authenticate(user=self.therapist)
        
        data = {
            'patient': self.patient.id,
            'title': 'Test Session',
            'method_id': 'libre',
        }
        
        response = self.client.post('/api/swm/cabala/sessions/create/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Test Session')
        self.assertEqual(response.data['status'], 'created')
    
    def test_create_session_as_patient_fails(self):
        """Test that a patient cannot create a Cábala session."""
        self.client.force_authenticate(user=self.patient)
        
        data = {
            'patient': self.patient.id,
            'title': 'Test Session',
            'method_id': 'libre',
        }
        
        response = self.client.post('/api/swm/cabala/sessions/create/', data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_list_sessions(self):
        """Test listing sessions for a therapist."""
        self.client.force_authenticate(user=self.therapist)
        
        # Create a session
        session = CabalaSession.objects.create(
            patient=self.patient,
            therapist=self.therapist,
            title='Test Session',
            method_id='libre'
        )
        
        response = self.client.get('/api/swm/cabala/sessions/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Session')
    
    def test_get_session_detail(self):
        """Test getting session details."""
        self.client.force_authenticate(user=self.therapist)
        
        session = CabalaSession.objects.create(
            patient=self.patient,
            therapist=self.therapist,
            title='Detail Test',
            method_id='numerologia'
        )
        
        response = self.client.get(f'/api/swm/cabala/sessions/{session.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Detail Test')
        self.assertEqual(response.data['method_id'], 'numerologia')
    
    def test_start_session(self):
        """Test starting a session."""
        self.client.force_authenticate(user=self.therapist)
        
        session = CabalaSession.objects.create(
            patient=self.patient,
            therapist=self.therapist,
            title='Start Test'
        )
        
        response = self.client.post(f'/api/swm/cabala/sessions/{session.id}/start/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'in_progress')
        self.assertIsNotNone(response.data['started_at'])
    
    def test_close_session(self):
        """Test closing a session."""
        self.client.force_authenticate(user=self.therapist)
        
        session = CabalaSession.objects.create(
            patient=self.patient,
            therapist=self.therapist,
            title='Close Test',
            status='in_progress'
        )
        
        response = self.client.post(f'/api/swm/cabala/sessions/{session.id}/close/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'closed')


class SefirahObservationAPITest(TestCase):
    """Test cases for SefirahObservation API endpoints."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.therapist = User.objects.create_user(
            username='test_therapist',
            email='therapist@test.com',
            password='testpass123'
        )
        self.patient = User.objects.create_user(
            username='test_patient',
            email='patient@test.com',
            password='testpass123'
        )
        
        from django.contrib.auth.models import Group
        therapist_group, _ = Group.objects.get_or_create(name='therapist')
        self.therapist.groups.add(therapist_group)
        
        self.session = CabalaSession.objects.create(
            patient=self.patient,
            therapist=self.therapist,
            title='Observation Test'
        )
        
        self.client = APIClient()
    
    def test_create_sefirah_observation(self):
        """Test creating a sefirah observation."""
        self.client.force_authenticate(user=self.therapist)
        
        data = {
            'session_id': str(self.session.id),
            'sefirah_name': 'tiferet',
            'observation': 'Centro del corazón activo',
            'intensity': 7,
            'emotion_type': 'peace',
        }
        
        response = self.client.post('/api/swm/cabala/sefirot/observe/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['sefirah_name'], 'tiferet')
        self.assertEqual(response.data['intensity'], 7)
    
    def test_update_sefirah_observation(self):
        """Test updating an existing sefirah observation (upsert)."""
        self.client.force_authenticate(user=self.therapist)
        
        # Create first observation
        SefirahObservation.objects.create(
            session=self.session,
            sefirah_name='chesed',
            observation='Initial',
            intensity=3
        )
        
        # Update via upsert
        data = {
            'session_id': str(self.session.id),
            'sefirah_name': 'chesed',
            'observation': 'Updated observation',
            'intensity': 8,
            'emotion_type': 'love',
        }
        
        response = self.client.post('/api/swm/cabala/sefirot/observe/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['observation'], 'Updated observation')
        self.assertEqual(response.data['intensity'], 8)
        
        # Verify only one observation exists
        count = SefirahObservation.objects.filter(
            session=self.session,
            sefirah_name='chesed'
        ).count()
        self.assertEqual(count, 1)
    
    def test_list_sefirah_observations(self):
        """Test listing sefirah observations for a session."""
        self.client.force_authenticate(user=self.therapist)
        
        SefirahObservation.objects.create(
            session=self.session,
            sefirah_name='keter',
            observation='Test 1',
            intensity=5
        )
        SefirahObservation.objects.create(
            session=self.session,
            sefirah_name='malkhut',
            observation='Test 2',
            intensity=6
        )
        
        response = self.client.get(f'/api/swm/cabala/sefirot/{self.session.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)


class TreeCalculatorTest(TestCase):
    """Test cases for TreeCalculator service."""
    
    def test_get_initial_state(self):
        """Test generating initial tree state."""
        state = TreeCalculator.get_initial_state()
        
        self.assertIn('sefirot_states', state)
        self.assertIn('path_states', state)
        self.assertEqual(len(state['sefirot_states']), 11)  # 10 sefirot + Da'at
        self.assertEqual(len(state['path_states']), 22)
    
    def test_calculate_pillar_balance(self):
        """Test pillar balance calculation."""
        sefirot_states = {
            'chesed': {'intensity': 8, 'is_blocked': False, 'is_activated': True},
            'gevurah': {'intensity': 3, 'is_blocked': False, 'is_activated': False},
            'tiferet': {'intensity': 5, 'is_blocked': False, 'is_activated': True},
        }
        
        balance = TreeCalculator.calculate_pillar_balance(sefirot_states)
        
        self.assertIn('right', balance)
        self.assertIn('left', balance)
        self.assertIn('middle', balance)
        self.assertIn('overall_balance', balance)
    
    def test_get_sefirah_info(self):
        """Test getting sefirah information."""
        info = TreeCalculator.get_sefirah_info('tiferet')
        
        self.assertIsNotNone(info)
        self.assertEqual(info['name'], 'Tiferet')
        self.assertEqual(info['translation'], 'Belleza')
        self.assertEqual(info['pillar'], 'middle')
    
    def test_get_paths_for_sefirah(self):
        """Test getting paths connected to a sefirah."""
        paths = TreeCalculator.get_paths_for_sefirah('tiferet')
        
        # Tiferet is connected to many paths
        self.assertGreater(len(paths), 0)
    
    def test_map_emotion_to_sefirah(self):
        """Test emotion to sefirah mapping."""
        sefirot = TreeCalculator.map_emotion_to_sefirah('joy')
        
        self.assertIn('chesed', sefirot)
        self.assertIn('tiferet', sefirot)
    
    def test_get_tarot_correspondence(self):
        """Test getting Tarot correspondence for a path."""
        tarot = TreeCalculator.get_tarot_correspondence(0)  # Aleph path
        
        self.assertEqual(tarot, 'The Fool')


class TreeStateAPITest(TestCase):
    """Test cases for tree state API endpoints."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.therapist = User.objects.create_user(
            username='test_therapist',
            email='therapist@test.com',
            password='testpass123'
        )
        self.patient = User.objects.create_user(
            username='test_patient',
            email='patient@test.com',
            password='testpass123'
        )
        
        from django.contrib.auth.models import Group
        therapist_group, _ = Group.objects.get_or_create(name='therapist')
        self.therapist.groups.add(therapist_group)
        
        self.session = CabalaSession.objects.create(
            patient=self.patient,
            therapist=self.therapist,
            title='Tree State Test',
            tree_state={'initial': True}
        )
        
        self.client = APIClient()
    
    def test_get_tree_state(self):
        """Test getting tree state."""
        self.client.force_authenticate(user=self.therapist)
        
        response = self.client.get(f'/api/swm/cabala/sessions/{self.session.id}/tree-state/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['tree_state'], {'initial': True})
    
    def test_update_tree_state(self):
        """Test updating tree state."""
        self.client.force_authenticate(user=self.therapist)
        
        new_state = {
            'sefirot_states': {'keter': {'intensity': 5}},
            'path_states': {},
        }
        
        response = self.client.patch(
            f'/api/swm/cabala/sessions/{self.session.id}/tree-state/',
            {'tree_state': new_state},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['tree_state'], new_state)
    
    def test_update_tree_state_with_snapshot(self):
        """Test updating tree state and creating a snapshot."""
        self.client.force_authenticate(user=self.therapist)
        
        new_state = {
            'sefirot_states': {'tiferet': {'intensity': 7}},
            'path_states': {},
        }
        
        response = self.client.patch(
            f'/api/swm/cabala/sessions/{self.session.id}/tree-state/',
            {
                'tree_state': new_state,
                'create_snapshot': True,
                'snapshot_notes': 'Before major change'
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify snapshot was created
        snapshots = CabalaSessionSnapshot.objects.filter(session=self.session)
        self.assertEqual(snapshots.count(), 1)
        self.assertEqual(snapshots.first().notes, 'Before major change')


class CabalaChoicesAPITest(TestCase):
    """Test cases for choices endpoint."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='test_user',
            email='user@test.com',
            password='testpass123'
        )
        self.client = APIClient()
    
    def test_get_choices(self):
        """Test getting all available choices."""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get('/api/swm/cabala/choices/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('sefirot', response.data)
        self.assertIn('paths', response.data)
        self.assertIn('methods', response.data)
        self.assertIn('emotions', response.data)
        self.assertIn('flow_directions', response.data)
        
        # Verify sefirot count
        self.assertEqual(len(response.data['sefirot']), 11)
        
        # Verify paths count
        self.assertEqual(len(response.data['paths']), 22)
