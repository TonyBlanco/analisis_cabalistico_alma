import logging
from datetime import datetime
from typing import Dict
from tests.wellness.anxiety_state_trait.stai_bank import select_items_for_execution
from tests.wellness.scl90 import select_items_scdf  # noqa: F401

logger = logging.getLogger(__name__)


def _generate_code(prefix='DIAG'):
    ts = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    return f"{prefix}-{ts}"


def compute_bdi(input_data: dict) -> dict:
    """Compute BDI-II scoring.

    Expects: nombre, edad, fecha, terapeuta, responses (dict questionId->0..3)
    Returns: structured JSON with codes, scores, interpretacion, validity
    """
    responses = input_data.get('responses', {}) or {}
    # Questions 1..21, cognitive/affective (14 items) and somatic (7 items)
    cognitive_set = {1,2,3,4,5,6,7,8,9,10,11,12,13,14}
    somatic_set = {15,16,17,18,19,20,21}

    total = 0
    ca = 0
    s = 0
    for q, v in responses.items():
        try:
            qi = int(q)
            vi = int(v)
        except Exception:
            continue
        total += vi
        if qi in cognitive_set:
            ca += vi
        elif qi in somatic_set:
            s += vi

    # severity
    if total <= 13:
        severity = 'Mínima'
        desc = 'Depresión mínima o ausente'
    elif total <= 19:
        severity = 'Leve'
        desc = 'Depresión leve'
    elif total <= 28:
        severity = 'Moderada'
        desc = 'Depresión moderada'
    else:
        severity = 'Grave'
        desc = 'Depresión severa'

    # suicide check - question 9: 2 or above -> moderate/high
    q9 = int(responses.get('9') or 0)
    suicide_alert = False
    suicide_level = None
    if q9 >= 2:
        suicide_alert = True
        suicide_level = 'ALTO' if q9 == 3 else 'MODERADO'

    # validity
    complete = len(responses) == 21
    # time validity should be computed elsewhere - default True
    time_ok = True

    result = {
        'codigo_evaluacion': _generate_code('BDI2'),
        'fecha_evaluacion': input_data.get('fecha') or datetime.utcnow().strftime('%Y-%m-%d'),
        'datos_cliente': {
            'nombre': input_data.get('nombre'),
            'edad': int(input_data.get('edad')) if input_data.get('edad') else None,
            'terapeuta': input_data.get('terapeuta')
        },
        'respuestas': responses,
        'puntuaciones': {
            'total': total,
            'maximo': 63,
            'cognitivo_afectivo': {'punt': ca, 'pct': round((ca/42)*100) if 42 else 0},
            'somatico': {'punt': s, 'pct': round((s/21)*100) if 21 else 0}
        },
        'interpretacion': {
            'gravedad': severity,
            'descripcion': desc,
            'rango': f"{total}/63"
        },
        'alertas': {
            'riesgo_suicida': suicide_alert,
            'nivel': suicide_level,
            'item_9': q9
        },
        'validez': {
            'completo': complete,
            'tiempo_ok': time_ok
        },
        'metricas': {
            'alpha': '0.86-0.92',
            'test_retest': '0.93',
            'validez': 'PHQ-9/ADO'  # indicative
        },
        'recomendaciones': []
    }

    # Recommendations based on severity
    if total >= 29:
        result['recomendaciones'].append('Considerar intervención intensiva/psiquiátrica')
    elif total >= 20:
        result['recomendaciones'].append('Tratamiento psicoterapéutico activo')
    elif total >= 14:
        result['recomendaciones'].append('Intervención psicoterapéutica indicada')
    else:
        result['recomendaciones'].append('Seguimiento y reevaluación periódica')

    if suicide_alert:
        result['recomendaciones'].insert(0, 'URGENTE: Evaluación de riesgo suicida')

    return result


def compute_bai(input_data: dict) -> dict:
    """Compute BAI scoring (Beck Anxiety Inventory).
    Expects responses question ids 1..21 values 0..3
    """
    responses = input_data.get('responses', {}) or {}
    physical_set = set(range(1, 18))  # 1..17
    cognitive_set = set(range(18, 22))  # 18..21

    total = 0
    phys = 0
    cog = 0
    for q, v in responses.items():
        try:
            qi = int(q)
            vi = int(v)
        except Exception:
            continue
        total += vi
        if qi in physical_set:
            phys += vi
        elif qi in cognitive_set:
            cog += vi

    if total <= 7:
        severity = 'Mínima'
        desc = 'Ansiedad mínima'
    elif total <= 15:
        severity = 'Leve'
        desc = 'Ansiedad leve'
    elif total <= 25:
        severity = 'Moderada'
        desc = 'Ansiedad moderada'
    else:
        severity = 'Grave'
        desc = 'Ansiedad grave'

    # panic check: palpitations(7), ahogo(15), temor a morir(16)
    panic_keys = [7, 15, 16]
    panic_count = sum(1 for k in panic_keys if int(responses.get(str(k)) or 0) >= 2)
    panic_alert = panic_count >= 2

    complete = len(responses) == 21

    result = {
        'codigo_evaluacion': _generate_code('BAI'),
        'fecha_evaluacion': input_data.get('fecha') or datetime.utcnow().strftime('%Y-%m-%d'),
        'datos_cliente': {
            'nombre': input_data.get('nombre'),
            'edad': int(input_data.get('edad')) if input_data.get('edad') else None,
            'terapeuta': input_data.get('terapeuta')
        },
        'respuestas': responses,
        'puntuaciones': {
            'total': total,
            'maximo': 63,
            'sintomas_fisicos': {'punt': phys, 'porcentaje': round((phys/51)*100) if 51 else 0, 'items': 17},
            'sintomas_cognitivos': {'punt': cog, 'porcentaje': round((cog/12)*100) if 12 else 0, 'items': 4}
        },
        'interpretacion': {
            'gravedad': severity,
            'descripcion': desc,
            'rango': f"{total}/63"
        },
        'alertas': {
            'sintomas_panico': panic_alert,
            'items_criticos': { 'palpitaciones': int(responses.get('7') or 0), 'ahogo': int(responses.get('15') or 0), 'temor_morir': int(responses.get('16') or 0) }
        },
        'validez': {
            'completo': complete,
            'patron_consistente': True,
            'tiempo_valido': True
        },
        'metricas': {
            'alpha_cronbach': '0.92',
            'test_retest': '0.75',
            'validez_discriminante': 'BDI-II'  # used for differential diagnosis
        },
        'recomendaciones': []
    }

    if panic_alert:
        result['recomendaciones'].append('IMPORTANTE: Evaluar posible trastorno de pánico')
    if total >= 26:
        result['recomendaciones'].append('Ansiedad grave - evaluar necesidad de intervención inmediata')
    elif total >= 16:
        result['recomendaciones'].append('Tratamiento psicoterapéutico activo recomendado')
    elif total >= 8:
        result['recomendaciones'].append('Intervención preventiva o psicoeducación recomendada')
    else:
        result['recomendaciones'].append('Seguimiento y prevención')

    return result


def compute_scl90(input_data: dict) -> dict:
    """Compute a simplified SCL-90-R result.
    Expects: nombre, edad, fecha, terapeuta, responses (dict questionId->0..4)
    Returns: GSI, PSDI, PST and dimension averages
    """
    responses = input_data.get('responses', {}) or {}
    # Dimensional mapping is partial; fallback to generic averaging
    all_items = []
    dim_scores = {}
    # Build simple mapping by assuming keys are ints and using ranges per dim not explicitly mapped here
    for q, v in responses.items():
        try:
            vi = int(v)
        except Exception:
            vi = 0
        all_items.append(vi)

    total = sum(all_items)
    gsi = (total / (len(all_items) or 1))
    psdi = (sum(v for v in all_items if v > 0) / (len([v for v in all_items if v > 0]) or 1))
    pst = len([v for v in all_items if v > 0])

    # Example: derive simple dimension scores if items map exists
    # Partial mapping aligned with frontend SCL-90 mapping - adapt for full instrument
    dimensions_map = {
        'SOM': [1,4,12,27,40,42,48,49,52,53,56,58],
        'O-C': [3,9,10,28,38,45,46,51,55,65],
        'I-S': [6,21,34,36,37,41,61,69,73],
        'DEP': [5,14,15,20,22,26,29,30,31,32,54,71,79],
        'ANX': [2,17,23,33,39,57,72,78,80,86],
        'HOS': [11,24,63,67,74,81],
        'PHOB': [13,25,47,50,70,75,82],
        'PAR': [8,18,43,68,76,83],
        'PSY': [7,16,35,62,77,84,85,87,88,90],
        'ADD': [19,44,59,60,64,66,89]
    }
    for key, items in dimensions_map.items():
        dim_vals = [int(responses.get(str(i)) or 0) for i in items]
        dim_scores[ key ] = sum(dim_vals) / (len(dim_vals) or 1)
    result = {
        'codigo_evaluacion': _generate_code('SCL90'),
        'fecha_evaluacion': input_data.get('fecha') or datetime.utcnow().strftime('%Y-%m-%d'),
        'datos_cliente': {
            'nombre': input_data.get('nombre'),
            'edad': int(input_data.get('edad')) if input_data.get('edad') else None,
            'terapeuta': input_data.get('terapeuta')
        },
        'respuestas': responses,
        'puntuaciones': {
            'gsi': gsi,
            'psdi': psdi,
            'pst': pst,
            'dimensiones': dim_scores
        },
        'interpretacion': {'gravedad': 'Ver resultados', 'descripcion': 'GSI y dimensiones por evaluación'},
        'validez': {'completo': len(responses) == 90, 'tiempo_ok': True},
        'metricas': {'alpha': '0.85-0.95'},
        'recomendaciones': []
    }

    if gsi >= 2:
        result['recomendaciones'].append('Evaluación intensiva y posible intervención inmediata')
    elif gsi >= 1.5:
        result['recomendaciones'].append('Intervención terapéutica indicada')
    elif gsi >= 1:
        result['recomendaciones'].append('Monitoreo y psicoterapia')
    else:
        result['recomendaciones'].append('Seguimiento y psicoeducación')

    return result


def compute_scl90_wellness(input_data: dict) -> dict:
    logger.warning('SCL-90 wellness execution stub called before implementation')
    raise NotImplementedError('SCL-90 wellness execution pending')


