# Fixed Stars Catalog
# Catálogo de estrellas fijas para análisis astrológico simbólico
#
# NOTA: Las estrellas fijas se usan en modo simbólico como arquetipos culturales.
# No representan predicciones astronómicas ni deben interpretarse de forma fatalista.
# Los valores de longitud son aproximados para época J2000.0 y deben ajustarse por precesión.

from typing import List, Dict, Optional


# ============================================================================
# ESTRELLAS PRIMARIAS (ya implementadas en el frontend)
# Son las estrellas de mayor importancia tradicional en la astrología occidental.
# ============================================================================
PRIMARY_STARS: List[Dict] = [
    {
        'name': 'Regulus',
        'longitude': 149.83,  # ~29°51' Leo
        'latitude': 0.46,
        'magnitude': 1.40,
        'constellation': 'Leo',
        'meaning': 'Corazón del león - Liderazgo, nobleza, responsabilidad'
    },
    {
        'name': 'Spica',
        'longitude': 203.84,  # ~23°50' Libra
        'latitude': -2.05,
        'magnitude': 0.97,
        'constellation': 'Virgo',
        'meaning': 'Espiga de trigo - Talento, fertilidad, protección'
    },
    {
        'name': 'Aldebaran',
        'longitude': 69.68,  # ~9°47' Tauro
        'latitude': -5.47,
        'magnitude': 0.85,
        'constellation': 'Taurus',
        'meaning': 'Ojo del toro - Visión, determinación, desafío ético'
    },
    {
        'name': 'Antares',
        'longitude': 249.68,  # ~9°46' Sagitario
        'latitude': -4.57,
        'magnitude': 1.09,
        'constellation': 'Scorpius',
        'meaning': 'Corazón del escorpión - Intensidad, confrontación consciente'
    },
    {
        'name': 'Fomalhaut',
        'longitude': 333.85,  # ~3°52' Piscis
        'latitude': -21.08,
        'magnitude': 1.16,
        'constellation': 'Piscis Austrinus',
        'meaning': 'Boca del pez - Ideal, inspiración, misticismo'
    },
]


# ============================================================================
# ESTRELLAS SECUNDARIAS (NUEVO)
# Complementan las estrellas primarias con arquetipos adicionales.
# Magnitud 0-2 (estrellas brillantes pero de menor tradición astrológica).
# ============================================================================
SECONDARY_STARS: List[Dict] = [
    {
        'name': 'Achernar',
        'longitude': 345.12,  # ~15°12' Piscis
        'latitude': -57.24,
        'magnitude': 0.46,
        'constellation': 'Eridanus',
        'meaning': 'Final del río - Transformación, flujo, adaptación'
    },
    {
        'name': 'Hamal',
        'longitude': 37.40,  # ~7°40' Tauro
        'latitude': 9.96,
        'magnitude': 2.00,
        'constellation': 'Aries',
        'meaning': 'Carnero - Iniciativa, impulso, liderazgo'
    },
    {
        'name': 'Polaris',
        'longitude': 88.50,  # ~28°30' Géminis
        'latitude': 66.10,
        'magnitude': 1.98,
        'constellation': 'Ursa Minor',
        'meaning': 'Estrella del Norte - Guía, dirección, propósito'
    },
    {
        'name': 'Deneb',
        'longitude': 335.20,  # ~5°20' Piscis
        'latitude': 45.28,
        'magnitude': 1.25,
        'constellation': 'Cygnus',
        'meaning': 'Cola del cisne - Transformación, elevación espiritual'
    },
    {
        'name': 'Betelgeuse',
        'longitude': 88.45,  # ~28°45' Géminis
        'latitude': 7.41,
        'magnitude': 0.50,
        'constellation': 'Orion',
        'meaning': 'Hombro del cazador - Fuerza, acción, valentía'
    },
    {
        'name': 'Rigel',
        'longitude': 76.50,  # ~16°50' Géminis
        'latitude': -8.20,
        'magnitude': 0.12,
        'constellation': 'Orion',
        'meaning': 'Pie del cazador - Fundamento, estabilidad, base'
    },
    {
        'name': 'Procyon',
        'longitude': 115.47,  # ~25°47' Cáncer
        'latitude': 5.22,
        'magnitude': 0.38,
        'constellation': 'Canis Minor',
        'meaning': 'Antes del perro - Anticipación, alerta, intuición'
    },
    {
        'name': 'Capella',
        'longitude': 81.51,  # ~21°51' Géminis
        'latitude': 22.87,
        'magnitude': 0.08,
        'constellation': 'Auriga',
        'meaning': 'Cabra - Nutrición, cuidado, protección materna'
    },
    {
        'name': 'Vega',
        'longitude': 285.19,  # ~15°19' Capricornio
        'latitude': 38.78,
        'magnitude': 0.03,
        'constellation': 'Lyra',
        'meaning': 'Lira - Armonía, música, belleza, creatividad artística'
    },
    {
        'name': 'Arcturus',
        'longitude': 204.14,  # ~24°14' Libra
        'latitude': 19.18,
        'magnitude': -0.05,
        'constellation': 'Bootes',
        'meaning': 'Guardián de la osa - Protección, vigilancia, guía'
    },
]


