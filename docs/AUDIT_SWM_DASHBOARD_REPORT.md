**Resumen**
- **Alcance**: Auditoría de módulos SWM del backend y rutas frontend `/dashboard/*` del proyecto "Holística Aplicada".
- **Resultado**: Listado de SWM, mapeo a páginas de dashboard, dependencias principales y conflictos detectados.

**Backend SWM (encontrados)**
- **mcmi4**: [backend/swm/mcmi4/urls.py](backend/swm/mcmi4/urls.py)
- **mcmi4_reflection**: [backend/swm/mcmi4_reflection/views.py](backend/swm/mcmi4_reflection/views.py)
- **cabala**: [backend/swm/cabala/__init__.py](backend/swm/cabala/__init__.py)
- **tarot**: [backend/swm/tarot/urls.py](backend/swm/tarot/urls.py)
- **transgenerational**: [backend/swm/transgenerational/urls.py](backend/swm/transgenerational/urls.py)
- **sha**: [backend/swm/sha/urls.py](backend/swm/sha/urls.py)

**Front-end: rutas `/dashboard` relevantes**
- Dashboard raíz: [tonyblanco-app/app/(dashboard)/dashboard/page.tsx](tonyblanco-app/app/(dashboard)/dashboard/page.tsx)
- Secciones principales: [tonyblanco-app/app/(dashboard)/dashboard/therapist](tonyblanco-app/app/(dashboard)/dashboard/therapist)
- Módulos SWM en frontend (ejemplos):
  - `cabala-aplicada`: [tonyblanco-app/app/(dashboard)/dashboard/therapist/(swm)/cabala-aplicada/page.tsx](tonyblanco-app/app/(dashboard)/dashboard/therapist/(swm)/cabala-aplicada/page.tsx)
  - `mcmi4-mystic`: [tonyblanco-app/app/(dashboard)/dashboard/therapist/(swm)/mcmi4-mystic/page.tsx](tonyblanco-app/app/(dashboard)/dashboard/therapist/(swm)/mcmi4-mystic/page.tsx)
  - `mcmi4-reflection` (workspace UI): [tonyblanco-app/app/(dashboard)/dashboard/therapist/(swm)/swm/mcmi4/page.tsx](tonyblanco-app/app/(dashboard)/dashboard/therapist/(swm)/swm/mcmi4/page.tsx)
  - `sha`: [tonyblanco-app/app/(dashboard)/dashboard/therapist/(swm)/sha/page.tsx](tonyblanco-app/app/(dashboard)/dashboard/therapist/(swm)/sha/page.tsx)

**Dependencias clave (manifiestos leídos)**
- Frontend: [tonyblanco-app/package.json](tonyblanco-app/package.json) — `next@16`, `react@19`, `@holistica/symbolic` (local), clientes de IA JS (`@google/generative-ai` y adaptadores GROQ según implementación).
- Backend: [backend/requirements.txt](backend/requirements.txt) — Django 5.2.9, multitud de paquetes AI (azure, google-genai), `groq==1.0.0` (cliente GROQ) y otros proveedores; `Flask==3.0.0` (para numerología local). Archivo extra: [requirements-flask.txt](requirements-flask.txt).

**Conflictos y anomalías detectadas**
- **Inconsistencia de ownership en `mcmi4_reflection`**: El módulo usa `consultant_user` como campo de ownership/ejecutor en lugar de seguir el patrón estándar `subject_user` + `executor_user`. Referencias: [backend/swm/mcmi4_reflection/views.py](backend/swm/mcmi4_reflection/views.py) y documentación de diseño: [docs/legacy/2026-01-20_root-shadow/DEBUG_MCMI4_MYSTIC_FLOW.md](docs/legacy/2026-01-20_root-shadow/DEBUG_MCMI4_MYSTIC_FLOW.md).
  - Riesgo: confusión de permisos, filtros y endpoints que asumen `subject_user`/`executor_user`. Recomendación: renombrar `consultant_user` → `executor_user`, añadir `subject_user` donde corresponda y migrar datos.

- **Mapeo frontend↔backend incompleto/heterogéneo**: La mayoría de SWM backend tienen páginas frontend equivalentes (cabala, mcmi4, sha, transgenerational, tarot). Hay algunos nombres y rutas frontend que usan convenciones de ruta/slug distintas (`astrologia-tarot`, `holistica-aplicada`) — revisar mapeo y documentación de rutas (archivo central: [backend/api/urls.py](backend/api/urls.py#L1-L480)).

- **Dependencias sobre motor de IA**: El proyecto usa la API de GROQ (no OpenAI) como proveedor principal para inferencia. Hay que asegurar que ambos lados (frontend y backend) usen clientes/adaptadores compatibles con GROQ y eliminar referencias activas a `openai` si ya no se usan.
  - Riesgo: mezclas de clientes/proveedores pueden provocar inconsistencias en llamadas, formatos de respuesta y manejo de credenciales.
  - Recomendación: unificar provider-adapter (GROQ) en ambos manifiestos, actualizar variables de entorno (p. ej. `GROQ_API_KEY`), y documentar en `docs/` el proveedor y el adapter utilizado.

**Acciones recomendadas (priorizadas)**
- **Alta**: Corregir el ownership pattern en `mcmi4_reflection` (modelo, serializers, vistas y tests). Ver: [backend/swm/mcmi4_reflection/views.py](backend/swm/mcmi4_reflection/views.py).
- **Alta**: Añadir pruebas E2E que validen rutas `/dashboard/therapist/(swm)/*` y endpoints API `swm/<module>/` para asegurar que el mapeo frontend↔backend funciona.
- **Media**: Consolidar un documento de mapeo ruta→SWM (archivo canónico en `docs/`), y actualizar `tonyblanco-app` navigation para usar slugs canonizados.
- **Baja**: Revisar dependencias y versiones críticas (OpenAI, Azure/GenAI libs) antes de despliegue en producción.

**Referencias rápidas**
- Montaje de SWM en API: [backend/api/urls.py](backend/api/urls.py#L320-L420)
- Lista de SWM en código: [backend/swm/__init__.py](backend/swm/__init__.py)
- Manifiesto frontend: [tonyblanco-app/package.json](tonyblanco-app/package.json)
- Documento con debug MCMI4 Reflection: [docs/legacy/2026-01-20_root-shadow/DEBUG_MCMI4_MYSTIC_FLOW.md](docs/legacy/2026-01-20_root-shadow/DEBUG_MCMI4_MYSTIC_FLOW.md)

Si quieres, genero un PR con los cambios mínimos sugeridos (p.ej. rename `consultant_user` → `executor_user` + migrations y tests), o bien puedo ampliar este informe en `docs/AUDIT_SWM_DASHBOARD_REPORT.md` con un checklist de archivos a modificar. ¿Qué prefieres que haga ahora?
