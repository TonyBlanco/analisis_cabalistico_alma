# Composite Chart Engine
# This module implements Composite Chart calculations using Swiss Ephemeris

from datetime import datetime
from typing import Dict, Optional, Tuple

try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False
    print("Warning: Swiss Ephemeris not available. Composite Chart calculations disabled.")

from ..config.astrology_settings import PLANET_IDS


class CompositeChartEngine:
    """
    Engine for calculating Composite Charts
    
    A Composite Chart creates a single chart by calculating the midpoints
    between the planetary positions of two people. This represents the
    relationship as its own entity.
    
    Formula:
    1. Calculate planet positions for both charts
    2. Find midpoint for each planet (using shortest arc)
    3. Calculate houses using average location
    """

    def __init__(self):
        if not SWISSEPH_AVAILABLE:
            raise ImportError("Swiss Ephemeris (swisseph) is required for Composite Chart calculations")

    def calculate_composite_chart(
        self,
        person1_data: Dict,
        person2_data: Dict,
        house_system: str = 'P'
    ) -> Dict:
        """
        Calculate Composite Chart from two birth data sets
        
        Args:
            person1_data: Dictionary containing:
                - year: int
                - month: int
                - day: int
                - hour: float or int
                - minute: float (optional)
                - latitude: float
                - longitude: float
            person2_data: Same structure as person1_data
            house_system: House system code (default: 'P' for Placidus)
        
        Returns:
            Dictionary with:
                - planets: Dict of planet positions with midpoints
                - houses: List of house cusps
                - ascendant: float
                - midheaven: float
                - composite_location: Dict with lat/lon
                - composite_datetime: str (ISO format)
                - method: str
        """
        if not SWISSEPH_AVAILABLE:
            raise ImportError("Swiss Ephemeris not available")
        
        # 1. Calculate Julian Days for both persons
        jd1 = self._get_julian_day(person1_data)
        jd2 = self._get_julian_day(person2_data)
        
        # 2. Calculate composite Julian Day (midpoint)
        jd_composite = (jd1 + jd2) / 2
        
        # 3. Calculate planet positions and midpoints
        planets = {}
        
        for planet_name, planet_id in PLANET_IDS.items():
            try:
                # Get positions for both persons
                pos1_result = swe.calc_ut(jd1, planet_id)
                pos2_result = swe.calc_ut(jd2, planet_id)
                
                pos1 = pos1_result[0][0] if isinstance(pos1_result[0], (list, tuple)) else pos1_result[0]
                pos2 = pos2_result[0][0] if isinstance(pos2_result[0], (list, tuple)) else pos2_result[0]
                
                # Calculate midpoint using shortest arc
                midpoint = self._calculate_midpoint(pos1, pos2)
                
                # Determine zodiac sign
                sign, sign_degree = self._get_zodiac_sign(midpoint)
                
                planets[planet_name] = {
                    'longitude': float(midpoint),
                    'person1_longitude': float(pos1 % 360),
                    'person2_longitude': float(pos2 % 360),
                    'sign': sign,
                    'sign_degree': float(sign_degree)
                }
            except Exception as e:
                print(f"Warning: Could not calculate composite for {planet_name}: {e}")
                continue
        
        # 4. Calculate composite location (average)
        composite_lat = (person1_data['latitude'] + person2_data['latitude']) / 2
        composite_lon = (person1_data['longitude'] + person2_data['longitude']) / 2
        
        # 5. Calculate houses using composite location and time
        houses, angles = self._calculate_houses(
            jd_composite, 
            composite_lat, 
            composite_lon, 
            house_system
        )
        
        # 6. Convert composite JD back to datetime
        composite_datetime = self._jd_to_iso(jd_composite)
        
        return {
            'planets': planets,
            'houses': houses,
            'ascendant': float(angles['ascendant']),
            'midheaven': float(angles['midheaven']),
            'composite_location': {
                'latitude': float(composite_lat),
                'longitude': float(composite_lon)
            },
            'composite_datetime': composite_datetime,
            'method': 'composite_midpoints'
        }

    def _get_julian_day(self, birth_data: Dict) -> float:
        """Calculate Julian Day from birth data"""
        hour = birth_data.get('hour', 0)
        minute = birth_data.get('minute', 0)
        
        return swe.julday(
            birth_data['year'],
            birth_data['month'],
            birth_data['day'],
            hour + minute / 60.0
        )

    def _calculate_midpoint(self, pos1: float, pos2: float) -> float:
        """
        Calculate midpoint between two positions using shortest arc
        
        This handles the wrap-around case where positions are on opposite
        sides of 0° (e.g., 350° and 10° should give 0°, not 180°)
        """
        # Normalize positions to 0-360
        pos1 = pos1 % 360
        pos2 = pos2 % 360
        
        # Calculate the difference
        diff = abs(pos2 - pos1)
        
        if diff <= 180:
            # Normal case: take simple average
            midpoint = (pos1 + pos2) / 2
        else:
            # Wrap-around case: add 360 to the smaller position
            if pos1 < pos2:
                pos1 += 360
            else:
                pos2 += 360
            midpoint = ((pos1 + pos2) / 2) % 360
        
        return midpoint

    def _calculate_houses(
        self, 
        jd: float, 
        lat: float, 
        lon: float, 
        house_system: str
    ) -> Tuple[list, Dict]:
        """Calculate house cusps and angles"""
        try:
            # Convert house system to bytes for Swiss Ephemeris
            hsys = house_system.encode('utf-8') if isinstance(house_system, str) else house_system
            
            result = swe.houses(jd, lat, lon, hsys)
            
            # result[0] = cusps (12 houses), result[1] = ascmc (angles)
            cusps = list(result[0])
            
            # House cusps with signs
            houses = []
            for i, cusp in enumerate(cusps[:12], 1):
                sign, sign_degree = self._get_zodiac_sign(cusp)
                houses.append({
                    'number': i,
                    'cusp_longitude': float(cusp),
                    'sign': sign,
                    'sign_degree': float(sign_degree)
                })
            
            angles = {
                'ascendant': result[1][0],
                'midheaven': result[1][1],
                'armc': result[1][2] if len(result[1]) > 2 else None,
                'vertex': result[1][3] if len(result[1]) > 3 else None
            }
            
            return houses, angles
            
        except Exception as e:
            print(f"Warning: Could not calculate houses: {e}")
            return [], {'ascendant': 0, 'midheaven': 0}

    def _get_zodiac_sign(self, longitude: float) -> Tuple[str, float]:
        """Determine zodiac sign and degree within sign"""
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

    def _jd_to_iso(self, jd: float) -> str:
        """Convert Julian Day to ISO datetime string"""
        try:
            result = swe.revjul(jd)
            year, month, day, hour_decimal = result
            
            hours = int(hour_decimal)
            minutes = int((hour_decimal - hours) * 60)
            seconds = int(((hour_decimal - hours) * 60 - minutes) * 60)
            
            return f"{int(year)}-{int(month):02d}-{int(day):02d}T{hours:02d}:{minutes:02d}:{seconds:02d}"
        except Exception:
            return datetime.now().isoformat()
