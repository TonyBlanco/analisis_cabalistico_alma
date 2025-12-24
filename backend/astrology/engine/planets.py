# Planets calculation engine
# This module handles astronomical calculations for planet positions

import math
from decimal import Decimal, getcontext
from typing import Dict, List, Tuple, Optional
from datetime import datetime

# Set decimal precision for astronomical calculations
getcontext().prec = 28

try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False
    print("Warning: Swiss Ephemeris not available. Using mock calculations.")

from ..config.astrology_settings import PLANET_IDS, PLANET_SYMBOLS
from ..domain.planet_position import PlanetPosition


class PlanetsEngine:
    """Engine for calculating planet positions"""

    def __init__(self):
        if not SWISSEPH_AVAILABLE:
            raise ImportError("Swiss Ephemeris (swisseph) is required for astronomical calculations")

        # Set ephemeris path if needed
        # swe.set_ephe_path('/path/to/ephemeris/files')

    def calculate_planet_position(
        self,
        planet_name: str,
        jd: float,
        latitude: float = 0,
        longitude: float = 0,
        altitude: float = 0
    ) -> PlanetPosition:
        """
        Calculate planet position for given Julian Day

        Args:
            planet_name: Name of the planet (sun, moon, mercury, etc.)
            jd: Julian Day number
            latitude: Observer latitude (not used for geocentric calculations)
            longitude: Observer longitude (not used for geocentric calculations)
            altitude: Observer altitude (not used for geocentric calculations)

        Returns:
            PlanetPosition object with calculated data
        """
        if planet_name not in PLANET_IDS:
            raise ValueError(f"Unknown planet: {planet_name}")

        planet_id = PLANET_IDS[planet_name]

        # Calculate planet position
        # flags: SEFLG_SPEED (calculate speed) | SEFLG_SWIEPH (use Swiss Ephemeris)
        flags = swe.FLG_SPEED | swe.FLG_SWIEPH

        try:
            # Get planet position
            result = swe.calc(jd, planet_id, flags)

            # Result may be either a flat sequence [lon, lat, dist, sp_lon, sp_lat, sp_dist]
            # or a tuple where the first element is that sequence and the second a status code (common in some swisseph bindings).
            vals = None
            if result and isinstance(result[0], (list, tuple)) and len(result[0]) >= 6:
                vals = result[0]
            elif result and len(result) >= 6:
                vals = result
            else:
                raise RuntimeError(f"Unexpected Swiss Ephemeris result for {planet_name}: {result}")

            longitude = Decimal(str(vals[0]))  # Longitude in degrees
            latitude = Decimal(str(vals[1]))   # Latitude in degrees
            distance = Decimal(str(vals[2]))   # Distance in AU
            speed_longitude = Decimal(str(vals[3]))  # Speed in longitude
            speed_latitude = Decimal(str(vals[4]))   # Speed in latitude
            speed_distance = Decimal(str(vals[5]))   # Speed in distance

            # Debug print
            print(f"Planet {planet_name} (ID {planet_id}): Long={longitude}, Lat={latitude}")

        except Exception as e:
            # Fallback for testing or if Swiss Ephemeris fails
            print(f"Error calculating {planet_name}: {e}, using mock data")
            longitude, latitude, distance = self._mock_calculation(planet_name, jd)
            speed_longitude = Decimal('0.0')
            speed_latitude = Decimal('0.0')
            speed_distance = Decimal('0.0')

        # Determine zodiac sign
        sign, sign_degree = self._get_zodiac_sign(longitude)

        # Determine retrograde motion
        retrograde = speed_longitude < 0

        # House will be calculated later by HousesEngine
        house = 0  # Placeholder

        return PlanetPosition(
            planet_id=planet_id,
            planet_name=planet_name,
            longitude=longitude,
            latitude=latitude,
            distance=distance,
            speed_longitude=speed_longitude,
            speed_latitude=speed_latitude,
            speed_distance=speed_distance,
            sign=sign,
            sign_degree=sign_degree,
            house=house,
            retrograde=retrograde,
        )

    def _get_zodiac_sign(self, longitude: Decimal) -> Tuple[str, Decimal]:
        """Get zodiac sign and degree within sign"""
        signs = [
            "aries", "taurus", "gemini", "cancer", "leo", "virgo",
            "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
        ]

        sign_index = int(longitude // 30)
        sign = signs[sign_index % 12]
        sign_degree = longitude % 30

        return sign, sign_degree

    def _mock_calculation(self, planet_name: str, jd: float) -> Tuple[Decimal, Decimal, Decimal]:
        """Mock calculation for testing when Swiss Ephemeris is not available"""
        # Simple mock based on planet name and Julian Day
        base_longitude = {
            "sun": 0, "moon": 0, "mercury": 0, "venus": 0, "mars": 0,
            "jupiter": 0, "saturn": 0, "uranus": 0, "neptune": 0, "pluto": 0
        }.get(planet_name, 0)

        # Add some variation based on JD
        longitude = Decimal(str((base_longitude + jd * 0.1) % 360))
        latitude = Decimal('0.0')
        distance = Decimal('1.0')

        return longitude, latitude, distance