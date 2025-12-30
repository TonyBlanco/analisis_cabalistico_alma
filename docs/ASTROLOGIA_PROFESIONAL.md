---

## Astrología Profesional — Frontend (estado operativo)

### Propósito

- Visualización profesional (SVG) para lectura holística.
- El sistema evita lenguaje clínico/diagnóstico y no incluye PDFs en las fases actuales.

### Motor astronómico (backend existente)

- Swiss Ephemeris (cálculo real).
- Cálculo **bajo demanda** (no automático) desde el frontend mediante el botón **“Recalcular carta”**.

### Identidad canónica (requerida para cálculo real)

Para **calcular** y persistir una carta natal real se requiere identidad completa:

- Fecha, hora y zona horaria
- Ciudad/país + coordenadas (lat/lon)

Si falta información: la UI puede renderizar placeholder, pero **no dispara cálculo**.

### Flujo de cálculo (FASE 3)

1. El terapeuta abre `/dashboard/therapist/astrologia`.
2. Al pulsar **“Recalcular carta”**:
   - Se ejecuta el cálculo real de la carta natal (backend).
   - El backend puede devolver un `analysis_result` con técnicas adicionales (si están habilitadas en servidor).
3. La rueda se refresca automáticamente con los datos calculados; no existe recálculo automático por cambios de UI.

### Capas reales activadas (FASE 3)

Estas capas se consideran **reales** porque provienen del `analysis_result` del backend (Swiss Ephemeris) y se pueden activar/desactivar **solo a nivel visual** (no disparan cálculo por sí mismas):

- Carta natal (base)
- Tránsitos (si el backend los devuelve)
- Progresiones (si el backend las devuelve)
- Retorno Solar (si el backend lo devuelve)
- Doble rueda (sinastría) con carta secundaria real al seleccionar pareja (se usa su payload natal existente; no compuesta/Davison)

### Capas y módulos bloqueados explícitamente (FASE 3)

Se mantienen visibles con tooltip de “fase posterior”, sin permitir cálculo accidental:

- Arco Solar (no disponible en backend actual para este flujo)
- Retorno Lunar (no disponible en backend actual para este flujo)
- Armónicos
- Persona Charts
- Relocación
- Estilo HUBER
- Estrellas fijas
- Compuesta / Davison

### Terminología canónica

| Prohibido   | Correcto          |
|-----------:|-------------------|
| paciente    | consultante       |
| diagnóstico | lectura simbólica |
| clínico     | holístico         |

### Estado tras FASE 3

- Cálculo real controlado: **solo** por acción explícita del usuario (botón).
- Capas reales disponibles: natal + (tránsitos/progresiones/retorno solar) si el backend las entrega.
- Doble rueda real disponible vía selección de pareja (sin compuesta/Davison).
- Módulos no implementados: bloqueados y documentados.
