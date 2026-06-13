"""
Therapist reports summary aggregation (read-only).

Composes workload, recent test results with pre-computed alert signals,
per-patient metrics, and session activity. Does not invoke scorers.
"""
from __future__ import annotations

from datetime import timedelta
from typing import Any, Dict, List, Optional, Set

from django.db.models import Q
from django.utils import timezone

from api.models import Patient, Session
from api.test_models import TestResult

from .therapist_workload import (
    _is_assignment_only_marker,
    _iso,
    _patient_display_name,
    _test_code_from_result,
    _test_name_from_module,
    build_therapist_workload,
    collect_patient_test_items,
    get_patient_test_results,
)

HIGH_SEVERITY_TOKENS = (
    'severe',
    'severa',
    'extreme',
    'extremo',
    'high',
    'alta',
    'alto',
    'crítico',
    'critico',
    'muy alto',
    'muy alta',
)

REPORTS_DISCLAIMER = (
    'Las métricas y alertas son indicativas y se basan en resultados ya registrados. '
    'No sustituyen la evaluación clínica profesional ni constituyen un diagnóstico.'
)


def _is_high_severity(label: str) -> bool:
    if not label:
        return False
    lower = label.lower()
    return any(token in lower for token in HIGH_SEVERITY_TOKENS)


def extract_result_clinical_signals(result: TestResult) -> Dict[str, Any]:
    """
    Read referral/severity signals from stored payloads only (no rescoring).
    """
    referral_recommended = False
    severity_label = ''

    payload_sources: List[Dict[str, Any]] = []
    for blob in (result.result_data, result.details):
        if not isinstance(blob, dict):
            continue
        payload_sources.append(blob)
        structured = blob.get('structured_data')
        if isinstance(structured, dict):
            payload_sources.append(structured)

    for payload in payload_sources:
        if payload.get('referral_recommended') is True:
            referral_recommended = True
        candidate = (
            payload.get('severity_label')
            or payload.get('severity')
            or payload.get('risk_level')
            or payload.get('risk_zone')
            or payload.get('clinical_severity')
            or ''
        )
        if candidate and not severity_label:
            severity_label = str(candidate)

    if result.clinical_diagnosis and not severity_label:
        severity_label = result.clinical_diagnosis

    alert = referral_recommended or _is_high_severity(severity_label)

    return {
        'referral_recommended': referral_recommended,
        'severity_label': severity_label or None,
        'alert': alert,
    }


def _result_patient_display(result: TestResult) -> tuple[Optional[int], str]:
    patient = getattr(result, 'patient', None)
    if patient:
        return patient.id, _patient_display_name(patient)
    client = (result.client_name or '').strip()
    return None, client or 'Consultante'


def _build_portfolio_summary(workload: Dict[str, Any], therapist) -> Dict[str, Any]:
    thirty_days_ago = timezone.now() - timedelta(days=30)
    patients_qs = Patient.objects.filter(therapist=therapist, is_active=True)

    assigned_30d = 0
    pending_30d = 0
    completed_30d = 0

    for patient in patients_qs:
        for item in collect_patient_test_items(patient):
            anchor = item.completed_at or item.assigned_at
            if anchor is None or anchor < thirty_days_ago:
                continue
            assigned_30d += 1
            if item.status == 'completed':
                completed_30d += 1
            elif item.status == 'pending':
                pending_30d += 1

    base = workload['summary']
    return {
        'total': {
            'patients_active': base['patients_active'],
            'tests_assigned': base['tests_assigned_total'],
            'tests_pending': base['tests_pending_total'],
            'tests_completed': base['tests_completed_total'],
            'action_items': base['action_items_total'],
        },
        'last_30_days': {
            'tests_assigned': assigned_30d,
            'tests_pending': pending_30d,
            'tests_completed': completed_30d,
        },
    }