def compute_scdf(input_data: dict) -> dict:
    """Compute a structured SCDF (internal clinical framework) result.

    The frontend sends a JSON compatible with the legacy SCDF template:
    - metadata
    - client_data
    - modules[] with core_gate, additional_criteria, exclusion_flags

    This is NOT a licensed instrument; we produce summary metrics and a per-module breakdown.
    """
    metadata = input_data.get('metadata') or {}
    client_data = input_data.get('client_data') or {}
    modules = input_data.get('modules') or []

    if not isinstance(modules, list):
        modules = []

    module_summaries = []
    core_present_count = 0
    additional_total = 0
    additional_met_total = 0
    exclusion_flags_true_total = 0

    for m in modules:
        if not isinstance(m, dict):
            continue
        module_id = m.get('module_id')
        module_name = m.get('module_name')
        core_gate = m.get('core_gate') if isinstance(m.get('core_gate'), dict) else {}
        core_present = bool(core_gate.get('present'))
        if core_present:
            core_present_count += 1

        additional_criteria = m.get('additional_criteria')
        if not isinstance(additional_criteria, list):
            additional_criteria = []
        add_total = len(additional_criteria)
        add_met = 0
        for c in additional_criteria:
            if isinstance(c, dict) and c.get('met') is True:
                add_met += 1
        additional_total += add_total
        additional_met_total += add_met

        exclusion_flags = m.get('exclusion_flags') if isinstance(m.get('exclusion_flags'), dict) else {}
        exclusions_true = sum(1 for v in exclusion_flags.values() if bool(v))
        exclusion_flags_true_total += exclusions_true

        module_summaries.append(
            {
                'module_id': module_id,
                'module_name': module_name,
                'status': m.get('status'),
                'core_gate_present': core_present,
                'additional_criteria': {
                    'total': add_total,
                    'met': add_met,
                },
                'exclusion_flags_true': exclusions_true,
            }
        )

    summary = {
        'modules_total': len(module_summaries),
        'core_gate_present': core_present_count,
        'additional_criteria_total': additional_total,
        'additional_criteria_met': additional_met_total,
        'exclusion_flags_true_total': exclusion_flags_true_total,
    }

    return {
        'codigo_evaluacion': _generate_code('SCDF'),
        'fecha_evaluacion': (client_data.get('fecha') if isinstance(client_data, dict) else None)
        or metadata.get('created_at')
        or datetime.utcnow().strftime('%Y-%m-%d'),
        'framework': {
            'framework_name': metadata.get('framework_name'),
            'framework_version': metadata.get('framework_version'),
            'jurisdiction': metadata.get('jurisdiction'),
            'based_on': metadata.get('based_on'),
        },
        'cliente': {
            'nombre': client_data.get('nombre') if isinstance(client_data, dict) else None,
            'edad': client_data.get('edad') if isinstance(client_data, dict) else None,
            'fecha': client_data.get('fecha') if isinstance(client_data, dict) else None,
        },
        'resumen': summary,
        'modulos': module_summaries,
        # Keep the raw SCDF structure (without clinician_notes) for audit/review
        'raw': {
            'metadata': metadata,
            'client_data': client_data,
            'modules': modules,
        },
    }


def compute_wellness_assessment(input_data: dict) -> dict:
    """Compute an in-house Wellness Assessment (non-medical).

    Expects:
      - responses: dict(questionId -> 0..4)
        (0=Nunca, 1=Rara vez, 2=A veces, 3=A menudo, 4=Casi siempre)

    Returns:
      - Overall wellbeing index (0..100)
      - Domain averages (0..4) + percent (0..100)
      - Strengths + focus areas
      - Practical next steps (non-clinical)
    """
    responses = (input_data.get('responses', {}) or {})

    domains = {
        'sueño': ['w1', 'w2', 'w3'],
        'energía': ['w4', 'w5'],
        'estrés_regulación': ['w6', 'w7', 'w8'],
        'estado_de_animo': ['w9', 'w10'],
        'movimiento': ['w11', 'w12'],
        'nutrición_hidratación': ['w13', 'w14'],
        'conexión': ['w15', 'w16'],
        'propósito': ['w17', 'w18'],
        'atención_plena': ['w19', 'w20'],
        'autocompasión': ['w21', 'w22'],
    }

    # Reverse-coded items (higher response means worse)
    reverse_items = {'w6', 'w7', 'w10'}

    def _as_int(val) -> int:
        try:
            return int(val)
        except Exception:
            return 0

    def _normalize_value(qid: str) -> int:
        v = _as_int(responses.get(qid, 0))
        v = max(0, min(4, v))
        if qid in reverse_items:
            return 4 - v
        return v

    domain_scores = {}
    all_vals = []
    for domain, qids in domains.items():
        vals = [_normalize_value(qid) for qid in qids]
        all_vals.extend(vals)
        avg = sum(vals) / (len(vals) or 1)
        domain_scores[domain] = {
            'avg_0_4': round(avg, 2),
            'percent_0_100': int(round((avg / 4) * 100)),
            'items': len(qids),
        }

    overall_avg = (sum(all_vals) / (len(all_vals) or 1))
    wellbeing_index = int(round((overall_avg / 4) * 100))

    # Strengths / focus areas
    ranked = sorted(domain_scores.items(), key=lambda kv: kv[1]['avg_0_4'], reverse=True)
    strengths = [name for name, _ in ranked[:2]]
    focus_areas = [name for name, _ in ranked[-2:]][::-1]

    # Gentle tiers
    if wellbeing_index >= 75:
        tier = 'Alto'
        tier_note = 'Tu base de bienestar se ve sólida. Enfócate en sostener hábitos y afinar detalles.'
    elif wellbeing_index >= 50:
        tier = 'Medio'
        tier_note = 'Hay elementos de bienestar presentes, pero con áreas claras para mejorar con acciones simples y consistentes.'
    else:
        tier = 'Bajo'
        tier_note = 'Tu bienestar se ve comprometido. Prioriza descanso, regulación y apoyo; busca acompañamiento si lo necesitas.'

    next_steps = []
    # Domain-specific suggestions for the lowest focus areas
    suggestions = {
        'sueño': ['Rutina fija de sueño 5–7 días', 'Evitar pantallas 30–60 min antes de dormir'],
        'energía': ['Micro-pauses de 2–3 min cada 90 min', 'Luz solar matinal 10–15 min'],
        'estrés_regulación': ['Respiración 4-6 por 3 minutos', 'Registro breve: gatillo → emoción → necesidad'],
        'estado_de_animo': ['Agenda 1 actividad gratificante diaria (10–20 min)', 'Reducir multitarea y sobrecarga'],
        'movimiento': ['Caminata suave 15–25 min 3x/semana', 'Estiramientos 5 min al despertar'],
        'nutrición_hidratación': ['Hidratación: 6–8 vasos/día (ajusta a tu caso)', 'Regularidad de comidas (sin perfeccionismo)'],
        'conexión': ['1 contacto significativo por semana', 'Pedir apoyo concreto (qué, cuándo, cómo)'],
        'propósito': ['Definir 1 valor guía y 1 acción semanal', 'Revisar metas: pequeñas y realistas'],
        'atención_plena': ['Anclaje sensorial 5-4-3-2-1', 'Pausa consciente antes de comer (3 respiraciones)'],
        'autocompasión': ['Hablarte como hablarías a un amigo', 'Escribir 3 logros/acciones pequeñas al día'],
    }
    for area in focus_areas:
        next_steps.extend(suggestions.get(area, [])[:2])
    # De-duplicate
    dedup = []
    for s in next_steps:
        if s not in dedup:
            dedup.append(s)
    next_steps = dedup[:6]

    result = {
        'codigo_evaluacion': _generate_code('WELL'),
        'fecha_evaluacion': input_data.get('fecha') or datetime.utcnow().strftime('%Y-%m-%d'),
        'respuestas': responses,
        'puntuaciones': {
            'indice_bienestar_0_100': wellbeing_index,
            'nivel': tier,
            'dominios': domain_scores,
        },
        'interpretacion': {
            'resumen': tier_note,
            'fortalezas': strengths,
            'areas_enfoque': focus_areas,
        },
        'alertas': {
            'nota': 'Este cuestionario es orientativo y no constituye diagnóstico médico o psicológico.'
        },
        'recomendaciones': next_steps,
        'validez': {
            'completo': True,
            'tiempo_ok': True
        }
    }
    return result


def compute_insomnia_wellness(input_data: dict) -> dict:
    """Compute an in-house Insomnia Wellness check (non-medical).

    Expects:
      - responses: dict(questionId -> 0..4) using ids i1..i16
        (0=Nunca, 1=Rara vez, 2=A veces, 3=A menudo, 4=Casi siempre)

    Returns a structure compatible with the insomnia patient UI.
    """
    responses = (input_data.get('responses', {}) or {})

    domains = {
        'inicio_continuidad': ['i1', 'i2', 'i3', 'i4'],
        'regularidad_ritmo': ['i5', 'i6', 'i7', 'i8'],
        'habitos_entorno': ['i9', 'i10', 'i11', 'i12'],
        'recuperacion_diurna': ['i13', 'i14', 'i15', 'i16'],
    }

    reverse_items = {'i2', 'i4', 'i8', 'i11', 'i15'}

    def _as_int(val) -> int:
        try:
            return int(val)
        except Exception:
            return 0

    def _normalize_value(qid: str) -> int:
        v = _as_int(responses.get(qid, 0))
        v = max(0, min(4, v))
        if qid in reverse_items:
            return 4 - v
        return v

    domain_scores = {}
    all_vals = []
    for domain, qids in domains.items():
        vals = [_normalize_value(qid) for qid in qids]
        all_vals.extend(vals)
        avg = sum(vals) / (len(vals) or 1)
        domain_scores[domain] = {
            'avg_0_4': round(avg, 2),
            'percent_0_100': int(round((avg / 4) * 100)),
            'items': len(qids),
        }

    overall_avg = (sum(all_vals) / (len(all_vals) or 1))
    index_0_100 = int(round((overall_avg / 4) * 100))

    ranked = sorted(domain_scores.items(), key=lambda kv: kv[1]['avg_0_4'], reverse=True)
    strengths = [name for name, _ in ranked[:2]]
    focus_areas = [name for name, _ in ranked[-2:]][::-1]

    if index_0_100 >= 75:
        tier = 'Alto'
        tier_note = 'Tu descanso se percibe estable. Enfócate en sostener hábitos y proteger tu rutina de sueño.'
    elif index_0_100 >= 50:
        tier = 'Medio'
        tier_note = 'Hay bases de descanso, pero con áreas claras para mejorar con ajustes simples y consistentes.'
    else:
        tier = 'Bajo'
        tier_note = 'Tu descanso se percibe comprometido. Prioriza regularidad, relajación y pide apoyo si lo necesitas.'

    suggestions = {
        'inicio_continuidad': [
            'Rutina de desconexión 30–60 min antes de dormir',
            'Reducir cafeína/estimulantes en la tarde',
        ],
        'regularidad_ritmo': [
            'Horario fijo de acostarte y levantarte (5–7 días)',
            'Exposición a luz natural por la mañana (10–15 min)',
        ],
        'habitos_entorno': [
            'Evitar pantallas antes de dormir (modo noche / sin scroll)',
            'Optimizar entorno: oscuridad, temperatura, ruido',
        ],
        'recuperacion_diurna': [
            'Micro-pausas de 2–3 min durante el día (respiración / estiramientos)',
            'Evitar siestas largas; siesta corta (10–20 min) si es necesaria',
        ],
    }

    next_steps = []
    for area in focus_areas:
        next_steps.extend(suggestions.get(area, [])[:2])
    dedup = []
    for s in next_steps:
        if s not in dedup:
            dedup.append(s)
    next_steps = dedup[:6]

    return {
        'codigo_evaluacion': _generate_code('INSOM'),
        'fecha_evaluacion': input_data.get('fecha') or datetime.utcnow().strftime('%Y-%m-%d'),
        'respuestas': responses,
        'puntuaciones': {
            'indice_0_100': index_0_100,
            'nivel': tier,
            'dominios': domain_scores,
        },
        'interpretacion': {
            'resumen': tier_note,
            'fortalezas': strengths,
            'areas_enfoque': focus_areas,
        },
        'recomendaciones': next_steps,
        'alertas': {
            'nota': 'Este resultado es orientativo y no constituye un diagnóstico. Si el malestar persiste, considera consultar con un profesional.',
        },
        'validez': {
            'completo': True,
            'tiempo_ok': True,
        },
    }


