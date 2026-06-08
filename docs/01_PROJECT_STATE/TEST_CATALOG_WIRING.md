# Test Catalog Wiring — Fuente de verdad y capas

**Última actualización:** 2026-06-08  
**Migración relacionada:** `backend/api/migrations/0090_align_test_catalog_wiring.py`  
**Commit FE:** ver `clinicalTests.registry.ts`, `TestCatalogSection.tsx`, `PatientAssignedTestsSection.tsx`

Este documento evita confusiones entre **qué existe en BD**, **qué devuelve la API** y **qué está realmente implementado en el frontend**.

---

## Las tres capas

| Capa | Qué es | Fuente de verdad |
|------|--------|------------------|
| **1 — Catálogo API** | Módulos que `GET /api/tests/` expone al terapeuta/paciente | Django `TestModule` filtrado por `_safe_testmodule_queryset()` |
| **2 — Registry FE** | Rutas paciente, `implemented`, guías de ayuda | `tonyblanco-app/lib/clinicalTests.registry.ts` |
| **3 — UI** | Botones asignar / iniciar / redirecciones | `TestCatalogSection`, `PatientAssignedTestsSection`, páginas bajo `app/.../tests/` |

Un test puede aparecer en la capa 1 pero **no ser asignable** en la capa 3 si `implemented: false` en el registry.

---

## Definición: `appears_in_catalog`

En auditorías (`audit_tests_catalog.json`, `docs/audit_tests_catalog.md`):

> **`appears_in_catalog = true`** significa que el `TestModule` con ese `code` está incluido en la respuesta de **`GET /api/tests/`** para el contexto auditado (terapeuta con paciente activo), **no** que exista una columna `appears_in_catalog` en la BD.

Criterios del queryset seguro (`backend/api/test_models.py`):

```python
domain=HOLISTIC
is_assignable=True
is_internal=False
is_active=True
```

Excepciones documentadas en `test_views.py` (p. ej. bypass `mcmi4-mystic` para paciente con asignación SWM).

---

## Códigos canónicos vs legacy

| Código BD/API | Estado | Código canónico FE | Notas |
|---------------|--------|-------------------|-------|
| `stress-regulation` | **Activo, asignable** | `stress-regulation` | Módulo wellness de estrés |
| `stress` | **Inactivo, no asignable** | → alias a `stress-regulation` | Legacy; migración 0051 + 0090 |
| `scl90` | **Activo, no asignable** (post-0090) | `scl90` (`implemented: false`) | Motor backend (`compute_scl90_wellness`); cuestionario FE placeholder |
| `mcmi4_mystic` (BD) | SWM, bypass asignación | `mcmi4-mystic` (registry) | Alias `mcmi4_mystic` → `mcmi4-mystic` |
| `insomnia-index` | — | `insomnia` | Alias en registry |

Helpers en FE:

- `normalizeClinicalTestCode()` — minúsculas, `_` → `-`
- `DEPRECATED_TEST_CODE_ALIASES` — mapa legacy → canónico
- `getClinicalTestRegistryEntry()` — lookup con aliases
- `isClinicalTestFeImplemented()` — `false` si registry dice `implemented: false`

Rutas legacy:

- `/dashboard/patient/tests/stress` → redirect a `stress-regulation`
- `/dashboard/patient/tests/stress/result` → redirect a `stress-regulation/result`

---

## Reglas operativas

### Terapeuta asigna desde catálogo (`TestCatalogSection`)

1. El catálogo viene de `GET /api/tests/`.
2. Se enriquece con el registry (`implemented`, `patient_route`).
3. Si `isClinicalTestFeImplemented(code) === false` → badge **"En desarrollo (no asignable)"**; no se puede asignar aunque la API lo liste.

### Paciente inicia test asignado (`PatientAssignedTestsSection`)

1. Resuelve ruta con registry + aliases (p. ej. asignación antigua con código `stress`).
2. Si no hay ruta y el test no está implementado, el flujo debe fallar de forma controlada (no navegar a placeholder roto).

### Añadir un test nuevo

Checklist mínimo:

1. **BD:** `TestModule` con `domain=holistic`, flags correctos (`is_active`, `is_assignable`, `available_for_*`).
2. **Registry:** entrada con `implemented: true` y `patient_route` real.
3. **Página FE:** ruta bajo `dashboard/patient/tests/<slug>`.
4. **Migración o seed** si los flags por defecto no bastan.
5. Re-ejecutar auditoría o actualizar `docs/audit_tests_catalog.md`.

---

## Casos conocidos (post-0090)

| Código | API catálogo terapeuta | FE implementado | Acción usuario |
|--------|------------------------|-----------------|----------------|
| `stress-regulation` | Sí | Sí | Asignar e iniciar normal |
| `stress` | No | Alias → stress-regulation | Solo asignaciones legacy |
| `scl90` | No (no assignable) | No | No asignar hasta cuestionario FE |
| `bdi-ii` | Sí | Sí | OK |
| `phq-9`, `gad-7`, `bai` | Depende flags BD | Sí en registry | Pueden no aparecer en catálogo si `is_assignable=false` en BD |
| `asrs_essence` | No (inactive en snapshot audit) | Sí en registry | Activar en BD si se quiere catálogo |

---

## Auditoría y snapshots

- Script/snapshot: `audit_tests_catalog.json` (raíz o generado en auditoría).
- Metodología: `docs/audit_tests_catalog.md`.
- **Importante:** tablas de auditoría anteriores a 0090 pueden mostrar `scl90` y `stress` como `appears_in_catalog=true`; tras desplegar migración 0090, `scl90` debe pasar a `false` y `stress` ya era `false`.

### Despliegue

Tras merge, en servidor:

```bash
python manage.py migrate api 0090
```

El deploy de Studios33 (`deploy/studios33/scripts/deploy.sh`) debe ejecutar migraciones; verificar en smoke que `scl90` no aparece como asignable.

---

## Relación con otras docs

| Documento | Rol |
|-----------|-----|
| `docs/audit_tests_catalog.md` | Tabla comparativa BD vs endpoint (snapshot) |
| `docs/technical/TESTS_SYSTEM.md` | Arquitectura general de tests |
| `docs/00_SOURCE_OF_TRUTH/AUDITORIA_SWM_INCOMPLETOS.md` | SWM incompletos (puede estar desactualizado en Tarot) |
| `docs/01_PROJECT_STATE/TROUBLESHOOTING_TESTS.md` | Errores runtime (fetch, Flask legacy) |

**Autoridad:** este archivo es guía operativa (nivel explicativo). No contradice `SOURCE_OF_TRUTH.md` ni contratos SWM.