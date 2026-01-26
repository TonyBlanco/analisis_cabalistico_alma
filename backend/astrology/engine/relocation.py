# Relocation Engine
# This module implements Astrological Relocation (Astro-cartography) calculations

"""
RELOCATION ENGINE — Motor de Relocación Astrológica

La carta de relocación mantiene los planetas natales exactamente donde están
pero recalcula las casas para una nueva ubicación geográfica.

Concepto:
- Planetas: No cambian (están en la eclíptica, no en la Tierra)
- Casas: Cambian completamente (dependen de latitud/longitud del lugar)
- ASC/MC: Nuevos puntos cardinales para la nueva ubicación

Uso principal:
- Astrocartografía: ¿Cómo sería mi vida si viviera en París/NYC/Tokyo?
- Líneas de poder: Encontrar ubicaciones óptimas
- Mudanzas: Evaluar impacto de relocación

Ejemplo:
- Natal en Madrid: Sol en Casa 10 (éxito público)
- Relocación a Sydney: Sol en Casa 3 (comunicación, viajes cortos)
  → En Sydney, la energía solar se expresa más en comunicación
"""

from datetime import datetime
from decimal import Decimal
from typing import Dict, List, Optional, Tuple

try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False
    print("Warning: Swiss Ephemeris not available. Relocation calculations disabled.")


# House systems supported
HOUSE_SYSTEMS = {
    'P': 'Placidus',
    'K': 'Koch',
    'O': 'Porphyrius',
    'R': 'Regiomontanus',
    'C': 'Campanus',
    'E': 'Equal (ASC)',
    'W': 'Whole Sign',
    'B': 'Alcabitius',
    'M': 'Morinus',
    'T': 'Topocentric',
}


