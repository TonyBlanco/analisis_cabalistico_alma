# Studios33.app — Despliegue en Hetzner (aislado de VoxTV)

**Estado:** ACTIVO — **Fase A–C + auth (Turnstile + Google) en producción** (2026-06-05)  
**Fecha:** 2026-06-05 (dominio corregido: **`studios33.app`**, no `studio33.app`)  
**Sesión detallada:** [SESSION_2026-06-05_STUDIOS33.md](./SESSION_2026-06-05_STUDIOS33.md)
**Dominio objetivo:** `studios33.app` + `api.studios33.app` (sustituye el uso previsto de `tonyblanco.es` para esta app)  
**Nota:** Rutas internas en servidor (`/opt/studio33`, contenedores `studio33_*`) son nombres de carpeta; el dominio público es siempre **`studios33.app`**.  
**Servidor:** Hetzner dedicado (mismo hardware que VoxTV, **espacio lógico separado**)  
**Referencia infra VoxTV:** repositorio `VOXTVSERVER` (`/Volumes/T7/Development/VOXTVSERVER`)

---

## Progreso del plan (actualizado 2026-06-05 — tarde)

| Fase / ítem | Estado |
|-------------|--------|
| **A1** `/opt/studio33` + rsync código | ✅ Hecho |
| **A2** Postgres `studio33_db` + `studio33_user` | ✅ Hecho |
| **A3** Nginx vhosts `studios33.app` / `api.studios33.app` | ✅ Hecho (reload OK) |
| **A4** DNS Cloudflare → `94.130.222.205` | ✅ Hecho (script + `.env.studios33` local) |
| **A5** VoxTV sin regresión | ✅ `https://voxtv.win` responde 200 |
| **B1** `DATABASE_URL` en `settings.py` | ✅ Hecho |
| **B2** Contenedor `studio33_api` + ephemeris | ✅ Up (Gunicorn) |
| **B3** `migrate` Postgres | ✅ Hecho (migraciones SQLite→PG corregidas) |
| **B4** API en origen | ✅ `curl -H Host: api.studios33.app http://94.130.222.205/api/` → JSON |
| **C1** Dockerfile Next + `studio33_web` | ✅ Up |
| **C2** Frontend en origen | ✅ `curl -H Host: studios33.app http://94.130.222.205/` → 200 |
| **C3** HTTPS vía Cloudflare | ✅ TLS origen `:443` (`setup-origin-ssl.sh` + cert autofirmado) |
| **F1** Django Admin CSS en producción | ✅ CSP dedicada `api.studios33.app` (no heredar VoxTV) |
| **F2** Cloudflare Turnstile (login + registro) | ✅ Widget Studios33 + `TURNSTILE_ENFORCED` en prod |
| **F3** Google Sign-In (Gmail) | ✅ OAuth Web + `/login` + auto-registro `personal` trial |
| **F4** Secretos locales Studios33 | ✅ `deploy/studios33/.env.studios33` (gitignored) |
| **PIP0** Router LLM unificado (`llm_bridge`, `free_first`) | ✅ En imagen `studio33_api` (2026-06-05 noche) |
| **PIP2** Endpoints gobernados + prompts YAML | ✅ Prod: `/api/ai/status/`, kabbalah, bioemotional assist-draft, feedback |
| **PIP** Tests PlanAI (35) + harness 50 casos | ✅ OK en servidor (`studio33_user CREATEDB`) |
| **PIP** CI | ✅ `.github/workflows/pip-ai-tests.yml` |
| **D** Corte tráfico / desactivar Render + Vercel | ✅ Repo (2026-06-08); borrar proyectos en dashboards |
| **E** Deuda producto (registry, Tarot, etc.) | ⏳ Post-go-live |
| **—** Scroll fixes admin Next (local, no desplegado) | ⏸️ Descartado por usuario |
| **—** Commit / push `main` remoto | ⏳ Verificar `git push` local |
| **—** Rotar Google Client Secret (expuesto en chat) | ⏳ Recomendado |
| **—** Smoke test E2E (Tarot, terapeuta, etc.) | ⏳ Pendiente |
| **PIP1** Process Memory + RAG | ⏳ Siguiente fase planai |

