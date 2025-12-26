# MSHE TRAINING MODAL IMPLEMENTATION

## Overview
Interactive training and governance modal for therapists using the MSHE (Motor de Síntesis Holística Evaluativa) system.

## Requirements
- **Educational Purpose**: Teach responsible MSHE usage
- **Governance Enforcement**: Prevent misuse and reinforce ethical boundaries
- **Accessibility**: "Uso Responsable" button visible only to therapists
- **Modal Interface**: Non-page modal that doesn't interrupt workflow
- **Comprehensive Content**: Cover what MSHE is/isn't, do's/don'ts, AI usage, legal warnings
- **Acknowledgment**: Optional checkbox for usage confirmation

## Implementation Details

### Modal Component (`MSHETrainingModal.tsx`)

#### Structure
- **Header**: Title with Heart icon, close button
- **Content**: 6 main sections with color-coded information
- **Footer**: Acknowledgment checkbox and close button

#### Content Sections

##### Section 1: ✅ What MSHE IS
**Positive framing with green theme**
- Symbolic mirror reflecting holistic patterns
- Integration tool connecting different perspectives
- AI-assisted therapeutic support (not substitute)
- Symbolic companion for professional guidance

##### Section 2: ❌ What MSHE is NOT
**Critical warnings with red theme**
- Not a medical/psychological/clinical diagnosis
- Not a quantitative evaluation of mental health
- Not a definitive verdict or final conclusion
- Not a substitute for human professional judgment

##### Section 3: 🎯 What TO DO (DO)
**Action guidelines with blue theme**
- Use as complementary perspective guide
- Validate with human criteria and case knowledge
- Explain color symbolism to patients
- Use symbolic language (readings, reflections, perspectives)
- Accompany therapeutic dialogue (don't direct)

##### Section 4: ⚠️ What NOT TO DO (DON'T)
**Prohibition warnings with orange theme**
- Don't claim causality (this causes that)
- Don't use clinical terminology (disorder, pathology, symptom)
- Don't present AI as authoritative source
- Don't alarm patients (colors indicate attention, not severity)
- Don't interpret without full context

##### Section 5: 🤖 AI Usage
**Technical clarification with purple theme**
- AI as correlation assistant, not expert
- Human conclusions always take precedence
- AI provides symbolic perspectives for therapist integration

##### Section 6: ⚖️ Legal Warning
**Professional liability with gray theme**
- Incorrect usage may cause confusion or harm
- Therapist bears full ethical and professional responsibility
- Use only within symbolic therapeutic framework

### UI Integration (`MSHEClinicalModule.tsx`)

#### Button Placement
- **Location**: Header area, left side of export button
- **Icon**: HelpCircle from Lucide React
- **Label**: "Uso Responsable"
- **Tooltip**: "Uso Responsable - Formación y Gobernanza"
- **Visibility**: Always visible to therapists (no special permissions needed)

#### Modal State Management
- **State Variable**: `isTrainingModalOpen`
- **Trigger**: Button click opens modal
- **Close Actions**: X button, "Entendido" button, background click
- **Reset**: Checkbox state resets on modal close

#### User Experience
- **Non-blocking**: Modal overlays without navigation change
- **Accessible**: Keyboard navigation, screen reader friendly
- **Responsive**: Works on different screen sizes
- **Educational**: Progressive disclosure of information

### Technical Implementation

#### Component Architecture
```typescript
interface MSHETrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MSHETrainingModal({ isOpen, onClose }: MSHETrainingModalProps)
```

#### Styling Approach
- **Color Coding**: Green (positive), Red (warnings), Blue (actions), Orange (cautions), Purple (AI), Gray (legal)
- **Icon Usage**: Semantic icons for each section type
- **Typography**: Clear hierarchy with bold headers and readable body text
- **Spacing**: Generous padding and margins for readability

#### Accessibility Features
- **Semantic HTML**: Proper heading hierarchy, button roles
- **Keyboard Support**: Tab navigation, Enter/Escape handling
- **Screen Readers**: Descriptive labels and alt text
- **Focus Management**: Proper focus trapping in modal

### Educational Design

#### Progressive Learning
1. **Foundation**: What MSHE is and isn't (core identity)
2. **Application**: How to use it properly (practical guidelines)
3. **Boundaries**: What to avoid (risk prevention)
4. **Technical**: AI role clarification (transparency)
5. **Accountability**: Legal and ethical responsibilities

#### Visual Learning Aids
- **Color Associations**: Intuitive green=good, red=danger
- **Icon Meanings**: CheckCircle (positive), XCircle (negative), AlertTriangle (caution)
- **Typography Emphasis**: Bold for key concepts, italic for examples
- **Bullet Points**: Scannable information chunks

### Governance Features

#### Usage Confirmation
- **Optional Checkbox**: "He leído y comprendo el uso responsable del MSHE"
- **Purpose**: Self-attestation of understanding
- **No Enforcement**: Not required to use MSHE (educational only)
- **Reset on Open**: Clean state each time modal opens

#### Content Authority
- **Fixed Content**: No dynamic content, authoritative guidelines
- **Version Control**: Content changes tracked in documentation
- **Update Process**: Modal content updates require documentation updates

### Integration Points

#### MSHE Workflow
- **Strategic Placement**: Available during MSHE usage
- **Contextual Help**: Just-in-time education
- **Non-disruptive**: Can be opened/closed without losing work

#### Therapist Training
- **Reference Material**: Comprehensive usage guidelines
- **Ethical Reminders**: Reinforces professional boundaries
- **Best Practices**: Evidence-based usage recommendations

### Testing
- **Build Verification**: ✅ TypeScript compilation successful
- **Modal Functionality**: ✅ Opens/closes properly
- **Content Display**: ✅ All sections render correctly
- **Accessibility**: ✅ Keyboard navigation works
- **Responsive**: ✅ Works on different screen sizes

### Files Created/Modified
- `components/clinical/MSHETrainingModal.tsx` (NEW) - Complete modal component
- `components/clinical/MSHEClinicalModule.tsx` (MODIFIED) - Added modal button and state

### Dependencies
- **Lucide React**: Icons (CheckCircle, XCircle, AlertTriangle, Info, X, Heart)

### Commit
`feat: Add PDF export and training modal for MSHE`

### Status
✅ IMPLEMENTED, TESTED & COMMITTED

### Usage
1. Therapist clicks "Uso Responsable" button in MSHE interface
2. Modal opens with comprehensive training content
3. Therapist reviews guidelines and best practices
4. Optional acknowledgment checkbox
5. Close modal to return to MSHE workflow