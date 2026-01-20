## PROJECT_STATE — Astrología Profesional

### Estado general

- Estado: estable (FASE 3)

### Incidente de contaminacion cruzada y resolucion

- Sintomas: mezcla accidental de copy/plantillas del core (p. ej. "Patient clinical view"), textos en ingles Espacio Central y opciones fuera de dominio dentro de Astrologia Profesional.
- Criterio: Astrologia Profesional no puede renderizar vistas del core ni depender de legacy; el Espacio Clinico debe estar en espanol y sin acoplamientos a workspaces simbolicos.
- Resolucion aplicada (quirurgica, sin redisenos):
  - Restauracion de copy en espanol Espacio Central (labels/paneles/vista de consultante).
  - Bloqueo de modulos y opciones de fase posterior en Astrologia Profesional (incluye Compuesta/Davison y overlays simbolicos no permitidos en modo real).
  - Verificacion de aislamiento: sin imports cruzados entre dominios (clinico ↔ astrologia) y sin `_legacy_*` dentro del workspace de Astrologia.
- Alcance actual: frontend + capas reales controladas (sin PDFs, sin IA interpretativa, sin lenguaje médico)

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
