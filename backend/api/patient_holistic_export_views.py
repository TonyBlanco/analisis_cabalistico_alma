# -*- coding: utf-8 -*-
"""Therapist Holistic Export API.

Crea y lista exports holísticos (solo terapeuta) para un paciente.
Persistencia: AnalysisRecord (ledger normalizado) con module_code HOLISTIC_EXPORT_V1.

Diseño:
- Export NO modifica el perfil del paciente: guarda un snapshot + digest seleccionable.
- Por defecto visibility=therapist (solo terapeuta).
- Devuelve JSON + Markdown (MD derivado del JSON).
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .models import AnalysisRecord, CabalisticAnalysis, Patient
from .models_astrology import AstrologyNatalChart
from .permissions import IsTherapist
from .test_models import TestResult


MODULE_CODE = 'HOLISTIC_EXPORT_V1'


def _coerce_bool(value: Any, default: bool = False) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in {'1', 'true', 'yes', 'y', 'on'}
    if isinstance(value, (int, float)):
        return bool(value)
    return default


def _normalize_selected_sections(payload: Dict[str, Any]) -> Dict[str, bool]:
    default = {
        'astrology': True,
        'tests': True,
        'tarot': True,
        'kabbalah': True,
        'bioemotional': True,
    }

    raw = payload.get('selected_sections')

    if isinstance(raw, dict):
        return {
            'astrology': _coerce_bool(raw.get('astrology'), default['astrology']),
            'tests': _coerce_bool(raw.get('tests'), default['tests']),
            'tarot': _coerce_bool(raw.get('tarot'), default['tarot']),
            'kabbalah': _coerce_bool(raw.get('kabbalah'), default['kabbalah']),
            'bioemotional': _coerce_bool(raw.get('bioemotional'), default['bioemotional']),
        }

    if isinstance(raw, list):
        raw_set = {str(item).strip().lower() for item in raw}
        return {
            'astrology': 'astrology' in raw_set,
            'tests': 'tests' in raw_set,
            'tarot': 'tarot' in raw_set,
            'kabbalah': 'kabbalah' in raw_set,
            'bioemotional': 'bioemotional' in raw_set,
        }

    return default


def _extract_bioemotional_digest(patient: Patient, therapist_user, level: str) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Extrae un digest del módulo bio-emocional (experiencial + clínico).

    Incluye artefactos creados por terapeuta (observations/hypotheses/synthesis/assisted diagnosis/briefs)
    y estructura transgeneracional (genealogy) ligada al paciente.
    """

    # Import local para evitar cargar el módulo si no se usa.
    from api.bioemotional.models import (
        BioEmotionalObservation,
        BioEmotionalHypothesis,
        BioEmotionalSynthesis,
        BioEmotionalAssistedDiagnosis,
        BioEmotionalPatientBrief,
        GenealogyPerson,
        GenealogyEvent,
    )

    trace: Dict[str, Any] = {
        'observation_ids': [],
        'hypothesis_ids': [],
        'synthesis_ids': [],
        'assisted_diagnosis_ids': [],
        'patient_brief_ids': [],
        'genealogy_person_ids': [],
        'genealogy_event_ids': [],
    }

    observations_qs = BioEmotionalObservation.objects.filter(patient=patient, therapist=therapist_user).order_by(
        '-created_at'
    )
    hypotheses_qs = BioEmotionalHypothesis.objects.filter(patient=patient, therapist=therapist_user).order_by(
        '-updated_at'
    )
    synthesis_qs = BioEmotionalSynthesis.objects.filter(patient=patient, therapist=therapist_user).order_by('-created_at')
    assisted_qs = BioEmotionalAssistedDiagnosis.objects.filter(patient=patient, therapist=therapist_user).order_by(
        '-created_at'
    )
    briefs_qs = BioEmotionalPatientBrief.objects.filter(patient=patient, therapist=therapist_user).order_by('-updated_at')

    people_qs = GenealogyPerson.objects.filter(patient=patient).order_by('generation', 'relation')
    events_qs = GenealogyEvent.objects.filter(patient=patient).order_by('-year', 'title')

    observations: List[Dict[str, Any]] = []
    for o in observations_qs[:12]:
        oid = getattr(o, 'id', None)
        if oid is not None:
            trace['observation_ids'].append(str(oid))
        item = {
            'id': str(oid) if oid is not None else None,
            'created_at': o.created_at.isoformat() if o.created_at else None,
            'region_id': o.region_id,
            'dictionary_term_slug': o.dictionary_term_slug,
            'note_text': o.note_text if level == 'audit' else (o.note_text[:280] + '…' if len(o.note_text) > 280 else o.note_text),
        }
        observations.append(item)

    hypotheses: List[Dict[str, Any]] = []
    for h in hypotheses_qs[:12]:
        hid = getattr(h, 'id', None)
        if hid is not None:
            trace['hypothesis_ids'].append(str(hid))
        item = {
            'id': str(hid) if hid is not None else None,
            'title': h.title,
            'status': h.status,
            'related_region_id': h.related_region_id,
            'related_dictionary_term': h.related_dictionary_term,
            'created_at': h.created_at.isoformat() if h.created_at else None,
            'updated_at': h.updated_at.isoformat() if h.updated_at else None,
            'description': h.description if level == 'audit' else (h.description[:320] + '…' if len(h.description) > 320 else h.description),
        }
        hypotheses.append(item)

    synthesis_latest = synthesis_qs.first()
    synthesis_obj = None
    if synthesis_latest:
        sid = getattr(synthesis_latest, 'id', None)
        if sid is not None:
            trace['synthesis_ids'].append(str(sid))
        synthesis_obj = {
            'id': str(sid) if sid is not None else None,
            'created_at': synthesis_latest.created_at.isoformat() if synthesis_latest.created_at else None,
            'is_closed': bool(synthesis_latest.is_closed),
            'text': synthesis_latest.text if level == 'audit' else (synthesis_latest.text[:600] + '…' if len(synthesis_latest.text) > 600 else synthesis_latest.text),
        }

    assisted: List[Dict[str, Any]] = []
    # Por defecto solo mostramos validados (más seguros); en audit incluimos también no validados.
    assisted_filtered = assisted_qs
    if level != 'audit':
        assisted_filtered = assisted_filtered.filter(is_validated=True)
    for a in assisted_filtered[:8]:
        aid = getattr(a, 'id', None)
        if aid is not None:
            trace['assisted_diagnosis_ids'].append(str(aid))
        assisted.append(
            {
                'id': str(aid) if aid is not None else None,
                'created_at': a.created_at.isoformat() if a.created_at else None,
                'is_validated': bool(a.is_validated),
                'prompt_version': a.prompt_version,
                'content': a.content if level == 'audit' else (a.content[:420] + '…' if len(a.content) > 420 else a.content),
                'based_on': a.based_on if level == 'audit' else None,
            }
        )

    briefs: List[Dict[str, Any]] = []
    for b in briefs_qs[:8]:
        bid = getattr(b, 'id', None)
        if bid is not None:
            trace['patient_brief_ids'].append(str(bid))
        briefs.append(
            {
                'id': str(bid) if bid is not None else None,
                'title': b.title,
                'is_published': bool(b.is_published),
                'published_at': b.published_at.isoformat() if b.published_at else None,
                'updated_at': b.updated_at.isoformat() if b.updated_at else None,
                'content': b.content if level == 'audit' else (b.content[:420] + '…' if len(b.content) > 420 else b.content),
                'sources': b.sources if level == 'audit' else None,
            }
        )

    people: List[Dict[str, Any]] = []
    for p in people_qs[:20]:
        pid = getattr(p, 'id', None)
        if pid is not None:
            trace['genealogy_person_ids'].append(str(pid))
        people.append(
            {
                'id': str(pid) if pid is not None else None,
                'generation': p.generation,
                'relation': p.relation,
                'name': p.name,
                'birth_year': p.birth_year,
                'death_year': p.death_year,
                'notes': p.notes if level == 'audit' else (p.notes[:220] + '…' if len(p.notes) > 220 else p.notes),
            }
        )

    events: List[Dict[str, Any]] = []
    for e in events_qs[:20]:
        eid = getattr(e, 'id', None)
        if eid is not None:
            trace['genealogy_event_ids'].append(str(eid))
        events.append(
            {
                'id': str(eid) if eid is not None else None,
                'title': e.title,
                'year': e.year,
                'description': e.description if level == 'audit' else (e.description[:320] + '…' if len(e.description) > 320 else e.description),
            }
        )

    digest = {
        'counts': {
            'observations': observations_qs.count(),
            'hypotheses': hypotheses_qs.count(),
            'synthesis': synthesis_qs.count(),
            'assisted_diagnosis': assisted_qs.count(),
            'patient_briefs': briefs_qs.count(),
            'genealogy_people': people_qs.count(),
            'genealogy_events': events_qs.count(),
        },
        'observations_recent': observations,
        'hypotheses_recent': hypotheses,
        'synthesis_latest': synthesis_obj,
        'assisted_diagnosis_recent': assisted,
        'patient_briefs_recent': briefs,
        'genealogy': {
            'people': people,
            'events': events,
        },
    }
    return digest, trace


