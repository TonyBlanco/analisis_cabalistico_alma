# Document Authority Index

## Purpose
Index of canonical documents and their roles. This file is an index only; it does not replace or duplicate content in the canonical files. These documents are source-of-truth and must not be edited without following governance rules in `DOCUMENTATION_GOVERNANCE.md` and `00_SOURCE_OF_TRUTH/PROJECT_LOCK.md`.

## Canonical documents (reading order)
1. `00_SOURCE_OF_TRUTH/PROJECT_LOCK.md` — Governing lock file (read first). Role: governance / enforcement.
2. `docs/DOCUMENTATION_GOVERNANCE.md` — Documentation governance rules. Role: governance / process.
3. `docs/WORKSPACE_ISOLATION_POLICY.md` — Workspace isolation policy. Role: policy.
4. `docs/WORKSPACE_MATRIX.md` — Workspace inventory and classification. Role: reference / inventory.
5. `docs/ARCHITECTURE_SYMBOLIC_SYSTEM.md` — System architecture for symbolic subsystems. Role: architecture / reference.
6. `docs/SWM_V3_GOVERNANCE_ARTIFACTS.md` — SWM v3 governance artifacts. Role: normative / SWM governance.
7. `docs/AI_SYMBOLIC_CONTRACT.md` — Canonical AI symbolic contract. Role: normative / data contract.
8. `docs/TREE_STRUCTURAL_STATE_CONTRACT.md` — Tree structural state contract. Role: normative / data contract.
9. `docs/EPHEMERIS_DATA_POLICY.md` — Ephemeris policy (astro). Role: policy / operational.
10. `docs/RUNBOOK_ASTRO_PROD.md` — Runbook operational (astro). Role: operational / runbook.
11. `docs/WORKSPACE_EXPORT_CONTRACT.md` — (New) Export contract for workspace-to-therapist static transfers. Role: policy / export contract.

## Note
Estos documentos no son roadmap ni diseño técnico. No contienen instrucciones de implementación. Son referencias de gobernanza, política y contratos de datos.

## How to use
- Read in the order above for context.
- For decisions about writing or modifying docs, follow `DOCUMENTATION_GOVERNANCE.md` and record in `01_PROJECT_STATE`.
- Agents and contributors must treat entries above as authoritative sources of truth.