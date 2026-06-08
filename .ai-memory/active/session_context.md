# Session Context — Análisis Cabalístico / Studios33

**Última actualización:** 2026-06-08 15:20 UTC  
**Rama:** `main` · **HEAD:** `f73e43b1` · **Working tree:** 4 archivo(s) sin commit  
**Prod:** Hetzner `studios33.app` + `api.studios33.app`

## Current Focus

Tarot PR-2 correspondencias UI; smoke E2E astrologia-tarot

## Completed (reciente)

- Último commit: `f73e43b1` — fix(tarot): align system tiers via tarotSystems.registry
- PR-1 registry wiring commit
- sync-session automático en Stop hook y comando memory_manager
- Último commit: `0e709836` — feat(memory): auto-sync session_context.md at session end
- AI Memory Layer instalado y sync-session automático configurado
- Último commit: `80206f43` — chore: install ai-memory-layer for multi-agent coordination
- Test catalog: migración `0090`, registry FE, guards asignación (`TEST_CATALOG_WIRING.md`)
- Astrología Fase 3: PDF export, timeline UI, snippets vía `llm_bridge` (Groq)
- Deploy Hetzner OK; `KERYKEION_AI_SNIPPETS_ENABLED=True` + `GROQ_API_KEY`
- AI Memory Layer instalado en este repo

## Active Tasks

- Smoke E2E astrología (snippets al cargar capa)
- Rotar `GEMINI_API_KEY` expuesta en `backend/.env.gemini` (git)
- Process Memory planai / RAG cábala (fuera de alcance inmediato)

## Next Steps

1. Deploy + verify astrologia-tarot labels in prod

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
