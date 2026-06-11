# -*- coding: utf-8 -*-
"""
Normalizador de output Kerykeion a contrato estable
Este módulo garantiza que el frontend reciba siempre la misma estructura
independientemente de cambios en Kerykeion
"""
from typing import Dict, List, Any, Optional
from datetime import datetime

from django.conf import settings

from .mapper_cabala import map_planet_to_sefirot, map_sign_to_paths
from .sefaria_refs import get_sefaria_refs_for_planet
from .ai_snippets import kerykeion_snippet_ai


def normalize_kerykeion_output(
    kerykeion_result: Dict[str, Any],
    input_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Normaliza el output de Kerykeion a un contrato estable
    
    Args:
        kerykeion_result: Resultado crudo de execute_kerykeion (modelo Pydantic dump)
        input_data: Datos de entrada usados para el cálculo
        
    Returns:
        Dict con estructura normalizada para el frontend
    """
    # Planetas en orden estándar
    PLANET_ORDER = ['sun', 'moon', 'mercury', 'venus', 'mars', 
                   'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
    
    # Mapeo de nombres de planetas de Kerykeion a nombres estándar
    PLANET_NAME_MAP = {
        'Sun': 'sun',
        'Moon': 'moon',
        'Mercury': 'mercury',
        'Venus': 'venus',
        'Mars': 'mars',
        'Jupiter': 'jupiter',
        'Saturn': 'saturn',
        'Uranus': 'uranus',
        'Neptune': 'neptune',
        'Pluto': 'pluto'
    }
    
    # Normalizar planetas
    planets_normalized = []
    kerykeion_planets = kerykeion_result.get('planets', {})
    
    for planet_key_order in PLANET_ORDER:
        # Buscar el planeta en el resultado de Kerykeion
        planet_data = None
        for kerykeion_name, standard_name in PLANET_NAME_MAP.items():
            if standard_name == planet_key_order:
                planet_data = kerykeion_planets.get(kerykeion_name)
                break
        
        if planet_data:
            # Calcular longitud eclíptica (signo * 30 + grado)
            # Accept both Spanish and English sign names from different engines
            sign_order_sp = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis']
            sign_order_en = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
            sign = planet_data.get('sign', '')
            degree_in_sign = planet_data.get('degree', 0)
            
            sign_index = None
            try:
                sign_index = sign_order_sp.index(sign)
            except ValueError:
                try:
                    sign_index = sign_order_en.index(sign)
                except ValueError:
                    sign_index = None
            
            if sign_index is not None:
                longitud_ecliptica = sign_index * 30 + degree_in_sign
            else:
                longitud_ecliptica = 0
            
            # Determinar casa (si está disponible)
            casa = _find_house_for_planet(longitud_ecliptica, kerykeion_result.get('houses', {}))
            
            planets_normalized.append({
                'nombre': planet_key_order,
                'signo': sign,
                'grados': round(degree_in_sign, 2),
                'longitud_ecliptica': round(longitud_ecliptica, 2),
                'casa': casa,
                'es_retrogrado': False  # Kerykeion actual no devuelve retrogradación en output simple
            })
        else:
            # Planeta no encontrado - incluir con valores por defecto
            planets_normalized.append({
                'nombre': planet_key_order,
                'signo': 'N/A',
                'grados': 0,
                'longitud_ecliptica': 0,
                'casa': None,
                'es_retrogrado': False
            })
    
    # Normalizar casas
    houses_normalized = []
    kerykeion_houses = kerykeion_result.get('houses', {})
    
    for house_num in range(1, 13):
        house_key = str(house_num)
        house_data = kerykeion_houses.get(house_key, {})
        
        if house_data:
            sign = house_data.get('sign', 'N/A')
            degree_in_sign = house_data.get('degree', 0)
            
            # Calcular longitud de cúspide
            sign_order_sp = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis']
            sign_order_en = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
            sign_index = None
            try:
                sign_index = sign_order_sp.index(sign)
            except ValueError:
                try:
                    sign_index = sign_order_en.index(sign)
                except ValueError:
                    sign_index = None
            
            if sign_index is not None:
                cuspide_longitud = sign_index * 30 + degree_in_sign
            else:
                cuspide_longitud = 0
            
            houses_normalized.append({
                'numero': house_num,
                'signo': sign,
                'cuspide_grados': round(degree_in_sign, 2),
                'cuspide_longitud': round(cuspide_longitud, 2)
            })
        else:
            houses_normalized.append({
                'numero': house_num,
                'signo': 'N/A',
                'cuspide_grados': 0,
                'cuspide_longitud': 0
            })
    
    # Normalizar aspectos
    aspects_normalized = []
    kerykeion_aspects = kerykeion_result.get('aspects', [])
    
    ASPECT_TYPE_MAP = {
        'conjunction': 'Conjunción',
        'opposition': 'Oposición',
        'trine': 'Trígono',
        'square': 'Cuadratura',
        'sextile': 'Sextil',
        'quincunx': 'Quincuncio',
        'semisextile': 'Semisextil'
    }
    
    for aspect in kerykeion_aspects:
        # Kerykeion returns 'from_planet' and 'to_planet' (fallback to 'from'/'to' for compatibility)
        from_planet = aspect.get('from_planet', aspect.get('from', ''))
        to_planet = aspect.get('to_planet', aspect.get('to', ''))
        aspect_type = aspect.get('type', '')
        orbe = aspect.get('orb', 0)
        
        # Mapear nombres de planetas a estándar
        from_planet_std = PLANET_NAME_MAP.get(from_planet, from_planet.lower())
        to_planet_std = PLANET_NAME_MAP.get(to_planet, to_planet.lower())
        aspect_type_es = ASPECT_TYPE_MAP.get(aspect_type.lower(), aspect_type)
        
        aspects_normalized.append({
            'planeta1': from_planet_std,
            'planeta2': to_planet_std,
            'tipo': aspect_type_es,
            'orbe': round(orbe, 2),
            'es_aplicativo': False  # Kerykeion no proporciona esta info en salida simple
        })
    
    # Metadatos
    zodiac_type = input_data.get('zodiac_type') or input_data.get('zodiac_system') or 'tropical'
    metadata = {
        'sistema_casas': input_data.get('house_system', 'placidus'),
        'zodiac_type': zodiac_type,
        'ayanamsha': input_data.get('ayanamsha'),
        'fuente': input_data.get('engine', 'kerykeion'),
        'calculated_at': datetime.utcnow().isoformat(),
        'version_engine': kerykeion_result.get('engine_version', '1.0.0'),
        'input_snapshot': {
            'fecha': input_data.get('birth_date'),
            'hora': input_data.get('birth_time'),
            'ciudad': input_data.get('location', {}).get('city'),
            'pais': input_data.get('location', {}).get('country'),
            'latitud': input_data.get('location', {}).get('lat'),
            'longitud': input_data.get('location', {}).get('lng'),
            'timezone': input_data.get('location', {}).get('timezone')
        }
    }

    # Cabalistic enrichment (technical, no narrative)
    planet_std_to_title = {
        'sun': 'Sun',
        'moon': 'Moon',
        'mercury': 'Mercury',
        'venus': 'Venus',
        'mars': 'Mars',
        'jupiter': 'Jupiter',
        'saturn': 'Saturn',
        'uranus': 'Uranus',
        'neptune': 'Neptune',
        'pluto': 'Pluto',
    }

    sign_en_to_es = {
        'Aries': 'Aries',
        'Taurus': 'Tauro',
        'Gemini': 'Géminis',
        'Cancer': 'Cáncer',
        'Leo': 'Leo',
        'Virgo': 'Virgo',
        'Libra': 'Libra',
        'Scorpio': 'Escorpio',
        'Sagittarius': 'Sagitario',
        'Capricorn': 'Capricornio',
        'Aquarius': 'Acuario',
        'Pisces': 'Piscis',
    }

    cabalistic_planets: Dict[str, Any] = {}
    letters_used: List[str] = []

    letter_to_hebrew_char = {
        'Alef': 'א',
        'Bet': 'ב',
        'Gimel': 'ג',
        'Guimel': 'ג',
        'Dalet': 'ד',
        'He': 'ה',
        'Vav': 'ו',
        'Zayin': 'ז',
        'Het': 'ח',
        'Chet': 'ח',
        'Tet': 'ט',
        'Yod': 'י',
        'Kaf': 'כ',
        'Kaf/Jaf': 'כ',
        'Lamed': 'ל',
        'Mem': 'מ',
        'Nun': 'נ',
        'Samekh': 'ס',
        'Sámej': 'ס',
        'Ayin': 'ע',
        'Pe': 'פ',
        'Pe/Fe': 'פ',
        'Tsadi': 'צ',
        'Qof': 'ק',
        'Resh': 'ר',
        'Shin': 'ש',
        'Tav': 'ת',
    }

    for p in planets_normalized:
        pname = p.get('nombre')
        if not pname:
            continue

        planet_title = planet_std_to_title.get(pname)
        if not planet_title:
            continue

        sef = map_planet_to_sefirot(planet_title) or {}

        sign_raw = p.get('signo') or ''
        sign_es = sign_en_to_es.get(sign_raw, sign_raw)
        paths = map_sign_to_paths(sign_es) or []
        path = paths[0] if paths else None

        # Attach hebrew char if we can
        if path and path.get('hebrew_letter') and not path.get('hebrew_char'):
            path_letter = path.get('hebrew_letter')
            if isinstance(path_letter, str):
                path['hebrew_char'] = letter_to_hebrew_char.get(path_letter)

        if path and path.get('hebrew_letter'):
            letters_used.append(path['hebrew_letter'])

        refs = get_sefaria_refs_for_planet(planet_title)
        # Optional in-session AI guidance. Never uses/stores Sefaria text; only metadata.
        enable_ai_snippets = bool(getattr(settings, 'KERYKEION_AI_SNIPPETS_ENABLED', False))
        if enable_ai_snippets and refs:
            # Keep cost/latency bounded: generate only for the first curated ref.
            first = refs[0]
            try:
                snippet = kerykeion_snippet_ai.generate_snippet(
                    planet=planet_title,
                    sign=sign_es,
                    house=(p.get('casa') if isinstance(p.get('casa'), int) else None),
                    sefira=(sef.get('sefira_name') if isinstance(sef, dict) else None),
                    letter_name=(path.get('hebrew_letter') if path else None),
                    letter_char=(path.get('hebrew_char') if path else None),
                    attribute=(path.get('path_name') if path else None),
                    ref_title=first.get('title', ''),
                    ref_url=first.get('url', ''),
                    therapist_id=input_data.get('therapist_id'),
                    patient_id=input_data.get('patient_id'),
                )
                if snippet:
                    first['snippet'] = snippet
            except Exception:
                # Best-effort only: do not break normalization if AI fails.
                pass

        cabalistic_planets[pname] = {
            'sefira': sef or None,
            'path': path,
            # New stable schema requested by frontend
            'planet_info': {
                'planet': planet_title,
                'sign_letter': (
                    f"{path.get('hebrew_letter')} ({path.get('hebrew_char')})"
                    if path and path.get('hebrew_letter') and path.get('hebrew_char')
                    else (path.get('hebrew_letter') if path and path.get('hebrew_letter') else None)
                ),
                'path_id': (f"Path_{path.get('path_number')}" if path and path.get('path_number') else None),
                'sefira': (sef.get('sefira_name') if isinstance(sef, dict) else None),
                'sefaria_refs': refs,
            },
        }

    cabalistic_data = {
        'planets': cabalistic_planets,
        'hebrew_letters': sorted(list(set([l for l in letters_used if l]))),
        # Placeholder for future deterministic tikun signals (kept stable)
        'tikun_signals': [],
    }
    
    # Construir resultado normalizado
    return {
        'planetas': planets_normalized,
        'casas': houses_normalized,
        'aspectos': aspects_normalized,
        'metadatos': metadata,
        'cabalistic_data': cabalistic_data,
    }


def _find_house_for_planet(planet_longitude: float, houses: Dict[str, Any]) -> Optional[int]:
    """
    Determina en qué casa está un planeta basado en su longitud eclíptica
    
    Args:
        planet_longitude: Longitud del planeta (0-360)
        houses: Dict con datos de casas
        
    Returns:
        Número de casa (1-12) o None si no se puede determinar
    """
    if not houses:
        return None
    
    # Convertir casas a lista ordenada de longitudes
    house_cusps = []
    for house_num in range(1, 13):
        house_data = houses.get(str(house_num))
        if house_data:
            sign = house_data.get('sign', '')
            degree = house_data.get('degree', 0)
            
            # Calcular longitud de cúspide
            sign_order = [
                'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
                'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
            ]
            try:
                sign_index = sign_order.index(sign)
                cusp_longitude = sign_index * 30 + degree
                house_cusps.append((house_num, cusp_longitude))
            except (ValueError, TypeError):
                pass
    
    if not house_cusps:
        return None
    
    # Encontrar la casa donde cae el planeta
    # Un planeta está en la casa N si su longitud está entre la cúspide N y N+1
    for i in range(len(house_cusps)):
        current_house, current_cusp = house_cusps[i]
        next_house, next_cusp = house_cusps[(i + 1) % len(house_cusps)]
        
        # Manejar el cruce del círculo (360° -> 0°)
        if current_cusp <= next_cusp:
            if current_cusp <= planet_longitude < next_cusp:
                return current_house
        else:
            # Cruce de 360° a 0°
            if planet_longitude >= current_cusp or planet_longitude < next_cusp:
                return current_house
    
    return 1  # Default a casa 1 si no se puede determinar
