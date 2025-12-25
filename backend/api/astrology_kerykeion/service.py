"""
Servicio de cálculo Kerykeion
Ejecuta cálculos astrológicos técnicos sin interpretación usando la librería Kerykeion real
Fallback a Swiss Ephemeris directo si Kerykeion falla
"""
from datetime import datetime
from .schemas import KerykeionInputSchema, KerykeionOutputSchema, PlanetOutputSchema, HouseOutputSchema, AspectOutputSchema, CabalisticMappingSchema
from .mapper_cabala import build_cabalistic_mapping
from .params import normalize_params

# Try import Kerykeion
try:
    from kerykeion import AstrologicalSubject, KerykeionChartSVG
    KERYKEION_AVAILABLE = True
except ImportError:
    KERYKEION_AVAILABLE = False

# Fallback: Swiss Ephemeris adapter
from .swisseph_adapter import execute_with_astrology_core, ASTROLOGY_CORE_AVAILABLE


def execute_kerykeion(input_data: KerykeionInputSchema) -> KerykeionOutputSchema:
    """
    Ejecuta el cálculo Kerykeion completo usando la librería Kerykeion real
    Fallback a Swiss Ephemeris directo si Kerykeion no está disponible o falla
    
    Args:
        input_data: Datos de entrada validados
    
    Returns:
        Resultado del cálculo en formato estándar Kerykeion
    """
    params = normalize_params(
        house_system=input_data.house_system,
        zodiac_type=input_data.zodiac_type,
        zodiac_system=input_data.zodiac_system,
        ayanamsha=input_data.ayanamsha,
    )

    # Prefer Swiss Ephemeris core when available so house systems + zodiac types are honored.
    if ASTROLOGY_CORE_AVAILABLE:
        try:
            result_dict = execute_with_astrology_core(
                birth_date=input_data.birth_date,
                birth_time=input_data.birth_time,
                city=input_data.location.city,
                country=input_data.location.country,
                lat=input_data.location.lat,
                lng=input_data.location.lng,
                timezone=input_data.location.timezone,
                house_system=params.house_system_code,
                zodiac_type=params.zodiac_type,
                ayanamsha=params.ayanamsha,
            )

            return KerykeionOutputSchema(**result_dict)
        except Exception as e:
            raise RuntimeError(f"Error en cálculo astrológico: {e}")

    # Fallback: Kerykeion library (limited configurability)
    if KERYKEION_AVAILABLE:
        return _execute_with_kerykeion(input_data)

    raise RuntimeError("Ni Swiss Ephemeris (Astrology Core) ni Kerykeion están disponibles")


def _execute_with_kerykeion(input_data: KerykeionInputSchema) -> KerykeionOutputSchema:
    """
    Ejecuta cálculo con Kerykeion (implementación original)
    """
    # Parsear fecha y hora
    birth_datetime = datetime.strptime(
        f"{input_data.birth_date} {input_data.birth_time}",
        "%Y-%m-%d %H:%M"
    )
    
    # Crear AstrologicalSubject con Kerykeion real
    subject = AstrologicalSubject(
        name="Patient",
        year=birth_datetime.year,
        month=birth_datetime.month,
        day=birth_datetime.day,
        hour=birth_datetime.hour,
        minute=birth_datetime.minute,
        city=input_data.location.city,
        nation=input_data.location.country,
        lat=input_data.location.lat,
        lng=input_data.location.lng,
        tz_str=input_data.location.timezone
    )
    
    # Generar SVG de la carta usando KerykeionChartSVG
    chart = KerykeionChartSVG(subject)
    chart_svg = chart.makeSVG()
    
    # Mapeo de signos de inglés a español
    sign_map = {
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
        'Pisces': 'Piscis'
    }
    
    # Extraer posiciones planetarias reales
    planets_data = {}
    for planet_name, planet_obj in subject.planets.items():
        # Kerykeion devuelve el signo y la posición (longitud eclíptica)
        position = planet_obj.position
        sign = planet_obj.sign
        
        # Validar que position no sea None
        if position is None:
            continue  # Saltar planetas sin posición válida
        
        # Calcular grado dentro del signo (0-29.99)
        degree = position % 30
        
        planets_data[planet_name] = {
            'sign': sign_map.get(sign, sign),
            'degree': round(degree, 2)
        }
    
    # Extraer casas reales
    houses_data = {}
    for house_num, house_obj in subject.houses.items():
        position = house_obj.position
        sign = house_obj.sign

        if position is None:
            continue
        
        # Calcular grado dentro del signo
        degree = position % 30
        
        houses_data[str(house_num)] = {
            'sign': sign_map.get(sign, sign),
            'degree': round(degree, 2)
        }
    
    # Extraer aspectos reales
    aspects_data = []
    for aspect_obj in subject.aspects:
        if aspect_obj.p1 is None or aspect_obj.p2 is None:
            continue

        if aspect_obj.orb is None:
            continue

        # Mapear nombres de aspectos de Kerykeion a nuestro formato
        aspect_type_map = {
            'conjunction': 'conjunction',
            'opposition': 'opposition',
            'trine': 'trine',
            'square': 'square',
            'sextile': 'sextile',
            'quincunx': 'quincunx',
            'semisextile': 'semisextile'
        }
        
        aspect_type = aspect_type_map.get(aspect_obj.aspect.lower(), aspect_obj.aspect.lower())
        
        aspects_data.append({
            'from': aspect_obj.p1.name,
            'to': aspect_obj.p2.name,
            'type': aspect_type,
            'orb': round(aspect_obj.orb, 2)
        })
    
    # Ordenar aspectos por orbe (más exactos primero)
    aspects_data.sort(key=lambda x: x['orb'])
    
    # Mapeo cabalístico
    cabalistic_mapping = build_cabalistic_mapping(planets_data)
    
    # Construir salida con schemas Pydantic
    planets_output = {
        planet: PlanetOutputSchema(**data)
        for planet, data in planets_data.items()
    }
    
    houses_output = {
        house_num: HouseOutputSchema(**data)
        for house_num, data in houses_data.items()
    }
    
    aspects_output = [
        AspectOutputSchema(**aspect)
        for aspect in aspects_data
    ]
    
    cabalistic_mapping_output = {
        planet: CabalisticMappingSchema(**mapping)
        for planet, mapping in cabalistic_mapping.items()
    }
    
    # Obtener versión de Kerykeion
    try:
        import kerykeion
        engine_version = getattr(kerykeion, '__version__', input_data.engine_version or '1.0.0')
    except (ImportError, AttributeError):
        engine_version = input_data.engine_version or '1.0.0'
    
    return KerykeionOutputSchema(
        engine="kerykeion",
        engine_version=engine_version,
        planets=planets_output,
        houses=houses_output,
        aspects=aspects_output,
        chart_svg=chart_svg,
        cabalistic_mapping=cabalistic_mapping_output
    )
