# Contradictions Governance Summary — Symbolic Systems

**Generated from:** `docs/00_SOURCE_OF_TRUTH/symbolic_contradictions_matrix.csv`
**Date:** 2026-01-10
**Purpose:** Provide an executive summary and governance checklist (GO / NO-GO) to unblock decisions without touching code. Use this document for Notion/Jira attachments.

---

## Executive Summary

- This document captures the key contradictions discovered between documentation and repository state for core symbolic systems (Tarot, Cabala, Astrology, Tree, Symbolic Interpreter AI). It is a direct, read-only extraction from `symbolic_contradictions_matrix.csv` and focuses on Governance decisions only.
- Highest priority item: **Symbolic Interpreter AI** — documentation claims a completed backend service and endpoints, but no server-side implementation exists; decision required is urgent (HIGH impact, HIGH risk). Other medium/high items include tests governance and packaging/build policy.

---

## Decisions Needed (GO / NO-GO)

Use the table below to record a formal GO/NO-GO decision for each contradiction. Fill the `Decision` column with one of: `GO (implement)`, `NO-GO (deprecate/disable)`, `DEFER`, or `DOCUMENT_ONLY`.

| Element | Decision options (summary) | Impact | Risk | Owner | Evidence path | Decision (GO/NO-GO) | Deadline | Notes |
|---|---|---:|---:|---|---|---|---|---|
| Symbolic Interpreter AI | Implement server endpoints & safety contract OR Deprecate/disable frontend feature | Alto | Alto | Platform / Backend / AI team | `docs/backLegacy/obsolete_architecture/SYMBOLIC_INTERPRETER_AI_IMPLEMENTATION.md`; `tonyblanco-app/lib/api/symbolic-interpreter-api.ts` | [ ] | [set date] | Urgent governance decision required; see Governance Actions section. |
| Tests Holistic Catalog vs Runtime | Enforce canonical holistic catalog (archive clinical) OR maintain hybrid with formal governance | Alto | Medio-Alto | Governance / Product | `docs/00_SOURCE_OF_TRUTH/TESTS_HOLISTIC_CATALOG.md`; `tests_catalog_status.json` | [ ] | [set date] | Requires policy (archive/migrate/flag legacy). |
| packages/symbolic exports & Turbopack | Choose packaging policy: deep subpath exports + bundler support OR restructure to single-entry module | Medio | Medio | Frontend / Platform | `packages/symbolic/package.json`; `docs/11_DIAGNOSTICS/NEXT_TURBOPACK_FAILED_TO_LOAD_CHUNK.md` | [ ] | [set date] | Document packaging decision for dev+CI. |
| tsconfig path mappings | Decide mapping policy: remove mappings from production builds and document local dev practices | Medio | Medio | Frontend / Platform | `tonyblanco-app/tsconfig.json` | [ ] | [set date] | Aim to prevent path alias collisions with `node_modules`. |
| Symbolic Interpreter docs status | Update doc status to `Draft/In progress` OR confirm backend implemented | Alto | Alto | Docs / Platform | `docs/backLegacy/obsolete_architecture/SYMBOLIC_INTERPRETER_AI_IMPLEMENTATION.md` | [ ] | [set date] | Avoid 'COMPLETO' label until backend verified. |
| Workspace isolation policy (NO TOCAR) | Formalize isolation + ownership and operational guardrails | Medio | Medio | Governance | `docs/WORKSPACE_MATRIX.md`; `tonyblanco-app/components/*` | [ ] | [set date] | Confirm isolation procedures and owners. |
| Obsolete / rescued docs | Archive or label historical docs and maintain authoritative index | Bajo | Bajo | Docs / Governance | `docs/backLegacy/rescued_docs/*`; `docs/backLegacy/legacy_tests/*` | [ ] | [set date] | Low effort; improves clarity. |
| Frontend TypeScript build errors | Decide alignment plan for TS config & missing types (document-only decision) | Medio | Medio | Frontend | `tsc_full_output.txt`; `src/components/cabala_analyzer.tsx` | [ ] | [set date] | Affects build stability and CI reliability. |

---

## Risks (summary)