def compute_nutrition_wellness(input_data: dict) -> dict:
    """Compute a Wellness Nutrition check (non-medical, non-diagnostic).

    Returns the canonical WELLNESS contract:
      {
        "index": 0-100,
        "level": "bajo|medio|alto",
        "map": { "strengths": [], "focus_areas": [] },
        "summary_text": "",
        "suggested_steps": [],
        "disclaimer": "...",
        "raw_inputs": {}
      }
    """
    responses = (input_data.get('responses', {}) or {})

    dimensions = {
        'señales corporales': ['n1', 'n2', 'n3', 'n4'],
        'relación emocional': ['n5', 'n6', 'n7', 'n8'],
        'regularidad y hábitos': ['n9', 'n10', 'n11', 'n12'],
        'contexto y autocuidado': ['n13', 'n14', 'n15', 'n16'],
    }

    reverse_items = {'n4', 'n5', 'n7', 'n10', 'n12', 'n16'}

    def _as_int(val) -> int:
        try:
            return int(val)
        except Exception:
            return 0

    def _normalize_value(qid: str) -> int:
        v = _as_int(responses.get(qid, 0))
        v = max(0, min(4, v))
        if qid in reverse_items:
            return 4 - v
        return v

    dim_scores = {}
    all_vals = []
    for dim, qids in dimensions.items():
        vals = [_normalize_value(qid) for qid in qids]
        all_vals.extend(vals)
        dim_score = sum(vals)  # 0..16
        dim_scores[dim] = {
            'score_0_16': dim_score,
            'percent_0_100': int(round((dim_score / 16) * 100)),
        }

    total_score = sum(all_vals)  # 0..64
    index_0_100 = int(round((total_score / 64) * 100))

    if index_0_100 <= 39:
        level = 'bajo'
    elif index_0_100 <= 69:
        level = 'medio'
    else:
        level = 'alto'

    strengths = [k for k, v in dim_scores.items() if v['percent_0_100'] >= 70]
    focus_areas = [k for k, v in dim_scores.items() if v['percent_0_100'] < 50]

    summary_text = (
        'Este resultado ofrece una lectura orientativa de tu relación con la alimentación y los hábitos que la rodean. '
        'No se trata de una evaluación nutricional ni diagnóstica, sino de una invitación a observar cómo te relacionas '
        'con la comida y contigo.'
    )
    suggested_steps = [
        'Observar señales de hambre y saciedad antes y después de comer.',
        'Introducir al menos una comida diaria con atención plena.',
        'Explorar la relación entre emociones y alimentación sin juicio.',
        'Establecer horarios amables y sostenibles.',
        'Priorizar una relación respetuosa con la comida, no el control.',
    ]
    disclaimer = 'Este resultado es orientativo y no sustituye la valoración de un profesional de la salud o la nutrición.'

    return {
        'index': index_0_100,
        'level': level,
        'map': {
            'strengths': strengths,
            'focus_areas': focus_areas,
        },
        'summary_text': summary_text,
        'suggested_steps': suggested_steps[:5],
        'disclaimer': disclaimer,
        'raw_inputs': {
            'responses': responses,
            'dimensions': dim_scores,
            'total_score_0_64': total_score,
        },
    }


def compute_stress_regulation_wellness(input_data: dict) -> dict:
    """Compute a Wellness Stress-Regulation assessment (non-diagnostic).

    Expects:
      - responses: dict(questionId -> 0..4) using ids sr1..sr18
        (0=Nunca, 1=Rara vez, 2=A veces, 3=A menudo, 4=Casi siempre)

    Returns the Wellness-style contract used by insomnia/wellness pages:
      {
        "puntuaciones": { "indice_0_100": 0-100, "nivel": "Bajo|Medio|Alto", "dominios": {...} },
        "interpretacion": { "resumen": "...", "fortalezas": [], "areas_enfoque": [] },
        "recomendaciones": [],
        "alertas": { "nota": "Resultado orientativo, no diagnóstico" }
      }
    """
    responses = (input_data.get('responses', {}) or {})

    domains = {
        'carga_fisiologica': ['sr1', 'sr2', 'sr3'],
        'carga_mental_emocional': ['sr4', 'sr5', 'sr6'],
        'recuperacion_descanso': ['sr7', 'sr8', 'sr9'],
        'regulacion_emocional': ['sr10', 'sr11', 'sr12'],
        'recursos_personales': ['sr13', 'sr14', 'sr15'],
        'apoyo_externo': ['sr16', 'sr17', 'sr18'],
    }

    # Load items: higher means worse (reverse to compute a "wellness/regulation" index)
    reverse_items = {
        # carga fisiológica
        'sr1', 'sr2', 'sr3',
        # carga mental/emocional
        'sr4', 'sr5', 'sr6',
        # recuperación/descanso (negative phrasing)
        'sr7', 'sr8',
        # apoyo externo (lack of support)
        'sr17',
    }

    def _as_int(val) -> int:
        try:
            return int(val)
        except Exception:
            return 0

    def _normalize_value(qid: str) -> int:
        v = _as_int(responses.get(qid, 0))
        v = max(0, min(4, v))
        if qid in reverse_items:
            return 4 - v
        return v

    domain_scores = {}
    all_vals = []
    for domain, qids in domains.items():
        vals = [_normalize_value(qid) for qid in qids]
        all_vals.extend(vals)
        avg = sum(vals) / (len(vals) or 1)
        domain_scores[domain] = {
            'avg_0_4': round(avg, 2),
            'percent_0_100': int(round((avg / 4) * 100)),
            'items': len(qids),
        }

    overall_avg = (sum(all_vals) / (len(all_vals) or 1))
    index_0_100 = int(round((overall_avg / 4) * 100))

    if index_0_100 >= 70:
        tier = 'Alto'
        summary = (
            'Se observa una buena capacidad de regulación y recursos disponibles. '
            'Tu carga se percibe manejable en este momento.'
        )
    elif index_0_100 >= 40:
        tier = 'Medio'
        summary = (
            'Se observa una regulación moderada con señales puntuales de carga. '
            'Ajustes simples y consistentes pueden ayudarte a sostener el equilibrio.'
        )
    else:
        tier = 'Bajo'
        summary = (
            'Se observa una carga elevada y/o recursos de regulación limitados en este momento. '
            'Prioriza descanso, apoyo y prácticas suaves de regulación; considera acompañamiento si lo necesitas.'
        )

    ranked = sorted(domain_scores.items(), key=lambda kv: kv[1]['percent_0_100'], reverse=True)
    strengths = [name for name, v in ranked if v['percent_0_100'] >= 70][:4]
    focus_areas = [name for name, v in ranked if v['percent_0_100'] < 50][:4]

    recommendations = [
        'Hacer una pausa breve de regulación (respiración lenta 2–3 min) una vez al día.',
        'Proteger un bloque corto de descanso sin pantalla antes de dormir.',
        'Identificar una demanda principal y ajustar límites de forma amable.',
        'Registrar 1 señal corporal de tensión y practicar soltura (mandíbula/hombros).',
        'Pedir apoyo concreto si lo necesitas (qué, cuándo, cómo).',
    ][:5]

    return {
        'codigo_evaluacion': _generate_code('STRS'),
        'fecha_evaluacion': input_data.get('fecha') or datetime.utcnow().strftime('%Y-%m-%d'),
        'respuestas': responses,
        'puntuaciones': {
            'indice_0_100': index_0_100,
            'nivel': tier,
            'dominios': domain_scores,
        },
        'interpretacion': {
            'resumen': summary,
            'fortalezas': strengths,
            'areas_enfoque': focus_areas,
        },
        'recomendaciones': recommendations,
        'alertas': {
            'nota': 'Resultado orientativo, no diagnóstico.',
        },
        'validez': {
            'completo': True,
            'tiempo_ok': True,
        },
    }



def compute_anxiety_state_trait(input_data: dict) -> dict:
    """Compute a wellness-oriented anxiety assessment inspired by STAI."""

    seed = input_data.get('seed')
    selected_items = select_items_for_execution(seed=seed)
    responses = (input_data.get('responses', {}) or {})

    def _as_int(val) -> int:
        try:
            return int(val)
        except Exception:
            return 0

    def _normalize_value(item: Dict) -> int:
        raw_value = responses.get(item['id'], None)
        if raw_value is None:
            raw_value = responses.get(item.get('legacy_id', ''), 0)
        return max(0, min(4, _as_int(raw_value)))

    domain_scores = {}
    all_vals = []
    for domain in ('estado', 'rasgo'):
        domain_items = [item for item in selected_items if item.get('domain') == domain]
        if len(domain_items) != 10:
            raise ValueError(
                f'Canonical selection returned {len(domain_items)} items for domain {domain}; expected 10'
            )
        vals = [_normalize_value(item) for item in domain_items]
        all_vals.extend(vals)
        avg = sum(vals) / (len(vals) or 1)
        domain_scores[domain] = {
            'avg_0_4': round(avg, 2),
            'percent_0_100': int(round((avg / 4) * 100)),
            'items': len(domain_items),
        }

    overall_avg = (sum(all_vals) / (len(all_vals) or 1))
    index_0_100 = int(round((overall_avg / 4) * 100))

    if index_0_100 >= 70:
        tier = 'Alto'
        summary = 'Estado y rasgo muestran gestión sólida de la ansiedad; tus recursos mantienen equilibrio a pesar de señales puntuales.'
    elif index_0_100 >= 40:
        tier = 'Medio'
        summary = 'Hay señales de inquietud moderada, pero continúas contando con recursos para regular y reconectar con la calma.'
    else:
        tier = 'Bajo'
        summary = 'Estado y rasgo reflejan una ansiedad más marcada; prioriza pausas, apoyo y prácticas suaves de regulación.'

    ranked = sorted(domain_scores.items(), key=lambda kv: kv[1]['percent_0_100'], reverse=True)
    strengths = [name for name, v in ranked if v['percent_0_100'] >= 70][:3]
    focus_areas = [name for name, v in ranked if v['percent_0_100'] < 50][:3]

    recommendations = [
        'Respirar conscientemente 2-3 minutos cuando notes que el cuerpo se activa.',
        'Identificar un pensamiento recurrente que dispara inquietud y reenfocarlo con calma.',
        'Planificar al menos un espacio diario sin dispositivos para bajar el ritmo.',
        'Compartir una preocupación con alguien de confianza y acordar un siguiente paso.',
        'Registrar una acción concreta que te ancle (tocar tierra, beber agua, pausar) cuando sientas alerta.',
    ]

    return {
        'codigo_evaluacion': _generate_code('ANST'),
        'fecha_evaluacion': input_data.get('fecha') or datetime.utcnow().strftime('%Y-%m-%d'),
        'respuestas': responses,
        'puntuaciones': {
            'indice_0_100': index_0_100,
            'nivel': tier,
            'dominios': domain_scores,
        },
        'interpretacion': {
            'resumen': summary,
            'fortalezas': strengths,
            'areas_enfoque': focus_areas,
        },
        'recomendaciones': recommendations,
        'alertas': {
            'nota': 'Resultado orientativo, no diagnóstico.',
        },
        'raw_inputs': {
            'selected_items': selected_items,
        },
    }