def _therapist_result_queryset(therapist):
    patient_ids = list(
        Patient.objects.filter(therapist=therapist, is_active=True).values_list('id', flat=True)
    )
    patient_user_ids = [
        uid
        for uid in Patient.objects.filter(therapist=therapist, is_active=True).values_list(
            'user_id', flat=True
        )
        if uid
    ]

    return (
        TestResult.objects.filter(
            Q(is_archived=False)
            & (
                Q(patient_id__in=patient_ids)
                | Q(user_id__in=patient_user_ids)
                | Q(patient__therapist=therapist)
            )
        )
        .select_related('test_module', 'patient')
        .order_by('-created_at')
    )


def _build_recent_results(therapist, *, limit: int = 25) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    seen_ids: Set[int] = set()

    for result in _therapist_result_queryset(therapist):
        if result.id in seen_ids:
            continue
        if _is_assignment_only_marker(result):
            continue
        seen_ids.add(result.id)

        code = _test_code_from_result(result)
        test_module = getattr(result, 'test_module', None)
        patient_id, patient_display = _result_patient_display(result)
        signals = extract_result_clinical_signals(result)

        rows.append(
            {
                'id': result.id,
                'patient_id': patient_id,
                'patient_display_name': patient_display,
                'test_code': code,
                'test_name': _test_name_from_module(test_module, code),
                'completed_at': _iso(result.created_at),
                'severity_label': signals['severity_label'],
                'referral_recommended': signals['referral_recommended'],
                'alert': signals['alert'],
                'href': f'/dashboard/therapist/tests/results/{result.id}',
            }
        )
        if len(rows) >= limit:
            break

    return rows


def _build_patient_metrics(workload: Dict[str, Any], therapist) -> List[Dict[str, Any]]:
    metrics: List[Dict[str, Any]] = []

    for entry in workload['patients']:
        patient_id = entry['id']
        alerts_count = 0
        try:
            patient = Patient.objects.get(pk=patient_id, therapist=therapist)
        except Patient.DoesNotExist:
            continue

        for result in get_patient_test_results(patient):
            if _is_assignment_only_marker(result):
                continue
            if extract_result_clinical_signals(result)['alert']:
                alerts_count += 1

        metrics.append(
            {
                'id': patient_id,
                'display_name': entry['display_name'],
                'therapy_status': entry['therapy_status'],
                'tests': entry['tests'],
                'alerts_open': alerts_count,
                'sessions_count': entry['sessions_count'],
                'last_activity_at': entry['progress']['last_activity_at'],
                'href': f'/dashboard/therapist/patients/{patient_id}',
            }
        )

    return metrics


def _build_sessions_block(therapist) -> Dict[str, Any]:
    thirty_days_ago = timezone.now() - timedelta(days=30)
    base_qs = Session.objects.filter(therapist=therapist)

    total = base_qs.count()
    last_30_days = base_qs.filter(session_date__gte=thirty_days_ago).count()

    recent: List[Dict[str, Any]] = []
    for session in base_qs.select_related('patient').order_by('-session_date')[:8]:
        patient = session.patient
        recent.append(
            {
                'id': session.id,
                'patient_id': patient.id if patient else None,
                'patient_display_name': _patient_display_name(patient) if patient else '—',
                'session_date': _iso(session.session_date),
                'session_type': session.session_type or '',
                'duration_minutes': session.duration_minutes,
                'href': f'/dashboard/therapist/patients/{patient.id}' if patient else None,
            }
        )

    return {
        'total': total,
        'last_30_days': last_30_days,
        'recent': recent,
    }


def build_therapist_reports_summary(therapist) -> Dict[str, Any]:
    workload = build_therapist_workload(therapist)
    recent_results = _build_recent_results(therapist)
    alerts_open = sum(1 for row in recent_results if row['alert'])

    return {
        'generated_at': _iso(timezone.now()),
        'disclaimer': REPORTS_DISCLAIMER,
        'portfolio': _build_portfolio_summary(workload, therapist),
        'alerts_open': alerts_open,
        'recent_results': recent_results,
        'patients': _build_patient_metrics(workload, therapist),
        'sessions': _build_sessions_block(therapist),
    }