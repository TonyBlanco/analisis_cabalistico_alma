"""
Therapist dashboard workload aggregation.

Reuses test-status matching rules from PatientPreviousTestsView without
duplicating divergent business logic.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional, Set

from django.db.models import Count, Max
from django.utils import timezone

from api.models import Patient, Session
from api.test_models import Assignment, TestModule, TestResult, UserTestAccess


def _is_assignment_only_marker(result: TestResult) -> bool:
    try:
        if getattr(result, 'result_data', None) and (result.result_data or {}).get('assignment_only') is True:
            return True
    except Exception:
        pass
    try:
        if isinstance(getattr(result, 'details', None), dict) and (result.details or {}).get('legacy_assignment') is True:
            return True
    except Exception:
        pass
    return False


def _test_code_from_result(result: TestResult) -> Optional[str]:
    try:
        if getattr(result, 'test_module', None):
            return result.test_module.code
    except Exception:
        pass
    return getattr(result, 'test_id', None) or None


def _test_name_from_module(test_module: Optional[TestModule], fallback_code: Optional[str] = None) -> str:
    if test_module:
        return test_module.display_name
    return fallback_code or 'Test'


def _iso(dt: Optional[datetime]) -> Optional[str]:
    if dt is None:
        return None
    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt, timezone.get_current_timezone())
    return dt.isoformat()


def _patient_display_name(patient: Patient) -> str:
    if patient.full_name:
        return patient.full_name
    parts = [patient.first_name, patient.last_name]
    return ' '.join(p for p in parts if p).strip() or f'Paciente {patient.id}'


def is_patient_profile_complete(patient: Patient) -> bool:
    return bool(
        patient.full_name
        and patient.birth_date
        and patient.birth_city
        and patient.birth_country
        and patient.birth_latitude is not None
        and patient.birth_longitude is not None
    )


def get_patient_test_results(patient: Patient) -> List[TestResult]:
    """
    Collect TestResult rows for a patient using the same tolerant matching
    rules as PatientPreviousTestsView.
    """
    patient_name = patient.full_name
    patient_birth_date = patient.birth_date

    results_qs = TestResult.objects.filter(
        client_name__iexact=patient_name,
        client_birth_date=patient_birth_date,
        is_archived=False,
    ).exclude(
        patient__isnull=False,
    ).select_related('test_module', 'user').order_by('-created_at')

    patient_results_qs = TestResult.objects.filter(
        patient=patient,
        is_archived=False,
    ).select_related('test_module', 'user').order_by('-created_at')

    all_results: List[TestResult] = []
    seen_ids: Set[int] = set()
    for result in list(results_qs) + list(patient_results_qs):
        if result.id not in seen_ids:
            seen_ids.add(result.id)
            all_results.append(result)

    completed_codes: Set[str] = set()
    for result in all_results:
        code = _test_code_from_result(result)
        if not code:
            continue
        if not _is_assignment_only_marker(result):
            completed_codes.add(str(code).lower())

    if not completed_codes:
        return all_results

    filtered: List[TestResult] = []
    for result in all_results:
        code = _test_code_from_result(result)
        code_l = str(code).lower() if code else None
        if _is_assignment_only_marker(result) and code_l and code_l in completed_codes:
            continue
        filtered.append(result)
    return filtered


def _has_completed_result_for_module(patient: Patient, test_module: TestModule) -> Optional[TestResult]:
    if not test_module or not getattr(test_module, 'id', None):
        return None
    return (
        TestResult.objects.filter(
            patient=patient,
            test_module=test_module,
            is_archived=False,
        )
        .exclude(result_data__assignment_only=True)
        .exclude(details__legacy_assignment=True)
        .order_by('-created_at')
        .first()
    )


@dataclass
class PatientTestItem:
    assignment_id: Optional[int]
    test_module_id: Optional[int]
    test_code: str
    test_name: str
    status: str
    result_id: Optional[int]
    assigned_at: Optional[datetime]
    completed_at: Optional[datetime]

    def to_dict(self) -> Dict[str, Any]:
        return {
            'assignment_id': self.assignment_id,
            'test_module_id': self.test_module_id,
            'test_code': self.test_code,
            'test_name': self.test_name,
            'status': self.status,
            'result_id': self.result_id,
            'assigned_at': _iso(self.assigned_at),
            'completed_at': _iso(self.completed_at),
        }


def collect_patient_test_items(patient: Patient) -> List[PatientTestItem]:
    """
    Build a de-duplicated list of test workload items for one patient.
    Status values: pending | completed (per PatientPreviousTestsView).
    """
    items: List[PatientTestItem] = []
    seen_codes: Set[str] = set()

    results = get_patient_test_results(patient)
    for result in results:
        code = _test_code_from_result(result)
        if not code:
            continue
        code_l = str(code).lower()
        if code_l in seen_codes:
            continue

        test_module = getattr(result, 'test_module', None)
        if _is_assignment_only_marker(result):
            items.append(
                PatientTestItem(
                    assignment_id=result.id,
                    test_module_id=getattr(test_module, 'id', None),
                    test_code=code,
                    test_name=_test_name_from_module(test_module, code),
                    status='pending',
                    result_id=None,
                    assigned_at=result.created_at,
                    completed_at=None,
                )
            )
        else:
            items.append(
                PatientTestItem(
                    assignment_id=result.id,
                    test_module_id=getattr(test_module, 'id', None),
                    test_code=code,
                    test_name=_test_name_from_module(test_module, code),
                    status='completed',
                    result_id=result.id,
                    assigned_at=result.created_at,
                    completed_at=result.created_at,
                )
            )
        seen_codes.add(code_l)

    if getattr(patient, 'user', None):
        accesses = UserTestAccess.objects.filter(
            user=patient.user,
            has_special_access=True,
        ).select_related('test_module')
        for access in accesses:
            tm = getattr(access, 'test_module', None)
            if not tm:
                continue
            code = (getattr(tm, 'code', None) or '').lower()
            if not code or code in seen_codes:
                continue

            completed = _has_completed_result_for_module(patient, tm)
            if completed:
                items.append(
                    PatientTestItem(
                        assignment_id=access.id,
                        test_module_id=tm.id,
                        test_code=tm.code,
                        test_name=tm.display_name,
                        status='completed',
                        result_id=completed.id,
                        assigned_at=access.created_at,
                        completed_at=completed.created_at,
                    )
                )
            else:
                items.append(
                    PatientTestItem(
                        assignment_id=access.id,
                        test_module_id=tm.id,
                        test_code=tm.code,
                        test_name=tm.display_name,
                        status='pending',
                        result_id=None,
                        assigned_at=access.created_at,
                        completed_at=None,
                    )
                )
            seen_codes.add(code)

    try:
        assignments = Assignment.objects.filter(
            patient=patient,
            status__in=['assigned', 'in_progress', 'pending_compute', 'completed'],
        ).order_by('-created_at')
        for assignment in assignments:
            test_type_lower = str(assignment.test_type or '').lower()
            if not test_type_lower or test_type_lower in seen_codes:
                continue

            test_module = TestModule.objects.filter(code__iexact=assignment.test_type).first()
            if assignment.status == 'completed':
                completed = None
                if test_module:
                    completed = _has_completed_result_for_module(patient, test_module)
                items.append(
                    PatientTestItem(
                        assignment_id=assignment.id,
                        test_module_id=test_module.id if test_module else None,
                        test_code=assignment.test_type,
                        test_name=_test_name_from_module(test_module, assignment.test_type),
                        status='completed',
                        result_id=completed.id if completed else None,
                        assigned_at=assignment.created_at,
                        completed_at=completed.created_at if completed else assignment.updated_at,
                    )
                )
            else:
                items.append(
                    PatientTestItem(
                        assignment_id=assignment.id,
                        test_module_id=test_module.id if test_module else None,
                        test_code=assignment.test_type,
                        test_name=_test_name_from_module(test_module, assignment.test_type),
                        status='pending',
                        result_id=None,
                        assigned_at=assignment.created_at,
                        completed_at=None,
                    )
                )
            seen_codes.add(test_type_lower)
    except Exception:
        pass

    items.sort(
        key=lambda item: item.assigned_at or item.completed_at or datetime.min.replace(tzinfo=timezone.utc),
        reverse=True,
    )
    return items


def _patient_action_items(patient: Patient, pending_count: int, profile_complete: bool) -> List[Dict[str, str]]:
    action_items: List[Dict[str, str]] = []
    if pending_count > 0:
        label = (
            f'{pending_count} test pendiente de respuesta'
            if pending_count == 1
            else f'{pending_count} tests pendientes de respuesta'
        )
        action_items.append({
            'type': 'test_pending',
            'label': label,
            'href': f'/dashboard/therapist/patients/{patient.id}',
        })
    if not profile_complete:
        action_items.append({
            'type': 'profile_incomplete',
            'label': 'Perfil incompleto',
            'href': f'/dashboard/therapist/patients/{patient.id}',
        })
    return action_items


def build_patient_workload_entry(
    patient: Patient,
    *,
    sessions_count: int = 0,
    last_session_at: Optional[datetime] = None,
    test_items: Optional[List[PatientTestItem]] = None,
) -> Dict[str, Any]:
    if test_items is None:
        test_items = collect_patient_test_items(patient)
    pending_count = sum(1 for item in test_items if item.status == 'pending')
    completed_count = sum(1 for item in test_items if item.status == 'completed')
    assigned_count = len(test_items)

    profile_complete = is_patient_profile_complete(patient)

    last_test_activity = None
    for item in test_items:
        candidate = item.completed_at or item.assigned_at
        if candidate and (last_test_activity is None or candidate > last_test_activity):
            last_test_activity = candidate

    last_activity_at = last_session_at
    if last_test_activity and (last_activity_at is None or last_test_activity > last_activity_at):
        last_activity_at = last_test_activity

    return {
        'id': patient.id,
        'display_name': _patient_display_name(patient),
        'therapy_status': patient.therapy_status,
        'therapy_level': patient.therapy_level,
        'has_login': bool(patient.user_id),
        'profile_complete': profile_complete,
        'last_session_at': _iso(last_session_at),
        'sessions_count': sessions_count,
        'tests': {
            'assigned': assigned_count,
            'pending': pending_count,
            'completed': completed_count,
        },
        'tests_recent': [item.to_dict() for item in test_items[:5]],
        'progress': {
            'stage': patient.therapy_level,
            'sessions_count': sessions_count,
            'last_activity_at': _iso(last_activity_at),
        },
        'action_items': _patient_action_items(patient, pending_count, profile_complete),
    }


def build_therapist_workload(therapist) -> Dict[str, Any]:
    patients_qs = (
        Patient.objects.filter(therapist=therapist, is_active=True)
        .select_related('user')
        .order_by('-updated_at', '-created_at')
    )

    session_stats = {
        row['patient_id']: row
        for row in Session.objects.filter(therapist=therapist)
        .values('patient_id')
        .annotate(
            sessions_count=Count('id'),
            last_session_at=Max('session_date'),
        )
    }

    patient_entries: List[Dict[str, Any]] = []
    global_action_items: List[Dict[str, Any]] = []

    summary = {
        'patients_active': 0,
        'tests_assigned_total': 0,
        'tests_pending_total': 0,
        'tests_completed_total': 0,
        'action_items_total': 0,
    }

    for patient in patients_qs:
        if patient.therapy_status == 'active':
            summary['patients_active'] += 1

        stats = session_stats.get(patient.id, {})
        test_items = collect_patient_test_items(patient)
        entry = build_patient_workload_entry(
            patient,
            sessions_count=stats.get('sessions_count', 0),
            last_session_at=stats.get('last_session_at'),
            test_items=test_items,
        )
        patient_entries.append(entry)

        summary['tests_assigned_total'] += entry['tests']['assigned']
        summary['tests_pending_total'] += entry['tests']['pending']
        summary['tests_completed_total'] += entry['tests']['completed']

        for item in entry['action_items']:
            summary['action_items_total'] += 1

        display_name = entry['display_name']
        for test_item in test_items:
            if test_item.status == 'completed' and test_item.result_id:
                global_action_items.append({
                    'type': 'completed_unreviewed',
                    'patient_id': patient.id,
                    'patient_display_name': display_name,
                    'test_code': test_item.test_code,
                    'test_name': test_item.test_name,
                    'result_id': test_item.result_id,
                    'label': f"{test_item.test_name} completado — revisar",
                    'href': f"/dashboard/therapist/tests/results/{test_item.result_id}",
                })
                summary['action_items_total'] += 1

    return {
        'summary': summary,
        'patients': patient_entries,
        'action_items': global_action_items,
    }