# Phase 5: Holistic Cross-Engine Correlation - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   BioEmotional Experiential Workspace                    │
│                        (Analysis State Active)                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
          ┌─────────▼─────────┐         ┌──────────▼──────────┐
          │  Visual Core      │         │  Tool Panels        │
          │  ─────────────    │         │  ───────────        │
          │  • Body 2D SVG    │         │  • Observation      │
          │  • Region Select  │         │  • Hypothesis       │
          │  • Region Detail  │         │  • Dictionary       │
          └─────────┬─────────┘         │  • HolisticCross ← │
                    │                   └──────────┬──────────┘
                    │                              │
                    │    selectedRegion            │
                    └──────────────────────────────┘
```

## Signal Collection Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         HolisticCrossPanel                                │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                     SIGNAL COLLECTION LAYER                          │ │
│  │                                                                      │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐ │ │
│  │  │    BIO     │  │   TRANS    │  │    TREE    │  │  CONTEXT     │ │ │
│  │  │   Domain   │  │   Domain   │  │   Domain   │  │   Sources    │ │ │
│  │  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘  └──────┬───────┘ │ │
│  │         │                │                │                │         │ │
│  │         ▼                ▼                ▼                ▼         │ │
│  │  ┌──────────────────────────────────────────────────────────────┐  │ │
│  │  │              SIGNAL NORMALIZATION (No AI)                    │  │ │
│  │  │  • Text tokenization                                         │  │ │
│  │  │  • Tag extraction (length > 3)                               │  │ │
│  │  │  • Spanish character support                                 │  │ │
│  │  └──────────────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                   CORRELATION DETECTION LAYER                        │ │
│  │                                                                      │ │
│  │  • Group signals by shared tags                                     │ │
│  │  • Filter groups with 2+ signals                                    │ │
│  │  • Count represented domains                                        │ │
│  │  • Compute confidence (4+ = high, 3 = medium, 2 = low)             │ │
│  │  • Generate rationale                                               │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                      DISPLAY & ACTION LAYER                          │ │
│  │                                                                      │ │
│  │  For each correlation:                                              │ │
│  │    • Title + Rationale                                              │ │
│  │    • Signal list with evidence                                      │ │
│  │    • Actions: [Mark] [Copy→Hypothesis] [Copy→Synthesis]            │ │
│  │                                                                      │ │
│  │  Optional: [Explain with AI] (Gemini, consultative only)            │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

## Signal Sources Detail

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BIO DOMAIN SIGNALS                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Source 1: SELECTED BODY REGION                                        │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  selectedRegion (from BodyVisualization2D)                     │   │
│  │  → Signal: { domain: 'bio', label: region.label, ... }        │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Source 2: CLINICAL OBSERVATIONS                                       │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  API: listObservations(patientId)                              │   │
│  │  → For each observation:                                        │   │
│  │     Signal: { domain: 'bio', evidence: obs.note_text, ... }    │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Source 3: DICTIONARY QUOTES                                           │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  referenceSnippets (from DictionaryPanel save actions)         │   │
│  │  → For each snippet:                                            │   │
│  │     Signal: { domain: 'bio', evidence: snippet, ... }          │   │
│  └────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          TRANS DOMAIN SIGNALS                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Source: HYPOTHESIS KEYWORD DETECTION                                  │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  API: listHypotheses(patientId)                                │   │
│  │  Keywords: [aniversario, doble, repeticion, patron, linaje]    │   │
│  │  → For each hypothesis:                                         │   │
│  │     text = title + description (lowercase)                      │   │
│  │     if keyword in text:                                         │   │
│  │       Signal: { domain: 'trans', label: 'Patrón {keyword}',    │   │
│  │                 evidence: hyp.description, ... }                │   │
│  └────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           TREE DOMAIN SIGNALS                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Source: CANONICAL SEFIROT CORRESPONDENCES (Static Reference Map)     │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  TREE_REFERENCES = {                                            │   │
│  │    head: { label: 'Keter', evidence: 'Correspondencia...' }    │   │
│  │    throat: { label: "Da'at", evidence: '...' }                 │   │
│  │    chest: { label: 'Tiferet', evidence: '...' }                │   │
│  │    'solar-plexus': { label: 'Gevurah', evidence: '...' }       │   │
│  │    abdomen: { label: 'Yesod', evidence: '...' }                │   │
│  │    pelvis: { label: 'Malkuth', evidence: '...' }               │   │
│  │  }                                                              │   │
│  │                                                                 │   │
│  │  if (selectedRegion && TREE_REFERENCES[selectedRegion.id]):    │   │
│  │    Signal: { domain: 'tree', label: tree.label,                │   │
│  │              evidence: tree.evidence, ... }                     │   │
│  └────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Correlation Detection Algorithm

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CORRELATION ALGORITHM (No AI)                       │
└─────────────────────────────────────────────────────────────────────────┘

STEP 1: TAG EXTRACTION
───────────────────────
For each signal in signals[]:
  tags = normalizeTags(signal.label) + normalizeTags(signal.evidence)
  
  normalizeTags(text):
    → text.toLowerCase()
    → replace non-alphanumeric (keep Spanish chars)
    → split on whitespace
    → filter tokens with length > 3
    
  For each tag:
    tagMap[tag] = [..., signal]

STEP 2: GROUP FILTERING
────────────────────────
For each (tag, signalList) in tagMap:
  if signalList.length < 2:
    SKIP  // Need at least 2 signals to correlate
    
  domains = unique(signalList.map(s => s.domain))

STEP 3: CONFIDENCE COMPUTATION
───────────────────────────────
signalCount = signalList.length

if signalCount >= 4:
  confidence = 'high'
else if signalCount >= 3:
  confidence = 'medium'
else:
  confidence = 'low'

STEP 4: CORRELATION CREATION
─────────────────────────────
correlation = {
  title: `Convergencia: ${tag}`,
  rationale: `Se observan señales relacionadas con "${tag}" en dominios: ${domains.join(', ')}.`,
  signals: signalList,
  confidence: confidence,
  therapistAction: 'review'
}

STEP 5: RETURN RESULTS
──────────────────────
return correlations[]  // No writes, no persistence
```

