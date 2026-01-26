# Solar Return Engine
# This module implements Solar Return calculations using Swiss Ephemeris
# Calculates the exact moment when the Sun returns to its natal position

"""
SOLAR RETURN ENGINE — Motor de Retorno Solar

El Retorno Solar es la carta calculada para el momento exacto en que
el Sol vuelve a la misma posición que tenía en el nacimiento.
Este momento ocurre aproximadamente una vez al año (± unas horas del cumpleaños).

Técnica:
1. Obtener longitud del Sol natal
2. Buscar iterativamente el momento exacto en que el Sol vuelve a esa posición
3. Calcular carta completa para ese momento
4. Opción: calcular para ubicación actual o natal

Usos:
- Temas del año solar (cumpleaños a cumpleaños)
- Casas del Retorno Solar indican áreas de enfoque
- Aspectos del Retorno indican desafíos/oportunidades del año

Algoritmo de búsqueda:
- Búsqueda gruesa: incrementos de 1 día
- Refinamiento: incrementos de 1 hora
- Precisión final: incrementos de 1 minuto
- Resultado: precisión de ~1 minuto de arco
"""

from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, List, Optional, Tuple

try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False
    print("Warning: Swiss Ephemeris not available. Solar Return calculations disabled.")

from ..config.astrology_settings import PLANET_IDS, PLANET_SYMBOLS
from .ephemeris import EphemerisUtils
from .natal_chart_engine import NatalChartEngine


