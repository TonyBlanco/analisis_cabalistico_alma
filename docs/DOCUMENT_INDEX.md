# DOCUMENT_INDEX — Índice maestro de documentación

**Propósito:** índice central que lista los documentos del repo, su estado actual y comentarios de dominio para facilitar la gobernanza y los movimientos administrativos posteriores.

---

| Documento | Ruta | Estado | Dominio | Owner | Comentario |
|---|---|---:|---|---|---|
| `00_SOURCE_OF_TRUTH.md` | `docs/00_SOURCE_OF_TRUTH.md` | **Draft (Pending approval)** | Gobernanza | TBD | Documento maestro para revisión final. No mover aún. |
| `DOCUMENT_INDEX.md` | `docs/DOCUMENT_INDEX.md` | **Draft (Pending approval)** | Gobernanza | TBD | Índice maestro (este archivo). |
| `symbolic_contradictions_matrix.csv` | `docs/00_SOURCE_OF_TRUTH/symbolic_contradictions_matrix.csv` | Proposed | Tests / Docs | TBD | Matriz de contradicciones detectadas. |
| `symbolic_contradictions_governance.md` | `docs/00_SOURCE_OF_TRUTH/symbolic_contradictions_governance.md` | Proposed | Governance | TBD | Propuestas de acción por ítem. |
| `symbolic_contradictions_jira.csv` | `docs/00_SOURCE_OF_TRUTH/symbolic_contradictions_jira.csv` | Proposed | Governance | TBD | CSV listo para import a Jira con issues. |
| `legacy_tests_runtime_report_2026-01-10.md` | `docs/00_SOURCE_OF_TRUTH/legacy_tests_runtime_report_2026-01-10.md` | **Active** | Tests / Runtime | TBD | Reporte de estado actual en DB (evidence). |
| `runtime_testmodule_dump.csv` | `docs/00_SOURCE_OF_TRUTH/runtime_testmodule_dump.csv` | **Active** | Tests / Runtime | TBD | Volcado runtime de `TestModule`. |
| `runtime_analysis_kinds.csv` | `docs/00_SOURCE_OF_TRUTH/runtime_analysis_kinds.csv` | **Active** | Tests / Runtime | TBD | Conteo por tipo de análisis. |
| `repo_modules_inventory.md` | `docs/00_SOURCE_OF_TRUTH/repo_modules_inventory.md` | **Active** | Repo Inventory | TBD | Inventario de módulos y status en el repo. |
| `final_contradictions_matrix.csv` | `docs/00_SOURCE_OF_TRUTH/final_contradictions_matrix.csv` | Proposed | Governance | TBD | Matriz reconciliada y final propuesta. |
| `final_system_classification.md` | `docs/00_SOURCE_OF_TRUTH/final_system_classification.md` | Proposed | Governance / Product | TBD | Clasificación final: KEEP / REBUILD / REMOVE. |
| `TESTS_HOLISTIC_CATALOG.md` | `docs/00_SOURCE_OF_TRUTH/TESTS_HOLISTIC_CATALOG.md` | **Active** | Tests Catalog | TBD | Catálogo holístico de tests (actual). |
| `CHAT_CONTINUITY_PROTOCOL.md` | `docs/CHAT_CONTINUITY_PROTOCOL.md` | **Active** | Governance / Ops | TBD | Protocolo vinculante para continuidad de chats con agentes. |
| `HOLISTIC_FEDERATION_POLICY.md` | `docs/HOLISTIC_FEDERATION_POLICY.md` | **Active** | Governance | Arquitectura | Política de federación holística (v2.0). Supersede WORKSPACE_ISOLATION_POLICY.md. |
| `FEDERATION_HUBS_CONTRACT.md` | `docs/FEDERATION_HUBS_CONTRACT.md` | **Active** | Governance / Contracts | Arquitectura | Contratos técnicos para Federation Hubs (SCDF, SCID-5, MSHE). |
| `SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md` | `docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md` | **Active** | AI / Prompts | Arquitectura | System Prompt v2.0 con IA Mayéutica y soporte de federación. |
| `HOLISTIC_FEDERATION_ROADMAP.md` | `docs/HOLISTIC_FEDERATION_ROADMAP.md` | **Active** | Governance / Roadmap | Arquitectura | Plan de implementación por fases (0-5). Estimado 4-12 meses. |
| `HOLISTIC_FEDERATION_EXECUTIVE_SUMMARY.md` | `docs/HOLISTIC_FEDERATION_EXECUTIVE_SUMMARY.md` | **Active** | Governance / Executive | Arquitectura | Resumen ejecutivo de transición a federación holística. |
| `LEGACY_MIGRATION_PLAN.md` | `docs/LEGACY_MIGRATION_PLAN.md` | **Active** | Governance / Migration | Arquitectura | Plan de migración de documentos legacy a nueva estructura. |
| `WORKSPACE_ISOLATION_POLICY.md` | `docs/legacy/2026-01-20_pre-federation/WORKSPACE_ISOLATION_POLICY.md` | **LEGACY (SUPERSEDED)** | Governance | Arquitectura | Superseded por HOLISTIC_FEDERATION_POLICY.md (v2.0). Archivado 2026-01-20. |
| `SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md` (v1.0) | `docs/legacy/2026-01-20_pre-federation/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v1.md` | **LEGACY (SUPERSEDED)** | AI / Prompts | Arquitectura | Superseded por v2.0 con IA Mayéutica. Archivado 2026-01-20. |
| `TESTS_SYSTEM.md` | `docs/legacy/2026-01-20_pre-federation/TESTS_SYSTEM.md` | **LEGACY (INFORMATIVO)** | Tests / Runtime | Arquitectura | Sistema de tests modulares (histórico). Superseded por runtime reports. |
| `SYMBOLIC_AI_PHASE_0_CONTRACT.md` | `docs/legacy/2026-01-20_pre-federation/SYMBOLIC_AI_PHASE_0_CONTRACT.md` | **LEGACY (SUPERSEDED)** | AI / Contracts | Arquitectura | Superseded por SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md. |
| `PR_RETROACTIVE_AUDIT.md` | `docs/legacy/2026-01-20_pre-federation/PR_RETROACTIVE_AUDIT.md` | **LEGACY (INFORMATIVO)** | Governance / Audit | Arquitectura | Auditoría retroactiva de PRs (histórico). |
| `SYMBOLIC_INTERPRETER_AI_IMPLEMENTATION.md` | `docs/backLegacy/obsolete_architecture/SYMBOLIC_INTERPRETER_AI_IMPLEMENTATION.md` | HISTÓRICO | Docs / Governance | TBD | Archivado tras reconciliación; ver symbolic_contradictions_matrix.csv |
| `PR_WORKSPACE_GOVERNANCE_CHECKLIST__rescued.md` | `docs/legacy/2026-01-20_root-shadow/PR_WORKSPACE_GOVERNANCE_CHECKLIST__rescued.md` | **LEGACY (ROOT-SHADOW)** | Docs / Governance | TBD | Copia histórica movida desde `docs/_rescued_md_2026-01-04/` tras la consolidación canonical. |
| `PR_WORKSPACE_GOVERNANCE_CHECKLIST__backLegacy.md` | `docs/legacy/2026-01-20_root-shadow/PR_WORKSPACE_GOVERNANCE_CHECKLIST__backLegacy.md` | **LEGACY (ROOT-SHADOW)** | Docs / Governance | TBD | Copia histórica movida desde `docs/backLegacy/rescued_docs/` tras la consolidación canonical. |
| `UI_COPY_FREEZE.md` | `docs/backLegacy/rescued_docs/UI_COPY_FREEZE.md` | HISTÓRICO | Docs / Governance | TBD | Archivado tras reconciliación; ver symbolic_contradictions_matrix.csv |
| `tonyblanco-app/components/Tree/README.md` | `docs/backLegacy/rescued_docs/tonyblanco-app/components/Tree/README.md` | HISTÓRICO | Docs / Governance | TBD | Archivado tras reconciliación; ver symbolic_contradictions_matrix.csv |
| `faltan_test.md` | `docs/backLegacy/legacy_tests/faltan_test.md` | HISTÓRICO | Docs / Governance | TBD | Archivado tras reconciliación; ver symbolic_contradictions_matrix.csv |
| `ONBOARDING DE TERAPEUTAS + GUÍA DE USO DEL CORE WORKSPACE.md` | `docs/backLegacy/legacy_tests/ONBOARDING DE TERAPEUTAS + GUÍA DE USO DEL CORE WORKSPACE.md` | HISTÓRICO | Docs / Governance | TBD | Archivado tras reconciliación; ver symbolic_contradictions_matrix.csv |
| `IMPLEMENTATION-SUMMARY.md` | `docs/backLegacy/legacy_tests/IMPLEMENTATION-SUMMARY.md` | HISTÓRICO | Docs / Governance | TBD | Archivado tras reconciliación; ver symbolic_contradictions_matrix.csv |
| `FRONTEND-RESET-2025-12-14.md` | `docs/backLegacy/legacy_tests/FRONTEND-RESET-2025-12-14.md` | HISTÓRICO | Docs / Governance | TBD | Archivado tras reconciliación; ver symbolic_contradictions_matrix.csv |
| `DASHBOARD-ANTES-DESPUES.md` | `docs/backLegacy/legacy_tests/DASHBOARD-ANTES-DESPUES.md` | HISTÓRICO | Docs / Governance | TBD | Archivado tras reconciliación; ver symbolic_contradictions_matrix.csv |
| `CHANGELOG_2025-12-17_1033.md` | `docs/backLegacy/legacy_tests/CHANGELOG_2025-12-17_1033.md` | HISTÓRICO | Docs / Governance | TBD | Archivado tras reconciliación; ver symbolic_contradictions_matrix.csv |
| `Cabala2.md` | `docs/backLegacy/legacy_tests/Cabala2.md` | HISTÓRICO | Docs / Governance | TBD | Archivado tras reconciliación; ver symbolic_contradictions_matrix.csv |
| `RESUMEN-SESION-DEPLOY.md` | `docs/backLegacy/legacy_tests/RESUMEN-SESION-DEPLOY.md` | HISTÓRICO | Docs / Governance | TBD | Archivado tras reconciliación; ver symbolic_contradictions_matrix.csv |
| `README_CHANGELOG.md` | `docs/backLegacy/legacy_tests/README_CHANGELOG.md` | HISTÓRICO | Docs / Governance | TBD | Archivado tras reconciliación; ver symbolic_contradictions_matrix.csv |
| `PROBLEM-EXPLAINED.md` | `docs/backLegacy/legacy_tests/PROBLEM-EXPLAINED.md` | HISTÓRICO | Docs / Governance | TBD | Archivado tras reconciliación; ver symbolic_contradictions_matrix.csv |
| `PASOS-FINALES.md` | `docs/backLegacy/legacy_tests/PASOS-FINALES.md` | HISTÓRICO | Docs / Governance | TBD | Archivado tras reconciliación; ver symbolic_contradictions_matrix.csv |
| `CHANGELOG_2026-01-24_TIMELINE_IMPLEMENTATION.md` | `docs/CHANGELOG_2026-01-24_TIMELINE_IMPLEMENTATION.md` | **Active** | Releases / Implementation | Arquitectura | Changelog de implementación PROMPT #7 - Timeline y comparación de sesiones bioemocionales. |
| `DB_STRUCTURE.md` | `docs/technical/DB_STRUCTURE.md` | **Active** | Technical / Database | TBD | Estructura de base de datos del sistema. |
| `FEDERATION_PHASE1_IMPLEMENTATION_REPORT.md` | `docs/releases/phase-1/FEDERATION_PHASE1_IMPLEMENTATION_REPORT.md` | **Active** | Releases / Phase 1 | Arquitectura | Informe de implementación Phase 1 (autorizaciones federadas y controles). |
| `FEDERATION_MVP_PHASE1_DEBUG_E2E_REPORT.md` | `docs/releases/phase-1/FEDERATION_MVP_PHASE1_DEBUG_E2E_REPORT.md` | **Active** | Releases / Phase 1 | Arquitectura | Reporte debug E2E Phase 1 (evidencia de verificación). |
| `ARCHITECT_MODE_PHASE_0_COMPLETE.md` | `docs/releases/phase-0/ARCHITECT_MODE_PHASE_0_COMPLETE.md` | **Active** | Releases / Phase 0 | Arquitectura | Reporte de completitud de Fase 0 (Federación Holística). |
| `ARCHITECT_MODE_PHASE_0.1_PATCHES.md` | `docs/releases/phase-0/ARCHITECT_MODE_PHASE_0.1_PATCHES.md` | **Active** | Releases / Phase 0 | Arquitectura | Patches normativos para Fase 0.1 (eliminación de contradicciones). |
| `PHASE_0.1_COMPLETION_REPORT.md` | `docs/releases/phase-0/PHASE_0.1_COMPLETION_REPORT.md` | **Active** | Releases / Phase 0 | Arquitectura | Reporte de completitud de Fase 0.1. |
| `FEDERATION_MVP_COMPLETION_SUMMARY.md` | `docs/releases/phase-1/FEDERATION_MVP_COMPLETION_SUMMARY.md` | **Active** | Releases / Phase 1 | Arquitectura | Resumen de completitud Phase 1 (Federation MVP) y transición Phase 1. |
| `MCMI4_REFLECTION_IMPLEMENTATION_REPORT.md` | `docs/swm/MCMI4_REFLECTION_IMPLEMENTATION_REPORT.md` | **Active** | SWM / MCMI-4 | SWM | Reporte de implementación de MCMI-4 Reflection. |
| `SWM_MCMI4_IMPLEMENTATION_SUMMARY.md` | `docs/swm/SWM_MCMI4_IMPLEMENTATION_SUMMARY.md` | **Active** | SWM / MCMI-4 | SWM | Resumen de implementación MCMI-4. |
| `SWM_MCMI4_MANUAL_TESTING_GUIDE.md` | `docs/swm/SWM_MCMI4_MANUAL_TESTING_GUIDE.md` | **Active** | SWM / MCMI-4 | SWM | Guía de testing manual para MCMI-4. |
| `IDENTITY_REFACTOR_EXECUTION_REPORT.md` | `docs/swm/IDENTITY_REFACTOR_EXECUTION_REPORT.md` | **Active** | SWM / Identity | SWM | Reporte de refactor de identidad. |
| `IDENTITY_REFACTOR_PLAN.md` | `docs/swm/IDENTITY_REFACTOR_PLAN.md` | **Active** | SWM / Identity | SWM | Plan de refactor de identidad. |
| `FASE_2_BACKEND_ENDPOINTS_REPORT.md` | `docs/swm/FASE_2_BACKEND_ENDPOINTS_REPORT.md` | **Active** | SWM / Backend | SWM | Reporte de endpoints backend Fase 2. |
| `EXPLORACION_CANONICA_II.md` | `docs/EXPLORACIONES_CANONICAS/EXPLORACION_CANONICA_II.md` | **Active** | Exploraciones / Canónica II | Arquitectura | Exploración Canónica II. |
| `GOBERNANZA_EC_II.md` | `docs/EXPLORACIONES_CANONICAS/GOBERNANZA_EC_II.md` | **Active** | Exploraciones / Canónica II | Arquitectura | Gobernanza de Exploración Canónica II. |
| `GOBERNANZA_EXPLORACIONES_CANONICAS.md` | `docs/EXPLORACIONES_CANONICAS/GOBERNANZA_EXPLORACIONES_CANONICAS.md` | **Active** | Exploraciones / Governance | Arquitectura | Gobernanza general de Exploraciones Canónicas. |
| `MAPEo_CABALISTICO_EC_II.md` | `docs/EXPLORACIONES_CANONICAS/MAPEo_CABALISTICO_EC_II.md` | **Active** | Exploraciones / Canónica II | Arquitectura | Mapeo cabalístico de EC II. |
| `RESULTADOS_Y_VISIBILIDAD_EC_II.md` | `docs/EXPLORACIONES_CANONICAS/RESULTADOS_Y_VISIBILIDAD_EC_II.md` | **Active** | Exploraciones / Canónica II | Arquitectura | Resultados y visibilidad de EC II. |
| `AUDIT_REPORT_FINAL.md` | `docs/legacy/2026-01-20_root-shadow/AUDIT_REPORT_FINAL.md` | **LEGACY (ROOT-SHADOW)** | Audit / Historical | TBD | Reporte de auditoría final (histórico desde root). |
| `AUDIT_REPORT_FINAL__copy.md` | `docs/legacy/2026-01-20_root-shadow/AUDIT_REPORT_FINAL__copy.md` | **LEGACY (ROOT-SHADOW)** | Audit / Historical | TBD | Copia duplicada de reporte de auditoría. |
| `CRITICAL_CORRECTION_APPLIED.md` | `docs/legacy/2026-01-20_root-shadow/CRITICAL_CORRECTION_APPLIED.md` | **LEGACY (ROOT-SHADOW)** | Audit / Historical | TBD | Reporte de corrección crítica aplicada (histórico). |
| `CRITICAL_CORRECTION_APPLIED__copy.md` | `docs/legacy/2026-01-20_root-shadow/CRITICAL_CORRECTION_APPLIED__copy.md` | **LEGACY (ROOT-SHADOW)** | Audit / Historical | TBD | Copia duplicada de corrección crítica. |
| `DEBUG_AUDIT_REPORT.md` | `docs/legacy/2026-01-20_root-shadow/DEBUG_AUDIT_REPORT.md` | **LEGACY (ROOT-SHADOW)** | Debug / Historical | TBD | Reporte de debug de auditoría (histórico). |
| `DEBUG_MCMI4_MYSTIC_FLOW.md` | `docs/legacy/2026-01-20_root-shadow/DEBUG_MCMI4_MYSTIC_FLOW.md` | **LEGACY (ROOT-SHADOW)** | Debug / Historical | TBD | Debug de flujo MCMI-4 Mystic (histórico). |
| `PR_BODY.md` | `docs/legacy/2026-01-20_drafts/PR_BODY.md` | **LEGACY (DRAFT)** | Drafts / Temporal | TBD | Borrador de PR body (temporal). |
| `test_mcmi4_reflection_flow.md` | `docs/legacy/2026-01-20_drafts/test_mcmi4_reflection_flow.md` | **LEGACY (DRAFT)** | Drafts / Testing | TBD | Borrador de flujo de testing MCMI-4 (temporal). |
| `tests_catalog_status.md` | `docs/legacy/2026-01-20_drafts/tests_catalog_status.md` | **LEGACY (DRAFT)** | Drafts / Tests | TBD | Estado del catálogo de tests (temporal). |

