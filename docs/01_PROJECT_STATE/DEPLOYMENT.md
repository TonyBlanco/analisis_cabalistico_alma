# Deployment — Studios33 (Hetzner)

**Producción:** `studios33.app` + `api.studios33.app`  
**Servidor:** Hetzner `94.130.222.205` · `/opt/studio33`

Vercel y Render están **retirados** (Fase D, 2026-06-08). Ver [FASE_D_CORTE_VERCEL_RENDER.md](./FASE_D_CORTE_VERCEL_RENDER.md).

---

## Deploy

```bash
SSH_KEY=$HOME/.ssh/id_ed25519_hetzner bash deploy/studios33/scripts/deploy.sh
```

Incluye build API + web, migraciones, tests clave, nginx reload, TLS origen Studios33 y **TLS origen VoxTV** (evita regresión en `voxtv_nginx` compartido).

## Backup base de datos

```bash
bash deploy/studios33/scripts/backup-db.sh
```

## Parches de entorno (secretos locales, no commitear)

```bash
bash deploy/studios33/scripts/patch-turnstile-env.sh
bash deploy/studios33/scripts/patch-google-env.sh
bash deploy/studios33/scripts/patch-proton-smtp-env.sh
```

## Documentación relacionada

| Doc | Contenido |
|-----|-----------|
| [STUDIOS33_HETZNER_DEPLOYMENT.md](./STUDIOS33_HETZNER_DEPLOYMENT.md) | Arquitectura, fases, aislamiento VoxTV |
| [SESSION_2026-06-05_STUDIOS33.md](./SESSION_2026-06-05_STUDIOS33.md) | Sesión auth, Turnstile, Google, PlanAI |
| [RENDER-ENV-VARS.md](./RENDER-ENV-VARS.md) | Legacy Render (solo referencia histórica) |

## Desarrollo local

- Backend: `cd backend && python manage.py runserver` (puerto 8000)
- Frontend: `cd tonyblanco-app && npm run dev` (puerto 3000)
- API local: `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api` o `NEXT_PUBLIC_LOCAL_API_URL`