**Credenciales locales:**  
- DNS Cloudflare: `VOXTVSERVER/.env.studios33` (token CF ~5 días)  
- Turnstile + Google: `deploy/studios33/.env.studios33` (gitignored)  

**Deploy:** `bash deploy/studios33/scripts/deploy.sh`  
**Parches env:** `patch-turnstile-env.sh`, `patch-google-env.sh`  

**PlanAI en prod (smoke):**
```bash
curl -s https://api.studios33.app/api/ai/status/
# ai_provider_mode: free_first, training.*: false
```

**Tests en servidor (sin terminal local):**
```bash
# En el host Hetzner — requiere CREATEDB en studio33_user (ya aplicado)
cd /opt/studio33 && docker compose -f docker-compose.studios33.yml run --rm \
  -v /opt/studio33/backend:/app studio33_api python manage.py test \
  api.tests.test_ai_llm_bridge api.tests.test_ai_guardrails \
  api.tests.test_planai_prompt_registry api.tests.test_planai_eval_harness \
  api.tests.test_ai_router_integration api.tests.test_ai_governed
```

---

## Resumen ejecutivo

- **Análisis Cabalístico** (repo: `Analisis Cabalistico`) es una app **Django + Next.js** holística/clínica, distinta de VoxTV (IPTV + API Node).
- **No debe interferir con `voxtv.win`**: rutas DNS, Nginx, Docker, Postgres, volúmenes, deploy scripts y variables en **carpetas y stacks independientes**.
- **`studios33.app`** es el dominio recomendado para producción propia (frontend + API en subdominios).
- El trabajo de código se detuvo ~**2026-01-29**; Render/Vercel siguen documentados pero este documento define el camino **self-hosted**.

> **Disclaimer:** La plataforma ofrece herramientas de acompañamiento y exploración simbólica. No sustituye diagnóstico médico ni psicológico profesional.

---

## 1. Por qué `studios33.app` y no `tonyblanco.es`

| Aspecto | `tonyblanco.es` | `studios33.app` (con **s**) |
|---------|-----------------|----------------|
| Marca / producto | Sitio personal / marca Tony Blanco | Marca de producto (Studio 33) |
| Expectativa usuario | Web corporativa o blog | App SaaS (login, dashboards, API) |
| Cookies / CORS / CSRF | Mezcla con otros sitios del dominio | Origen único y claro |
| Operación | Confusión con marketing | Un dominio = una aplicación |

**Decisión recomendada:** usar **`studios33.app`** para esta app. Mantener `tonyblanco.es` solo si en el futuro hay landing estática que **enlace** a Studios33, sin compartir backend ni cookies.

---

## 2. Principio de aislamiento respecto a VoxTV

VoxTV (`VOXTVSERVER`) en el mismo Hetzner:

| Recurso | VoxTV | Studio33 (Cabala) | ¿Compartir? |
|---------|-------|-------------------|-------------|
| Ruta en disco | `/opt/voxtvserver` | `/opt/studio33` | **No** |
| `docker-compose` | `voxtvserver/docker-compose.yml` | `studio33/docker-compose.yml` | **No** |
| Red Docker | `voxtv_net` | `studio33_net` | **No** |
| Contenedores | `voxtv_*` | `studio33_*` | **No** |
| PostgreSQL | DB `voxtv_db` | DB `studio33_db` | Mismo **motor** opcional, **DB distinta** |
| Nginx | `voxtv_nginx` + `conf.d/*.voxtv.win` | Solo `server_name` de `studios33.app` | Mismo proceso, **vhosts separados** |
| Puertos host | 80/443 (nginx) | Sin puertos extra públicos | Solo 80/443 |
| Deploy script | `scripts/deploy.sh` | `studio33/scripts/deploy.sh` | **No** reutilizar el de VoxTV |
| `.env` | `/opt/voxtvserver/.env` | `/opt/studio33/.env` | **No** |
| Cloudflare zone | `voxtv.win` | Zona `studios33.app` | **Cuentas/registros separados** |

