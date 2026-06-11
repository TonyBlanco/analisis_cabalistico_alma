# System Architecture — Studios33 / Análisis Cabalístico

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 App Router (`tonyblanco-app/`) |
| Backend | Django + DRF (`backend/`) |
| DB | PostgreSQL (Hetzner `studio33_db`) |
| Auth | Token-based; roles: admin / therapist / personal / patient |
| AI | `llm_bridge` → prod `gemini` primero; metering por terapeuta (spec 2026-06-10) |
| Deploy | `deploy/studios33/` → Hetzner Docker |

## Dominios funcionales

- **Tests clínicos/holísticos:** `TestModule` (BD) + `clinicalTests.registry.ts` (FE) — ver wiring doc
- **SWM:** MCMI4 mystic, Tarot, Resonancia Ancestral — assignment-only modules
- **Astrología:** Kerykeion endpoints + `AstrologyProfessionalView` (FE)
- **AnalysisRecord:** núcleo de análisis (snapshots inmutables)

## Reglas selladas

- `execution_mode` nunca viene del request
- Ownership terapeuta–paciente obligatorio
- Admin no es actor clínico

## AI billing (pendiente código)

- Spec: `docs/01_PROJECT_STATE/AI_USAGE_METERING_IMPLEMENTATION.md`
- Modelo: base + créditos AI incluidos + overage; ledger `AIUsageEvent` por `task_type`
- Informe sesión astrología (PR1) no consume tokens

## Fuentes de verdad

1. `docs/00_SOURCE_OF_TRUTH/SOURCE_OF_TRUTH.md`
2. `docs/01_PROJECT_STATE/PROJECT_STATE_CURRENT.md`
3. `docs/01_PROJECT_STATE/AI_USAGE_METERING_IMPLEMENTATION.md` (metering IA)
4. `.ai-memory/active/session_context.md` (estado de sesión)