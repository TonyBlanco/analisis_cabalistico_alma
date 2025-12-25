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
        house_system: str = "P",
        flags: int = 0,
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
        if house_system not in HOUSE_SYSTEMS and house_system != 'W':
            raise ValueError(f"Unknown house system: {house_system}")

        houses = []

        if SWISSEPH_AVAILABLE:
            try:
                # Calculate house cusps
                # For Whole Sign we still need Ascendant; we can compute it with any system (Placidus).
                hsys_for_swe = (house_system if house_system != 'W' else 'P').encode()

                if flags and hasattr(swe, 'houses_ex'):
                    result = swe.houses_ex(jd, flags, latitude, longitude, hsys_for_swe)
                else:
                    result = swe.houses(jd, latitude, longitude, hsys_for_swe)

                # swe.houses / houses_ex returns (cusps, ascmc)
                cusps_raw = result[0]
                ascmc = result[1] if len(result) > 1 else None

                # Normalize cusps to 12-element list
                if isinstance(cusps_raw, (list, tuple)) and len(cusps_raw) >= 13:
                    cusps = list(cusps_raw[1:13])
                else:
                    cusps = list(cusps_raw)

                # Whole Sign: cusp 1 is 0° of Ascendant sign, then every 30°.
                if house_system == 'W':
                    if not ascmc or len(ascmc) < 1:
                        raise RuntimeError('Ascendant not available for Whole Sign calculation')
                    asc = float(ascmc[0])
                    asc_sign_index = int(asc // 30)
                    cusps = [float(((asc_sign_index + i) * 30) % 360) for i in range(12)]

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
        lon = longitude % Decimal('360')
        if lon < 0:
            lon += Decimal('360')

        signs = [
            "aries", "taurus", "gemini", "cancer", "leo", "virgo",
            "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
        ]

        sign_index = int(lon // 30)
        sign = signs[sign_index % 12]
        sign_degree = lon - (Decimal(sign_index) * Decimal('30'))

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