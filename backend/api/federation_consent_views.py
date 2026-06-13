# -*- coding: utf-8 -*-
"""Endpoints to grant/revoke federation consent (Phase-1 debt closure)."""

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Patient
from .services.federation_consent_service import set_patient_federation_consent


def _patient_for_user(user):
    return Patient.objects.filter(user=user, is_active=True).first()


def _serialize_consent(patient: Patient) -> dict:
    return {
        'consent_federation': bool(patient.consent_federation),
        'consent_federation_date': (
            patient.consent_federation_date.isoformat()
            if patient.consent_federation_date
            else None
        ),
        'patient_id': patient.id,
    }


class PatientFederationConsentView(APIView):
    """
    GET/POST /api/patient/federation-consent/

    Patient (or personal) user manages their own federation consent.
    POST body: { "consent": true|false }
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = getattr(request.user, 'profile', None)
        if not profile or profile.user_type not in ('patient', 'personal'):
            return Response(
                {'detail': 'Solo consultantes pueden acceder a este recurso.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        patient = _patient_for_user(request.user)
        if not patient:
            return Response(
                {
                    'consent_federation': False,
                    'consent_federation_date': None,
                    'patient_id': None,
                    'detail': 'No hay ficha de consultante vinculada a tu cuenta.',
                },
                status=status.HTTP_200_OK,
            )

        return Response(_serialize_consent(patient), status=status.HTTP_200_OK)

    def post(self, request):
        profile = getattr(request.user, 'profile', None)
        if not profile or profile.user_type not in ('patient', 'personal'):
            return Response(
                {'detail': 'Solo consultantes pueden modificar este consentimiento.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        patient = _patient_for_user(request.user)
        if not patient:
            return Response(
                {'detail': 'No hay ficha de consultante vinculada a tu cuenta.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        consent = request.data.get('consent')
        if not isinstance(consent, bool):
            return Response(
                {'detail': 'El campo "consent" debe ser true o false.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        patient, changed = set_patient_federation_consent(
            patient=patient,
            consent=consent,
            actor_user=request.user,
            source='patient_portal',
        )
        payload = _serialize_consent(patient)
        payload['changed'] = changed
        return Response(payload, status=status.HTTP_200_OK)


class TherapistPatientFederationConsentView(APIView):
    """
    POST /api/therapist/patients/<pk>/federation-consent/

    Therapist with ownership records in-person consent from the client.
    POST body: { "consent": true|false }
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        profile = getattr(request.user, 'profile', None)
        if not profile or profile.user_type != 'therapist':
            return Response(
                {'detail': 'Solo terapeutas pueden registrar este consentimiento.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            patient = Patient.objects.get(pk=pk, therapist=request.user, is_active=True)
        except Patient.DoesNotExist:
            return Response(
                {'detail': 'Consultante no encontrado o no asignado a tu cuenta.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        consent = request.data.get('consent')
        if not isinstance(consent, bool):
            return Response(
                {'detail': 'El campo "consent" debe ser true o false.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        patient, changed = set_patient_federation_consent(
            patient=patient,
            consent=consent,
            actor_user=request.user,
            source='therapist_in_person',
        )
        payload = _serialize_consent(patient)
        payload['changed'] = changed
        return Response(payload, status=status.HTTP_200_OK)