### Lo que SÍ puede compartir el servidor (sin interferencia)

- SO: Ubuntu 24.04, UFW (22/80/443), Docker Engine, fail2ban.
- Contenedor **Nginx** existente: añadir archivos en `nginx/conf.d/` que solo respondan a `studios33.app` / `api.studios33.app`.
- Contenedor **Postgres** existente: segunda base de datos y usuario (sin tocar `voxtv_db`).
- Claves IA en el **mismo `.env` maestro del host** solo si se copian explícitamente a `/opt/studio33/.env` (no enlaces simbólicos al `.env` de VoxTV).

### Lo que NO debe hacerse

- Añadir rutas `/api` de Cabala al `server_name voxtv.win`.
- Montar volúmenes de Cabala dentro de `voxtv_api` o `voxtv_postgres` sin nombres dedicados.
- `rsync --delete` del repo Cabala sobre `/opt/voxtvserver`.
- Usar el mismo `SECRET_KEY` Django o `JWT_SECRET` de VoxTV.
- Redeploy de VoxTV al desplegar Studio33 (pipelines independientes).

```mermaid
flowchart TB
  subgraph hetzner [Hetzner i7-7700]
    subgraph ngx [Nginx container - shared edge only]
      VHOST_VOX[voxtv.win vhosts]
      VHOST_S33[studios33.app vhosts]
    end
    subgraph stack_vox [Docker stack VoxTV]
      VAPI[voxtv_api]
      VPG[(voxtv_db)]
    end
    subgraph stack_s33 [Docker stack Studio33]
      SAPI[studio33_api :8000]
      SWEB[studio33_web :3000]
      SPG[(studio33_db)]
    end
  end
  CF_VOX[Cloudflare voxtv.win] --> VHOST_VOX --> VAPI --> VPG
  CF_S33[Cloudflare studios33.app] --> VHOST_S33 --> SWEB
  VHOST_S33 --> SAPI --> SPG
```

---

## 3. Auditoría del proyecto (estado al 2026-06-05)

### 3.1 Arquitectura de software

| Capa | Ubicación | Notas |
|------|-----------|-------|
| Frontend | `tonyblanco-app/` | Next.js 16, App Router, roles admin/therapist/personal/patient |
| Backend | `backend/` | Django 5.2 + DRF, Gunicorn |
| Paquete simbólico | `packages/symbolic/` | Dependencia local `@holistica/symbolic` |
| Legacy / ruido | `src/`, `_legacy_*`, raíz con `.py` sueltos | No usar en deploy; `src/` duplica `tonyblanco-app/src` |

### 3.2 Última actividad git

- Último commit relevante: **2026-01-29** (Tarot SWM, auto-carga workspace, fixes).
- **Sin commits en febrero–junio 2026** en la rama revisada.
- Producción documentada anteriormente: Render + Vercel (`analisis-cabalistico-alma.*`).

### 3.3 Módulos por madurez