def _extract_astrology_digest(chart_payload: Dict[str, Any], level: str) -> Dict[str, Any]:
    metadatos = chart_payload.get('metadatos', {}) if isinstance(chart_payload, dict) else {}
    planets = chart_payload.get('planetas', []) if isinstance(chart_payload, dict) else []
    houses = chart_payload.get('casas', []) if isinstance(chart_payload, dict) else []
    aspects = chart_payload.get('aspectos', []) if isinstance(chart_payload, dict) else []

    def find_planet(name: str) -> Optional[Dict[str, Any]]:
        for p in planets:
            if isinstance(p, dict) and p.get('nombre') == name:
                return p
        return None

    sun = find_planet('sun')
    moon = find_planet('moon')

    asc_sign = None
    if isinstance(houses, list) and houses:
        # Casa 1 como aproximación de Ascendente
        for h in houses:
            if isinstance(h, dict) and h.get('numero') == 1:
                asc_sign = h.get('signo')
                break

    aspects_out: List[Dict[str, Any]] = []
    if isinstance(aspects, list) and aspects:
        safe_aspects = [a for a in aspects if isinstance(a, dict)]
        safe_aspects.sort(key=lambda a: float(a.get('orbe', 9999) or 9999))
        top_n = 12 if level == 'audit' else 8
        for a in safe_aspects[:top_n]:
            aspects_out.append(
                {
                    'planet1': a.get('planeta1'),
                    'planet2': a.get('planeta2'),
                    'type': a.get('tipo'),
                    'orb': a.get('orbe'),
                }
            )

    digest = {
        'calculated_at': metadatos.get('calculated_at'),
        'house_system': metadatos.get('sistema_casas'),
        'zodiac_type': metadatos.get('zodiac_type'),
        'ayanamsha': metadatos.get('ayanamsha'),
        'sun': {'sign': sun.get('signo'), 'house': sun.get('casa')} if isinstance(sun, dict) else None,
        'moon': {'sign': moon.get('signo'), 'house': moon.get('casa')} if isinstance(moon, dict) else None,
        'ascendant_sign': asc_sign,
        'aspects_top': aspects_out,
    }

    if level == 'audit':
        cabalistic_data = chart_payload.get('cabalistic_data') if isinstance(chart_payload, dict) else None
        digest['cabalistic_data'] = cabalistic_data

    return digest


