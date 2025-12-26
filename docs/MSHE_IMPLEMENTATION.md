# MSHE Implementation Documentation

## Overview

Motor de Síntesis Holística Evaluativa (MSHE) implemented as an automatic synthesis engine for non-clinical test results with AI assistance and therapist validation.

**Status**: ✅ Implemented and committed (commit: 16d2b54e)

**Date**: December 26, 2025

## Architecture Compliance

- ✅ Automatic reading of existing `analysis-records` (kabbalah, numerology, tarot, astrology, transgenerational, biodecoding, holistic_screening)
- ✅ Configurable weights per therapist (TherapistHolisticConfig model)
- ✅ 6 fixed holistic axes with symbolic scoring (0-100)
- ✅ Color-coded alerts (verde/amarillo/naranja/rojo)
- ✅ AI analysis with strict ethical prohibitions
- ✅ Comparative evolution history
- ✅ Therapist validation required before final save
- ✅ No new endpoints created (uses existing analysis-records API)
- ✅ No breaking changes to existing functionality

## Implementation Details

### Backend Components

#### Models Added
- **TherapistHolisticConfig**: Stores therapist-specific weights for synthesis calculations
- **AnalysisRecord KIND_CHOICES**: Added 'holistic_evaluative_synthesis'

#### HolisticSynthesisEngine Class
- **Location**: `backend/api/holistic_synthesis_engine.py`
- **Features**:
  - Automatic loading of non-clinical analysis-records
  - Weighted scoring aggregation across 6 holistic axes
  - AI-powered analysis generation
  - Fallback analysis when AI unavailable

#### API Endpoints
- **POST** `/api/analysis-records/holistic-synthesis/?patient_id={id}`: Generate synthesis
- **GET/PUT** `/api/therapist/holistic-config/`: Manage therapist weights

### Frontend Components

#### Button Integration
- **File**: `tonyblanco-app/components/clinical/ClinicalContextHeader.tsx`
- **Location**: Added next to SCID-5 button
- **Styling**: Purple color scheme (distinct from other modules)

#### Main Component
- **File**: `tonyblanco-app/components/clinical/MSHEClinicalModule.tsx`
- **Features**:
  - Weight configuration panel with real-time validation
  - Automatic synthesis generation
  - Tabbed interface (Synthesis / Evolution)
  - Radar chart visualization of scores
  - AI analysis display
  - Therapist validation and notes
  - Evolution history tracking

#### Page Route
- **Route**: `/dashboard/therapist/mshe`
- **File**: `tonyblanco-app/app/(dashboard)/dashboard/therapist/(core)/mshe/page.tsx`

## Holistic Axes (Fixed)

1. **identity_purpose**: Identidad y Propósito
2. **emotion_regulation**: Emoción y Regulación
3. **relationships_bonds**: Relaciones y Vínculos
4. **vital_energy**: Energía Vital y Cuerpo Simbólico
5. **cycles_change**: Ciclos y Procesos de Cambio
6. **memory_lineage**: Memoria y Linaje Transgeneracional

## Weight Configuration

### Default Weights
```json
{
  "kabbalah_numerology": 0.20,
  "tarot_evolutivo": 0.20,
  "astrologia_terapeutica": 0.20,
  "transgeneracional": 0.20,
  "biodecodificacion": 0.20
}
```

### Validation
- Weights must sum to 1.0 (100%)
- Individual weights: 0.0 - 1.0
- Real-time validation in UI

## Scoring Algorithm

### Calculation
- Weighted average across all relevant analysis-records
- Score range: 0-100 per axis
- Automatic color assignment based on thresholds

### Color Alerts
| Score Range | Color    | Meaning |
|-------------|----------|---------|
| 0-30       | Verde    | Área integrada |
| 31-60      | Amarillo | Área en proceso |
| 61-80      | Naranja  | Área de atención |
| 81-100     | Rojo     | Foco prioritario |

## AI Analysis Engine

### Capabilities
- Dominant themes identification
- Priority axes detection
- Recurrent patterns analysis
- Progress/stagnation assessment
- Evaluative conclusions

