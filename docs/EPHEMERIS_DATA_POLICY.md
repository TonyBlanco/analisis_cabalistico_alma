# EPHEMERIS DATA POLICY (Swiss Ephemeris)

## Ubicación y configuración
- Variable de entorno: `SWISSEPH_PATH` (requerida para producción). Valor recomendado: `backend/astrology/ephemeris`.
- Fallback de desarrollo: `backend/astrology/ephemeris/` (vendorizado en el repo con .se1/.se2 copiados desde D:\\swisseph\\ephe).
- `ephemeris_validator.py` valida la ruta y configura `swe.set_ephe_path`; si falta data → error explícito.

## Archivos requeridos (mínimo)
- Archivos Swiss Ephemeris `.se1` / `.se2` para planetas/luna/sol (e.g., `sepl_18.se1`, `sepl_18.se2`).
- Otros ficheros (asteroides/estrellas fijas) según alcance; no se descargan automáticamente.

## Política de versionado
- Los archivos de efemérides no se descargan en runtime.
- Deben versionarse fuera del código fuente o montarse como volumen en despliegue.
- Documentar versión/procedencia del paquete de efemérides usado en cada entorno.

## Despliegue
- Producción: montar volumen/paquete en la ruta `SWISSEPH_PATH`; validar en arranque (error si falta).
- Desarrollo: ruta fallback vendorizada (`backend/astrology/ephemeris`) incluida en el repo; no usar rutas del sistema sin declarar.

## Prohibiciones
- No usar rutas globales del sistema sin declararlas.
- No confiar en fallback silencioso.
- No distribuir efemérides sin respetar licencia Swiss Ephemeris.
## Vendoring actual
- Código/extension `swisseph` vendorizado en `backend/vendor/` (copiado desde instalación local) y habilitado vía `sitecustomize.py`.
- Datos de efemérides vendorizados en `backend/astrology/ephemeris/` (copiados desde D:\\swisseph\\ephe).

## Auditoría
- Registrar (en futuros pasos) versión de `swisseph` y path activo en logs de cálculo.
- Conservar evidencia de procedencia de efemérides para auditorías.