class SolarReturnEngine:
    """
    Engine for calculating Solar Returns
    
    A Solar Return is the moment when the Sun returns to its exact natal position.
    This occurs approximately once per year, around the birthday.
    
    Key features:
    - Iterative search algorithm for exact moment
    - Support for natal or current location
    - Complete chart calculation for return moment
    - Precision within ~1 arcminute
    """

    SUN_PLANET_ID = 0  # Swiss Ephemeris ID for Sun

    def __init__(self):
        if not SWISSEPH_AVAILABLE:
            raise ImportError("Swiss Ephemeris (swisseph) is required for Solar Return calculations")
        self.chart_engine = NatalChartEngine()

    def calculate_solar_return(
        self,
        patient_id: int,
        birth_datetime: datetime,
        natal_latitude: Decimal,
        natal_longitude: Decimal,
        target_year: int,
        location: str = "natal",
        current_latitude: Optional[float] = None,
        current_longitude: Optional[float] = None,
        timezone: str = "UTC",
        house_system: str = "P",
        zodiac_type: str = "T"
    ) -> Dict:
        """
        Calculate Solar Return for target year
        
        Args:
            patient_id: Patient identifier
            birth_datetime: Original birth datetime
            natal_latitude: Birth latitude
            natal_longitude: Birth longitude
            target_year: Year for which to calculate Solar Return
            location: "natal" or "current" - where to calculate houses
            current_latitude: Current latitude (required if location="current")
            current_longitude: Current longitude (required if location="current")
            timezone: Timezone string
            house_system: House system for return chart
            zodiac_type: Zodiac type (T=Tropical, S=Sidereal)
        
        Returns:
            Dict with:
                - return_datetime: ISO datetime of exact solar return
                - solar_position: Natal Sun longitude
                - chart: Complete natal chart for return moment
                - precision: Angular precision achieved
                - location_used: "natal" or "current"
        """
        if not SWISSEPH_AVAILABLE:
            raise RuntimeError("Swiss Ephemeris not available")

        # 1. Calculate natal Sun position
        natal_jd = EphemerisUtils.datetime_to_julian_day(birth_datetime)
        natal_sun_calc = swe.calc_ut(natal_jd, self.SUN_PLANET_ID)
        natal_sun_longitude = natal_sun_calc[0][0]  # Longitude in degrees

        # 2. Define search range (around birthday of target year)
        # Start 2 days before birthday, end 2 days after
        start_date = datetime(
            target_year, 
            birth_datetime.month, 
            birth_datetime.day,
            tzinfo=birth_datetime.tzinfo
        ) - timedelta(days=2)
        
        end_date = start_date + timedelta(days=4)

        # 3. Coarse search (1-day increments)
        approx_datetime, approx_diff = self._coarse_search(
            natal_sun_longitude,
            start_date,
            end_date
        )

        if approx_datetime is None:
            raise ValueError(f"No solar return found for year {target_year}")

        # 4. Medium refinement (1-hour increments)
        refined_datetime = self._medium_refinement(
            natal_sun_longitude,
            approx_datetime
        )

        # 5. Fine refinement (1-minute increments)
        final_datetime = self._fine_refinement(
            natal_sun_longitude,
            refined_datetime
        )

        # 6. Calculate final Sun position for verification
        return_jd = EphemerisUtils.datetime_to_julian_day(final_datetime)
        return_sun_calc = swe.calc_ut(return_jd, self.SUN_PLANET_ID)
        return_sun_longitude = return_sun_calc[0][0]

        # Calculate precision achieved
        final_precision = self._angular_difference(return_sun_longitude, natal_sun_longitude)

        # 7. Determine location for chart calculation
        if location == "current" and current_latitude is not None and current_longitude is not None:
            chart_lat = Decimal(str(current_latitude))
            chart_lon = Decimal(str(current_longitude))
            location_used = "current"
        else:
            chart_lat = natal_latitude
            chart_lon = natal_longitude
            location_used = "natal"

        # 8. Calculate complete chart for return moment
        return_chart = self.chart_engine.calculate_natal_chart(
            patient_id=patient_id,
            birth_datetime=final_datetime,
            latitude=chart_lat,
            longitude=chart_lon,
            timezone=timezone,
            house_system=house_system,
            zodiac_type=zodiac_type
        )

        # Serialize chart to dictionary
        chart_dict = {
            'planets': [p.to_dict() for p in return_chart.planets],
            'houses': [h.to_dict() for h in return_chart.houses],
            'aspects': [a.to_dict() for a in return_chart.aspects],
        }

        # 9. Analyze key features of the Solar Return
        sr_analysis = self._analyze_solar_return(chart_dict, natal_sun_longitude)

        return {
            'return_datetime': final_datetime.isoformat(),
            'solar_position': natal_sun_longitude,
            'return_solar_position': return_sun_longitude,
            'chart': chart_dict,
            'analysis': sr_analysis,
            'precision': final_precision,
            'target_year': target_year,
            'location_used': location_used,
            'location_coordinates': {
                'latitude': float(chart_lat),
                'longitude': float(chart_lon)
            }
        }

    def _coarse_search(
        self,
        target_sun_longitude: float,
        start_date: datetime,
        end_date: datetime
    ) -> Tuple[Optional[datetime], float]:
        """
        Coarse search with 1-day increments
        
        Returns:
            (closest_datetime, closest_angular_difference)
        """
        current_date = start_date
        closest_diff = 360.0
        closest_datetime = None

        while current_date < end_date:
            jd = EphemerisUtils.datetime_to_julian_day(current_date)
            sun_calc = swe.calc_ut(jd, self.SUN_PLANET_ID)
            sun_longitude = sun_calc[0][0]

            diff = self._angular_difference(sun_longitude, target_sun_longitude)

            if diff < closest_diff:
                closest_diff = diff
                closest_datetime = current_date

            current_date += timedelta(days=1)

        return closest_datetime, closest_diff

    def _medium_refinement(
        self,
        target_sun_longitude: float,
        approx_datetime: datetime
    ) -> datetime:
        """
        Medium refinement with 1-hour increments
        
        Searches ±1 day from approximate datetime with hourly precision
        """
        start = approx_datetime - timedelta(days=1)
        end = approx_datetime + timedelta(days=1)
        current = start

        closest_diff = 360.0
        closest_dt = approx_datetime

        while current < end:
            jd = EphemerisUtils.datetime_to_julian_day(current)
            sun_calc = swe.calc_ut(jd, self.SUN_PLANET_ID)
            sun_longitude = sun_calc[0][0]

            diff = self._angular_difference(sun_longitude, target_sun_longitude)

            if diff < closest_diff:
                closest_diff = diff
                closest_dt = current

            current += timedelta(hours=1)

        return closest_dt

    def _fine_refinement(
        self,
        target_sun_longitude: float,
        approx_datetime: datetime
    ) -> datetime:
        """
        Fine refinement with 1-minute increments
        
        Searches ±1 hour from approximate datetime with minute precision
        """
        start = approx_datetime - timedelta(hours=1)
        end = approx_datetime + timedelta(hours=1)
        current = start

        closest_diff = 360.0
        closest_dt = approx_datetime

        while current < end:
            jd = EphemerisUtils.datetime_to_julian_day(current)
            sun_calc = swe.calc_ut(jd, self.SUN_PLANET_ID)
            sun_longitude = sun_calc[0][0]

            diff = self._angular_difference(sun_longitude, target_sun_longitude)

            if diff < closest_diff:
                closest_diff = diff
                closest_dt = current

            current += timedelta(minutes=1)

        return closest_dt

    def _angular_difference(self, angle1: float, angle2: float) -> float:
        """Calculate smallest angular difference between two angles"""
        diff = abs(angle1 - angle2)
        if diff > 180:
            diff = 360 - diff
        return diff

    def _analyze_solar_return(
        self,
        chart_dict: Dict,
        natal_sun_longitude: float
    ) -> Dict:
        """
        Analyze key features of the Solar Return chart
        
        Key things to analyze:
        1. ASC sign and degree
        2. Sun's house in return chart
        3. Ruler of ASC and its condition
        4. Moon's sign, house, and phase
        5. Major aspects to Sun
        """
        analysis = {
            'ascendant': {},
            'sun_house': None,
            'moon': {},
            'key_aspects': [],
            'themes': []
        }

        # Find ASC
        for house in chart_dict.get('houses', []):
            if house.get('house_number') == 1:
                analysis['ascendant'] = {
                    'sign': house.get('sign', 'unknown'),
                    'degree': house.get('sign_degree', 0)
                }
                break

        # Find Sun and Moon
        for planet in chart_dict.get('planets', []):
            planet_name = planet.get('planet_name', '').lower()
            
            if planet_name == 'sun':
                analysis['sun_house'] = planet.get('house', 0)
                analysis['sun_sign'] = planet.get('sign', 'unknown')
                
            elif planet_name == 'moon':
                analysis['moon'] = {
                    'sign': planet.get('sign', 'unknown'),
                    'house': planet.get('house', 0),
                    'degree': planet.get('sign_degree', 0)
                }

        # Find aspects to Sun
        sun_aspects = []
        for aspect in chart_dict.get('aspects', []):
            p1 = aspect.get('planet1_name', '').lower()
            p2 = aspect.get('planet2_name', '').lower()
            
            if 'sun' in p1 or 'sun' in p2:
                sun_aspects.append({
                    'planet': p2 if 'sun' in p1 else p1,
                    'aspect': aspect.get('aspect_type', 'unknown'),
                    'orb': aspect.get('orb', 0)
                })

        analysis['key_aspects'] = sun_aspects[:5]  # Top 5 aspects to Sun

        # Generate themes based on Sun's house
        house_themes = {
            1: 'Año de enfoque personal, nueva imagen, iniciativas propias',
            2: 'Año de finanzas, valores, seguridad material',
            3: 'Año de comunicación, aprendizaje, viajes cortos',
            4: 'Año de hogar, familia, raíces emocionales',
            5: 'Año de creatividad, romance, hijos, diversión',
            6: 'Año de salud, trabajo, rutinas, servicio',
            7: 'Año de relaciones, asociaciones, matrimonio',
            8: 'Año de transformación, crisis, recursos compartidos',
            9: 'Año de expansión, viajes, estudios, filosofía',
            10: 'Año de carrera, reconocimiento público, logros',
            11: 'Año de amistades, grupos, metas futuras',
            12: 'Año de retiro, espiritualidad, trabajo interno',
        }

        sun_house = analysis.get('sun_house', 0)
        if sun_house and sun_house in house_themes:
            analysis['themes'].append(house_themes[sun_house])

        return analysis

    def get_solar_return_summary(
        self,
        patient_id: int,
        birth_datetime: datetime,
        natal_latitude: Decimal,
        natal_longitude: Decimal,
        target_year: int
    ) -> Dict:
        """
        Get human-readable Solar Return summary for AI interpretation
        """
        sr_data = self.calculate_solar_return(
            patient_id=patient_id,
            birth_datetime=birth_datetime,
            natal_latitude=natal_latitude,
            natal_longitude=natal_longitude,
            target_year=target_year
        )

        summary = {
            'year': target_year,
            'return_date': sr_data['return_datetime'],
            'ascendant': sr_data['analysis']['ascendant'],
            'sun_house': sr_data['analysis']['sun_house'],
            'moon': sr_data['analysis']['moon'],
            'themes': sr_data['analysis']['themes']
        }

        return summary
