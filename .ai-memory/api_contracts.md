# API Contracts

> Document endpoints here. Update whenever an endpoint is added, modified, or deprecated.

## Format

```
## [YYYY-MM-DD] Endpoint — Description
**Method:** GET | POST | PUT | DELETE | PATCH
**Path:** /api/v1/resource
**Auth:** Bearer JWT | API Key | None
**Request:** JSON schema or N/A
**Response:** JSON schema
**Change:** NEW | MODIFIED | DEPRECATED
**Agent:** claude | codex | manual
```

---

<!-- Add entries below this line -->

## [2026-06-11] Therapist Dashboard Workload — ampliación
**Method:** GET
**Path:** /api/therapist/dashboard/
**Auth:** Token + IsTherapist
**Request:** N/A
**Response:** Legacy fields + `workload` (ver `.ai-memory/therapist_dashboard_contract.md`)
**Change:** MODIFIED
**Agent:** grok (orquestador D1)

## [2026-06-11] Help Assistant — product usage RAG
**Method:** POST
**Path:** /api/help/ask
**Auth:** Token + IsAuthenticated
**Request:** `{ query: string, route?: string, screen?: string, locale?: string }` — sin PHI
**Response:** `{ success, answer, citations[], fallback_guide?, grounding, provider?, usage? }` — ver `docs/01_PROJECT_STATE/HELP_ASSISTANT_CONTRACT.md`
**Metering:** `task_type=help.ask`
**Change:** NEW
**Agent:** grok

## [2026-06-11] Therapist sessions/notes — consumo dashboard
**Method:** GET/POST
**Path:** /api/therapist/sessions/ | /api/therapist/notes/
**Auth:** Token + IsTherapist
**Decision:** Mantener; avance agregado en dashboard/workload; consumo directo solo en ficha paciente
**Change:** DOCUMENTED (no deprecate)
**Agent:** grok (D4)