- Symbolic Interpreter AI: if the frontend expects an AI service that doesn't exist, users may experience failures or inconsistencies; there is high reputational and compliance risk if left unresolved.
- Tests governance: inconsistency between the documented canonical holistic catalog and runtime/test DB state risks accidental exposure or misuse of clinical tests (policy-level risk).
- Packaging/build: unresolved packaging and tsconfig mapping policies may cause intermittent CI failures (observed with Turbopack) and hinder developer productivity.

---

## Owners and Contacts (quick list)

- Platform / Backend / AI team — owner: Platform Lead (assign in governance triage)
- Governance / Product — owner: Product Manager (assign per governance process)
- Frontend — owner: Frontend Tech Lead
- Docs / Governance — owner: Documentation Manager
- Note: assign specific people and deputies when creating tracking tickets.

---

## Next Actions (Governance-only; no code changes)

1. Triage meeting (immediate): Convene Platform, Product, Frontend, Docs owners and the Security/Privacy rep. Purpose: decide on **Symbolic Interpreter AI** (Implement vs Deprecate). Deadline: **3 business days**. Owner: Governance.

2. For each decision row in the table: assign an owner, select GO/NO-GO, record a deadline, and add acceptance criteria (policy-level). Use the table above as the canonical place for decisions.

3. If decision = `GO (implement)` for Symbolic Interpreter AI: require a governance checklist before any implementation (security contract, privacy review, acceptance criteria for safety filtering, integration test criteria, documentation update). (This is a governance requirement only.)

4. If decision = `NO-GO (deprecate/disable)` for Symbolic Interpreter AI: schedule a change request to remove/disable frontend calls and update docs, and record a communications plan for users/therapists.

5. Apply the packaging/build policy: decide whether to standardize on single-entry package or maintain deep exports and update CI/DEV guidance accordingly.

6. Update `docs/backLegacy/obsolete_architecture/SYMBOLIC_INTERPRETER_AI_IMPLEMENTATION.md` status field to reflect the governance decision (Draft / Approved / Deprecated) and add a short rationale and link to ticket(s).

7. Low effort cleanup: Archive or label `docs/backLegacy/rescued_docs/*` and `docs/backLegacy/legacy_tests/*` as historical references and maintain a central `DOCUMENT_AUTHORITY_INDEX.md` mapping.

---

## Governance Checklist (copyable to Notion / Jira)

- [ ] Triage meeting scheduled (owner: Governance). Date: _______
- [ ] Decision recorded in `symbolic_contradictions_matrix.csv` and this Markdown file (owner: assigned) 
- [ ] For Symbolic Interpreter AI: Decision = [ ] GO [ ] NO-GO [ ] DEFER (owner: Platform / Backend / AI team)
- [ ] If GO: Create RfC that includes Security & Privacy approvals, Safety acceptance criteria, and a readiness checklist (owner: Platform)
- [ ] If NO-GO: Create RfC for deprecation process, docs update, and UX handling of disabled feature (owner: Product)
- [ ] Packaging policy decision recorded (owner: Frontend / Platform)
- [ ] TS build alignment plan (owner: Frontend)
- [ ] Docs archival plan executed (owner: Docs)

---

## Evidence (file paths referenced)

- `docs/backLegacy/obsolete_architecture/SYMBOLIC_INTERPRETER_AI_IMPLEMENTATION.md`
- `tonyblanco-app/lib/api/symbolic-interpreter-api.ts`
- `docs/00_SOURCE_OF_TRUTH/TESTS_HOLISTIC_CATALOG.md`
- `tests_catalog_status.json`
- `packages/symbolic/package.json`
- `docs/11_DIAGNOSTICS/NEXT_TURBOPACK_FAILED_TO_LOAD_CHUNK.md`
- `tonyblanco-app/tsconfig.json`
- `tsc_full_output.txt`
- `src/components/cabala_analyzer.tsx`

---

## Notes & Constraints

- This document is READ-ONLY and derived directly from `symbolic_contradictions_matrix.csv` (single source of truth). No code changes were made. The file is intended to be ingested into Notion/Jira as a governance artifact to unblock decisions.
- If a decision requires runtime verification (e.g., exact list of `TestModule` active in DB), include a ticket to run `verify_legacy_filters.py` against the target environment and attach results to the ticket.

---

*Prepared for governance review.*