class RelocationEngine:
    """
    Engine for calculating Relocated Charts
    
    A relocated chart keeps the natal planets exactly where they are
    but recalculates houses based on a new geographic location.
    
    This shows how the natal energies would be expressed if the person
    had been born at the same moment but in a different place.
    
    Features:
    - New house cusps for relocated position
    - New ASC/MC for the location
    - House position changes for all planets
    - Comparison with natal house positions
    - Power line detection (planets on angles)
    """

    def __init__(self):
        if SWISSEPH_AVAILABLE:
            swe.set_ephe_path(None)

    def calculate_relocation(
        self,
        natal_planets: List[Dict],
        birth_datetime: datetime,
        natal_latitude: float,
        natal_longitude: float,
        relocation_latitude: float,
        relocation_longitude: float,
        location_name: str = "Unknown",
        house_system: str = 'P'
    ) -> Dict:
        """
        Calculate relocated chart for a new location
        
        Args:
            natal_planets: List of natal planet positions
            birth_datetime: Original birth datetime
            natal_latitude: Birth location latitude
            natal_longitude: Birth location longitude
            relocation_latitude: New location latitude
            relocation_longitude: New location longitude
            location_name: Name of new location (for display)
            house_system: House system to use (default Placidus)
        
        Returns:
            Dictionary with:
                - relocated_houses: New house cusps
                - relocated_asc: New Ascendant
                - relocated_mc: New Midheaven
                - planet_house_changes: How planets change houses
                - power_lines: Planets on angles
        """
        if not SWISSEPH_AVAILABLE:
            raise ImportError("Swiss Ephemeris required for relocation calculations")

        # Calculate Julian Day
        jd = swe.julday(
            birth_datetime.year,
            birth_datetime.month,
            birth_datetime.day,
            birth_datetime.hour + birth_datetime.minute / 60.0 + birth_datetime.second / 3600.0
        )

        # Calculate natal houses (for comparison)
        natal_houses, natal_ascmc = self._calculate_houses(
            jd, natal_latitude, natal_longitude, house_system
        )

        # Calculate relocated houses
        relocated_houses, relocated_ascmc = self._calculate_houses(
            jd, relocation_latitude, relocation_longitude, house_system
        )

        # Prepare house positions
        natal_house_cusps = []
        relocated_house_cusps = []

        for i in range(12):
            natal_cusp = natal_houses[i]
            reloc_cusp = relocated_houses[i]

            natal_sign, natal_deg = self._get_zodiac_sign(natal_cusp)
            reloc_sign, reloc_deg = self._get_zodiac_sign(reloc_cusp)

            natal_house_cusps.append({
                'house': i + 1,
                'cusp_longitude': round(natal_cusp, 4),
                'sign': natal_sign,
                'sign_degree': round(natal_deg, 2)
            })

            relocated_house_cusps.append({
                'house': i + 1,
                'cusp_longitude': round(reloc_cusp, 4),
                'sign': reloc_sign,
                'sign_degree': round(reloc_deg, 2)
            })

        # Process planet positions and house changes
        planet_house_changes = []
        power_lines = []

        for planet in natal_planets:
            p_name = planet.get('planet_name', planet.get('name', ''))
            p_lon = float(planet.get('longitude', 0))

            # Find natal house
            natal_house = self._find_house(p_lon, natal_houses)

            # Find relocated house
            relocated_house = self._find_house(p_lon, relocated_houses)

            # House change info
            house_changed = natal_house != relocated_house
            planet_house_changes.append({
                'planet': p_name,
                'longitude': p_lon,
                'natal_house': natal_house,
                'relocated_house': relocated_house,
                'house_changed': house_changed,
                'change_description': self._describe_house_change(natal_house, relocated_house) if house_changed else "No change"
            })

            # Check for power lines (planet on angles)
            angle_info = self._check_angular(p_lon, relocated_ascmc, p_name)
            if angle_info:
                power_lines.append(angle_info)

        # Get ASC/MC signs
        natal_asc_sign, natal_asc_deg = self._get_zodiac_sign(natal_ascmc[0])
        reloc_asc_sign, reloc_asc_deg = self._get_zodiac_sign(relocated_ascmc[0])
        natal_mc_sign, natal_mc_deg = self._get_zodiac_sign(natal_ascmc[1])
        reloc_mc_sign, reloc_mc_deg = self._get_zodiac_sign(relocated_ascmc[1])

        # Generate interpretation
        interpretation = self._generate_interpretation(
            planet_house_changes, power_lines, location_name
        )

        return {
            'birth_datetime': birth_datetime.isoformat(),
            'natal_location': {
                'latitude': natal_latitude,
                'longitude': natal_longitude
            },
            'relocation': {
                'name': location_name,
                'latitude': relocation_latitude,
                'longitude': relocation_longitude
            },
            'house_system': HOUSE_SYSTEMS.get(house_system, house_system),
            'natal_ascendant': {
                'longitude': round(natal_ascmc[0], 4),
                'sign': natal_asc_sign,
                'degree': round(natal_asc_deg, 2)
            },
            'relocated_ascendant': {
                'longitude': round(relocated_ascmc[0], 4),
                'sign': reloc_asc_sign,
                'degree': round(reloc_asc_deg, 2)
            },
            'natal_midheaven': {
                'longitude': round(natal_ascmc[1], 4),
                'sign': natal_mc_sign,
                'degree': round(natal_mc_deg, 2)
            },
            'relocated_midheaven': {
                'longitude': round(relocated_ascmc[1], 4),
                'sign': reloc_mc_sign,
                'degree': round(reloc_mc_deg, 2)
            },
            'natal_houses': natal_house_cusps,
            'relocated_houses': relocated_house_cusps,
            'planet_house_changes': planet_house_changes,
            'planets_that_changed_house': [
                p for p in planet_house_changes if p['house_changed']
            ],
            'power_lines': power_lines,
            'interpretation': interpretation,
            'method': 'relocation_swiss_ephemeris'
        }

    def calculate_multiple_locations(
        self,
        natal_planets: List[Dict],
        birth_datetime: datetime,
        natal_latitude: float,
        natal_longitude: float,
        locations: List[Dict],
        house_system: str = 'P'
    ) -> Dict:
        """
        Calculate relocation for multiple locations at once
        
        Args:
            natal_planets: Natal planet positions
            birth_datetime: Birth datetime
            natal_latitude: Birth latitude
            natal_longitude: Birth longitude
            locations: List of dicts with 'name', 'latitude', 'longitude'
            house_system: House system
        
        Returns:
            Dictionary with results for each location
        """
        results = {}

        for loc in locations:
            loc_name = loc.get('name', 'Unknown')
            loc_lat = loc.get('latitude')
            loc_lon = loc.get('longitude')

            if loc_lat is not None and loc_lon is not None:
                try:
                    result = self.calculate_relocation(
                        natal_planets=natal_planets,
                        birth_datetime=birth_datetime,
                        natal_latitude=natal_latitude,
                        natal_longitude=natal_longitude,
                        relocation_latitude=loc_lat,
                        relocation_longitude=loc_lon,
                        location_name=loc_name,
                        house_system=house_system
                    )
                    results[loc_name] = {
                        'status': 'success',
                        'data': result
                    }
                except Exception as e:
                    results[loc_name] = {
                        'status': 'error',
                        'error': str(e)
                    }
            else:
                results[loc_name] = {
                    'status': 'error',
                    'error': 'Missing latitude or longitude'
                }

        # Find best locations based on power lines
        best_locations = self._rank_locations(results)

        return {
            'locations': results,
            'location_count': len(locations),
            'best_locations': best_locations
        }

    def find_power_line_zones(
        self,
        natal_planets: List[Dict],
        birth_datetime: datetime,
        natal_latitude: float,
        natal_longitude: float,
        planet: str,
        angle: str = 'ASC',
        latitude_range: Tuple[float, float] = (-60, 70),
        longitude_range: Tuple[float, float] = (-180, 180),
        grid_step: float = 5.0
    ) -> Dict:
        """
        Find geographic zones where a planet is on a specific angle
        
        This is useful for astrocartography line plotting.
        
        Args:
            natal_planets: Natal planets
            birth_datetime: Birth datetime
            natal_latitude: Natal latitude
            natal_longitude: Natal longitude
            planet: Planet name to track
            angle: 'ASC', 'MC', 'DSC', or 'IC'
            latitude_range: Latitude range to search
            longitude_range: Longitude range to search
            grid_step: Grid resolution in degrees
        
        Returns:
            Dictionary with locations where planet is angular
        """
        if not SWISSEPH_AVAILABLE:
            raise ImportError("Swiss Ephemeris required")

        # Find planet longitude
        planet_lon = None
        for p in natal_planets:
            if p.get('planet_name', p.get('name', '')).lower() == planet.lower():
                planet_lon = float(p.get('longitude', 0))
                break

        if planet_lon is None:
            raise ValueError(f"Planet {planet} not found in natal planets")

        # Calculate Julian Day
        jd = swe.julday(
            birth_datetime.year,
            birth_datetime.month,
            birth_datetime.day,
            birth_datetime.hour + birth_datetime.minute / 60.0 + birth_datetime.second / 3600.0
        )

        # Search grid for angular positions
        angular_zones = []
        orb = 3.0  # 3° orb for power lines

        lat = latitude_range[0]
        while lat <= latitude_range[1]:
            lon = longitude_range[0]
            while lon <= longitude_range[1]:
                try:
                    _, ascmc = self._calculate_houses(jd, lat, lon, 'P')

                    # Get target angle longitude
                    if angle.upper() == 'ASC':
                        target_lon = ascmc[0]
                    elif angle.upper() == 'MC':
                        target_lon = ascmc[1]
                    elif angle.upper() == 'DSC':
                        target_lon = (ascmc[0] + 180) % 360
                    elif angle.upper() == 'IC':
                        target_lon = (ascmc[1] + 180) % 360
                    else:
                        target_lon = ascmc[0]

                    # Check if planet is on angle
                    diff = abs(planet_lon - target_lon)
                    if diff > 180:
                        diff = 360 - diff

                    if diff <= orb:
                        angular_zones.append({
                            'latitude': lat,
                            'longitude': lon,
                            'orb': round(diff, 2),
                            'angle': angle.upper(),
                            'angle_longitude': round(target_lon, 2)
                        })
                except:
                    pass  # Some extreme latitudes may fail

                lon += grid_step
            lat += grid_step

        return {
            'planet': planet,
            'planet_longitude': planet_lon,
            'angle': angle.upper(),
            'orb_used': orb,
            'grid_step': grid_step,
            'zones_found': len(angular_zones),
            'angular_zones': angular_zones
        }

    def _calculate_houses(
        self,
        jd: float,
        latitude: float,
        longitude: float,
        house_system: str
    ) -> Tuple[List[float], List[float]]:
        """Calculate houses for a location"""
        houses, ascmc = swe.houses(jd, latitude, longitude, house_system.encode())
        return list(houses), list(ascmc)

    def _find_house(self, longitude: float, house_cusps: List[float]) -> int:
        """Find which house a longitude falls in"""
        lon = longitude % 360

        for i in range(12):
            cusp1 = house_cusps[i]
            cusp2 = house_cusps[(i + 1) % 12]

            # Handle wrap around
            if cusp2 < cusp1:
                if lon >= cusp1 or lon < cusp2:
                    return i + 1
            else:
                if cusp1 <= lon < cusp2:
                    return i + 1

        return 1  # Default to house 1 if not found

    def _check_angular(
        self,
        planet_lon: float,
        ascmc: List[float],
        planet_name: str,
        orb: float = 5.0
    ) -> Optional[Dict]:
        """Check if planet is on an angle"""
        asc = ascmc[0]
        mc = ascmc[1]
        dsc = (asc + 180) % 360
        ic = (mc + 180) % 360

        angles = [
            ('ASC', asc, 'Self-expression, personality, appearance'),
            ('MC', mc, 'Career, public image, life direction'),
            ('DSC', dsc, 'Relationships, partnerships, others'),
            ('IC', ic, 'Home, roots, inner foundation')
        ]

        for angle_name, angle_lon, meaning in angles:
            diff = abs(planet_lon - angle_lon)
            if diff > 180:
                diff = 360 - diff

            if diff <= orb:
                return {
                    'planet': planet_name,
                    'angle': angle_name,
                    'orb': round(diff, 2),
                    'meaning': f"{planet_name} on {angle_name}: {meaning}",
                    'power': 'very_strong' if diff <= 2 else 'strong'
                }

        return None

    def _describe_house_change(self, natal_house: int, relocated_house: int) -> str:
        """Generate description of house change"""
        house_themes = {
            1: "identity/self",
            2: "resources/values",
            3: "communication/learning",
            4: "home/family",
            5: "creativity/romance",
            6: "health/service",
            7: "partnerships",
            8: "transformation/shared resources",
            9: "philosophy/travel",
            10: "career/public life",
            11: "friends/hopes",
            12: "spirituality/hidden matters"
        }

        natal_theme = house_themes.get(natal_house, f"house {natal_house}")
        reloc_theme = house_themes.get(relocated_house, f"house {relocated_house}")

        return f"From {natal_theme} (H{natal_house}) to {reloc_theme} (H{relocated_house})"

    def _generate_interpretation(
        self,
        planet_house_changes: List[Dict],
        power_lines: List[Dict],
        location_name: str
    ) -> Dict:
        """Generate interpretation of relocation"""
        interp = {
            'summary': '',
            'key_changes': [],
            'power_line_effects': [],
            'recommendation': ''
        }

        # Count changes
        changed_count = sum(1 for p in planet_house_changes if p['house_changed'])

        if changed_count == 0:
            interp['summary'] = f"Relocation to {location_name} shows minimal house changes."
        elif changed_count <= 3:
            interp['summary'] = f"Relocation to {location_name} shows moderate changes ({changed_count} planets change house)."
        else:
            interp['summary'] = f"Relocation to {location_name} shows significant shifts ({changed_count} planets change house)."

        # Key changes for important planets
        for change in planet_house_changes:
            if change['house_changed'] and change['planet'].lower() in ['sun', 'moon', 'mercury', 'venus', 'mars']:
                interp['key_changes'].append({
                    'planet': change['planet'],
                    'change': change['change_description']
                })

        # Power line effects
        for pl in power_lines:
            interp['power_line_effects'].append(pl['meaning'])

        # Recommendation
        if power_lines:
            interp['recommendation'] = f"This location has {len(power_lines)} planet(s) on angles - significant life theme activation expected."
        else:
            interp['recommendation'] = "No planets on angles - subtle location influence."

        return interp

    def _rank_locations(self, results: Dict) -> List[Dict]:
        """Rank locations by number of power lines"""
        rankings = []

        for loc_name, loc_data in results.items():
            if loc_data.get('status') == 'success':
                power_lines = loc_data['data'].get('power_lines', [])
                rankings.append({
                    'location': loc_name,
                    'power_line_count': len(power_lines),
                    'power_lines': [pl['planet'] + ' on ' + pl['angle'] for pl in power_lines]
                })

        rankings.sort(key=lambda x: x['power_line_count'], reverse=True)
        return rankings[:5]  # Top 5

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
