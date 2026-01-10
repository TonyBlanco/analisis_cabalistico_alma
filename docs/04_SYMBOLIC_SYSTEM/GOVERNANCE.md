# Kabbalah & Symbolic Interpretation Governance (PoC)

## Purpose
Define safety, quality, and human-in-the-loop (HITL) rules for introducing Kabbalistic and transpersonal interpretations into therapeutic workflows.

## Scope (Phase 1 PoC)
- Deterministic, rule-based outputs only.
- No client-facing generative LLM text in PoC. Any LLM-derived text must be gated by governance and explicit therapist consent.

## Data & Consent
- Only therapists may request a PoC interpretation for their clients.
- Interpretations rely on client birth data (legal_name, birth_date, birth_time, lat, lng, timezone).
- Obtain written consent for symbolic analyses that reference religious/esoteric texts.

## Sources & Traceability
- All symbolic mappings (Sefer Yetzirah, Zohar references, 72 Names) must be stored as immutable mapping files (YAML/JSON) with provenance metadata:
  - source_name
  - source_reference (book/page/translation)
  - version
  - curator
- Each AnalysisRecord must include algorithm_snapshot and references to the mapping versions used.

## Human-in-the-loop Rules
- Any generated textual advice flagged as sensitive must be reviewed by a licensed therapist prior to exposing to the client.
- Create a reviewer checklist for interpretation outputs (accuracy, cultural sensitivity, therapeutic relevance, no diagnostic claims, no medical recommendations).

## LLM Usage (future phases)
- LLMs may be used only as a secondary step to transform structured symbolic outputs into readable prose for therapists.
- All LLM prompts & templates must be stored in `docs/04_SYMBOLIC_SYSTEM/prompt_templates/` and versioned.
- LLM outputs must be classified by an automated content filter (hate, violence, medical advice) and then manually reviewed if flagged.

## Release Gate
- Minimum QA for release to therapists: deterministic mapping coverage >= 80% for core mappings (Sefer Yetzirah letters → planet/paths, 72 Names base scoring), unit tests, and two expert reviews.

## Audit & Logging
- All runs must persist AnalysisRecord with computed_result, legacy_output, algorithm_snapshot and mapping references for audit.

## Roles & Responsibilities
- Data curator: maintains mapping files & provenance
- Reviewer: licensed therapist performing HITL review
- Maintainer: engineers implementing adapters and ensuring tests

## Quick Checklist (before enabling patient-facing output)
- [ ] Mappings curated and versioned
- [ ] Unit tests for mapping logic
- [ ] Content filters for LLM outputs in place
- [ ] Reviewer workflow implemented with approvals
- [ ] Documentation & audit trail present
