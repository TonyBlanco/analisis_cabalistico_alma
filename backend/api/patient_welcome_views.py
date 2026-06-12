"""
Acceso directo para consultantes vía enlace firmado (WhatsApp / email).
"""
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Patient
from .notifications.patient_access import validate_patient_welcome_token


class PatientWelcomePreviewView(APIView):
    """GET /api/auth/patient-welcome/?token=... — metadatos del enlace (sin contraseña)."""
    permission_classes = [AllowAny]

    def get(self, request):
        token = (request.query_params.get('token') or '').strip()
        if not token:
            return Response({'error': 'token_required'}, status=status.HTTP_400_BAD_REQUEST)

        parsed = validate_patient_welcome_token(token)
        if not parsed:
            return Response({'error': 'token_invalid'}, status=status.HTTP_400_BAD_REQUEST)

        patient_id, user_id = parsed
        try:
            patient = Patient.objects.select_related('user', 'therapist__profile').get(
                pk=patient_id,
                user_id=user_id,
                is_active=True,
            )
        except Patient.DoesNotExist:
            return Response({'error': 'patient_not_found'}, status=status.HTTP_404_NOT_FOUND)

        user = patient.user
        if not user or not user.is_active:
            return Response({'error': 'account_inactive'}, status=status.HTTP_403_FORBIDDEN)

        therapist_name = ''
        if patient.therapist_id:
            tp = getattr(patient.therapist, 'profile', None)
            therapist_name = (
                tp.full_name if tp and tp.full_name
                else patient.therapist.get_full_name() or patient.therapist.username
            )

        return Response({
            'valid': True,
            'username': user.username,
            'patient_first_name': patient.first_name or user.first_name,
            'therapist_name': therapist_name,
            'login_url': '/login',
        })


class PatientWelcomeRedeemView(APIView):
    """POST /api/auth/patient-welcome/ — canjea enlace y devuelve token de sesión."""
    permission_classes = [AllowAny]

    def post(self, request):
        token = (request.data.get('token') or '').strip()
        if not token:
            return Response({'error': 'token_required'}, status=status.HTTP_400_BAD_REQUEST)

        parsed = validate_patient_welcome_token(token)
        if not parsed:
            return Response({'error': 'token_invalid'}, status=status.HTTP_400_BAD_REQUEST)

        patient_id, user_id = parsed
        try:
            patient = Patient.objects.select_related('user').get(
                pk=patient_id,
                user_id=user_id,
                is_active=True,
            )
        except Patient.DoesNotExist:
            return Response({'error': 'patient_not_found'}, status=status.HTTP_404_NOT_FOUND)

        user = patient.user
        if not user or not user.is_active:
            return Response({'error': 'account_inactive'}, status=status.HTTP_403_FORBIDDEN)

        profile = getattr(user, 'profile', None)
        if not profile or profile.user_type != 'patient':
            return Response({'error': 'not_patient_account'}, status=status.HTTP_403_FORBIDDEN)

        auth_token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': auth_token.key,
            'role': 'patient',
            'username': user.username,
            'redirect': '/dashboard/patient',
        })