def compute_stress_wellness(input_data: dict) -> dict:
    """Compute an in-house Wellness Stress assessment (non-diagnostic).

    Expects:
      - responses: dict(questionId -> 0..4) using ids stress-a1..stress-c6
        (0=Nunca, 1=Rara vez, 2=A veces, 3=A menudo, 4=Casi siempre)

    Returns the Wellness-style shape used by insomnia/wellness pages.
    """
    responses = (input_data.get('responses', {}) or {})

    domains = {
        'carga': ['stress-a1', 'stress-a2', 'stress-a3', 'stress-a4', 'stress-a5', 'stress-a6'],
        'respuesta_fisica_emocional': ['stress-b1', 'stress-b2', 'stress-b3', 'stress-b4', 'stress-b5', 'stress-b6'],
        'regulacion_recursos': ['stress-c1', 'stress-c2', 'stress-c3', 'stress-c4', 'stress-c5', 'stress-c6'],
    }

    # Load items are negative; invert so higher always means "better regulation / lower load"
    reverse_items = set(domains['carga'] + domains['respuesta_fisica_emocional'])

    def _as_int(val) -> int:
        try:
            return int(val)
        except Exception:
            return 0

    def _normalize_value(qid: str) -> int:
        v = _as_int(responses.get(qid, 0))
        v = max(0, min(4, v))
        if qid in reverse_items:
            return 4 - v
        return v

    domain_scores = {}
    all_vals = []
    for domain, qids in domains.items():
        vals = [_normalize_value(qid) for qid in qids]
        all_vals.extend(vals)
        avg = sum(vals) / (len(vals) or 1)
        domain_scores[domain] = {
            'avg_0_4': round(avg, 2),
            'percent_0_100': int(round((avg / 4) * 100)),
            'items': len(qids),
        }

    overall_avg = (sum(all_vals) / (len(all_vals) or 1))
    index_0_100 = int(round((overall_avg / 4) * 100))

    if index_0_100 >= 70:
        tier = 'Alto'
        summary = 'Se observa una buena capacidad de regulación y recursos disponibles. Tu carga se percibe manejable en este momento.'
    elif index_0_100 >= 40:
        tier = 'Medio'
        summary = 'Se observa una regulación moderada con señales puntuales de carga. Ajustes simples y consistentes pueden ayudarte a sostener el equilibrio.'
    else:
        tier = 'Bajo'
        summary = 'Se observa una carga elevada y/o recursos de regulación limitados en este momento. Prioriza descanso, apoyo y prácticas suaves de regulación.'

    ranked = sorted(domain_scores.items(), key=lambda kv: kv[1]['percent_0_100'], reverse=True)
    strengths = [name for name, v in ranked if v['percent_0_100'] >= 70][:3]
    focus_areas = [name for name, v in ranked if v['percent_0_100'] < 50][:3]

    recommendations = [
        'Observar una señal corporal de tensión y practicar soltura (mandíbula/hombros) por 2 minutos.',
        'Introducir una pausa breve de regulación (respiración lenta) una vez al día.',
        'Proteger un bloque de descanso sin pantallas antes de dormir.',
        'Identificar una demanda principal y ajustar límites de forma amable.',
        'Pedir apoyo concreto si lo necesitas (qué, cuándo, cómo).',
    ]

    return {
        'codigo_evaluacion': _generate_code('STRS'),
        'fecha_evaluacion': input_data.get('fecha') or datetime.utcnow().strftime('%Y-%m-%d'),
        'respuestas': responses,
        'puntuaciones': {
            'indice_0_100': index_0_100,
            'nivel': tier,
            'dominios': domain_scores,
        },
        'interpretacion': {
            'resumen': summary,
            'fortalezas': strengths,
            'areas_enfoque': focus_areas,
        },
        'recomendaciones': recommendations[:5],
        'alertas': {
            'nota': 'Resultado orientativo, no diagnóstico.',
        },
        'validez': {
            'completo': True,
            'tiempo_ok': True,
        },
    }


def compute_screening_general(input_data: dict) -> dict:
    """Compute an in-house general psychological screening (non-diagnostic).

    Expects:
      - responses: dict(questionId -> 0..3)
        (0=Nada, 1=Leve, 2=Moderado, 3=Intenso)

    Returns a structured summary with domain scores, flags and suggested next steps.
    """
    responses = (input_data.get('responses', {}) or {})

    domains = {
        'ansiedad_preocupacion': ['s1', 's2', 's3', 's4', 's5'],
        'estado_de_animo': ['s6', 's7', 's8', 's9', 's10'],
        'trauma_estrés': ['s11', 's12', 's13', 's14'],
        'rumiacion_control': ['s15', 's16', 's17', 's18'],
        'somatizacion': ['s19', 's20', 's21', 's22'],
        'funcionamiento': ['s23', 's24', 's25', 's26'],
        'recursos': ['s27', 's28', 's29', 's30'],
    }

    reverse_items = {'s27', 's28', 's29', 's30'}  # resources: higher is better

    def _as_int(val) -> int:
        try:
            return int(val)
        except Exception:
            return 0

    def _clamp_0_3(v: int) -> int:
        return max(0, min(3, v))

    def _value(qid: str) -> int:
        v = _clamp_0_3(_as_int(responses.get(qid, 0)))
        if qid in reverse_items:
            return 3 - v
        return v

    domain_scores = {}
    total_distress = 0
    total_items = 0
    for domain, qids in domains.items():
        vals = [_value(qid) for qid in qids]
        total = sum(vals)
        total_distress += total
        total_items += len(qids)
        domain_scores[domain] = {
            'sum_0_3n': total,
            'avg_0_3': round(total / (len(qids) or 1), 2),
            'items': len(qids),
        }

    avg_distress = total_distress / (total_items or 1)
    distress_index_0_100 = int(round((avg_distress / 3) * 100))

    # Safety flag: self-harm/suicidal ideation item is s10
    safety_raw = _clamp_0_3(_as_int(responses.get('s10', 0)))
    safety_flag = safety_raw >= 1

    # Focus areas: top 2 domains by avg (excluding resources if present)
    ranked = sorted(domain_scores.items(), key=lambda kv: kv[1]['avg_0_3'], reverse=True)
    focus = [name for name, _ in ranked[:2]]

    if distress_index_0_100 >= 70:
        tier = 'Alto'
        summary = 'Se observa malestar elevado en varias áreas. Conviene priorizar contención, regulación y acompañamiento.'
    elif distress_index_0_100 >= 40:
        tier = 'Medio'
        summary = 'Se observan áreas de malestar moderado. Puede ser útil organizar prioridades y hábitos de apoyo.'
    else:
        tier = 'Bajo'
        summary = 'Se observa malestar bajo o acotado. Puede ser un buen momento para consolidar recursos y prevención.'

    recommendations = []
    if safety_flag:
        recommendations.append('Si estás en riesgo o te sientes en peligro, busca ayuda inmediata (servicios de emergencia o una línea de crisis local).')
        recommendations.append('Contacta a tu terapeuta o a un profesional de salud mental lo antes posible para apoyo.')

    domain_actions = {
        'ansiedad_preocupacion': ['Limitar “tiempo de preocupación” (10 min/día)', 'Respiración lenta 4-6 por 3–5 min'],
        'estado_de_animo': ['Rutina diaria mínima (sueño, comida, movimiento)', 'Planificar 1 actividad significativa diaria'],
        'trauma_estrés': ['Técnicas de grounding (5-4-3-2-1)', 'Evitar exposición innecesaria a disparadores en pico'],
        'rumiacion_control': ['Anotar pensamientos repetitivos y “soltar” (no resolver todo)', 'Practicar aceptación de incertidumbre en micro-pasos'],
        'somatizacion': ['Chequeo cuerpo: tensión, respiración, postura', 'Movimiento suave + hidratación'],
        'funcionamiento': ['Elegir 1 tarea prioritaria por bloque', 'Reducir demandas temporales y pedir apoyo'],
        'recursos': ['Identificar 2 apoyos concretos (personas/espacios)', 'Definir un plan semanal pequeño y sostenible'],
    }
    for f in focus:
        recommendations.extend(domain_actions.get(f, [])[:2])

    # De-duplicate and cap
    dedup = []
    for s in recommendations:
        if s not in dedup:
            dedup.append(s)
    recommendations = dedup[:8]

    result = {
        'codigo_evaluacion': _generate_code('SCRN'),
        'fecha_evaluacion': input_data.get('fecha') or datetime.utcnow().strftime('%Y-%m-%d'),
        'respuestas': responses,
        'puntuaciones': {
            'indice_malestar_0_100': distress_index_0_100,
            'nivel': tier,
            'total_distress': total_distress,
            'dominios': domain_scores,
        },
        'interpretacion': {
            'resumen': summary,
            'areas_enfoque': focus,
            'nota': 'Cuestionario orientativo para conversación terapéutica; no es diagnóstico.',
        },
        'alertas': {
            'ideacion_autolesion': safety_flag,
            'nivel_item_s10': safety_raw,
        },
        'recomendaciones': recommendations,
        'validez': {
            'completo': True,
            'tiempo_ok': True
        }
    }
    return result


def compute_asrs_essence(input_data: dict) -> dict:
    """Compute ASRS-Essence symbolic profile (non-clinical)."""
    answers = input_data.get('answers', {}) or {}
    values = []
    for key in sorted(answers.keys()):
        try:
            values.append(float(answers[key]))
        except Exception:
            continue

    if not values:
        return {
            'processed': False,
            'structured_data': None,
            'raw_answers': {},
            'message': 'Respuestas incompletas para ASRS-Essence.',
            'timestamp': str(datetime.now()),
        }

    score_total = sum(values) / len(values)
    score_total = round(score_total, 2)

    if score_total >= 4.2:
        rhythm_state = 'anchored'
    elif score_total >= 3.2:
        rhythm_state = 'fluctuating'
    else:
        rhythm_state = 'fragmented'

    atzilut_level = 'high' if rhythm_state == 'anchored' else 'medium' if rhythm_state == 'fluctuating' else 'low'
    transition_suggestion = 'deepening' if rhythm_state == 'anchored' else 'integration' if rhythm_state == 'fluctuating' else 'beriah'

    summary_text_map = {
        'anchored': 'Ritmo esencial estable. Se percibe coherencia interna y claridad de pulso.',
        'fluctuating': 'Ritmo esencial variable. Hay momentos de alineacion que alternan con dispersion.',
        'fragmented': 'Ritmo esencial disperso. Se sugiere volver a un eje sencillo y sostenido.',
    }

    structured_data = {
        'score_total': score_total,
        'rhythm_state': rhythm_state,
        'atzilut_level': atzilut_level,
        'transition_suggestion': transition_suggestion,
    }

    return {
        'processed': True,
        'structured_data': structured_data,
        'raw_answers': answers,
        'summary_text': summary_text_map.get(rhythm_state, ''),
        'timestamp': str(datetime.now()),
    }