---

## Leyenda
- **Draft (Pending approval):** Documento creado para revisión; no se mueven archivos hasta aprobación.
- **Proposed:** Recomendación o artefacto que requiere acción de gobernanza.
- **Active:** Documento/evidencia con validez runtime o de referencia actual.
- **LEGACY (SUPERSEDED):** Documento superseded por nueva política/versión (archivado con header).
- **LEGACY (INFORMATIVO):** Documento histórico/informativo sin reemplazo directo.
- **LEGACY (ROOT-SHADOW):** Documento movido desde root (auditorías/debug históricos).
- **LEGACY (DRAFT):** Borrador temporal archivado.
- **HISTÓRICO:** Documento archivado tras reconciliación anterior.

## Convención editorial (BINDING): Regla A Phase-1
- Phase-0/0.1 releases → `docs/releases/phase-0/`
- Phase-1+ (planes, inventarios, implementación, debug/E2E, evidencias) → `docs/technical/`
- No se utiliza `docs/releases/phase-1/` (decisión cerrada para evitar movimientos repetitivos).

## Verificación de rutas
- Todas las rutas en este índice deben apuntar a `docs/` (no a la raíz `/`).

---

## Procedimiento para movimientos administrativos (solo tras aprobación)
1. Gobernanza aprueba y asigna Issue/PR de movimiento.
2. Mover documentos aprobados a `docs/backLegacy/<...>`.
3. Añadir cabecera de trazabilidad en cada documento movido (ver plantilla en `00_SOURCE_OF_TRUTH.md`).
4. Actualizar estados y rutas en este `DOCUMENT_INDEX.md` (cambiar `Proposed` → `Archived` y actualizar `Ruta`).
5. Registrar commit y adjuntar referencia a Issue/PR que autoriza el movimiento.

---

**Nota:** Por ahora todos los documentos marcados como `Proposed` o `Draft` **no** deben moverse hasta la aprobación formal del comité de gobernanza.
