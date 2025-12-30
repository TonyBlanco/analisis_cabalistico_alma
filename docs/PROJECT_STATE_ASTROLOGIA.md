## PROJECT_STATE — Astrología Profesional

### Estado general

- Estado: estable (FASE 3)
- Alcance actual: frontend + capas reales controladas (sin PDFs, sin IA interpretativa, sin lenguaje clínico)

### Capas reales activas (FASE 3)

- `natal`: cálculo real bajo demanda (botón “Recalcular carta”)
- `transits`: real si existe en `analysis_result` del backend
- `progressions`: real si existe en `analysis_result` del backend
- `solarReturn`: real si existe en `analysis_result` del backend
- `synastry`: doble rueda real al seleccionar pareja (se carga su payload natal; no compuesta/Davison)

### Comportamiento clave (FASE 3)

- No existe recálculo automático por cambios de UI (sistema de casas / zodiaco / toggles).
- Los toggles de capas controlan **solo render**, no disparan llamadas nuevas al backend.
- El cálculo real se ejecuta únicamente cuando el usuario pulsa “Recalcular carta”.

### Módulos bloqueados (FASE 3)

Bloqueados con tooltip “Disponible en fase posterior”, sin ejecución accidental:

- Arco Solar
- Retorno Lunar
- Armónicos
- Persona Charts
- Relocación
- Estilo HUBER
- Estrellas fijas
- Compuesta / Davison

### Flujo paso a paso (FASE 3)

1. Abrir vista profesional.
2. Pulsar “Recalcular carta” para generar/persistir carta natal real.
3. Activar/desactivar capas disponibles (tránsitos, progresiones, retorno solar) para visualizar overlays.
4. (Opcional) Activar doble rueda y seleccionar pareja para ver sinastría real (sin cálculos extra).

### Estado tras FASE 3

- Frontend refleja cálculo real cuando existe; conserva modo solo lectura.
- Funcionalidad bloqueada queda visible y no interfiere con build.
