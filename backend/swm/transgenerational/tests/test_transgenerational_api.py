"""
Tests for Transgeneracional Profundo SWM API endpoints.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from swm.transgenerational.models import (
    TransgenerationalSession,
    FamilyMember,
    FamilyRelationship,
    TransgenerationalPattern,
    SyndromeMark,
    TransgenerationalSnapshot,
)

User = get_user_model()


class TransgenerationalSessionAPITest(TestCase):
    """Test cases for TransgenerationalSession API endpoints."""
    
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
        
        self.client = APIClient()
    
    def test_create_session_as_therapist(self):
        """Test that a therapist can create a transgenerational session."""
        self.client.force_authenticate(user=self.therapist)
        
        data = {
            'patient': self.patient.id,
            'title': 'Test Session',
            'focus_areas': ['lealtades', 'secretos'],
        }
        
        response = self.client.post('/api/swm/transgenerational/sessions/create/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Test Session')
        self.assertEqual(response.data['status'], 'created')
    
    def test_create_session_as_patient_fails(self):
        """Test that a patient cannot create a session."""
        self.client.force_authenticate(user=self.patient)
        
        data = {
            'patient': self.patient.id,
            'title': 'Test Session',
        }
        
        response = self.client.post('/api/swm/transgenerational/sessions/create/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_list_sessions(self):
        """Test listing sessions for a therapist."""
        self.client.force_authenticate(user=self.therapist)
        
        TransgenerationalSession.objects.create(
            patient=self.patient,
            therapist=self.therapist,
            title='Test Session'
        )
        
        response = self.client.get('/api/swm/transgenerational/sessions/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_start_and_close_session(self):
        """Test starting and closing a session."""
        self.client.force_authenticate(user=self.therapist)
        
        session = TransgenerationalSession.objects.create(
            patient=self.patient,
            therapist=self.therapist,
            title='Lifecycle Test'
        )
        
        # Start
        response = self.client.post(f'/api/swm/transgenerational/sessions/{session.id}/start/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'in_progress')
        
        # Close
        response = self.client.post(f'/api/swm/transgenerational/sessions/{session.id}/close/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'closed')

    def test_close_creates_mshe_analysis_record(self):
        """El cierre persiste el AnalysisRecord normalizado (kind='transgenerational') para MSHE."""
        from api.models import AnalysisRecord, Patient

        self.client.force_authenticate(user=self.therapist)

        self.therapist.profile.user_type = 'therapist'
        self.therapist.profile.save()
        clinical_patient = Patient.objects.create(
            therapist=self.therapist,
            user=self.patient,
            first_name='Trans',
            last_name='Gen',
            email='patient@test.com',
            full_name='Trans Gen',
            birth_date='1985-05-05',
        )

        session = TransgenerationalSession.objects.create(
            patient=self.patient,
            therapist=self.therapist,
            title='Federación MSHE',
        )
        TransgenerationalPattern.objects.create(
            session=session,
            pattern_name='Lealtad invisible',
            pattern_type='loyalty',
            generations_affected=[-2, -1, 0],
        )

        self.client.post(f'/api/swm/transgenerational/sessions/{session.id}/start/')
        response = self.client.post(f'/api/swm/transgenerational/sessions/{session.id}/close/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        record = AnalysisRecord.objects.filter(
            patient=clinical_patient, kind='transgenerational'
        ).first()
        self.assertIsNotNone(record)
        self.assertEqual(record.module_code, 'SWM_TRANSGEN_CLOSE')
        lineage = record.computed_result['lineage']
        self.assertEqual(lineage['identity_patterns'], 15.0)  # 1 patrón * 15
        self.assertEqual(lineage['generational_cycles'], 75.0)  # 3 generaciones * 25
        self.assertEqual(record.computed_result['snapshot']['patterns_count'], 1)


class FamilyMemberAPITest(TestCase):
    """Test cases for FamilyMember API endpoints."""
    
    def setUp(self):
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
        
        self.session = TransgenerationalSession.objects.create(
            patient=self.patient,
            therapist=self.therapist,
            title='Member Test'
        )
        
        self.client = APIClient()
    
    def test_create_family_member(self):
        """Test creating a family member."""
        self.client.force_authenticate(user=self.therapist)
        
        data = {
            'session_id': str(self.session.id),
            'alias': 'Abuelo P',
            'relationship': 'grandfather_paternal',
            'gender': 'male',
            'generation': -2,
            'birth_order': 1,
            'status': 'deceased',
            'birth_year': 1920,
            'death_year': 1995,
        }
        
        response = self.client.post('/api/swm/transgenerational/members/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['alias'], 'Abuelo P')
        self.assertEqual(response.data['generation'], -2)
    
    def test_list_family_members(self):
        """Test listing family members."""
        self.client.force_authenticate(user=self.therapist)
        
        FamilyMember.objects.create(
            session=self.session,
            alias='Madre',
            relationship='mother',
            generation=-1
        )
        FamilyMember.objects.create(
            session=self.session,
            alias='Padre',
            relationship='father',
            generation=-1
        )
        
        response = self.client.get(f'/api/swm/transgenerational/members/{self.session.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_update_family_member(self):
        """Test updating a family member."""
        self.client.force_authenticate(user=self.therapist)
        
        member = FamilyMember.objects.create(
            session=self.session,
            alias='Tía',
            relationship='aunt_maternal',
            generation=-1
        )
        
        response = self.client.patch(
            f'/api/swm/transgenerational/members/{member.id}/update/',
            {'notes': 'Figura importante', 'characteristics': ['cariñosa', 'protectora']},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['notes'], 'Figura importante')


class TransgenerationalPatternAPITest(TestCase):
    """Test cases for TransgenerationalPattern API endpoints."""
    
    def setUp(self):
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
        
        self.session = TransgenerationalSession.objects.create(
            patient=self.patient,
            therapist=self.therapist,
            title='Pattern Test'
        )
        
        self.client = APIClient()
    
    def test_create_pattern(self):
        """Test creating a transgenerational pattern."""
        self.client.force_authenticate(user=self.therapist)
        
        data = {
            'session_id': str(self.session.id),
            'pattern_name': 'Abandono paterno',
            'pattern_type': 'repetition',
            'generations_affected': [-2, -1, 0],
            'description': 'Patrón de abandono que se repite en 3 generaciones',
            'intensity': 8,
        }
        
        response = self.client.post('/api/swm/transgenerational/patterns/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['pattern_name'], 'Abandono paterno')
        self.assertEqual(response.data['pattern_type'], 'repetition')
    
    def test_list_patterns(self):
        """Test listing patterns."""
        self.client.force_authenticate(user=self.therapist)
        
        TransgenerationalPattern.objects.create(
            session=self.session,
            pattern_name='Lealtad invisible',
            pattern_type='loyalty',
            intensity=7
        )
        
        response = self.client.get(f'/api/swm/transgenerational/patterns/{self.session.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class SyndromeMarkAPITest(TestCase):
    """Test cases for SyndromeMark API endpoints."""
    
    def setUp(self):
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
        
        self.session = TransgenerationalSession.objects.create(
            patient=self.patient,
            therapist=self.therapist,
            title='Syndrome Test'
        )
        
        self.client = APIClient()
    
    def test_create_syndrome_mark(self):
        """Test creating a syndrome mark."""
        self.client.force_authenticate(user=self.therapist)
        
        data = {
            'session_id': str(self.session.id),
            'event_type': 'death',
            'original_year': 1975,
            'recurring_pattern': 'Muertes en marzo durante 3 generaciones',
            'significance': 'Síndrome del aniversario claro',
        }
        
        response = self.client.post('/api/swm/transgenerational/syndromes/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['event_type'], 'death')


class GenogramAPITest(TestCase):
    """Test cases for Genogram API endpoints."""
    
    def setUp(self):
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
        
        self.session = TransgenerationalSession.objects.create(
            patient=self.patient,
            therapist=self.therapist,
            title='Genogram Test',
            genogram_data={'initial': True}
        )
        
        self.client = APIClient()
    
    def test_get_genogram(self):
        """Test getting genogram data."""
        self.client.force_authenticate(user=self.therapist)
        
        response = self.client.get(f'/api/swm/transgenerational/genogram/{self.session.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['genogram_data'], {'initial': True})
    
    def test_update_genogram(self):
        """Test updating genogram data."""
        self.client.force_authenticate(user=self.therapist)
        
        new_data = {
            'nodes': [{'id': '1', 'type': 'person'}],
            'edges': [],
        }
        
        response = self.client.patch(
            f'/api/swm/transgenerational/genogram/{self.session.id}/',
            {'genogram_data': new_data},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['genogram_data'], new_data)
    
    def test_update_genogram_with_snapshot(self):
        """Test updating genogram and creating snapshot."""
        self.client.force_authenticate(user=self.therapist)
        
        response = self.client.patch(
            f'/api/swm/transgenerational/genogram/{self.session.id}/',
            {
                'genogram_data': {'updated': True},
                'create_snapshot': True,
                'snapshot_notes': 'Before major change'
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        snapshots = TransgenerationalSnapshot.objects.filter(session=self.session)
        self.assertEqual(snapshots.count(), 1)


class TransgenerationalChoicesAPITest(TestCase):
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
        
        response = self.client.get('/api/swm/transgenerational/choices/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('relationships', response.data)
        self.assertIn('pattern_types', response.data)
        self.assertIn('event_types', response.data)
        self.assertIn('genders', response.data)
        
        # Verify we have pattern types
        self.assertGreater(len(response.data['pattern_types']), 10)
