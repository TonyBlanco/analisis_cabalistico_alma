# Aspects calculation engine
# This module handles aspect calculations between planets

from decimal import Decimal
from typing import List, Dict, Tuple, Optional
from math import fabs

from ..config.astrology_settings import MAJOR_ASPECTS, MINOR_ASPECTS, ASPECT_ORBS
from ..domain.aspect import Aspect
from ..domain.planet_position import PlanetPosition


class AspectsEngine:
    """Engine for calculating aspects between planets"""

    def __init__(self):
        self.major_aspects = MAJOR_ASPECTS
        self.minor_aspects = MINOR_ASPECTS
        self.aspect_orbs = ASPECT_ORBS

    def calculate_aspects(
        self,
        planets: List[PlanetPosition],
        include_minor: bool = False
    ) -> List[Aspect]:
        """
        Calculate aspects between all planet pairs

        Args:
            planets: List of planet positions
            include_minor: Whether to include minor aspects

        Returns:
            List of Aspect objects
        """
        aspects = []
        aspects_to_check = self.major_aspects.copy()

        if include_minor:
            aspects_to_check.update(self.minor_aspects)

        # Check all planet pairs
        for i, planet1 in enumerate(planets):
            for j, planet2 in enumerate(planets):
                if i >= j:  # Avoid duplicate pairs and self-aspects
                    continue

                aspect = self._calculate_aspect_between_planets(
                    planet1, planet2, aspects_to_check
                )

                if aspect:
                    aspects.append(aspect)

        return aspects

    def _calculate_aspect_between_planets(
        self,
        planet1: PlanetPosition,
        planet2: PlanetPosition,
        aspects_to_check: Dict[int, str]
    ) -> Optional[Aspect]:
        """
        Calculate aspect between two specific planets

        Returns None if no aspect found within orb
        """
        # Calculate angular separation
        angle = self._calculate_angular_separation(
            planet1.longitude, planet2.longitude
        )

        # Check each possible aspect
        for aspect_angle, aspect_type in aspects_to_check.items():
            aspect_angle = Decimal(str(aspect_angle))
            orb = Decimal(str(self.aspect_orbs.get(aspect_type, 8)))

            # Check if angle is within orb of aspect
            if fabs(float(angle - aspect_angle)) <= float(orb):
                # Determine if applying or separating
                applying, separating = self._determine_aspect_motion(
                    planet1, planet2, aspect_angle, angle
                )

                return Aspect(
                    planet1_id=planet1.planet_id,
                    planet1_name=planet1.planet_name,
                    planet2_id=planet2.planet_id,
                    planet2_name=planet2.planet_name,
                    aspect_type=aspect_type,
                    angle=angle,
                    orb=Decimal(str(fabs(float(angle - aspect_angle)))),
                    applying=applying,
                    separating=separating,
                )

        return None

    def _calculate_angular_separation(self, lon1: Decimal, lon2: Decimal) -> Decimal:
        """Calculate the smaller angular separation between two longitudes"""
        diff = fabs(float(lon1 - lon2))
        # Take the smaller angle (minimum of diff and 360 - diff)
        separation = min(diff, 360 - diff)
        return Decimal(str(separation))

    def _determine_aspect_motion(
        self,
        planet1: PlanetPosition,
        planet2: PlanetPosition,
        aspect_angle: Decimal,
        actual_angle: Decimal
    ) -> Tuple[bool, bool]:
        """
        Determine if aspect is applying or separating

        Returns (applying, separating)
        """
        # Calculate relative speed
        relative_speed = float(planet1.speed_longitude - planet2.speed_longitude)

        # If planets are moving towards each other, aspect is applying
        # If moving away, aspect is separating

        # For conjunction (0°) and opposition (180°)
        if float(aspect_angle) in [0, 180]:
            if relative_speed > 0:
                return True, False  # Applying
            else:
                return False, True  # Separating

        # For other aspects, it's more complex
        # Simplified logic: if the angle is decreasing, applying
        angle_diff = float(actual_angle - aspect_angle)
        if angle_diff > 0 and relative_speed > 0:
            return True, False
        elif angle_diff < 0 and relative_speed < 0:
            return True, False
        else:
            return False, True