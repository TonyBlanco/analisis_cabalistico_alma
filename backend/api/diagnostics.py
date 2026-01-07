from datetime import datetime
from typing import Dict
from ..tests.wellness.anxiety_state_trait.stai_bank import select_items_for_execution


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
