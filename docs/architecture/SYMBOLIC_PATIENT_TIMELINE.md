# Symbolic Patient Timeline

This module provides a read-only, symbolic timeline per patient.
It stores local events such as tarot sessions and AI-prep drafts.

Scope
- Observational only, no diagnosis or interpretation.
- No AI execution, no backend persistence.
- Patient-context aware, filtered by patientId.

Event model
- Captures system, symbols, source, and timestamp.
- Supports cards, letters, sefirot, and paths.

Usage
- Components can emit events via a local store.
- The timeline UI remains unmounted until wired.
