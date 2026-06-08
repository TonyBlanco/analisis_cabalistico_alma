# Auditoría — `https://studios33.app/dashboard/admin`

**Fecha:** 2026-06-05  
**Alcance:** admin workspace Next.js `studios33.app/dashboard/admin`, su wiring con backend Django y qué partes **no** están conectadas a la base de datos real.

---

## 1. Resumen ejecutivo

El workspace `/dashboard/admin` está **parcialmente conectado**.

### Sí conectado a datos reales

- Verificación de acceso admin vía `/api/me/`
- Health check del panel vía `/api/admin/check/`
- Métricas base del overview vía `/api/admin/stats/`
- Tabla de usuarios vía `/api/admin/users/`
- Acciones de tabla de usuarios vía `PATCH /api/admin/users/<id>/` y `DELETE /api/admin/users/<id>/`

### No conectado a datos reales

- Auditoría
- Roles & Permisos
- Tokens / Sesiones
- Catálogo de Tests
- Servicios
- Reservas
- Cursos
- Lecciones
- Recursos
- Feature flags
- Versiones

### Parcial / engañoso

- El panel “System Overview” sí usa backend, pero mezcla datos reales con campos hardcodeados a `0` en stats.
- El drawer de usuario **no** usa el endpoint de detalle aunque backend sí lo expone.
- Históricamente existió un fallback hardcodeado a OnRender; desde 2026-06-05 el frontend debe apuntar al backend real `https://api.studios33.app/api` y no depender de ese host legacy.

---

## 2. Hallazgos principales

### H1 — La mayor parte de los paneles admin siguen siendo placeholders

En frontend, [AdminProDomainPanels.tsx](</Volumes/T7/Development/Analisis Cabalistico/tonyblanco-app/components/admin-pro/AdminProDomainPanels.tsx:48>) declara explícitamente textos como:

- `Módulo de auditoría pendiente de conexión`
- `Gestión avanzada de permisos pendiente de conexión`
- `Gestión de tokens y sesiones pendiente de conexión`
- `Catálogo admin pendiente de conexión`
- `Administración de servicios pendiente de conexión`
- `LMS admin pendiente de conexión`
- `Feature flags pendientes de conexión`

Conclusión: estos bloques **no están conectados a la base de datos real**. Son superficie visual contractual, no operativa.

### H2 — Usuarios sí está cableado a backend real

El workspace principal en [AdminProWorkspace.tsx](</Volumes/T7/Development/Analisis Cabalistico/tonyblanco-app/components/admin-pro/AdminProWorkspace.tsx:25>) llama:

- `adminCheck()`
- `getAdminStats()`
- `getAdminUsers()`
- `patchAdminUser()`
- `deleteAdminUser()`

Esas funciones salen de [admin-pro-api.ts](</Volumes/T7/Development/Analisis Cabalistico/tonyblanco-app/lib/admin-pro-api.ts:27>) y consumen endpoints reales:

- `/admin/check/`
- `/admin/stats/`
- `/admin/users/`
- `/admin/users/<id>/`

En backend, existen y están activos en:

- [urls.py](</Volumes/T7/Development/Analisis Cabalistico/backend/api/urls.py:297>)
- [admin_views.py](</Volumes/T7/Development/Analisis Cabalistico/backend/api/admin_views.py:20>)

Conclusión: la parte de usuarios y salud operativa **sí** consulta base de datos real.

### H3 — El drawer de usuario no usa el endpoint real de detalle

Backend expone `GET /api/admin/users/<id>/` en [AdminUserManagementView](</Volumes/T7/Development/Analisis Cabalistico/backend/api/admin_views.py:112>).

Pero el drawer frontend en [AdminProUserDrawer.tsx](</Volumes/T7/Development/Analisis Cabalistico/tonyblanco-app/components/admin-pro/AdminProUserDrawer.tsx:12>) dice:

`Este panel es read-only y no hace llamadas adicionales.`

Conclusión: el detalle de usuario mostrado en el drawer **no** viene de la base de datos en tiempo real; reutiliza el row ya cargado en la tabla.

### H4 — `admin/stats` mezcla real con placeholders

En [EnhancedAdminStatsView](</Volumes/T7/Development/Analisis Cabalistico/backend/api/admin_views.py:30>) hay datos reales:

- `total_users`
- `active_memberships`
- `total_tests`
- `total_test_results`
- `new_users_this_week`
- `therapists`
- `personal_users`
- `total_fichas`

Pero también hay campos no reales:

- `revenue_this_month = 0`
- `pending_payments = 0`

Conclusión: el overview está **parcialmente conectado**; no todo lo que muestra representa datos reales.

### H5 — Riesgo histórico de entorno: fallback hardcodeado de API

