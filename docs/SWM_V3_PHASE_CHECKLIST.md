# SWM v3 — Checklist técnico por fases (Phase 1 → Phase 3)

Nota: Este checklist es documental y no realiza cambios en código. Sirve para guiar a un agente implementador.

Precondiciones (obligatorias antes de Phase 1)
- Auditoría leída y aprobada (docs/00_SOURCE_OF_TRUTH/AUDITORIA CABALA APP 12182025.md)
- Documento rector `docs/SWM_V3_INTERPRETACION_SIMBOLICA_GOBERNADA.md` presente
- Feature flag definido: `AI_TAROT_ENABLED` (por defecto `false`)
- Registro de intención en `01_PROJECT_STATE/PROJECT_STATE_CURRENT.md`

Phase 1 — Datos y esquema (Docs & approvals)
Objetivo: definir y aprobar el esquema de datos y tipos sin tocar `src/symbolic/`.

Checklist:
- [ ] Definir TypeScript/JSON schema (documentar campos obligatorios y opcionales).
- [ ] Publicar `spec` del deck-augmentation (ej.: `TarotArcanaAI` interface) en `/docs`.
- [ ] Crear ejemplo de mapping (documental) para 3–5 arcanos en `/docs/examples` (NO crear archivos en `src/`).
- [ ] Aprobación de equipo de datos y auditoría (sign-off en `01_PROJECT_STATE`).
- [ ] Security/privacy review: confirmar no inclusión de prompts crudos ni texto de fuentes externas.

Acceptance criteria (Phase 1):
- Schema documentado en `/docs` y aprobado por auditoría.
- Checklist aprobado y registrado en `01_PROJECT_STATE`.

Stop conditions (Phase 1):
- Falta de sign-off de auditoría.
- Conflicto con reglas de `DOCUMENTATION_GOVERNANCE.md`.

Phase 2 — API core (contratos) y mocks (Docs & infra prep)
Objetivo: definir contratos API, mocks y tests sin crear endpoints reales.

Checklist:
- [ ] Especificar contratos de API (input/output) en OpenAPI fragment o JSON schema en `/docs/specs`.
- [ ] Documentar parámetros de IA (temperature, seed, max_tokens) y límites recomendados.
- [ ] Definir `explanationTrace` estructurado y formato de auditoría (hashes/metadata en vez de prompts crudos).
- [ ] Documentar mocks y fixtures necesarios; proporcionar ejemplos JSON en `/docs/fixtures` (NO agregarlos al `src`).
- [ ] Definir pruebas unitarias esperadas y criterios de éxito (fixtures vs expected outputs).
- [ ] Security review: rate-limiting, token usage, secrets handling.
- [ ] Registerar runbook mínimo y rollback plan (documental).

Acceptance criteria (Phase 2):
- OpenAPI fragment + fixtures documentados y aprobados.
- Runbook y límites de uso definidos.

Stop conditions (Phase 2):
- Cualquier contrato que requiera nuevo endpoint sin aprobación explícita.
- Falta de runbook o límites de uso.

Phase 3 — UI mínimo (consentimiento) — especificación documental
Objetivo: diseñar y aprobar UX/consent flow y artefactos que el implementador deberá crear.

Checklist:
- [ ] Documentar screens y componentes necesarios (TarotReading, ConsentBanner, DetailModal) con props y eventos esperados.
- [ ] Definir copy legal y disclaimer obligatorio (texto breve y no clínico).
- [ ] Consent flow: opt-in, audit log fields, revocation flow (API contract placeholder documented).
- [ ] Accessibility and UX acceptance criteria (WCAG basics: focus order, labels).
- [ ] Human-review signoff plan: 15–30 sample readings and reviewer criteria documented.

Acceptance criteria (Phase 3):
- UI specs y copy aprobados; checklist de accesibilidad completado.
- Consent flow definido con campos de auditoría (timestamp, userId, scope).

Stop conditions (Phase 3):
- Copy o UX que incumpla el principle de no-clínico.
- Consentimiento no auditable o irreversible.

Entrega de artefactos (por fase)
- Documento de esquema (Phase 1)
- OpenAPI fragment + fixtures (Phase 2)
- UI specs + copy + consent audit fields (Phase 3)

Notas finales
- Ninguna fase debe crear código ni endpoints; todo artefacto debe ser documental y versionado en `/docs` y registrado en `01_PROJECT_STATE`.
