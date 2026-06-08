# Sesión 2026-06-05 — Studios33 producción (auth, Turnstile, Google)

**Dominio:** `studios33.app` · **API:** `api.studios33.app` · **Servidor:** Hetzner `94.130.222.205` · `/opt/studio33`

---

## Hecho hoy ✅

### Infra / Nginx / Cloudflare
| Ítem | Detalle |
|------|---------|
| Django Admin CSS roto | CSP global de `voxtv_nginx` sustituida en `api.studios33.app` por CSP que permite `style-src 'unsafe-inline'` (admin usable) |
| CSP duplicada frontend | Quitada CSP en `deploy/studios33/nginx/studios33.app.conf`; solo Next `middleware.ts` |
| HTTPS 521 | Ya resuelto antes: TLS origen `:443` + Cloudflare Full |
| DNS Cloudflare | `@`, `api`, `www` → Hetzner (proxied) |

### Cloudflare Turnstile
| Ítem | Detalle |
|------|---------|
| Backend | `backend/api/turnstile.py`, validación en login/registro, `GET /api/turnstile/config/` |
| Frontend | `TurnstileField.tsx`, login + register personal/therapist, CSP `challenges.cloudflare.com` |
| Widget dedicado Studios33 | Site key `0x4AAAAAADfZv6Sq1SnWsdoI` (ya no VoxTV) |
| Producción | `/opt/studio33/.env` + `docker compose … --force-recreate studio33_api` |
| Secretos locales | `deploy/studios33/.env.studios33` (gitignored) |
| Error 110200 | Hostnames en dashboard CF + claves correctas en API |
| Verificación usuario | Turnstile OK en login |

### Google Sign-In (Gmail)
| Ítem | Detalle |
|------|---------|
| Google Cloud | Proyecto `studio33-app`, OAuth Web client `226125236218-…apps.googleusercontent.com` |
| Orígenes JSON | `studios33.app`, `www.studios33.app`, `localhost:3000` |
| Backend | `GOOGLE_CLIENT_ID` en settings vía env, `GET /api/google/config/`, `POST /api/login/google/` |
| Frontend | `GoogleSignInButton.tsx`, botón en `/login`, CSP `accounts.google.com` |
| Producción | Variables en `/opt/studio33/.env`, deploy `deploy.sh` |
| Prueba usuario | Login Gmail → cuenta **personal** creada, plan **trial/free** |

### Deploy / scripts
| Archivo | Uso |
|---------|-----|
| `deploy/studios33/scripts/deploy.sh` | rsync + build api/web + nginx reload |
| `deploy/studios33/scripts/patch-turnstile-env.sh` | Sincronizar Turnstile desde `.env.studios33` |
| `deploy/studios33/scripts/patch-google-env.sh` | Sincronizar Google desde `.env.studios33` |
| `deploy/studios33/turnstile_add_hostnames.mjs` | API Turnstile (requiere token Account Turnstile Edit; DNS token no basta) |

### PlanAI / PIP (Fase 0 + 2, sin entrenamiento)
| Ítem | Detalle |
|------|---------|
| Docs | `planai.md`, `docs/01_PROJECT_STATE/planai/PHASE_0_*`, `PHASE_2_*`, `AUDIT_MODULOS_IA_2026-06-05.md` |
| Código | `api/ai/llm_bridge`, `governed_views`, `guardrails`, prompts `kabbalah_interpret_v1` / `bioemotional_draft_v1` |
| Prod | `docker compose build` + `--force-recreate studio33_api` (2026-06-05) |
| Migración | `api.0087_ai_interaction_feedback` |
| Tests | 35 tests + harness 50 casos — **OK** en servidor |
| CI | `.github/workflows/pip-ai-tests.yml` |

### PlanAI Fase 1 — Process Memory + RAG mínimo ✅ (agente, 2026-06-05)

**Estado:** base implementada; ya no es skeleton con `skip`.

