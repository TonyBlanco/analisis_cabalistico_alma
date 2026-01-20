# Análisis Cabalístico del Alma — Holistic Platform

**Version**: 2.0  
**Status**: PRODUCTION  
**Last Update**: 2025-12-23

---

## Overview

Platform for holistic therapeutic analysis integrating:
- **Clinical workflows** (therapist-patient relationship)
- **Symbolic systems** (Kabbalah Tree of Life, Tarot, BioEmotional)
- **AI-assisted interpretation** (consultative, non-clinical)

**Core principle**: Human-driven therapeutic process with symbolic visualization and educational AI support.

---

## Architecture

### Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Django 4.2 + Django REST Framework
- **Database**: PostgreSQL (production) / SQLite (local)
- **AI**: Google Gemini 1.5-flash (symbolic interpretation)
- **Geocoding**: OpenStreetMap Nominatim (geopy backend integration)
- **Auth**: Token-based authentication
- **Deployment**: Vercel (frontend) + Render (backend)

### Architecture Overview

The system follows a modular architecture with clear separation of concerns:

- **Backend (Django REST Framework)**: Handles all business logic, data persistence, and API endpoints
- **Frontend (Next.js/TypeScript)**: Provides the user interface and client-side logic
- **Geocoding Service**: Centralized backend service for location data processing
- **Symbolic Engine**: AI-powered analysis and interpretation system

#### Recent Architecture Improvements

**Geocoding Unification (2024)**:
- Consolidated three separate geocoding implementations into a single backend endpoint
- Eliminated frontend geocoding inconsistencies and maintenance overhead
- Added intelligent caching and rate limiting for better performance
- Improved error handling and user experience for location-based features

### Key Modules

1. **Clinical Core** (`backend/core/`)
   - Patient management
   - Therapist-patient relationship
   - Session tracking
   - Analysis records (AnalysisRecord model)

2. **Geocoding System** (`backend/api/geocoding_utils.py`)
   - Unified city → coordinates conversion
   - OpenStreetMap Nominatim integration via geopy
   - Intelligent caching and rate limiting
   - Automatic timezone calculation
   - API endpoint: `POST /api/geocode/city/`

3. **Symbolic System** (`src/symbolic/`)
   - TreeStructuralState v0.1 (unified contract)
   - 10 Kabbalistic methods (Pitágoras, Gematria, Atbash, etc.)
   - Tree of Life visualization with flows
   - AI-assisted symbolic interpretation

3. **BioEmotional Workspace** (`tonyblanco-app/components/ExperientialWorkspace/`)
   - 2D body visualization (14 anatomical regions)
   - Bio-emotional dictionary
   - Hypothesis tracking
   - Synthesis and closure workflows

4. **Workspaces** (`tonyblanco-app/components/`)
   - CabalAppliedWorkspace (Kabbalah analysis)
   - ExperientialWorkspace (BioEmotional)
   - TarotWorkspace (Tarot readings)

5. **Admin Workspace** (`/dashboard/admin`)
   - Protected admin-only workspace
   - Isolated UI shell (no global multi-role dashboard sidebar/header)
   - Uses existing admin endpoints: `/api/admin/*`

---

## TreeStructuralState System (Phases 1-4) ✅

### Phase 1: TreeStructuralState v0.1 Contract ✅
**Commit**: eeb0f3f2

**Purpose**: Unified immutable contract for all symbolic methods.

**Components**:
- `tree-structural-state.types.ts`: TreeStructuralState interface
- `pitagoras-tree-adapter.ts`: Pitágoras → TreeStructuralState
- `TreeWithFlows.tsx`: SVG rendering with dynamic arrows

**Rules**:
- TreeStructuralState v0.1 is **IMMUTABLE** and **NON-NEGOTIABLE**
- All methods MUST use this contract
- ES5 compatible (no Map, Set, Object.entries)

**Visual semantics**:
- 🟢 Green: Harmonic flows (expansion, resonance)
- 🟠 Orange: Integrative flows (synthesis)
- 🔴 Red: Tensional flows (restriction, limit)

### Phase 2: Standardization of All Methods ✅
**Commit**: b0a37015

**Purpose**: Apply TreeStructuralState v0.1 to all 10 symbolic methods.

