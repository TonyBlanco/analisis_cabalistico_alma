from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
import logging

from .models import AnalysisRecord, Patient
from .serializers import AnalysisRecordSerializer
from .permissions import IsTherapist

logger = logging.getLogger(__name__)


class TherapistPatientResultsView(APIView):
    """
    GET /api/analysis-records/?patient_id={id}
    
    Terapeuta: Lista resultados del paciente activo.
    Requiere: role = therapist, ownership del paciente.
    """
    permission_classes = [IsAuthenticated, IsTherapist]

    def get(self, request):
        patient_id = request.query_params.get('patient_id')
        if not patient_id:
            return Response(
                {'error': 'patient_id es requerido en query params.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        therapist = request.user

        # Validar ownership
        try:
            patient = Patient.objects.get(pk=patient_id, therapist=therapist)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Paciente no encontrado o no tienes permisos para acceder.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Obtener resultados del paciente
        records = AnalysisRecord.objects.filter(
            patient=patient
        ).order_by('-created_at')

        serializer = AnalysisRecordSerializer(records, many=True, context={'request': request})
        return Response({'results': serializer.data}, status=status.HTTP_200_OK)


class UpdateAnalysisAnnotationsView(APIView):
    """
    PATCH /api/analysis-records/{uuid}/annotations
    
    Terapeuta: Actualiza anotaciones de un resultado.
    Requiere: role = therapist, ownership del resultado.
    NO permite modificar computed_result ni snapshots.
    """
    permission_classes = [IsAuthenticated, IsTherapist]

    def patch(self, request, pk):
        therapist = request.user
        logger.info(
            "UpdateAnalysisAnnotationsView.patch called",
            extra={
                "user_id": getattr(therapist, "id", None),
                "record_id": str(pk),
            },
        )

        try:
            record = AnalysisRecord.objects.get(pk=pk)
        except AnalysisRecord.DoesNotExist:
            logger.warning(
                "AnalysisRecord not found for annotations",
                extra={"user_id": therapist.id, "record_id": str(pk)},
            )
            return Response(
                {'error': 'Resultado no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Validar ownership: el terapeuta debe ser el propietario del resultado
        if record.therapist_id != therapist.id:
            logger.warning(
                "Therapist tried to edit annotations without ownership",
                extra={
                    "user_id": therapist.id,
                    "record_id": str(record.id),
                    "record_therapist_id": record.therapist_id,
                },
            )
            return Response(
                {'error': 'No tienes permisos para editar este resultado.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Validar que solo se actualicen annotations
        allowed_fields = {
            'summary',
            'notes',
            'clinical_notes',
            'diagnosis_hypotheses',
            'recommendations_next_steps',
            'visible_to_patient',
        }
        annotations_data = request.data.get('therapist_annotations', {})
        
        if not isinstance(annotations_data, dict):
            return Response(
                {'error': 'therapist_annotations debe ser un objeto JSON.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        current_annotations = record.therapist_annotations or {}

        # Merge defensivo: solo keys permitidas.
        updated_annotations = {
            key: annotations_data.get(key, current_annotations.get(key))
            for key in allowed_fields
        }

        record.therapist_annotations = updated_annotations

        # Si es un export holístico, refrescar markdown para que el PDF refleje los campos guardados.
        try:
            if record.module_code == 'HOLISTIC_EXPORT_V1' and isinstance(record.computed_result, dict):
                export_obj = record.computed_result.get('export')
                if isinstance(export_obj, dict):
                    export_obj['therapist_annotations'] = {
                        'clinical_notes': updated_annotations.get('clinical_notes', '') or '',
                        'diagnosis_hypotheses': updated_annotations.get('diagnosis_hypotheses', '') or '',
                        'recommendations_next_steps': updated_annotations.get('recommendations_next_steps', '') or '',
                    }
                    from .patient_holistic_export_views import _build_markdown

                    export_obj['markdown'] = _build_markdown(export_obj)
                    record.computed_result['export'] = export_obj
                    record.save(update_fields=['therapist_annotations', 'computed_result'])
                else:
                    record.save(update_fields=['therapist_annotations'])
            else:
                record.save(update_fields=['therapist_annotations'])
        except Exception:
            record.save(update_fields=['therapist_annotations'])

        logger.info(
            "Therapist annotations updated successfully",
            extra={
                "user_id": therapist.id,
                "record_id": str(record.id),
                "visible_to_patient": updated_annotations.get('visible_to_patient', False),
            },
        )

        serializer = AnalysisRecordSerializer(record, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class PatientMyResultsView(APIView):
    """
    GET /api/analysis-records/my-results/
    
    Paciente: Lista sus propios resultados.
    Filtra por: subject_user = request.user, visibility in (patient, both)
    Oculta therapist_annotations a menos que visible_to_patient = true
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            profile = getattr(user, 'profile', None)

            # Validar que es paciente
            if not profile or profile.user_type != 'patient':
                return Response(
                    {'error': 'Solo los pacientes pueden acceder a este endpoint.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Obtener resultados del paciente
            records = AnalysisRecord.objects.filter(
                Q(subject_user=user) | Q(patient__user=user)
            ).filter(
                Q(visibility__in=['patient', 'both']) | Q(visibility__isnull=True)
            ).order_by('-created_at')

            # Serializar y filtrar annotations según visibilidad
            serializer = AnalysisRecordSerializer(records, many=True, context={'request': request})
            results_data = serializer.data

            # Filtrar therapist_annotations: solo mostrar si visible_to_patient = true
            for result in results_data:
                annotations = result.get('therapist_annotations', {})
                if isinstance(annotations, dict) and not annotations.get('visible_to_patient', False):
                    # Ocultar annotations si no están marcadas como visibles
                    result['therapist_annotations'] = None

            return Response({'results': results_data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Error en PatientMyResultsView.get")
            return Response(
                {'error': f'Error interno del servidor: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class AnalysisRecordListCreateView(generics.ListCreateAPIView):
    """
    GET: Lista AnalysisRecords visibles para el usuario autenticado.
    POST: Crea un nuevo AnalysisRecord (validaciones en el serializer).
    """

    serializer_class = AnalysisRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = AnalysisRecord.objects.all()

        # Soportar GET /api/analysis-records/?patient_id={id} para terapeutas
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            profile = getattr(user, 'profile', None)
            if not profile or profile.user_type != 'therapist':
                # Usuario sin rol terapeuta: no ve nada en este modo
                return AnalysisRecord.objects.none()

            return qs.filter(
                patient__id=patient_id,
                therapist=user,
            ).order_by('-created_at')

        # Filtro general por ownership/relación
        return qs.filter(
            Q(created_by_user=user)
            | Q(subject_user=user)
            | Q(patient__therapist=user)
            | Q(patient__user=user)
        ).order_by('-created_at')

    def perform_create(self, serializer):
        # El serializer ya fija created_by_user y execution_mode en validate()
        serializer.save()


class AnalysisRecordDetailView(generics.RetrieveAPIView):
    """
    GET: Detalle de un AnalysisRecord concreto, validando permisos básicos.
    """

    serializer_class = AnalysisRecordSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'
    queryset = AnalysisRecord.objects.all()

    def get_queryset(self):
        user = self.request.user
        return AnalysisRecord.objects.filter(
            Q(created_by_user=user)
            | Q(subject_user=user)
            | Q(patient__therapist=user)
            | Q(patient__user=user)
        )


# ========== VISTAS PARA MOTOR DE SÍNTESIS HOLÍSTICA EVALUATIVA (MSHE) ==========

class HolisticSynthesisView(APIView):
    """
    POST /api/analysis-records/holistic-synthesis/?patient_id={id}

    Terapeuta: Genera síntesis holística evaluativa automática.
    Lee todos los analysis-records no clínicos del paciente.
    Requiere: role = therapist, ownership del paciente.
    """
    permission_classes = [IsAuthenticated, IsTherapist]

    def post(self, request):
        therapist = request.user
        patient_id = request.query_params.get('patient_id')

        if not patient_id:
            return Response(
                {'error': 'patient_id es requerido en query params.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar ownership del paciente
        try:
            patient = Patient.objects.get(pk=patient_id, therapist=therapist)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Paciente no encontrado o no tienes permisos.'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            # Importar aquí para evitar dependencias circulares
            from .holistic_synthesis_engine import HolisticSynthesisEngine

            # Crear motor de síntesis
            engine = HolisticSynthesisEngine(patient, therapist)

            # Computar síntesis
            synthesis_data = engine.compute_synthesis()

            # Generar análisis IA
            ai_analysis = engine.generate_ai_analysis(synthesis_data)

            # Preparar datos para guardar
            raw_input = {
                'holistic_synthesis': {
                    'scores': synthesis_data['scores'],
                    'color_alerts': synthesis_data['color_alerts'],
                    'axis_contributions': synthesis_data['axis_contributions'],
                    'metadata': synthesis_data['metadata']
                },
                'ai_analysis': ai_analysis
            }

            # Crear AnalysisRecord
            analysis_record = AnalysisRecord.objects.create(
                kind='holistic_evaluative_synthesis',
                module_code='MSHE',
                role_context='therapist',
                execution_mode='therapist_clinical',
                birth_data_snapshot={},  # No aplica para síntesis
                algorithm_snapshot={
                    'engine': 'HolisticSynthesisEngine',
                    'version': '1.0',
                    'build_hash': None,
                    'params': {
                        'weights': synthesis_data['metadata']['weights_used']
                    }
                },
                raw_input=raw_input,
                computed_result=synthesis_data,
                visibility='therapist',
                created_by_user=therapist,
                therapist=therapist,
                patient=patient
            )

            # Serializar respuesta
            serializer = AnalysisRecordSerializer(analysis_record, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.exception("Error en HolisticSynthesisView.post")
            return Response(
                {'error': f'Error generando síntesis holística: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TherapistHolisticConfigView(APIView):
    """
    GET /api/therapist/holistic-config/
    PUT /api/therapist/holistic-config/

    Terapeuta: Gestiona configuración de pesos MSHE.
    """
    permission_classes = [IsAuthenticated, IsTherapist]

    def get(self, request):
        therapist = request.user

        try:
            from .models import TherapistHolisticConfig
            config = TherapistHolisticConfig.objects.get(therapist=therapist)
            return Response({
                'weights': config.weights,
                'created_at': config.created_at,
                'updated_at': config.updated_at
            })
        except TherapistHolisticConfig.DoesNotExist:
            # Retornar configuración por defecto
            from .models import TherapistHolisticConfig
            default_weights = TherapistHolisticConfig.get_default_weights()
            return Response({
                'weights': default_weights,
                'message': 'Usando pesos por defecto'
            })

    def put(self, request):
        therapist = request.user
        weights = request.data.get('weights', {})

        # Validar que los pesos sumen 1.0
        total = sum(weights.values())
        if abs(total - 1.0) > 0.001:
            return Response(
                {'error': f'Los pesos deben sumar 1.0, actualmente suman {total}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar pesos individuales
        for key, value in weights.items():
            if not isinstance(value, (int, float)) or value < 0 or value > 1:
                return Response(
                    {'error': f'Peso inválido para {key}: {value}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        from .models import TherapistHolisticConfig
        config, created = TherapistHolisticConfig.objects.get_or_create(
            therapist=therapist,
            defaults={'weights': weights}
        )

        if not created:
            config.weights = weights
            config.save()

        return Response({
            'weights': config.weights,
            'created': created,
            'updated_at': config.updated_at
        })
