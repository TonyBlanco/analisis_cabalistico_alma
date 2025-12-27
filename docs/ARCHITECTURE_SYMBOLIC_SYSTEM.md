# Symbolic System Architecture

## 1. Purpose
The symbolic system provides visualization and exploration of symbolic layers (Tarot, Tree of Life, Cabala) within a governed clinical workspace. It is designed for therapist-guided observation without automated interpretation.

## 2. Architectural Layers
- Workspace: Defines context, permissions, and patient scope for symbolic modules.
- Workspace Mode (optional): Some SWM UIs may expose an explicit `mode` (e.g. `observational` vs `training`) to gate correspondences/synthesis while keeping the default observational flow intact.
- Visual Core: Renders and orchestrates visual layers without clinical logic.
- Plugins: Modular visual layers (Tarot today, Astrology and others later) composed into the core.
- Canonical Symbolic Data (CABALA_JSON): Source of truth for symbolic definitions and correspondences.
- Analysis & AI: Future layer, not implemented, separated from visualization and UI.

The Core Symbolic Layer lives in `src/symbolic/` as the single source of truth for symbolic data. Workspaces consume symbolic data; they do not define it. Interpretation may be assisted, never predictive or automatic.

## 3. Data Flow
```
PatientContext
  -> Workspace
    -> Visual Core
      -> Adapter
        -> Plugin
          -> Visual Motor
```
PatientContext provides cross-over reference only (non-clinical) and does not drive interpretation.

## 4. Role of Plugins and Adapters
Tarot exists as a plugin to keep symbolic layers modular, reusable, and independent of workspace logic. Adapters bridge workspace context into plugins without coupling. Visual layers remain interpretation-free to preserve governance boundaries.

## 5. Current Implementation (2025-12-23)

### TreeStructuralState System (Phases 1-4 Complete) ✅

**Phase 1-2**: Unified Tree Visualization
- TreeStructuralState v0.1 contract (IMMUTABLE)
- 10 symbolic methods standardized
- SVG rendering with dynamic flows (harmonic/integrative/tensional)
- ES5 compatible, adapter pattern

**Phase 3**: AI-Assisted Symbolic Interpretation ✅ (commit 356f92ce)
- **IMPLEMENTED**: Non-clinical symbolic interpretation layer
- **Status**: PRODUCTION-READY with 5-layer safety validation
- **Scope**: READ-ONLY access to TreeStructuralState (no personal data)
- **Safety**: 14 prohibited terms, no diagnosis, no advice, no determinism
- **Backend**: Gemini 1.5-flash integration with validation
- **Frontend**: Opt-in panel with prominent disclaimers
- **Fallback**: Algorithmic interpretation when AI unavailable

**Phase 4**: Professional Kabbalistic Analyst Prompt ✅ (2025-12-23)
- **IMPLEMENTED**: Upgraded AI prompt to professional analyst level
- **Target**: Trainers and advanced practitioners
- **Output**: 4 mandatory sections (Structural Panorama, Sefirotic Dynamics, Methodological Context, Professional Keys)
- **Fallback**: Enhanced with professional algorithmic analysis (triads, columns, density)
- **Language**: Professional Kabbalistic terminology

### Current Capabilities:
- ✅ Symbolic visualization (Tree of Life, Tarot)
- ✅ AI-assisted symbolic interpretation (consultative, non-clinical)
- ✅ Professional-grade structural analysis
- ✅ Educational and formative language enforced
- ❌ NO automatic diagnosis
- ❌ NO clinical inference
- ❌ NO personal advice or deterministic statements

### Symbolic AI Architecture:

```
TreeStructuralState (source of truth)
  ↓
Symbolic Interpreter (5-layer validation)
  ↓
[Frontend Pre-Check] → [Backend Validation] → [Prompt Engineering]
  ↓
[Response Filtering] → [UI Warnings]
  ↓
Symbolic Interpretation (4 observations)
  - Structural Panorama
  - Sefirotic Dynamics
  - Methodological Context
  - Professional Keys
```

### Safety Governance:

**Prohibited Actions**:
- Clinical diagnosis or psychological labels
- Personal advice or deterministic statements
- Access to personal data (only structural state)
- Automatic conclusions or predictions

**Required Controls**:
- Explicit opt-in activation (disabled by default)
- Prominent disclaimers always visible
- Educational context enforced in prompts
- Fallback system for AI unavailability

## 6. Planned Evolution (Future Phases)

Future enhancements may include:
- Multi-method correlation analysis
- Longitudinal symbolic pattern tracking
- Advanced triadic analysis
- Prompt customization for different proficiency levels

**All future work must**:
- Maintain 5-layer safety validation
- Preserve non-clinical boundaries
- Keep symbolic analysis separate from diagnostic workflows
- Remain auditable and governed

## 7. Design Principles
- Separation of concerns
- Source of truth for symbolic data
- Explicit patient context
- Reusability and composability
- Ethical and clinical boundaries

Related docs:
- `docs/architecture/TRAINING_INTERPRETATIVE_PHASE.md`