| Pieza | Archivo / notas |
|-------|------------------|
| Modelos PIP | `ProcessEvent`, `ProcessSnapshot`, `EmbeddingChunk` en `backend/api/models.py` (~L1488) |
| Migración | `backend/api/migrations/0089_process_memory_phase1.py` (depende de `0088`) |
| Servicios | `backend/api/process_memory/services.py` — ownership terapeuta↔paciente, sanitización PHI básica, snapshots, chunks, `RAGService.retrieve()` |
| Ingesta | `backend/api/process_memory/ingestion.py` — Tarot seal (`ingest_tarot_seal`), cierre bioemocional, `AnalysisRecord` |
| Señales | `backend/api/process_memory/signals.py` — registradas en `api/apps.py` → `ApiConfig.ready()` |
| Tests | `backend/api/tests/test_process_memory.py` — **9 tests reales** (antes skip) |
| Docs | `docs/01_PROJECT_STATE/planai/PHASE_1_PROCESS_MEMORY.md`, `planai.md` (~L195, checklist Fase 1) |

**Validación local (agente):**
```bash
DEBUG=True /tmp/analisis-cabalistico-tests-venv/bin/python manage.py test ...
# Ran 59 tests in 5.583s — OK
DEBUG=True ... manage.py makemigrations api --check --dry-run
# No changes detected in app 'api'
```
Nota: `makemigrations --check` global puede seguir avisando renames de índices en app `sha` (no relacionado).

**Límites actuales (antes):** ranking lexical; sin Ollama/pgvector; seal Tarot sin wiring.

### Fase 1 — continuación (subagentes, misma sesión) 🟡

| Paso | Estado | Archivos clave |
|------|--------|----------------|
| 1. Wiring seal Tarot → `ingest_tarot_seal` | ✅ | `swm/tarot/views.py`, `ingestion.py` (`resolve_tarot_workspace_patient`, `build_tarot_spread_from_instance`), `ProcessMemoryTarotSealTest` |
| 2. Embeddings Ollama (scaffold) | ✅ | `api/process_memory/embeddings.py`, `PROCESS_MEMORY_EMBEDDINGS`, `deploy/studios33/ollama-compose.snippet.yml` |
| 3. pgvector (scaffold) | ✅ | `vector_store.py`, `ensure_pgvector` command, `PROCESS_MEMORY_VECTOR_BACKEND=lexical\|pgvector` |

**Tu hora (ops, sin código):** `ollama pull` en Hetzner si quieres embeddings; smoke invitación+email; rotar tokens expuestos.

### Vinculación terapeuta ↔ usuario registrado (Gmail/Google personal) ✅

| Pieza | Detalle |
|-------|---------|
| Modelo | `TherapistPatientInvitation` + migración `0088_therapist_patient_invitation.py` |
| API terapeuta | lookup por email, invite, list/cancel invitaciones pendientes |
| API personal | list/accept/reject invitaciones |
| Vistas | `backend/api/therapist_patient_invitation_views.py`, rutas en `urls.py` |
| Email | `send_therapist_patient_invitation_email()` en `backend/api/emails.py` |
| Tests | `backend/api/tests/test_therapist_patient_invitation.py` (6 tests) |
| UI terapeuta | `LinkExistingPatientModal.tsx`, `TherapistPendingInvitations.tsx`, página pacientes |
| UI personal | `TherapistInvitationBanner.tsx` |
| Prod Hetzner | migrate `0088`, 6 tests OK en contenedor; flujo usable sin email si SMTP falla |

**Reglas:** un `Patient` por `User`; consentimiento explícito; no reinvitar si ya vinculado a otro terapeuta.

### Correo transaccional — Proton SMTP en Studios33 ✅

**Aclaración:** Proton (MX/DNS) = **recibir** `@studios33.app`. La **API en Hetzner** envía por **SMTP Proton** (contraseña de aplicación), no por el buzón web automáticamente.

