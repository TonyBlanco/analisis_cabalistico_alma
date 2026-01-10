# Symbolic User Timeline

This module provides a read-only, symbolic timeline per user.
It stores local events such as tarot sessions and AI-prep drafts.

Scope
- Observational only, no diagnostic claims or interpretation.
- No AI execution, no backend persistence.
- User-context aware, filtered by userId.

Event model
- Captures system, symbols, source, and timestamp.
- Supports cards, letters, sefirot, and paths.

Usage
- Components can emit events via a local store.
- The timeline UI remains unmounted until wired.
