"""Persistencia de artefactos normalizados (AnalysisRecord) para el MSHE.

Cada módulo de dominio (Tarot, Astrología, Transgeneracional, BioEmotional,
Cábala) invoca `record_module_synthesis` desde SU PROPIA vista al completarse
un análisis del consultante. El módulo escribe únicamente su propio record
(kind/módulo propios) y el MSHE solo LEE estos artefactos.

Cumple HOLISTIC_FEDERATION_POLICY v2.0:
- Integridad de dominio: ningún workspace escribe en otro.
- Federación de lectura: el hub MSHE consume artefactos normalizados.
- Auditoría: cada escritura queda registrada vía logger + AnalysisRecord.
"""
from __future__ import annotations

from collections import defaultdict
import logging
from typing import Any, Dict, Iterable, Optional

from django.contrib.auth.models import User
from django.db.models import Q

from api.models import AnalysisRecord, Patient

logger = logging.getLogger(__name__)

TAROT_SOURCE_TYPE = 'swm_tarot_workspace'
TRANSGENERATIONAL_SOURCE_TYPE = 'swm_transgenerational_session'
ASTROLOGY_SOURCE_TYPE = 'astrology_session_report'
BIOEMOTIONAL_SOURCE_TYPE = 'bioemotional_patient_snapshot'

BIODECODING_AXES_REGIONS = {
    'identity_conflicts': ['head_front', 'head_back', 'crown', 'forehead'],
    'emotional_blockages': ['chest_center', 'heart_area', 'shoulder_left', 'shoulder_right'],
    'relational_conflicts': ['throat', 'neck_front', 'neck_back', 'arms', 'hands'],
    'body_symbolism': ['abdomen_upper', 'stomach', 'solar_plexus'],
    'life_transitions': ['abdomen_lower', 'pelvis', 'legs', 'feet'],
    'generational_patterns': ['back_upper', 'back_lower', 'spine'],
}


def resolve_clinical_patient(therapist: User, subject_user: Optional[User]) -> Optional[Patient]:
    """Resuelve el Patient clínico del terapeuta para un usuario sujeto.

    Algunos workspaces (Tarot, Transgeneracional) referencian al consultante
    como User; el AnalysisRecord normalizado requiere el Patient clínico.
    """
    if subject_user is None:
        return None
    return Patient.objects.filter(
        therapist=therapist,
        user=subject_user,
        is_active=True,
    ).first()


def build_birth_snapshot(patient: Optional[Patient]) -> Dict[str, Any]:
    """Snapshot inmutable de datos de nacimiento exigido por AnalysisRecord."""
    if patient is None:
        return {}
    return {
        'legal_name': getattr(patient, 'full_name', '') or '',
        'birth_date': str(getattr(patient, 'birth_date', '') or ''),
        'birth_time': str(getattr(patient, 'birth_time', '') or ''),
        'city': getattr(patient, 'birth_city', '') or '',
        'country': getattr(patient, 'birth_country', '') or '',
        'lat': float(patient.birth_latitude) if getattr(patient, 'birth_latitude', None) is not None else None,
        'lng': float(patient.birth_longitude) if getattr(patient, 'birth_longitude', None) is not None else None,
        'timezone': getattr(patient, 'birth_timezone', '') or '',
        'geocode_source': 'patient_profile',
    }


def _scaled_score(value: int, step: int) -> float:
    return float(min(100, value * step))


