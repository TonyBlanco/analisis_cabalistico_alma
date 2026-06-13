# Session Context — Análisis Cabalístico / Studios33

**Última actualización:** 2026-06-13 21:10 UTC  
**Rama:** `main` · **HEAD:** `97db8f89` · **Working tree:** 6 archivo(s) sin commit  
**Prod:** Hetzner `studios33.app` + `api.studios33.app`

## Current Focus

Learning center desplegado prod

## Completed (reciente)

- Último commit: `97db8f89` — docs(learning-center): actualiza /learn con sprint 2026-06-13
- Push 97db8f89 learning-center; deploy /learn
- Migraciones 0002 seed MCMI4_REFLECTION+MYSTIC; deploy 44c0f007; prod definitions OK
- Último commit: `44c0f007` — fix(swm): seed MCMI4 workspace definitions on migrate
- PLAN-dashboard-terapeuta + cockpit docs actualizados reportes DONE
- Último commit: `93349c92` — docs(plan): mark therapist reports panel DONE — smoke prod confirmed
- 0108 migrate prod; sha_harmony en /api/tests/; guidance en clinicalTests.registry
- Último commit: `19a98932` — feat(catalog): activate sha_harmony for therapist assign + therapist guide
- therapist-reports en main+prod; smoke API OK (1 activo, 9 resultados, 1 alerta)
- Último commit: `463d5553` — feat(therapist): reports panel with portfolio, alerts, export (#reports)
- Último commit: `efb9dc49` — feat(resonance-map): F2 — Vista Árbol cableada al backend genealógico
- Fix classify_help_scope acentos; fallback desde citas; catálogo learning-center; widget envía route

## Active Tasks

- Smoke E2E astrología (snippets al cargar capa)
- Rotar `GEMINI_API_KEY` expuesta en `backend/.env.gemini` (git)
- Process Memory planai / RAG cábala (fuera de alcance inmediato)

## Next Steps

1. Smoke /dashboard/therapist/learn en prod

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