def _extract_tests_digest(patient: Patient, level: str) -> Tuple[List[Dict[str, Any]], List[int]]:
    qs = TestResult.objects.filter(patient=patient)
    if not qs.exists() and patient.user:
        qs = TestResult.objects.filter(user=patient.user)

    items: List[Dict[str, Any]] = []
    ids: List[int] = []

    for tr in qs.order_by('-created_at')[:15]:
        tr_id = getattr(tr, 'id', None)
        if tr_id is not None:
            ids.append(int(tr_id))
        payload = tr.result_data or tr.details or {}
        severity = ''
        if isinstance(payload, dict):
            severity = payload.get('severity_label') or payload.get('severity') or payload.get('risk_level') or ''

        severity = severity or (tr.clinical_diagnosis or '')

        test_name = tr.test_module.name if tr.test_module else (tr.test_id.upper() if tr.test_id else 'TEST')

        item = {
            'id': tr_id,
            'test_id': tr.test_id or (tr.test_module.code if tr.test_module else None),
            'test_name': test_name,
            'score': tr.score,
            'severity': severity,
            'clinical_diagnosis': tr.clinical_diagnosis or None,
            'completed_at': tr.created_at.isoformat() if tr.created_at else None,
        }

        if level == 'audit':
            item['result_data'] = tr.result_data

        items.append(item)

    return items, ids


