# Secondary Progressions Engine
# This module implements Secondary Progressions using Swiss Ephemeris
# The "day for a year" technique - the most important progression method

"""
SECONDARY PROGRESSIONS ENGINE — Motor de Progresiones Secundarias

Las Progresiones Secundarias son la técnica predictiva más importante
después de los tránsitos. Se basan en el principio hermético:
"Un día de movimiento planetario = un año de vida"

Fórmula matemática:
    progressed_jd = natal_jd + (años_desde_nacimiento)
    
    Donde: años_desde_nacimiento puede incluir fracción decimal
           para precisión de meses/días

Técnicas implementadas:
1. Progresiones de planetas (Sol, Luna, Mercurio, Venus, Mars)
2. Ascendente/MC progresados (usando arco solar del Sol)
3. Luna progresada (ciclo de 27-28 años por el zodíaco)
4. Aspectos entre progresados y natales

La Luna Progresada es especialmente importante:
- Tarda ~27 años en recorrer el zodíaco
- Marca ciclos emocionales y de desarrollo
- Cambio de signo = cambio de clima emocional
"""

from datetime import datetime
from decimal import Decimal
from typing import Dict, List, Optional, Tuple
from math import fabs

try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False
    print("Warning: Swiss Ephemeris not available. Progressions disabled.")

from ..config.astrology_settings import PLANET_IDS, PLANET_SYMBOLS, MAJOR_ASPECTS, ASPECT_ORBS
from .ephemeris import EphemerisUtils


# Progression-specific orbs (tighter than natal)
PROGRESSION_ORBS = {
    "conjunction": 1.5,
    "opposition": 1.5,
    "trine": 1.0,
    "square": 1.0,
    "sextile": 1.0,
}


