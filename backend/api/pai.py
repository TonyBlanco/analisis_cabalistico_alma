from datetime import datetime
import random
import string

PAI_QUESTIONS = {
    # BOR keys: BOR_1..BOR_6
    'BOR': ['BOR_1', 'BOR_2', 'BOR_3', 'BOR_4', 'BOR_5', 'BOR_6'],
    # SCZ keys: SCZ_1..SCZ_6
    'SCZ': ['SCZ_1', 'SCZ_2', 'SCZ_3', 'SCZ_4', 'SCZ_5', 'SCZ_6'],
    # Inconsistency: INF_1..INF_2
    'INF': ['INF_1', 'INF_2'],
    # Simulation: MAL_1..MAL_2
    'MAL': ['MAL_1', 'MAL_2']
}


def _generate_unique_code():
    ts = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    rand = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f'PAI-{ts}-{rand}'


def compute_pai(input_data: dict) -> dict:
    """Compute PAI scoring from input_data.

    input_data expected keys:
    - nombre, edad, fecha, terapeuta (optional)
    - responses: dict of question_id => int

    Returns: result_data dict with structure similar to frontend JSON
    """
    responses = input_data.get('responses', {}) if isinstance(input_data.get('responses', {}), dict) else {}

    # Sum the scores
    scores = {
        'BOR': 0,
        'SCZ': 0,
        'INF': 0,
        'MAL': 0
    }

    for prefix, keys in PAI_QUESTIONS.items():
        for q in keys:
            val = responses.get(q)
            try:
                val = int(val)
            except Exception:
                val = 0
            scores[prefix] += val

    # Compute maxima
    max_bor = len(PAI_QUESTIONS['BOR']) * 4  # 6 * 4 = 24
    max_scz = len(PAI_QUESTIONS['SCZ']) * 4  # 6 * 4

    interpretation = []
    if scores['BOR'] >= 12:
        interpretation.append('Indicadores significativos de rasgos límite de personalidad')
    elif scores['BOR'] >= 8:
        interpretation.append('Indicadores moderados de rasgos límite')

    if scores['SCZ'] >= 12:
        interpretation.append('Indicadores significativos de rasgos esquizotípicos')
    elif scores['SCZ'] >= 8:
        interpretation.append('Indicadores moderados de rasgos esquizotípicos')

    validity_alerts = []
    if scores['INF'] >= 6:
        validity_alerts.append('ALERTA: Patrón de respuestas inconsistente - revisar validez')

    if scores['MAL'] > 6:
        validity_alerts.append('ALERTA: Posible simulación o exageración de síntomas')

    result_code = _generate_unique_code()

    result_data = {
        'codigo_evaluacion': result_code,
        'fecha_evaluacion': input_data.get('fecha') or datetime.utcnow().strftime('%Y-%m-%d'),
        'datos_cliente': {
            'nombre': input_data.get('nombre'),
            'edad': int(input_data.get('edad')) if input_data.get('edad') else None,
            'terapeuta': input_data.get('terapeuta')
        },
        'respuestas': responses,
        'puntuaciones': {
            'trastorno_limite': {
                'puntuacion_bruta': scores['BOR'],
                'puntuacion_maxima': max_bor,
                'porcentaje': round((scores['BOR'] / max_bor) * 100) if max_bor else 0
            },
            'trastorno_esquizotipico': {
                'puntuacion_bruta': scores['SCZ'],
                'puntuacion_maxima': max_scz,
                'porcentaje': round((scores['SCZ'] / max_scz) * 100) if max_scz else 0
            }
        },
        'escalas_validez': {
            'inconsistencia': {
                'puntuacion': scores['INF'],
                'valido': scores['INF'] < 6
            },
            'simulacion': {
                'puntuacion': scores['MAL'],
                'posible_simulacion': scores['MAL'] > 6
            }
        },
        'interpretacion': interpretation,
    }

    # Add alerts
    if validity_alerts:
        result_data['validity_alerts'] = validity_alerts

    return result_data
