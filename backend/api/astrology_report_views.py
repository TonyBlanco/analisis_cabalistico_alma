# -*- coding: utf-8 -*-
"""API de informes de sesión astrológica (PR1: snapshot + listado + vista)."""

from __future__ import annotations

from typing import Any, Dict

from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .astrology_report_service import build_astrology_session_report_payload
from .models import Patient
from .models_astrology import AstrologyNatalChart, AstrologySessionReport
from .permissions import IsTherapist


def _serialize_report_summary(report: AstrologySessionReport) -> Dict[str, Any]:
    payload = report.report_payload if isinstance(report.report_payload, dict) else {}
    return {
        'id': str(report.id),
        'title': report.title,
        'status': report.status,
        'visibility': report.visibility,
        'is_shared_with_patient': report.is_shared_with_patient,
        'shared_at': report.shared_at.isoformat() if report.shared_at else None,
        'created_at': report.created_at.isoformat() if report.created_at else None,
        'active_layers': payload.get('active_layers') or [],
        'chart_params': payload.get('chart_params') or {},
        'interpretation_count': len(payload.get('interpretations') or []),
    }


def _serialize_report_detail(report: AstrologySessionReport) -> Dict[str, Any]:
    summary = _serialize_report_summary(report)
    summary['therapist_notes'] = report.therapist_notes
    summary['report'] = report.report_payload
    summary['interpretation_ids'] = report.interpretation_ids or []
    summary['natal_chart_id'] = report.natal_chart_id
    return summary


@method_decorator(csrf_exempt, name='dispatch')
class PatientAstrologyReportsView(APIView):
    """
    GET  /api/therapist/patients/<id>/astrology-reports/
    POST /api/therapist/patients/<id>/astrology-reports/
    """

    permission_classes = [IsAuthenticated, IsTherapist]

    def get(self, request, id):
        patient = get_object_or_404(Patient, pk=id, therapist=request.user, is_active=True)
        limit = min(int(request.query_params.get('limit', 20)), 50)
        reports = AstrologySessionReport.objects.filter(patient=patient).order_by('-created_at')[:limit]
        return Response({
            'success': True,
            'results': [_serialize_report_summary(r) for r in reports],
            'count': len(reports),
        })

    def post(self, request, id):
        patient = get_object_or_404(Patient, pk=id, therapist=request.user, is_active=True)
        natal_chart = AstrologyNatalChart.objects.filter(patient=patient).first()
        if not natal_chart:
            return Response(
                {'error': 'No hay carta natal calculada para este consultante'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        body = request.data if isinstance(request.data, dict) else {}
        active_layers = body.get('active_layers')
        include_interpretations = body.get('include_interpretations', True)
        if isinstance(include_interpretations, str):
            include_interpretations = include_interpretations.strip().lower() in {'1', 'true', 'yes', 'on'}
        therapist_notes = str(body.get('therapist_notes') or '').strip()
        title = str(body.get('title') or '').strip() or None
        report_status = body.get('status') or 'final'
        if report_status not in {'draft', 'final'}:
            report_status = 'final'

        payload = build_astrology_session_report_payload(
            patient=patient,
            therapist=request.user,
            natal_chart=natal_chart,
            active_layers=active_layers,
            include_interpretations=bool(include_interpretations),
            therapist_notes=therapist_notes,
            title=title,
        )

        report = AstrologySessionReport.objects.create(
            patient=patient,
            created_by=request.user,
            natal_chart=natal_chart,
            title=payload.get('title') or 'Informe astrológico',
            status=report_status,
            visibility='therapist',
            report_payload=payload,
            interpretation_ids=payload.get('source_trace', {}).get('interpretation_ids') or [],
            therapist_notes=therapist_notes,
        )

        return Response(_serialize_report_detail(report), status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class PatientAstrologyReportDetailView(APIView):
    """
    GET   /api/therapist/patients/<id>/astrology-reports/<report_id>/
    PATCH /api/therapist/patients/<id>/astrology-reports/<report_id>/
    """

    permission_classes = [IsAuthenticated, IsTherapist]

    def get(self, request, id, report_id):
        patient = get_object_or_404(Patient, pk=id, therapist=request.user, is_active=True)
        report = get_object_or_404(AstrologySessionReport, pk=report_id, patient=patient)
        return Response({'success': True, **_serialize_report_detail(report)})

    def patch(self, request, id, report_id):
        patient = get_object_or_404(Patient, pk=id, therapist=request.user, is_active=True)
        report = get_object_or_404(AstrologySessionReport, pk=report_id, patient=patient)
        body = request.data if isinstance(request.data, dict) else {}

        updated_fields = []

        if 'therapist_notes' in body:
            report.therapist_notes = str(body.get('therapist_notes') or '')
            updated_fields.append('therapist_notes')
            if isinstance(report.report_payload, dict):
                report.report_payload['therapist_notes'] = report.therapist_notes
                updated_fields.append('report_payload')

        if 'title' in body:
            new_title = str(body.get('title') or '').strip()
            if new_title:
                report.title = new_title
                updated_fields.append('title')
                if isinstance(report.report_payload, dict):
                    report.report_payload['title'] = new_title
                    if 'report_payload' not in updated_fields:
                        updated_fields.append('report_payload')

        if 'is_shared_with_patient' in body:
            share = bool(body.get('is_shared_with_patient'))
            if share:
                report.share_with_patient()
            else:
                report.is_shared_with_patient = False
                report.shared_at = None
                if report.visibility == 'both':
                    report.visibility = 'therapist'
                updated_fields.extend(['is_shared_with_patient', 'shared_at', 'visibility'])

        if updated_fields:
            report.save(update_fields=list(set(updated_fields + ['updated_at'])))

        return Response({'success': True, **_serialize_report_detail(report)})