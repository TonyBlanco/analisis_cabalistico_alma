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

## [2026-06-11] Therapist sessions/notes — consumo dashboard
**Method:** GET/POST
**Path:** /api/therapist/sessions/ | /api/therapist/notes/
**Auth:** Token + IsTherapist
**Decision:** Mantener; avance agregado en dashboard/workload; consumo directo solo en ficha paciente
**Change:** DOCUMENTED (no deprecate)
**Agent:** grok (D4)

## [2026-06-13] Auth avanzado — magic link, OTP, passkeys
**Doc:** `docs/01_PROJECT_STATE/AUTH_ADVANCED_2026-06-13.md`
**Change:** NEW (prod Hetzner, migración 0102)
**Agent:** grok

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /api/auth/magic-link/request/ | None | Solicitar enlace mágico |
| POST | /api/auth/magic-link/verify/ | None | Canjear enlace → token |
| POST | /api/auth/otp/request/ | None | OTP login o password_reset |
| POST | /api/auth/otp/verify-login/ | None | Login con código 6 dígitos |
| POST | /api/auth/otp/verify-password-reset/ | None | Reset con OTP + nueva password |
| POST | /api/password-reset/request/ | None | Alias → envía OTP (no enlace largo) |
| POST | /api/password-reset/confirm/ | None | Reset legacy uid+token Django |
| POST | /api/auth/passkeys/register/options/ | Token | WebAuthn registro |
| POST | /api/auth/passkeys/register/verify/ | Token | Guardar passkey |
| POST | /api/auth/passkeys/login/options/ | None | WebAuthn login options |
| POST | /api/auth/passkeys/login/verify/ | None | Login passkey → token |
| GET | /api/auth/passkeys/ | Token | Listar passkeys |
| DELETE | /api/auth/passkeys/:id/ | Token | Eliminar passkey |
