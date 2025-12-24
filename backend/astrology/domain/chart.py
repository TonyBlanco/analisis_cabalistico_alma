# Domain models for astrology
# This module contains the core domain entities for astrology calculations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional, Any
from decimal import Decimal


@dataclass
class PlanetPosition:
    """Represents a planet's position in the chart"""
    planet_id: int
    planet_name: str
    longitude: Decimal  # In degrees (0-360)
    latitude: Decimal   # In degrees
    distance: Decimal   # In AU
    speed_longitude: Decimal  # Degrees per day
    speed_latitude: Decimal   # Degrees per day
    speed_distance: Decimal   # AU per day
    sign: str          # Zodiac sign name
    sign_degree: Decimal  # Degree within sign (0-30)
    house: int         # House number (1-12)
    retrograde: bool   # True if retrograde

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            "planet_id": self.planet_id,
            "planet_name": self.planet_name,
            "longitude": float(self.longitude),
            "latitude": float(self.latitude),
            "distance": float(self.distance),
            "speed_longitude": float(self.speed_longitude),
            "speed_latitude": float(self.speed_latitude),
            "speed_distance": float(self.speed_distance),
            "sign": self.sign,
            "sign_degree": float(self.sign_degree),
            "house": self.house,
            "retrograde": self.retrograde,
        }


@dataclass
class HousePosition:
    """Represents a house cusp position"""
    house_number: int
    longitude: Decimal  # In degrees (0-360)
    sign: str          # Zodiac sign name
    sign_degree: Decimal  # Degree within sign (0-30)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            "house_number": self.house_number,
            "longitude": float(self.longitude),
            "sign": self.sign,
            "sign_degree": float(self.sign_degree),
        }


@dataclass
class Aspect:
    """Represents an aspect between two planets"""
    planet1_id: int
    planet1_name: str
    planet2_id: int
    planet2_name: str
    aspect_type: str      # "conjunction", "trine", etc.
    angle: Decimal        # Exact angle in degrees
    orb: Decimal          # Orb in degrees
    applying: bool        # True if planets are moving towards exact aspect
    separating: bool      # True if planets are moving away from exact aspect

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            "planet1_id": self.planet1_id,
            "planet1_name": self.planet1_name,
            "planet2_id": self.planet2_id,
            "planet2_name": self.planet2_name,
            "aspect_type": self.aspect_type,
            "angle": float(self.angle),
            "orb": float(self.orb),
            "applying": self.applying,
            "separating": self.separating,
        }


@dataclass
class NatalChart:
    """Complete natal chart data"""
    patient_id: int
    birth_datetime: datetime
    latitude: Decimal
    longitude: Decimal
    timezone: str
    house_system: str
    zodiac_type: str

    # Calculated data
    planets: List[PlanetPosition] = field(default_factory=list)
    houses: List[HousePosition] = field(default_factory=list)
    aspects: List[Aspect] = field(default_factory=list)

    # Metadata
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    version: str = "1.0"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            "patient_id": self.patient_id,
            "birth_datetime": self.birth_datetime.isoformat(),
            "latitude": float(self.latitude),
            "longitude": float(self.longitude),
            "timezone": self.timezone,
            "house_system": self.house_system,
            "zodiac_type": self.zodiac_type,
            "planets": [p.to_dict() for p in self.planets],
            "houses": [h.to_dict() for h in self.houses],
            "aspects": [a.to_dict() for a in self.aspects],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "version": self.version,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'NatalChart':
        """Create from dictionary"""
        chart = cls(
            patient_id=data["patient_id"],
            birth_datetime=datetime.fromisoformat(data["birth_datetime"]),
            latitude=Decimal(str(data["latitude"])),
            longitude=Decimal(str(data["longitude"])),
            timezone=data["timezone"],
            house_system=data["house_system"],
            zodiac_type=data["zodiac_type"],
        )

        chart.planets = [PlanetPosition(**p) for p in data.get("planets", [])]
        chart.houses = [HousePosition(**h) for h in data.get("houses", [])]
        chart.aspects = [Aspect(**a) for a in data.get("aspects", [])]

        if data.get("created_at"):
            chart.created_at = datetime.fromisoformat(data["created_at"])
        if data.get("updated_at"):
            chart.updated_at = datetime.fromisoformat(data["updated_at"])

        chart.version = data.get("version", "1.0")
        return chart