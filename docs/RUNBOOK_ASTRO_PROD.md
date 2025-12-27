# RUNBOOK ASTRO PROD (Swiss Ephemeris vendorizado)

## Variables requeridas
- `PYTHONPATH`: debe incluir `backend` (ej.: `D:\analisis_cabalistico_alma\backend`).
- `SWISSEPH_PATH`: `D:\analisis_cabalistico_alma\backend\astrology\ephemeris` (vendorizado).

## Código/Data vendorizados
- Módulo nativo: `swisseph.cp310-win_amd64.pyd` en raíz del repo y en `backend/vendor/` (preferido vía `sitecustomize.py`).
- Efemérides: `backend/astrology/ephemeris/` (copiadas desde `D:\swisseph\ephe`, sin modificaciones).

## Arranque/validación
1) Exportar variables:
   - PowerShell:  
     `setx PYTHONPATH "D:\analisis_cabalistico_alma\backend"`  
     `setx SWISSEPH_PATH "D:\analisis_cabalistico_alma\backend\astrology\ephemeris"`
2) Reiniciar terminal/servicio.
3) Smoke test manual:
   ```bash
   $env:PYTHONPATH="D:\analisis_cabalistico_alma\backend"
   $env:SWISSEPH_PATH="D:\analisis_cabalistico_alma\backend\astrology\ephemeris"
   python -c "from astrology.engine.astro_engine_adapter import compute_chart; \
from decimal import Decimal; from datetime import datetime; \
print(len(compute_chart(datetime(1980,1,1), Decimal('40.4168'), Decimal('-3.7038'), 'UTC').planets))"
   ```
   Esperado: se imprime cantidad de planetas (10) sin errores.
4) Test de determinismo:
   ```bash
   $env:PYTHONPATH="D:\analisis_cabalistico_alma\backend"
   $env:SWISSEPH_PATH="D:\analisis_cabalistico_alma\backend\astrology\ephemeris"
   python -m pytest backend/tests/test_astrology_engine_determinism.py -rA
   ```
5) Smoke test rápido (sin red):
   ```bash
   $env:PYTHONPATH="D:\analisis_cabalistico_alma\backend"
   $env:SWISSEPH_PATH="D:\analisis_cabalistico_alma\backend\astrology\ephemeris"
   python scripts/astro_smoke_test.py
   ```

## Observabilidad esperada
- `import swisseph` debe resolver al pyd vendorizado (ruta del repo).
- Falla explícita si falta `SWISSEPH_PATH` o data de efemérides (validador del engine).

## Packaging/Despliegue
- Docker/VM: montar `backend/astrology/ephemeris` en la ruta indicada por `SWISSEPH_PATH`.
- No descargar efemérides en runtime. No usar rutas del sistema.

## Errores comunes y acciones
- `ModuleNotFoundError: swisseph`: verificar `PYTHONPATH` apunta a `backend` y existe `swisseph.cp310-win_amd64.pyd` en raíz.
- `Ephemeris path does not exist`: revisar `SWISSEPH_PATH` y permisos de lectura.
- Resultados vacíos/mocks: indica que Swiss Ephemeris no está disponible o path inválido; corregir env vars y reiniciar.