| Ítem | Detalle |
|------|---------|
| Django | `EMAIL_HOST=smtp.protonmail.ch`, puerto 587, TLS; auto `smtp.EmailBackend` si hay host+user |
| Producción | `/opt/studio33/.env` — `noreply@studios33.app` + token SMTP Proton |
| Script | `deploy/studios33/scripts/patch-proton-smtp-env.sh` (no commitear token) |
| Alternativa | `patch-smtp-env.sh` — copia Gmail desde `/opt/voxtvserver/.env` (patrón VoxTV) |
| DNS SPF | `deploy/studios33/cloudflare_dns.mjs` — `include:_spf.protonmail.ch` + `include:_spf.google.com` |
| Prueba | Email de prueba API → `noreply@studios33.app` — **recibido OK** en Proton |

**Seguridad:** rotar token SMTP Proton (expuesto en chat de sesión). VoxTV en Hetzner tenía credenciales Gmail placeholder (`test@example.com`); envío real VoxTV requiere contraseña de aplicación Google válida en `/opt/voxtvserver/.env`.

### Deploy / scripts (añadidos en sesión)
| Archivo | Uso |
|---------|-----|
| `deploy/studios33/scripts/patch-proton-smtp-env.sh` | SMTP Proton → `/opt/studio33/.env` + recreate `studio33_api` |
| `deploy/studios33/scripts/patch-smtp-env.sh` | SMTP Gmail desde VoxTV |
| `deploy/studios33/cloudflare_dns.mjs` | MX/SPF/DKIM Proton + A api/web |
| `deploy/studios33/env.example` | plantilla EMAIL_* Proton |

```bash
curl -s https://api.studios33.app/api/ai/status/
# {"ai_provider_mode":"free_first","llm_available":true,"training":{"fine_tune":false,...}}
```

### Explícitamente NO hecho (decisión usuario)
- Desplegar fixes de **scroll admin** Next (`reset-page-scroll`, sidebars) a producción
- **Commit** del diff local de scroll/UI admin en git

---

## Actualización legal / cookies (2026-06-05 — tarde)

### Hecho ✅
- Restaurado footer legal público en el landing con enlaces a:
  - `/terms`
  - `/privacy`
  - `/cookies`
- Creadas páginas públicas:
  - `tonyblanco-app/app/(public)/terms/page.tsx`
  - `tonyblanco-app/app/(public)/privacy/page.tsx`
  - `tonyblanco-app/app/(public)/cookies/page.tsx`
- Integrado Cookie-Script global con el script:
  - `https://cdn.cookie-script.com/s/3137ed99ea4d07a01c82e4a6a5b6e414.js`
- Integrado reporte detallado en `/cookies` con:
  - `https://report.cookie-script.com/r/3137ed99ea4d07a01c82e4a6a5b6e414.js`
- Corregido bloqueo CSP en frontend para permitir:
  - `https://cdn.cookie-script.com`
  - `https://report.cookie-script.com`
- Deploy forzado a Hetzner ejecutado y validado.

### Causa raíz detectada
- El banner no aparecía aunque el script estuviera incluido porque la política CSP del frontend bloqueaba Cookie-Script.
- Además, el footer legal del landing no estaba presente en la versión pública simplificada.

### Verificación hecha
- `https://studios33.app/` publica el script global de Cookie-Script.
- `https://studios33.app/cookies` publica la tabla de declaración detallada.
- La cabecera `Content-Security-Policy` ya incluye ambos dominios de Cookie-Script.
- Deploy terminó con smoke OK y suites del script:
  - `Ran 6 tests ... OK`
  - `Ran 20 tests ... OK`

### Nota operativa
- Si el banner no aparece en un navegador concreto, comprobar en incógnito o borrar cookies/consentimientos previos del dominio `studios33.app`.

---

## Incidente VoxTV (2026-06-05) — cerrado temporalmente ✅

- **Causa:** deploy Studios33 añadió `:443` en `voxtv_nginx`; `tv.voxtv.win` en Bunny con hostname/SSL roto.
- **Mitigación:** `tv.voxtv.win` → Cloudflare proxied A Hetzner (rollback Bunny). Doc: `VOXTVSERVER/docs/01_PROJECT_STATE/TEMP_DNS_TV_CLOUDFLARE_2026-06-05.md`
- **Prevención:** `deploy.sh` ahora llama `VOXTVSERVER/scripts/setup-voxtv-origin-ssl.sh` tras cada deploy Studios33.

