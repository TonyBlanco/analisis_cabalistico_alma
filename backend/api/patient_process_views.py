# -*- coding: utf-8 -*-
"""Patient-safe process milestones for the client timeline (no scores or clinical detail)."""

from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AnalysisRecord, CabalisticAnalysis, Patient
from .models_astrology import AstrologyNatalChart, AstrologySessionReport

THERAPIST_ACTIVITY_LABELS = {
    'natal_chart': 'Tu terapeuta ha calculado tu carta natal',
    'tarot': 'Tu terapeuta ha registrado una lectura de tarot',
    'astrology': 'Tu terapeuta ha preparado tu exploración astrológica',
    'gematria': 'Tu terapeuta ha trabajado con tu nombre y gematría',
    'soul-map': 'Tu terapeuta ha elaborado un mapa del alma',
    'tikun': 'Tu terapeuta ha explorado tu tikún',
    'astrology_report': 'Tu terapeuta ha preparado un informe astrológico',
    'MSHE': 'Tu terapeuta ha registrado una síntesis de tu proceso',
    'SCID5': 'Tu terapeuta ha registrado una exploración estructurada contigo',
    'HOLISTIC_EXPORT_V1': 'Tu terapeuta ha integrado lecturas de tu proceso',
    'CABALA_APLICADA': 'Tu terapeuta ha trabajado en tu árbol cabalístico',
}


def _patient_for_user(user):
    return Patient.objects.filter(user=user, is_active=True).first()


class PatientProcessMilestonesView(APIView):
    """
    GET /api/patient/process-milestones/

    Returns patient-safe therapist activity milestones (existence + date only).
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.user_type not in ('patient', 'personal'):
            return Response(
                {'detail': 'Solo consultantes pueden acceder a este recurso.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        patient = _patient_for_user(user)
        milestones = []
        pending_backend = []

        if not patient:
            return Response(
                {
                    'milestones': [],
                    'pending_backend': ['patient_profile_link'],
                },
                status=status.HTTP_200_OK,
            )

        try:
            chart = AstrologyNatalChart.objects.filter(patient=patient).order_by('-updated_at').first()
            if chart:
                payload = chart.chart_payload or {}
                metadatos = payload.get('metadatos') or {}
                milestones.append({
                    'id': f'natal-{patient.id}',
                    'kind': 'therapist_activity',
                    'activity_type': 'natal_chart',
                    'status': 'completed',
                    'title': THERAPIST_ACTIVITY_LABELS['natal_chart'],
                    'date': metadatos.get('calculated_at') or (
                        chart.updated_at.isoformat() if chart.updated_at else None
                    ),
                })
        except Exception:
            pending_backend.append('natal_chart_lookup')

        try:
            for analysis in CabalisticAnalysis.objects.filter(patient=patient).order_by('-created_at')[:15]:
                activity_type = analysis.analysis_type or 'cabala'
                title = THERAPIST_ACTIVITY_LABELS.get(
                    activity_type,
                    'Tu terapeuta ha registrado una exploración simbólica',
                )
                milestones.append({
                    'id': f'cabala-{analysis.id}',
                    'kind': 'therapist_activity',
                    'activity_type': activity_type,
                    'status': 'completed',
                    'title': title,
                    'date': analysis.created_at.isoformat() if analysis.created_at else None,
                })
        except Exception:
            pending_backend.append('cabalistic_analyses')

        try:
            shared_reports = AstrologySessionReport.objects.filter(
                patient=patient,
            ).filter(
                Q(is_shared_with_patient=True) | Q(visibility__in=['patient', 'both']),
            ).order_by('-created_at')[:10]
            for report in shared_reports:
                milestones.append({
                    'id': f'astro-report-{report.id}',
                    'kind': 'therapist_activity',
                    'activity_type': 'astrology_report',
                    'status': 'completed',
                    'title': THERAPIST_ACTIVITY_LABELS['astrology_report'],
                    'date': report.created_at.isoformat() if report.created_at else None,
                })
        except Exception:
            pending_backend.append('astrology_session_reports')

        try:
            records = AnalysisRecord.objects.filter(
                Q(subject_user=user) | Q(patient__user=user),
                visibility__in=['patient', 'both'],
            ).order_by('-created_at')[:15]
            for record in records:
                module = (record.module_code or '').upper()
                if module == 'SCDF':
                    continue
                title = THERAPIST_ACTIVITY_LABELS.get(
                    module,
                    'Tu terapeuta ha registrado un avance en tu proceso',
                )
                milestones.append({
                    'id': f'analysis-{record.id}',
                    'kind': 'therapist_activity',
                    'activity_type': module.lower() if module else 'analysis',
                    'status': 'completed',
                    'title': title,
                    'date': record.created_at.isoformat() if record.created_at else None,
                })
        except Exception:
            pending_backend.append('analysis_records')

        # TODO: dedicated patient read for Árbol de la Vida workspace (therapist-only today).
        pending_backend.append('arbol_vida_workspace')

        return Response(
            {
                'milestones': milestones,
                'pending_backend': sorted(set(pending_backend)),
            },
            status=status.HTTP_200_OK,
        )