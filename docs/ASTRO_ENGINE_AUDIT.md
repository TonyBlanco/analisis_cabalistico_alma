# ASTRO ENGINE AUDIT (Swiss Ephemeris / Kerykeion)
## Resumen ejecutivo
- Motor astronómico actual: **Kerykeion** con fallback a **Astrology Core (Swiss Ephemeris)** vía `swisseph`.
- Swiss Ephemeris se usa de forma directa en el módulo `backend/astrology/engine/*` y a través del adaptador `swisseph_adapter` cuando Kerykeion no está disponible.
- No se detectan archivos de efemérides (.se1/.se2) versionados en el repo; la ruta no se establece explícitamente (`swe.set_ephe_path` comentado).
- Determinismo condicionado: los engines usan Swiss Ephemeris si está instalado; si falta, hay mocks y fallback simplificados → riesgo de resultados no reproducibles sin ephemeris y sin fijar path/versión.
- Licencia: Swiss Ephemeris no está declarada en `backend/requirements.txt` ni con nota de licencia; uso implícito vía import. Riesgo de cumplimiento y trazabilidad.

## Estado actual del motor astronómico
- Punto de entrada API: `backend/api/astrology_kerykeion/service.py::execute_kerykeion` (GET/POST `/api/therapist/patients/<id>/astrology-kerykeion/`).
- Flujo: valida params → normaliza (`params.py`) → intenta **Astrology Core (Swiss Ephemeris directo)** vía `swisseph_adapter` → si no está disponible, usa **Kerykeion** → outputs normalizados con `normalizer.py`.
- Snapshot/metadata: modelos (`AstrologyNatalChart`) guardan `source` y `engine_version`; `normalize_kerykeion_output` incluye `fuente`, `version_engine`, `input_snapshot` (cuando viene del POST).

## Uso de Swiss Ephemeris (cómo, dónde, versión)
- Código directo Swiss Ephemeris:
  - `backend/astrology/engine/planets.py`: `swisseph as swe` → `swe.calc` (planetas); flags por defecto `FLG_SPEED | FLG_SWIEPH`; sin `swe.set_ephe_path` (comentado).
  - `backend/astrology/engine/houses.py`: `swe.houses` / `swe.houses_ex` (flags sidereal); Whole Sign emulado con ascendente. Sin path explícito.
  - `backend/astrology/engine/ephemeris.py`: `swe.julday` para JD; fallback interno si falta `swisseph`.
- Adaptador Swiss Ephemeris → formato Kerykeion:
  - `backend/api/astrology_kerykeion/swisseph_adapter.py`: usa `NatalChartEngine` (Swiss Ephemeris), devuelve planetas/casas/aspectos normalizados; fija `engine_version='2.10.3'` (constante), `engine='swisseph'`.
- Disponibilidad:
  - `ASTROLOGY_CORE_AVAILABLE` depende de import de `astrology.engine.natal_chart_engine` (Swiss Ephemeris instalado).
  - Si no hay `swisseph`, `PlanetsEngine` lanza `ImportError`, `HousesEngine` imprime warning y usa mocks.
- Versiones detectadas en código:
  - Swiss Ephemeris: no fijada en requirements; constante `engine_version='2.10.3'` en `swisseph_adapter` (no validada contra instalación real).
  - Kerykeion: se lee `kerykeion.__version__` cuando está instalado; no está en `backend/requirements.txt` → dependencia implícita.

## Efemérides (datos)
- Archivos `.se1/.se2` en repo: **no encontrados** (búsqueda recursiva).
- Path de efemérides: no configurado (`swe.set_ephe_path` comentado en `planets.py`); depende de path por defecto o variable de entorno externa.
- Fallbacks:
  - Si falta `swisseph` o falla `swe.calc/houses`, hay mocks (valores sintéticos) → resultados no trazables.
  - `swisseph_adapter` levanta excepción si `Astrology Core` no está disponible.
- Necesidad declarada: definir carpeta canónica y política de versionado; hoy inexistente.

