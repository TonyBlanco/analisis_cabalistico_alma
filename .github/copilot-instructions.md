⚠️ ESTE DOCUMENTO DEFINE EL FLUJO OFICIAL DE TRABAJO CON AGENTES.
Si un prompt no cumple el formato descrito, la ejecución debe detenerse.
## AUTO MODEL ROUTING (MANDATORY)

When running in AUTO mode, select the model strictly based on TASK TYPE:

- AGENTE_ARQ >
  Model: GPT-5.2
  Reason: Mejor para gobernanza, arquitectura, control de alcance y decisiones no implícitas.
  Forbidden: escribir código, refactors, UI.

- DEBUG >
  Model: GPT-5.1
  Reason: Análisis estructurado, detección de causas raíz, lectura de código sin modificarlo.
  Forbidden: aplicar fixes, escribir código.

- CODE >
  Model: Claude Sonnet 4.5
  Reason: Mejor balance precisión / contexto largo / respeto de restricciones.
  Required: entregar diff, pasos de prueba y riesgos.
  Forbidden: cambios fuera del scope autorizado por AGENTE_ARQ.

- DOCS >
  Model: GPT-5.1 mini
  Reason: Documentación clara, auditoría, contratos, sin sobre-ingeniería.
  Forbidden: tocar código, sugerir cambios técnicos.

If AUTO mode cannot infer the task type:
→ Default to AGENTE_ARQ and STOP.



Resumen rápido
- Gobernanza estricta: los agentes no toman decisiones implícitas ni "arreglan cosas de más".
- Si un prompt no incluye un prefijo válido, asumir `AGENTE_ARQ` y detenerse.

PREFIJOS Y ROLES (resumen)
- `AGENTE_ARQ >` — Arquitectura y gobernanza (default si no hay prefijo). Define alcance y autoriza acciones. No escribe código.
- `CODE >` — Implementa solo código dentro del scope autorizado. Entregar diff, cómo probar, riesgos.
- `DOCS >` — Documentación y auditoría. No tocar código ni ejecutar comandos.
- `DEBUG >` — Diagnóstico sin aplicar cambios. Responder con 1) fallo 2) evidencia 3) causas 4) causa probable 5) propuesta de fix (no aplicar).

REGLA DE PARADA
- Si el prompt mezcla objetivos (code+docs+debug), no respeta el prefijo o está ambiguo: PARAR y pedir reformulación.

SECUENCIA OBLIGATORIA
1) `AGENTE_ARQ` — Decisión y autorización.
2) `DEBUG` — Diagnóstico (si aplica).
3) `AGENTE_ARQ` — Decide la solución.
4) `CODE` o `DOCS` — Ejecuta una sola cosa.
5) `DEBUG` — Verificación (lectura).

Referencia breve del repositorio (qué mirar primero)
- Backend: [backend](backend/) — contiene `db.sqlite3`, `API_DOCUMENTATION.md` y jobs como `create_admin_job.py`.
- App entry / backend runner: `app_cabalistica.py` and PowerShell starters: `start-flask.ps1`, `start-backend.ps1`, `start-all.ps1`.
- Frontend: TypeScript React files like `holistic_kabbalistic_assessments.tsx`, `DASHBOARD-PROFESIONAL-NUEVO.tsx`, plus `package.json` and `tsconfig.json`.
- Data-driven test modules: pattern `<name>_bank.py` paired with `<name>_items.json|csv` and `<name>_schema.py` (examples: `mcmi4_bank.py`, `pcl5_bank.py`, `asrs6_schema.py`).
- Scripts and automation: many maintenance/setup scripts are PowerShell (`setup-lms.ps1`, `populate-lms.ps1`, `setup-production-admin.ps1`).
- Source of truth: `docs/00_SOURCE_OF_TRUTH.md` — authoritative for policy and architecture.

Project-specific conventions (actionable)
- Use the provided PowerShell scripts to start services — avoid inventing run commands. Example: use `start-flask.ps1` to run the backend locally.
- Avoid touching `backend/db.sqlite3` directly; treat it as production-like data unless a task explicitly authorizes DB changes.
- When modifying or adding test modules, follow the `<name>_bank.py` + `<name>_items.json` convention and update `initialize_tests.py` or referenced loaders.
- Prefer small, focused changes: one PR per concern; agents must list exact files changed and a one-paragraph rationale.

How to produce outputs (required for `CODE >`)
- Provide a unified patch (diff) — use the repo's `apply_patch` flow or standard git patch.
- Include: files changed, brief test steps, expected verification commands (e.g., run `start-flask.ps1` then exercise endpoint X), and rollback notes.

Example prompt template (mandatory)
<PREFIJO> >
Context: (1–3 líneas)
Objetivo: (una sola cosa, clara)
Restricciones: (archivos a NO tocar, no ejecutar DB migrations, etc.)
Entregable: (diff + test steps)

## HARD STOP RULE

If a prompt mixes more than one task type (e.g. CODE + DOCS):
- Do NOT execute.
- Ask for reformulation using a single prefix.

Silence is preferred over wrong execution.


FIN — Pide aclaraciones si algún alcance no está explícito.