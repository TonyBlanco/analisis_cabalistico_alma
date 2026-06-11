"""
Onboarding de beta tester médica (Modo Híbrido — Step 9).

- POST /api/profile/clinical-mode-request/  (therapist-only)
- POST /api/beta-feedback/                  (cualquier usuario autenticado)

La activación del modo clínico NO ocurre aquí: un administrador la verifica vía
ClinicalCredentialVerificationView (UserProfile.clinical_mode_enabled). Esta capa
solo registra la solicitud y marca UserProfile.clinical_mode_requested=True.
"""
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .clinical_onboarding_models import ClinicalModeRequest, BetaFeedback


VALID_FEEDBACK_CATEGORIES = {c[0] for c in BetaFeedback.CATEGORY_CHOICES}
VALID_FEEDBACK_SEVERITIES = {c[0] for c in BetaFeedback.SEVERITY_CHOICES}


def _profile_flags(profile):
    can_clinical = getattr(profile, 'can_use_clinical_lexicon', None)
    can_clinical_val = bool(can_clinical()) if callable(can_clinical) else bool(can_clinical)
    return {
        'clinical_mode_requested': bool(getattr(profile, 'clinical_mode_requested', False)),
        'clinical_mode_enabled': bool(getattr(profile, 'clinical_mode_enabled', False)),
        'can_use_clinical_lexicon': can_clinical_val,
    }


class ClinicalModeRequestView(APIView):
    """Solicitud de activación del vocabulario clínico por un terapeuta."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = getattr(request.user, 'profile', None)
        if not profile or getattr(profile, 'user_type', None) != 'therapist':
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)

        flags = _profile_flags(profile)
        if flags['clinical_mode_enabled']:
            return Response(
                {
                    'status': 'already_enabled',
                    'message': 'El modo clínico ya está activado para tu cuenta.',
                    'request_id': None,
                    **flags,
                },
                status=status.HTTP_200_OK,
            )

        license_number = (request.data.get('license_number') or '').strip()
        specialty = (request.data.get('specialty') or '').strip()
        professional_body = (request.data.get('professional_body') or '').strip()
        notes = (request.data.get('notes') or '').strip()
        responsible_use = bool(request.data.get('responsible_use_accepted'))
        anti_fraud = bool(request.data.get('anti_fraud_rail_accepted'))

        if not license_number or not specialty:
            return Response(
                {'error': 'credential_required',
                 'message': 'Se requieren número de licencia y especialidad.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not responsible_use or not anti_fraud:
            return Response(
                {'error': 'acceptance_required',
                 'message': 'Debes aceptar el uso responsable y el rail anti-fraude.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing = ClinicalModeRequest.objects.filter(
            therapist=request.user, status=ClinicalModeRequest.STATUS_PENDING,
        ).first()
        if existing or flags['clinical_mode_requested']:
            return Response(
                {
                    'status': 'already_requested',
                    'message': 'Ya tienes una solicitud de modo clínico pendiente de revisión.',
                    'request_id': existing.id if existing else None,
                    **flags,
                },
                status=status.HTTP_200_OK,
            )

        req = ClinicalModeRequest.objects.create(
            therapist=request.user,
            license_number=license_number,
            specialty=specialty,
            professional_body=professional_body,
            notes=notes,
            responsible_use_accepted=responsible_use,
            anti_fraud_rail_accepted=anti_fraud,
        )

        # Marcar el perfil como "solicitado" (la activación la hace un admin).
        try:
            profile.clinical_mode_requested = True
            profile.save(update_fields=['clinical_mode_requested'])
        except Exception:
            profile.clinical_mode_requested = True
            profile.save()

        flags = _profile_flags(profile)
        return Response(
            {
                'status': 'requested',
                'message': 'Solicitud registrada. Un administrador verificará tu credencial.',
                'request_id': req.id,
                **flags,
            },
            status=status.HTTP_201_CREATED,
        )


class BetaFeedbackView(APIView):
    """Recibe feedback estructurado de beta testers."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        category = (request.data.get('category') or 'other').strip()
        if category not in VALID_FEEDBACK_CATEGORIES:
            category = 'other'
        severity = (request.data.get('severity') or 'low').strip()
        if severity not in VALID_FEEDBACK_SEVERITIES:
            severity = 'low'
        message = (request.data.get('message') or '').strip()
        if not message:
            return Response(
                {'error': 'message_required', 'message': 'El mensaje no puede estar vacío.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        page_context = (request.data.get('page_context') or '').strip()[:255]

        fb = BetaFeedback.objects.create(
            user=request.user,
            category=category,
            severity=severity,
            message=message,
            page_context=page_context,
        )
        return Response(
            {'status': 'received', 'message': 'Gracias por tu feedback.', 'feedback_id': fb.id},
            status=status.HTTP_201_CREATED,
        )