Hasta 2026-06-05, [api-base.ts](</Volumes/T7/Development/Analisis Cabalistico/tonyblanco-app/lib/api-base.ts:1>) tenía un fallback absoluto a un host legacy.  
Ese riesgo ya fue eliminado en código y sustituido por el backend público actual `https://api.studios33.app/api`, para que el admin no dependa de un backend hardcodeado distinto del despliegue actual.

Conclusión: revisar caches/builds viejos si en producción se siguiera observando comportamiento heredado.

### H6 — El acceso a `/dashboard/admin` depende de `/api/me/`, no de `/api/admin/check/`

La página [app/(dashboard)/dashboard/admin/page.tsx](</Volumes/T7/Development/Analisis Cabalistico/tonyblanco-app/app/(dashboard)/dashboard/admin/page.tsx:10>) hace:

1. `fetchSession()`
2. `canAccessAdminWorkspace()`

`canAccessAdminWorkspace()` en [canAccessAdminWorkspace.ts](</Volumes/T7/Development/Analisis Cabalistico/tonyblanco-app/lib/canAccessAdminWorkspace.ts:4>) depende de que `/api/me/` devuelva:

- `can_access_admin_workspace`
- o `is_admin`
- o `is_superuser`

Backend sí rellena esos campos en [CurrentUserView](</Volumes/T7/Development/Analisis Cabalistico/backend/api/views.py:184>), así que el problema no parece ser ausencia de contrato backend, sino:

- token inválido
- llamada al backend equivocado
- error de red/CORS
- o sesión almacenada contra otro entorno

---

## 3. Matriz de conexión real

| Superficie admin | Frontend | Backend real | Estado |
|---|---|---|---|
| Gate de acceso | `fetchSession()` + `canAccessAdminWorkspace()` | `/api/me/` | ✅ Real |
| Health panel | `adminCheck()` + `getAdminStats()` + `getAdminUsers()` | `/api/admin/check`, `/api/admin/stats`, `/api/admin/users` | ✅ Real |
| Cards overview | `AdminProSystemOverview` | `/api/admin/stats/` | 🟡 Parcial |
| Tabla usuarios | `AdminProUsersTable` | `/api/admin/users/` | ✅ Real |
| Cambiar rol | `patchAdminUser()` | `PATCH /api/admin/users/<id>/` | ✅ Real |
| Activar/desactivar usuario | `patchAdminUser()` | `PATCH /api/admin/users/<id>/` | ✅ Real |
| Eliminar usuario | `deleteAdminUser()` | `DELETE /api/admin/users/<id>/` | ✅ Real |
| Drawer detalle usuario | `AdminProUserDrawer` | `GET /api/admin/users/<id>/` existe pero no se usa | ❌ No conectado |
| Auditoría | `AdminProDomainPanels` placeholder | no endpoint admin específico usado | ❌ No conectado |
| Roles & permisos | placeholder | no endpoint admin específico usado | ❌ No conectado |
| Tokens / sesiones | placeholder | no endpoint admin específico usado | ❌ No conectado |
| Catálogo de tests | placeholder | hay APIs de tests, pero el admin no las consume | ❌ No conectado |
| Servicios | placeholder | existen `/api/services*` | ❌ No conectado |
| Reservas | placeholder | existen `/api/bookings*` | ❌ No conectado |
| Cursos | placeholder | existen modelos Django `courses`, sin wiring aquí | ❌ No conectado |
| Lecciones | placeholder | existen modelos Django `Lesson`, sin wiring aquí | ❌ No conectado |
| Recursos | placeholder | existen recursos LMS, sin wiring aquí | ❌ No conectado |
| Feature flags | placeholder | no endpoint específico | ❌ No conectado |
| Versiones | placeholder | no endpoint específico | ❌ No conectado |

---

## 4. Qué sí existe en backend pero el admin no consume

### Ya existe, pero no está cableado en `/dashboard/admin`

- Servicios:
  - `GET /api/services/`
  - `GET /api/services/categories/`
- Reservas:
  - `GET /api/bookings/`
- Stats de servicios:
  - `GET /api/stats/services/`
- Usuario detalle admin:
  - `GET /api/admin/users/<id>/`
- LMS:
  - modelos `Course`, `Lesson`, `Resource`, `CourseEnrollment` en `backend/courses/models.py`

Conclusión: varias pantallas placeholder podrían pasar a datos reales **sin inventar backend nuevo**, solo cableando APIs ya disponibles.

---

## 5. Inventario exacto de lo no conectado

Los siguientes bloques renderizan UI de contrato, pero **no leen base de datos real** desde el admin actual:

