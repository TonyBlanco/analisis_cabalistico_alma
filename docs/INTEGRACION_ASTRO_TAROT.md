# Integración Astrología-Tarot/Oráculo

> **Versión**: 1.0.0  
> **Fecha**: 2026-01-28  
> **Estado**: ✅ Implementado

## Resumen

Esta integración permite enriquecer automáticamente las lecturas simbólicas de Tarot/Oráculo con datos astrológicos del consultante. El enriquecimiento es **siempre opcional** y requiere que el consultante tenga una carta natal calculada.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                          │
│  ┌─────────────────────┐    ┌────────────────────────────────┐ │
│  │ TarotDrawPanel      │───▶│ AstrologyEnrichmentToggle      │ │
│  │ (existing)          │    │ [x] Enriquecer con astro       │ │
│  └─────────────────────┘    └────────────────────────────────┘ │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
                                   ▼ POST /api/swm-v3/symbolic-readings/
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Django DRF)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            api/services/astrology_context_builder.py      │  │
│  │  - get_prompt_context() → HTTP interno                    │  │
│  │  - build_symbolic_context_text() → Texto para prompts     │  │
│  │  - enrich_tarot_reading_context() → Orquestación          │  │
│  └───────────────────────────────┬──────────────────────────┘  │
│                                  │ HTTP interno                 │
│                                  ▼                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │     astrology/api/context_summary_view.py (NUEVO)         │  │
│  │  GET /api/therapist/patients/{id}/astrology/context-summary/│
│  │  - Agrega datos de natal, transits, progressions          │  │
│  │  - Genera symbolic_prompt_context                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Archivos Creados/Modificados

### Nuevos Archivos

| Archivo | Descripción |
|---------|-------------|
| [backend/api/services/astrology_context_builder.py](../backend/api/services/astrology_context_builder.py) | Servicio que orquesta llamadas HTTP internas al workspace de astrología |
| [backend/astrology/api/context_summary_view.py](../backend/astrology/api/context_summary_view.py) | Endpoint read-only que agrega datos de múltiples engines |
| [tonyblanco-app/components/tarot/AstrologyEnrichmentToggle.tsx](../tonyblanco-app/components/tarot/AstrologyEnrichmentToggle.tsx) | Componente UI para toggle granular |

### Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| [backend/astrology/api/urls.py](../backend/astrology/api/urls.py) | Nueva ruta `context-summary/` |
| [backend/symbolic/swm_v3/views.py](../backend/symbolic/swm_v3/views.py) | `generate_educational_reading()` acepta `astrology_enrichment` opcional |
| [tonyblanco-app/components/tarot/TarotDrawPanel.tsx](../tonyblanco-app/components/tarot/TarotDrawPanel.tsx) | Integración del toggle y envío de opciones |
| [tonyblanco-app/components/tarot/index.ts](../tonyblanco-app/components/tarot/index.ts) | Export del nuevo componente |

## API Reference

### GET /api/therapist/patients/{patient_id}/astrology/context-summary/

**Permisos**: `IsAuthenticated`, `IsTherapist`, `CanAccessPatient`

**Query Parameters**:

| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `include_transits` | bool | `true` | Incluir tránsitos planetarios actuales |
| `include_progressions` | bool | `true` | Incluir progresiones secundarias |
| `include_solar_return` | bool | `false` | Incluir revolución solar (costoso) |
| `transit_orb` | float | `2.0` | Orbe máximo para tránsitos (grados) |

**Response 200**:

```json
{
  "natal_summary": {
    "sun": { "sign": "Leo", "degree": 15.5, "house": 10 },
    "moon": { "sign": "Cáncer", "degree": 22.3, "house": 9 },
    "rising": { "sign": "Escorpio", "degree": 5.1 },
    "dominant_element": "Fuego",
    "dominant_modality": "Fijo"
  },
  "current_transits": [
    { "planet": "Saturno", "aspect": "cuadratura", "natal_point": "Sol", "orb": 1.2, "applying": true }
  ],
  "progressions": {
    "progressed_moon_sign": "Virgo",
    "progressed_moon_phase": "Balsámica",
    "progressed_sun_sign": "Virgo"
  },
  "solar_return": {
    "year_themes": ["Carrera y vocación"],
    "sr_rising": "Capricornio",
    "sr_sun_house": 6
  },
  "symbolic_prompt_context": "Sol en Leo (casa 10). Luna en Cáncer (casa 9). Ascendente Escorpio. Elemento dominante: Fuego. Tránsito activo: Saturno cuadratura Sol",
  "metadata": {
    "patient_id": 123,
    "computed_at": "2026-01-28T15:30:00Z",
    "natal_chart_date": "1990-05-15T10:30:00Z"
  }
}
```

