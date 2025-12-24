# Houses calculation engine
# This module handles house cusp calculations

from decimal import Decimal
from typing import List, Tuple
from datetime import datetime

try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False

from ..config.astrology_settings import HOUSE_SYSTEMS
from ..domain.house_position import HousePosition


class HousesEngine:
    """Engine for calculating house cusps"""

    def __init__(self):
        if not SWISSEPH_AVAILABLE:
            print("Warning: Swiss Ephemeris not available. Using mock calculations.")

    def calculate_house_cusps(
        self,
        jd: float,
        latitude: float,
        longitude: float,
        house_system: str = "P"
    ) -> List[HousePosition]:
        """
        Calculate house cusps for given location and time

        Args:
            jd: Julian Day number
            latitude: Geographic latitude
            longitude: Geographic longitude
            house_system: House system code (P=Placidus, K=Koch, etc.)

        Returns:
            List of HousePosition objects for all 12 houses
        """
        if house_system not in HOUSE_SYSTEMS:
            raise ValueError(f"Unknown house system: {house_system}")

        houses = []

        if SWISSEPH_AVAILABLE:
            try:
                # Calculate house cusps
                result = swe.houses(jd, latitude, longitude, house_system.encode())

                # swe.houses returns (cusps, ascmc) - no error code
                cusps = result[0]  # House cusps array (12 elements)

                for i in range(12):
                    house_num = i + 1
                    longitude = Decimal(str(cusps[i]))

                    # Get zodiac sign for this longitude
                    sign, sign_degree = self._get_zodiac_sign(longitude)

                    house = HousePosition(
                        house_number=house_num,
                        longitude=longitude,
                        sign=sign,
                        sign_degree=sign_degree,
                    )
                    houses.append(house)

            except Exception as e:
                print(f"Swiss Ephemeris house calculation failed: {e}")
                houses = self._mock_house_cusps()
        else:
            houses = self._mock_house_cusps()

        return houses

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

    def _mock_house_cusps(self) -> List[HousePosition]:
        """Mock house cusps for testing"""
        houses = []
        for i in range(12):
            house_num = i + 1
            # Simple mock: each house cusp 30 degrees apart
            longitude = Decimal(str(i * 30))

            sign, sign_degree = self._get_zodiac_sign(longitude)

            house = HousePosition(
                house_number=house_num,
                longitude=longitude,
                sign=sign,
                sign_degree=sign_degree,
            )
            houses.append(house)

        return houses