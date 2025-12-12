"""
Vistas para el módulo de Gematria
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


@method_decorator(csrf_exempt, name='dispatch')
class GematriaInterpretationView(APIView):
    """
    Genera una interpretación espiritual de Gematria usando IA
    Ruta: POST /api/gematria/interpret/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Genera la interpretación espiritual con IA"""
        try:
            # Validar datos recibidos
            word = request.data.get('word', '')
            ragil = request.data.get('ragil')
            katan = request.data.get('katan')
            gadol = request.data.get('gadol')
            atbash_value = request.data.get('atbash_value')
            resonances = request.data.get('resonances', [])
            
            if not word or ragil is None:
                return Response(
                    {'error': 'Se requiere la palabra y al menos el valor Ragil'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generar interpretación con IA
            from .utils.gematria_ai import gematria_ai
            
            if not gematria_ai.enabled:
                error_msg = getattr(gematria_ai, 'error_message', 'Servicio de IA no disponible. Verifica la configuración de GEMINI_API_KEY.')
                return Response(
                    {'error': error_msg},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            interpretation = gematria_ai.generate_interpretation(
                word=word,
                ragil=ragil,
                katan=katan or ragil,
                gadol=gadol or ragil,
                atbash_value=atbash_value or 0,
                resonances=resonances
            )
            
            # Verificar si hay error en la respuesta
            if 'error' in interpretation:
                return Response(
                    {'error': interpretation['error']},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Retornar la interpretación generada
            return Response({
                'success': True,
                'interpretation': interpretation,
                'message': 'Interpretación espiritual generada exitosamente'
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Error al generar la interpretación: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

