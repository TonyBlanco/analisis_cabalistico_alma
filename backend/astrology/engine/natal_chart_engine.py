# Natal Chart Engine
# Main engine that coordinates all astronomical calculations

from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from .planets import PlanetsEngine
from .houses import HousesEngine
from .aspects import AspectsEngine
from .ephemeris import EphemerisUtils
from ..domain.chart import NatalChart
from ..domain.planet_position import PlanetPosition
from ..domain.house_position import HousePosition
from ..config.astrology_settings import DEFAULT_HOUSE_SYSTEM, DEFAULT_ZODIAC_TYPE

try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False


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
        ayanamsha: Optional[str] = None,
        draconic: bool = False,
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

        # Swiss Ephemeris flags (sidereal support)
        planet_flags = None
        house_flags = 0

        if zodiac_type == 'S' and SWISSEPH_AVAILABLE:
            # Configure sidereal mode (default: Lahiri)
            sid_mode = getattr(swe, 'SIDM_LAHIRI', None)
            if ayanamsha:
                ay = ayanamsha.strip().lower()
                sid_mode = {
                    'lahiri': getattr(swe, 'SIDM_LAHIRI', sid_mode),
                    'fagan_bradley': getattr(swe, 'SIDM_FAGAN_BRADLEY', sid_mode),
                    'krishnamurti': getattr(swe, 'SIDM_KRISHNAMURTI', sid_mode),
                    'raman': getattr(swe, 'SIDM_RAMAN', sid_mode),
                    'yukteshwar': getattr(swe, 'SIDM_YUKTESHWAR', sid_mode),
                }.get(ay, sid_mode)

            if sid_mode is not None:
                swe.set_sid_mode(sid_mode)

            planet_flags = swe.FLG_SPEED | swe.FLG_SWIEPH | swe.FLG_SIDEREAL
            house_flags = swe.FLG_SIDEREAL

        # Calculate planet positions
        planets = self._calculate_all_planets(jd, float(latitude), float(longitude), flags=planet_flags)
        chart.planets = planets

        # Calculate house cusps
        houses = self.houses_engine.calculate_house_cusps(
            jd, float(latitude), float(longitude), house_system, flags=house_flags
        )
        chart.houses = houses

        # Assign houses to planets
        self._assign_houses_to_planets(planets, houses)

        # Draconic transformation: shift all longitudes by North Node.
        # This keeps aspects invariant (relative angles unchanged).
        if draconic:
            node = self.planets_engine.calculate_planet_position(
                'north_node', jd, float(latitude), float(longitude), flags=planet_flags
            )
            self._apply_draconic_shift(planets, houses, node.longitude)

        # Calculate aspects
        aspects = self.aspects_engine.calculate_aspects(planets, include_minor_aspects)
        chart.aspects = aspects

        return chart

    def _calculate_all_planets(
        self,
        jd: float,
        latitude: float,
        longitude: float,
        flags: Optional[int] = None,
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
                    planet_name, jd, latitude, longitude, flags=flags
                )
                planets.append(planet_pos)
            except Exception as e:
                print(f"Error calculating {planet_name}: {e}")
                # Continue with other planets

        return planets

    def _apply_draconic_shift(
        self,
        planets: List[PlanetPosition],
        houses: List[HousePosition],
        north_node_longitude: Decimal,
    ) -> None:
        """Shift all chart longitudes by the North Node longitude (draconic chart)."""
        offset = north_node_longitude

        def norm360(v: Decimal) -> Decimal:
            v = v % Decimal('360')
            if v < 0:
                v += Decimal('360')
            return v

        for planet in planets:
            new_lon = norm360(planet.longitude - offset)
            planet.longitude = new_lon
            planet.sign, planet.sign_degree = self.planets_engine._get_zodiac_sign(new_lon)

        for house in houses:
            new_lon = norm360(house.longitude - offset)
            house.longitude = new_lon
            house.sign, house.sign_degree = self.houses_engine._get_zodiac_sign(new_lon)

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