## Therapist Action Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         THERAPIST ACTION FLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

USER SEES CORRELATION:
  Title: "Convergencia: corazón"
  Rationale: "Se observan señales relacionadas con 'corazón' en dominios: bio, tree."
  Signals:
    [bio] Pecho: Región seleccionada en la sesión.
    [tree] Tiferet: Correspondencia referencial: Tiferet (corazón)
  
  ┌──────────────────────────────────────────────────────────────────┐
  │  [Marcar como relevante]  [Copiar a hipótesis]  [Copiar a síntesis]  │
  └──────────────────────────────────────────────────────────────────┘

ACTION 1: MARCAR COMO RELEVANTE
────────────────────────────────
User clicks [Marcar como relevante]
  ↓
marked[correlation.title] = true  (local state)
  ↓
Button text changes to "Marcado"
  ↓
Visual indicator (no persistence)
  ↓
[Session-only flag, not saved to backend]

ACTION 2: COPIAR A HIPÓTESIS
─────────────────────────────
User clicks [Copiar a hipótesis]
  ↓
text = buildCorrelationText(correlation)
  ↓
onCopyToHypothesis(text)  (prop callback)
  ↓
Parent component: setHypothesisInsert(text)
  ↓
HypothesisPanel receives insertText prop
  ↓
Text appears in hypothesis textarea (pre-filled)
  ↓
Therapist reviews, edits, and decides whether to save
  ↓
[Therapist must click "Guardar hipótesis" to persist]

ACTION 3: COPIAR A SÍNTESIS
────────────────────────────
User clicks [Copiar a síntesis]
  ↓
text = buildCorrelationText(correlation)
  ↓
onCopyToSynthesis(text)  (prop callback)
  ↓
Parent component: setSynthesisInsert(text)
  ↓
SynthesisPanel receives insertText prop
  ↓
Text appears in synthesis editor (pre-filled)
  ↓
