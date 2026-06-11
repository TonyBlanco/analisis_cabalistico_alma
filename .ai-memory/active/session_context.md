# Session Context — Análisis Cabalístico / Studios33

**Última actualización:** 2026-06-11 19:22 UTC  
**Rama:** `chore/security-gemini-key-and-help-consolidation` · **HEAD:** `3c90cfbf` · **Working tree:** 7 archivo(s) sin commit  
**Prod:** Hetzner `studios33.app` + `api.studios33.app`

## Current Focus

Fase 2 Learning Center: rate-limit help/ask, analytics AN1, GIFs guías

## Completed (reciente)

- Centro /learn + POST /api/help/ask desplegados; tests 8/8; docs/plan/memoria sincronizados
- Último commit: `3c90cfbf` — chore(security+help): rotar GEMINI_API_KEY + consolidar help_assistant
- Fix classify_help_scope acentos; fallback desde citas; catálogo learning-center; widget envía route
- Último commit: `cb13d7ce` — fix(hybrid-metrics): usar apiUrl() — faltaba / entre base y path (404)
- Merge feat/therapist-dashboard-revamp; plan DoD checklist [x]; smoke prod OK
- Último commit: `ad5b50f6` — docs(plans): add Therapist Dashboard revamp + Learning Center/Help-AI plans (orchestrator handoff)
- Dashboard terapeuta: workload BE+FE+tests+incidencia cerrada en rama feat/therapist-dashboard-revamp
- Deploy verde, 0096 aplicada, AI_METERING_ENABLED=true, panel FE + cableado completo
- Último commit: `4fac3ffa` — fix(astrologia): 429 Groq no bloquea informe ni guarda errores como interpretación
- TherapistAIUsagePanel en dashboard; usage_context en holistic_ai, synthesis, governed, tarot_holistic, swm_v3
- Fase 1 metering: modelo, bridge, astrología, API usage, tests 11 OK, migración 0096
- Spec metering + actualización docs IA (14 archivos)

## Active Tasks

- Smoke E2E astrología (snippets al cargar capa)
- Rotar `GEMINI_API_KEY` expuesta en `backend/.env.gemini` (git)
- Process Memory planai / RAG cábala (fuera de alcance inmediato)

## Next Steps

1. Smoke autenticado widget help/ask en prod; opcional rate-limit AI5

## Key Docs

| Doc | Uso |
|-----|-----|
| `docs/01_PROJECT_STATE/AI_USAGE_METERING_IMPLEMENTATION.md` | Metering IA todos módulos |
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
