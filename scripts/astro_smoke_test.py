"""
Operational smoke test for Swiss Ephemeris (offline, no network).

Usage (PowerShell example):
  $env:PYTHONPATH="D:\\analisis_cabalistico_alma\\backend"
  $env:SWISSEPH_PATH="D:\\analisis_cabalistico_alma\\backend\\astrology\\ephemeris"
  python scripts/astro_smoke_test.py

Checks:
1) Import swisseph (vendored) and adapter.
2) Validate ephemeris path using the existing validator.
3) Run a deterministic chart computation via the sealed adapter.

No endpoints are called. No data is persisted.
"""
from datetime import datetime
from decimal import Decimal
import os
import sys


def main() -> int:
    try:
        from astrology.engine.astro_engine_adapter import compute_chart, AstroEngineConfig, EphemerisNotReadyError
        from astrology.engine.ephemeris_validator import resolve_ephemeris_path, validate_ephemeris_path
        import swisseph  # type: ignore
    except Exception as exc:
        print(f"[FAIL] Import error: {exc}")
        return 1

    ephe_path = os.getenv("SWISSEPH_PATH") or str(resolve_ephemeris_path())
    validation = validate_ephemeris_path(resolve_ephemeris_path())
    if not validation.ok:
        print(f"[FAIL] Ephemeris validation failed for path: {ephe_path}")
        for err in validation.errors:
            print(f"  - {err}")
        print("Action: set SWISSEPH_PATH to a readable directory with .se1/.se2 files.")
        return 1

    cfg = AstroEngineConfig(house_system="P", zodiac_type="T", draconic=False)
    birth_dt = datetime(1959, 8, 1, 20, 0)  # Fixed case (Havana sample)
    lat = Decimal("23.1136")
    lng = Decimal("-82.3666")

    try:
        chart = compute_chart(
            birth_datetime=birth_dt,
            latitude=lat,
            longitude=lng,
            timezone="America/Havana",
            config=cfg,
        )
    except EphemerisNotReadyError as exc:
        print(f"[FAIL] Ephemeris not ready: {exc}")
        return 1
    except Exception as exc:
        print(f"[FAIL] Unexpected error during chart computation: {exc}")
        return 1

    planets = chart.planets or []
    houses = chart.houses or []
    aspects = chart.aspects or []

    if not planets or not houses:
        print("[FAIL] Chart computed but planets/houses are empty.")
        return 1

    print("[OK] Swiss Ephemeris smoke test passed.")
    print(f"swisseph: {getattr(swisseph, '__file__', 'unknown')}")
    print(f"SWISSEPH_PATH: {ephe_path}")
    print(f"Planets: {len(planets)} | Houses: {len(houses)} | Aspects: {len(aspects)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
