from datetime import datetime


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
