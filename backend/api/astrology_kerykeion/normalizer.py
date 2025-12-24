# -*- coding: utf-8 -*-
"""
Normalizador de output Kerykeion a contrato estable
Este módulo garantiza que el frontend reciba siempre la misma estructura
independientemente de cambios en Kerykeion
"""
from typing import Dict, List, Any, Optional
from datetime import datetime


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
            sign_order = [
                'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
                'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
            ]
            sign = planet_data.get('sign', '')
            degree_in_sign = planet_data.get('degree', 0)
            
            try:
                sign_index = sign_order.index(sign)
                longitud_ecliptica = sign_index * 30 + degree_in_sign
            except (ValueError, TypeError):
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
            sign_order = [
                'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
                'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
            ]
            try:
                sign_index = sign_order.index(sign)
                cuspide_longitud = sign_index * 30 + degree_in_sign
            except (ValueError, TypeError):
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
        from_planet = aspect.get('from', '')
        to_planet = aspect.get('to', '')
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
    metadata = {
        'sistema_casas': kerykeion_result.get('house_system', 'placidus'),
        'fuente': 'kerykeion',
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
    
    # Construir resultado normalizado
    return {
        'planetas': planets_normalized,
        'casas': houses_normalized,
        'aspectos': aspects_normalized,
        'metadatos': metadata
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