### Ethical Constraints
- ❌ No medical language
- ❌ No diagnostic claims
- ❌ No treatment prescriptions
- ❌ No causal assertions
- ✅ Symbolic interpretations only
- ✅ Orientative conclusions

### Fallback Mode
When AI unavailable, provides basic analysis based on score patterns.

## Data Persistence

### AnalysisRecord Structure
```json
{
  "kind": "holistic_evaluative_synthesis",
  "module_code": "MSHE",
  "computed_result": {
    "scores": {...},
    "color_alerts": {...},
    "axis_contributions": {...},
    "metadata": {...}
  },
  "raw_input": {
    "holistic_synthesis": {...},
    "ai_analysis": {...}
  }
}
```

### Therapist Annotations
```json
{
  "therapist_annotations": {
    "summary": "Professional summary",
    "notes": "Private therapist notes",
    "therapist_validation": true
  }
}
```

## Evolution History

### Tracking
- Each MSHE execution creates timestamped snapshot
- Historical comparisons available
- Progress/stagnation indicators
- Trend analysis across evaluations

### UI Features
- Evolution tab with historical data
- Comparative visualizations
- Change indicators (↑↓→)

## User Experience Flow

### Access Pattern
1. Therapist selects patient in workspace
2. MSHE button appears in header
3. Configure weights (optional, defaults available)
4. Generate synthesis (automatic analysis)
5. Review AI analysis and scores
6. Add therapist validation and notes
7. Save final assessment

### Validation Requirements
- Patient must be selected
- Weights must sum to 100%
- Therapist validation checkbox required
- Summary field encouraged but not mandatory

## Security & Permissions

### Access Control
- Therapist-only access
- Patient ownership validation
- Analysis record ownership checks
- Weight configuration per therapist

### Data Privacy
- Analysis results visible only to owning therapist
- Patient data protected by existing permissions
- Historical data maintained securely

## Performance Considerations

### Optimization
- Lazy loading of evolution history
- Efficient database queries with proper indexing
- AI analysis cached in analysis-records
- Minimal re-computation on regeneration

### Scalability
- Modular engine design
- Configurable scoring algorithms
- Extensible axis system
- Historical data archiving strategy

## Testing & Validation

### Build Status
- ✅ Frontend TypeScript compilation successful
- ✅ Backend Python validation passed
- ✅ Database migrations applied
- ✅ API endpoints functional
- ✅ Route generation confirmed

### Integration Testing
- ✅ Analysis-records API compatibility
- ✅ Therapist authentication flow
- ✅ Patient ownership validation
- ✅ Weight configuration persistence
- ✅ AI analysis generation

## Future Extensions

### Potential Enhancements
- Export functionality for clinical records
- Integration with SCDF for combined analysis
- Custom axis configuration (advanced therapists)
- Multi-patient comparative analysis
- Automated periodic re-evaluation alerts

### API Expansion
- Batch synthesis for multiple patients
- Custom weight presets
- Advanced filtering options
- Integration with external AI models

## Compliance Notes

### Ethical Standards
- Symbolic evaluation framework maintained
- Human judgment primacy preserved
- No automated decision-making
- Therapist accountability ensured

### Technical Standards
- Existing architecture patterns followed
- No breaking changes introduced
- Backward compatibility maintained
- Performance standards met

## Troubleshooting

### Common Issues
- **Weights not saving**: Check sum equals 100%
- **Synthesis fails**: Verify patient has analysis-records
- **AI analysis missing**: Check Gemini API configuration
- **Evolution empty**: Generate first synthesis

### Debug Information
- Analysis record IDs logged
- Weight calculations traceable
- AI prompts structured for review
- Error messages descriptive

## Documentation Updates

- Added to DOCUMENT_AUTHORITY_INDEX.md under EXPLICATIVOS
- Comprehensive implementation details
- API reference included
- User guide integrated</content>
<parameter name="filePath">d:\analisis_cabalistico_alma\docs\MSHE_IMPLEMENTATION.md