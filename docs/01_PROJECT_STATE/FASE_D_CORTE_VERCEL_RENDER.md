# Fase D — Corte total Vercel + Render

**Estado:** CERRADO en repo (2026-06-08)  
**Producción única:** `https://studios33.app` + `https://api.studios33.app` (Hetzner)

---

## Cambios en el repositorio

| Acción | Detalle |
|--------|---------|
| CORS/CSRF Django | Sin `*.vercel.app` ni regex Vercel (`backend/core/settings.py`) |
| `vercel.json` | Archivado en `deploy/archive/vercel/` (no deploy activo) |
| `SETUP-VERCEL-RENDER.md` | Marcado como retirado |
| `DEPLOYMENT.md` | Apunta a Hetzner / `deploy/studios33/` |
| Backup DB | `deploy/studios33/scripts/backup-db.sh` |

---

## Cierre manual en dashboards (una vez)

### Render

1. [dashboard.render.com](https://dashboard.render.com) → servicio `analisis-cabalistico-alma` (o nombre actual).
2. **Suspend** o **Delete** Web Service + PostgreSQL asociada si ya no se usa.
3. Revocar deploy hooks / GitHub auto-deploy del repo si siguen activos.

### Vercel

1. [vercel.com/dashboard](https://vercel.com/dashboard) → proyecto frontend (`analisis-cabalistico-alma` / `tonyblanco-app`).
2. **Settings → Delete Project** (o desconectar Git integration).
3. Opcional: eliminar dominios `*.vercel.app` del proyecto.

Tras borrar, comprobar que no queden URLs públicas:

```bash
curl -sI https://analisis-cabalistico-alma.onrender.com/api/ | head -3
curl -sI https://analisis-cabalistico-alma.vercel.app/ | head -3
# Esperado: fallo DNS o 404/410 — no 200 operativo
```

---

## Producción actual

```bash
curl -sI https://studios33.app | head -3
curl -sI https://api.studios33.app/api/turnstile/config/ | head -3
bash deploy/studios33/scripts/backup-db.sh
bash deploy/studios33/scripts/deploy.sh
```