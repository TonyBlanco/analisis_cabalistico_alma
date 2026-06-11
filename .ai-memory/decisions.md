# Technical Decisions

> Git-tracked memory for all agents. Append via `memory_manager.py store "[DECISION] ..."`.

## [2026-06-08] AI Memory Layer en repo

**Context:** Múltiples agentes (Claude Code, Grok, Codex) pierden contexto entre sesiones.  
**Decision:** Instalar `ai-memory-layer` — `.ai-memory/`, `memory_manager.py`, hooks Claude, `CODEX_CONTEXT.md`.  
**Consequences:** Leer `AGENTS.md` al inicio; escribir memoria al cerrar sesiones productivas.  
**Agent:** grok

## [2026-06-08] Test catalog — tres capas

**Context:** Colisiones `scl90`, `stress` vs `stress-regulation`.  
**Decision:** BD `_safe_testmodule_queryset` + registry FE `implemented` + UI guards; migración `0090`.  
**Consequences:** `appears_in_catalog` ≠ FE listo; ver `TEST_CATALOG_WIRING.md`.  
**Agent:** grok

## [2026-06-08] Astrología snippets → llm_bridge (Groq)

**Context:** Fase 3 activó snippets solo con Gemini; prod usa `free_first` + Groq.  
**Decision:** `ai_snippets.py` usa `llm_bridge.generate_text`; prod solo necesita `KERYKEION_AI_SNIPPETS_ENABLED=True`.  
**Consequences:** No depender de `GEMINI_API_KEY` para snippets.  
**Agent:** grok

## [2026-06-05] Producción Studios33 en Hetzner

**Context:** Migración desde Render/Vercel.  
**Decision:** Stack aislado en `/opt/studio33`, dominio `studios33.app`, Postgres compartido VoxTV.  
**Consequences:** Deploy solo vía `deploy/studios33/scripts/deploy.sh`.  
**Agent:** manual

## [2026-06-11] [ENDPOINT] GET /api/therapist/dashboard/ — bloque workload (D1/D6)

**Context:** El dashboard terapeuta necesitaba vista operativa de consultantes, tests y acciones sin ampliar superficie PHI ni cablear endpoints huérfanos de sesiones/notas en home.  
**Decision:** Ampliar `GET /api/therapist/dashboard/` con bloque backward-compatible `workload` (`summary`, `patients[]`, `action_items[]`). Agregación en `backend/api/therapist_workload.py`; FE consume vía `useTherapistWorkload` + `TherapistWorkloadSection`.  
**Consequences:** Contrato congelado en `.ai-memory/therapist_dashboard_contract.md`. `/api/therapist/sessions/` y `/api/therapist/notes/` quedan para ficha de paciente. Incidencia `2026-01-05-visibility-assigned-tests.md` cerrada (RESOLVED 2026-06-11).  
**Agent:** sub-qa

## [2026-06-11] Therapist dashboard — sessions/notes no cableados en home (D4)

**Context:** `GET /api/therapist/dashboard/` se amplía con bloque `workload`; existen endpoints huérfanos `/api/therapist/sessions/` y `/api/therapist/notes/` sin consumo en dashboard home.  
**Decision:** NO cablear sessions/notes en el dashboard principal. Señales de avance agregadas en `workload.patients[].progress`, `last_session_at` y `sessions_count`. Endpoints `/sessions/` y `/notes/` se mantienen para ficha de paciente y sesión nueva (consumo diferido).  
**Consequences:** SUB-FRONTEND usa solo `workload` del dashboard ampliado; incidencia `2026-01-05-visibility-assigned-tests.md` se cierra al cablear UI operativa. Contrato congelado en `.ai-memory/therapist_dashboard_contract.md`.  
**Agent:** sub-backend