**Components**:
- `generic-method-adapter.ts`: Reusable adapter logic
- 10 method-specific adapters (gematria-standard, gematria-katan, mispar-gadol, mispar-siduri, milui, atbash, albam, avgad, temurah, notarikon)

**Result**: 100% standardization — all methods generate TreeStructuralState compatible with TreeWithFlows.

### Phase 3: AI-Assisted Symbolic Interpretation ✅
**Commit**: 356f92ce

**Purpose**: Non-clinical symbolic interpretation layer with Gemini AI.

**Components**:
- `symbolic-interpreter.ts`: Prompt generation, validation, fallback
- `symbolic_interpreter_ai.py`: Backend Gemini integration
- `SymbolicInterpretationPanel.tsx`: UI panel with disclaimers

**Safety Architecture (5 Layers)**:
1. **Frontend pre-request**: Validate TreeState before sending
2. **Backend API**: Detect personal data, validate structure
3. **Prompt engineering**: STRICT LIMITS embedded in prompt
4. **Response filtering**: Filter 14 prohibited terms
5. **UI warnings**: Visible disclaimers and warnings

**Prohibited Terms** (14):
diagnóstico, diagnosis, trastorno, disorder, patología, pathology, enfermedad, disease, debes, must, tienes que, have to, definitivamente, definitely, siempre, always, nunca, never

**Rules (NON-NEGOTIABLE)**:
- ❌ NO clinical diagnosis
- ❌ NO personal advice
- ❌ NO psychological labels
- ❌ NO determinism
- ✅ ONLY structural-symbolic observations
- ✅ Educational language
- ✅ READ-ONLY access to TreeStructuralState

**Fallback**: Algorithmic interpretation when AI unavailable.

### Phase 4: Professional Kabbalistic Analyst Prompt ✅
**Date**: 2025-12-23 (pending commit)

**Purpose**: Upgrade AI from generic educational to professional analyst level.

**Target Audience**:
- Trainers of Kabbalah
- Advanced practitioners
- Professional formative context

**Output Structure** (4 mandatory sections):
1. **Structural Panorama** (`structural-analysis`): Density, vertical/horizontal emphasis, triads
2. **Sefirotic Dynamics** (`pattern-recognition`): Relationships, polarities, balances
3. **Methodological Context** (`educational-context`): What the method emphasizes, what it doesn't capture
4. **Professional Keys** (`symbolic-comparison`): Observational cues, exploratory questions

**Enhanced Fallback**:
- Dominant/present sefirot filtering
- Harmonic/integrative/tensional flow counting
- Vertical flow analysis (triad crossing)
- Structural density calculation
- Professional Kabbalistic terminology

**Improvements Over Phase 3**:
- Fixed structure: 4 observations (vs 3-4 variable)
- Professional language: triads, columns, polarities
- Meta-methodology: explains limitations of each method
- Enhanced fallback: algorithmic professional analysis

---

## Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (production) or SQLite (local)
- Google Gemini API key (for AI interpretation)

### Local Development

1. **Clone repository**:
```bash
git clone <repository-url>
cd analisis_cabalistico_alma
```

