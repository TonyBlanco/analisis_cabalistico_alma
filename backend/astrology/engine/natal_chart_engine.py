# Natal Chart Engine
# Main engine that coordinates all astronomical calculations

from datetime import datetime
from decimal import Decimal
from typing import List

from .planets import PlanetsEngine
from .houses import HousesEngine
from .aspects import AspectsEngine
from .ephemeris import EphemerisUtils
from ..domain.chart import NatalChart
from ..domain.planet_position import PlanetPosition
from ..domain.house_position import HousePosition
from ..config.astrology_settings import DEFAULT_HOUSE_SYSTEM, DEFAULT_ZODIAC_TYPE


class NatalChartEngine:
    """Main engine for calculating complete natal charts"""

    def __init__(self):
        self.planets_engine = PlanetsEngine()
        self.houses_engine = HousesEngine()
        self.aspects_engine = AspectsEngine()

    def calculate_natal_chart(
        self,
        patient_id: int,
        birth_datetime: datetime,
        latitude: Decimal,
        longitude: Decimal,
        timezone: str = "UTC",
        house_system: str = DEFAULT_HOUSE_SYSTEM,
        zodiac_type: str = DEFAULT_ZODIAC_TYPE,
        include_minor_aspects: bool = False
    ) -> NatalChart:
        """
        Calculate complete natal chart

        Args:
            patient_id: Patient identifier
            birth_datetime: Birth date and time
            latitude: Birth latitude
            longitude: Birth longitude
            timezone: Timezone string
            house_system: House system to use
            zodiac_type: Zodiac type (Tropical/Sidereal)
            include_minor_aspects: Whether to calculate minor aspects

        Returns:
            Complete NatalChart object
        """
        # Create chart object
        chart = NatalChart(
            patient_id=patient_id,
            birth_datetime=birth_datetime,
            latitude=latitude,
            longitude=longitude,
            timezone=timezone,
            house_system=house_system,
            zodiac_type=zodiac_type,
        )

        # Convert birth time to Julian Day
        jd = EphemerisUtils.datetime_to_julian_day(birth_datetime)

        # Calculate planet positions
        planets = self._calculate_all_planets(jd, float(latitude), float(longitude))
        chart.planets = planets

        # Calculate house cusps
        houses = self.houses_engine.calculate_house_cusps(
            jd, float(latitude), float(longitude), house_system
        )
        chart.houses = houses

        # Assign houses to planets
        self._assign_houses_to_planets(planets, houses)

        # Calculate aspects
        aspects = self.aspects_engine.calculate_aspects(planets, include_minor_aspects)
        chart.aspects = aspects

        return chart

    def _calculate_all_planets(
        self,
        jd: float,
        latitude: float,
        longitude: float
    ) -> List[PlanetPosition]:
        """Calculate positions for all planets"""
        planets = []
        planet_names = [
            "sun", "moon", "mercury", "venus", "mars",
            "jupiter", "saturn", "uranus", "neptune", "pluto"
        ]

        for planet_name in planet_names:
            try:
                planet_pos = self.planets_engine.calculate_planet_position(
                    planet_name, jd, latitude, longitude
                )
                planets.append(planet_pos)
            except Exception as e:
                print(f"Error calculating {planet_name}: {e}")
                # Continue with other planets

        return planets

    def _assign_houses_to_planets(
        self,
        planets: List[PlanetPosition],
        houses: List[HousePosition]
    ) -> None:
        """Assign house numbers to planets based on their positions"""
        for planet in planets:
            house_num = self._find_house_for_longitude(
                planet.longitude, houses
            )
            planet.house = house_num

    def _find_house_for_longitude(
        self,
        longitude: Decimal,
        houses: List[HousePosition]
    ) -> int:
        """Find which house a given longitude falls into"""
        # This is a simplified house assignment
        # For production, more sophisticated logic may be needed

        lon = float(longitude)

        # Handle 360-degree wraparound
        if lon < float(houses[0].longitude):
            lon += 360

        for i, house in enumerate(houses):
            next_house = houses[(i + 1) % 12]
            next_lon = float(next_house.longitude)

            if i == 11:  # Last house wraps to first
                next_lon += 360

            if float(house.longitude) <= lon < next_lon:
                return house.house_number

        # Fallback to house 1
        return 1