# Davison Chart Engine
# This module implements Davison Relationship Chart calculations using Swiss Ephemeris

"""
Davison Relationship Chart (Carta Davison)

The Davison Chart differs from Composite Charts:
- Composite: Calculates midpoints of individual planetary positions
- Davison: Calculates ONE chart for the midpoint moment/location

Formula:
1. Midpoint moment: (datetime1 + datetime2) / 2 (using Julian Days)
2. Midpoint location: (lat1 + lat2) / 2, (lon1 + lon2) / 2
3. Calculate a natal chart for that moment/location

The Davison Chart represents the relationship as a single entity with its own
birth moment and location - a symbolic "birth" of the relationship itself.
"""

from datetime import datetime
from typing import Dict, Optional, Tuple

try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False
    print("Warning: Swiss Ephemeris not available. Davison Chart calculations disabled.")

from ..config.astrology_settings import PLANET_IDS


class DavisonChartEngine:
    """
    Engine for calculating Davison Relationship Charts
    
    A Davison Chart creates a single chart for the midpoint moment and location
    between two people. Unlike Composite Charts which average planet positions,
    the Davison method calculates an actual chart for a specific moment and place.
    
    This represents the relationship as its own entity with a "birth" moment.
    """

    def __init__(self):
        if not SWISSEPH_AVAILABLE:
            raise ImportError("Swiss Ephemeris (swisseph) is required for Davison Chart calculations")

    def calculate_davison_chart(
        self,
        person1_data: Dict,
        person2_data: Dict,
        house_system: str = 'P'
    ) -> Dict:
        """
        Calculate Davison Relationship Chart from two birth data sets
        
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
                - planets: Dict of planet positions
                - houses: List of house cusps
                - ascendant: float
                - midheaven: float
                - davison_datetime: str (ISO format)
                - davison_location: Dict with lat/lon
                - person1_datetime: str
                - person2_datetime: str
                - method: str
        """
        if not SWISSEPH_AVAILABLE:
            raise ImportError("Swiss Ephemeris not available")
        
        # 1. Calculate Julian Days for both persons
        jd1 = self._get_julian_day(person1_data)
        jd2 = self._get_julian_day(person2_data)
        
        # 2. Calculate Davison midpoint moment (temporal midpoint)
        jd_davison = (jd1 + jd2) / 2
        
        # 3. Calculate Davison midpoint location (spatial midpoint)
        davison_lat = (person1_data['latitude'] + person2_data['latitude']) / 2
        davison_lon = (person1_data['longitude'] + person2_data['longitude']) / 2
        
        # 4. Calculate planet positions for the Davison moment
        # Unlike Composite, we calculate actual positions for the midpoint time
        planets = {}
        
        for planet_name, planet_id in PLANET_IDS.items():
            try:
                # Calculate actual position at the Davison midpoint moment
                pos_result = swe.calc_ut(jd_davison, planet_id)
                
                longitude = pos_result[0][0] if isinstance(pos_result[0], (list, tuple)) else pos_result[0]
                longitude = float(longitude % 360)
                
                # Determine zodiac sign
                sign, sign_degree = self._get_zodiac_sign(longitude)
                
                planets[planet_name] = {
                    'longitude': longitude,
                    'sign': sign,
                    'sign_degree': float(sign_degree)
                }
            except Exception as e:
                print(f"Warning: Could not calculate Davison position for {planet_name}: {e}")
                continue
        
        # 5. Calculate houses using Davison location and time
        houses, angles = self._calculate_houses(
            jd_davison, 
            davison_lat, 
            davison_lon, 
            house_system
        )
        
        # 6. Convert Davison JD to datetime string
        davison_datetime = self._jd_to_iso(jd_davison)
        
        # 7. Build person datetime strings for reference
        person1_datetime = f"{person1_data['year']}-{person1_data['month']:02d}-{person1_data['day']:02d}"
        person2_datetime = f"{person2_data['year']}-{person2_data['month']:02d}-{person2_data['day']:02d}"
        
        return {
            'planets': planets,
            'houses': houses,
            'ascendant': float(angles['ascendant']),
            'midheaven': float(angles['midheaven']),
            'davison_datetime': davison_datetime,
            'davison_location': {
                'latitude': float(davison_lat),
                'longitude': float(davison_lon)
            },
            'person1_datetime': person1_datetime,
            'person2_datetime': person2_datetime,
            'person1_jd': float(jd1),
            'person2_jd': float(jd2),
            'davison_jd': float(jd_davison),
            'method': 'davison_midpoint_time_space'
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

    def _calculate_houses(
        self, 
        jd: float, 
        lat: float, 
        lon: float, 
        house_system: str
    ) -> Tuple[list, Dict]:
        """Calculate house cusps and angles for Davison moment/location"""
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
            print(f"Warning: Could not calculate houses for Davison chart: {e}")
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