| Módulo | Backend | Frontend | Persistencia SWM | Notas |
|--------|---------|----------|------------------|-------|
| MCMI-4 Místico | ✅ | ✅ | ✅ | Sellado; no romper gobernanza |
| MCMI-4 Reflection | ✅ | ✅ | ✅ | Producción |
| Tarot holístico SWM | ✅ | ✅ | ✅ | IA multi-provider; ruta canónica `/(swm)/astrologia-tarot/` |
| Motor astrología (8 técnicas) | ✅ | ✅ | Parcial | Swiss Ephemeris; ~335 MB en `backend/astrology/ephemeris/` |
| Cábala SWM | ✅ | ✅ | ✅ | `holistica-aplicada`, reporte comprensivo |
| Transgeneracional SWM | ✅ | ✅ | ✅ | Tests API |
| Resonancia ancestral | API REST | ✅ UI grande | Parcial | `/api/resonancia/*` |
| Bio-emocional | ✅ `api/bioemotional` | ✅ | Parcial | Renombrado parcial diagnosis→exploration |
| AISymbolic Workspace | ❌ | mock | ❌ | **FROZEN** — no activar sin gobernanza |
| Personal basic-analysis | ❌ | placeholder | — | “En desarrollo” |
| Premium / recursos | stubs | UI | — | `getResources()` vacío; backend recursos incompleto |
| Usuario personal B2C | mínimo | mínimo | — | Prioridad baja vs terapeuta |

### 3.4 Defectos y deuda detectados (prioridad deploy)

1. **`backend/core/settings.py` usa SQLite por defecto** — `requirements.txt` incluye `psycopg2` pero no hay `DATABASE_URL` en settings; obligatorio cablear Postgres antes de producción en Hetzner.
2. **`clinicalTests.registry.ts` desactualizado** — muchos tests con `implemented: false` aunque existen rutas en `dashboard/patient/tests/`.
3. **Rutas Tarot duplicadas** — legacy `/tarot/` vs `/(swm)/astrologia-tarot/`.
4. **Documentación contradictoria** — auditoría SWM 2026-01-23 (Tarot sin backend) vs 2026-01-28 (Tarot completo); **prevalece el código**.
5. **Parches sin integrar en raíz:** `WIP_*.patch`, `solar_arc_changes.patch`.
6. **Build local no verificado** en entorno sin `node_modules`.
7. **E2E:** solo 2 specs Playwright.

### 3.5 Variables de entorno necesarias (backend)

```bash
DEBUG=False
SECRET_KEY=
ALLOWED_HOSTS=api.studios33.app,studios33.app
CORS_ALLOWED_ORIGINS=https://studios33.app,https://www.studios33.app
CSRF_TRUSTED_ORIGINS=https://studios33.app,https://www.studios33.app
FRONTEND_URL=https://studios33.app

# Postgres (pendiente implementar en settings)
DATABASE_URL=postgresql://studio33_user:PASSWORD@postgres:5432/studio33_db

SWISSEPH_PATH=/app/astrology/ephemeris

GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
AI_PROVIDER=gemini       # prod; free_first solo dev
GROQ_API_KEY=            # fallback / dev (TPD limitado en free)
GROQ_MODEL=llama-3.3-70b-versatile
OPENAI_API_KEY=          # fallback
OPENAI_MODEL=gpt-4o-mini
OLLAMA_BASE_URL=         # opcional, ej. http://ollama:11434
OLLAMA_MODEL=llama3.1
AI_METERING_ENABLED=true
AI_METERING_ENFORCED=false
AI_DEFAULT_INCLUDED_CREDIT_EUR=8.00
# Spec: docs/01_PROJECT_STATE/AI_USAGE_METERING_IMPLEMENTATION.md

ADMIN_DEFAULT_PASSWORD=  # migraciones admin
```

### 3.6 Variables de entorno (frontend, build time)

```bash
NEXT_PUBLIC_API_URL=https://api.studios33.app/api
```

---

## 4. DNS, Cloudflare y Bunny — estado real (auditoría 2026-06-05)

### Lo que hay hoy

