# Integración BioEmotional ↔ SWM Analytics

## Resumen

Este documento describe la integración del módulo BioEmotional Corporal con los módulos de análisis SWM (Sintaxis-Wellness-Matrix): MSHE y SCID-5.

## Arquitectura

```
┌──────────────────────────────────────────────────────────────────┐
│                    Flujo de Datos BioEmotional                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐                                             │
│  │  BioEmotional   │                                             │
│  │    Sessions     │                                             │
│  │  (Simbiosis)    │                                             │
│  └────────┬────────┘                                             │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                             │
│  │ Export API      │                                             │
│  │ /export/{id}/   │                                             │
│  └────────┬────────┘                                             │
│           │                                                      │
│     ┌─────┴─────┐                                                │
│     ▼           ▼                                                │
│ ┌───────────┐ ┌───────────┐                                      │
│ │   MSHE    │ │  SCID-5   │                                      │
│ │  Import   │ │ Correlate │                                      │
│ └───────────┘ └───────────┘                                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Endpoints Backend

### 1. Export BioEmotional Data
**GET** `/api/bioemotional/export/{patient_id}/`

Exporta todos los datos BioEmotional de un paciente para integración SWM.

**Response:**
```json
{
  "patient_id": 123,
  "total_sessions": 5,
  "sessions": [...],
  "top_regions": [
    {"region_id": "chest", "count": 8, "avg_intensity": 0.75}
  ],
  "emotional_trends": [
    {"emotion": "ansiedad", "total_mentions": 12, "avg_intensity": 0.6}
  ],
  "heatmap_aggregate": {
    "chest": {"total_intensity": 15.5, "observations": 8}
  }
}
```

### 2. Import to MSHE
**POST** `/api/bioemotional/mshe-import/`

Importa datos BioEmotional al módulo MSHE como peso holístico.

**Request:**
```json
{
  "patient_id": 123
}
```

**Response:**
```json
{
  "integrated": true,
  "mshe_snapshot_id": "snap_abc123",
  "regions_imported": 5,
  "new_weight_contribution": 0.15
}
```

### 3. Correlate with SCID-5
**POST** `/api/bioemotional/scid5-correlate/`

Correlaciona regiones corporales con secciones SCID-5.

**Request:**
```json
{
  "patient_id": 123,
  "scid5_section": "emotional_vitality"
}
```

**Response:**
```json
{
  "scid5_section": "emotional_vitality",
  "matched_regions": [
    {"region": "chest", "count": 5},
    {"region": "stomach", "count": 3}
  ],
  "correlation_strength": 0.72,
  "clinical_notes": "Alta correlación con somatización emocional"
}
```

## Mapeo SCID-5 ↔ Regiones Corporales

| Sección SCID-5 | Regiones Corporales Asociadas |
|----------------|-------------------------------|
| `emotional_vitality` | chest, heart, stomach, solar_plexus |
| `anxiety_calm` | chest, throat, shoulders, stomach, head |
| `meaning_reality` | head, forehead, eyes, crown |
| `impact_memory` | back, shoulders, neck, lower_back |
| `self_regulation` | hands, arms, legs, pelvis |
| `identity_relationships` | heart, throat, pelvis, face |

## Frontend Integration

### MSHEClinicalModule.tsx

El módulo MSHE incluye:

1. **Panel de Integración BioEmotional**
   - Muestra estadísticas de sesiones
   - Lista regiones corporales más activas
   - Muestra tendencias emocionales
   - Botón para importar datos a MSHE

2. **Nuevo Peso Holístico**
   - `bioemotional_corporal`: 0.15 (15%)
   - Se auto-ajusta al importar datos

### SCID5ClinicalModule.tsx

El módulo SCID-5 incluye:

1. **Badges de Correlación**
   - Cada sección muestra número de regiones correlacionadas
   - Indicador visual en el encabezado

2. **Panel de Correlación**
   - Lista regiones corporales asociadas
   - Muestra fuerza de correlación (%)
   - Notas clínicas automáticas

## API Client (TypeScript)

```typescript
import { 
  exportForSWM,
  importToMSHE,
  correlateSCID5,
  correlateSCID5AllSections
} from '@/lib/api/bioemotional-clinical';

// Exportar datos
const data = await exportForSWM(patientId);

// Importar a MSHE
const result = await importToMSHE(patientId);

// Correlacionar sección específica
const correlation = await correlateSCID5(patientId, 'emotional_vitality');

// Correlacionar todas las secciones
const allCorrelations = await correlateSCID5AllSections(patientId);
```

## Restricciones

- **SCDF es read-only**: No se escriben datos en SCDF (per GEMINI.md audit)
- Los datos BioEmotional solo se exportan, no se modifican desde otros módulos
- La correlación es de lectura: no altera datos originales

## Testing

```powershell
# Verificar endpoints
curl -X GET http://localhost:8000/api/bioemotional/export/4/ \
  -H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:8000/api/bioemotional/mshe-import/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"patient_id": 4}'

curl -X POST http://localhost:8000/api/bioemotional/scid5-correlate/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"patient_id": 4, "scid5_section": "anxiety_calm"}'
```

## Changelog

- **2025-01-24**: Upgrade 2D → 3D Body Visualization completado
  - `BodyVisualization3D.tsx` (421 líneas): Componente Three.js/React Three Fiber
  - `BodyVisualizationToggle.tsx` (201 líneas): Toggle 2D/3D con WebGL fallback
  - Dependencias: @react-three/fiber ^9.5.0, @react-three/drei ^10.7.7, three ^0.182.0
  - Features: OrbitControls, heatmap en 3D, labels HTML, auto-rotate opcional

- **2025-01-XX**: Implementación inicial de integración SWM
  - Backend: Export, MSHE Import, SCID-5 Correlate endpoints
  - Frontend: Panel en MSHE, badges y panel en SCID-5
  - Documentación completa
