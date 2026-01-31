"""
AI Assistant Query Endpoint

Provides a simple endpoint for the frontend AI widget to query the HolisticTherapistAI.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import logging

from django.conf import settings

from api.utils.multi_ai_service import generate_messages_with_fallback

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
        
        try:
            system_prompt = (
                "Eres un asistente para terapeutas dentro de una plataforma de psicoterapia holística. "
                "Responde en español. Sé conciso y profesional (máximo 200 palabras). "
                "No des diagnósticos ni afirmaciones médicas; ofrece orientación educativa y sugerencias prácticas. "
                "Si falta información, pide aclaraciones o sugiere dónde encontrarla dentro del sistema."
            )

            result = generate_messages_with_fallback(
                [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query},
                ],
                temperature=0.3,
                max_tokens=450,
                top_p=0.9,
            )

            if not result.get('success'):
                return Response(
                    {'error': result.get('error') or 'Servicio de IA no disponible'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

            return Response({
                'response': result.get('text', ''),
                'query': query,
                'provider_used': result.get('provider'),
            })
            
        except Exception as e:
            logger.error(f"Error in AIHolisticQueryView: {e}", exc_info=True)
            if getattr(settings, 'DEBUG', False):
                return Response(
                    {
                        'error': 'Error al procesar la consulta',
                        'detail': str(e),
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            return Response(
                {'error': 'Error al procesar la consulta'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
