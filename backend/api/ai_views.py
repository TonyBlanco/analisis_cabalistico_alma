"""
AI Assistant Query Endpoint

Provides a simple endpoint for the frontend AI widget to query the HolisticTherapistAI.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import logging

from api.utils.holistic_ai import holistic_ai

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
        
        # Check if AI is enabled
        if not holistic_ai.enabled:
            error_msg = getattr(
                holistic_ai, 
                'error_message', 
                'Servicio de IA no disponible. Verifica la configuración de GEMINI_API_KEY.'
            )
            return Response(
                {'error': error_msg},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        try:
            # Create a simple prompt for quick queries
            prompt = f"""Eres un asistente clínico especializado en terapia holística.
            
Pregunta del terapeuta: {query}

Responde de forma concisa y profesional (máximo 200 palabras). 
Si la pregunta es sobre interpretación de tests, contexto clínico, o herramientas del sistema, proporciona orientación práctica.
Si no tienes información suficiente, sugiere cómo el terapeuta podría encontrar más detalles."""

            # Use the holistic AI to generate response
            response_text = holistic_ai.model.generate_content(prompt)
            
            return Response({
                'response': response_text.text if hasattr(response_text, 'text') else str(response_text),
                'query': query
            })
            
        except Exception as e:
            logger.error(f"Error in AIHolisticQueryView: {e}", exc_info=True)
            return Response(
                {'error': 'Error al procesar la consulta'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