2. **Backend setup**:
```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1  # Windows
source .venv/bin/activate   # Unix
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

3. **Frontend setup**:
```bash
cd tonyblanco-app
npm install
npm run dev
```

4. **Environment variables**:

**Backend** (`.env`):
```
DJANGO_SECRET_KEY=<your-secret-key>
GEMINI_API_KEY=<your-gemini-api-key>
KERYKEION_AI_SNIPPETS_ENABLED=false
# Optional: override model just for kerykeion snippets (defaults to GEMINI_MODEL)
KERYKEION_AI_SNIPPETS_MODEL=
DATABASE_URL=<postgresql-url-or-sqlite>
```

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Production Deployment

See:
- `DEPLOYMENT.md` (general deployment guide)
- `RENDER-ENV-VARS.md` (Render environment variables)
- `vercel.json` (Vercel configuration)

---

## Documentation

### Architecture
- `04_SYMBOLIC_SYSTEM/ARCHITECTURE_SYMBOLIC_SYSTEM.md`: Symbolic system architecture
- `00_SOURCE_OF_TRUTH/SOURCE_OF_TRUTH.md`: Normative source of truth
- `01_PROJECT_STATE/PROJECT_STATE_CURRENT.md`: Current project state

### TreeStructuralState System
- `04_SYMBOLIC_SYSTEM/TREE_STRUCTURAL_STATE_PHASE_2_STANDARDIZATION.md`: Phases 1-4 complete
- `04_SYMBOLIC_SYSTEM/SYMBOLIC_INTERPRETER_AI_IMPLEMENTATION.md`: Phase 3+4 implementation
- `04_SYMBOLIC_SYSTEM/SYMBOLIC_INTERPRETER_PROFESSIONAL_PROMPT.md`: Phase 4 technical spec

### Clinical Workflows
- `00_SOURCE_OF_TRUTH/AUDITORIA CABALA APP 12182025.md`: Clinical audit
- `../backend/API_DOCUMENTATION.md`: Backend API reference

### BioEmotional
- `03_SWM_CONTRACTS/BIOEMOCION_EXPERIENCIAL_PROFUNDA_TECHNICAL_SPEC.md`: BioEmotional technical spec
- `01_PROJECT_STATE/TODO.md`: Implementation progress tracker

---

## Key Principles

### Clinical Governance
1. **No autoevaluation**: Patients cannot analyze themselves
2. **Therapist ownership**: Only therapists can create clinical analyses
3. **Execution mode**: Always determined by backend, never from request
4. **Patient privacy**: Strict separation of patient data

### Symbolic Governance
1. **TreeStructuralState v0.1 is immutable**: No alternative contracts
2. **SVG semantic decoupling**: Symbols are pure SVG, no React logic
3. **Non-clinical AI**: Symbolic interpretation is educational only
4. **5-layer safety**: All AI outputs validated at multiple levels

### UX Governance
1. **Workspace persistence**: Therapist dashboard is central workspace
2. **No destructive navigation**: Tools open as overlays, not new pages
3. **Body remains visible**: Symbolic body is cognitive anchor
4. **Neutral colors**: No medical red/yellow alerts

---

## Testing

### Backend
```bash
cd backend
python manage.py test
```

### Frontend
```bash
cd tonyblanco-app
npm test
```

### Manual Testing Checklist (Phase 4)
- [ ] Execute symbolic method → Generate AI interpretation
- [ ] Verify 4 observations match structure (Panorama, Dynamics, Context, Keys)
- [ ] Test fallback (disable GEMINI_API_KEY)
- [ ] Verify fallback generates professional 4-section output
- [ ] Validate professional language (triads, polarities, columns)
- [ ] Confirm no prohibited terms in output

---

## Contributing

### Commit Conventions
```
feat(scope): description      # New feature
fix(scope): description       # Bug fix
refactor(scope): description  # Code refactoring
docs(scope): description      # Documentation
test(scope): description      # Tests
```

### Code Style
- **TypeScript**: ESLint + Prettier
- **Python**: Black + Flake8
- **ES5 compatibility**: No Map, Set, Object.entries in symbolic code

---

## License

See `LICENSES.md`.

---

## Contact

For questions or support, contact the development team.

---

**Last Update**: 2025-12-23  
**Status**: Phase 4 (Professional Prompt) pending commit  
**Commits**: eeb0f3f2 (Phase 1), b0a37015 (Phase 2), 356f92ce (Phase 3)

## 📚 Documentation Index

**00_SOURCE_OF_TRUTH**
- [Source of Truth](00_SOURCE_OF_TRUTH/SOURCE_OF_TRUTH.md)
- [Auditoria 12/18/2025](00_SOURCE_OF_TRUTH/AUDITORIA%20CABALA%20APP%2012182025.md)

**01_PROJECT_STATE**
- [Current Project State](01_PROJECT_STATE/PROJECT_STATE_CURRENT.md)
- [Deployment Guide](01_PROJECT_STATE/DEPLOYMENT.md)

**03_SWM_CONTRACTS**
- [BioEmocion Spec](03_SWM_CONTRACTS/BIOEMOCION_EXPERIENCIAL_PROFUNDA_TECHNICAL_SPEC.md)

**04_SYMBOLIC_SYSTEM**
- [Tree Structural State](04_SYMBOLIC_SYSTEM/TREE_STRUCTURAL_STATE_PHASE_2_STANDARDIZATION.md)

> **GOVERNANCE RULE:** All documentation must live under `/docs` in the canonical structure.
