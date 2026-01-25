---

## Astrología Profesional — Frontend (estado operativo)

### Propósito

- Visualización profesional (SVG) para lectura holística.
- El sistema evita lenguaje médico/diagnóstico y no incluye PDFs en las fases actuales.

### Aislamiento por dominios

- Astrologia Profesional vive en su workspace: `tonyblanco-app/app/(dashboard)/dashboard/therapist/(swm)/astrologia/page.tsx` y `tonyblanco-app/components/AstrologyWorkspace/*`.
- Astrologia Profesional NO debe importar vistas del core (`tonyblanco-app/components/clinical/*`) ni usar `_legacy_*`.
- El Espacio Central vive en `tonyblanco-app/app/(dashboard)/dashboard/therapist/(core)/*` y `tonyblanco-app/components/TherapistClinicalDashboard/*`.
- El Espacio Central NO debe importar componentes de Astrologia (`tonyblanco-app/components/AstrologyWorkspace/*`).

### Motor astronómico (backend existente)

- Swiss Ephemeris (cálculo real).
- Cálculo **bajo demanda** (no automático) desde el frontend mediante el botón **“Recalcular carta”**.

### Identidad canónica (requerida para cálculo real)

Para **calcular** y persistir una carta natal real se requiere identidad completa:

- Fecha, hora y zona horaria
- Ciudad/país + coordenadas (lat/lon)

Si falta información: la UI puede renderizar placeholder, pero **no dispara cálculo**.

### Flujo de cálculo (FASE 3)

1. El profesional abre `/dashboard/therapist/astrologia`.
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

---

## Fixes Aplicados (2026-01-25)

### 1. Bug crítico: Botón "Recalcular carta" deshabilitado sin carta

**Archivo**: `tonyblanco-app/components/AstrologyWorkspace/AstrologyProfessionalView.tsx`

**Problema**: El botón tenía `disabled={!hasChart}` que impedía calcular la primera carta (deadlock UX).

**Fix**: Se removió `!hasChart` de la condición disabled. Ahora solo requiere `consultante?.id && calculateChart`.

### 2. UX mejorada: Banner informativo cuando no hay carta

**Archivo**: `tonyblanco-app/components/AstrologyWorkspace/AstrologyProfessionalView.tsx`

**Antes**: Mensaje genérico "Completa datos de nacimiento".

**Después**: Banner azul con botón prominente "✨ Calcular carta natal" cuando `hasIdentity=true`.

### 3. Bug de timezone en multitech_payload

**Archivo**: `backend/api/astrology_kerykeion/multi_tech.py`

**Problema**: `TypeError: can't subtract offset-naive and offset-aware datetimes` al calcular progresiones.

**Fix**: Consistencia de timezone entre `birth_dt` y `ref_dt`:
- Si `ref_dt` es timezone-aware, se convierte `birth_dt` a aware usando la zona del input
- Fallback: si falla, ambos se convierten a naive

### Verificación (2026-01-25 17:54 UTC)

```
AstrologyNatalChart EXISTS for patient_id=4: True
  - ID: 1
  - calculated_at: 2026-01-25 17:54:05.074129+00:00
  - house_system: placidus
  - source: kerykeion
  - chart_payload keys: ['planetas', 'casas', 'aspectos', 'metadatos', 'cabalistic_data']
  - planetas count: 10
```

✅ Capas multitech (tránsitos, progresiones, retorno solar) funcionan correctamente.

---

## AI Interpretación (2026-01-25)

### Nuevos Archivos Backend

| Archivo | Descripción |
|---------|-------------|
| `backend/api/astrology_ai_prompts.py` | Catálogo de prompts para natal, tránsitos, progresiones, retorno solar |
| `backend/api/astrology_ai_service.py` | Servicio AI con integración Gemini |
| `backend/api/astrology_ai_views.py` | Endpoints REST para interpretación AI |

### Nuevos Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/astrology/ai-status/` | GET | Estado del servicio AI |
| `/api/astrology/interpret/natal/` | POST | Interpretación carta natal |
| `/api/astrology/interpret/transits/` | POST | Interpretación tránsitos |
| `/api/astrology/interpret/progressions/` | POST | Interpretación progresiones |
| `/api/astrology/interpret/solar-return/` | POST | Interpretación retorno solar |
| `/api/astrology/interpret/situation/` | POST | Consulta situacional (chat) |

### Nuevos Componentes Frontend

| Componente | Descripción |
|------------|-------------|
| `AIInterpretationPanel.tsx` | Panel de interpretación por capas (Fase 1) |
| `AISituationChat.tsx` | Chat interactivo para consultas situacionales (Fase 2) |

Ambos integrados en `AstrologyProfessionalView.tsx` después de la sección de capas profesionales.

### Verificación

Para probar Fase 1 (Interpretaciones por capa):
1. Navegar a `/dashboard/therapist/astrologia`
2. Seleccionar un consultante con carta calculada
3. Usar los botones del panel "Interpretación AI"

Para probar Fase 2 (Chat situacional):
1. Expandir el panel "Consultas Situacionales"
2. Escribir una pregunta o usar las sugeridas
3. Recibir respuesta contextualizada del AI

- Módulos no implementados: bloqueados y documentados.

