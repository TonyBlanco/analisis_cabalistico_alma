# Kabbalah Interpretation PoC

This document outlines the Phase 1 PoC for the Kabbalah + Transpersonal natal interpretation.

Scope (PoC):
- Backend-only PoC providing a therapist-scoped endpoint: POST /api/therapist/patients/<id>/interpretation/kabbalah/
- Deterministic rule-based adapter (existing `KabbalahAdapter`) will be used to provide `computed_result`.
- Input: Patient's `birth_data_snapshot` + optional `raw_input` with `sistema`.
- Output: AnalysisRecord with `computed_result` and `legacy_output` populated.

Security & Governance (short):
- Visibility: `therapist` by default.
- No patient-visible text generated in PoC — raw `legacy_output` is returned only to therapist.
- Any generative (LLM) output will require explicit governance review and human-in-the-loop approval before being enabled for patients.

Next steps:
- Add unit tests & CI for the new endpoint
- Add mapping tables (Sefer Yetzirah, 72 Names) as data files under `docs/04_SYMBOLIC_SYSTEM/` and later as DB-backed models if needed
- Add prompt templates and classification rules in `docs/04_SYMBOLIC_SYSTEM/GOVERNANCE.md`
