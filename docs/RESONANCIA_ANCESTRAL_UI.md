# Resonancia Ancestral — UI (SWM)

## Propósito

Workspace simbólico de observación: **cartografía simbólica — no clínica**.

## Estados (obligatorios)

### 1) Sin consultante activo

- Mensaje informativo: “Seleccione un consultante para visualizar la Resonancia Ancestral.”
- No hay bloqueo duro ni errores.

### 2) Con consultante

- Renderiza scaffolding visual **T1–T4** (placeholder).
- Modo read-only.
- Sin inferencias, sin recomendaciones, sin automatización decisoria.
- Sin llamadas a backend.

### 3) Error controlado

- No debe crashear el workspace.
- Ante ausencia de datos mínimos, debe degradar a mensajes informativos.

## Estructura visual (actual)

- Header con título y retorno a `/dashboard/therapist`
- Card de disclaimers observacionales
- Grid de 4 paneles: T1, T2, T3, T4 (placeholder)

## Lenguaje permitido

- Observacional, descriptivo, no determinista.
- Prohibido: lenguaje clínico, diagnóstico, etiquetas, inferencias automáticas.

