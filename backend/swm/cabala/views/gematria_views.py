"""
Gematria Reading Views for API.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from api.models import Patient
from ..gematria_models import GematriaReading, GematriaSynthesis
from ..serializers.gematria_serializers import (
    GematriaReadingSerializer,
    GematriaReadingCreateSerializer,
    GematriaReadingListSerializer,
    GematriaSynthesisSerializer,
    GematriaSynthesisCreateSerializer,
    GematriaSynthesisExportSerializer,
)
from ..services.gematria_synthesis_service import GematriaSynthesisService


class GematriaReadingListView(APIView):
    """
    List all gematria readings for a patient.
    GET /api/swm/cabala/gematria-readings/?patient_id=<id>
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        patient_id = request.query_params.get('patient_id')
        if not patient_id:
            return Response(
                {'error': 'patient_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify therapist has access to patient
        patient = get_object_or_404(Patient, id=patient_id)
        if patient.therapist != request.user and not request.user.is_staff:
            return Response(
                {'error': 'No tiene acceso a este paciente'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        readings = GematriaReading.objects.filter(patient=patient).order_by('-created_at')
        
        # Optional method filter
        method = request.query_params.get('method')
        if method:
            readings = readings.filter(method=method)
        
        serializer = GematriaReadingListSerializer(readings, many=True)
        return Response({
            'count': readings.count(),
            'readings': serializer.data,
        })


class GematriaReadingCreateView(APIView):
    """
    Save a new gematria reading.
    POST /api/swm/cabala/gematria-readings/save/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"[GematriaReading] Received data: {request.data}")
        
        serializer = GematriaReadingCreateSerializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"[GematriaReading] Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        patient = get_object_or_404(Patient, id=data['patient_id'])
        
        # Verify access
        if patient.therapist != request.user and not request.user.is_staff:
            return Response(
                {'error': 'No tiene acceso a este paciente'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create reading via service
        service = GematriaSynthesisService(patient, request.user)
        
        reading = service.save_reading(
            method=data['method'],
            input_name=data['input_name'],
            input_birth_date=str(data.get('input_birth_date')) if data.get('input_birth_date') else None,
            hebrew_transliteration=data.get('hebrew_transliteration', ''),
            calculated_numbers=data['calculated_numbers'],
            calculation_details=data.get('calculation_details', {}),
            sefirotic_correspondence=data.get('sefirotic_correspondence', {}),
            number_interpretations=data.get('number_interpretations', {}),
            method_interpretation=data.get('method_interpretation', ''),
            therapist_notes=data.get('therapist_notes', ''),
        )
        
        return Response(
            GematriaReadingSerializer(reading).data,
            status=status.HTTP_201_CREATED
        )


class GematriaReadingDetailView(APIView):
    """
    Get, update or delete a specific reading.
    GET/PATCH/DELETE /api/swm/cabala/gematria-readings/<id>/
    """
    permission_classes = [IsAuthenticated]
    
    def get_reading(self, reading_id, user):
        reading = get_object_or_404(GematriaReading, id=reading_id)
        if reading.therapist != user and not user.is_staff:
            return None
        return reading
    
    def get(self, request, reading_id):
        reading = self.get_reading(reading_id, request.user)
        if not reading:
            return Response(
                {'error': 'No tiene acceso a esta lectura'},
                status=status.HTTP_403_FORBIDDEN
            )
        return Response(GematriaReadingSerializer(reading).data)
    
    def patch(self, request, reading_id):
        reading = self.get_reading(reading_id, request.user)
        if not reading:
            return Response(
                {'error': 'No tiene acceso a esta lectura'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only allow updating certain fields
        allowed_fields = ['therapist_notes', 'therapist_interpretation', 'highlights', 'status']
        for field in allowed_fields:
            if field in request.data:
                setattr(reading, field, request.data[field])
        
        reading.save()
        return Response(GematriaReadingSerializer(reading).data)
    
    def delete(self, request, reading_id):
        reading = self.get_reading(reading_id, request.user)
        if not reading:
            return Response(
                {'error': 'No tiene acceso a esta lectura'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        reading.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class GematriaSynthesisListView(APIView):
    """
    List all syntheses for a patient.
    GET /api/swm/cabala/gematria-synthesis/?patient_id=<id>
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        patient_id = request.query_params.get('patient_id')
        if not patient_id:
            return Response(
                {'error': 'patient_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        patient = get_object_or_404(Patient, id=patient_id)
        if patient.therapist != request.user and not request.user.is_staff:
            return Response(
                {'error': 'No tiene acceso a este paciente'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        syntheses = GematriaSynthesis.objects.filter(patient=patient).order_by('-created_at')
        serializer = GematriaSynthesisSerializer(syntheses, many=True)
        
        return Response({
            'count': syntheses.count(),
            'syntheses': serializer.data,
        })


class GematriaSynthesisCreateView(APIView):
    """
    Generate a new synthesis from readings.
    POST /api/swm/cabala/gematria-synthesis/generate/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = GematriaSynthesisCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        patient = get_object_or_404(Patient, id=data['patient_id'])
        
        if patient.therapist != request.user and not request.user.is_staff:
            return Response(
                {'error': 'No tiene acceso a este paciente'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        service = GematriaSynthesisService(patient, request.user)
        
        try:
            synthesis = service.create_synthesis(
                reading_ids=[str(r) for r in data.get('reading_ids', [])] or None,
                include_cross_swm=data.get('include_cross_swm', True),
                title=data.get('title', 'Síntesis Gematrica'),
            )
            
            return Response(
                GematriaSynthesisSerializer(synthesis).data,
                status=status.HTTP_201_CREATED
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class GematriaSynthesisDetailView(APIView):
    """
    Get, update or delete a specific synthesis.
    GET/PATCH/DELETE /api/swm/cabala/gematria-synthesis/<id>/
    """
    permission_classes = [IsAuthenticated]
    
    def get_synthesis(self, synthesis_id, user):
        synthesis = get_object_or_404(GematriaSynthesis, id=synthesis_id)
        if synthesis.therapist != user and not user.is_staff:
            return None
        return synthesis
    
    def get(self, request, synthesis_id):
        synthesis = self.get_synthesis(synthesis_id, request.user)
        if not synthesis:
            return Response(
                {'error': 'No tiene acceso a esta síntesis'},
                status=status.HTTP_403_FORBIDDEN
            )
        return Response(GematriaSynthesisSerializer(synthesis).data)
    
    def patch(self, request, synthesis_id):
        synthesis = self.get_synthesis(synthesis_id, request.user)
        if not synthesis:
            return Response(
                {'error': 'No tiene acceso a esta síntesis'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Allow updating therapist fields
        allowed_fields = ['therapist_validation', 'therapist_notes', 'therapist_edits', 'status', 'title']
        for field in allowed_fields:
            if field in request.data:
                setattr(synthesis, field, request.data[field])
        
        synthesis.save()
        return Response(GematriaSynthesisSerializer(synthesis).data)
    
    def delete(self, request, synthesis_id):
        """Delete a synthesis"""
        synthesis = self.get_synthesis(synthesis_id, request.user)
        if not synthesis:
            return Response(
                {'error': 'No tiene acceso a esta síntesis'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        synthesis_title = synthesis.title
        synthesis.delete()
        
        return Response({
            'success': True,
            'message': f'Síntesis "{synthesis_title}" eliminada correctamente',
        })


class GematriaSynthesisExportView(APIView):
    """
    Export synthesis to holistic summary.
    POST /api/swm/cabala/gematria-synthesis/export/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        import logging
        logger = logging.getLogger(__name__)
        
        serializer = GematriaSynthesisExportSerializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"[Export] Validation error: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        synthesis = get_object_or_404(
            GematriaSynthesis,
            id=serializer.validated_data['synthesis_id']
        )
        
        if synthesis.therapist != request.user and not request.user.is_staff:
            return Response(
                {'error': 'No tiene acceso a esta síntesis'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            service = GematriaSynthesisService(synthesis.patient, request.user)
            record_id = service.export_to_holistic(synthesis)
            
            if record_id:
                return Response({
                    'success': True,
                    'message': 'Síntesis exportada al registro holístico del paciente (AnalysisRecord)',
                    'holistic_record_id': record_id,
                    'destination': 'AnalysisRecord (resumen holístico longitudinal)',
                })
            else:
                return Response(
                    {'error': 'Error interno al exportar la síntesis. Revise los logs.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except Exception as e:
            logger.exception(f"[Export] Exception: {e}")
            return Response(
                {'error': f'Error al exportar: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GematriaPatternAnalysisView(APIView):
    """
    Get pattern analysis without creating a synthesis.
    GET /api/swm/cabala/gematria-analysis/?patient_id=<id>
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        patient_id = request.query_params.get('patient_id')
        if not patient_id:
            return Response(
                {'error': 'patient_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        patient = get_object_or_404(Patient, id=patient_id)
        if patient.therapist != request.user and not request.user.is_staff:
            return Response(
                {'error': 'No tiene acceso a este paciente'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        service = GematriaSynthesisService(patient, request.user)
        readings = service.get_patient_readings()
        
        if not readings:
            return Response({
                'has_data': False,
                'message': 'No hay lecturas gematricas para este paciente',
            })
        
        analysis = service.analyze_number_patterns(readings)
        cross_swm = service.get_cross_swm_data()
        
        return Response({
            'has_data': True,
            'pattern_analysis': analysis,
            'cross_swm_available': len(cross_swm),
            'cross_swm_sources': [{'swm': d['swm'], 'date': d['date']} for d in cross_swm],
        })
