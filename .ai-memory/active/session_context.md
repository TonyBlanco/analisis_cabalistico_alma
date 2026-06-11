# Session Context — Análisis Cabalístico / Studios33

**Última actualización:** 2026-06-11 18:08 UTC  
**Rama:** `main` · **HEAD:** `cb13d7ce` · **Working tree:** 22 archivo(s) sin commit  
**Prod:** Hetzner `studios33.app` + `api.studios33.app`

## Current Focus

Centro Aprendizaje + Help Assistant — tests verdes, pendiente commit/deploy

## Completed (reciente)

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
- Cherry-pick PR1 a main, fix dep migración 0094→0090, deploy verde, API+web 200
- Último commit: `91363fcb` — fix(migrations): 0094 depende de 0090 en main (0093 no desplegada aún)

## Active Tasks

- Smoke E2E astrología (snippets al cargar capa)
- Rotar `GEMINI_API_KEY` expuesta en `backend/.env.gemini` (git)
- Process Memory planai / RAG cábala (fuera de alcance inmediato)

## Next Steps

1. Commit feat learning-center+help-assistant y smoke en navegador /learn

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
