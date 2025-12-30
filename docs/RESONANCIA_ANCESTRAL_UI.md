# Resonancia Ancestral — UI (SWM)

## Propósito

Workspace simbólico de observación: **cartografía simbólica — no clínica**.

## Estados (obligatorios)

### 1) Sin consultante activo

- Mensaje informativo: “Seleccione un consultante para visualizar la Resonancia Ancestral.”
- No hay bloqueo duro ni errores.

### 2) Con consultante

- Renderiza scaffolding visual **T1–T4**.
- Modo read-only.
- Sin inferencias, sin recomendaciones, sin automatización decisoria.
- Sin llamadas a backend.

### 2b) Datos parciales del consultante

- El workspace permanece accesible.
- Algunas visualizaciones pueden mostrarse de forma limitada.

### 3) Error controlado

- No debe crashear el workspace.
- Ante ausencia de datos mínimos, debe degradar a mensajes informativos.

## Estructura visual (actual)

- Header con título y retorno a `/dashboard/therapist`
- Card de disclaimers observacionales
- Grid de 4 paneles: T1, T2, T3, T4

## Release interno (resumen)

Microcopy final:

- Banner superior observacional (sin inferencias automáticas).
- Descripciones profesionales para T1–T4.
- Aviso de datos incompletos (degradación informativa).

Tooltips simbólicos:

- No incluidos en este release.

Leyenda visual:

- No incluida en este release.

## Checklist de verificación

- [x] Build OK (`npm -C tonyblanco-app run build`)
- [x] Navegación OK (ruta `/dashboard/therapist/resonancia-ancestral`)
- [x] Core intacto (workspace terapeuta sin cambios)
- [x] Cero legacy (sin imports desde `_legacy_*`)
- [x] Cero clínica (lenguaje y UI no clínica)
- [x] Read-only confirmado (sin cálculos, sin inferencias, sin automatización)

## Lenguaje permitido

- Observacional, descriptivo, no determinista.
- Prohibido: lenguaje clínico, diagnóstico, etiquetas, inferencias automáticas.