Therapist reviews, edits, and decides whether to save
  ↓
[Therapist must click "Guardar síntesis" to persist]

ACTION 4: EXPLICAR CORRELACIONES (IA)
──────────────────────────────────────
User clicks [Explicar correlaciones (IA)]
  ↓
Prepare prompt:
  "Explica en tono consultivo por qué estas señales podrían estar relacionadas.
   No diagnostiques. No inventes. Propón preguntas para explorar."
  
  Payload: All correlations with titles, rationales, signals
  ↓
generateWithGemini(prompt + payload)
  ↓
AI generates consultative explanation (no diagnosis)
  ↓
Display in read-only panel
  ↓
[No automatic insertion, no persistence]
```

## Data Flow Sequence

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     COMPLETE DATA FLOW SEQUENCE                         │
└─────────────────────────────────────────────────────────────────────────┘

SESSION START
═════════════
1. User opens BioEmotionalExperientialWorkspace
2. Workspace loads with patient context (patientId, patientName, sessionLabel)
3. User navigates to "Analysis" state
4. ExperientialToolPanels renders:
   - ObservationPanel (left)
   - HypothesisPanel (left)
   - DictionaryPanel (right)
   - HolisticCrossPanel (right) ← NEW

SIGNAL COLLECTION
═════════════════
5. HolisticCrossPanel useEffect triggers:
   - Fetches listObservations(patientId) → bio signals
   - Fetches listHypotheses(patientId) → trans signals
   
6. User selects body region (e.g., "Pecho")
   - selectedRegion propagates to HolisticCrossPanel
   - Bio signal added: selectedRegion
   - Tree signal added: TREE_REFERENCES['chest'] → Tiferet
   
7. User searches dictionary, saves quotes
   - referenceSnippets updated
   - Bio signals added: dictionary quotes

CORRELATION DETECTION
══════════════════════
8. signals[] populated from all sources
9. useMemo triggers correlation algorithm:
   - Extract tags from all signals
   - Group by shared tags
   - Filter groups with 2+ signals
   - Compute confidence levels
   - Generate correlations[]

DISPLAY & INTERACTION
══════════════════════
10. Correlations displayed in scrollable list
11. User reviews correlations
12. User clicks action button (mark/copy/explain)
13. Action handler executed (local state or callback)

PERSISTENCE (EXPLICIT ONLY)
════════════════════════════
14. If copied to hypothesis:
    - Text staged in HypothesisPanel insertText
    - Therapist reviews and edits
    - Therapist clicks "Guardar hipótesis"
    - POST /api/bioemotional/hypotheses/{patient_id}/
    
15. If copied to synthesis:
    - Text staged in SynthesisPanel insertText
    - Therapist reviews and edits
    - Therapist clicks "Guardar síntesis"
    - POST /api/bioemotional/synthesis/{patient_id}/

SESSION CLOSURE
═══════════════
16. User navigates to "Closure" state
17. All panels become read-only (isReadOnly=true)
18. HolisticCrossPanel buttons disabled
19. No further modifications allowed
```

## Security & Privacy Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     SECURITY & PRIVACY LAYERS                           │
└─────────────────────────────────────────────────────────────────────────┘

CLIENT SIDE (HolisticCrossPanel)
═════════════════════════════════
• Correlations computed in browser memory (no server round-trip)
• Marked correlations: session-only state (not persisted)
• All API calls include authentication token
• No patient identifiers in AI requests (only correlation text)

API LAYER (bioemotional-clinical.ts)
═════════════════════════════════════
• listObservations(patientId): Requires authentication
• listHypotheses(patientId): Requires authentication
• All requests include: Authorization: Token {token}
• 401/403 errors handled gracefully

BACKEND (Django)
════════════════
• Patient ownership validation on all endpoints
• Therapist-only access enforced
• No cross-patient data leakage
• Audit trail for all mutations

