"""
AI Assistant Query Endpoint

Provides a simple endpoint for the frontend AI widget to query the HolisticTherapistAI.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import logging

from api.ai.llm_bridge import generate_text, is_llm_available, unavailable_message

logger = logging.getLogger(__name__)


class AIHolisticQueryView(APIView):
    """
    POST /api/ai/holistic-query/
    
    Endpoint for quick AI assistant queries from the therapist dashboard widget.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Process a holistic AI query.
        
        Request body:
            {
                "query": "¿Cómo interpretar un resultado de MCMI-4?"
            }
        
        Returns:
            {
                "response": "AI-generated response text"
            }
        """
        query = request.data.get('query', '').strip()
        
        if not query:
            return Response(
                {'error': 'Query is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not is_llm_available():
            return Response(
                {'error': unavailable_message()},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            prompt = f"""Eres un asistente de terapia holística (orientación educativa, no diagnóstico).

Pregunta del terapeuta: {query}

Responde en español, máximo 200 palabras, tono profesional."""

            result = generate_text(prompt, temperature=0.6, max_tokens=512)
            if not result.get('success'):
                return Response(
                    {'error': result.get('error') or 'Error de IA'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

            return Response({
                'response': result.get('text', ''),
                'query': query,
                'provider': result.get('provider'),
            })
            
        except Exception as e:
            logger.error(f"Error in AIHolisticQueryView: {e}", exc_info=True)
            return Response(
                {'error': 'Error al procesar la consulta'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