def _extract_cabalistic_digest(patient: Patient, level: str, include_tarot: bool, include_kabbalah: bool) -> Tuple[Dict[str, Any], List[int]]:
    qs = CabalisticAnalysis.objects.filter(patient=patient).order_by('-created_at')

    tarot_items: List[Dict[str, Any]] = []
    kabbalah_items: List[Dict[str, Any]] = []
    ids: List[int] = []

    for ca in qs[:25]:
        ca_id = getattr(ca, 'id', None)
        if ca_id is not None:
            ids.append(int(ca_id))
        base = {
            'id': ca_id,
            'analysis_type': ca.analysis_type,
            'created_at': ca.created_at.isoformat() if ca.created_at else None,
            'summary': ca.summary or None,
        }

        if level == 'audit':
            base['result_data'] = ca.result_data
            base['input_data'] = ca.input_data

        if ca.analysis_type == 'tarot':
            if include_tarot:
                tarot_items.append(base)
        else:
            if include_kabbalah:
                kabbalah_items.append(base)

    return {'tarot': tarot_items, 'kabbalah': kabbalah_items}, ids


def _extract_cabala_aplicada_digest(
    patient: Patient,
    therapist_user,
    level: str,
) -> Tuple[Dict[str, Any], List[str]]:
    """Extrae un digest del workspace /dashboard/therapist/cabala-aplicada.

    Fuente principal: AnalysisRecord(kind='kabbalah') ejecutado por el terapeuta.
    """

    qs = (
        AnalysisRecord.objects.filter(
            patient=patient,
            therapist=therapist_user,
            kind='kabbalah',
        )
        .exclude(module_code=MODULE_CODE)
        .order_by('-created_at')
    )

    ids: List[str] = []
    records: List[Dict[str, Any]] = []

    for r in qs[:8]:
        rid = str(r.id)
        ids.append(rid)

        algo: Dict[str, Any] = r.algorithm_snapshot if isinstance(r.algorithm_snapshot, dict) else {}
        algo_params: Dict[str, Any] = {}
        raw_algo_params = algo.get('params')
        if isinstance(raw_algo_params, dict):
            algo_params = raw_algo_params
        raw: Dict[str, Any] = r.raw_input if isinstance(r.raw_input, dict) else {}
        sistema = algo_params.get('sistema') or raw.get('sistema') or None

        computed: Dict[str, Any] = r.computed_result if isinstance(r.computed_result, dict) else {}
        engine: Dict[str, Any] = {}
        raw_engine = computed.get('kabbalah_engine')
        if isinstance(raw_engine, dict):
            engine = raw_engine

        tikun_signals = engine.get('tikun_signals')
        tikun_top = []
        if isinstance(tikun_signals, list):
            tikun_top = [t for t in tikun_signals if isinstance(t, (dict, str))][:10]

        names_top: List[Dict[str, Any]] = []
        raw_names = engine.get('72_names')
        if isinstance(raw_names, dict):
            scored: List[Tuple[float, str, Any]] = []
            for key, value in raw_names.items():
                score_val = None
                if isinstance(value, dict):
                    score_val = value.get('score')
                else:
                    score_val = value
                try:
                    score_f = float(score_val) if score_val is not None else 0.0
                except Exception:
                    score_f = 0.0
                scored.append((score_f, str(key), value))
            scored.sort(key=lambda x: x[0], reverse=True)
            for score_f, name_key, value in scored[:12]:
                if isinstance(value, dict):
                    names_top.append({'name': name_key, 'score': score_f, 'meta': value})
                else:
                    names_top.append({'name': name_key, 'score': score_f})

        item: Dict[str, Any] = {
            'id': rid,
            'created_at': r.created_at.isoformat() if r.created_at else None,
            'module_code': r.module_code,
            'sistema': sistema,
            'therapist_summary': (r.therapist_annotations or {}).get('summary')
            if isinstance(r.therapist_annotations, dict)
            else None,
        }

        if level == 'audit':
            item['birth_data_snapshot'] = r.birth_data_snapshot
            item['algorithm_snapshot'] = r.algorithm_snapshot
            item['raw_input'] = r.raw_input
            item['computed_result'] = r.computed_result
            item['legacy_output'] = r.legacy_output
        else:
            item['kabbalah_engine'] = {
                'tikun_signals_top': tikun_top,
                'names_top': names_top,
            }

        records.append(item)

    digest = {
        'counts': {
            'analysis_records': qs.count(),
        },
        'records_recent': records,
    }

    return digest, ids