AI INTEGRATION (Gemini)
════════════════════════
• API key stored in environment variable (not in code)
• Prompt explicitly forbids diagnosis
• No patient identifiers sent to Gemini
• Output is read-only (no auto-save)
• Rate limiting handled by Google SDK
```

## Integration Points Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       INTEGRATION POINTS                                │
└─────────────────────────────────────────────────────────────────────────┘

FRONTEND COMPONENTS
═══════════════════
BioEmotionalExperientialWorkspace (index.tsx)
  ↓ manages referenceSnippets
ExperientialToolPanels
  ↓ passes props
HolisticCrossPanel
  ↓ consumes
    • selectedRegion (from BodyVisualization2D)
    • referenceSnippets (from DictionaryPanel)
    • onCopyToHypothesis (from index.tsx)
    • onCopyToSynthesis (from index.tsx)
    • isReadOnly (from synthesis closure state)

API CLIENTS
═══════════
lib/api/bioemotional-clinical.ts
  → listObservations(patientId): Promise<BioEmotionalObservation[]>
  → listHypotheses(patientId): Promise<BioEmotionalHypothesis[]>

lib/gemini-config.ts
  → generateWithGemini(prompt: string): Promise<string>

BACKEND ENDPOINTS
═════════════════
GET /api/bioemotional/observations/{patient_id}/
GET /api/bioemotional/hypotheses/{patient_id}/
(No dedicated correlation endpoint - computed client-side)

DATA TYPES
══════════
AnatomicalRegion (from data/anatomicalRegions.ts)
BioEmotionalObservation (from lib/api/bioemotional-clinical.ts)
BioEmotionalHypothesis (from lib/api/bioemotional-clinical.ts)
Signal (defined in HolisticCrossPanel.tsx)
Correlation (defined in HolisticCrossPanel.tsx)
```

---

## Visual Workflow Diagram

```
                          PHASE 5 WORKFLOW
                          ════════════════

    ┌─────────────────────────────────────────────────────────────┐
    │  User selects body region + creates observations/hypotheses │
    └───────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
    ┌─────────────────────────────────────────────────────────────┐
    │        HolisticCrossPanel loads (Analysis State)            │
    │  ┌────────────────────────────────────────────────────┐     │
    │  │  Fetch observations (bio)                          │     │
    │  │  Fetch hypotheses (trans keywords)                 │     │
    │  │  Receive selectedRegion (bio + tree)               │     │
    │  │  Receive referenceSnippets (bio)                   │     │
    │  └────────────────────────────────────────────────────┘     │
    └───────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
    ┌─────────────────────────────────────────────────────────────┐
    │              Signal Normalization (No AI)                   │
    │  Extract tags → Group by shared tags → Filter 2+ signals    │
    └───────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
    ┌─────────────────────────────────────────────────────────────┐
    │           Correlation Detection (Algorithmic)               │
    │  Compute confidence → Generate rationale → Build correlations│
    └───────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                Display Correlations                         │
    │  • Show title, rationale, signals, confidence               │
    │  • Provide action buttons (mark/copy)                       │
    │  • Optional AI explainer button                             │
    └───────────────────────────┬─────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
    ┌────────────────────┐          ┌────────────────────┐
    │  User clicks       │          │  User clicks       │
    │  [Copiar a         │          │  [Explicar con IA] │
    │   hipótesis/       │          │  (optional)        │
    │   síntesis]        │          └────────┬───────────┘
    └────────┬───────────┘                   │
             │                               ▼
             │                   ┌────────────────────┐
             │                   │  Gemini generates  │
             │                   │  consultative      │
             │                   │  explanation       │
             │                   └────────┬───────────┘
             │                            │
             │                            ▼
             │                   ┌────────────────────┐
             │                   │  Display read-only │
             │                   │  AI output         │
             │                   └────────────────────┘
             │
             ▼
    ┌────────────────────┐
    │  Text staged in    │
    │  target panel      │
    │  (hypothesis or    │
    │   synthesis)       │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │  Therapist reviews,│
    │  edits, and saves  │
    │  (explicit action) │
    └────────────────────┘
```

---

**Architecture Status**: ✅ Complete

**All Phase 5 integration points documented and verified.**
