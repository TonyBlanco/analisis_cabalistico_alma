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

```bash
curl -s https://api.studios33.app/api/ai/status/
# {"ai_provider_mode":"free_first","llm_available":true,"training":{"fine_tune":false,...}}
```

### Explícitamente NO hecho (decisión usuario)
- Desplegar fixes de **scroll admin** Next (`reset-page-scroll`, sidebars) a producción
- **Commit** del diff local de scroll/UI admin en git

---

## Pendiente ⏳

### Go-live / producto
| Prioridad | Ítem |
|-----------|------|
| Alta | Smoke test completo HTTPS: login email, Google, registro, dashboard personal, carta/Tarot, API clínica |
| Media | **Fase D:** desactivar o paralelizar Render/Vercel; backup `pg_dump studio33_db` |
| Media | **Fase E:** registry tests, Tarot ruta única, ocultar “Próximamente” |
| Media | **planai Fase 1:** Process Memory + RAG + Ollama embeddings |
| Baja | Turnstile en más flujos (reset password cuando exista endpoint) |
| Baja | Turnstile + Google mismo submit (hoy Google no pide Turnstile) |

### Seguridad / ops
| Ítem |
|------|
| Rotar **Google Client Secret** (expuesto en chat); actualizar `.env.studios33` + servidor |
| Renovar `CF_API_TOKEN` en `VOXTVSERVER/.env.studios33` (~5 días desde 2026-06-05) |
| No commitear `deploy/studios33/.env.studios33` ni JSON `client_secret_*.json` |
| Commitear código auth (Turnstile + Google) en `main` cuando el usuario quiera |

### Código local sin commitear (2026-06-05)
- Cambios en `backend/`, `tonyblanco-app/`, `deploy/`, migraciones, admin-pro, etc. (ver `git status`)
- Archivos nuevos: `admin_permissions.py`, `turnstile.py`, `TurnstileField`, `GoogleSignInButton`, `deploy/studios33/*`

### Admin Django
- Contraseñas reseteadas en servidor para `tony`, `supertony`, `supportadmin` (sesión anterior)
- Panel `/admin` vía redirect `tonyblanco-app/app/admin` → API admin

---

## Comandos útiles

```bash
# Deploy completo
SSH_KEY=$HOME/.ssh/id_ed25519_hetzner bash deploy/studios33/scripts/deploy.sh

# Solo claves Turnstile / Google
bash deploy/studios33/scripts/patch-turnstile-env.sh
bash deploy/studios33/scripts/patch-google-env.sh

# Comprobar API
curl -s https://api.studios33.app/api/turnstile/config/
curl -s https://api.studios33.app/api/google/config/
curl -s https://api.studios33.app/api/ai/status/
```

---

## Referencias
- [AUDIT_MODULOS_IA_2026-06-05.md](./AUDIT_MODULOS_IA_2026-06-05.md) — auditoría módulos / IA
- [planai.md](../../planai.md) — plan LLM que aprende de procesos
- [STUDIOS33_HETZNER_DEPLOYMENT.md](./STUDIOS33_HETZNER_DEPLOYMENT.md)
- [PROJECT_STATE_CURRENT.md](./PROJECT_STATE_CURRENT.md) — sección Infraestructura Studios33
- Secretos: `deploy/studios33/.env.studios33`, DNS: `VOXTVSERVER/.env.studios33`