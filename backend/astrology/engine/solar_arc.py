# Solar Arc Directions Engine
# This module implements Solar Arc calculations using Swiss Ephemeris

from datetime import datetime
from decimal import Decimal
from typing import Dict, Optional

try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False
    print("Warning: Swiss Ephemeris not available. Solar Arc calculations disabled.")

from ..config.astrology_settings import PLANET_IDS


class SolarArcEngine:
    """
    Engine for calculating Solar Arc Directions
    
    Solar Arc Directions is a predictive technique where all natal planets
    are progressed by the arc traveled by the Sun from birth to target date.
    
    Formula:
    1. Calculate Sun's position at birth
    2. Calculate Sun's position at target date
    3. Arc = Sun_target - Sun_birth
    4. Apply this arc to ALL natal planets
    """

    def __init__(self):
        if not SWISSEPH_AVAILABLE:
            raise ImportError("Swiss Ephemeris (swisseph) is required for Solar Arc calculations")

    def calculate_solar_arc(
        self,
        birth_data: Dict,
        target_date: str
    ) -> Dict:
        """
        Calculate Solar Arc Directions
        
        Args:
            birth_data: Dictionary containing:
                - year: int
                - month: int
                - day: int
                - hour: float (decimal hours, e.g., 12.5 for 12:30)
                - minute: float (optional, used if hour is int)
            target_date: Target date as 'YYYY-MM-DD' string
        
        Returns:
            Dictionary with:
                - arc_degrees: float (the solar arc in degrees)
                - target_date: str
                - planets: Dict of planet positions with arc applied
        """
        if not SWISSEPH_AVAILABLE:
            raise ImportError("Swiss Ephemeris not available")
        
        # 1. Calculate Julian Day for birth
        birth_hour = birth_data.get('hour', 0)
        birth_minute = birth_data.get('minute', 0)
        birth_jd = swe.julday(
            birth_data['year'],
            birth_data['month'],
            birth_data['day'],
            birth_hour + birth_minute / 60.0
        )
        
        # 2. Calculate natal Sun position
        sun_natal_result = swe.calc_ut(birth_jd, 0)  # 0 = Sun
        sun_natal_lon = sun_natal_result[0][0] if isinstance(sun_natal_result[0], (list, tuple)) else sun_natal_result[0]
        
        # 3. Calculate Julian Day for target date
        target_dt = datetime.strptime(target_date, '%Y-%m-%d')
        target_jd = swe.julday(
            target_dt.year,
            target_dt.month,
            target_dt.day,
            12.0  # Default to noon for target date
        )
        
        # 4. Calculate Sun position at target date
        sun_target_result = swe.calc_ut(target_jd, 0)
        sun_target_lon = sun_target_result[0][0] if isinstance(sun_target_result[0], (list, tuple)) else sun_target_result[0]
        
        # 5. Calculate arc (difference)
        arc = sun_target_lon - sun_natal_lon
        
        # 6. Apply arc to all natal planets
        planets = {}
        
        for planet_name, planet_id in PLANET_IDS.items():
            try:
                # Get natal position
                natal_result = swe.calc_ut(birth_jd, planet_id)
                natal_lon = natal_result[0][0] if isinstance(natal_result[0], (list, tuple)) else natal_result[0]
                
                # Apply arc
                directed_lon = (natal_lon + arc) % 360
                
                # Determine zodiac sign for directed position
                sign, sign_degree = self._get_zodiac_sign(directed_lon)
                
                planets[planet_name] = {
                    'longitude': float(directed_lon),
                    'natal_longitude': float(natal_lon),
                    'arc_applied': float(arc),
                    'sign': sign,
                    'sign_degree': float(sign_degree)
                }
            except Exception as e:
                print(f"Warning: Could not calculate Solar Arc for {planet_name}: {e}")
                continue
        
        return {
            'arc_degrees': float(arc),
            'target_date': target_date,
            'planets': planets,
            'method': 'solar_arc_directions'
        }

    def _get_zodiac_sign(self, longitude: float) -> tuple:
        """
        Determine zodiac sign and degree within sign
        
        Args:
            longitude: Ecliptic longitude in degrees
            
        Returns:
            Tuple of (sign_name, degree_within_sign)
        """
        # Normalize to [0, 360)
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
