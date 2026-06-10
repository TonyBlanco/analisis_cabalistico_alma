# -*- coding: utf-8 -*-
"""Construcción de snapshots para informes de sesión astrológica."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from django.utils import timezone

from .astrology_kerykeion.multi_tech import build_multitech_payload, multitech_enabled
from .models import Patient
from .models_astrology import AstrologyNatalChart
from .models_astrology_ai import AstrologyAIInterpretation

REPORT_VERSION = '1'
DISCLAIMER = (
    'Informe de lectura simbólica orientativa. No constituye diagnóstico médico ni evaluación clínica. '
    'No predice eventos. Uso holístico profesional.'
)

LAYER_LABELS = {
    'natal': 'Carta natal',
    'transits': 'Tránsitos',
    'progressions': 'Progresiones',
    'return_solar': 'Retorno solar',
    'solarArc': 'Arco solar',
    'return_lunar': 'Retorno lunar',
}

INTERPRETATION_TYPES = ['natal', 'transits', 'progressions', 'solar_return']


def _patient_display_name(patient: Patient) -> str:
    profile_name = None
    try:
        user = getattr(patient, 'user', None)
        profile = getattr(user, 'profile', None) if user else None
        if profile:
            profile_name = getattr(profile, 'legal_full_name', None) or getattr(profile, 'full_name', None)
    except Exception:
        profile_name = None
    return (
        profile_name
        or getattr(patient, 'full_name', None)
        or f"{getattr(patient, 'first_name', '')} {getattr(patient, 'last_name', '')}".strip()
        or getattr(patient, 'email', None)
        or f"Paciente #{getattr(patient, 'id', '')}"
    )


def _extract_tables(chart: Dict[str, Any]) -> Dict[str, Any]:
    planets = chart.get('planetas') or chart.get('planets') or []
    houses = chart.get('casas') or chart.get('houses') or []
    aspects = chart.get('aspectos') or chart.get('aspects') or []
    return {
        'planets': planets,
        'houses': houses,
        'aspects': aspects,
    }


def _load_interpretations(patient: Patient, include: bool) -> tuple[List[Dict[str, Any]], List[int]]:
    if not include:
        return [], []

    rows: List[Dict[str, Any]] = []
    ids: List[int] = []
    for itype in INTERPRETATION_TYPES:
        latest = (
            AstrologyAIInterpretation.objects.filter(
                patient=patient,
                interpretation_type=itype,
                is_archived=False,
            )
            .order_by('-created_at')
            .first()
        )
        if not latest:
            continue
        ids.append(latest.id)
        rows.append({
            'id': latest.id,
            'interpretation_type': latest.interpretation_type,
            'interpretation_type_display': latest.get_interpretation_type_display(),
            'interpretation_text': latest.interpretation_text,
            'word_count': latest.word_count,
            'created_at': latest.created_at.isoformat() if latest.created_at else None,
            'is_shared_with_patient': latest.is_shared_with_patient,
        })
    return rows, ids


def _normalize_active_layers(raw: Any) -> List[str]:
    if not raw:
        return ['natal']
    if isinstance(raw, list):
        layers = [str(x).strip() for x in raw if str(x).strip()]
    elif isinstance(raw, str):
        layers = [raw.strip()]
    else:
        layers = []
    if 'natal' not in layers:
        layers.insert(0, 'natal')
    return layers


def build_astrology_session_report_payload(
    *,
    patient: Patient,
    therapist,
    natal_chart: AstrologyNatalChart,
    active_layers: Optional[List[str]] = None,
    include_interpretations: bool = True,
    therapist_notes: str = '',
    title: Optional[str] = None,
) -> Dict[str, Any]:
    chart_payload = natal_chart.chart_payload if isinstance(natal_chart.chart_payload, dict) else {}
    input_snapshot = natal_chart.input_snapshot if isinstance(natal_chart.input_snapshot, dict) else {}
    meta = chart_payload.get('metadatos') or {}

    analysis_result = None
    if multitech_enabled():
        try:
            analysis_result = build_multitech_payload(
                natal_chart=chart_payload,
                input_data=input_snapshot,
            )
        except Exception:
            analysis_result = None

    layers = _normalize_active_layers(active_layers)
    interpretations, interpretation_ids = _load_interpretations(patient, include_interpretations)

    layer_labels = [LAYER_LABELS.get(layer, layer) for layer in layers]
    auto_title = title or f"Informe astrológico — {', '.join(layer_labels[:3])}"
    if len(layer_labels) > 3:
        auto_title += '…'

    now = timezone.now()
    return {
        'version': REPORT_VERSION,
        'generated_at': now.isoformat(),
        'disclaimer': DISCLAIMER,
        'title': auto_title,
        'patient': {
            'id': patient.id,
            'name': _patient_display_name(patient),
        },
        'therapist': {
            'id': getattr(therapist, 'id', None),
            'username': getattr(therapist, 'username', None),
        },
        'chart_params': {
            'house_system': natal_chart.house_system or meta.get('sistema_casas') or 'P',
            'zodiac_type': input_snapshot.get('zodiac_type') or meta.get('zodiac_type') or 'tropical',
            'ayanamsha': input_snapshot.get('ayanamsha') or meta.get('ayanamsha'),
            'source': natal_chart.source,
            'calculated_at': natal_chart.calculated_at.isoformat() if natal_chart.calculated_at else None,
        },
        'active_layers': layers,
        'active_layer_labels': layer_labels,
        'natal': chart_payload,
        'analysis_result': analysis_result,
        'tables': _extract_tables(chart_payload),
        'interpretations': interpretations,
        'therapist_notes': therapist_notes or '',
        'source_trace': {
            'natal_chart_id': natal_chart.id,
            'interpretation_ids': interpretation_ids,
        },
    }