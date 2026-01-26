# Lunar Return Calculation Engine
# Calculates the exact moment when the Moon returns to its natal position

from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, Optional

try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False

from .ephemeris import EphemerisUtils
from .natal_chart_engine import NatalChartEngine


class LunarReturnEngine:
    """Engine for calculating Lunar Returns"""

    MOON_PLANET_ID = 1  # Swiss Ephemeris ID for Moon

    def __init__(self):
        self.chart_engine = NatalChartEngine()

    def calculate_lunar_return(
        self,
        patient_id: int,
        birth_datetime: datetime,
        latitude: Decimal,
        longitude: Decimal,
        target_month: str,
        timezone: str = "UTC",
        house_system: str = "P",
        zodiac_type: str = "T"
    ) -> Dict:
        """
        Calculate Lunar Return - the exact moment when the Moon returns to its natal position.

        The Moon returns to its natal position approximately every 27.3 days (sidereal month).
        This function performs an iterative search to find the exact moment within the target month.

        Algorithm:
        1. Calculate natal Moon position
        2. Search iteratively through target month (1-hour increments)
        3. Refine result to 1-minute precision
        4. Calculate complete chart for that exact moment

        Args:
            patient_id: Patient identifier
            birth_datetime: Original birth datetime
            latitude: Birth latitude (used for chart calculation)
            longitude: Birth longitude (used for chart calculation)
            target_month: Target month in "YYYY-MM" format (e.g., "2026-01")
            timezone: Timezone string
            house_system: House system for return chart
            zodiac_type: Zodiac type (T=Tropical, S=Sidereal)

        Returns:
            Dict with:
                - return_datetime: ISO datetime of exact lunar return
                - lunar_position: Natal Moon longitude (0-360°)
                - chart: Complete natal chart for return moment
                - precision: Angular precision in degrees
        """
        if not SWISSEPH_AVAILABLE:
            raise RuntimeError("Swiss Ephemeris not available")

        # 1. Calculate natal Moon position
        natal_jd = EphemerisUtils.datetime_to_julian_day(birth_datetime)
        natal_moon_calc = swe.calc_ut(natal_jd, self.MOON_PLANET_ID)  # type: ignore[possibly-unbound]
        natal_moon_longitude = natal_moon_calc[0][0]  # Longitude in degrees

        # 2. Define search range (entire target month)
        year, month = map(int, target_month.split('-'))
        start_date = datetime(year, month, 1, tzinfo=birth_datetime.tzinfo or None)

        if month == 12:
            end_date = datetime(year + 1, 1, 1, tzinfo=start_date.tzinfo)
        else:
            end_date = datetime(year, month + 1, 1, tzinfo=start_date.tzinfo)

        # 3. Coarse search (1-hour increments)
        closest_datetime, closest_diff = self._coarse_search(
            natal_moon_longitude,
            start_date,
            end_date
        )

        if closest_datetime is None:
            raise ValueError(f"No lunar return found in {target_month}")

        # 4. Refine to 1-minute precision
        refined_datetime = self._refine_search(
            natal_moon_longitude,
            closest_datetime
        )

        # 5. Calculate return Moon position for verification
        return_jd = EphemerisUtils.datetime_to_julian_day(refined_datetime)
        return_moon_calc = swe.calc_ut(return_jd, self.MOON_PLANET_ID)  # type: ignore[possibly-unbound]
        return_moon_longitude = return_moon_calc[0][0]

        # Calculate final precision
        final_diff = self._angular_difference(return_moon_longitude, natal_moon_longitude)

        # 6. Calculate complete chart for return moment
        return_chart = self.chart_engine.calculate_natal_chart(
            patient_id=patient_id,
            birth_datetime=refined_datetime,
            latitude=latitude,
            longitude=longitude,
            timezone=timezone,
            house_system=house_system,
            zodiac_type=zodiac_type
        )

        # Serialize chart to dictionary (NatalChart object is not JSON serializable)
        chart_dict = {
            'planets': return_chart.planets,
            'houses': return_chart.houses,
            'aspects': return_chart.aspects,
        }

        return {
            'return_datetime': refined_datetime.isoformat(),
            'lunar_position': natal_moon_longitude,
            'return_lunar_position': return_moon_longitude,
            'chart': chart_dict,
            'precision': final_diff,
            'target_month': target_month
        }

    def _coarse_search(
        self,
        target_moon_longitude: float,
        start_date: datetime,
        end_date: datetime
    ) -> tuple[Optional[datetime], float]:
        """
        Coarse search with 1-hour increments.

        Returns:
            (closest_datetime, closest_angular_difference)
        """
        if not SWISSEPH_AVAILABLE:
            raise RuntimeError("Swiss Ephemeris not available")
            
        current_date = start_date
        closest_diff = 360.0
        closest_datetime = None

        while current_date < end_date:
            jd = EphemerisUtils.datetime_to_julian_day(current_date)
            moon_calc = swe.calc_ut(jd, self.MOON_PLANET_ID)  # type: ignore[possibly-unbound]
            moon_longitude = moon_calc[0][0]

            diff = self._angular_difference(moon_longitude, target_moon_longitude)

            if diff < closest_diff:
                closest_diff = diff
                closest_datetime = current_date

            # Increment by 1 hour
            current_date += timedelta(hours=1)

        return closest_datetime, closest_diff

    def _refine_search(
        self,
        target_moon_longitude: float,
        approx_datetime: datetime
    ) -> datetime:
        """
        Refine search with 1-minute increments around approximate datetime.

        Searches ±1 hour from approximate datetime with 1-minute precision.

        Returns:
            Refined datetime with ~1-minute precision
        """
        if not SWISSEPH_AVAILABLE:
            raise RuntimeError("Swiss Ephemeris not available")
            
        start = approx_datetime - timedelta(hours=1)
        end = approx_datetime + timedelta(hours=1)
        current = start

        closest_diff = 360.0
        closest_dt = approx_datetime

        while current < end:
            jd = EphemerisUtils.datetime_to_julian_day(current)
            moon_calc = swe.calc_ut(jd, self.MOON_PLANET_ID)  # type: ignore[possibly-unbound]
            moon_longitude = moon_calc[0][0]

            diff = self._angular_difference(moon_longitude, target_moon_longitude)

            if diff < closest_diff:
                closest_diff = diff
                closest_dt = current

            # Increment by 1 minute
            current += timedelta(minutes=1)

        return closest_dt

    @staticmethod
    def _angular_difference(angle1: float, angle2: float) -> float:
        """
        Calculate smallest angular difference between two angles (0-360°).

        Handles wrap-around at 0°/360°.

        Returns:
            Angular difference in degrees (0-180)
        """
        diff = abs(angle1 - angle2)
        if diff > 180:
            diff = 360 - diff
        return diff
