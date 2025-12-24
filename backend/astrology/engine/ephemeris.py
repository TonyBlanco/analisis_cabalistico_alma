# Ephemeris utilities
# This module handles date/time conversions and astronomical utilities

from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import Tuple, Optional

try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False


class EphemerisUtils:
    """Utilities for astronomical calculations"""

    @staticmethod
    def datetime_to_julian_day(dt: datetime) -> float:
        """
        Convert datetime to Julian Day number

        Args:
            dt: DateTime object (should be UTC)

        Returns:
            Julian Day number as float
        """
        if dt.tzinfo is None:
            # Assume UTC if no timezone
            dt = dt.replace(tzinfo=timezone.utc)

        # Convert to UTC
        dt_utc = dt.astimezone(timezone.utc)

        if SWISSEPH_AVAILABLE:
            # Use Swiss Ephemeris for accurate conversion
            jd = swe.julday(
                dt_utc.year,
                dt_utc.month,
                dt_utc.day,
                dt_utc.hour + dt_utc.minute/60 + dt_utc.second/3600
            )
        else:
            # Fallback calculation
            jd = EphemerisUtils._datetime_to_jd_fallback(dt_utc)

        return jd

    @staticmethod
    def _datetime_to_jd_fallback(dt: datetime) -> float:
        """Fallback JD calculation when Swiss Ephemeris not available"""
        # This is a simplified calculation
        # For production, Swiss Ephemeris should be used

        year = dt.year
        month = dt.month
        day = dt.day
        hour = dt.hour + dt.minute/60 + dt.second/3600

        if month <= 2:
            year -= 1
            month += 12

        a = year // 100
        b = 2 - a + a // 4

        jd = (365.25 * (year + 4716)) + (30.6001 * (month + 1)) + day + b - 1524
        jd += hour / 24

        return jd

    @staticmethod
    def parse_timezone_offset(timezone_str: str) -> timedelta:
        """
        Parse timezone string like '+02:00', '-05:30', 'UTC', etc.

        Args:
            timezone_str: Timezone string

        Returns:
            Timedelta representing the offset
        """
        if timezone_str.upper() == 'UTC':
            return timedelta(0)

        # Handle formats like +02:00, -05:30
        if len(timezone_str) >= 6 and timezone_str[0] in ['+', '-']:
            try:
                sign = 1 if timezone_str[0] == '+' else -1
                hours = int(timezone_str[1:3])
                minutes = int(timezone_str[4:6])
                return timedelta(hours=sign * hours, minutes=sign * minutes)
            except ValueError:
                pass

        # Default to UTC if parsing fails
        return timedelta(0)

    @staticmethod
    def normalize_coordinates(latitude: float, longitude: float) -> Tuple[float, float]:
        """
        Normalize latitude and longitude to valid ranges

        Args:
            latitude: Latitude in degrees (-90 to 90)
            longitude: Longitude in degrees (-180 to 180 or 0 to 360)

        Returns:
            Tuple of (normalized_latitude, normalized_longitude)
        """
        # Normalize latitude
        lat = latitude
        while lat > 90:
            lat -= 180
        while lat < -90:
            lat += 180

        # Normalize longitude to -180 to 180
        lon = longitude
        while lon > 180:
            lon -= 360
        while lon < -180:
            lon += 360

        return lat, lon

    @staticmethod
    def format_angle(angle: Decimal, decimal_places: int = 2) -> str:
        """
        Format an angle in degrees with proper formatting

        Args:
            angle: Angle in degrees
            decimal_places: Number of decimal places

        Returns:
            Formatted string like "15° 30' 45\""
        """
        degrees = int(angle)
        minutes_decimal = (float(angle) - degrees) * 60
        minutes = int(minutes_decimal)
        seconds = (minutes_decimal - minutes) * 60

        if decimal_places == 0:
            return f"{degrees}°"
        elif decimal_places == 1:
            return f"{degrees}° {minutes}'"
        else:
            return f"{degrees}° {minutes}' {seconds:.{decimal_places-2}f}\""