def compute_past_lives(input_data: dict) -> dict:
    """Compute symbolic (non-diagnostic) aggregation for Past Lives exploration.

    Expects:
      - responses: dict(questionId -> 1..5)
      - open_reflection: optional str

    Returns EXACT schema:
      {
        symbolic_resonance_level: 'low'|'medium'|'high',
        dominant_themes: string[],
        reflection_axes: string[],
        summary_text: string
      }
    """
    responses = (input_data.get('responses', {}) or {})
    open_reflection = input_data.get('open_reflection')
    if not isinstance(open_reflection, str):
        open_reflection = ''
    open_reflection = open_reflection.strip()

    sections = {
        's1': 'Sensación de continuidad del alma',
        's2': 'Emociones sin causa aparente',
        's3': 'Patrones repetitivos de vida',
        's4': 'Afinidades históricas y simbólicas',
        's5': 'Sueños y memorias internas',
        's6': 'Misión, sentido y aprendizaje',
    }

    def _as_int(val) -> int:
        try:
            return int(val)
        except Exception:
            return 0

    def _clamp_1_5(v: int) -> int:
        return max(1, min(5, v))

    # Collect per-section values based on question ids like "pl_s3_q4"
    per_section_vals = {sid: [] for sid in sections.keys()}
    all_vals = []
    for qid, raw in responses.items():
        qid_str = str(qid)
        v = _clamp_1_5(_as_int(raw))
        all_vals.append(v)

        # Extract section id "sN" from "pl_sN_qM"
        sid = None
        parts = qid_str.split('_')
        for p in parts:
            if p in sections:
                sid = p
                break
        if sid and sid in per_section_vals:
            per_section_vals[sid].append(v)

    def _avg(vals: list[int]) -> float:
        return (sum(vals) / (len(vals) or 1))

    section_avgs = {sid: _avg(vals) for sid, vals in per_section_vals.items()}
    global_avg = _avg(all_vals)

    if global_avg <= 2.4:
        resonance = 'low'
        resonance_label = 'Baja'
    elif global_avg <= 3.6:
        resonance = 'medium'
        resonance_label = 'Media'
    else:
        resonance = 'high'
        resonance_label = 'Alta'

    ranked = sorted(section_avgs.items(), key=lambda kv: kv[1], reverse=True)
    dominant_themes: list[str] = []
    # Strongest sections (symbolic themes)
    for sid, avg in ranked:
        if avg >= 3.6:
            dominant_themes.append(sections[sid])
        if len(dominant_themes) >= 2:
            break
    # Add one "integration" pointer from the weakest section
    weakest_sid, weakest_avg = sorted(section_avgs.items(), key=lambda kv: kv[1])[0]
    if len(dominant_themes) < 3 and weakest_avg <= 2.8:
        dominant_themes.append(f"Área a integrar: {sections[weakest_sid]}")
    dominant_themes = dominant_themes[:3]

    reflection_axes: list[str] = []
    # Always provide 3 neutral prompts (axes)
    reflection_axes.append('¿Qué emoción o sensación aparece con más frecuencia y qué necesita ser escuchado?')
    reflection_axes.append('¿Qué patrón se repite y qué aprendizaje podrías estar intentando integrar hoy?')
    if open_reflection:
        reflection_axes.append('Vuelve a tu reflexión escrita: subraya 2 frases y observa qué tema central se repite.')
    else:
        reflection_axes.append('Si lo deseas, escribe una breve escena/sueño recurrente y observa qué símbolo destaca.')
    reflection_axes = reflection_axes[:3]

    top_sid, top_avg = ranked[0]
    summary_lines = []
    summary_lines.append(
        'Resultado simbólico y orientativo (no diagnóstico): este cuestionario no afirma hechos históricos literales.'
    )
    summary_lines.append(
        f"Resonancia simbólica global: {resonance_label} (promedio {global_avg:.2f} en escala 1–5)."
    )
    summary_lines.append(
        f"Tema más destacado: {sections[top_sid]} (promedio {top_avg:.2f})."
    )
    if weakest_avg <= 2.8:
        summary_lines.append(
            f"Área que podría invitar a integración: {sections[weakest_sid]} (promedio {weakest_avg:.2f})."
        )
    summary_lines.append(
        'Sugerencia: usa estos hallazgos como mapa de conversación y reflexión; si estás trabajando con terapeuta, compártelos para contextualizarlos.'
    )
    summary_text = '\n'.join(summary_lines)

    return {
        'symbolic_resonance_level': resonance,
        'dominant_themes': dominant_themes,
        'reflection_axes': reflection_axes,
        'summary_text': summary_text,
    }


def compute_stai(input_data: dict) -> dict:
    """Compute a simplified STAI result (state and trait)"""
    responses = input_data.get('responses', {}) or {}
    # Assume keys 1..20 state, 21..40 trait with values 1..4
    state_total = 0
    trait_total = 0
    for k, v in responses.items():
        try:
            qi = int(k)
            vi = int(v)
        except Exception:
            continue
        if 1 <= qi <= 20:
            # approximate reverse scoring is not applied here
            state_total += vi
        elif 21 <= qi <= 40:
            trait_total += vi

    result = {
        'codigo_evaluacion': _generate_code('STAI'),
        'fecha_evaluacion': input_data.get('fecha') or datetime.utcnow().strftime('%Y-%m-%d'),
        'datos_cliente': {
            'nombre': input_data.get('nombre'),
            'edad': int(input_data.get('edad')) if input_data.get('edad') else None,
            'terapeuta': input_data.get('terapeuta')
        },
        'respuestas': responses,
        'puntuaciones': {
            'estado': state_total,
            'rasgo': trait_total,
            'maximo': 80
        },
        'interpretacion': {
            'estado': 'Ver niveles',
            'rasgo': 'Ver niveles'
        },
        'validez': {'completo': len(responses) == 40, 'tiempo_ok': True},
        'metricas': {'alpha': '0.86-0.95'},
        'recomendaciones': []
    }
    if max(state_total, trait_total) >= 45:
        result['recomendaciones'].append('Evaluar por clínica de ansiedad')
    elif max(state_total, trait_total) >= 39:
        result['recomendaciones'].append('Monitoreo y Psicoeducación')
    return result


def compute_stress_screening(input_data: dict) -> dict:
    """
    Stress — Carga y regulación (SCREENING ORIENTATIVO, no diagnóstico).

    Contract (do not change):
    {
      "index": 0-100,
      "level": "bajo | medio | alto",
      "map": { "strengths": [], "focus_areas": [] },
      "flags": { "high_stress_load": false, "low_regulation": false, "recommend_followup": false },
      "summary_text": "",
      "suggested_steps": [],
      "disclaimer": "...",
      "raw_inputs": {}
    }
    """
    responses = (input_data.get('responses', {}) or {})

    def _to_int(v):
        try:
            iv = int(v)
        except Exception:
            iv = 0
        return max(0, min(3, iv))

    # Dimension ids expected: stress-a1..a6, stress-b1..b6, stress-c1..c6
    a_keys = [f"stress-a{i}" for i in range(1, 7)]
    b_keys = [f"stress-b{i}" for i in range(1, 7)]
    c_keys = [f"stress-c{i}" for i in range(1, 7)]

    a_vals = [_to_int(responses.get(k)) for k in a_keys]
    b_vals = [_to_int(responses.get(k)) for k in b_keys]
    c_vals_raw = [_to_int(responses.get(k)) for k in c_keys]
    c_vals = [3 - v for v in c_vals_raw]  # invert regulation/resources

    score_a = sum(a_vals)
    score_b = sum(b_vals)
    score_c = sum(c_vals)
    total_score = score_a + score_b + score_c  # 0..54
    index = int(round((total_score / 54) * 100)) if 54 else 0

    if index <= 39:
        level = 'bajo'
    elif index <= 69:
        level = 'medio'
    else:
        level = 'alto'

    dim_a = int(round((score_a / 18) * 100)) if 18 else 0
    dim_b = int(round((score_b / 18) * 100)) if 18 else 0
    dim_c = int(round((score_c / 18) * 100)) if 18 else 0

    flags = {
        "high_stress_load": index >= 70,
        "low_regulation": dim_c < 50,
        "recommend_followup": (index >= 70) or (dim_c < 40),
    }

    strengths = []
    if dim_c >= 70:
        strengths = ["Regulación", "Apoyo", "Recuperación"]

    focus_areas = []
    if dim_a >= 70:
        focus_areas.append("Carga")
    if dim_b >= 70:
        focus_areas.append("Reactividad")
    if dim_c < 50:
        focus_areas.extend(["Límites", "Recuperación"])
    # If any condition is met but list ended empty (edge-case), include a generic focus
    if (dim_a >= 70 or dim_b >= 70 or dim_c < 50) and not focus_areas:
        focus_areas = ["Carga"]

    summary_text = (
        "El resultado muestra una carga de estrés relevante en este momento. "
        "Esta lectura no es diagnóstica, pero puede ayudar a identificar áreas donde la presión es elevada "
        "y los recursos de regulación podrían necesitar refuerzo."
    )

    suggested_steps = [
        "Identificar una fuente principal de presión y revisar límites.",
        "Introducir pausas breves de regulación durante el día.",
        "Priorizar descanso real (no solo desconexión digital).",
        "Activar apoyo (hablar con alguien de confianza).",
        "Considerar acompañamiento profesional si el malestar persiste.",
    ]

    disclaimer = (
        "Este resultado es orientativo y no constituye un diagnóstico. "
        "Si el estrés es intenso, persistente o interfiere con tu funcionamiento, "
        "considera consultar con un profesional."
    )

    raw_inputs = {
        "responses": responses,
        "dimensions": {
            "A": {"score": score_a, "percent_0_100": dim_a},
            "B": {"score": score_b, "percent_0_100": dim_b},
            "C": {"score": score_c, "percent_0_100": dim_c, "inverted": True},
        },
        "total_score_0_54": total_score,
    }

    return {
        "index": max(0, min(100, index)),
        "level": level,
        "map": {
            "strengths": strengths,
            "focus_areas": focus_areas,
        },
        "flags": flags,
        "summary_text": summary_text,
        "suggested_steps": suggested_steps,
        "disclaimer": disclaimer,
        "raw_inputs": raw_inputs,
    }


def compute_mcmi4(input_data: dict) -> dict:
    """Improved placeholder compute function for MCMI-IV.
    This still does NOT implement licensed scoring; instead, it provides an
    approximate scale breakdown by dividing the 195-item instrument into
    several example scales that help give a richer report structure.
    Replace with official mapping when license & scoring tables are available.
    """
    responses = input_data.get('responses', {}) or {}
    # convert keys to ints for mapping
    int_responses = {int(k): int(v) for k, v in responses.items() if str(k).isdigit()}
    raw_score = sum(1 for v in int_responses.values() if v == 1)

    # Divide the 195 items into example scales across the instrument
    # These ranges are illustrative placeholders only and must be replaced
    # with licensed items-to-scale mappings for production use.
    scale_map = {
        'schizoid': set(range(1, 13)),
        'avoidant': set(range(13, 25)),
        'depressive': set(range(25, 37)),
        'dependent': set(range(37, 49)),
        'histrionic': set(range(49, 61)),
        'narcissistic': set(range(61, 73)),
        'antisocial': set(range(73, 85)),
        'compulsive': set(range(85, 97)),
        'schizotypal': set(range(97, 109)),
        'borderline': set(range(109, 121)),
        'paranoid': set(range(121, 133)),
        'sadistic': set(range(133, 145)),
        'masochistic': set(range(145, 157)),
        'somatoform': set(range(157, 169)),
        'anxious': set(range(169, 181)),
        'other': set(range(181, 196))
    }
    scales = {}
    for scale, items in scale_map.items():
        sc = sum(1 for k, v in int_responses.items() if k in items and v == 1)
        scales[scale] = {
            'raw': sc,
            'n_items': len(items),
            'BR': round((sc / len(items)) * 100) if len(items) else 0,
            'level': ('elevado' if sc / (len(items) or 1) >= 0.66 else 'moderado' if sc / (len(items) or 1) >= 0.33 else 'bajo')
        }
    # profile summary highlighting top scales
    top_scales = sorted(scales.items(), key=lambda x: x[1]['raw'], reverse=True)[:4]
    result = {
        'codigo_evaluacion': _generate_code('MCMI'),
        'fecha_evaluacion': input_data.get('fecha') or datetime.utcnow().strftime('%Y-%m-%d'),
        'datos_cliente': {
            'nombre': input_data.get('nombre'),
            'edad': int(input_data.get('edad')) if input_data.get('edad') else None,
            'terapeuta': input_data.get('terapeuta')
        },
        'respuestas': responses,
        'puntuaciones': {'raw': raw_score, 'scales': scales, 'top_scales': [ { 'scale': s, 'raw': d['raw'], 'BR': d['BR'] } for s, d in top_scales ] },
        'interpretacion': {'desc': 'Patrón de personalidad (ejemplo)'},
        'validez': {'completo': len(responses) == 195, 'tiempo_ok': True},
        'recomendaciones': []
    }
    if raw_score > 100:
        result['recomendaciones'].append('Evaluación detallada de personalidad')
    return result