---

## Pendiente ⏳

### Go-live / producto
| Prioridad | Ítem |
|-----------|------|
| ~~Alta~~ | ~~Smoke test completo HTTPS~~ ✅ probado por usuario (2026-06-08) |
| ~~Media~~ | ~~**Fase D:** Render/Vercel~~ ✅ repo cerrado — [FASE_D_CORTE_VERCEL_RENDER.md](./FASE_D_CORTE_VERCEL_RENDER.md) |
| Media | **Fase E:** registry tests, Tarot ruta única, ocultar “Próximamente” |
| Media | **planai Fase 1 — siguiente:** wiring Tarot seal, Ollama `nomic-embed-text`, pgvector/Qdrant, similitud vectorial |
| Alta | Smoke test invitación terapeuta + email Proton al destinatario real |
| Baja | Turnstile en más flujos (reset password cuando exista endpoint) |
| Baja | Turnstile + Google mismo submit (hoy Google no pide Turnstile) |

### Seguridad / ops
| Ítem |
|------|
| ~~Rotar Google / Proton / CF token~~ ✅ hecho por usuario (2026-06-08) |
| No commitear `deploy/studios33/.env.studios33` ni JSON `client_secret_*.json` |
| ~~Commit/push `main`~~ ✅ 2026-06-08 |

### Código local sin commitear (2026-06-05)
- Cambios en `backend/`, `tonyblanco-app/`, `deploy/`, migraciones, admin-pro, etc. (ver `git status`)
- Archivos nuevos destacados:
  - Auth/ops: `admin_permissions.py`, `turnstile.py`, `TurnstileField`, `GoogleSignInButton`
  - Invitaciones: `therapist_patient_invitation_views.py`, `0088_*`, modales/banners FE
  - Process memory: `backend/api/process_memory/` (`services`, `ingestion`, `signals`), `0089_*`, `test_process_memory.py`
  - Deploy/email: `patch-proton-smtp-env.sh`, `patch-smtp-env.sh`, `cloudflare_dns.mjs`

### Admin Django
- Contraseñas reseteadas en servidor para `tony`, `supertony`, `supportadmin` (sesión anterior)
- Panel `/admin` vía redirect `tonyblanco-app/app/admin` → API admin

---

## Comandos útiles

```bash
# Deploy completo (incluye TLS origen VoxTV post-Studios33)
SSH_KEY=$HOME/.ssh/id_ed25519_hetzner bash deploy/studios33/scripts/deploy.sh

# Backup DB Fase D
bash deploy/studios33/scripts/backup-db.sh

# Solo claves Turnstile / Google / Proton SMTP
bash deploy/studios33/scripts/patch-turnstile-env.sh
bash deploy/studios33/scripts/patch-google-env.sh
PROTON_SMTP_USER=noreply@studios33.app PROTON_SMTP_TOKEN='…' \
  bash deploy/studios33/scripts/patch-proton-smtp-env.sh

# Comprobar API
curl -s https://api.studios33.app/api/turnstile/config/
curl -s https://api.studios33.app/api/google/config/
curl -s https://api.studios33.app/api/ai/status/
```

---

## Referencias
- [AUDIT_MODULOS_IA_2026-06-05.md](./AUDIT_MODULOS_IA_2026-06-05.md) — auditoría módulos / IA
- [planai.md](../../planai.md) — plan LLM que aprende de procesos
- [PHASE_1_PROCESS_MEMORY.md](./planai/PHASE_1_PROCESS_MEMORY.md) — Fase 1 implementada
- [STUDIOS33_HETZNER_DEPLOYMENT.md](./STUDIOS33_HETZNER_DEPLOYMENT.md)
- [PROJECT_STATE_CURRENT.md](./PROJECT_STATE_CURRENT.md) — sección Infraestructura Studios33
- Secretos: `deploy/studios33/.env.studios33`, DNS: `VOXTVSERVER/.env.studios33`
