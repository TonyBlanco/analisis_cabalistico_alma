# ASTRO ENGINE ISOLATION (Swiss Ephemeris)

## Propósito
Definir un punto único de entrada (Capa A sellada) para cálculos astronómicos con Swiss Ephemeris, sin alterar UX ni contratos existentes.

## Componentes clave
- `backend/astrology/engine/astro_engine_adapter.py`
  - Funciones deterministas: `compute_chart`, `compute_positions`, `compute_houses`, `compute_aspects`.
  - Config via `AstroEngineConfig`.
  - Verifica ephemeris y Swiss Ephemeris antes de calcular; lanza `EphemerisNotReadyError` si falta dependencia.
- `backend/astrology/engine/ephemeris_validator.py`
  - Resuelve ruta (`SWISSEPH_PATH` o fallback `backend/astrology/ephemeris/`).
  - Valida existencia/lectura de efemérides (.se1/.se2).
  - Configura `swe.set_ephe_path` cuando está disponible.
- `backend/api/astrology_kerykeion/swisseph_adapter.py`
  - Reusa el adapter para mantener outputs actuales (formato Kerykeion) sin cambiar endpoints.

## Garantías
- Sin cambios de UX ni endpoints.
- Mismo output numérico para mismo input (cuando ephemeris disponible).
- Fallo explícito si falta Swiss Ephemeris o efemérides; no hay fallback silencioso.

## Cómo usar (interno)
```python
from astrology.engine.astro_engine_adapter import compute_chart, AstroEngineConfig
chart = compute_chart(
    birth_datetime=...,      # datetime (tz-aware)
    latitude=Decimal(".."),
    longitude=Decimal(".."),
    timezone="America/Havana",
    config=AstroEngineConfig(house_system="P", zodiac_type="T")
)
```

## Pendientes/Futuro (sin implementar)
- Registrar `engine_version` real desde `swisseph` en runtime.
- Hash de efemérides y `algorithm_snapshot` para auditoría.
- Mover configuración de tolerancias/aspectos a settings centralizados.