def compute_scid5(input_data: dict) -> dict:
    """Improved SCID-5-RV placeholder detection for common disorders.
    This function detects a small set of common diagnostic clusters using
    prefixed item keys (e.g., 'B1'..'B9' for MDE symptoms, 'G1'..'G6' for GAD,
    'PT1'..'PT8' for PTSD). This is illustrative and not equivalent to a
    clinical SCID-5 interview. Replace with validated logic if licensed.
    """
    responses = input_data.get('responses', {}) or {}
    diagnoses = {}

    # Utility to check prefix-based symptoms
    def symptoms_with_prefix(prefix):
        keys = [k for k in responses.keys() if str(k).upper().startswith(prefix.upper())]
        vals = []
        for k in keys:
            try:
                vals.append(int(responses[k]))
            except Exception:
                vals.append(0)
        return keys, vals

    # Major Depressive Episode (B1..B9)
    b_keys, b_vals = symptoms_with_prefix('B')
    mde_positive = sum(1 for v in b_vals if v >= 3)
    core_mood = any(k.upper() in ['B1', 'B2'] and int(responses.get(k) or 0) >= 3 for k in b_keys)
    diagnoses['MDE'] = (mde_positive >= 5 and core_mood)

    # Generalized Anxiety Disorder (G1..G6) - simplified threshold 3 of 6
    g_keys, g_vals = symptoms_with_prefix('G')
    gad_positive = sum(1 for v in g_vals if v >= 3)
    diagnoses['GAD'] = (gad_positive >= 3)

    # PTSD (PT1..PT8) - simplified threshold 4 of 8
    pt_keys, pt_vals = symptoms_with_prefix('PT')
    pt_positive = sum(1 for v in pt_vals if v >= 3)
    diagnoses['PTSD'] = (pt_positive >= 4)
    # Build a result with counts & symptom lists
    result = {
        'codigo_evaluacion': _generate_code('SCID'),
        'fecha_evaluacion': input_data.get('fecha') or datetime.utcnow().strftime('%Y-%m-%d'),
        'datos_cliente': {
            'nombre': input_data.get('nombre'),
            'edad': int(input_data.get('edad')) if input_data.get('edad') else None,
            'terapeuta': input_data.get('terapeuta')
        },
        'respuestas': responses,
        'diagnosticos': diagnoses,
        'validez': {'completo': True, 'tiempo_ok': True},
        'recomendaciones': []
    }
    if diagnoses['MDE']:
        result['recomendaciones'].append('Cumple criterios para episodio depresivo mayor, referir a tratamiento')
    if diagnoses.get('GAD'):
        result['recomendaciones'].append('Síntomas de ansiedad generalizada - evaluar atención psicológica')
    if diagnoses.get('PTSD'):
        result['recomendaciones'].append('Criterios sugestivos de PTSD - derivar a especialista')
    return result

# -----------------------------------------------------------------------------
# SYMBOLIC TRANSITION ENGINE — MISSING TESTS IMPLEMENTATION
# -----------------------------------------------------------------------------

def compute_life_purpose(input_data: dict) -> dict:
    """Atzilut - Propósito y Sentido Vital."""
    responses = input_data.get('responses', {}) or {}
    # Simple logic: average of responses (assuming 1-5 scale)
    vals = [int(v) for v in responses.values() if str(v).isdigit()]
    avg = sum(vals) / len(vals) if vals else 3
    
    clarity = "absent" if avg < 2 else ("diffused" if avg < 4 else "clear")
    suggestion = "beria" if clarity != "clear" else "atzilut"

    return {
        'processed': True,
        'structured_data': {
            'purpose_clarity': clarity,
            'transition_suggestion': suggestion
        },
        'interpretation': f"Claridad de propósito: {clarity}.",
        'timestamp': str(datetime.now())
    }

def compute_cognitive_map(input_data: dict) -> dict:
    """Beriá - Mapa Cognitivo."""
    responses = input_data.get('responses', {}) or {}
    vals = [int(v) for v in responses.values() if str(v).isdigit()]
    avg = sum(vals) / len(vals) if vals else 3
    
    style = "chaotic" if avg < 2 else ("rigid" if avg < 3.5 else "adaptive")
    suggestion = "yetzirah" if style != "adaptive" else "atzilut"

    return {
        'processed': True,
        'structured_data': {
            'cognitive_style': style,
            'transition_suggestion': suggestion
        },
        'interpretation': f"Estilo cognitivo: {style}.",
        'timestamp': str(datetime.now())
    }

def compute_belief_system(input_data: dict) -> dict:
    """Beriá - Sistema de Creencias."""
    responses = input_data.get('responses', {}) or {}
    vals = [int(v) for v in responses.values() if str(v).isdigit()]
    avg = sum(vals) / len(vals) if vals else 3
    
    state = "limiting" if avg < 2 else ("mixed" if avg < 4 else "integrated")
    suggestion = "yetzirah" if state == "limiting" else "assiah"

    return {
        'processed': True,
        'structured_data': {
            'belief_state': state,
            'transition_suggestion': suggestion
        },
        'interpretation': f"Estado de creencias: {state}.",
        'timestamp': str(datetime.now())
    }

def compute_emotional_literacy(input_data: dict) -> dict:
    """Ietzirá - Alfabetización Emocional."""
    responses = input_data.get('responses', {}) or {}
    vals = [int(v) for v in responses.values() if str(v).isdigit()]
    avg = sum(vals) / len(vals) if vals else 3
    
    awareness = "low" if avg < 2 else ("medium" if avg < 4 else "high")
    suggestion = "assiah" if awareness != "high" else "beria"

    return {
        'processed': True,
        'structured_data': {
            'emotional_awareness': awareness,
            'transition_suggestion': suggestion
        },
        'interpretation': f"Conciencia emocional: {awareness}.",
        'timestamp': str(datetime.now())
    }

def compute_attachment_style(input_data: dict) -> dict:
    """Ietzirá - Vínculo y Apego."""
    responses = input_data.get('responses', {}) or {}
    # Placeholder for more complex attachment logic
    vals = [int(v) for v in responses.values() if str(v).isdigit()]
    avg = sum(vals) / len(vals) if vals else 3
    
    style = "avoidant" if avg < 2 else ("anxious" if avg < 3.5 else "secure")
    suggestion = "assiah" if style != "secure" else "beria"

    return {
        'processed': True,
        'structured_data': {
            'attachment_style': style,
            'transition_suggestion': suggestion
        },
        'interpretation': f"Estilo de apego: {style}.",
        'timestamp': str(datetime.now())
    }

def compute_daily_rhythm(input_data: dict) -> dict:
    """Asiá - Hábitos y Ritmo Vital."""
    responses = input_data.get('responses', {}) or {}
    vals = [int(v) for v in responses.values() if str(v).isdigit()]
    avg = sum(vals) / len(vals) if vals else 3
    
    rhythm = "disrupted" if avg < 2 else ("irregular" if avg < 4 else "stable")
    suggestion = "yetzirah"

    return {
        'processed': True,
        'structured_data': {
            'daily_rhythm': rhythm,
            'transition_suggestion': suggestion
        },
        'interpretation': f"Ritmo diario: {rhythm}.",
        'timestamp': str(datetime.now())
    }

def compute_somatic_awareness(input_data: dict) -> dict:
    """Asiá - Registro Somático."""
    responses = input_data.get('responses', {}) or {}
    vals = [int(v) for v in responses.values() if str(v).isdigit()]
    avg = sum(vals) / len(vals) if vals else 3
    
    awareness = "low" if avg < 2 else ("medium" if avg < 4 else "high")
    suggestion = "yetzirah"

    return {
        'processed': True,
        'structured_data': {
            'body_awareness': awareness,
            'transition_suggestion': suggestion
        },
        'interpretation': f"Conciencia corporal: {awareness}.",
        'timestamp': str(datetime.now())
    }


def compute_dudit_spirit(input_data: dict) -> dict:
    """
    Divine Unity Drug Introspection (DUDIT-Spirit)
    Mundo: Ietzirá → Asiá
    
    Evaluates relationship with substances, regulation, awareness, and compulsion.
    Based on DUDIT framework but with symbolic-clinical perspective.
    """
    responses = input_data.get('responses', {}) or {}
    sex_raw = str(input_data.get('sex', 'hombre')).lower().strip()
    sex = 'mujer' if sex_raw in {'mujer', 'f', 'female', 'w', 'woman'} else 'hombre'

    def _as_int(val) -> int:
        try:
            return int(val)
        except Exception:
            return 0

    def _clamp_0_4(v: int) -> int:
        return max(0, min(4, v))

    def _snap_0_2_4(v: int) -> int:
        """Q10/Q11 only accept 0, 2, 4."""
        if v <= 0:
            return 0
        if v <= 2:
            return 2
        return 4

    # Frequency/quantity (q1-q3)
    freq_keys = ['q1', 'q2', 'q3']
    freq_vals = [_clamp_0_4(_as_int(responses.get(k, 0))) for k in freq_keys]
    freq_score = sum(freq_vals)

    # Problems/consequences (q4-q6)
    impact_keys = ['q4', 'q5', 'q6']
    impact_vals = [_clamp_0_4(_as_int(responses.get(k, 0))) for k in impact_keys]
    impact_score = sum(impact_vals)

    # Compulsion/control (q7-q9)
    control_keys = ['q7', 'q8', 'q9']
    control_vals = [_clamp_0_4(_as_int(responses.get(k, 0))) for k in control_keys]
    control_score = sum(control_vals)

    # Harm/concern items (q10-q11): scale 0/2/4 only
    body_keys = ['q10', 'q11']
    body_vals = [_snap_0_2_4(_as_int(responses.get(k, 0))) for k in body_keys]
    body_score = sum(body_vals)

    # Total score (max 44)
    score_total = freq_score + impact_score + control_score + body_score

    # Sex-dependent problematic threshold (DUDIT standard)
    problematic_threshold = 2 if sex == 'mujer' else 6

    if score_total >= 25:
        risk_level = "high"
    elif score_total >= problematic_threshold:
        risk_level = "medium"
    else:
        risk_level = "low"

    # Usage pattern
    if control_score >= 8:
        usage_pattern = "compulsive"
    elif freq_score >= 8:
        usage_pattern = "habitual"
    else:
        usage_pattern = "exploratory"

    # Harm awareness (q10-q11 max = 8)
    body_avg = body_score / 8.0
    if body_avg >= 0.66:
        body_awareness_level = "high"
    elif body_avg >= 0.33:
        body_awareness_level = "medium"
    else:
        body_awareness_level = "low"

    transition_suggestion = None
    if body_awareness_level == "low" or impact_score >= 8:
        transition_suggestion = "assiah"

    summary_map = {
        "low": "Relación de bajo riesgo con sustancias. Mantén atención a patrones y regulación emocional.",
        "medium": "Relación moderada que merece atención. Observa si hay evasión emocional o patrones automáticos.",
        "high": "Patrón de alto riesgo detectado. Se sugiere apoyo profesional especializado y exploración de raíces emocionales.",
    }

    structured_data = {
        'score_total': score_total,
        'risk_level': risk_level,
        'usage_pattern': usage_pattern,
        'body_awareness_level': body_awareness_level,
        'transition_suggestion': transition_suggestion,
        'sex_used': sex,
        'problematic_threshold': problematic_threshold,
        'referral_recommended': risk_level in ["medium", "high"],
    }
    
    return {
        'processed': True,
        'structured_data': structured_data,
        'raw_answers': responses,
        'summary_text': summary_map.get(risk_level, ''),
        'timestamp': str(datetime.now()),
    }


