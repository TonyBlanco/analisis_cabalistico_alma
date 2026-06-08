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