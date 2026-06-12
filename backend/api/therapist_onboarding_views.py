"""Estado de onboarding para terapeutas recién registrados."""

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AnalysisRecord, Patient, UserProfile
from .permissions import IsTherapist


def _is_therapist_profile_complete(profile: UserProfile) -> bool:
    name = (profile.legal_full_name or profile.full_name or '').strip()
    parts = [part for part in name.split() if part]
    has_name = len(parts) >= 2
    has_profession = bool((profile.profession or '').strip())
    has_phone = bool((profile.phone or '').strip())
    return has_name and has_profession and has_phone


class TherapistOnboardingView(APIView):
    """
    GET /api/therapist/onboarding/

    Devuelve flags de progreso del checklist de primeros pasos.
    Solo agregados booleanos — sin PII.
    """

    permission_classes = [IsAuthenticated, IsTherapist]

    def get(self, request):
        user = request.user
        profile = user.profile

        profile_complete = _is_therapist_profile_complete(profile)

        has_patient = Patient.objects.filter(
            therapist=user,
            is_active=True,
        ).exists()

        has_cabala_aplicada_analysis = AnalysisRecord.objects.filter(
            therapist=user,
            module_code__startswith='CABALA_APLICADA_',
        ).exists()

        steps = {
            'profile_complete': profile_complete,
            'has_patient': has_patient,
            'has_tree_analysis': has_cabala_aplicada_analysis,
        }

        all_backend_complete = all(steps.values())

        return Response(
            {
                'steps': steps,
                'all_backend_complete': all_backend_complete,
            },
            status=status.HTTP_200_OK,
        )