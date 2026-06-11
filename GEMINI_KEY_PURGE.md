# Purga de GEMINI_API_KEY del historial de git

**Fecha:** 2026-06-11  
**Clave comprometida:** `AIzaSyBGP6…` (REVOCADA — el valor completo no se almacena en el repo)  
**Estado working tree:** ✅ Limpio — clave reemplazada en backend/.env.gemini y docs/technical/README_AI.md

---

## Paso 1 — YA HECHO: Rotar la clave en Google AI Studio

> ⚠️ **ACCIÓN MANUAL REQUERIDA:** Ir a https://aistudio.google.com/apikey, revocar la clave antigua y crear una nueva.
> La nueva clave va SOLO en `/opt/studio33/.env` en el servidor Hetzner. NUNCA al repo.

---

## Paso 2 — Purgar del historial de git

La clave aparece en al menos el commit `e182c040` (y posiblemente anteriores).

> ℹ️ **El valor literal de la clave NO se versiona.** Obtén el valor del registro local de rotación y crea `replacements.txt` / `bad-strings.txt` **de forma local**; asegúrate de que estén en `.gitignore` y de que nunca se commiteen. Sustituye `<CLAVE-COMPROMETIDA>` por el valor real solo en esos archivos locales.

### Opción A: git filter-repo (recomendado)

```bash
# Instalar si no está disponible
pip install git-filter-repo

# Crear archivo de reemplazos (LOCAL, gitignored)
echo '<CLAVE-COMPROMETIDA>==>REMOVED_ROTATED_KEY' > /tmp/replacements.txt

# Ejecutar purga (reescribe toda la historia)
cd "/Volumes/T7/Development/Analisis Cabalistico"
git filter-repo --replace-text /tmp/replacements.txt --force

# Verificar que no queda rastro
git log -p --all | grep '<CLAVE-COMPROMETIDA>' | wc -l
# Debe dar 0

# Force push a todas las ramas y tags
git push --force-with-lease origin --all
git push --force-with-lease origin --tags
```

### Opción B: BFG Repo Cleaner

```bash
# Crear archivo de reemplazos (LOCAL, gitignored)
echo '<CLAVE-COMPROMETIDA>' > /tmp/bad-strings.txt

# Ejecutar
java -jar bfg.jar --replace-text /tmp/bad-strings.txt .git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force-with-lease origin --all
```

---

## ⚠️ AVISO a colaboradores tras el force-push

Todos los que tienen el repo clonado deben:
```bash
git fetch origin
git reset --hard origin/main  # u origin/<su-rama>
# O re-clonar desde cero
```

---

## Archivos donde aparecía la clave (ya limpiados en working tree)

| Archivo | Estado |
|---------|--------|
| `backend/.env.gemini` | ✅ Vaciado — GEMINI_API_KEY= |
| `docs/technical/README_AI.md` | ✅ Reemplazado por placeholder |

## Variables de entorno correctas en producción

La nueva clave va en `/opt/studio33/.env` en el servidor Hetzner:
```
GEMINI_API_KEY=<nueva-clave-rotada>
GEMINI_MODEL=gemini-1.5-flash
```

El código lee: `GEMINI_API_KEY = config('GEMINI_API_KEY', default='')` en `backend/core/settings.py:250` — correcto.