def _build_markdown(export_json: Dict[str, Any]) -> str:
    patient_name = export_json.get('patient', {}).get('name') or f"Paciente #{export_json.get('patient', {}).get('id')}"
    created_at = export_json.get('generated_at') or ''
    sections = export_json.get('sections', {}) if isinstance(export_json.get('sections'), dict) else {}

    lines: List[str] = []
    lines.append(f"# Export Holístico (Terapeuta)\n")
    lines.append(f"- Paciente: {patient_name}")
    lines.append(f"- Generado: {created_at}")
    lines.append(f"- Versión: {export_json.get('export_version', '1')}\n")

    if sections.get('astrology'):
        a = sections['astrology']
        lines.append("## Astrología\n")
        lines.append(f"- Sistema de casas: {a.get('house_system') or '—'}")
        lines.append(f"- Zodíaco: {a.get('zodiac_type') or '—'}")
        sun = a.get('sun') or {}
        moon = a.get('moon') or {}
        if sun:
            lines.append(f"- Sol: {sun.get('sign') or '—'} (Casa {sun.get('house') or '—'})")
        if moon:
            lines.append(f"- Luna: {moon.get('sign') or '—'} (Casa {moon.get('house') or '—'})")
        if a.get('ascendant_sign'):
            lines.append(f"- Ascendente (aprox): {a.get('ascendant_sign')}")

        aspects = a.get('aspects_top') or []
        if isinstance(aspects, list) and aspects:
            lines.append("\n**Aspectos principales**")
            for asp in aspects[:8]:
                if not isinstance(asp, dict):
                    continue
                lines.append(
                    f"- {asp.get('planet1')} {asp.get('type')} {asp.get('planet2')} (orb {asp.get('orb')})"
                )
        lines.append("")

    if sections.get('tests'):
        tests = sections['tests']
        lines.append("## Tests\n")
        for t in tests[:10]:
            if not isinstance(t, dict):
                continue
            sev = t.get('severity')
            sev_txt = f" — {sev}" if sev else ''
            lines.append(f"- {t.get('test_name')}{sev_txt}")
        lines.append("")

    cab = sections.get('cabalistic')
    if isinstance(cab, dict):
        tarot_list = cab.get('tarot') or []
        if isinstance(tarot_list, list) and tarot_list:
            lines.append("## Tarot\n")
            for item in tarot_list[:10]:
                if not isinstance(item, dict):
                    continue
                lines.append(f"- {item.get('summary') or 'Lectura guardada'}")
            lines.append("")
        kabbalah_list = cab.get('kabbalah') or []
        if isinstance(kabbalah_list, list) and kabbalah_list:
            lines.append("## Cábala / Análisis simbólicos\n")
            for item in kabbalah_list[:10]:
                if not isinstance(item, dict):
                    continue
                at = item.get('analysis_type')
                label = f"({at}) " if at else ''
                lines.append(f"- {label}{item.get('summary') or 'Análisis guardado'}")
            lines.append("")

        cabala_aplicada = cab.get('cabala_aplicada')
        if isinstance(cabala_aplicada, dict):
            counts: Dict[str, Any] = {}
            raw_counts = cabala_aplicada.get('counts')
            if isinstance(raw_counts, dict):
                counts = raw_counts
            total = counts.get('analysis_records', 0)
            records_recent = cabala_aplicada.get('records_recent') if isinstance(cabala_aplicada.get('records_recent'), list) else []
            if total or records_recent:
                lines.append("## Cábala Aplicada (Árbol de la Vida)\n")
                lines.append(f"- Registros: {total}")
                if records_recent:
                    latest = records_recent[0] if isinstance(records_recent[0], dict) else None
                    if latest:
                        sistema = latest.get('sistema')
                        if sistema:
                            lines.append(f"- Sistema: {sistema}")
                        engine = latest.get('kabbalah_engine') if isinstance(latest.get('kabbalah_engine'), dict) else {}
                        tikun = engine.get('tikun_signals_top') if isinstance(engine.get('tikun_signals_top'), list) else []
                        if tikun:
                            lines.append("\n**Señales (tikún) — top**")
                            for s in tikun[:6]:
                                lines.append(f"- {s}")
                lines.append("")

    bio = sections.get('bioemotional')
    if isinstance(bio, dict):
        raw_counts = bio.get('counts')
        counts: Dict[str, Any] = raw_counts if isinstance(raw_counts, dict) else {}
        lines.append("## Bio-Emoción (Experiencial)\n")
        lines.append(f"- Observaciones: {counts.get('observations', 0)}")
        lines.append(f"- Hipótesis: {counts.get('hypotheses', 0)}")
        lines.append(f"- Síntesis: {counts.get('synthesis', 0)}")
        lines.append(f"- Lecturas asistidas: {counts.get('assisted_diagnosis', 0)}")
        lines.append(f"- Resúmenes para paciente: {counts.get('patient_briefs', 0)}")
        lines.append(f"- Árbol (personas/eventos): {counts.get('genealogy_people', 0)}/{counts.get('genealogy_events', 0)}")

        synthesis = bio.get('synthesis_latest') if isinstance(bio.get('synthesis_latest'), dict) else None
        if synthesis:
            closed_txt = 'cerrada' if synthesis.get('is_closed') else 'abierta'
            lines.append(f"- Última síntesis: {synthesis.get('created_at') or '—'} ({closed_txt})")
        lines.append("")

    lines.append("---")
    lines.append("Nota: Este export es interno (solo terapeuta). No es informe para paciente.")
    return "\n".join(lines).strip() + "\n"


