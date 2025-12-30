from django.http import Http404
from django.shortcuts import get_object_or_404
from django.db.utils import OperationalError, ProgrammingError
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from .models import Patient, ResonanciaObservation, ResonanciaRelation
from .permissions import IsTherapist
from .serializers import ResonanciaObservationSerializer, ResonanciaRelationSerializer


def _get_owned_patient_or_404(*, therapist, patient_id: str) -> Patient:
    if patient_id is None:
        raise Http404
    try:
        patient_id_str = str(patient_id)
    except Exception:
        raise Http404

    # Patient.id es int en este proyecto; si no es un id numérico, tratamos como no encontrado.
    if not patient_id_str.isdigit():
        raise Http404

    patient = get_object_or_404(Patient, pk=patient_id, therapist=therapist)
    if patient.user_id and patient.user_id == therapist.id:
        # Bloquear autoevaluación (consistente con IsTherapistAndOwnsPatient).
        raise PermissionDenied('Autoevaluación no permitida.')
    return patient


class ResonanciaObservationListCreateView(generics.ListCreateAPIView):
    """
    GET /api/resonancia/observations/?subject={patient_id}&type=...&context=...&state=...
    POST /api/resonancia/observations/?subject={patient_id}

    Registro manual de observaciones simbólicas (sin inferencias).
    """

    serializer_class = ResonanciaObservationSerializer
    permission_classes = [IsAuthenticated, IsTherapist]
    renderer_classes = [JSONRenderer]

    def get_queryset(self):
        user = self.request.user
        subject_id = self.request.query_params.get('subject')
        if not subject_id:
            return ResonanciaObservation.objects.none()

        patient = _get_owned_patient_or_404(therapist=user, patient_id=subject_id)

        qs = ResonanciaObservation.objects.filter(author=user, subject=patient).order_by('-created_at')
        obs_type = self.request.query_params.get('type')
        obs_context = self.request.query_params.get('context')
        obs_state = self.request.query_params.get('state')
        if obs_type:
            qs = qs.filter(type=obs_type)
        if obs_context:
            qs = qs.filter(context=obs_context)
        if obs_state:
            qs = qs.filter(state=obs_state)
        return qs

    def list(self, request, *args, **kwargs):
        subject_id = request.query_params.get('subject')
        if not subject_id:
            return Response([], status=status.HTTP_200_OK)

        if not str(subject_id).isdigit():
            return Response([], status=status.HTTP_200_OK)

        try:
            return super().list(request, *args, **kwargs)
        except (Http404, PermissionDenied):
            raise
        except (OperationalError, ProgrammingError):
            return Response(
                {
                    'error': 'Error de base de datos al consultar observaciones.',
                    'hint': 'Verifica que las migraciones estén aplicadas (incluyendo api.0045_resonanciaobservation).',
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception:
            return Response(
                {'error': 'Error interno del servidor.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def create(self, request, *args, **kwargs):
        subject_id = request.query_params.get('subject')
        if not subject_id:
            return Response({'error': 'subject es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        if not str(subject_id).isdigit():
            return Response({'error': 'subject inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            patient = _get_owned_patient_or_404(therapist=request.user, patient_id=subject_id)
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(author=request.user, subject=patient)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except (Http404, PermissionDenied):
            raise
        except ValidationError:
            raise
        except (OperationalError, ProgrammingError):
            return Response(
                {
                    'error': 'Error de base de datos al guardar la observación.',
                    'hint': 'Verifica que las migraciones estén aplicadas (incluyendo api.0045_resonanciaobservation).',
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception:
            return Response(
                {'error': 'Error interno del servidor.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ResonanciaObservationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/resonancia/observations/{id}/
    PATCH /api/resonancia/observations/{id}/
    DELETE /api/resonancia/observations/{id}/
    """

    serializer_class = ResonanciaObservationSerializer
    permission_classes = [IsAuthenticated, IsTherapist]
    renderer_classes = [JSONRenderer]
    lookup_field = 'pk'

    def get_queryset(self):
        # Solo el author puede ver/editar/borrar sus observaciones.
        return ResonanciaObservation.objects.filter(author=self.request.user).order_by('-created_at')

    def retrieve(self, request, *args, **kwargs):
        try:
            return super().retrieve(request, *args, **kwargs)
        except (Http404, PermissionDenied):
            raise
        except (OperationalError, ProgrammingError):
            return Response(
                {
                    'error': 'Error de base de datos al consultar la observación.',
                    'hint': 'Verifica que las migraciones estén aplicadas (incluyendo api.0045_resonanciaobservation).',
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception:
            return Response({'error': 'Error interno del servidor.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except (Http404, PermissionDenied):
            raise
        except (OperationalError, ProgrammingError):
            return Response(
                {
                    'error': 'Error de base de datos al actualizar la observación.',
                    'hint': 'Verifica que las migraciones estén aplicadas (incluyendo api.0045_resonanciaobservation).',
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception:
            return Response({'error': 'Error interno del servidor.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except (Http404, PermissionDenied):
            raise
        except (OperationalError, ProgrammingError):
            return Response(
                {
                    'error': 'Error de base de datos al eliminar la observación.',
                    'hint': 'Verifica que las migraciones estén aplicadas (incluyendo api.0045_resonanciaobservation).',
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception:
            return Response({'error': 'Error interno del servidor.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResonanciaRelationListCreateView(generics.ListCreateAPIView):
    """
    GET /api/resonancia/relations/?subject={patient_id}&context=...
    POST /api/resonancia/relations/?subject={patient_id}

    Registro manual de relaciones simbólicas (Keypad 1-9, sin inferencias).
    """

    serializer_class = ResonanciaRelationSerializer
    permission_classes = [IsAuthenticated, IsTherapist]
    renderer_classes = [JSONRenderer]

    def get_queryset(self):
        user = self.request.user
        subject_id = self.request.query_params.get('subject')
        if not subject_id:
            return ResonanciaRelation.objects.none()

        patient = _get_owned_patient_or_404(therapist=user, patient_id=subject_id)

        qs = ResonanciaRelation.objects.filter(author=user, subject=patient).order_by('-created_at')
        context = self.request.query_params.get('context')
        if context:
            qs = qs.filter(context=context)
        return qs

    def list(self, request, *args, **kwargs):
        subject_id = request.query_params.get('subject')
        if not subject_id:
            return Response([], status=status.HTTP_200_OK)

        if not str(subject_id).isdigit():
            return Response([], status=status.HTTP_200_OK)

        try:
            return super().list(request, *args, **kwargs)
        except (Http404, PermissionDenied):
            raise
        except (OperationalError, ProgrammingError):
            return Response(
                {
                    'error': 'Error de base de datos al consultar relaciones.',
                    'hint': 'Verifica que las migraciones estén aplicadas (incluyendo api.0046_resonanciarelation).',
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception:
            return Response({'error': 'Error interno del servidor.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request, *args, **kwargs):
        subject_id = request.query_params.get('subject')
        if not subject_id:
            return Response({'error': 'subject es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        if not str(subject_id).isdigit():
            return Response({'error': 'subject inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            patient = _get_owned_patient_or_404(therapist=request.user, patient_id=subject_id)
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(author=request.user, subject=patient, from_ref='consultante')
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except (Http404, PermissionDenied):
            raise
        except ValidationError:
            raise
        except (OperationalError, ProgrammingError):
            return Response(
                {
                    'error': 'Error de base de datos al guardar la relación.',
                    'hint': 'Verifica que las migraciones estén aplicadas (incluyendo api.0046_resonanciarelation).',
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception:
            return Response({'error': 'Error interno del servidor.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
