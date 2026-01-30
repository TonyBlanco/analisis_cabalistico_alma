"""
AI Engine API Views
Therapist-only endpoints for AI interpretations.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from api.test_models import TestResult
from api.permissions import IsTherapist
from .orchestrator import AIEngineOrchestrator
from .models import AIInterpretation
from .serializers import AIInterpretationSerializer
import logging

logger = logging.getLogger(__name__)


class GenerateInterpretationView(APIView):
    """
    POST /api/ai-engine/interpret/<test_result_id>/
    Generate AI interpretation for a test result.
    Therapist-only.
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def post(self, request, test_result_id: int):
        """Generate AI interpretation."""
        # Get test result
        test_result = get_object_or_404(TestResult, pk=test_result_id)
        
        # Verify therapist has access to this patient
        if test_result.patient and test_result.patient.therapist != request.user:
            return Response(
                {"detail": "No tiene permiso para acceder a este resultado"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if force_refresh requested
        force_refresh = request.data.get('force_refresh', False)
        
        # Generate interpretation
        try:
            orchestrator = AIEngineOrchestrator()
            interpretation = orchestrator.generate_interpretation(
                test_result=test_result,
                user=request.user,
                force_refresh=force_refresh
            )
            
            logger.info(f"✓ Generated interpretation for test result {test_result_id} by user {request.user.username}")
            return Response(interpretation, status=status.HTTP_200_OK)
        
        except ValueError as e:
            logger.warning(f"Value error in interpretation generation: {str(e)}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        except Exception as e:
            logger.error(f"Error generating interpretation: {str(e)}", exc_info=True)
            return Response(
                {"detail": f"Error generando interpretación: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class InterpretationHistoryView(APIView):
    """
    GET /api/ai-engine/history/<patient_id>/
    Get all AI interpretations for a patient.
    Therapist-only.
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def get(self, request, patient_id: int):
        """Get interpretation history for patient."""
        # Verify therapist has access
        from api.models import Patient
        patient = get_object_or_404(Patient, pk=patient_id, therapist=request.user)
        
        # Get all interpretations
        interpretations = AIInterpretation.objects.filter(patient=patient)
        serializer = AIInterpretationSerializer(interpretations, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class AIEngineStatusView(APIView):
    """
    GET /api/ai-engine/status/
    Check AI Engine availability and configuration.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Return AI Engine status."""
        from django.conf import settings
        
        enabled = getattr(settings, 'AI_ENGINE_ENABLED', False)
        has_openai_key = bool(getattr(settings, 'OPENAI_API_KEY', ''))
        has_pinecone_key = bool(getattr(settings, 'PINECONE_API_KEY', ''))
        
        return Response({
            'enabled': enabled,
            'openai_configured': has_openai_key,
            'pinecone_configured': has_pinecone_key,
            'model': getattr(settings, 'OPENAI_MODEL', 'gpt-4-turbo-preview'),
            'status': 'operational' if (enabled and has_openai_key) else 'unavailable'
        }, status=status.HTTP_200_OK)
