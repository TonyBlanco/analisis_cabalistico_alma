"""
Astro Engine Adapter

Punto único de entrada para cálculos astronómicos (Swiss Ephemeris / Astrology Core).
No toca UI ni endpoints. Reutiliza el motor existente para mantener outputs idénticos.
"""
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Optional

from .natal_chart_engine import NatalChartEngine, SWISSEPH_AVAILABLE
from .ephemeris_validator import configure_ephemeris_path


@dataclass(frozen=True)
class AstroEngineConfig:
    house_system: str = "P"
    zodiac_type: str = "T"  # T=tropical, S=sidereal
    ayanamsha: Optional[str] = None
    draconic: bool = False
    include_minor_aspects: bool = False


class EphemerisNotReadyError(RuntimeError):
    """Raised when ephemeris path/data is invalid or Swiss Ephemeris is missing."""


def _ensure_ephemeris_ready() -> None:
    """
    Validate ephemeris availability and configure path once.
    Raises EphemerisNotReadyError on failure.
    """
    validation = configure_ephemeris_path()
    if not validation.ok or not SWISSEPH_AVAILABLE:
        reasons = []
        if not SWISSEPH_AVAILABLE:
            reasons.append("Swiss Ephemeris library (swisseph) is not installed or not importable.")
        if not validation.ok:
            reasons.extend(validation.errors)
        raise EphemerisNotReadyError(" | ".join(reasons))


def compute_chart(
    birth_datetime: datetime,
    latitude: Decimal,
    longitude: Decimal,
    timezone: str,
    config: Optional[AstroEngineConfig] = None,
):
    """
    Compute complete natal chart using Swiss Ephemeris via the existing engine.

    Returns:
        NatalChart domain object (same structure produced by NatalChartEngine).
    """
    _ensure_ephemeris_ready()

    cfg = config or AstroEngineConfig()
    engine = NatalChartEngine()

    chart = engine.calculate_natal_chart(
        patient_id=0,
        birth_datetime=birth_datetime,
        latitude=latitude,
        longitude=longitude,
        timezone=timezone,
        house_system=cfg.house_system,
        zodiac_type=cfg.zodiac_type,
        ayanamsha=cfg.ayanamsha,
        draconic=cfg.draconic,
        include_minor_aspects=cfg.include_minor_aspects,
    )
    return chart


def compute_positions(
    birth_datetime: datetime,
    latitude: Decimal,
    longitude: Decimal,
    zodiac_type: str = "T",
    ayanamsha: Optional[str] = None,
):
    """Compute planet positions only."""
    cfg = AstroEngineConfig(zodiac_type=zodiac_type, ayanamsha=ayanamsha)
    return compute_chart(birth_datetime, latitude, longitude, timezone="UTC", config=cfg).planets


def compute_houses(
    birth_datetime: datetime,
    latitude: Decimal,
    longitude: Decimal,
    house_system: str = "P",
    zodiac_type: str = "T",
    ayanamsha: Optional[str] = None,
):
    """Compute house cusps only."""
    cfg = AstroEngineConfig(house_system=house_system, zodiac_type=zodiac_type, ayanamsha=ayanamsha)
    return compute_chart(birth_datetime, latitude, longitude, timezone="UTC", config=cfg).houses


def compute_aspects(
    birth_datetime: datetime,
    latitude: Decimal,
    longitude: Decimal,
    house_system: str = "P",
    zodiac_type: str = "T",
    ayanamsha: Optional[str] = None,
    include_minor_aspects: bool = False,
):
    """Compute aspects only."""
    cfg = AstroEngineConfig(
        house_system=house_system,
        zodiac_type=zodiac_type,
        ayanamsha=ayanamsha,
        include_minor_aspects=include_minor_aspects,
    )
    return compute_chart(
        birth_datetime,
        latitude,
        longitude,
        timezone="UTC",
        config=cfg,
    ).aspects
