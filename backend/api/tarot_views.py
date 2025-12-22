"""
Vistas para el módulo de Tarot Terapéutico
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from .models import Patient
from .utils.tarot_service import analyze_archetype_vs_clinical
from cabala_py.arbol_vida import get_tarot_cabalistic_correspondence


@method_decorator(csrf_exempt, name='dispatch')
class TarotAnalysisView(APIView):
    """
    Genera un análisis terapéutico cruzado de Tarot + Estado Clínico
    Ruta: GET /api/therapist/patients/<id>/tarot-analysis/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, id):
        """Genera el análisis de Tarot cruzado con el estado clínico"""
        try:
            # Obtener el paciente (solo si es del terapeuta actual)
            patient = get_object_or_404(
                Patient.objects.filter(therapist=request.user),
                id=id
            )
            
            # Verificar que tenga fecha de nacimiento
            if not patient.birth_date:
                return Response(
                    {'error': 'El paciente no tiene fecha de nacimiento registrada. Agrega la fecha de nacimiento antes de generar el análisis de Tarot.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generar análisis
            analysis = analyze_archetype_vs_clinical(
                patient=patient,
                birth_date=patient.birth_date.isoformat()
            )
            
            # Verificar si hay error
            if 'error' in analysis:
                error_status = status.HTTP_500_INTERNAL_SERVER_ERROR
                if 'No se encontraron tests' in analysis['error']:
                    error_status = status.HTTP_400_BAD_REQUEST
                elif 'fecha de nacimiento' in analysis['error'].lower():
                    error_status = status.HTTP_400_BAD_REQUEST
                
                return Response(
                    {'error': analysis['error']},
                    status=error_status
                )
            
            # Construir URL de imagen de la carta (placeholder por ahora)
            # En el futuro, puedes tener imágenes reales de las cartas
            carta_img_url = f"/static/tarot/card_{analysis['arcana_number']}.jpg"
            
            # Retornar respuesta completa
            return Response({
                'success': True,
                'carta_img_url': carta_img_url,
                'nombre_carta': analysis['arcana_name'],
                'arcana_number': analysis['arcana_number'],
                'hebrew_letter': analysis['hebrew_letter'],
                'sendero': analysis['path'],
                'test_name': analysis['test_name'],
                'clinical_severity': analysis['clinical_severity'],
                'test_date': analysis['test_date'],
                'analisis_sombra': analysis['analisis_sombra'],
                'acciones_sanadoras': analysis['acciones_sanadoras'],
                'mensaje_integrador': analysis['mensaje_integrador']
            }, status=status.HTTP_200_OK)
        
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Paciente no encontrado o no tienes permisos para acceder a este paciente'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Error al generar el análisis de Tarot: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@method_decorator(csrf_exempt, name='dispatch')
class TarotCabalisticCorrespondenceView(APIView):
    """
    Devuelve correspondencias cabalisticas deterministas para una carta de Tarot.
    Ruta: GET /api/tarot/cabalistic-correspondence/?card_name=El%20Loco
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        card_name = request.query_params.get('card_name', '').strip()
        if not card_name:
            return Response(
                {'error': 'card_name es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        correspondence = get_tarot_cabalistic_correspondence(card_name)
        return Response(correspondence, status=status.HTTP_200_OK)