**Response 404**: No hay carta natal calculada

## Uso en Frontend

```tsx
import { AstrologyEnrichmentToggle, DEFAULT_ASTROLOGY_OPTIONS } from '@/components/tarot';

// En tu componente
const [astrologyOptions, setAstrologyOptions] = useState(DEFAULT_ASTROLOGY_OPTIONS);
const [hasNatalChart, setHasNatalChart] = useState(false);

// Verificar carta natal al cargar
useEffect(() => {
  checkIfPatientHasNatalChart(patientId).then(setHasNatalChart);
}, [patientId]);

// Render
<AstrologyEnrichmentToggle
  hasNatalChart={hasNatalChart}
  value={astrologyOptions}
  onChange={setAstrologyOptions}
  isLoading={checkingNatalChart}
/>
```

## Uso en Backend

```python
from api.services.astrology_context_builder import AstrologyContextBuilder

# Obtener contexto para enriquecer lectura
builder = AstrologyContextBuilder(auth_token=request.auth.key)
enrichment = builder.enrich_tarot_reading_context(
    patient_id=patient.id,
    existing_context=intention,
    enrichment_options={
        'include_transits': True,
        'include_progressions': True,
        'include_solar_return': False,
    }
)

if enrichment['enriched']:
    # Usar enrichment['combined_context'] en el prompt de IA
    # Usar enrichment['astrology_context'] para datos estructurados
    pass
```

## Test Steps Manuales

### 1. Verificar endpoint de contexto

```bash
# Desde backend/
curl -X GET "http://localhost:8000/api/therapist/patients/1/astrology/context-summary/" \
  -H "Authorization: Token <tu-token>" \
  -H "Content-Type: application/json"
```

Esperado: JSON con `natal_summary`, `current_transits`, `progressions`, `symbolic_prompt_context`

### 2. Verificar toggle en UI

1. Abrir panel de Tarot con un consultante que tenga carta natal
2. El toggle "Enriquecer con datos astrológicos" debe estar habilitado
3. Activar toggle y expandir opciones
4. Verificar checkboxes: Tránsitos, Progresiones, Revolución Solar

### 3. Verificar flujo completo

1. Activar toggle de astrología
2. Ejecutar lectura de Tarot
3. Verificar en respuesta: `astrology_enrichment.enabled: true`
4. Verificar en logs backend: `[SWM-v3] Astrology enrichment applied: X chars`

### 4. Verificar sin carta natal

1. Seleccionar consultante SIN carta natal
2. Toggle debe estar deshabilitado con mensaje informativo
3. Lectura funciona normalmente sin enriquecimiento

## Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| **Latencia HTTP interno** | Timeout de 10s, fallback graceful si falla |
| **Sin carta natal** | Toggle deshabilitado, lectura funciona sin astro |
| **Errores de cálculo** | Cada engine wrapped en try/catch, logs de warning |
| **Prompt demasiado largo** | `symbolic_prompt_context` limitado a 500 chars |
| **Performance solar return** | Opción separada, deshabilitada por defecto |

## Principios de Diseño

1. **Zero imports cruzados**: `api/` no importa de `astrology/engine/`
2. **HTTP interno**: Preparado para futura extracción a microservicio
3. **Siempre opcional**: Enriquecimiento nunca es obligatorio
4. **Graceful degradation**: Errores no rompen la lectura base
5. **Terminología holística**: Consultante, lectura simbólica, no paciente/diagnóstico

---

## Changelog

### v1.1.0 (2026-01-29)

- ✅ **Auto-carga de workspace activo**: El componente `AstrologyTarotWorkspace` ahora detecta automáticamente si el consultante tiene un workspace de Tarot activo y lo carga. Ver [SWM_TAROT_AUTO_LOAD_WORKSPACE.md](./SWM_TAROT_AUTO_LOAD_WORKSPACE.md)
- ✅ Indicador visual de workspace activo (badge verde con pulso)
- ✅ Prevención de error 400 al intentar crear workspace duplicado
- ✅ Estados de carga mejorados: "Verificando workspace...", "Cargando consultante..."

### v1.0.0 (2026-01-28)

- ✅ Creado `AstrologyContextBuilder` service
- ✅ Creado endpoint `context-summary/` en astrology workspace
- ✅ Modificado `generate_educational_reading()` para aceptar enriquecimiento
- ✅ Creado componente `AstrologyEnrichmentToggle`
- ✅ Integrado toggle en `TarotDrawPanel`
- ✅ Documentación completa
