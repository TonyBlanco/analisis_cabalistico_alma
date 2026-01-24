## PROJECT_STATE — Astrología Profesional

### Estado general

> ⚠️ **Nota de entorno (Node/frontend)**: Este documento convive en el mismo workspace que `tonyblanco-app`, cuyo frontend está acoplado a `Node 20.9.0` (64‑bit) gestionado con `nvm`. No modificar la versión de Node activa para este workspace sin alinearlo primero con las restricciones documentadas en `00_SOURCE_OF_TRUTH.md`.

### Incidente de contaminacion cruzada y resolucion

  - Restauracion de copy en espanol Espacio Central (labels/paneles/vista de consultante).
  - Bloqueo de modulos y opciones de fase posterior en Astrologia Profesional (incluye Compuesta/Davison y overlays simbolicos no permitidos en modo real).
  - Verificacion de aislamiento: sin imports cruzados entre dominios (clinico ↔ astrologia) y sin `_legacy_*` dentro del workspace de Astrologia.

### Capas reales activas (FASE 3)


### Comportamiento clave (FASE 3)


### Módulos bloqueados (FASE 3)

Bloqueados con tooltip “Disponible en fase posterior”, sin ejecución accidental:


### Flujo paso a paso (FASE 3)

1. Abrir vista profesional.
2. Pulsar “Recalcular carta” para generar/persistir carta natal real.
3. Activar/desactivar capas disponibles (tránsitos, progresiones, retorno solar) para visualizar overlays.
4. (Opcional) Activar doble rueda y seleccionar pareja para ver sinastría real (sin cálculos extra).

### Estado tras FASE 3