def compute_mcmi4_mystic(input_data: dict) -> dict:
    """
    Multiaxial Cosmic Matrix (MCMI-4-Mystic)
    Mundo: Atzilut → Beriá
    
    Symbolic-structural assessment of self patterns, coherence, and fragmentation.
    NOT clinical MCMI-IV; this is a symbolic archetypal profile.
    """
    responses = input_data.get('responses', {}) or {}
    
    # Symbolic axes (archetypal dimensions, not clinical scales)
    axes = {
        'unity': ['q1', 'q2', 'q3', 'q4', 'q5'],           # Coherence, integration
        'shadow': ['q6', 'q7', 'q8', 'q9', 'q10'],         # Unintegrated aspects
        'flow': ['q11', 'q12', 'q13', 'q14', 'q15'],       # Adaptive flexibility
        'structure': ['q16', 'q17', 'q18', 'q19', 'q20'],  # Order, boundaries
    }
    
    def _as_int(val) -> int:
        try:
            return int(val)
        except Exception:
            return 0
    
    def _clamp_0_4(v: int) -> int:
        return max(0, min(4, v))
    
    axis_scores = {}
    all_vals = []
    for axis_name, keys in axes.items():
        vals = [_clamp_0_4(_as_int(responses.get(k, 0))) for k in keys]
        all_vals.extend(vals)
        avg = sum(vals) / (len(vals) or 1)
        axis_scores[axis_name] = round(avg, 2)
    
    # Determine dominant axis
    dominant_axis = max(axis_scores.items(), key=lambda x: x[1])[0] if axis_scores else 'unknown'
    
    # Coherence level: unity vs shadow balance
    unity_score = axis_scores.get('unity', 0)
    shadow_score = axis_scores.get('shadow', 0)
    coherence_diff = unity_score - shadow_score
    
    if coherence_diff >= 1.5:
        coherence_level = "integrated"
    elif coherence_diff >= -1.0:
        coherence_level = "mixed"
    else:
        coherence_level = "fragmented"
    
    # Internal conflict index (0-100)
    # High shadow + low flow = higher conflict
    flow_score = axis_scores.get('flow', 0)
    conflict_raw = (shadow_score / 4.0) * 50 + ((4 - flow_score) / 4.0) * 50
    internal_conflict_index = int(round(conflict_raw))
    
    # Symbolic profile (top 2 axes)
    ranked_axes = sorted(axis_scores.items(), key=lambda x: x[1], reverse=True)
    symbolic_profile = [name.capitalize() for name, score in ranked_axes[:2]]
    
    # Transition suggestion (Atzilut → Beriá or Ietzirá)
    transition_suggestion = None
    if coherence_level == "fragmented":
        transition_suggestion = "beriah"  # Need cognitive clarity
    elif internal_conflict_index >= 60 and flow_score < 2.0:
        transition_suggestion = "yetzirah"  # Emotional processing needed
    
    # Summary
    summary_map = {
        "integrated": "Estructura interna coherente con buen nivel de integración simbólica.",
        "mixed": "Estructura en proceso de integración. Hay aspectos claros y otros en desarrollo.",
        "fragmented": "Estructura fragmentada que sugiere explorar narrativa y sentido unificador.",
    }
    
    structured_data = {
        'dominant_axis': dominant_axis,
        'coherence_level': coherence_level,
        'internal_conflict_index': internal_conflict_index,
        'symbolic_profile': symbolic_profile,
        'transition_suggestion': transition_suggestion,
    }
    
    return {
        'processed': True,
        'structured_data': structured_data,
        'raw_answers': responses,
        'summary_text': summary_map.get(coherence_level, ''),
        'timestamp': str(datetime.now()),
    }


def compute_nutrition_relationship(input_data: dict) -> dict:
    """
    Alimentación — Relación y hábitos (Nutrition Relationship)
    Mundo: Asiá → Ietzirá
    
    Evaluates eating awareness, emotional link, control patterns, and body trust.
    This is a COMPLETE REWRITE with real scoring logic.
    """
    responses = input_data.get('responses', {}) or {}
    
    # Dimensions
    dimensions = {
        'awareness': ['n1', 'n2', 'n3', 'n4'],           # Hunger/satiety signals
        'emotional_link': ['n5', 'n6', 'n7', 'n8'],      # Emotion-eating connection
        'control': ['n9', 'n10', 'n11', 'n12'],          # Rigidity, rules, chaos
        'body_trust': ['n13', 'n14', 'n15', 'n16'],      # Trust in body signals
    }
    
    # Items that need reversing (higher = worse)
    reverse_items = {'n4', 'n5', 'n7', 'n10', 'n12', 'n16'}
    
    def _as_int(val) -> int:
        try:
            return int(val)
        except Exception:
            return 0
    
    def _normalize_value(qid: str) -> int:
        v = _as_int(responses.get(qid, 0))
        v = max(0, min(4, v))
        if qid in reverse_items:
            return 4 - v
        return v
    
    dim_scores = {}
    all_vals = []
    for dim, keys in dimensions.items():
        vals = [_normalize_value(qid) for qid in keys]
        all_vals.extend(vals)
        avg = sum(vals) / (len(vals) or 1)
        dim_scores[dim] = round(avg, 2)
    
    # Overall average
    overall_avg = sum(all_vals) / (len(all_vals) or 1)
    
    # Eating awareness level
    awareness_avg = dim_scores.get('awareness', 0)
    if awareness_avg >= 3.0:
        eating_awareness = "high"
    elif awareness_avg >= 1.5:
        eating_awareness = "medium"
    else:
        eating_awareness = "low"
    
    # Emotional link strength
    emotional_avg = dim_scores.get('emotional_link', 0)
    if emotional_avg >= 3.0:
        emotional_link = "strong"
    elif emotional_avg >= 1.5:
        emotional_link = "moderate"
    else:
        emotional_link = "absent"
    
    # Control pattern
    control_avg = dim_scores.get('control', 0)
    if control_avg <= 1.5:
        control_pattern = "rigid"
    elif control_avg >= 3.0:
        control_pattern = "flexible"
    else:
        control_pattern = "chaotic"
    
    # Body trust level (0-100)
    body_trust_avg = dim_scores.get('body_trust', 0)
    body_trust_level = int(round((body_trust_avg / 4.0) * 100))
    
    # Transition suggestion (Asiá → Ietzirá)
    # Suggest Ietzirá if emotional link is strong (needs emotional processing)
    transition_suggestion = None
    if emotional_link == "strong":
        transition_suggestion = "yetzirah"
    
    # Summary
    if overall_avg >= 3.0:
        summary = "Relación con la alimentación equilibrada y consciente. Hay confianza en las señales del cuerpo."
    elif overall_avg >= 2.0:
        summary = "Relación moderada con áreas de mejora. Observa el vínculo emocional y la rigidez de patrones."
    else:
        summary = "Relación compleja con la alimentación. Se sugiere explorar el componente emocional y la confianza corporal."
    
    structured_data = {
        'eating_awareness': eating_awareness,
        'emotional_link': emotional_link,
        'control_pattern': control_pattern,
        'body_trust_level': body_trust_level,
        'transition_suggestion': transition_suggestion,
    }
    
    return {
        'processed': True,
        'structured_data': structured_data,
        'raw_answers': responses,
        'summary_text': summary,
        'timestamp': str(datetime.now()),
    }


def compute_ybocs_soul(input_data: dict) -> dict:
    """
    Yetziratic Balance Obsessive-Compulsive Sanctuary (Y-BOCS-Soul)
    Mundo: Ietzirá (Formativo)
    
    Conceptualiza pensamientos repetitivos como ecos kármicos que interrumpen 
    los mundos cabalísticos. Balance entre Gevurah (restricción) y Chesed (expansión).
    """
    responses = input_data.get('responses', {}) or {}
    
    def _as_int(val) -> int:
        try:
            return int(val)
        except Exception:
            return 0
    
    def _clamp_0_4(v: int) -> int:
        return max(0, min(4, v))
    
    # Y-BOCS structure: 5 obsessions questions + 5 compulsions questions
    # Scale 0-4 for most items
    
    obsession_keys = ['q1', 'q2', 'q3', 'q4', 'q5']  # Time, interference, distress, resistance, control
    compulsion_keys = ['q6', 'q7', 'q8', 'q9', 'q10']  # Time, interference, anxiety, resistance, control
    
    obsession_vals = [_clamp_0_4(_as_int(responses.get(k, 0))) for k in obsession_keys]
    compulsion_vals = [_clamp_0_4(_as_int(responses.get(k, 0))) for k in compulsion_keys]
    
    obsession_score = sum(obsession_vals)  # 0-20
    compulsion_score = sum(compulsion_vals)  # 0-20
    total_score = obsession_score + compulsion_score  # 0-40
    
    # Severity determination (Y-BOCS standard thresholds)
    if total_score <= 7:
        severity = "subclinical"
        severity_label = "Subclínico"
    elif total_score <= 15:
        severity = "mild"
        severity_label = "Leve"
    elif total_score <= 23:
        severity = "moderate"
        severity_label = "Moderado"
    elif total_score <= 31:
        severity = "severe"
        severity_label = "Severo"
    else:
        severity = "extreme"
        severity_label = "Extremo"
    
    # Karmic echo balance: obsessions vs compulsions
    if obsession_score > compulsion_score + 5:
        pattern = "thought_dominated"  # Ecos mentales (Yetzirah superior)
    elif compulsion_score > obsession_score + 5:
        pattern = "ritual_dominated"  # Rituales físicos (Yetzirah → Asiá)
    else:
        pattern = "balanced_burden"  # Carga equilibrada
    
    # Gevurah-Chesed balance (control vs expansion)
    # q4 and q9 are resistance items; q5 and q10 are control items
    resistance = _clamp_0_4(_as_int(responses.get('q4', 0))) + _clamp_0_4(_as_int(responses.get('q9', 0)))
    control = _clamp_0_4(_as_int(responses.get('q5', 0))) + _clamp_0_4(_as_int(responses.get('q10', 0)))
    
    # Low resistance + low control = overwhelmed (need Gevurah)
    if resistance <= 2 and control <= 2:
        sephirotic_balance = "gevurah_needed"
    # High resistance + moderate control = struggling but active (Tiferet path)
    elif resistance >= 5:
        sephirotic_balance = "tiferet_active"
    else:
        sephirotic_balance = "seeking_chesed"
    
    # Transition suggestion
    transition_suggestion = None
    if severity in ["severe", "extreme"]:
        transition_suggestion = "beriah"  # Need cognitive restructuring
    elif pattern == "ritual_dominated":
        transition_suggestion = "assiah"  # Somatic/physical work needed
    
    # Summary
    summary_map = {
        "subclinical": "Ecos kármicos mínimos. El flujo entre los mundos está mayormente despejado.",
        "mild": "Bloqueos leves en Yetzirah. La práctica consistente puede restaurar el equilibrio.",
        "moderate": "Interferencia moderada con el flujo divino. Se sugiere trabajo terapéutico específico.",
        "severe": "Ecos kármicos significativos que bloquean múltiples Sephirot. Intervención recomendada.",
        "extreme": "Bloqueo severo de Ein Sof. Se requiere acompañamiento especializado para tikkun (reparación).",
    }
    
    structured_data = {
        'total_score': total_score,
        'obsession_score': obsession_score,
        'compulsion_score': compulsion_score,
        'severity': severity,
        'severity_label': severity_label,
        'karmic_pattern': pattern,
        'sephirotic_balance': sephirotic_balance,
        'transition_suggestion': transition_suggestion,
        'referral_recommended': severity in ["severe", "extreme"],
    }
    
    return {
        'processed': True,
        'structured_data': structured_data,
        'raw_answers': responses,
        'summary_text': summary_map.get(severity, ''),
        'timestamp': str(datetime.now()),
    }