| Elemento | Estado | Detalle |
|----------|--------|---------|
| **Zona `studios33.app` en Cloudflare** | Parcial | NS apuntan a Cloudflare (`damien.ns.cloudflare.com`, `coraline.ns.cloudflare.com`) |
| **Registros DNS → Hetzner** | ✅ Configurados | A `@`, `api`, CNAME `www` → `94.130.222.205` (proxied) |
| **Nginx en servidor** | ✅ | `studios33.app.conf`, `api.studios33.app.conf` en `voxtv_nginx` |
| **App en `/opt/studio33`** | ✅ Desplegada | `studio33_api`, `studio33_web` en `voxtvserver_voxtv_net` |
| **Bunny.net** | No aplica a esta app | Bunny en VoxTV es **Pull Zone IPTV** (`tv.voxtv.win`), no el dominio Cabala |

### Confusión de dominio (`studio33` vs `studios33`)

| Dominio | DNS actual | Uso |
|---------|------------|-----|
| **`studios33.app`** (correcto, Cabala) | Zona CF, **A → Hetzner** | Dominio objetivo de Análisis Cabalístico |
| **`studio33.app`** (sin **s**) | `A → 35.219.200.4` | Otro proyecto: landing OTT en `VOXTVSERVER/studio33/` (reproductor), **no** esta app Django/Next |

No mezclar los dos dominios. Toda la config de producción Cabala debe ir en **`studios33.app`**.

### ¿Hace falta Bunny para Studios33?

**No para arrancar.** Bunny en tu infra sirve para:

- Caché CDN de streams IPTV / `tv.voxtv.win`
- Certificados y hostname de streaming

La app Cabala (Next.js + Django + API JSON) va bien con:

**Cloudflare (proxy naranja) → Nginx Hetzner → contenedores**

Bunny solo tendría sentido más adelante si sirves **vídeos pesados** o assets estáticos masivos desde CDN dedicada (cursos, descargas). No es prerequisito.

### Cloudflare — registros a crear (cuando la app esté en el servidor)

IP origen Hetzner: **`94.130.222.205`**

| Nombre | Tipo | Contenido | Proxy CF | Uso |
|--------|------|-----------|----------|-----|
| `studios33.app` | A | `94.130.222.205` | Proxied (naranja) | Frontend |
| `www` | CNAME | `studios33.app` | Proxied | Opcional |
| `api` | A | `94.130.222.205` | Proxied | Backend Django |

**SSL/TLS en Cloudflare:** modo **Full** o **Full (strict)** (igual criterio que VoxTV cuando el origen responda en 443 o HTTP detrás de CF).

**Zona:** debe ser la zona **`studios33.app`** en el dashboard (no reutilizar `CF_ZONE_ID` de `voxtv.win`).

Pasos manuales en dashboard:

1. [Cloudflare](https://dash.cloudflare.com) → dominio **studios33.app** → DNS → Records.
2. Añadir los tres registros de la tabla.
3. SSL/TLS → Overview → **Full**.
4. Comprobar: `dig +short studios33.app` debe devolver IPs de Cloudflare (si proxied), no vacío.

Automatización (opcional): script `deploy/studios33/cloudflare_dns.mjs` con `CF_API_TOKEN` + `CF_ZONE_ID` de **studios33.app** (no el de voxtv).

### Servidor — pendiente antes de que DNS “funcione”

Aunque crees los registros en Cloudflare, la web no responderá hasta:

1. Desplegar stack en `/opt/studio33` (o equivalente).
2. Añadir `nginx/conf.d/studios33.app.conf` y `api.studios33.app.conf` (plantillas en `deploy/studios33/nginx/`).
3. `docker exec voxtv_nginx nginx -s reload`.

Orden recomendado: **servidor primero → DNS después → smoke test**.

---

## 4b. Tabla de dominios (referencia)

| Registro | Tipo | Destino | Uso |
|----------|------|---------|-----|
| `studios33.app` | A | `94.130.222.205` | Frontend Next.js |
| `www.studios33.app` | CNAME | `studios33.app` | Redirect opcional a apex |
| `api.studios33.app` | A | `94.130.222.205` | Django / Gunicorn |

**No usar** subdominios bajo `voxtv.win` para esta app (evita cookies, CORS y confusión operativa).

---

## 5. Layout en el servidor Hetzner

```text
/opt/
├── voxtvserver/          # EXISTENTE — no modificar salvo nginx/conf.d
│   ├── docker-compose.yml
│   ├── nginx/conf.d/
│   │   ├── voxtv.win.conf
│   │   ├── api.voxtv.win.conf
│   │   ├── studios33.app.conf          # NUEVO — solo proxy Studio33
│   │   └── api.studios33.app.conf      # NUEVO
│   └── ...
└── studio33/               # NUEVO — clone/rsync de Analisis Cabalistico
    ├── backend/
    ├── tonyblanco-app/
    ├── packages/symbolic/
    ├── docker-compose.yml
    ├── .env                 # secretos Studio33 únicamente
    └── scripts/deploy.sh
```

### 5.1 Servicios Docker propuestos (`/opt/studio33/docker-compose.yml`)

Red dedicada `studio33_net`. Contenedores sugeridos:

| Servicio | Imagen / build | Puerto interno | Nombre contenedor |
|----------|----------------|----------------|-------------------|
| `studio33_api` | `Dockerfile` raíz del repo (backend) | 8000 | `studio33_api` |
| `studio33_web` | Dockerfile Next multi-stage (crear) | 3000 | `studio33_web` |

**Postgres:** no levantar otro contenedor si se reutiliza `voxtv_postgres`:

- Conectar `studio33_api` a la red `voxtv_net` **solo** para alcanzar `postgres:5432`, o usar `extra_hosts` / IP interna documentada.
- Alternativa más aislada: contenedor `studio33_postgres` en `studio33_net` (más RAM, cero contacto con VoxTV).

Recomendación equilibrio **aislamiento / recursos:** misma instancia Postgres, **base de datos separada**, red Docker solo para DB (documentar en runbook; no exponer puerto 5432 al host).

### 5.2 Volúmenes obligatorios

| Volumen | Ruta | Motivo |
|---------|------|--------|
| Ephemeris | `backend/astrology/ephemeris` → `/app/astrology/ephemeris:ro` | Cartas astrológicas |
| Media | `studio33_media` | Subidas Django |
| Static | `studio33_static` | `collectstatic` |

### 5.3 Nginx (añadir a VOXTVSERVER, sin tocar vhosts VoxTV)

Archivo `nginx/conf.d/studios33.app.conf` (patrón igual que `api.voxtv.win.conf`):

- `server_name studios33.app www.studios33.app;`
- `proxy_pass http://studio33_web:3000;` (resolver DNS Docker `127.0.0.11` si upstream está en otra red — ver nota Threadfin en README VoxTV).

Archivo `nginx/conf.d/api.studios33.app.conf`:

- `server_name api.studios33.app;`
- `proxy_pass http://studio33_api:8000;`
- `client_max_body_size 20m;`
- `proxy_read_timeout 120s;` (IA / informes largos)

Tras añadir configs:

```bash
docker exec voxtv_nginx nginx -t
docker exec voxtv_nginx nginx -s reload
```

**Comprobación de no interferencia:**

```bash
curl -sI https://voxtv.win | head -5          # debe seguir igual
curl -sI https://studios33.app | head -5      # nueva app
curl -s https://api.studios33.app/api/        # JSON backend
```

---

## 6. Qué instalar (checklist)

### Ya en el servidor (vía VOXTVSERVER)

- [x] Docker + Compose
- [x] Nginx 80/443
- [x] PostgreSQL 16
- [x] Python 3 (host)
- [x] UFW, fail2ban, rsync

### A preparar para Studio33

- [x] Directorio `/opt/studio33`
- [x] Base de datos `studio33_db` + usuario `studio33_user`
- [x] `DATABASE_URL` en `backend/core/settings.py`
- [x] `deploy/studios33/Dockerfile.web` + `Dockerfile.api`
- [x] `docker-compose.studios33.yml` en repo
- [x] Vhosts Nginx `studios33.app` / `api.studios33.app`
- [x] DNS en Cloudflare para `studios33.app`
- [x] `.env` producción en `/opt/studio33/.env` (generado en primer deploy)
- [x] `deploy/studios33/scripts/deploy.sh`
- [x] Primer arranque: `migrate`, `collectstatic`
- [x] Login HTTPS email + Turnstile
- [x] Login HTTPS Google (Gmail → cuenta personal trial)
- [ ] Smoke test completo vía HTTPS (carta, Tarot, terapeuta, paciente)
- [x] HTTPS público (cert origen en `/opt/voxtvserver/nginx/certs/`, script `deploy/studios33/scripts/setup-origin-ssl.sh`)

### Opcional

- [ ] Ollama en host (IA local; no compartir con VoxTV salvo puerto 11434 documentado)
- [ ] CI que buildée imágenes y las suba al servidor (evita `npm ci` en producción)

---

## 7. Estimación de recursos adicionales

| Recurso | Incremento aproximado |
|---------|------------------------|
| RAM | +1–2 GB (Gunicorn 2–4 workers + Next.js) |
| Disco | +3–6 GB (ephemeris, node_modules, `.next`, DB, media) |
| CPU | Picos en build y cálculos astrología |

Si el servidor va justo por IPTV, limitar workers Gunicorn a **2** y no activar Ollama grande en el mismo host.

---

## 8. Plan de despliegue por fases

### Fase A — Aislamiento infra (sin código) ✅

1. [x] Crear `/opt/studio33` y DB Postgres dedicada.
2. [x] Añadir vhosts Nginx + DNS `studios33.app` / `api.studios33.app`.
3. [x] Verificar que VoxTV sigue healthy.

### Fase B — Backend ✅ (origen)

1. [x] Implementar `DATABASE_URL` en Django.
2. [x] Deploy contenedor `studio33_api` con ephemeris montado.
3. [x] `migrate` + admin vía migraciones `0013`/`0014` (`ADMIN_DEFAULT_PASSWORD` en `/opt/studio33/.env`).
4. [x] API en origen HTTP; HTTPS público tras ajustar SSL CF.

### Fase C — Frontend ✅ (origen)

1. [x] Dockerfile Next.js + `NEXT_PUBLIC_API_URL=https://api.studios33.app/api`.
2. [x] Deploy `studio33_web`.
3. [x] `https://studios33.app` responde **200**; login email + Google verificados (2026-06-05).

### Fase D — Corte de tráfico

1. Actualizar CORS/CSRF solo con dominios Studio33.
2. Desactivar o mantener Render/Vercel en paralelo hasta validación.
3. Backup DB Studio33 (`pg_dump studio33_db`) — script separado de `db_backup.sh` de VoxTV.

### Fase E — Deuda producto (post-go-live)

1. Sincronizar `clinicalTests.registry.ts`.
2. Unificar ruta Tarot.
3. Activar o ocultar módulos “Próximamente” (SCL-90 paciente, recursos, personal).

---

## 9. Runbook: deploy Studio33 (borrador)

```bash
# Desde Mac — NO usar scripts/deploy.sh de VoxTV
export HETZNER_IP=<ip>
export SSH_KEY=$HOME/.ssh/id_ed25519_hetzner

rsync -avz --delete \
  --exclude='node_modules/' --exclude='.next/' --exclude='.git/' \
  --exclude='.venv/' --exclude='backups/' \
  "/Volumes/T7/Development/Analisis Cabalistico/" \
  root@${HETZNER_IP}:/opt/studio33/

ssh -i "$SSH_KEY" root@${HETZNER_IP} <<'EOF'
  set -e
  cd /opt/studio33
  docker compose build studio33_api studio33_web
  docker compose up -d studio33_api studio33_web
  docker exec voxtv_nginx nginx -t && docker exec voxtv_nginx nginx -s reload
  curl -sf http://studio33_api:8000/api/ || true
EOF
```

---

## 10. Referencias internas del repo

| Documento | Contenido |
|-----------|-----------|
| `docs/01_PROJECT_STATE/DEPLOYMENT.md` | Render + Vercel (legacy cloud) |
| `docs/technical/SETUP-VERCEL-RENDER.md` | CORS Render/Vercel |
| `docs/01_PROJECT_STATE/RENDER-ENV-VARS.md` | Variables Render |
| `docs/00_SOURCE_OF_TRUTH/AUDITORIA_SWM_INCOMPLETOS.md` | Workspaces (parcialmente obsoleto para Tarot) |
| `AUDITORIA_TAROT_SWM.md` | Tarot SWM 2026-01-28 |
| `docs/ASTROLOGY_ENGINE_MASTERPLAN.md` | Motor astrología completo |
| `docs/EPHEMERIS_DATA_POLICY.md` | Swiss Ephemeris |
| `VOXTVSERVER/README.md` | Arquitectura VoxTV (externo) |

---

## 11. Registro de decisiones

| Fecha | Decisión |
|-------|----------|
| 2026-06-05 | Dominio producción propia: **`studios33.app`**, no `tonyblanco.es` |
| 2026-06-05 | Mismo Hetzner que VoxTV, **stack y rutas aisladas** (`/opt/studio33`, contenedores `studio33_*`) |
| 2026-06-05 | Nginx compartido solo como edge; **vhosts separados** por `server_name` |
| 2026-06-05 | Postgres: **DB separada**; no compartir `voxtv_db` |
| 2026-06-05 | Desplegado en Hetzner: `/opt/studio33`, contenedores `studio33_*`, Postgres `studio33_db` |
| 2026-06-05 | HTTPS: cert origen en nginx `:443` (Cloudflare Full); alternativa dashboard: SSL **Flexible** |
| 2026-06-05 | Turnstile widget propio Studios33; login/registro enforced en prod |
| 2026-06-05 | Google OAuth Web (`studio33-app`); Sign-In en `/login`; perfil `personal` + trial al primer Gmail |
| 2026-06-05 | Admin Django: CSP API separada; frontend sin CSP duplicada en nginx |

---

## 12. Artefactos de deploy

| Archivo | Estado |
|---------|--------|
| `deploy/studios33/nginx/studios33.app.conf` | ✅ En servidor |
| `deploy/studios33/nginx/api.studios33.app.conf` | ✅ En servidor |
| `deploy/studios33/cloudflare_dns.mjs` | ✅ Ejecutado |
| `docker-compose.studios33.yml` | ✅ |
| `deploy/studios33/env.example` | ✅ |
| `deploy/studios33/scripts/deploy.sh` | ✅ |
| `DATABASE_URL` en `settings.py` | ✅ |
| `deploy/studios33/Dockerfile.web` / `Dockerfile.api` | ✅ |
| `VOXTVSERVER/.env.studios33` | ✅ Local CF DNS (gitignored) |
| `deploy/studios33/.env.studios33` | ✅ Local Turnstile + Google (gitignored) |
| `backend/api/turnstile.py` | ✅ |
| `tonyblanco-app/components/TurnstileField.tsx` | ✅ |
| `tonyblanco-app/components/GoogleSignInButton.tsx` | ✅ |
| `deploy/studios33/scripts/patch-turnstile-env.sh` | ✅ |
| `deploy/studios33/scripts/patch-google-env.sh` | ✅ |
| `docs/01_PROJECT_STATE/SESSION_2026-06-05_STUDIOS33.md` | ✅ Log sesión |

---

**Mantenido por:** sesiones 2026-06-05. Actualizar al cambiar dominio, IP, auth o política de aislamiento.