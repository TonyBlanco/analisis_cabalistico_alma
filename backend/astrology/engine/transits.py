# Transits Engine
# This module implements planetary transit calculations using Swiss Ephemeris
# Transits show current planetary positions relative to the natal chart

"""
TRANSITS ENGINE — Motor de Tránsitos Planetarios

Los tránsitos son las posiciones planetarias actuales comparadas con
las posiciones natales. Son la técnica predictiva más fundamental
en astrología.

Técnicas implementadas:
1. Posiciones de tránsito para fecha objetivo
2. Aspectos tránsito-natal (qué tránsitos aspectan qué planetas natales)
3. Ingreso de tránsitos en casas natales
4. Velocidad y retrogradación de tránsitos

Orbes de tránsito (más estrictos que natales):
- Conjunción/Oposición: 5°
- Trígono/Cuadratura: 4°
- Sextil: 3°
- Quincuncio: 2°
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
    print("Warning: Swiss Ephemeris not available. Transit calculations disabled.")

from ..config.astrology_settings import PLANET_IDS, PLANET_SYMBOLS
from .ephemeris import EphemerisUtils


# Transit-specific orbs (tighter than natal)
TRANSIT_ORBS = {
    "conjunction": 5,
    "opposition": 5,
    "trine": 4,
    "square": 4,
    "sextile": 3,
    "quincunx": 2,
}

# Major aspects for transits
TRANSIT_ASPECTS = {
    0: "conjunction",
    60: "sextile",
    90: "square",
    120: "trine",
    150: "quincunx",
    180: "opposition",
}


class TransitsEngine:
    """
    Engine for calculating planetary transits
    
    Transits show where planets are NOW (or at any date) compared to 
    where they were at birth. This is the most common predictive technique.
    
    Key outputs:
    - Current positions of all planets
    - Which transiting planets aspect which natal planets
    - Which houses the transiting planets are activating
    """

    def __init__(self):
        if not SWISSEPH_AVAILABLE:
            raise ImportError("Swiss Ephemeris (swisseph) is required for transit calculations")

    def calculate_transits(
        self,
        natal_planets: List[Dict],
        natal_houses: List[Dict],
        target_date: str,
        include_outer_only: bool = False
    ) -> Dict:
        """
        Calculate transits for a given date against natal chart
        
        Args:
            natal_planets: List of natal planet positions (from NatalChart)
                Each dict must have: planet_name, longitude
            natal_houses: List of natal house cusps (from NatalChart)
                Each dict must have: number (1-12), cusp_longitude
            target_date: Target date as 'YYYY-MM-DD' string
            include_outer_only: If True, only calculate outer planet transits
                               (Jupiter, Saturn, Uranus, Neptune, Pluto)
        
        Returns:
            Dictionary with:
                - target_date: str
                - transit_planets: Dict of current planet positions
                - transit_aspects: List of aspects between transits and natal
                - house_activations: Dict showing which houses are activated
                - method: str
        """
        if not SWISSEPH_AVAILABLE:
            raise ImportError("Swiss Ephemeris not available")

        # Parse target date
        target_dt = datetime.strptime(target_date, '%Y-%m-%d')
        target_jd = swe.julday(
            target_dt.year,
            target_dt.month,
            target_dt.day,
            12.0  # Noon for transit calculations
        )

        # Determine which planets to calculate
        if include_outer_only:
            planets_to_calc = ["jupiter", "saturn", "uranus", "neptune", "pluto"]
        else:
            planets_to_calc = list(PLANET_IDS.keys())
            # Remove nodes for transit calculations (they're calculated differently)
            planets_to_calc = [p for p in planets_to_calc if 'node' not in p]

        # 1. Calculate current positions of transiting planets
        transit_planets = {}
        for planet_name in planets_to_calc:
            planet_data = self._calculate_transit_position(planet_name, target_jd)
            if planet_data:
                transit_planets[planet_name] = planet_data

        # 2. Calculate aspects between transits and natal planets
        transit_aspects = self._calculate_transit_aspects(
            transit_planets, natal_planets
        )

        # 3. Determine which houses are being activated by transits
        house_activations = self._calculate_house_activations(
            transit_planets, natal_houses
        )

        # 4. Identify significant transits (outer planets to personal planets)
        significant_transits = self._identify_significant_transits(transit_aspects)

        return {
            'target_date': target_date,
            'transit_planets': transit_planets,
            'transit_aspects': transit_aspects,
            'house_activations': house_activations,
            'significant_transits': significant_transits,
            'method': 'planetary_transits'
        }

    def _calculate_transit_position(
        self,
        planet_name: str,
        jd: float
    ) -> Optional[Dict]:
        """
        Calculate position of a single transiting planet
        
        Returns dict with longitude, sign, degree, retrograde status
        """
        if planet_name not in PLANET_IDS:
            return None

        planet_id = PLANET_IDS[planet_name]

        try:
            # Calculate with speed flag to detect retrograde
            result = swe.calc_ut(jd, planet_id, swe.FLG_SPEED)
            
            # Extract values
            if isinstance(result[0], (list, tuple)):
                longitude = result[0][0]
                speed = result[0][3] if len(result[0]) > 3 else 0
            else:
                longitude = result[0]
                speed = result[3] if len(result) > 3 else 0

            # Normalize longitude
            longitude = float(longitude) % 360

            # Determine sign and degree
            sign, sign_degree = self._get_zodiac_sign(longitude)

            # Retrograde if speed is negative
            retrograde = float(speed) < 0

            return {
                'planet_name': planet_name,
                'longitude': round(longitude, 4),
                'sign': sign,
                'sign_degree': round(sign_degree, 2),
                'retrograde': retrograde,
                'daily_motion': round(float(speed), 4),
                'symbol': PLANET_SYMBOLS.get(planet_name, '?')
            }

        except Exception as e:
            print(f"Error calculating transit for {planet_name}: {e}")
            return None

    def _calculate_transit_aspects(
        self,
        transit_planets: Dict,
        natal_planets: List[Dict]
    ) -> List[Dict]:
        """
        Calculate aspects between transiting planets and natal planets
        
        Returns list of aspect dictionaries
        """
        aspects = []

        for t_name, t_data in transit_planets.items():
            t_lon = t_data['longitude']

            for natal in natal_planets:
                # Handle both dict and object formats
                if isinstance(natal, dict):
                    n_name = natal.get('planet_name', natal.get('name', ''))
                    n_lon = natal.get('longitude', 0)
                else:
                    n_name = getattr(natal, 'planet_name', '')
                    n_lon = float(getattr(natal, 'longitude', 0))

                # Check each possible aspect
                for aspect_angle, aspect_type in TRANSIT_ASPECTS.items():
                    orb_allowed = TRANSIT_ORBS.get(aspect_type, 5)
                    
                    # Calculate angular separation
                    diff = abs(t_lon - n_lon)
                    if diff > 180:
                        diff = 360 - diff

                    # Check if within orb
                    actual_orb = abs(diff - aspect_angle)
                    
                    if actual_orb <= orb_allowed:
                        # Determine if applying or separating
                        applying = t_data.get('daily_motion', 0) > 0 and t_lon < n_lon

                        aspects.append({
                            'transit_planet': t_name,
                            'transit_longitude': t_lon,
                            'transit_retrograde': t_data.get('retrograde', False),
                            'natal_planet': n_name,
                            'natal_longitude': n_lon,
                            'aspect_type': aspect_type,
                            'aspect_angle': aspect_angle,
                            'orb': round(actual_orb, 2),
                            'applying': applying,
                            'exactness': round(100 - (actual_orb / orb_allowed * 100), 1)
                        })

        # Sort by exactness (most exact first)
        aspects.sort(key=lambda x: x['exactness'], reverse=True)

        return aspects

    def _calculate_house_activations(
        self,
        transit_planets: Dict,
        natal_houses: List[Dict]
    ) -> Dict:
        """
        Determine which natal houses are being activated by transits
        
        Returns dict mapping house number to list of transiting planets in it
        """
        # Build house boundaries
        house_cusps = []
        for h in natal_houses:
            if isinstance(h, dict):
                house_cusps.append({
                    'number': h.get('number', 0),
                    'cusp': h.get('cusp_longitude', h.get('cusp', 0))
                })
            else:
                house_cusps.append({
                    'number': getattr(h, 'house_number', 0),
                    'cusp': float(getattr(h, 'cusp_longitude', 0))
                })

        # Sort by house number
        house_cusps.sort(key=lambda x: x['number'])

        # Initialize activations
        activations = {i: [] for i in range(1, 13)}

        # Place each transit planet in its house
        for planet_name, planet_data in transit_planets.items():
            planet_lon = planet_data['longitude']
            house = self._find_house_for_longitude(planet_lon, house_cusps)
            
            if house:
                activations[house].append({
                    'planet': planet_name,
                    'longitude': planet_lon,
                    'sign': planet_data['sign'],
                    'retrograde': planet_data.get('retrograde', False)
                })

        return activations

    def _find_house_for_longitude(
        self,
        longitude: float,
        house_cusps: List[Dict]
    ) -> Optional[int]:
        """
        Determine which house a longitude falls in
        """
        if not house_cusps:
            return None

        for i, cusp in enumerate(house_cusps):
            next_i = (i + 1) % 12
            cusp_start = cusp['cusp']
            cusp_end = house_cusps[next_i]['cusp']

            # Handle wrap-around at 0°
            if cusp_end < cusp_start:
                # Cusp spans 0°
                if longitude >= cusp_start or longitude < cusp_end:
                    return cusp['number']
            else:
                if cusp_start <= longitude < cusp_end:
                    return cusp['number']

        return 1  # Default to first house

    def _identify_significant_transits(
        self,
        transit_aspects: List[Dict]
    ) -> List[Dict]:
        """
        Identify the most significant transits
        
        Significant = outer planets (Jupiter+) aspecting personal planets (Sun-Mars)
        """
        outer_planets = {'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'}
        personal_planets = {'sun', 'moon', 'mercury', 'venus', 'mars'}
        
        significant = []
        for aspect in transit_aspects:
            t_planet = aspect['transit_planet'].lower()
            n_planet = aspect['natal_planet'].lower()
            
            # Outer transiting personal = most significant
            if t_planet in outer_planets and n_planet in personal_planets:
                aspect['significance'] = 'high'
                significant.append(aspect)
            # Saturn transiting anything = notable
            elif t_planet == 'saturn':
                aspect['significance'] = 'medium'
                significant.append(aspect)
            # Exact aspects (orb < 1°) = notable
            elif aspect['orb'] < 1.0:
                aspect['significance'] = 'exact'
                significant.append(aspect)

        return significant

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

    def get_transit_summary(
        self,
        natal_planets: List[Dict],
        natal_houses: List[Dict],
        target_date: str
    ) -> Dict:
        """
        Get a human-readable summary of current transits
        
        Returns structured summary for AI interpretation
        """
        transits = self.calculate_transits(natal_planets, natal_houses, target_date)
        
        # Build summary
        summary = {
            'date': target_date,
            'outer_planet_positions': {},
            'key_aspects': [],
            'activated_houses': []
        }

        # Outer planet positions (most important for transits)
        outer = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
        for planet in outer:
            if planet in transits['transit_planets']:
                p_data = transits['transit_planets'][planet]
                summary['outer_planet_positions'][planet] = {
                    'sign': p_data['sign'],
                    'degree': p_data['sign_degree'],
                    'retrograde': p_data['retrograde']
                }

        # Top 5 most exact aspects
        summary['key_aspects'] = transits['transit_aspects'][:5]

        # Houses with outer planets
        for house_num, planets in transits['house_activations'].items():
            outer_in_house = [p for p in planets if p['planet'] in outer]
            if outer_in_house:
                summary['activated_houses'].append({
                    'house': house_num,
                    'planets': outer_in_house
                })

        return summary