def compute_sha_harmony(input_data: dict) -> dict:
    """
    Sephirotic Harmony Audit (SHA)
    Mundo: Ietzirá → Asiá
    
    Evalúa desequilibrios en fuerza vital relacionados con elíxires terrenales (alcohol).
    Basado en AUDIT pero con perspectiva de Netzach (victoria/persistencia) y Gevurah (disciplina).
    """
    responses = input_data.get('responses', {}) or {}
    
    def _as_int(val) -> int:
        try:
            return int(val)
        except Exception:
            return 0
    
    # AUDIT scoring (10 questions, varying scales)
    # Q1-Q8: 0-4 scale
    # Q9-Q10: 0,2,4 scale (special scoring for injury/concern)
    
    scores = []
    for i in range(1, 9):
        val = _as_int(responses.get(f'q{i}', 0))
        scores.append(max(0, min(4, val)))
    
    # Q9 and Q10 special scoring (0, 2, or 4)
    for i in range(9, 11):
        val = _as_int(responses.get(f'q{i}', 0))
        if val == 0:
            scores.append(0)
        elif val == 1:
            scores.append(2)  # "Yes, but not in last year"
        else:
            scores.append(4)  # "Yes, in last year"
    
    total_score = sum(scores)  # 0-40
    
    # AUDIT zones
    if total_score <= 7:
        risk_zone = "low"
        zone_label = "Zona Baja"
    elif total_score <= 15:
        risk_zone = "moderate"
        zone_label = "Zona Moderada"
    elif total_score <= 19:
        risk_zone = "high"
        zone_label = "Zona Alta"
    else:
        risk_zone = "severe"
        zone_label = "Zona Severa"
    
    # Consumption pattern (Q1-Q3: frequency, quantity, binge)
    consumption_score = sum(scores[0:3])
    if consumption_score >= 8:
        pattern = "high_frequency"
    elif consumption_score >= 4:
        pattern = "moderate_use"
    else:
        pattern = "low_use"
    
    # Gevurah assessment (Q4: loss of control)
    gevurah_control = scores[3]  # Q4
    if gevurah_control >= 3:
        gevurah_status = "weakened"
    elif gevurah_control >= 1:
        gevurah_status = "challenged"
    else:
        gevurah_status = "intact"
    
    # Netzach assessment (Q1: frequency of seeking altered states)
    netzach_seeking = scores[0]  # Q1
    if netzach_seeking >= 3:
        netzach_status = "excessive_refuge"
    elif netzach_seeking >= 1:
        netzach_status = "moderate_refuge"
    else:
        netzach_status = "occasional_refuge"
    
    # Malkhut impact (Q5: failure to meet obligations)
    malkhut_impact = scores[4]  # Q5
    manifestation_impaired = malkhut_impact >= 2
    
    # Transition suggestion
    transition_suggestion = None
    if risk_zone in ["high", "severe"]:
        transition_suggestion = "assiah"  # Need physical/behavioral intervention
    elif gevurah_status == "weakened":
        transition_suggestion = "beriah"  # Cognitive work on boundaries
    
    # Summary
    summary_map = {
        "low": "Tu relación con los elíxires terrenales mantiene armonía entre Netzach y Gevurah. Continúa con consciencia.",
        "moderate": "Se observan señales de desequilibrio. La moderación divina requiere atención antes de que se arraigue.",
        "high": "Desequilibrio significativo en el flujo de energía vital. Se recomienda explorar raíces emocionales y establecer límites sagrados.",
        "severe": "Disrupción severa de la armonía sefirótica. Se requiere acompañamiento especializado para restaurar equilibrio.",
    }
    
    structured_data = {
        'total_score': total_score,
        'risk_zone': risk_zone,
        'zone_label': zone_label,
        'consumption_pattern': pattern,
        'gevurah_status': gevurah_status,
        'netzach_status': netzach_status,
        'manifestation_impaired': manifestation_impaired,
        'transition_suggestion': transition_suggestion,
        'referral_recommended': risk_zone in ["high", "severe"],
    }
    
    return {
        'processed': True,
        'structured_data': structured_data,
        'raw_answers': responses,
        'summary_text': summary_map.get(risk_zone, ''),
        'timestamp': str(datetime.now()),
    }


def compute_eat26_spirit(input_data: dict) -> dict:
    """
    Eternal Abundance Threshold-26 (EAT-26-Spirit)
    Mundo: Asiá (Físico) → Ietzirá (Emocional)
    
    Actitudes hacia alimentación como reflejo de Malkhut (reino físico) 
    y conexión con Keter (voluntad divina). Reverencia al templo del cuerpo.
    """
    responses = input_data.get('responses', {}) or {}
    
    def _as_int(val) -> int:
        try:
            return int(val)
        except Exception:
            return 0
    
    def _clamp_0_5(v: int) -> int:
        return max(0, min(5, v))
    
    # EAT-26 scoring: Most items use 6-point scale (0-5)
    # Score 3 points for "Always", "Usually", "Often" (values 0,1,2)
    # Score 0 points for "Sometimes", "Rarely", "Never" (values 3,4,5)
    # Item 25 (reverse scored): opposite pattern
    
    total_score = 0
    reverse_item = 25  # Q25 is reverse scored
    
    for i in range(1, 27):
        val = _clamp_0_5(_as_int(responses.get(f'q{i}', 5)))  # Default to "Never" (5)
        
        if i == reverse_item:
            # Reverse scoring: 3 points for Sometimes/Rarely/Never
            if val >= 3:
                total_score += 3
        else:
            # Standard scoring: 3 points for Always/Usually/Often
            if val <= 2:
                total_score += 3
    
    # Risk threshold (EAT-26 standard)
    if total_score >= 20:
        risk_level = "high"
        risk_label = "Alto Riesgo"
    elif total_score >= 10:
        risk_level = "moderate"
        risk_label = "Riesgo Moderado"
    else:
        risk_level = "low"
        risk_label = "Bajo Riesgo"
    
    # Subscale analysis (simplified - actual EAT-26 has 3 validated subscales)
    # Dieting (restriction): items related to avoidance, control
    dieting_items = ['q1', 'q2', 'q3', 'q6', 'q7', 'q16', 'q17', 'q19', 'q22', 'q23']
    dieting_count = sum(1 for k in dieting_items if _clamp_0_5(_as_int(responses.get(k, 5))) <= 2)
    
    # Bulimia/food preoccupation: items related to eating episodes, guilt
    bulimia_items = ['q4', 'q10', 'q18', 'q21', 'q26']
    bulimia_count = sum(1 for k in bulimia_items if _clamp_0_5(_as_int(responses.get(k, 5))) <= 2)
    
    # Oral control: cutting food, eating slowly
    control_items = ['q5', 'q15', 'q20']
    control_count = sum(1 for k in control_items if _clamp_0_5(_as_int(responses.get(k, 5))) <= 2)
    
    # Dominant pattern
    if dieting_count >= 5:
        dominant_pattern = "restriction"  # Gevurah extreme
    elif bulimia_count >= 3:
        dominant_pattern = "preoccupation"  # Malkhut-Keter conflict
    elif control_count >= 2:
        dominant_pattern = "ritualization"  # Binah rigid
    else:
        dominant_pattern = "balanced"  # Chesed-Gevurah harmony
    
    # Malkhut-Keter connection assessment
    # Q1 (fear of overweight) + Q3 (food preoccupation) + Q18 (food controls life)
    malkhut_keter_disruption = (
        _clamp_0_5(_as_int(responses.get('q1', 5))) <= 2 or
        _clamp_0_5(_as_int(responses.get('q3', 5))) <= 2 or
        _clamp_0_5(_as_int(responses.get('q18', 5))) <= 2
    )
    
    # Body temple reverence (Q25 is about enjoying food - reverse scored)
    body_reverence = _clamp_0_5(_as_int(responses.get('q25', 5))) >= 3  # Enjoys food = reverence
    
    # Gevurah excess (items about control, restriction)
    gevurah_items_score = sum([
        _clamp_0_5(_as_int(responses.get('q7', 5))) <= 2,  # Avoid carbs
        _clamp_0_5(_as_int(responses.get('q16', 5))) <= 2,  # Avoid sugar
        _clamp_0_5(_as_int(responses.get('q19', 5))) <= 2,  # Demonstrate control
        _clamp_0_5(_as_int(responses.get('q22', 5))) <= 2,  # Diet commitment
    ])
    gevurah_excess = gevurah_items_score >= 3
    
    # Transition suggestion
    transition_suggestion = None
    if risk_level in ["moderate", "high"]:
        if dominant_pattern in ["preoccupation", "restriction"]:
            transition_suggestion = "yetzirah"  # Emotional processing needed
        else:
            transition_suggestion = "beriah"  # Cognitive restructuring
    
    # Summary
    summary_map = {
        "low": "Tu relación con el sustento sagrado muestra reverencia al templo corporal. Malkhut y Keter fluyen en armonía.",
        "moderate": "Se observan patrones que alejan del equilibrio divino. La exploración emocional puede restaurar la bendición en cada comida.",
        "high": "Desarmonía significativa en la relación con el cuerpo y la nutrición. Se recomienda acompañamiento especializado para honrar el templo sagrado.",
    }
    
    structured_data = {
        'total_score': total_score,
        'risk_level': risk_level,
        'risk_label': risk_label,
        'dominant_pattern': dominant_pattern,
        'malkhut_keter_disruption': malkhut_keter_disruption,
        'body_reverence': body_reverence,
        'gevurah_excess': gevurah_excess,
        'transition_suggestion': transition_suggestion,
        'referral_recommended': risk_level == "high",
    }
    
    return {
        'processed': True,
        'structured_data': structured_data,
        'raw_answers': responses,
        'summary_text': summary_map.get(risk_level, ''),
        'timestamp': str(datetime.now()),
    }


def compute_mcmi4_mystic_195(input_data: dict) -> dict:
    """
    Multiaxial Cosmic Matrix Inventory-4 (Mystic Edition) - Full 195-item version
    
    Comprehensive soul-map tool aligned with the four Kabbalistic worlds
    (Atzilut, Briah, Yetzirah, Assiah), interpreting patterns as imbalances
    in elemental forces and guiding toward enlightened personality synthesis.
    
    Args:
        input_data: Dict with 'responses' (question_id: 0-3) and 'questions_used'
        
    Returns:
        Complete results with world scores, sephirotic balance, and interpretations
    """
    from api.mcmi4_utils import compute_mcmi4_mystic_full
    from api.mcmi4_models import MCMI4MysticQuestionBank
    
    responses = input_data.get('responses', {}) or {}
    questions_used_ids = input_data.get('questions_used', [])
    
    # Validate we have enough questions
    if not questions_used_ids or len(questions_used_ids) < 180:
        return {
            'processed': False,
            'error': 'Incomplete test - requires 195 questions',
            'questions_received': len(questions_used_ids),
            'timestamp': str(datetime.now()),
        }
    
    # Resolve IDs to full question objects required by the scoring engine
    questions_db = MCMI4MysticQuestionBank.objects.filter(question_id__in=questions_used_ids)
    q_map = {q.question_id: q for q in questions_db}
    
    questions_used_full = []
    for q_id in questions_used_ids:
        q = q_map.get(q_id)
        if q:
            questions_used_full.append({
                'question_id': q.question_id,
                'world': q.world,
                'dimension_id': q.dimension_id,
                'sefirah': q.sefirah,
                'text': q.text_es,
                'reverse_scored': q.reverse_scored,
                'weight': q.weight,
            })
    
    # Handle response conversion (MCMI-4 UI uses binary True/False, scoring engine expects 0-3)
    # We map False -> 0, True -> 3 to maintain full scale weight
    normalized_responses = {}
    for q_id, val in responses.items():
        if isinstance(val, bool):
            normalized_responses[q_id] = 3 if val else 0
        else:
            try:
                normalized_responses[q_id] = int(val)
            except (ValueError, TypeError):
                normalized_responses[q_id] = 0
                
    # Delegate to the comprehensive scoring function
    return compute_mcmi4_mystic_full(normalized_responses, questions_used_full)
