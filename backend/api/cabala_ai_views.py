"""
API Views for Cábala Aplicada AI Service.

These endpoints provide ETHICAL AI assistance under strict governance.

ALL endpoints require:
1. Authentication (IsAuthenticated)
2. Prompt validation
3. Output sanitization
4. Audit logging

Note: Therapist role verification is NOT needed here - if user has access
to the Cábala Aplicada workspace, they already have therapist authorization
granted by the consultante at session start.

Author: Sistema Holístico
Date: 2026-01-31
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from api.ai_governance import (
    AIGovernanceSystem,
    AIOperationType,
    validate_ai_request,
)
from api.cabala_ai_service import create_cabala_ai_service
import logging

logger = logging.getLogger(__name__)


# ============================================================================
# P3.1: TEXT EXPLORATION ENDPOINTS
# ============================================================================

class CabalaAIExtractConceptsView(APIView):
    """
    POST /api/cabala-ai/extract-concepts/
    
    Extract Kabbalistic concepts from text.
    NO personal interpretation - educational only.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        text = request.data.get('text', '').strip()
        consultante_id = request.data.get('consultante_id')
        
        if not text:
            return Response(
                {'error': 'Se requiere el campo "text"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(text) > 5000:
            return Response(
                {'error': 'Texto demasiado largo (máximo 5000 caracteres)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            service = create_cabala_ai_service(request.user)
            result = service.extract_concepts(text, consultante_id)
            
            if 'error' in result and result.get('violations'):
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
            return Response(result)
        except Exception as e:
            logger.error(f"AI extract concepts error: {e}")
            return Response(
                {'error': 'Error del servicio IA'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CabalaAISuggestReadingsView(APIView):
    """
    POST /api/cabala-ai/suggest-readings/
    
    Suggest related readings for a Kabbalistic topic.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        topic = request.data.get('topic', '').strip()
        sefira = request.data.get('sefira')
        
        if not topic:
            return Response(
                {'error': 'Se requiere el campo "topic"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            service = create_cabala_ai_service(request.user)
            result = service.suggest_readings(topic, sefira)
            return Response(result)
        except Exception as e:
            logger.error(f"AI suggest readings error: {e}")
            return Response(
                {'error': 'Error del servicio IA'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================================================
# P3.2: SYNTHESIS ASSISTANCE ENDPOINTS
# ============================================================================

class CabalaAISummarizeNotesView(APIView):
    """
    POST /api/cabala-ai/summarize-notes/
    
    Summarize therapist notes WITHOUT interpretation.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        notes = request.data.get('notes', [])
        consultante_id = request.data.get('consultante_id')
        
        if not notes or not isinstance(notes, list):
            return Response(
                {'error': 'Se requiere una lista de notas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Convert to strings if needed
        notes = [str(n) for n in notes if n]
        
        if not notes:
            return Response(
                {'error': 'La lista de notas está vacía'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            service = create_cabala_ai_service(request.user)
            result = service.summarize_notes(notes, consultante_id)
            return Response(result)
        except Exception as e:
            logger.error(f"AI summarize notes error: {e}")
            return Response(
                {'error': 'Error del servicio IA'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CabalaAIReflectionQuestionsView(APIView):
    """
    POST /api/cabala-ai/reflection-questions/
    
    Generate open-ended reflection questions for a Sefira.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        sefira = request.data.get('sefira', '').strip()
        context = request.data.get('context')
        count = request.data.get('count', 5)
        
        if not sefira:
            return Response(
                {'error': 'Se requiere el campo "sefira"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valid_sefirot = [
            'Keter', 'Chokmah', 'Binah', 'Chesed', 'Geburah',
            'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
        ]
        
        if sefira not in valid_sefirot:
            return Response(
                {'error': f'Sefirá no válida. Opciones: {valid_sefirot}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            count = int(count)
            count = max(1, min(10, count))  # 1-10 questions
        except (TypeError, ValueError):
            count = 5
        
        try:
            service = create_cabala_ai_service(request.user)
            result = service.generate_reflection_questions(sefira, context, count)
            return Response(result)
        except Exception as e:
            logger.error(f"AI reflection questions error: {e}")
            return Response(
                {'error': 'Error del servicio IA'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================================================
# P3.3: MEDITATION GENERATION ENDPOINTS
# ============================================================================

class CabalaAIGenerateMeditationView(APIView):
    """
    POST /api/cabala-ai/generate-meditation/
    
    Generate a meditation DRAFT based on a Sefira archetype.
    Requires therapist review before use.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        sefira = request.data.get('sefira', '').strip()
        duration_minutes = request.data.get('duration_minutes', 10)
        style = request.data.get('style', 'guided')
        
        if not sefira:
            return Response(
                {'error': 'Se requiere el campo "sefira"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valid_sefirot = [
            'Keter', 'Chokmah', 'Binah', 'Chesed', 'Geburah',
            'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
        ]
        
        if sefira not in valid_sefirot:
            return Response(
                {'error': f'Sefirá no válida. Opciones: {valid_sefirot}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valid_styles = ['guided', 'visualization', 'contemplative']
        if style not in valid_styles:
            style = 'guided'
        
        try:
            duration_minutes = int(duration_minutes)
            duration_minutes = max(5, min(30, duration_minutes))  # 5-30 minutes
        except (TypeError, ValueError):
            duration_minutes = 10
        
        try:
            service = create_cabala_ai_service(request.user)
            result = service.generate_meditation(sefira, duration_minutes, style)
            return Response(result)
        except Exception as e:
            logger.error(f"AI generate meditation error: {e}")
            return Response(
                {'error': 'Error del servicio IA'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CabalaAISefiraAttributesView(APIView):
    """
    GET /api/cabala-ai/sefira-attributes/<sefira>/
    
    Get educational attributes of a Sefira.
    Pure educational content, not personalized.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, sefira):
        valid_sefirot = [
            'Keter', 'Chokmah', 'Binah', 'Chesed', 'Geburah',
            'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
        ]
        
        if sefira not in valid_sefirot:
            return Response(
                {'error': f'Sefirá no válida. Opciones: {valid_sefirot}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            service = create_cabala_ai_service(request.user)
            result = service.get_sefira_attributes(sefira)
            return Response(result)
        except Exception as e:
            logger.error(f"AI sefira attributes error: {e}")
            return Response(
                {'error': 'Error del servicio IA'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================================================
# GOVERNANCE & STATUS ENDPOINTS
# ============================================================================

class CabalaAIGovernanceStatusView(APIView):
    """
    GET /api/cabala-ai/governance-status/
    
    Get current AI governance status and feature flags.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        governance = AIGovernanceSystem()
        
        return Response({
            'features': governance.features,
            'allowed_operations': AIOperationType.ALLOWED,
            'forbidden_operations': AIOperationType.FORBIDDEN,
            'disclaimer': (
                "La IA en este módulo es únicamente asistiva. "
                "No interpreta almas, no diagnostica, no predice. "
                "El terapeuta tiene soberanía total sobre todos los outputs."
            ),
            'ethical_note': (
                "La Cábala es un mapa simbólico, no una verdad absoluta. "
                "Todas las salidas de IA requieren revisión del terapeuta."
            )
        })


class CabalaAIValidatePromptView(APIView):
    """
    POST /api/cabala-ai/validate-prompt/
    
    Validate a prompt before sending to AI.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        prompt = request.data.get('prompt', '').strip()
        operation = request.data.get('operation', AIOperationType.CONCEPT_ANALYSIS)
        
        if not prompt:
            return Response(
                {'error': 'Se requiere el campo "prompt"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = validate_ai_request(operation, prompt)
        return Response(result)
