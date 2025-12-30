from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Patient, ResonanciaObservation
from .permissions import IsTherapist
from .serializers import ResonanciaObservationSerializer


def _get_owned_patient_or_404(*, therapist, patient_id: str) -> Patient:
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

    def create(self, request, *args, **kwargs):
        subject_id = request.query_params.get('subject')
        if not subject_id:
            return Response({'error': 'subject es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        patient = _get_owned_patient_or_404(therapist=request.user, patient_id=subject_id)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(author=request.user, subject=patient)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class ResonanciaObservationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/resonancia/observations/{id}/
    PATCH /api/resonancia/observations/{id}/
    DELETE /api/resonancia/observations/{id}/
    """

    serializer_class = ResonanciaObservationSerializer
    permission_classes = [IsAuthenticated, IsTherapist]
    lookup_field = 'pk'

    def get_queryset(self):
        # Solo el author puede ver/editar/borrar sus observaciones.
        return ResonanciaObservation.objects.filter(author=self.request.user).order_by('-created_at')
