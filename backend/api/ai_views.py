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
from api.ai.usage_meter import UsageContext

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

            usage_context = UsageContext(
                therapist=request.user,
                task_type='ai.holistic_query',
                source_type='holistic_query',
            )
            result = generate_text(
                prompt, temperature=0.6, max_tokens=512, usage_context=usage_context
            )
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


class AIGenerateView(APIView):
    """
    POST /api/ai/generate/

    Generic text generation endpoint used by frontend components instead of
    calling Gemini directly (which would expose the API key in the browser).

    Request body:
        {
            "prompt": "...",
            "temperature": 0.8,   (optional, default 0.8)
            "max_tokens": 2048    (optional, default 2048)
        }

    Returns:
        {
            "text": "...",
            "provider": "groq|gemini|ollama"
        }
    """
    permission_classes = [IsAuthenticated]

    MAX_PROMPT_LENGTH = 32_000

    def post(self, request):
        prompt = request.data.get('prompt', '').strip()
        if not prompt:
            return Response({'error': 'prompt is required'}, status=status.HTTP_400_BAD_REQUEST)
        if len(prompt) > self.MAX_PROMPT_LENGTH:
            return Response({'error': 'prompt too long'}, status=status.HTTP_400_BAD_REQUEST)

        temperature = float(request.data.get('temperature', 0.8))
        max_tokens = int(request.data.get('max_tokens', 2048))

        try:
            from api.utils.multi_ai_service import MultiAIService
            ai = MultiAIService()
            result = ai.generate(prompt, temperature=temperature, max_tokens=max_tokens)
            if not result.get('success'):
                return Response(
                    {'error': result.get('error') or 'AI providers unavailable'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
            return Response({'text': result['text'], 'provider': result.get('provider')})
        except Exception as e:
            logger.error(f"Error in AIGenerateView: {e}", exc_info=True)
            return Response({'error': 'Error generating AI response'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
