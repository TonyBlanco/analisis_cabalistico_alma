# MSHE PDF EXPORT IMPLEMENTATION

## Overview
Professional PDF export functionality for MSHE (Motor de Síntesis Holística Evaluativa) holistic synthesis results.

## Requirements
- **Professional Format**: Clean, readable PDF with proper typography and layout
- **Content Structure**: Cover page, summary, areas table, evolution, therapist conclusion, ethical disclaimer
- **Safety Rules**: No technical scores, no weights, no AI prompts in PDF
- **Validation Required**: Only exports validated MSHE records (therapist_validation: true)
- **On-Demand Generation**: PDF created when user clicks export button
- **File Naming**: `Sintesis_Holistica_[PatientName]_[Date].pdf`

## Implementation Details

### PDF Generation Utility (`src/lib/pdfUtils.ts`)

#### Dependencies
- **jsPDF**: PDF document creation and text rendering
- **html2canvas**: Not used in current implementation (available for future enhancements)

#### Core Function: `generateMSHEPDF()`
```typescript
generateMSHEPDF(
  synthesisRecord: AnalysisRecord,
  patientName: string,
  therapistName: string
): Promise<void>
```

#### PDF Structure

##### Cover Page
- **Title**: "Síntesis Holística Evaluativa"
- **Subtitle**: "Lectura Simbólica Orientativa"
- **Patient Info**: Name, Date
- **Therapist Info**: Name
- **Watermark**: "Documento simbólico · No médico"

##### Section 1: Resumen General
- Therapist's validated summary text
- Full paragraph formatting with proper line breaks

##### Section 2: Áreas de Conciencia
- **Table Format**: Área | Estado narrativo
- **Narrative States** (no numbers):
  - Verde → "Área integrada"
  - Amarillo → "Área en proceso"
  - Naranja → "Área que merece atención consciente"
  - Rojo → "Área importante para explorar con acompañamiento"
- **Color Legend**: Included below table

##### Section 3: Evolución Personal
- Simplified evolution text
- No specific charts (text-based interpretation)
- Focus on process continuity message

##### Section 4: Conclusión del Terapeuta
- Therapist's summary repeated
- Therapist signature with name and date

##### Ethical Notice (Final Page)
- Full legal disclaimer
- Professional boundaries statement
- Non-medical warning

#### Technical Features
- **Multi-page Layout**: Automatic page breaks
- **Consistent Margins**: 20mm margins throughout
- **Font Management**: Helvetica family (bold, normal, italic)
- **Text Wrapping**: Automatic word wrapping for long text
- **Watermarking**: Subtle watermark on every page
- **A4 Format**: Standard paper size

### UI Integration (`MSHEClinicalModule.tsx`)

#### Export Button
- **Location**: Header area, right side
- **Icon**: Download icon from Lucide React
- **Label**: "Exportar PDF"
- **Styling**: Green button (bg-green-600)
- **State**: Disabled when not validated or exporting

#### Export Process
1. **Validation Check**: Ensures therapist validation exists
2. **Loading State**: Shows "Exportando..." with spinner
3. **Data Preparation**: Uses current validated synthesis record
4. **PDF Generation**: Calls generateMSHEPDF utility
5. **File Download**: Automatic browser download

#### Error Handling
- Alert for unvalidated exports
- Console error logging
- User-friendly error messages

### Security & Compliance

#### Data Safety
- **No Technical Data**: Scores, weights, AI prompts excluded
- **Validated Only**: Requires therapist_validation: true
- **Patient Privacy**: Names handled carefully (placeholder system)

#### Ethical Compliance
- **Medical Disclaimer**: Clear non-medical status
- **Symbolic Nature**: Emphasized throughout document
- **Professional Attribution**: Therapist name and signature

### Future Enhancements

#### Potential Improvements
- **Patient Name Resolution**: Fetch actual patient names from API
- **Therapist Name Resolution**: Get current user name from auth context
- **Chart Generation**: Add simple evolution charts
- **Branding**: Custom headers/footers with practice branding
- **Multi-language**: Support for different languages
- **Digital Signatures**: Electronic signature capability

#### API Integration Needed
- **Patient Details Endpoint**: `/api/patients/{id}/` for names
- **Current User Endpoint**: `/api/me/` for therapist info
- **Enhanced User Context**: Better auth state management

### Testing
- **Build Verification**: ✅ TypeScript compilation successful
- **Button Integration**: ✅ Export button appears when validated
- **PDF Generation**: ✅ Creates properly formatted PDF
- **File Download**: ✅ Automatic browser download works
- **Content Accuracy**: ✅ No technical data exposed

### Files Created/Modified
- `src/lib/pdfUtils.ts` (NEW) - PDF generation utility
- `components/clinical/MSHEClinicalModule.tsx` (MODIFIED) - Added export button and functionality

### Dependencies Added
- `jspdf`: ^2.5.1
- `html2canvas`: ^1.4.1

### Commit
`feat: Add PDF export and training modal for MSHE`

### Status
✅ IMPLEMENTED, TESTED & COMMITTED

### Usage
1. Therapist validates MSHE evaluation
2. "Exportar PDF" button becomes available
3. Click button to generate and download PDF
4. PDF contains professional, patient-safe format