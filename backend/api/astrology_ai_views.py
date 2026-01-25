"""
Endpoints REST para Interpretaciones AI de Astrología

Rutas:
- POST /api/astrology/interpret/natal/ - Interpretar carta natal
- POST /api/astrology/interpret/transits/ - Interpretar tránsitos
- POST /api/astrology/interpret/progressions/ - Interpretar progresiones
- POST /api/astrology/interpret/solar-return/ - Interpretar retorno solar
- POST /api/astrology/interpret/situation/ - Consulta situacional
"""

import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .astrology_ai_service import astrology_ai_service
from .models import Patient
from .models_astrology import AstrologyNatalChart
from .permissions import IsTherapist

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
class AstrologyInterpretNatalView(APIView):
    """
    POST /api/astrology/interpret/natal/
    
    Genera interpretación AI de la carta natal del paciente.
    
    Request body:
        {
            "patient_id": 4
        }
    
    Response:
        {
            "success": true,
            "interpretation": "...",
            "layer": "natal"
        }
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def post(self, request):
        patient_id = request.data.get('patient_id')
        
        if not patient_id:
            return Response(
                {'error': 'patient_id es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar acceso al paciente
        try:
            patient = Patient.objects.get(id=patient_id, therapist=request.user)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Paciente no encontrado o sin acceso'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Obtener carta natal
        try:
            natal_chart = AstrologyNatalChart.objects.get(patient=patient)
        except AstrologyNatalChart.DoesNotExist:
            return Response(
                {'error': 'No hay carta natal calculada para este paciente'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar servicio AI
        if not astrology_ai_service.enabled:
            return Response(
                {'error': astrology_ai_service.error_message or 'Servicio AI no disponible'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        # Generar interpretación
        result = astrology_ai_service.interpret_natal(natal_chart.chart_payload)
        
        if result.success:
            return Response({
                'success': True,
                'interpretation': result.interpretation,
                'layer': result.layer,
                'patient_id': patient_id,
            })
        else:
            return Response(
                {'error': result.error or 'Error generando interpretación'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class AstrologyInterpretTransitsView(APIView):
    """
    POST /api/astrology/interpret/transits/
    
    Genera interpretación AI de tránsitos actuales.
    
    Request body:
        {
            "patient_id": 4,
            "transit_date": "2026-01-25" (opcional)
        }
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def post(self, request):
        patient_id = request.data.get('patient_id')
        transit_date = request.data.get('transit_date', 'actual')
        
        if not patient_id:
            return Response(
                {'error': 'patient_id es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar acceso
        try:
            patient = Patient.objects.get(id=patient_id, therapist=request.user)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Paciente no encontrado o sin acceso'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Obtener carta natal
        try:
            natal_chart = AstrologyNatalChart.objects.get(patient=patient)
        except AstrologyNatalChart.DoesNotExist:
            return Response(
                {'error': 'No hay carta natal calculada'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar AI
        if not astrology_ai_service.enabled:
            return Response(
                {'error': astrology_ai_service.error_message or 'Servicio AI no disponible'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        # Obtener tránsitos del input_snapshot si existe, o usar natal como fallback
        input_snapshot = natal_chart.input_snapshot or {}
        
        # Para tránsitos necesitamos calcular las posiciones actuales
        # Por ahora usamos el chart_payload como referencia
        # TODO: Integrar con multi_tech para tránsitos reales
        transits_data = natal_chart.chart_payload  # Fallback temporal
        
        result = astrology_ai_service.interpret_transits(
            natal_data=natal_chart.chart_payload,
            transits_data=transits_data,
            transit_date=str(transit_date)
        )
        
        if result.success:
            return Response({
                'success': True,
                'interpretation': result.interpretation,
                'layer': result.layer,
                'patient_id': patient_id,
                'transit_date': transit_date,
            })
        else:
            return Response(
                {'error': result.error or 'Error generando interpretación'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class AstrologyInterpretProgressionsView(APIView):
    """
    POST /api/astrology/interpret/progressions/
    
    Genera interpretación AI de progresiones secundarias.
    
    Request body:
        {
            "patient_id": 4,
            "progression_date": "2026-01-25" (opcional)
        }
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def post(self, request):
        patient_id = request.data.get('patient_id')
        progression_date = request.data.get('progression_date', 'actual')
        
        if not patient_id:
            return Response(
                {'error': 'patient_id es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            patient = Patient.objects.get(id=patient_id, therapist=request.user)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Paciente no encontrado o sin acceso'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            natal_chart = AstrologyNatalChart.objects.get(patient=patient)
        except AstrologyNatalChart.DoesNotExist:
            return Response(
                {'error': 'No hay carta natal calculada'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not astrology_ai_service.enabled:
            return Response(
                {'error': astrology_ai_service.error_message or 'Servicio AI no disponible'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        # TODO: Obtener progresiones reales de multi_tech
        progressions_data = natal_chart.chart_payload  # Fallback temporal
        
        result = astrology_ai_service.interpret_progressions(
            natal_data=natal_chart.chart_payload,
            progressions_data=progressions_data,
            progression_date=str(progression_date)
        )
        
        if result.success:
            return Response({
                'success': True,
                'interpretation': result.interpretation,
                'layer': result.layer,
                'patient_id': patient_id,
            })
        else:
            return Response(
                {'error': result.error or 'Error generando interpretación'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class AstrologyInterpretSolarReturnView(APIView):
    """
    POST /api/astrology/interpret/solar-return/
    
    Genera interpretación AI del retorno solar.
    
    Request body:
        {
            "patient_id": 4,
            "year": 2026 (opcional)
        }
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def post(self, request):
        patient_id = request.data.get('patient_id')
        year = request.data.get('year', 2026)
        
        if not patient_id:
            return Response(
                {'error': 'patient_id es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            patient = Patient.objects.get(id=patient_id, therapist=request.user)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Paciente no encontrado o sin acceso'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            natal_chart = AstrologyNatalChart.objects.get(patient=patient)
        except AstrologyNatalChart.DoesNotExist:
            return Response(
                {'error': 'No hay carta natal calculada'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not astrology_ai_service.enabled:
            return Response(
                {'error': astrology_ai_service.error_message or 'Servicio AI no disponible'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        # TODO: Obtener retorno solar real de multi_tech
        solar_return_data = natal_chart.chart_payload  # Fallback temporal
        
        result = astrology_ai_service.interpret_solar_return(
            natal_data=natal_chart.chart_payload,
            solar_return_data=solar_return_data,
            year=int(year)
        )
        
        if result.success:
            return Response({
                'success': True,
                'interpretation': result.interpretation,
                'layer': result.layer,
                'patient_id': patient_id,
                'year': year,
            })
        else:
            return Response(
                {'error': result.error or 'Error generando interpretación'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class AstrologyQuerySituationView(APIView):
    """
    POST /api/astrology/interpret/situation/
    
    Responde una pregunta específica sobre la carta del paciente.
    
    Request body:
        {
            "patient_id": 4,
            "question": "¿Qué indica la carta sobre relaciones?"
        }
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def post(self, request):
        patient_id = request.data.get('patient_id')
        question = request.data.get('question', '').strip()
        
        if not patient_id:
            return Response(
                {'error': 'patient_id es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not question or len(question) < 10:
            return Response(
                {'error': 'La pregunta debe tener al menos 10 caracteres'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            patient = Patient.objects.get(id=patient_id, therapist=request.user)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Paciente no encontrado o sin acceso'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            natal_chart = AstrologyNatalChart.objects.get(patient=patient)
        except AstrologyNatalChart.DoesNotExist:
            return Response(
                {'error': 'No hay carta natal calculada'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not astrology_ai_service.enabled:
            return Response(
                {'error': astrology_ai_service.error_message or 'Servicio AI no disponible'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        result = astrology_ai_service.query_situation(
            question=question,
            chart_data=natal_chart.chart_payload,
            transits_data=None  # TODO: incluir tránsitos si están disponibles
        )
        
        if result.success:
            return Response({
                'success': True,
                'interpretation': result.interpretation,
                'layer': result.layer,
                'patient_id': patient_id,
                'question': question,
            })
        else:
            return Response(
                {'error': result.error or 'Error generando respuesta'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class AstrologyAIStatusView(APIView):
    """
    GET /api/astrology/ai-status/
    
    Verifica el estado del servicio AI de astrología.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            'enabled': astrology_ai_service.enabled,
            'model': astrology_ai_service.model_name if astrology_ai_service.enabled else None,
            'error': astrology_ai_service.error_message if not astrology_ai_service.enabled else None,
        })
