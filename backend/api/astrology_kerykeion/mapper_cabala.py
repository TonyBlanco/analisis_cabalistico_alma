"""
Mapeo Cabalístico: Planetas → Sefirot / Senderos
TÉCNICO - Sin interpretación narrativa
"""
from typing import Dict, Optional, List


# Mapeo Planetas → Sefirot
PLANET_TO_SEFIROT: Dict[str, Dict[str, str]] = {
    'Sun': {
        'sefira_id': 'tiferet',
        'sefira_name': 'Tiferet',
        'sefira_number': 6
    },
    'Moon': {
        'sefira_id': 'yesod',
        'sefira_name': 'Yesod',
        'sefira_number': 9
    },
    'Mercury': {
        'sefira_id': 'hod',
        'sefira_name': 'Hod',
        'sefira_number': 8
    },
    'Venus': {
        'sefira_id': 'netzach',
        'sefira_name': 'Netzach',
        'sefira_number': 7
    },
    'Mars': {
        'sefira_id': 'gevurah',
        'sefira_name': 'Gevurah',
        'sefira_number': 5
    },
    'Jupiter': {
        'sefira_id': 'chesed',
        'sefira_name': 'Chesed',
        'sefira_number': 4
    },
    'Saturn': {
        'sefira_id': 'binah',
        'sefira_name': 'Binah',
        'sefira_number': 3
    },
    'Uranus': {
        'sefira_id': 'chochmah',
        'sefira_name': 'Chochmah',
        'sefira_number': 2
    },
    'Neptune': {
        'sefira_id': 'keter',
        'sefira_name': 'Keter',
        'sefira_number': 1
    },
    'Pluto': {
        'sefira_id': 'daat',
        'sefira_name': 'Daat',
        'sefira_number': 11
    }
}


# Mapeo Signos → Senderos (basado en correspondencias tradicionales)
SIGN_TO_PATHS: Dict[str, List[Dict[str, any]]] = {
    'Aries': [
        {'path_number': 15, 'path_name': 'Jojmá - Tiféret', 'hebrew_letter': 'He', 'tarot': 4}
    ],
    'Tauro': [
        {'path_number': 16, 'path_name': 'Jojmá - Jésed', 'hebrew_letter': 'Vav', 'tarot': 5}
    ],
    'Géminis': [
        {'path_number': 17, 'path_name': 'Biná - Tiféret', 'hebrew_letter': 'Zayin', 'tarot': 6}
    ],
    'Cáncer': [
        {'path_number': 18, 'path_name': 'Biná - Guevurá', 'hebrew_letter': 'Het', 'tarot': 7}
    ],
    'Leo': [
        {'path_number': 19, 'path_name': 'Jésed - Guevurá', 'hebrew_letter': 'Tet', 'tarot': 8}
    ],
    'Virgo': [
        {'path_number': 20, 'path_name': 'Jésed - Tiféret', 'hebrew_letter': 'Yod', 'tarot': 9}
    ],
    'Libra': [
        {'path_number': 22, 'path_name': 'Guevurá - Tiféret', 'hebrew_letter': 'Lamed', 'tarot': 11}
    ],
    'Escorpio': [
        {'path_number': 24, 'path_name': 'Tiféret - Nétsaj', 'hebrew_letter': 'Nun', 'tarot': 13}
    ],
    'Sagitario': [
        {'path_number': 25, 'path_name': 'Tiféret - Yesod', 'hebrew_letter': 'Samekh', 'tarot': 14}
    ],
    'Capricornio': [
        {'path_number': 26, 'path_name': 'Tiféret - Hod', 'hebrew_letter': 'Ayin', 'tarot': 15}
    ],
    'Acuario': [
        {'path_number': 21, 'path_name': 'Jésed - Nétsaj', 'hebrew_letter': 'Kaf', 'tarot': 10}
    ],
    'Piscis': [
        {'path_number': 23, 'path_name': 'Guevurá - Hod', 'hebrew_letter': 'Mem', 'tarot': 12}
    ]
}


def map_planet_to_sefirot(planet_name: str) -> Optional[Dict[str, any]]:
    """
    Mapea un planeta a su Sefirá correspondiente
    
    Args:
        planet_name: Nombre del planeta (ej: 'Sun', 'Moon', 'Mercury')
    
    Returns:
        Dict con sefira_id, sefira_name, sefira_number o None si no existe
    """
    return PLANET_TO_SEFIROT.get(planet_name)


def map_sign_to_paths(sign: str) -> List[Dict[str, any]]:
    """
    Mapea un signo zodiacal a sus senderos correspondientes
    
    Args:
        sign: Nombre del signo (ej: 'Aries', 'Tauro')
    
    Returns:
        Lista de senderos (normalmente uno, pero puede haber múltiples)
    """
    return SIGN_TO_PATHS.get(sign, [])


def build_cabalistic_mapping(planets_data: Dict[str, Dict[str, any]]) -> Dict[str, Dict[str, any]]:
    """
    Construye el mapeo cabalístico completo para todos los planetas
    
    Args:
        planets_data: Dict con posiciones planetarias {planet_name: {sign: str, degree: float}}
    
    Returns:
        Dict con mapeo cabalístico {planet_name: {sefira: str, path: int|None}}
    """
    mapping = {}
    
    for planet_name, position in planets_data.items():
        # Mapear a Sefirá
        sefirot_info = map_planet_to_sefirot(planet_name)
        if not sefirot_info:
            continue
        
        # Mapear a Sendero basado en el signo
        sign = position.get('sign', '')
        paths = map_sign_to_paths(sign)
        path_number = paths[0]['path_number'] if paths else None
        
        mapping[planet_name] = {
            'sefira': sefirot_info['sefira_name'],
            'path': path_number
        }
    
    return mapping

