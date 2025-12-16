"""API endpoints mínimos para AnalysisRecord.

Contrato:
- POST /api/analysis-records/ (crear y opcionalmente ejecutar)
- GET /api/analysis-records/ (listar con scope por rol)
- GET /api/analysis-records/{id}/ (detalle con scope por rol)
- GET /api/analysis-records/?patient_id={id} (therapist: resultados de paciente)
- PATCH /api/analysis-records/{uuid}/annotations (therapist: editar anotaciones)
- GET /api/analysis-records/my-results/ (patient: resultados propios)

No modifica flujos legacy; solo expone el nuevo núcleo normalizado.
"""

from typing import Any

from django.db.models import Q
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied, NotFound

from api.models import AnalysisRecord, Patient
from api.serializers import AnalysisRecordSerializer
from api.permissions import IsTherapist
from api.services.analysis_service import (
    create_analysis_record,
    create_and_execute_analysis,
)


class AnalysisRecordListCreateView(generics.ListCreateAPIView):
    """Listar y crear AnalysisRecord.

    POST puede aceptar un flag `execute` en el body (bool) para
    ejecutar inmediatamente después de crear.
    """

    serializer_class = AnalysisRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, "profile", None)

        # Admin / staff: lectura global para soporte de plataforma (read-only)
        if profile and (profile.is_admin or user.is_staff or user.is_superuser):
            queryset = AnalysisRecord.objects.all()
        # Scope por rol
        elif not profile:
            queryset = AnalysisRecord.objects.none()
        else:
            user_type = profile.user_type

            if user_type == "therapist":
                # Registros creados por el terapeuta o asociados a sus pacientes
                queryset = AnalysisRecord.objects.filter(
                    Q(created_by_user=user)
                    | Q(therapist=user)
                    | Q(patient__therapist=user)
                )
                
                # Filtro opcional por patient_id (query param)
                patient_id = self.request.query_params.get('patient_id')
                if patient_id:
                    try:
                        patient_id_int = int(patient_id)
                        # Validar ownership
                        from api.models import Patient
                        patient = Patient.objects.filter(pk=patient_id_int, therapist=user).first()
                        if patient:
                            queryset = queryset.filter(patient=patient)
                        else:
                            queryset = AnalysisRecord.objects.none()
                    except (ValueError, TypeError):
                        queryset = AnalysisRecord.objects.none()
            elif user_type == "patient":
                # Registros donde el user es sujeto o está vinculado como paciente,
                # y la visibilidad lo permite
                queryset = AnalysisRecord.objects.filter(
                    Q(subject_user=user) | Q(patient__user=user)
                ).filter(
                    Q(visibility__in=["patient", "both"]) | Q(visibility__isnull=True)
                )
            elif user_type == "personal":
                # Registros personales del usuario
                queryset = AnalysisRecord.objects.filter(
                    subject_user=user,
                )
            else:
                # Otros tipos: sin acceso por defecto
                queryset = AnalysisRecord.objects.none()
        
        return queryset.order_by("-created_at")

    def create(self, request, *args: Any, **kwargs: Any) -> Response:
        execute_flag = bool(request.data.get("execute", False))

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        if execute_flag:
            record = create_and_execute_analysis(validated_data)
        else:
            record = create_analysis_record(validated_data)

        output_serializer = self.get_serializer(record)
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class AnalysisRecordDetailView(generics.RetrieveAPIView):
    """Detalle de AnalysisRecord con scope por rol."""

    serializer_class = AnalysisRecordSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "pk"

    def get_queryset(self):
        # Reutilizar la misma lógica de scope que la vista de listado
        list_view = AnalysisRecordListCreateView()
        list_view.request = self.request
        return list_view.get_queryset()

    def get_serializer_context(self):
        """Añadir contexto para filtrar therapist_annotations según rol."""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


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

        try:
            record = AnalysisRecord.objects.get(pk=pk)
        except AnalysisRecord.DoesNotExist:
            return Response(
                {'error': 'Resultado no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Validar ownership: el terapeuta debe ser el propietario del resultado
        if record.therapist_id != therapist.id:
            return Response(
                {'error': 'No tienes permisos para editar este resultado.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Validar que solo se actualicen annotations
        allowed_fields = {'summary', 'notes', 'visible_to_patient'}
        annotations_data = request.data.get('therapist_annotations', {})
        
        if not isinstance(annotations_data, dict):
            return Response(
                {'error': 'therapist_annotations debe ser un objeto JSON.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Construir objeto de anotaciones
        current_annotations = record.therapist_annotations or {}
        updated_annotations = {
            'summary': annotations_data.get('summary', current_annotations.get('summary', '')),
            'notes': annotations_data.get('notes', current_annotations.get('notes', '')),
            'visible_to_patient': annotations_data.get('visible_to_patient', current_annotations.get('visible_to_patient', False)),
        }

        # Actualizar solo therapist_annotations
        record.therapist_annotations = updated_annotations
        record.save(update_fields=['therapist_annotations'])

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
            import traceback
            print(f"Error en PatientMyResultsView: {e}")
            print(traceback.format_exc())
            return Response(
                {'error': f'Error interno del servidor: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