| Bloque visual | Componente | Estado real |
|---|---|---|
| Auditoría | `AdminProDomainPanels` | Placeholder, sin fetch |
| Roles & permisos | `AdminProDomainPanels` | Placeholder, sin fetch |
| Tokens / sesiones | `AdminProDomainPanels` | Placeholder, sin fetch |
| Catálogo de tests | `AdminProDomainPanels` | Placeholder, sin fetch |
| Servicios | `AdminProDomainPanels` | Placeholder, aunque existen endpoints backend |
| Reservas | `AdminProDomainPanels` | Placeholder, aunque existen endpoints backend |
| Cursos | `AdminProDomainPanels` | Placeholder, sin wiring al módulo `courses` |
| Lecciones | `AdminProDomainPanels` | Placeholder, sin wiring al módulo `courses` |
| Recursos | `AdminProDomainPanels` | Placeholder, sin wiring LMS real |
| Feature flags | `AdminProDomainPanels` | Placeholder, sin source of truth conectado |
| Versiones | `AdminProDomainPanels` | Placeholder, sin source of truth conectado |
| Drawer detalle usuario | `AdminProUserDrawer` | Read-only local, sin `GET` de detalle |

### Criterio usado en esta auditoría

Un bloque se considera “conectado a base de datos real” solo si cumple todo esto:

- hace `fetch` o llamada API real desde el frontend activo;
- pega a un endpoint backend existente;
- ese endpoint consulta modelos/DB reales;
- el dato mostrado no es mock, placeholder ni constante hardcodeada.

Bajo ese criterio, `admin/stats` queda en **parcial** y no en **real completo**, porque mezcla métricas de BD con campos fijos a `0`.

---

## 6. Diagnóstico probable de producción

Para `https://studios33.app/dashboard/admin`, el problema más probable no es “no existe backend admin”, sino uno de estos:

1. `NEXT_PUBLIC_API_URL` ausente, mal resuelta o build desactualizado respecto al backend actual `https://api.studios33.app/api`.
2. `authToken` en `localStorage` inválido o perteneciente a otro entorno.
3. `fetchSession()` falla por red/CORS/token y el acceso nunca se resuelve correctamente.
4. El usuario autenticado no trae flags admin esperadas desde `/api/me/`.

La observación “Verificando acceso…” encaja especialmente con 1 o 2.

---

## 7. Checklist rápida para confirmar en producción

Para validar el estado real en `studios33.app` sin depender de intuición:

1. Abrir DevTools en `/dashboard/admin`.
2. Verificar qué valor resuelve `NEXT_PUBLIC_API_URL` en runtime; si falta, el fallback esperado ya es `https://api.studios33.app/api`.
3. Confirmar que `/api/me/` responde desde `https://api.studios33.app/api/me/`.
4. Confirmar que las únicas llamadas admin actuales son:
   - `/api/admin/check/`
   - `/api/admin/stats/`
   - `/api/admin/users/`
   - `PATCH/DELETE /api/admin/users/<id>/`
5. Navegar cada card/panel del workspace y comprobar que Auditoría, Servicios, Reservas, LMS, Flags y Versiones no disparan requests nuevas.
6. Verificar que el drawer de usuario tampoco dispara `GET /api/admin/users/<id>/`.

Si esos puntos se cumplen, el diagnóstico de “workspace parcialmente cableado con mayoría de placeholders” queda confirmado.

---

## 8. Priorización de remediación

### P0

- Verificar en producción que `NEXT_PUBLIC_API_URL` no reintroduce un host legado y que apunta a `https://api.studios33.app/api`.
- Añadir telemetría/log visible cuando `fetchSession()` falla en `/dashboard/admin`
- Confirmar que `/api/me/` devuelve `can_access_admin_workspace=true` para admins reales

### P1

- Conectar `GET /api/admin/users/<id>/` al drawer de usuario
- Conectar panel de servicios a `/api/services/` y `/api/stats/services/`
- Conectar panel de reservas a `/api/bookings/`
- Reemplazar `revenue_this_month=0` y `pending_payments=0` por datos reales o quitarlos del overview

### P2

- Decidir si Courses/Lessons/Resources se administran en este workspace Next.js o se delegan al Django Admin
- Añadir panel real para auditoría usando `FederationAuditLog` o un admin audit log dedicado
- Añadir panel real de flags/versiones solo si hay source of truth estable

---

## 9. Recomendación de documentación viva

Usar este archivo como source of truth temporal del estado de `/dashboard/admin` y actualizarlo cada vez que un placeholder pase a wiring real.  
Siguiente actualización recomendada: cuando Servicios, Reservas o el Drawer de Usuario dejen de ser placeholder/read-only local.

---

## 10. Veredicto

`/dashboard/admin` **no está completamente conectado a la base de datos real**.

Está conectado de verdad en:

- acceso/sesión
- health checks
- stats base
- usuarios CRUD parcial

Y **no** está conectado en la mayoría de paneles de dominio, que hoy son placeholders visuales.

El riesgo operativo ahora ya no es un host hardcodeado en código, sino servir un build antiguo o una variable de entorno que reintroduzca una URL absoluta no deseada.
