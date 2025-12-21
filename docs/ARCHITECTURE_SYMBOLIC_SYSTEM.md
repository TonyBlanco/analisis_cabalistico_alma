# Symbolic System Architecture

## 1. Purpose
The symbolic system provides visualization and exploration of symbolic layers (Tarot, Tree of Life, Cabala) within a governed clinical workspace. It is designed for therapist-guided observation without automated interpretation.

## 2. Architectural Layers
- Workspace: Defines context, permissions, and patient scope for symbolic modules.
- Visual Core: Renders and orchestrates visual layers without clinical logic.
- Plugins: Modular visual layers (Tarot today, Astrology and others later) composed into the core.
- Canonical Symbolic Data (CABALA_JSON): Source of truth for symbolic definitions and correspondences.
- Analysis & AI: Future layer, not implemented, separated from visualization and UI.

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

## 5. Current Limits (Important)
- No automatic interpretation
- No diagnosis
- No AI-driven inference
- Visual and observational only (current phase)

## 6. Planned Evolution (Non-Clinical AI)
Future symbolic analysis will live outside the visual layer and UI, producing holistic non-clinical insights. It will remain auditable and governed, with strict separation from visualization and any diagnostic workflows.

## 7. Design Principles
- Separation of concerns
- Source of truth for symbolic data
- Explicit patient context
- Reusability and composability
- Ethical and clinical boundaries
