"""
Tests for Active Inquiry Engine API
"""

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from api.inquiry.models import InquiryDefinition, PatientInquiryResponse


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def inquiry_definition(db):
    """Create a test inquiry definition."""
    return InquiryDefinition.objects.create(
        code='test_inquiry_001',
        source_module='astrology',
        priority='critical',
        category='test',
        question_type='scale_1_10',
        question_text='Test question for inquiry?',
        question_text_short='Test question',
        help_text='This is a test help text.',
        valid_for_days=30,
        is_active=True,
    )


@pytest.fixture
def inquiry_text(db):
    """Create a text-type inquiry definition."""
    return InquiryDefinition.objects.create(
        code='test_text_inquiry',
        source_module='bioemotional',
        priority='important',
        question_type='text_long',
        question_text='Describe your symptoms',
        question_text_short='Symptoms',
        validation={'min_length': 10, 'max_length': 500},
        is_active=True,
    )


@pytest.fixture
def inquiry_choice(db):
    """Create a choice-type inquiry definition."""
    return InquiryDefinition.objects.create(
        code='test_choice_inquiry',
        source_module='cabala',
        priority='optional',
        question_type='choice_single',
        question_text='Select an option',
        question_text_short='Options',
        choices=[
            {'value': 'opt1', 'label': 'Option 1'},
            {'value': 'opt2', 'label': 'Option 2'},
            {'value': 'opt3', 'label': 'Option 3'},
        ],
        is_active=True,
    )


class TestInquiryDefinitionModel:
    """Tests for InquiryDefinition model."""
    
    @pytest.mark.django_db
    def test_create_inquiry_definition(self, inquiry_definition):
        """Test creating an inquiry definition."""
        assert inquiry_definition.pk is not None
        assert inquiry_definition.code == 'test_inquiry_001'
        assert inquiry_definition.source_module == 'astrology'
        assert inquiry_definition.priority == 'critical'
    
    @pytest.mark.django_db
    def test_unique_code_constraint(self, inquiry_definition):
        """Test that codes must be unique."""
        with pytest.raises(Exception):
            InquiryDefinition.objects.create(
                code='test_inquiry_001',  # Same code
                source_module='cabala',
                question_type='yes_no',
                question_text='Duplicate?'
            )
    
    @pytest.mark.django_db
    def test_str_representation(self, inquiry_definition):
        """Test string representation."""
        expected = '[astrology] test_inquiry_001 (critical)'
        assert str(inquiry_definition) == expected


class TestInquiryDefinitionAPI:
    """Tests for InquiryDefinition API endpoints."""
    
    @pytest.mark.django_db
    def test_list_definitions_requires_auth(self, api_client, inquiry_definition):
        """Test that listing definitions requires authentication."""
        response = api_client.get('/api/inquiry/definitions/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    @pytest.mark.django_db
    def test_filter_by_module(self, api_client, inquiry_definition, inquiry_text, therapist_user):
        """Test filtering definitions by module."""
        api_client.force_authenticate(user=therapist_user)
        
        response = api_client.get('/api/inquiry/definitions/?module=astrology')
        assert response.status_code == status.HTTP_200_OK
        
        # Should only return astrology inquiries
        for item in response.data['results'] if 'results' in response.data else response.data:
            assert item['source_module'] == 'astrology'


class TestPatientInquiryResponse:
    """Tests for PatientInquiryResponse model."""
    
    @pytest.mark.django_db
    def test_create_response(self, inquiry_definition, patient, db):
        """Test creating a response."""
        response = PatientInquiryResponse.objects.create(
            patient=patient,
            inquiry=inquiry_definition,
            response_value=7,
            collected_by='therapist_session',
        )
        
        assert response.pk is not None
        assert response.is_valid is True
        assert response.expires_at is not None
    
    @pytest.mark.django_db
    def test_new_response_invalidates_old(self, inquiry_definition, patient, db):
        """Test that creating a new response invalidates the old one."""
        # Create first response
        response1 = PatientInquiryResponse.objects.create(
            patient=patient,
            inquiry=inquiry_definition,
            response_value=5,
            collected_by='therapist_session',
        )
        assert response1.is_valid is True
        
        # Create second response
        response2 = PatientInquiryResponse.objects.create(
            patient=patient,
            inquiry=inquiry_definition,
            response_value=8,
            collected_by='therapist_session',
        )
        
        # Refresh first response
        response1.refresh_from_db()
        
        assert response2.is_valid is True
        assert response1.is_valid is False


class TestKnowledgeGapAPI:
    """Tests for Knowledge Gap detection endpoint."""
    
    @pytest.mark.django_db
    def test_gap_detection_requires_patient_id(self, api_client, therapist_user):
        """Test that gap detection requires patient_id parameter."""
        api_client.force_authenticate(user=therapist_user)
        
        response = api_client.get('/api/inquiry/gaps/')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'patient_id' in response.data.get('error', '')
    
    @pytest.mark.django_db
    def test_gap_detection_returns_gaps(
        self, api_client, therapist_user, patient, 
        inquiry_definition, inquiry_text
    ):
        """Test that gap detection returns unanswered inquiries."""
        api_client.force_authenticate(user=therapist_user)
        
        response = api_client.get(f'/api/inquiry/gaps/?patient_id={patient.id}')
        assert response.status_code == status.HTTP_200_OK
        
        # Should have gaps for both inquiries (no responses yet)
        assert response.data['total_gaps'] >= 2
        assert response.data['critical_gaps'] >= 1