def get_all_fixed_stars(include_secondary: bool = False) -> List[Dict]:
    """
    Retorna catálogo completo de estrellas fijas.
    
    Args:
        include_secondary: Si True, incluye estrellas secundarias además de las primarias.
        
    Returns:
        Lista de diccionarios con datos de estrellas fijas.
    """
    stars = PRIMARY_STARS.copy()
    if include_secondary:
        stars.extend(SECONDARY_STARS)
    return stars


def get_primary_stars() -> List[Dict]:
    """Retorna solo las estrellas primarias."""
    return PRIMARY_STARS.copy()


def get_secondary_stars() -> List[Dict]:
    """Retorna solo las estrellas secundarias."""
    return SECONDARY_STARS.copy()


def get_fixed_stars_catalog() -> Dict[str, List[Dict]]:
    """
    Retorna el catálogo completo organizado por categoría.
    
    Returns:
        Diccionario con 'primary' y 'secondary' como claves.
    """
    return {
        'primary': PRIMARY_STARS.copy(),
        'secondary': SECONDARY_STARS.copy()
    }


def find_star_by_name(name: str) -> Optional[Dict]:
    """
    Busca una estrella por nombre (case-insensitive).
    
    Args:
        name: Nombre de la estrella a buscar.
        
    Returns:
        Diccionario con datos de la estrella o None si no se encuentra.
    """
    name_lower = name.lower()
    for star in PRIMARY_STARS + SECONDARY_STARS:
        if star['name'].lower() == name_lower:
            return star.copy()
    return None


def get_stars_in_longitude_range(
    start_longitude: float,
    end_longitude: float,
    include_secondary: bool = False
) -> List[Dict]:
    """
    Retorna estrellas cuya longitud está en el rango especificado.
    Útil para encontrar estrellas cerca de una posición planetaria.
    
    Args:
        start_longitude: Inicio del rango (0-360).
        end_longitude: Fin del rango (0-360).
        include_secondary: Si True, incluye estrellas secundarias.
        
    Returns:
        Lista de estrellas en el rango especificado.
    """
    stars = get_all_fixed_stars(include_secondary)
    result = []
    
    # Normalizar rango
    start = start_longitude % 360
    end = end_longitude % 360
    
    for star in stars:
        lon = star['longitude'] % 360
        if start <= end:
            # Rango normal (ej: 10° a 50°)
            if start <= lon <= end:
                result.append(star.copy())
        else:
            # Rango cruza 0° (ej: 350° a 10°)
            if lon >= start or lon <= end:
                result.append(star.copy())
    
    return result
