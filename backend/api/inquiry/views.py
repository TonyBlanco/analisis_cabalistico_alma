"""
Active Inquiry Engine - Views
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import InquiryDefinition, PatientInquiryResponse
from .serializers import (
    InquiryDefinitionSerializer,
    InquiryDefinitionAdminSerializer,
    PatientInquiryResponseSerializer,
    PatientInquiryResponseCreateSerializer,
    KnowledgeGapSerializer,
)
from api.permissions import IsTherapist


class InquiryDefinitionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for InquiryDefinitions.
    
    Endpoints:
    - GET /api/inquiry/definitions/ - List all active definitions
    - GET /api/inquiry/definitions/?module=astrology - Filter by module
    - GET /api/inquiry/definitions/{id}/ - Get specific definition
    """
    
    queryset = InquiryDefinition.objects.filter(is_active=True)
    serializer_class = InquiryDefinitionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        qs = super().get_queryset().order_by('source_module', 'priority', 'code')
        
        # Manual filtering
        module = self.request.query_params.get('module')
        priority = self.request.query_params.get('priority')
        category = self.request.query_params.get('category')
        
        if module:
            qs = qs.filter(source_module=module)
        if priority:
            qs = qs.filter(priority=priority)
        if category:
            qs = qs.filter(category=category)
        
        return qs


class PatientInquiryResponseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for PatientInquiryResponses.
    
    Endpoints:
    - GET /api/inquiry/responses/ - List responses (filtered by patient)
    - POST /api/inquiry/responses/ - Create new response
    - GET /api/inquiry/responses/{id}/ - Get specific response
    """
    
    queryset = PatientInquiryResponse.objects.select_related('inquiry', 'patient')
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PatientInquiryResponseCreateSerializer
        return PatientInquiryResponseSerializer
    
    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        
        # Therapists can only see responses for their patients
        if hasattr(user, 'is_therapist') and user.is_therapist:
            return qs.filter(patient__therapists=user)
        
        # Patients can only see their own responses
        return qs.filter(patient__user=user)


class KnowledgeGapViewSet(viewsets.ViewSet):
    """
    ViewSet for Knowledge Gap Detection.
    
    Endpoints:
    - GET /api/inquiry/gaps/?patient_id=X&module=Y - Detect gaps for patient/module
    """
    
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def list(self, request):
        """
        Detect knowledge gaps for a patient in a specific module.
        
        Query params:
        - patient_id: Required. The patient to check.
        - module: Optional. Filter by module (astrology, cabala, etc.)
        - priority: Optional. Filter by priority (critical, important, optional)
        """
        from api.models import Patient
        
        patient_id = request.query_params.get('patient_id')
        module = request.query_params.get('module')
        priority = request.query_params.get('priority')
        
        if not patient_id:
            return Response(
                {'error': 'patient_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            patient = Patient.objects.get(pk=patient_id)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get all active inquiry definitions
        definitions = InquiryDefinition.objects.filter(is_active=True)
        
        if module:
            definitions = definitions.filter(source_module=module)
        if priority:
            definitions = definitions.filter(priority=priority)
        
        # Get existing valid responses for this patient
        existing_responses = PatientInquiryResponse.objects.filter(
            patient=patient,
            is_valid=True
        ).select_related('inquiry')
        
        response_map = {
            resp.inquiry.code: resp 
            for resp in existing_responses
        }
        
        now = timezone.now()
        gaps = []
        
        for defn in definitions:
            response = response_map.get(defn.code)
            
            has_response = response is not None
            response_expired = False
            last_response_date = None
            
            if has_response:
                last_response_date = response.collected_at
                if response.expires_at and response.expires_at < now:
                    response_expired = True
            
            # A gap exists if there's no response or it's expired
            if not has_response or response_expired:
                gaps.append({
                    'inquiry_code': defn.code,
                    'inquiry_id': defn.id,
                    'question_text_short': defn.question_text_short or defn.question_text[:80],
                    'priority': defn.priority,
                    'source_module': defn.source_module,
                    'has_response': has_response,
                    'response_expired': response_expired,
                    'last_response_date': last_response_date,
                })
        
        # Sort by priority (critical first)
        priority_order = {'critical': 0, 'important': 1, 'optional': 2}
        gaps.sort(key=lambda x: priority_order.get(x['priority'], 99))
        
        serializer = KnowledgeGapSerializer(gaps, many=True)
        return Response({
            'patient_id': patient_id,
            'module': module,
            'total_gaps': len(gaps),
            'critical_gaps': sum(1 for g in gaps if g['priority'] == 'critical'),
            'gaps': serializer.data
        })
