# -*- coding: utf-8 -*-
"""
Multi-tech payload builder for astrology (natal + transits + solar return + progressions).
Keeps backward compatibility by returning a sibling payload without altering natal format.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from django.conf import settings

from .schemas import KerykeionInputSchema
from .service import execute_kerykeion
from .normalizer import normalize_kerykeion_output
from .swisseph_adapter import execute_with_astrology_core, ASTROLOGY_CORE_AVAILABLE
from .params import house_system_to_engine_code, normalize_zodiac_type

try:
    from astrology.engine.astro_engine_adapter import (
        AstroEngineConfig,
        compute_chart,
        EphemerisNotReadyError,
    )
    ASTRO_ENGINE_AVAILABLE = True
except ImportError:
    ASTRO_ENGINE_AVAILABLE = False


@dataclass(frozen=True)
class MultiTechMeta:
    engine: str
    version: str
    generated_at: str
    context: str
    transits_reference_date: str
    solar_return_date: str
    progressions_reference_date: str
    progressions_method: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "engine": self.engine,
            "version": self.version,
            "generated_at": self.generated_at,
            "context": self.context,
            "transits_reference_date": self.transits_reference_date,
            "solar_return_date": self.solar_return_date,
            "progressions_reference_date": self.progressions_reference_date,
            "progressions_method": self.progressions_method,
        }


def _resolve_reference_datetime(input_data: Dict[str, Any], reference_dt: Optional[datetime]) -> datetime:
    if reference_dt:
        return reference_dt
    # Use timezone if provided; fallback to UTC
    tz_name = (input_data.get("location") or {}).get("timezone") or "UTC"
    try:
        from zoneinfo import ZoneInfo
        tz = ZoneInfo(tz_name)
        return datetime.now(tz)
    except Exception:
        return datetime.utcnow()


def _build_input_for_datetime(input_data: Dict[str, Any], dt: datetime) -> Dict[str, Any]:
    # Keep location + config same, only override birth_date/time for technique reference.
    data = dict(input_data)
    data["birth_date"] = dt.strftime("%Y-%m-%d")
    data["birth_time"] = dt.strftime("%H:%M")
    return data


def _run_chart_at_datetime(input_data: Dict[str, Any], dt: datetime) -> Dict[str, Any]:
    data = _build_input_for_datetime(input_data, dt)

    if ASTROLOGY_CORE_AVAILABLE:
        result = execute_with_astrology_core(
            birth_date=data["birth_date"],
            birth_time=data["birth_time"],
            city=data["location"]["city"],
            country=data["location"]["country"],
            lat=data["location"]["lat"],
            lng=data["location"]["lng"],
            timezone=data["location"]["timezone"],
            house_system=data.get("house_system", "P"),
            zodiac_type=data.get("zodiac_type", "tropical"),
            ayanamsha=data.get("ayanamsha"),
        )
        return normalize_kerykeion_output(result, data)

    # Fallback to Kerykeion
    schema = KerykeionInputSchema(**data)
    result = execute_kerykeion(schema).model_dump()
    return normalize_kerykeion_output(result, data)


def _angle_diff(a: float, b: float) -> float:
    # Return difference in range [-180, 180)
    return ((a - b + 180) % 360) - 180


def _compute_solar_return_datetime(
    target_longitude: float,
    birth_dt: datetime,
    reference_dt: datetime,
    lat: float,
    lng: float,
    timezone: str,
    house_system: str,
    zodiac_type: str,
    ayanamsha: Optional[str],
) -> datetime:
    if not ASTRO_ENGINE_AVAILABLE:
        return reference_dt

    try:
        house_code = house_system_to_engine_code(house_system)
        zodiac_norm = normalize_zodiac_type(zodiac_type)
    except Exception:
        house_code = (house_system or "P").upper()
        zodiac_norm = "tropical"

    cfg = AstroEngineConfig(
        house_system=house_code,
        zodiac_type="S" if zodiac_norm == "sidereal" else "T",
        ayanamsha=ayanamsha,
        draconic=(zodiac_norm == "draconic"),
        include_minor_aspects=False,
    )

    def sun_longitude(dt: datetime) -> float:
        try:
            chart = compute_chart(
                birth_datetime=dt,
                latitude=lat,
                longitude=lng,
                timezone=timezone,
                config=cfg,
            )
        except EphemerisNotReadyError:
            return target_longitude
        for p in chart.planets:
            if p.planet_name == "sun":
                return float(p.longitude)
        return target_longitude

    # Start near birthday in reference year
    try:
        guess = birth_dt.replace(year=reference_dt.year)
    except ValueError:
        # Feb 29 fallback
        guess = birth_dt.replace(year=reference_dt.year, day=28)

    # Search window +/- 2 days
    start = guess - timedelta(days=2)
    end = guess + timedelta(days=2)

    # Find bracket with sign change
    step = timedelta(hours=6)
    t = start
    prev = sun_longitude(t)
    prev_diff = _angle_diff(prev, target_longitude)
    bracket = None
    while t <= end:
        t_next = t + step
        curr = sun_longitude(t_next)
        curr_diff = _angle_diff(curr, target_longitude)
        if prev_diff == 0:
            return t
        if (prev_diff < 0 and curr_diff > 0) or (prev_diff > 0 and curr_diff < 0):
            bracket = (t, t_next)
            break
        prev_diff = curr_diff
        t = t_next

    if not bracket:
        return guess

    lo, hi = bracket
    for _ in range(20):
        mid = lo + (hi - lo) / 2
        mid_diff = _angle_diff(sun_longitude(mid), target_longitude)
        if abs(mid_diff) < 1e-3:
            return mid
        lo_diff = _angle_diff(sun_longitude(lo), target_longitude)
        if (lo_diff < 0 and mid_diff > 0) or (lo_diff > 0 and mid_diff < 0):
            hi = mid
        else:
            lo = mid
    return lo


def build_multitech_payload(
    natal_chart: Dict[str, Any],
    input_data: Dict[str, Any],
    reference_dt: Optional[datetime] = None,
) -> Dict[str, Any]:
    """
    Build multi-tech payload with the same internal schema as natal.
    Does not mutate the natal chart.
    """
    ref_dt = _resolve_reference_datetime(input_data, reference_dt)

    birth_dt = datetime.strptime(
        f"{input_data.get('birth_date')} {input_data.get('birth_time')}",
        "%Y-%m-%d %H:%M",
    )

    # Transits chart (same schema, reference = now)
    transits_chart = _run_chart_at_datetime(input_data, ref_dt)
    transits_chart["metadatos"] = dict(transits_chart.get("metadatos") or {})
    transits_chart["metadatos"]["reference_date"] = ref_dt.isoformat()
    transits_chart["metadatos"]["technique"] = "transits"

    # Progressions (secondary progression: day-for-year)
    age_days = (ref_dt - birth_dt).total_seconds() / 86400.0
    progressed_dt = birth_dt + timedelta(days=age_days / 365.25)
    progressions_chart = _run_chart_at_datetime(input_data, progressed_dt)
    progressions_chart["metadatos"] = dict(progressions_chart.get("metadatos") or {})
    progressions_chart["metadatos"]["reference_date"] = ref_dt.isoformat()
    progressions_chart["metadatos"]["technique"] = "progressions"
    progressions_chart["metadatos"]["progressions_method"] = "secondary_progression_day_for_year"

    # Solar return (last/actual return of Sun longitude)
    target_lon = None
    for p in natal_chart.get("planetas", []):
        if p.get("nombre") == "sun":
            target_lon = p.get("longitud_ecliptica")
            break
    if target_lon is None:
        target_lon = 0.0

    solar_dt = _compute_solar_return_datetime(
        target_longitude=float(target_lon),
        birth_dt=birth_dt,
        reference_dt=ref_dt,
        lat=float(input_data["location"]["lat"]),
        lng=float(input_data["location"]["lng"]),
        timezone=input_data["location"]["timezone"],
        house_system=input_data.get("house_system", "P"),
        zodiac_type=input_data.get("zodiac_type", "tropical"),
        ayanamsha=input_data.get("ayanamsha"),
    )

    solar_return_chart = _run_chart_at_datetime(input_data, solar_dt)
    solar_return_chart["metadatos"] = dict(solar_return_chart.get("metadatos") or {})
    solar_return_chart["metadatos"]["reference_date"] = solar_dt.isoformat()
    solar_return_chart["metadatos"]["technique"] = "solar_return"

    engine = (natal_chart.get("metadatos") or {}).get("fuente", "swiss_ephemeris")
    version = (natal_chart.get("metadatos") or {}).get("version_engine", "unknown")
    meta = MultiTechMeta(
        engine=engine,
        version=version,
        generated_at=datetime.utcnow().isoformat(),
        context="holistic_astrology",
        transits_reference_date=ref_dt.isoformat(),
        solar_return_date=solar_dt.isoformat(),
        progressions_reference_date=ref_dt.isoformat(),
        progressions_method="secondary_progression_day_for_year",
    )

    return {
        "meta": meta.to_dict(),
        "natal": natal_chart,
        "transits": transits_chart,
        "solarReturn": {
            "reference_date": solar_dt.isoformat(),
            "chart": solar_return_chart,
        },
        "progressions": {
            "reference_date": ref_dt.isoformat(),
            "method": "secondary_progression_day_for_year",
            "chart": progressions_chart,
        },
    }


def multitech_enabled() -> bool:
    return bool(getattr(settings, "ASTRO_MULTITECH_ENABLED", False))
