# -*- coding: utf-8 -*-
"""
Adaptador entre Astrology Core (Swiss Ephemeris) y formato Kerykeion normalizado
Usa el engine de Swiss Ephemeris directamente cuando Kerykeion falla
"""
from typing import Dict, Any, Optional
from datetime import datetime
from decimal import Decimal

# Import astrology core
try:
    from astrology.engine.natal_chart_engine import NatalChartEngine
    from astrology.domain.chart import NatalChart as DomainNatalChart
    ASTROLOGY_CORE_AVAILABLE = True
except ImportError:
    ASTROLOGY_CORE_AVAILABLE = False


def execute_with_astrology_core(
    birth_date: str,
    birth_time: str,
    city: str,
    country: str,
    lat: float,
    lng: float,
    timezone: str,
    house_system: str = 'P',
    zodiac_type: str = 'tropical',
    ayanamsha: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Ejecuta cálculo usando Astrology Core (Swiss Ephemeris directo)
    y normaliza al formato esperado
    
    Args:
        birth_date: Fecha YYYY-MM-DD
        birth_time: Hora HH:MM
        city: Ciudad
        country: País
        lat: Latitud
        lng: Longitud
        timezone: Timezone
        house_system: Sistema de casas (P=Placidus, K=Koch, etc.)
    
    Returns:
        Dict con estructura normalizada similar a Kerykeion
    """
    if not ASTROLOGY_CORE_AVAILABLE:
        raise ImportError("Astrology Core no está disponible")
    
    # Parsear fecha y hora
    birth_datetime = datetime.strptime(
        f"{birth_date} {birth_time}",
        "%Y-%m-%d %H:%M"
    )
    
    # Aceptar house_system como código (P/K/...) o nombre (placidus/...)
    try:
        from .params import house_system_to_engine_code, normalize_zodiac_type
        house_system_code = house_system_to_engine_code(house_system)
        zodiac_type_norm = normalize_zodiac_type(zodiac_type)
    except Exception:
        house_system_code = (house_system or 'P').upper() if isinstance(house_system, str) else 'P'
        zodiac_type_norm = 'tropical'
    
    # Crear engine
    engine = NatalChartEngine()
    
    # Calcular carta natal
    chart = engine.calculate_natal_chart(
        patient_id=0,  # Temporal, no se usa para cálculo
        birth_datetime=birth_datetime,
        latitude=Decimal(str(lat)),
        longitude=Decimal(str(lng)),
        timezone=timezone,
        house_system=house_system_code,
        zodiac_type='S' if zodiac_type_norm == 'sidereal' else 'T',
        ayanamsha=ayanamsha,
        draconic=(zodiac_type_norm == 'draconic'),
        include_minor_aspects=False
    )
    
    # Mapeo de nombres de planetas
    PLANET_NAME_MAP = {
        'sun': 'Sun',
        'moon': 'Moon',
        'mercury': 'Mercury',
        'venus': 'Venus',
        'mars': 'Mars',
        'jupiter': 'Jupiter',
        'saturn': 'Saturn',
        'uranus': 'Uranus',
        'neptune': 'Neptune',
        'pluto': 'Pluto'
    }
    
    # Convertir planetas al formato Kerykeion
    planets = {}
    for planet in chart.planets:
        kerykeion_name = PLANET_NAME_MAP.get(planet.planet_name, planet.planet_name.capitalize())
        planets[kerykeion_name] = {
            'sign': planet.sign.capitalize(),
            'degree': float(planet.sign_degree)
        }
    
    # Convertir casas al formato Kerykeion
    houses = {}
    for house in chart.houses:
        houses[str(house.house_number)] = {
            'sign': house.sign.capitalize(),
            'degree': float(house.sign_degree)
        }
    
    # Convertir aspectos al formato Kerykeion
    aspects = []
    ASPECT_TYPE_MAP = {
        'conjunction': 'conjunction',
        'sextile': 'sextile',
        'square': 'square',
        'trine': 'trine',
        'quincunx': 'quincunx',
        'opposition': 'opposition'
    }
    
    for aspect in chart.aspects:
        planet1_name = PLANET_NAME_MAP.get(
            [p.planet_name for p in chart.planets if p.planet_id == aspect.planet1_id][0],
            'Unknown'
        )
        planet2_name = PLANET_NAME_MAP.get(
            [p.planet_name for p in chart.planets if p.planet_id == aspect.planet2_id][0],
            'Unknown'
        )
        
        aspects.append({
            'from': planet1_name,
            'to': planet2_name,
            'type': ASPECT_TYPE_MAP.get(aspect.aspect_type, aspect.aspect_type),
            'orb': float(aspect.orb)
        })
    
    # Construir resultado en formato Kerykeion
    result = {
        'planets': planets,
        'houses': houses,
        'aspects': aspects,
        'house_system': house_system_code,
        'zodiac_type': zodiac_type_norm,
        'engine': 'swisseph',
        'engine_version': '2.10.3',
        'chart_svg': '',  # No generamos SVG con Swiss Ephemeris
        'cabalistic_mapping': {}  # Se puede agregar después si es necesario
    }
    
    return result
