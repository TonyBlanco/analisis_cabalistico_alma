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
from rest_framework import status as drf_status

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


class InterpretAssignmentView(APIView):
    """
    POST /api/ai-engine/interpret-assignment/<assignment_id>/
    Generate AI interpretation for an Assignment (SHA uses Assignment.results).
    Therapist-only.
    """
    permission_classes = [IsAuthenticated, IsTherapist]

    def post(self, request, assignment_id: int):
        from api.test_models import Assignment

        try:
            assignment = Assignment.objects.select_related('patient').get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response({"detail": "Asignación no encontrada"}, status=status.HTTP_404_NOT_FOUND)

        # Verify therapist access
        if assignment.patient and assignment.patient.therapist != request.user:
            return Response({"detail": "No tiene permiso para acceder a esta asignación"}, status=status.HTTP_403_FORBIDDEN)

        # Ensure assignment has computed results
        if not assignment.results:
            return Response({"detail": "La asignación no contiene resultados calculados."}, status=status.HTTP_400_BAD_REQUEST)

        # Build a lightweight object compatible with orchestrator/interpreters
        class _FakeTestResult:
            pass

        fake = _FakeTestResult()
        # Provide attributes expected by interpreters
        # Use numeric id so cache lookups use numeric test_result_id
        fake.id = assignment.id
        fake.test_module = type('t', (), {'code': assignment.test_type})
        fake.details = assignment.results
        fake.created_at = assignment.completed_at or assignment.created_at
        fake.patient = assignment.patient

        force_refresh = request.data.get('force_refresh', False)

        try:
            orchestrator = AIEngineOrchestrator()
            interpretation = orchestrator.generate_interpretation(
                test_result=fake,
                user=request.user,
                force_refresh=force_refresh
            )

            logging.getLogger(__name__).info(f"✓ Generated interpretation for assignment {assignment_id} by user {request.user.username}")
            return Response(interpretation, status=status.HTTP_200_OK)

        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logging.getLogger(__name__).exception("Error generating interpretation for assignment")
            return Response({"detail": f"Error generando interpretación: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ExportInterpretationToMSHEView(APIView):
    """
    POST /api/ai-engine/export-to-mshe/<interpretation_id>/
    Create a BioEmotionalPatientBrief based on an AI interpretation so MSHE can consume it.
    """
    permission_classes = [IsAuthenticated, IsTherapist]

    def post(self, request, interpretation_id: str):
        from api.bioemotional.models import BioEmotionalPatientBrief

        try:
            interp = AIInterpretation.objects.get(id=interpretation_id)
        except AIInterpretation.DoesNotExist:
            return Response({"detail": "Interpretation not found."}, status=drf_status.HTTP_404_NOT_FOUND)

        # Verify ownership
        if not interp.patient or interp.patient.therapist_id != request.user.id:
            return Response({"detail": "No permission to export this interpretation."}, status=drf_status.HTTP_403_FORBIDDEN)

        # Build compact summary
        narrative = interp.narrative or {}
        summary = narrative.get('summary', '')
        key_insights = narrative.get('key_insights', [])
        suggested = interp.suggested_diagnoses or []

        title = f"SHA - Interpretación IA ({interp.created_at.date().isoformat()})"
        content_parts = [summary]
        if key_insights:
            content_parts.append('\n\nInsights clave:\n' + '\n'.join([f"- {k}" for k in key_insights]))
        if suggested:
            content_parts.append('\n\nPatrones sugeridos:\n' + '\n'.join([f"- {d.get('code','')}: {d.get('name','')} ({round(d.get('probability',0)*100)}%)" for d in suggested]))

        content = '\n'.join(content_parts)

        brief = BioEmotionalPatientBrief.objects.create(
            therapist=request.user,
            patient=interp.patient,
            title=title,
            content=content,
            sources=[{"type": "ai_interpretation", "id": interp.id}]
        )

        return Response({
            "brief_id": str(brief.id),
            "message": "Exported to BioEmotional briefs for MSHE",
            "patient_id": interp.patient.id
        }, status=drf_status.HTTP_201_CREATED)


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
