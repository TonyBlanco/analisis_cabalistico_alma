# Session Context — Análisis Cabalístico / Studios33

**Última actualización:** 2026-06-08  
**Rama:** `main` · **HEAD:** `fac64d6b`  
**Prod:** Hetzner `studios33.app` + `api.studios33.app`

## Current Focus

Coordinación multi-agente con AI Memory Layer; mantener wiring BD/API/FE de tests y módulo astrología Fase 3 en prod.

## Completed (reciente)

- Test catalog: migración `0090`, registry FE, guards asignación (`TEST_CATALOG_WIRING.md`)
- Astrología Fase 3: PDF export, timeline UI, snippets vía `llm_bridge` (Groq)
- Deploy Hetzner OK; `KERYKEION_AI_SNIPPETS_ENABLED=True` + `GROQ_API_KEY`
- AI Memory Layer instalado en este repo

## Active Tasks

- Smoke E2E astrología (snippets al cargar capa)
- Rotar `GEMINI_API_KEY` expuesta en `backend/.env.gemini` (git)
- Process Memory planai / RAG cábala (fuera de alcance inmediato)

## Next Steps

1. Al abrir sesión: `python3 memory_manager.py list --n 15`
2. Leer `docs/01_PROJECT_STATE/PROJECT_STATE_CURRENT.md` si toca arquitectura
3. Al cerrar: `memory_manager.py store` con `[DECISION]` / `[DEPLOY]` según cambios

## Key Docs

| Doc | Uso |
|-----|-----|
| `docs/01_PROJECT_STATE/TEST_CATALOG_WIRING.md` | Tests BD/API/FE |
| `docs/01_PROJECT_STATE/ASTROLOGIA_FASE3_AUDIT_2026-06-08.md` | Astrología Phase 3 |
| `docs/01_PROJECT_STATE/STUDIOS33_HETZNER_DEPLOYMENT.md` | Deploy prod |
| `docs/00_SOURCE_OF_TRUTH/SOURCE_OF_TRUTH.md` | Autoridad canónica |
| `AGENTS.md` | Ritual multi-agente |

## Deploy

```bash
bash deploy/studios33/scripts/deploy.sh
bash deploy/studios33/scripts/patch-astrology-ai-env.sh  # snippets flag
```