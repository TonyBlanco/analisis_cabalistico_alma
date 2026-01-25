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
from .models_astrology_ai import AstrologyAIInterpretation
from .permissions import IsTherapist
from django.utils import timezone

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
        use_cached = request.data.get('use_cached', True)  # Default to using cache
        force_regenerate = request.data.get('force_regenerate', False)
        
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
        
        # Check for existing interpretation if caching is enabled
        if use_cached and not force_regenerate:
            try:
                existing = AstrologyAIInterpretation.objects.filter(
                    patient=patient,
                    interpretation_type='natal',
                    is_archived=False
                ).latest('created_at')
                
                logger.info(f"Using cached natal interpretation for patient {patient_id}")
                return Response({
                    'success': True,
                    'interpretation': existing.interpretation_text,
                    'layer': existing.interpretation_type,
                    'patient_id': patient_id,
                    'cached': True,
                    'created_at': existing.created_at.isoformat(),
                    'interpretation_id': existing.id,
                })
            except AstrologyAIInterpretation.DoesNotExist:
                pass  # No cached interpretation, continue to generate
        
        # Obtener carta natal
        try:
            natal_chart = AstrologyNatalChart.objects.get(patient=patient)
        except AstrologyNatalChart.DoesNotExist:
            return Response(
                {'error': 'No hay carta natal calculada para este paciente'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar servicio AI (asegurar que está inicializado)
        astrology_ai_service._ensure_initialized()
        if not astrology_ai_service.enabled:
            return Response(
                {'error': astrology_ai_service.error_message or 'Servicio AI no disponible'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        # Generar interpretación
        result = astrology_ai_service.interpret_natal(natal_chart.chart_payload)
        
        if result.success:
            # Save interpretation to database
            interpretation = AstrologyAIInterpretation.objects.create(
                patient=patient,
                created_by=request.user,
                interpretation_type='natal',
                interpretation_text=result.interpretation,
                input_context={'chart_id': natal_chart.id},
                model_version='gemini-2.5-flash',
            )
            
            logger.info(f"Saved new natal interpretation {interpretation.id} for patient {patient_id}")
            
            return Response({
                'success': True,
                'interpretation': result.interpretation,
                'layer': result.layer,
                'patient_id': patient_id,
                'cached': False,
                'interpretation_id': interpretation.id,
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
        
        # Verificar AI (asegurar inicialización)
        astrology_ai_service._ensure_initialized()
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
        
        astrology_ai_service._ensure_initialized()
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
        
        astrology_ai_service._ensure_initialized()
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
        
        astrology_ai_service._ensure_initialized()
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
    No requiere autenticación - solo devuelve estado del servicio.
    """
    permission_classes = []  # Public endpoint
    
    def get(self, request):
        # Trigger lazy initialization
        astrology_ai_service._ensure_initialized()
        
        return Response({
            'enabled': astrology_ai_service.enabled,
            'model': astrology_ai_service.model_name if astrology_ai_service.enabled else None,
            'error': astrology_ai_service.error_message if not astrology_ai_service.enabled else None,
        })


@method_decorator(csrf_exempt, name='dispatch')
class AstrologyAIInterpretationListView(APIView):
    """
    GET /api/astrology/interpretations/
    
    List all interpretations for a patient
    
    Query params:
        - patient_id: int (required)
        - interpretation_type: str (optional: natal, transits, progressions, solar_return)
        - limit: int (optional, default 10)
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def get(self, request):
        patient_id = request.query_params.get('patient_id')
        interpretation_type = request.query_params.get('interpretation_type')
        limit = int(request.query_params.get('limit', 10))
        
        if not patient_id:
            return Response(
                {'error': 'patient_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            patient = Patient.objects.get(id=patient_id, therapist=request.user)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient not found or no access'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Filter interpretations
        interpretations = AstrologyAIInterpretation.objects.filter(
            patient=patient,
            is_archived=False
        )
        
        if interpretation_type:
            interpretations = interpretations.filter(interpretation_type=interpretation_type)
        
        interpretations = interpretations[:limit]
        
        data = [{
            'id': i.id,
            'interpretation_type': i.interpretation_type,
            'interpretation_type_display': i.get_interpretation_type_display(),
            'interpretation_text': i.interpretation_text,
            'word_count': i.word_count,
            'created_at': i.created_at.isoformat(),
            'is_shared_with_patient': i.is_shared_with_patient,
            'shared_at': i.shared_at.isoformat() if i.shared_at else None,
            'therapist_notes': i.therapist_notes,
        } for i in interpretations]
        
        return Response({
            'success': True,
            'interpretations': data,
            'count': len(data),
        })


@method_decorator(csrf_exempt, name='dispatch')
class AstrologyAIInterpretationDetailView(APIView):
    """
    GET /api/astrology/interpretations/<id>/
    PUT /api/astrology/interpretations/<id>/
    DELETE /api/astrology/interpretations/<id>/
    
    Manage individual interpretation
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def get(self, request, interpretation_id):
        try:
            interpretation = AstrologyAIInterpretation.objects.get(
                id=interpretation_id,
                patient__therapist=request.user
            )
        except AstrologyAIInterpretation.DoesNotExist:
            return Response(
                {'error': 'Interpretation not found or no access'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            'success': True,
            'interpretation': {
                'id': interpretation.id,
                'interpretation_type': interpretation.interpretation_type,
                'interpretation_type_display': interpretation.get_interpretation_type_display(),
                'interpretation_text': interpretation.interpretation_text,
                'word_count': interpretation.word_count,
                'created_at': interpretation.created_at.isoformat(),
                'updated_at': interpretation.updated_at.isoformat(),
                'is_shared_with_patient': interpretation.is_shared_with_patient,
                'shared_at': interpretation.shared_at.isoformat() if interpretation.shared_at else None,
                'therapist_notes': interpretation.therapist_notes,
                'patient_id': interpretation.patient.id,
            }
        })
    
    def put(self, request, interpretation_id):
        """Update therapist notes or sharing status"""
        try:
            interpretation = AstrologyAIInterpretation.objects.get(
                id=interpretation_id,
                patient__therapist=request.user
            )
        except AstrologyAIInterpretation.DoesNotExist:
            return Response(
                {'error': 'Interpretation not found or no access'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Update therapist notes if provided
        if 'therapist_notes' in request.data:
            interpretation.therapist_notes = request.data['therapist_notes']
        
        # Share with patient if requested
        if request.data.get('share_with_patient'):
            interpretation.share_with_patient()
        
        interpretation.save()
        
        return Response({
            'success': True,
            'message': 'Interpretation updated successfully'
        })
    
    def delete(self, request, interpretation_id):
        """Archive (soft delete) interpretation"""
        try:
            interpretation = AstrologyAIInterpretation.objects.get(
                id=interpretation_id,
                patient__therapist=request.user
            )
        except AstrologyAIInterpretation.DoesNotExist:
            return Response(
                {'error': 'Interpretation not found or no access'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        interpretation.archive()
        
        return Response({
            'success': True,
            'message': 'Interpretation archived successfully'
        })