class PatientHolisticExportsView(APIView):
    """GET/POST exports holísticos de un paciente.

    - GET: lista exports (AnalysisRecord) para el paciente
    - POST: crea un export (AnalysisRecord) con selección de secciones y devuelve JSON+MD

    Ruta:
    - /api/therapist/patients/<id>/holistic-exports/
    """

    permission_classes = [IsAuthenticated, IsTherapist]

    def get(self, request, id):
        patient = get_object_or_404(Patient, pk=id, therapist=request.user, is_active=True)

        records = (
            AnalysisRecord.objects.filter(
                patient=patient,
                therapist=request.user,
                module_code=MODULE_CODE,
            )
            .order_by('-created_at')[:20]
        )

        results: List[Dict[str, Any]] = []
        for r in records:
            computed = r.computed_result or {}
            export_obj = computed.get('export') if isinstance(computed, dict) else None
            markdown_preview = None
            if isinstance(export_obj, dict):
                markdown_preview = export_obj.get('markdown')

            results.append(
                {
                    'id': str(r.id),
                    'created_at': r.created_at.isoformat() if r.created_at else None,
                    'module_code': r.module_code,
                    'visibility': r.visibility,
                    'summary': (r.therapist_annotations or {}).get('summary') if isinstance(r.therapist_annotations, dict) else None,
                    'markdown': markdown_preview,
                }
            )

        return Response({'results': results}, status=status.HTTP_200_OK)

    def post(self, request, id):
        patient = get_object_or_404(Patient, pk=id, therapist=request.user, is_active=True)

        payload = request.data if isinstance(request.data, dict) else {}
        selected_sections = _normalize_selected_sections(payload)
        level = payload.get('level') if isinstance(payload.get('level'), str) else 'summary'
        if level not in {'summary', 'audit'}:
            level = 'summary'

        chart_obj = AstrologyNatalChart.objects.filter(patient=patient).first()
        astrology_id = None
        astrology_digest = None
        if selected_sections.get('astrology') and chart_obj and isinstance(chart_obj.chart_payload, dict):
            astrology_id = getattr(chart_obj, 'id', None)
            astrology_digest = _extract_astrology_digest(chart_obj.chart_payload, level)

        tests_digest, test_ids = ([], [])
        if selected_sections.get('tests'):
            tests_digest, test_ids = _extract_tests_digest(patient, level)

        cabalistic_digest, cabalistic_ids = ({}, [])
        if selected_sections.get('tarot') or selected_sections.get('kabbalah'):
            cabalistic_digest, cabalistic_ids = _extract_cabalistic_digest(
                patient,
                level,
                include_tarot=bool(selected_sections.get('tarot')),
                include_kabbalah=bool(selected_sections.get('kabbalah')),
            )

        cabala_aplicada_digest: Optional[Dict[str, Any]] = None
        cabala_aplicada_record_ids: List[str] = []
        if selected_sections.get('kabbalah'):
            try:
                cabala_aplicada_digest, cabala_aplicada_record_ids = _extract_cabala_aplicada_digest(
                    patient, request.user, level
                )
            except Exception:
                cabala_aplicada_digest = None
                cabala_aplicada_record_ids = []

            if isinstance(cabalistic_digest, dict):
                cabalistic_digest['cabala_aplicada'] = cabala_aplicada_digest

        bioemotional_digest = None
        bioemotional_trace: Dict[str, Any] = {}
        if selected_sections.get('bioemotional'):
            try:
                bioemotional_digest, bioemotional_trace = _extract_bioemotional_digest(patient, request.user, level)
            except Exception:
                # Nunca romper el export por un módulo complementario.
                bioemotional_digest = None
                bioemotional_trace = {}

        # Patient display name (best-effort)
        profile_name = None
        try:
            user = getattr(patient, 'user', None)
            profile = getattr(user, 'profile', None) if user else None
            if profile:
                profile_name = getattr(profile, 'legal_full_name', None) or getattr(profile, 'full_name', None)
        except Exception:
            profile_name = None

        patient_name = (
            profile_name
            or getattr(patient, 'full_name', None)
            or f"{getattr(patient, 'first_name', '')} {getattr(patient, 'last_name', '')}".strip()
            or getattr(patient, 'email', None)
            or f"Paciente #{getattr(patient, 'id', '')}"
        )

        export_json: Dict[str, Any] = {
            'export_version': '1',
            'generated_at': timezone.now().isoformat(),
            'visibility': 'therapist',
            'level': level,
            'selected_sections': selected_sections,
            'patient': {
                'id': getattr(patient, 'id', None),
                'name': patient_name,
            },
            'therapist': {
                'id': getattr(request.user, 'id', None),
                'username': getattr(request.user, 'username', None),
            },
            'source_trace': {
                'astrology_natal_chart_id': astrology_id,
                'test_result_ids': test_ids,
                'cabalistic_analysis_ids': cabalistic_ids,
                'cabala_aplicada_analysis_record_ids': cabala_aplicada_record_ids,
                'bioemotional': bioemotional_trace,
            },
            'sections': {
                'astrology': astrology_digest,
                'tests': tests_digest,
                'cabalistic': cabalistic_digest,
                'bioemotional': bioemotional_digest,
            },
        }

        markdown = _build_markdown(export_json)
        export_json['markdown'] = markdown

        # Required snapshots for AnalysisRecord
        birth_snapshot = {
            'legal_name': patient_name,
            'birth_date': patient.birth_date.isoformat() if patient.birth_date else None,
            'birth_time': patient.birth_time.isoformat() if patient.birth_time else None,
            'city': getattr(patient, 'birth_city', None) or None,
            'country': getattr(patient, 'birth_country', None) or None,
            'lat': float(patient.birth_latitude) if patient.birth_latitude is not None else None,
            'lng': float(patient.birth_longitude) if patient.birth_longitude is not None else None,
            'timezone': getattr(patient, 'birth_timezone', None) or None,
            'geocode_source': 'patient_profile',
        }

        algorithm_snapshot = {
            'engine': 'holistic_export',
            'version': '1',
            'params': {
                'module_code': MODULE_CODE,
                'level': level,
                'selected_sections': selected_sections,
            },
        }

        record = AnalysisRecord.objects.create(
            kind='legacy',
            module_code=MODULE_CODE,
            role_context='therapist',
            execution_mode='therapist_clinical',
            birth_data_snapshot=birth_snapshot,
            algorithm_snapshot=algorithm_snapshot,
            raw_input=payload,
            computed_result={'export': export_json},
            legacy_output=None,
            therapist_annotations={
                'summary': 'Export holístico (interno) generado',
                'notes': '',
                'visible_to_patient': False,
            },
            visibility='therapist',
            created_by_user=request.user,
            subject_user=patient.user if patient.user else None,
            therapist=request.user,
            patient=patient,
        )

        return Response(
            {
                'id': str(record.id),
                'created_at': record.created_at.isoformat() if record.created_at else None,
                'module_code': record.module_code,
                'export': export_json,
            },
            status=status.HTTP_201_CREATED,
        )
