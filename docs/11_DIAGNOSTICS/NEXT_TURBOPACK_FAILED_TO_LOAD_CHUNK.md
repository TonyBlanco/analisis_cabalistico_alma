---
title: Next.js (Turbopack) - Failed to load chunk (HMR client)
---

# Next.js (Turbopack) - Failed to load chunk (HMR client)

## Síntoma

En desarrollo (Next.js 16 + Turbopack) el navegador muestra un error similar a:

- `Failed to load chunk /_next/static/chunks/%5Bturbopack%5D_browser_dev_hmr-client_hmr-client_ts_....js`

## Causa frecuente en este repo (Windows)

Turbopack intenta inferir el “workspace root” y, si encuentra lockfiles fuera del proyecto (por ejemplo `D:\pnpm-lock.yaml`), puede seleccionar una raíz incorrecta.
Esto provoca rutas/artefactos inconsistentes y puede terminar en fallos de carga de chunks.

## Solución aplicada

- Forzar la raíz de Turbopack a la carpeta del frontend vía `turbopack.root` en `tonyblanco-app/next.config.ts`.
- Eliminar `tonyblanco-app/next.config.mjs` (estaba vacío y podía “pisar” la config real).

## Si además aparece “Unable to acquire lock … .next/dev/lock”

Suele ser un proceso de `next dev` anterior que quedó vivo, o un lock stale tras un crash.

1. Detén cualquier `next dev` que esté corriendo.
2. Borra cache/lock y reinicia:
   - `powershell -File .\\start-frontend.ps1 -Clean`
   - o manualmente: borrar `tonyblanco-app\\.next\\dev\\lock` y (opcional) toda `tonyblanco-app\\.next`

## Fallback (evitar Turbopack)

Si necesitas seguir trabajando mientras investigas, puedes usar Webpack en dev:

- `npm run dev -- --webpack`