## Determinismo y reproducibilidad
- Mismo input → mismo output: solo garantizado cuando `swisseph` está presente y con efemérides estables; sin path explícito hay riesgo de variación entre entornos.
- Timezone: `execute_kerykeion` recibe `timezone` y lo pasa al adapter; `EphemerisUtils.datetime_to_julian_day` asume UTC si no hay tzinfo y convierte a UTC antes de `swe.julday`.
- ΔT: no se controla explícitamente (Swiss Ephemeris maneja interno; no se parametriza).
- Coordenadas: normalización básica en `EphemerisUtils.normalize_coordinates` (no usada en adapter principal); adapters pasan lat/lng directos.
- Snapshots: modelo `AstrologyNatalChart` almacena `source`/`engine` y `input_snapshot` cuando se normaliza, pero no hay `algorithm_snapshot` ni hash de efemérides.
- No determinismo potencial:
  - Ausencia de ephemeris path/version fijada.
  - Mocks activados si falta `swisseph` o si falla `swe.*` → silencioso en casas/planetas con prints.
  - `engine_version` hardcodeada (2.10.3) puede no coincidir con instalación real.

## Aislamiento arquitectónico (estado actual)
- Cálculo encapsulado en `backend/astrology/engine/*` y `swisseph_adapter`; UI no realiza cálculos directos.
- Endpoint clínico usa adapter `api/astrology_kerykeion/service.py` → `normalize_kerykeion_output` → persiste snapshot en `AstrologyNatalChart`.
- Acoplamientos:
  - Path de efemérides sin centralizar (comentado) → riesgo de dependencias externas ocultas.
  - `engine_version` definida en adapter en vez de consultarse de `swisseph` instalado.
  - Mocks internos mezclados con producción (planets/houses) sin guardas fuertes.

## Licencia y compliance (análisis)
- Swiss Ephemeris no declarada en `backend/requirements.txt` → dependencia implícita; licencia (Astrodienst) no documentada.
- Uso previsto: cálculo backend en un entorno cerrado (SaaS). Requiere aclarar si distribución de efemérides se hace en binarios/paquetes.
- Riesgos:
  - Falta de declaración de licencia y procedencia de efemérides.
  - Ausencia de path/version fija impide trazabilidad y defensa ante auditoría.

## Recomendaciones (sin implementar)
1) Dependencias
   - Declarar `swisseph` y `kerykeion` en requirements con versiones exactas; registrar versión real de `swisseph` en runtime en vez de hardcode.
2) Efemérides
   - Definir carpeta canónica (e.g., `backend/ephemeris/`), documentar archivos requeridos (.se1/.se2), añadir verificación de existencia y error explícito si faltan.
   - Configurar `swe.set_ephe_path` en un solo punto (adapter/engine init) y registrar path en logs/snapshots.
3) Determinismo
   - Guardar `algorithm_snapshot`: versión swisseph, path efemérides, flags, house_system/zodiac/ayanamsha/draconic.
   - Eliminar o aislar mocks de producción; fail-fast con mensaje claro si falta Swiss Ephemeris o efemérides.
4) Aislamiento
   - Introducir (en Fase B) un `AstroEngineAdapter` único que exponga cálculo y centralice path/flags, evitando llamadas directas a swe.* fuera de engine.
5) Compliance
   - Crear `docs/SWISS_EPHEMERIS_COMPLIANCE.md` (Fase D): nota de licencia, alcance permitido (uso interno/SaaS), qué no se distribuye, cómo se versionan efemérides.
6) Observabilidad
   - Loggear engine usado (`kerykeion` vs `swisseph`), versión real y path de efemérides en cada cálculo (para auditoría), sin exponer datos sensibles.

## Señales de bloqueo detectadas (requieren cambio futuro)
- No hay ephemeris path/version controlados → reproducibilidad no garantizada.
- Dependencia Swiss Ephemeris no declarada ni documentada → riesgo de cumplimiento/licencia.
- Mocks activos en fallos silenciosos → posible desviación numérica sin alertas.