class ProgressionsEngine:
    """
    Engine for calculating Secondary Progressions
    
    Secondary Progressions use the "day for a year" technique:
    - 1 day of actual planetary movement = 1 year of life
    - To find progressions for age 30, calculate positions 30 days after birth
    
    Key outputs:
    - Progressed positions for all planets
    - Progressed Ascendant and Midheaven
    - Progressed Moon (most important progression)
    - Aspects between progressed and natal planets
    """

    def __init__(self):
        if not SWISSEPH_AVAILABLE:
            raise ImportError("Swiss Ephemeris (swisseph) is required for progressions")

    def calculate_progressions(
        self,
        birth_data: Dict,
        natal_planets: List[Dict],
        natal_houses: List[Dict],
        target_date: str,
        latitude: float = 0.0,
        longitude: float = 0.0
    ) -> Dict:
        """
        Calculate Secondary Progressions for target date
        
        Args:
            birth_data: Dictionary with birth datetime info:
                - year: int
                - month: int
                - day: int
                - hour: int
                - minute: int
            natal_planets: List of natal planet positions
            natal_houses: List of natal house cusps
            target_date: Target date as 'YYYY-MM-DD' string
            latitude: Birth latitude (for house calculations)
            longitude: Birth longitude (for house calculations)
        
        Returns:
            Dictionary with:
                - target_date: str
                - years_elapsed: float
                - progressed_planets: Dict of progressed positions
                - progressed_angles: Dict with ASC/MC progressed
                - progressed_moon_phase: Current lunar phase in progressions
                - progression_aspects: Aspects between progressed and natal
                - method: str
        """
        if not SWISSEPH_AVAILABLE:
            raise ImportError("Swiss Ephemeris not available")

        # 1. Calculate natal Julian Day
        birth_hour = birth_data.get('hour', 0)
        birth_minute = birth_data.get('minute', 0)
        natal_jd = swe.julday(
            birth_data['year'],
            birth_data['month'],
            birth_data['day'],
            birth_hour + birth_minute / 60.0
        )

        # 2. Calculate years elapsed (with decimal precision)
        target_dt = datetime.strptime(target_date, '%Y-%m-%d')
        birth_dt = datetime(
            birth_data['year'],
            birth_data['month'],
            birth_data['day'],
            birth_hour,
            birth_minute
        )
        
        # Calculate exact years with decimal
        delta = target_dt - birth_dt
        years_elapsed = delta.days / 365.25  # Account for leap years

        # 3. Calculate progressed Julian Day
        # Key formula: add years as days to natal JD
        progressed_jd = natal_jd + years_elapsed

        # 4. Calculate progressed planets
        progressed_planets = {}
        for planet_name in PLANET_IDS.keys():
            # Skip nodes for progressions (they move very slowly)
            if 'node' in planet_name:
                continue
                
            planet_data = self._calculate_progressed_planet(
                planet_name, natal_jd, progressed_jd
            )
            if planet_data:
                progressed_planets[planet_name] = planet_data

        # 5. Calculate progressed ASC/MC using Solar Arc
        progressed_angles = self._calculate_progressed_angles(
            natal_jd, progressed_jd, natal_houses, latitude, longitude
        )

        # 6. Calculate progressed Moon phase (important!)
        progressed_moon_phase = self._calculate_progressed_moon_phase(
            progressed_planets
        )

        # 7. Calculate aspects between progressed and natal
        progression_aspects = self._calculate_progression_aspects(
            progressed_planets, natal_planets
        )

        # 8. Identify key progressions
        key_progressions = self._identify_key_progressions(
            progressed_planets, natal_planets, progressed_angles, natal_houses
        )

        return {
            'target_date': target_date,
            'years_elapsed': round(years_elapsed, 2),
            'progressed_jd': progressed_jd,
            'progressed_planets': progressed_planets,
            'progressed_angles': progressed_angles,
            'progressed_moon_phase': progressed_moon_phase,
            'progression_aspects': progression_aspects,
            'key_progressions': key_progressions,
            'method': 'secondary_progressions_day_for_year'
        }

    def _calculate_progressed_planet(
        self,
        planet_name: str,
        natal_jd: float,
        progressed_jd: float
    ) -> Optional[Dict]:
        """
        Calculate progressed position for a single planet
        
        Returns natal position, progressed position, and motion since birth
        """
        if planet_name not in PLANET_IDS:
            return None

        planet_id = PLANET_IDS[planet_name]

        try:
            # Get natal position
            natal_result = swe.calc_ut(natal_jd, planet_id, swe.FLG_SPEED)
            natal_lon = natal_result[0][0] if isinstance(natal_result[0], (list, tuple)) else natal_result[0]
            
            # Get progressed position
            prog_result = swe.calc_ut(progressed_jd, planet_id, swe.FLG_SPEED)
            prog_lon = prog_result[0][0] if isinstance(prog_result[0], (list, tuple)) else prog_result[0]
            prog_speed = prog_result[0][3] if isinstance(prog_result[0], (list, tuple)) and len(prog_result[0]) > 3 else 0

            # Normalize
            natal_lon = float(natal_lon) % 360
            prog_lon = float(prog_lon) % 360

            # Calculate total motion since birth
            motion = prog_lon - natal_lon
            if motion < -180:
                motion += 360
            elif motion > 180:
                motion -= 360

            # Get sign info
            prog_sign, prog_degree = self._get_zodiac_sign(prog_lon)
            natal_sign, natal_degree = self._get_zodiac_sign(natal_lon)

            return {
                'planet_name': planet_name,
                'natal_longitude': round(natal_lon, 4),
                'natal_sign': natal_sign,
                'progressed_longitude': round(prog_lon, 4),
                'progressed_sign': prog_sign,
                'progressed_degree': round(prog_degree, 2),
                'total_motion': round(motion, 4),
                'retrograde': float(prog_speed) < 0,
                'sign_changed': natal_sign != prog_sign,
                'symbol': PLANET_SYMBOLS.get(planet_name, '?')
            }

        except Exception as e:
            print(f"Error calculating progression for {planet_name}: {e}")
            return None

    def _calculate_progressed_angles(
        self,
        natal_jd: float,
        progressed_jd: float,
        natal_houses: List[Dict],
        latitude: float,
        longitude: float
    ) -> Dict:
        """
        Calculate progressed Ascendant and Midheaven
        
        Uses Solar Arc method: add Sun's progressed arc to natal angles
        This is the most common method for progressing angles.
        """
        try:
            # Get natal Sun position
            natal_sun = swe.calc_ut(natal_jd, 0)
            natal_sun_lon = natal_sun[0][0] if isinstance(natal_sun[0], (list, tuple)) else natal_sun[0]

            # Get progressed Sun position
            prog_sun = swe.calc_ut(progressed_jd, 0)
            prog_sun_lon = prog_sun[0][0] if isinstance(prog_sun[0], (list, tuple)) else prog_sun[0]

            # Calculate solar arc
            solar_arc = (prog_sun_lon - natal_sun_lon) % 360

            # Get natal ASC and MC
            natal_asc = 0
            natal_mc = 0
            for house in natal_houses:
                if isinstance(house, dict):
                    if house.get('number') == 1:
                        natal_asc = house.get('cusp_longitude', 0)
                    elif house.get('number') == 10:
                        natal_mc = house.get('cusp_longitude', 0)
                else:
                    if getattr(house, 'house_number', 0) == 1:
                        natal_asc = float(getattr(house, 'cusp_longitude', 0))
                    elif getattr(house, 'house_number', 0) == 10:
                        natal_mc = float(getattr(house, 'cusp_longitude', 0))

            # Apply solar arc to angles
            prog_asc = (natal_asc + solar_arc) % 360
            prog_mc = (natal_mc + solar_arc) % 360

            # Get signs
            asc_sign, asc_degree = self._get_zodiac_sign(prog_asc)
            mc_sign, mc_degree = self._get_zodiac_sign(prog_mc)
            
            natal_asc_sign, _ = self._get_zodiac_sign(natal_asc)
            natal_mc_sign, _ = self._get_zodiac_sign(natal_mc)

            return {
                'method': 'solar_arc',
                'solar_arc': round(solar_arc, 4),
                'progressed_ascendant': {
                    'longitude': round(prog_asc, 4),
                    'sign': asc_sign,
                    'degree': round(asc_degree, 2),
                    'sign_changed': natal_asc_sign != asc_sign
                },
                'progressed_midheaven': {
                    'longitude': round(prog_mc, 4),
                    'sign': mc_sign,
                    'degree': round(mc_degree, 2),
                    'sign_changed': natal_mc_sign != mc_sign
                },
                'natal_ascendant': round(natal_asc, 4),
                'natal_midheaven': round(natal_mc, 4)
            }

        except Exception as e:
            print(f"Error calculating progressed angles: {e}")
            return {
                'method': 'solar_arc',
                'error': str(e)
            }

    def _calculate_progressed_moon_phase(
        self,
        progressed_planets: Dict
    ) -> Dict:
        """
        Calculate the progressed Moon phase
        
        The progressed Moon is the most dynamic progression, moving about
        1° per month (or 12° per year in progressions).
        
        Key: Progressed Moon takes ~27-28 years to complete the zodiac
        """
        if 'sun' not in progressed_planets or 'moon' not in progressed_planets:
            return {'phase': 'unknown'}

        sun_lon = progressed_planets['sun']['progressed_longitude']
        moon_lon = progressed_planets['moon']['progressed_longitude']

        # Calculate phase angle (Moon - Sun)
        phase_angle = (moon_lon - sun_lon) % 360

        # Determine phase name
        if phase_angle < 45:
            phase = 'new_moon'
            phase_name = 'Luna Nueva Progresada'
            theme = 'Nuevos comienzos, sembrar semillas'
        elif phase_angle < 90:
            phase = 'crescent'
            phase_name = 'Creciente Progresada'
            theme = 'Impulso hacia adelante, superar obstáculos'
        elif phase_angle < 135:
            phase = 'first_quarter'
            phase_name = 'Cuarto Creciente Progresado'
            theme = 'Crisis de acción, tomar decisiones'
        elif phase_angle < 180:
            phase = 'gibbous'
            phase_name = 'Gibosa Creciente Progresada'
            theme = 'Refinamiento, perfeccionamiento'
        elif phase_angle < 225:
            phase = 'full_moon'
            phase_name = 'Luna Llena Progresada'
            theme = 'Culminación, iluminación, relaciones'
        elif phase_angle < 270:
            phase = 'disseminating'
            phase_name = 'Diseminante Progresada'
            theme = 'Compartir, enseñar, distribuir'
        elif phase_angle < 315:
            phase = 'last_quarter'
            phase_name = 'Cuarto Menguante Progresado'
            theme = 'Crisis de conciencia, reorientación'
        else:
            phase = 'balsamic'
            phase_name = 'Balsámica Progresada'
            theme = 'Liberación, culminación de ciclo, preparación'

        return {
            'phase': phase,
            'phase_name': phase_name,
            'phase_angle': round(phase_angle, 2),
            'theme': theme,
            'progressed_moon_sign': progressed_planets['moon']['progressed_sign'],
            'progressed_moon_degree': progressed_planets['moon']['progressed_degree']
        }

    def _calculate_progression_aspects(
        self,
        progressed_planets: Dict,
        natal_planets: List[Dict]
    ) -> List[Dict]:
        """
        Calculate aspects between progressed and natal planets
        
        Key aspects to watch:
        - Progressed Sun to natal planets
        - Progressed Moon to natal planets
        - Progressed planets to natal Sun/Moon/ASC
        """
        aspects = []

        for p_name, p_data in progressed_planets.items():
            prog_lon = p_data['progressed_longitude']

            for natal in natal_planets:
                # Handle both dict and object formats
                if isinstance(natal, dict):
                    n_name = natal.get('planet_name', natal.get('name', ''))
                    n_lon = natal.get('longitude', 0)
                else:
                    n_name = getattr(natal, 'planet_name', '')
                    n_lon = float(getattr(natal, 'longitude', 0))

                # Check each aspect
                for aspect_angle, aspect_type in MAJOR_ASPECTS.items():
                    orb_allowed = PROGRESSION_ORBS.get(aspect_type, 1.5)
                    
                    # Calculate separation
                    diff = abs(prog_lon - n_lon)
                    if diff > 180:
                        diff = 360 - diff

                    actual_orb = abs(diff - aspect_angle)
                    
                    if actual_orb <= orb_allowed:
                        aspects.append({
                            'progressed_planet': p_name,
                            'progressed_longitude': prog_lon,
                            'natal_planet': n_name,
                            'natal_longitude': n_lon,
                            'aspect_type': aspect_type,
                            'aspect_angle': aspect_angle,
                            'orb': round(actual_orb, 2),
                            'exactness': round(100 - (actual_orb / orb_allowed * 100), 1)
                        })

        # Sort by exactness
        aspects.sort(key=lambda x: x['exactness'], reverse=True)
        
        return aspects

    def _identify_key_progressions(
        self,
        progressed_planets: Dict,
        natal_planets: List[Dict],
        progressed_angles: Dict,
        natal_houses: List[Dict]
    ) -> List[Dict]:
        """
        Identify the most significant progressions
        
        Key progressions to highlight:
        1. Sign changes (planet entering new sign)
        2. Exact aspects (orb < 0.5°)
        3. Progressed Moon changing signs
        4. ASC/MC sign changes
        """
        key_progs = []

        # Check for sign changes
        for p_name, p_data in progressed_planets.items():
            if p_data.get('sign_changed'):
                key_progs.append({
                    'type': 'sign_change',
                    'planet': p_name,
                    'new_sign': p_data['progressed_sign'],
                    'significance': 'high' if p_name in ['sun', 'moon', 'mercury', 'venus'] else 'medium',
                    'description': f"{p_name.title()} progresado ha entrado en {p_data['progressed_sign'].title()}"
                })

        # Check ASC/MC sign changes
        if progressed_angles.get('progressed_ascendant', {}).get('sign_changed'):
            key_progs.append({
                'type': 'angle_sign_change',
                'angle': 'ascendant',
                'new_sign': progressed_angles['progressed_ascendant']['sign'],
                'significance': 'very_high',
                'description': f"Ascendente progresado en {progressed_angles['progressed_ascendant']['sign'].title()}"
            })

        if progressed_angles.get('progressed_midheaven', {}).get('sign_changed'):
            key_progs.append({
                'type': 'angle_sign_change',
                'angle': 'midheaven',
                'new_sign': progressed_angles['progressed_midheaven']['sign'],
                'significance': 'high',
                'description': f"Medio Cielo progresado en {progressed_angles['progressed_midheaven']['sign'].title()}"
            })

        return key_progs

    def _get_zodiac_sign(self, longitude: float) -> Tuple[str, float]:
        """Get zodiac sign and degree within sign"""
        lon = longitude % 360
        if lon < 0:
            lon += 360

        signs = [
            "aries", "taurus", "gemini", "cancer", "leo", "virgo",
            "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
        ]

        sign_index = int(lon // 30)
        sign = signs[sign_index % 12]
        sign_degree = lon - (sign_index * 30)

        return sign, sign_degree

    def get_progression_summary(
        self,
        birth_data: Dict,
        natal_planets: List[Dict],
        natal_houses: List[Dict],
        target_date: str,
        latitude: float = 0.0,
        longitude: float = 0.0
    ) -> Dict:
        """
        Get human-readable progression summary for AI interpretation
        """
        progs = self.calculate_progressions(
            birth_data, natal_planets, natal_houses, target_date, latitude, longitude
        )

        summary = {
            'years_elapsed': progs['years_elapsed'],
            'progressed_sun': progs['progressed_planets'].get('sun', {}),
            'progressed_moon': progs['progressed_planets'].get('moon', {}),
            'moon_phase': progs['progressed_moon_phase'],
            'key_aspects': progs['progression_aspects'][:5],
            'sign_changes': progs['key_progressions']
        }

        return summary