def _copy_dict(value: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if isinstance(value, dict):
        return {**value}
    return {}


def build_source_raw_input(
    raw_input: Optional[Dict[str, Any]] = None,
    *,
    source_type: str = '',
    source_id: str = '',
) -> Dict[str, Any]:
    payload = _copy_dict(raw_input)
    if source_type:
        payload['source_type'] = source_type
    if source_id:
        payload['source_id'] = source_id
    return payload


def _legacy_source_keys(raw_input: Dict[str, Any]) -> Iterable[tuple[str, Any]]:
    for key in ('workspace_id', 'report_id', 'session_id', 'patient_id'):
        value = raw_input.get(key)
        if value not in (None, ''):
            yield key, value


def find_module_synthesis_record(
    *,
    kind: str,
    module_code: str,
    therapist: User,
    patient: Patient,
    raw_input: Optional[Dict[str, Any]] = None,
    source_type: str = '',
    source_id: str = '',
) -> Optional[AnalysisRecord]:
    query = AnalysisRecord.objects.filter(
        kind=kind,
        module_code=module_code,
        therapist=therapist,
        patient=patient,
    )

    normalized_raw_input = build_source_raw_input(
        raw_input,
        source_type=source_type,
        source_id=source_id,
    )
    source_query = Q()
    if source_type:
        source_query |= Q(raw_input__source_type=source_type)
    if source_id:
        source_query |= Q(raw_input__source_id=source_id)
    for key, value in _legacy_source_keys(normalized_raw_input):
        source_query |= Q(**{f'raw_input__{key}': value})

    if source_query:
        query = query.filter(source_query)

    return query.order_by('-created_at').first()


def build_tarot_module_payload(instance: Any) -> Optional[Dict[str, Any]]:
    from api.process_memory.ingestion import (
        build_tarot_spread_from_instance,
        resolve_tarot_workspace_patient,
    )

    patient = resolve_tarot_workspace_patient(instance)
    if patient is None:
        return None

    spread = build_tarot_spread_from_instance(instance)
    cards = spread.get('cards') or []
    workspace_id = str(instance.id)
    return {
        'kind': 'tarot',
        'module_code': 'SWM_TAROT_SEAL',
        'therapist': instance.creator_user,
        'patient': patient,
        'computed_result': {
            'reading': {
                'spread_type': spread.get('spread_type'),
                'tarot_system': spread.get('tarot_system'),
                'cards_count': len(cards),
                'cards': cards,
                'session_context': spread.get('session_context', ''),
            },
        },
        'raw_input': {'workspace_id': workspace_id},
        'engine': 'swm_tarot_seal',
        'source_type': TAROT_SOURCE_TYPE,
        'source_id': workspace_id,
    }


def build_transgenerational_module_payload(session: Any) -> Optional[Dict[str, Any]]:
    patient = resolve_clinical_patient(session.therapist, session.patient)
    if patient is None:
        return None

    patterns_count = session.patterns.count()
    syndromes_count = session.syndrome_marks.count()
    members_count = session.family_members.count()
    generations = {
        generation
        for pattern in session.patterns.all()
        for generation in (pattern.generations_affected or [])
    }
    session_id = str(session.id)

    return {
        'kind': 'transgenerational',
        'module_code': 'SWM_TRANSGEN_CLOSE',
        'therapist': session.therapist,
        'patient': patient,
        'computed_result': {
            'lineage': {
                'identity_patterns': _scaled_score(patterns_count, 15),
                'emotional_inheritance': _scaled_score(patterns_count + syndromes_count, 10),
                'relational_patterns': _scaled_score(members_count, 5),
                'energy_trauma': _scaled_score(syndromes_count, 20),
                'generational_cycles': _scaled_score(len(generations), 25),
                'ancestral_memory': _scaled_score(patterns_count, 12) if patterns_count else 0.0,
            },
            'snapshot': {
                'session_id': session_id,
                'patterns_count': patterns_count,
                'syndromes_count': syndromes_count,
                'members_count': members_count,
                'generations_affected': sorted(generations),
            },
        },
        'raw_input': {'session_id': session_id},
        'engine': 'swm_transgenerational_close',
        'source_type': TRANSGENERATIONAL_SOURCE_TYPE,
        'source_id': session_id,
    }


def build_astrology_module_payload(report: Any) -> Optional[Dict[str, Any]]:
    if getattr(report, 'status', None) != 'final':
        return None

    report_id = str(report.id)
    natal_chart_id = str(report.natal_chart_id) if getattr(report, 'natal_chart_id', None) else None
    payload = report.report_payload if isinstance(report.report_payload, dict) else {}
    return {
        'kind': 'astrology',
        'module_code': 'ASTRO_SESSION_REPORT',
        'therapist': report.created_by,
        'patient': report.patient,
        'computed_result': {
            'chart': {
                'report_id': report_id,
                'natal_chart_id': natal_chart_id,
                'active_layers': payload.get('active_layers') or [],
                'interpretations_count': len(report.interpretation_ids or []),
            },
        },
        'raw_input': {'report_id': report_id},
        'engine': 'astrology_session_report',
        'source_type': ASTROLOGY_SOURCE_TYPE,
        'source_id': report_id,
    }


def build_biodecoding_scores(patient: Patient) -> Dict[str, float]:
    from api.bioemotional.models import BioEmotionalObservation, BioEmotionalSession

    observations = BioEmotionalObservation.objects.filter(patient=patient)
    region_obs_counts: defaultdict[str, int] = defaultdict(int)
    for observation in observations:
        if observation.region_id:
            region_obs_counts[observation.region_id] += 1

    region_intensities: defaultdict[str, list[float]] = defaultdict(list)
    sessions = BioEmotionalSession.objects.filter(patient=patient, is_closed=True)
    for session in sessions:
        for region_id, intensity in (session.heatmap_data or {}).items():
            try:
                region_intensities[region_id].append(float(intensity))
            except (TypeError, ValueError):
                continue

    scores: Dict[str, float] = {}
    for axis, regions in BIODECODING_AXES_REGIONS.items():
        intensities = [value for region in regions for value in region_intensities.get(region, [])]
        observations_count = sum(region_obs_counts.get(region, 0) for region in regions)
        if not intensities and not observations_count:
            scores[axis] = 0.0
            continue
        avg_intensity = (sum(intensities) / len(intensities)) if intensities else 0.0
        scores[axis] = round(min(100.0, avg_intensity * 10 + min(observations_count * 5, 30)), 1)
    return scores


def build_bioemotional_module_payload(patient: Patient, therapist: Optional[User] = None) -> Optional[Dict[str, Any]]:
    from api.bioemotional.models import BioEmotionalObservation, BioEmotionalSession

    owner = therapist or patient.therapist
    last_session = (
        BioEmotionalSession.objects.filter(patient=patient, is_closed=True)
        .order_by('-closed_at')
        .first()
    )
    if last_session is None:
        return None

    observations_count = BioEmotionalObservation.objects.filter(patient=patient).count()
    base_weight = 0.05
    data_factor = min(observations_count / 50, 1.0)
    weight_contribution = round(base_weight + (data_factor * 0.15), 3)
    last_session_id = str(last_session.id)

    return {
        'kind': 'biodecoding',
        'module_code': 'BIOEMO_MSHE_SNAPSHOT',
        'therapist': owner,
        'patient': patient,
        'computed_result': {
            'biodecoding': build_biodecoding_scores(patient),
            'snapshot': {
                'last_session_id': last_session_id,
                'last_session_date': last_session.date.isoformat(),
                'observations_count': observations_count,
                'weight_contribution': weight_contribution,
            },
        },
        'raw_input': {'patient_id': patient.id},
        'engine': 'bioemotional_mshe_import',
        'params': {'weight_contribution': weight_contribution},
        'source_type': BIOEMOTIONAL_SOURCE_TYPE,
        'source_id': last_session_id,
    }


def record_fields_changed(
    existing: AnalysisRecord,
    *,
    role_context: str,
    execution_mode: str,
    birth_data_snapshot: Dict[str, Any],
    algorithm_snapshot: Dict[str, Any],
    raw_input: Optional[Dict[str, Any]],
    computed_result: Dict[str, Any],
    visibility: str,
    therapist: User,
    patient: Patient,
) -> bool:
    return any(
        [
            existing.role_context != role_context,
            existing.execution_mode != execution_mode,
            existing.birth_data_snapshot != birth_data_snapshot,
            existing.algorithm_snapshot != algorithm_snapshot,
            (existing.raw_input or None) != raw_input,
            (existing.computed_result or None) != computed_result,
            existing.visibility != visibility,
            existing.created_by_user_id != therapist.id,
            existing.therapist_id != therapist.id,
            existing.patient_id != patient.id,
            existing.subject_user_id != getattr(patient, 'user_id', None),
        ]
    )


def predict_module_synthesis_outcome(
    *,
    kind: str,
    module_code: str,
    therapist: User,
    patient: Patient,
    computed_result: Dict[str, Any],
    raw_input: Optional[Dict[str, Any]] = None,
    engine: str = '',
    engine_version: str = '1',
    params: Optional[Dict[str, Any]] = None,
    source_type: str = '',
    source_id: str = '',
) -> str:
    birth_data_snapshot = build_birth_snapshot(patient)
    algorithm_snapshot = {
        'engine': engine or module_code,
        'version': engine_version,
        'build_hash': None,
        'params': params or {},
    }
    normalized_raw_input = build_source_raw_input(
        raw_input,
        source_type=source_type,
        source_id=source_id,
    )
    existing = find_module_synthesis_record(
        kind=kind,
        module_code=module_code,
        therapist=therapist,
        patient=patient,
        raw_input=normalized_raw_input,
        source_type=source_type,
        source_id=source_id,
    )
    if existing is None:
        return 'created'
    if record_fields_changed(
        existing,
        role_context='therapist',
        execution_mode='therapist_clinical',
        birth_data_snapshot=birth_data_snapshot,
        algorithm_snapshot=algorithm_snapshot,
        raw_input=normalized_raw_input or None,
        computed_result=computed_result,
        visibility='therapist',
        therapist=therapist,
        patient=patient,
    ):
        return 'updated'
    return 'skipped'


def record_module_synthesis(
    *,
    kind: str,
    module_code: str,
    therapist: User,
    patient: Patient,
    computed_result: Dict[str, Any],
    raw_input: Optional[Dict[str, Any]] = None,
    engine: str = '',
    engine_version: str = '1',
    params: Optional[Dict[str, Any]] = None,
    source_type: str = '',
    source_id: str = '',
) -> Optional[AnalysisRecord]:
    """Crea el AnalysisRecord normalizado de un módulo para el MSHE.

    Devuelve None (y registra el error) si la persistencia falla: el flujo
    del módulo anfitrión nunca debe romperse por la federación.
    """
    try:
        birth_data_snapshot = build_birth_snapshot(patient)
        algorithm_snapshot = {
            'engine': engine or module_code,
            'version': engine_version,
            'build_hash': None,
            'params': params or {},
        }
        normalized_raw_input = build_source_raw_input(
            raw_input,
            source_type=source_type,
            source_id=source_id,
        )
        lookup = find_module_synthesis_record(
            kind=kind,
            module_code=module_code,
            therapist=therapist,
            patient=patient,
            raw_input=normalized_raw_input,
            source_type=source_type,
            source_id=source_id,
        )

        if lookup is None:
            record = AnalysisRecord.objects.create(
                kind=kind,
                module_code=module_code,
                role_context='therapist',
                execution_mode='therapist_clinical',
                birth_data_snapshot=birth_data_snapshot,
                algorithm_snapshot=algorithm_snapshot,
                raw_input=normalized_raw_input or None,
                computed_result=computed_result,
                visibility='therapist',
                created_by_user=therapist,
                therapist=therapist,
                patient=patient,
                subject_user=getattr(patient, 'user', None),
            )
        else:
            if not record_fields_changed(
                lookup,
                role_context='therapist',
                execution_mode='therapist_clinical',
                birth_data_snapshot=birth_data_snapshot,
                algorithm_snapshot=algorithm_snapshot,
                raw_input=normalized_raw_input or None,
                computed_result=computed_result,
                visibility='therapist',
                therapist=therapist,
                patient=patient,
            ):
                return lookup

            lookup.role_context = 'therapist'
            lookup.execution_mode = 'therapist_clinical'
            lookup.birth_data_snapshot = birth_data_snapshot
            lookup.algorithm_snapshot = algorithm_snapshot
            lookup.raw_input = normalized_raw_input or None
            lookup.computed_result = computed_result
            lookup.visibility = 'therapist'
            lookup.created_by_user = therapist
            lookup.therapist = therapist
            lookup.patient = patient
            lookup.subject_user = getattr(patient, 'user', None)
            lookup.save(
                update_fields=[
                    'role_context',
                    'execution_mode',
                    'birth_data_snapshot',
                    'algorithm_snapshot',
                    'raw_input',
                    'computed_result',
                    'visibility',
                    'created_by_user',
                    'therapist',
                    'patient',
                    'subject_user',
                ]
            )
            record = lookup
        logger.info(
            'Federación MSHE: AnalysisRecord %s creado (kind=%s, module=%s, patient=%s, therapist=%s)',
            record.id, kind, module_code, patient.id, therapist.id,
        )
        return record
    except Exception:
        logger.exception(
            'Federación MSHE: fallo al persistir AnalysisRecord (kind=%s, module=%s, patient=%s)',
            kind, module_code, getattr(patient, 'id', None),
        )
        return None
