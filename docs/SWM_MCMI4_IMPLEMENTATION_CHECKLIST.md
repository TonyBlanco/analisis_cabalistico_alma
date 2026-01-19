# SWM MCMI-4 MÍSTICO — IMPLEMENTATION CHECKLIST

**Versión:** 1.0  
**Fecha:** 2026-01-17  
**Estado:** Arquitectura Definitiva  
**Categoría:** Specialized Workspace Module (SWM)

---

## INSTRUCCIONES DE USO

Este checklist es la **fuente de verdad** para implementar el SWM MCMI-4 Místico.

**Reglas**:
1. Ejecutar los pasos **en orden estricto**
2. NO avanzar a la siguiente sección sin completar la anterior
3. Cada checkbox debe verificarse manualmente (código + tests)
4. NO saltarse pasos "opcionales" si aplican al contexto
5. Auditar cada paso completado en commit dedicado

---

## FASE 1: PREPARACIÓN Y SETUP

### 1.1 Verificación de Pre-requisitos

- [ ] **Backend**: Python 3.10+, Flask/FastAPI, SQLAlchemy configurado
- [ ] **Frontend**: Node.js 18+, Next.js 16+, TypeScript configurado
- [ ] **Base de Datos**: PostgreSQL 14+ (o SQLite para desarrollo)
- [ ] **Control de Versiones**: Git repository limpio, branch `feature/swm-mcmi4` creado
- [ ] **Documentación**: Leer TODOS los documentos de arquitectura:
  - [ ] `SWM_MCMI4_OVERVIEW.md`
  - [ ] `SWM_MCMI4_DOMAIN_MODEL.md`
  - [ ] `SWM_MCMI4_API_SPEC.md`
  - [ ] `SWM_MCMI4_PERMISSIONS.md`
  - [ ] `SWM_MCMI4_FRONTEND_CONTRACT.md`

---

### 1.2 Estructura de Directorios

- [ ] **Backend**: Crear `backend/swm/mcmi4/` con subdirectorios:
  - [ ] `models/` (Entidades SQLAlchemy)
  - [ ] `routes/` (Endpoints Flask/FastAPI)
  - [ ] `services/` (Lógica de negocio)
  - [ ] `guards/` (Validadores de permisos)
  - [ ] `schemas/` (Pydantic/Marshmallow)
  - [ ] `tests/` (Unit tests)

- [ ] **Frontend**: Crear `src/app/(dashboard)/dashboard/swm/mcmi4/` con subdirectorios:
  - [ ] `create/`
  - [ ] `list/`
  - [ ] `[workspace_id]/overview/`
  - [ ] `[workspace_id]/session/discovery/`
  - [ ] `[workspace_id]/session/mapping/`
  - [ ] `[workspace_id]/session/interpretation/`
  - [ ] `[workspace_id]/session/synthesis/`
  - [ ] `[workspace_id]/results/`
  - [ ] `[workspace_id]/audit/`

- [ ] **Frontend**: Crear `src/components/swm/mcmi4/` con componentes base

- [ ] **Frontend**: Crear `src/lib/api/swm/` con cliente API

---

## FASE 2: BASE DE DATOS Y MODELOS

### 2.1 Migración de Base de Datos

- [ ] **Crear tablas** (ejecutar en orden):
  1. [ ] `workspace_definitions` (tabla base)
  2. [ ] `workspace_instances` (instancias de workspace)
  3. [ ] `workspace_sessions` (sesiones activas/históricas)
  4. [ ] `workspace_artifacts` (resultados generados)
  5. [ ] `workspace_permissions` (control de acceso)
  6. [ ] `workspace_audit_logs` (auditoría)

- [ ] **Verificar constraints**:
  - [ ] Foreign Keys correctas
  - [ ] Check constraints (estados válidos, fechas)
  - [ ] Unique constraints (1 sesión activa por workspace)
  - [ ] Índices (ver `SWM_MCMI4_DOMAIN_MODEL.md` sección 7)

- [ ] **Seed inicial**:
  - [ ] Insertar registro en `workspace_definitions` con `code = 'MCMI4_MYSTIC'`

- [ ] **Rollback plan**:
  - [ ] Crear migración DOWN (revertir tablas)
  - [ ] Probar rollback en entorno de desarrollo

---

### 2.2 Modelos ORM (Backend)

- [ ] **Crear modelos** en `backend/swm/mcmi4/models/`:
  - [ ] `WorkspaceDefinition` (SQLAlchemy model)
  - [ ] `WorkspaceInstance` (con FSM de estados)
  - [ ] `WorkspaceSession`
  - [ ] `WorkspaceArtifact`
  - [ ] `WorkspacePermission`
  - [ ] `WorkspaceAuditLog`

- [ ] **Relaciones ORM**:
  - [ ] `WorkspaceInstance.definition` (ManyToOne → `WorkspaceDefinition`)
  - [ ] `WorkspaceInstance.sessions` (OneToMany → `WorkspaceSession`)
  - [ ] `WorkspaceInstance.artifacts` (OneToMany → `WorkspaceArtifact`)
  - [ ] `WorkspaceInstance.permissions` (OneToMany → `WorkspacePermission`)
  - [ ] `WorkspaceInstance.audit_logs` (OneToMany → `WorkspaceAuditLog`)

- [ ] **Métodos de modelo**:
  - [ ] `WorkspaceInstance.can_transition_to(new_status)` (validar FSM)
  - [ ] `WorkspaceInstance.get_active_session()` (sesión activa o None)
  - [ ] `WorkspaceInstance.has_permission(user_id, permission_type)` (check permisos)

- [ ] **Tests de modelos**:
  - [ ] Test creación de instancias
  - [ ] Test validación de constraints
  - [ ] Test transiciones de estado
  - [ ] Test relaciones ORM

---

## FASE 3: BACKEND - SERVICIOS Y LÓGICA

### 3.1 Servicio de Workspace

- [ ] **Crear** `backend/swm/mcmi4/services/workspace_service.py`:
  - [ ] `create_workspace(subject_user_id, creator_user_id, mcmi4_data_id, config)`
  - [ ] `get_workspace_status(workspace_id, user_id)` (con permisos)
  - [ ] `list_workspaces(user_id, filters)` (solo accesibles)
  - [ ] `archive_workspace(workspace_id, user_id)` (admin only)

- [ ] **Validaciones**:
  - [ ] Verificar relación clínica terapeuta-paciente
  - [ ] Verificar datos MCMI-4 existen y pertenecen al sujeto
  - [ ] Verificar unicidad (no duplicar workspace en progreso)

- [ ] **Tests unitarios**:
  - [ ] Test creación exitosa
  - [ ] Test fallo por falta de permisos clínicos
  - [ ] Test fallo por datos MCMI-4 inválidos

---

### 3.2 Servicio de Sesión

- [ ] **Crear** `backend/swm/mcmi4/services/session_service.py`:
  - [ ] `start_session(workspace_id, executor_user_id)` (crear sesión)
  - [ ] `update_session_progress(session_id, user_id, payload)` (actualizar estado)
  - [ ] `close_session(session_id, user_id, pause_reason)` (cerrar sin sellar)
  - [ ] `seal_workspace(workspace_id, session_id, user_id, final_synthesis)` (completar)

- [ ] **Validaciones**:
  - [ ] Solo 1 sesión activa por workspace
  - [ ] Solo executor de sesión puede modificarla
  - [ ] Validar completitud al sellar (artefactos mínimos)

- [ ] **Transaccionalidad**:
  - [ ] `start_session`: Atomic (sesión + estado workspace + log)
  - [ ] `seal_workspace`: Atomic (cerrar sesión + sellar artefactos + estado + log)

- [ ] **Tests unitarios**:
  - [ ] Test inicio sesión exitoso
  - [ ] Test fallo por sesión ya activa
  - [ ] Test sellado exitoso con artefactos válidos
  - [ ] Test fallo sellado por artefactos incompletos

---

### 3.3 Servicio de Permisos

- [ ] **Crear** `backend/swm/mcmi4/services/permission_service.py`:
  - [ ] `grant_permission(workspace_id, user_id, permission_type, granted_by)`
  - [ ] `revoke_permission(workspace_id, user_id, permission_type, revoked_by)`
  - [ ] `check_permission(workspace_id, user_id, required_permission)` (usado en guards)
  - [ ] `list_permissions(workspace_id, requesting_user_id)`

- [ ] **Validaciones**:
  - [ ] Solo owner/admin puede otorgar/revocar
  - [ ] No revocar owner (creator_user_id)
  - [ ] No otorgar permiso ya existente

- [ ] **Tests unitarios**:
  - [ ] Test otorgar permiso exitoso
  - [ ] Test fallo por usuario sin permiso de otorgar
  - [ ] Test fallo al intentar revocar owner

---

### 3.4 Servicio de Auditoría

- [ ] **Crear** `backend/swm/mcmi4/services/audit_service.py`:
  - [ ] `log_action(workspace_id, user_id, action, details, ip_address)` (crear log)
  - [ ] `get_audit_log(workspace_id, filters, requesting_user_id)` (con permisos)

- [ ] **Integración automática**:
  - [ ] Decorador `@audit_action` para aplicar a servicios
  - [ ] Capturar IP, timestamp, user_id automáticamente

- [ ] **Tests unitarios**:
  - [ ] Test creación de log
  - [ ] Test query de logs con filtros
  - [ ] Test acceso denegado para usuario sin permisos

---

## FASE 4: BACKEND - ENDPOINTS (API)

### 4.1 Endpoints de Workspace

- [ ] **Implementar** `backend/swm/mcmi4/routes/workspace.py`:
  - [ ] `POST /api/swm/mcmi4/create` (crear workspace)
  - [ ] `GET /api/swm/mcmi4/status` (estado workspace)
  - [ ] `GET /api/swm/mcmi4/list` (listar workspaces)
  - [ ] `GET /api/swm/mcmi4/results` (resultados post-seal)
  - [ ] `GET /api/swm/mcmi4/audit-log` (historial)

- [ ] **Aplicar guards**:
  - [ ] `@require_authentication` (todas las rutas)
  - [ ] `@require_workspace_permission('observer')` (GET /status, /results)
  - [ ] `@require_clinical_relationship` (POST /create)
  - [ ] `@require_workspace_permission('admin')` (GET /audit-log)

- [ ] **Validación de input** (Pydantic/Marshmallow schemas)

- [ ] **Tests de integración**:
  - [ ] Test POST /create exitoso (201)
  - [ ] Test POST /create sin permisos (403)
  - [ ] Test GET /status exitoso (200)
  - [ ] Test GET /status workspace no existe (404)

---

### 4.2 Endpoints de Sesión

- [ ] **Implementar** `backend/swm/mcmi4/routes/session.py`:
  - [ ] `POST /api/swm/mcmi4/start` (iniciar sesión)
  - [ ] `POST /api/swm/mcmi4/progress` (actualizar progreso)
  - [ ] `POST /api/swm/mcmi4/close-session` (cerrar sin sellar)
  - [ ] `POST /api/swm/mcmi4/seal` (sellar workspace)

- [ ] **Aplicar guards**:
  - [ ] `@require_workspace_permission('executor')` (POST /start, /progress)
  - [ ] `@require_session_ownership` (POST /progress, /seal) (solo executor de sesión)

- [ ] **Tests de integración**:
  - [ ] Test POST /start exitoso (200)
  - [ ] Test POST /start con sesión activa (409)
  - [ ] Test POST /seal exitoso (200)
  - [ ] Test POST /seal sin artefactos mínimos (400)

---

### 4.3 Endpoints de Permisos

- [ ] **Implementar** `backend/swm/mcmi4/routes/permissions.py`:
  - [ ] `POST /api/swm/mcmi4/permissions/grant` (otorgar permiso)
  - [ ] `POST /api/swm/mcmi4/permissions/revoke` (revocar permiso)

- [ ] **Aplicar guards**:
  - [ ] `@require_workspace_permission('admin')` (ambos endpoints)

- [ ] **Tests de integración**:
  - [ ] Test POST /grant exitoso (200)
  - [ ] Test POST /grant sin permiso admin (403)
  - [ ] Test POST /revoke exitoso (200)
  - [ ] Test POST /revoke owner (400)

---

### 4.4 Endpoint de Revisión

- [ ] **Implementar** `backend/swm/mcmi4/routes/review.py`:
  - [ ] `POST /api/swm/mcmi4/review` (marcar revisado)

- [ ] **Aplicar guards**:
  - [ ] `@require_workspace_permission('reviewer')` o `admin`

- [ ] **Tests de integración**:
  - [ ] Test POST /review exitoso (200)
  - [ ] Test POST /review workspace no sellado (400)

---

## FASE 5: FRONTEND - COMPONENTES BASE

### 5.1 API Client

- [ ] **Crear** `src/lib/api/swm/mcmi4.ts`:
  - [ ] Funciones para todos los endpoints (create, start, progress, seal, etc.)
  - [ ] Manejo de errores estandarizado
  - [ ] TypeScript types para requests/responses

- [ ] **Configuración**:
  - [ ] Base URL configurable (env var)
  - [ ] Headers automáticos (Authorization, Content-Type)
  - [ ] Retry logic para GET requests

---

### 5.2 Hooks Personalizados

- [ ] **Crear** `src/hooks/useSessionContext.ts`:
  - [ ] Context provider para estado de sesión
  - [ ] Auto-sync cada 30 segundos
  - [ ] Manejo de reconexión

- [ ] **Crear** `src/hooks/usePhaseNavigation.ts`:
  - [ ] Validar navegación entre fases
  - [ ] Bloquear avance sin completar fase previa

- [ ] **Crear** `src/hooks/useUnsavedChanges.ts`:
  - [ ] Advertir navegación con cambios no guardados
  - [ ] Integrar con Next.js router events

- [ ] **Crear** `src/hooks/useSessionReconnect.ts`:
  - [ ] Detectar online/offline
  - [ ] Revalidar sesión post-reconexión

---

### 5.3 Componentes UI

- [ ] **Crear** `src/components/swm/mcmi4/WorkspaceStatusCard.tsx`:
  - [ ] Mostrar estado, fechas, permisos
  - [ ] Botones condicionales según estado

- [ ] **Crear** `src/components/swm/mcmi4/PhaseIndicator.tsx`:
  - [ ] Indicador visual de fases (discovery → mapping → interpretation → synthesis)
  - [ ] Resaltar fase actual

- [ ] **Crear** `src/components/swm/mcmi4/ProgressBar.tsx`:
  - [ ] Barra de progreso global
  - [ ] Tooltip con detalles

- [ ] **Crear** `src/components/swm/mcmi4/SessionControls.tsx`:
  - [ ] Botones de control de sesión (Pausar, Sellar, Continuar)
  - [ ] Confirmaciones modales

- [ ] **Crear** `src/components/swm/mcmi4/ArtifactViewer.tsx`:
  - [ ] Visor de artefactos (mapas, narrativas, hipótesis)
  - [ ] Modo read-only post-seal

- [ ] **Crear** `src/components/swm/mcmi4/PermissionsManager.tsx`:
  - [ ] UI para otorgar/revocar permisos
  - [ ] Solo visible para admin/owner

---

## FASE 6: FRONTEND - PÁGINAS

### 6.1 Páginas de Workspace

- [ ] **Implementar** `src/app/(dashboard)/dashboard/swm/mcmi4/create/page.tsx`:
  - [ ] Formulario de creación
  - [ ] Selector de paciente/sujeto
  - [ ] Selector de datos MCMI-4
  - [ ] Submit → redirect a overview

- [ ] **Implementar** `src/app/(dashboard)/dashboard/swm/mcmi4/list/page.tsx`:
  - [ ] Lista de workspaces accesibles
  - [ ] Filtros (status, sujeto, creador)
  - [ ] Paginación
  - [ ] Click → redirect a overview

- [ ] **Implementar** `src/app/(dashboard)/dashboard/swm/mcmi4/[workspace_id]/overview/page.tsx`:
  - [ ] Mostrar `WorkspaceStatusCard`
  - [ ] Botón "Iniciar Sesión" (si created + executor)
  - [ ] Botón "Continuar Sesión" (si in_progress sin sesión activa)
  - [ ] Link "Ver Resultados" (si sealed)

---

### 6.2 Páginas de Sesión

- [ ] **Implementar** `src/app/(dashboard)/dashboard/swm/mcmi4/[workspace_id]/session/layout.tsx`:
  - [ ] `SessionProvider` (context)
  - [ ] Guards de acceso (solo executor de sesión activa)
  - [ ] Header con `PhaseIndicator` y `ProgressBar`

- [ ] **Implementar** fases individuales:
  - [ ] `session/discovery/page.tsx` (Fase 1)
  - [ ] `session/mapping/page.tsx` (Fase 2)
  - [ ] `session/interpretation/page.tsx` (Fase 3)
  - [ ] `session/synthesis/page.tsx` (Fase 4 + sellado)

- [ ] **Funcionalidad de cada fase**:
  - [ ] Renderizar contenido específico de fase
  - [ ] Guardar progreso local
  - [ ] Auto-sync a backend cada 30s
  - [ ] Botón "Siguiente Fase" (validar completitud)

---

### 6.3 Páginas de Resultados y Auditoría

- [ ] **Implementar** `src/app/(dashboard)/dashboard/swm/mcmi4/[workspace_id]/results/page.tsx`:
  - [ ] Mostrar artefactos sellados (read-only)
  - [ ] `ArtifactViewer` para cada tipo
  - [ ] Botón "Marcar Revisado" (si reviewer)

- [ ] **Implementar** `src/app/(dashboard)/dashboard/swm/mcmi4/[workspace_id]/audit/page.tsx`:
  - [ ] Tabla de logs de auditoría
  - [ ] Filtros (fecha, usuario, acción)
  - [ ] Solo visible para admin/owner

---

## FASE 7: SEGURIDAD Y VALIDACIÓN

### 7.1 Backend Security

- [ ] **Autenticación**:
  - [ ] Verificar JWT en todos los endpoints
  - [ ] Refresh token logic

- [ ] **Autorización**:
  - [ ] Guards de permisos en cada ruta
  - [ ] Validar ownership en operaciones sensibles

- [ ] **Input Validation**:
  - [ ] Schemas Pydantic/Marshmallow en todos los endpoints
  - [ ] Sanitizar inputs (prevenir SQL injection, XSS)

- [ ] **Rate Limiting**:
  - [ ] Lectura: 100 req/min
  - [ ] Escritura: 30 req/min
  - [ ] Seal/Review: 10 req/min

- [ ] **Auditoría**:
  - [ ] Logs en TODAS las operaciones de escritura
  - [ ] Capturar IP, user_agent, timestamp

---

### 7.2 Frontend Security

- [ ] **Headers**:
  - [ ] `Authorization: Bearer <token>` en todas las requests
  - [ ] `Content-Security-Policy` configurado

- [ ] **Validación de Entrada**:
  - [ ] Validar formularios antes de enviar
  - [ ] Prevenir XSS en campos de texto

- [ ] **Protección de Rutas**:
  - [ ] Guards en layouts de sesión
  - [ ] Redirect si no tiene permisos

---

## FASE 8: PRUEBAS

### 8.1 Tests Backend

- [ ] **Unit Tests**:
  - [ ] Modelos (100% coverage)
  - [ ] Servicios (100% coverage)
  - [ ] Guards (100% coverage)

- [ ] **Integration Tests**:
  - [ ] Todos los endpoints (happy path + errores)
  - [ ] Flujo completo: create → start → progress → seal

- [ ] **Tests de Concurrencia**:
  - [ ] 2 usuarios intentan iniciar sesión simultáneamente
  - [ ] Race conditions en updates de sesión

---

### 8.2 Tests Frontend

- [ ] **Unit Tests**:
  - [ ] Componentes individuales (Jest + React Testing Library)
  - [ ] Hooks personalizados

- [ ] **Integration Tests**:
  - [ ] Flujo de creación de workspace
  - [ ] Flujo de sesión completa
  - [ ] Navegación entre fases

- [ ] **E2E Tests** (Playwright/Cypress):
  - [ ] Test end-to-end completo (terapeuta crea → ejecutor completa → reviewer revisa)

---

## FASE 9: MIGRACIÓN Y LIMPIEZA

### 9.1 Desacoplamiento de Tests

- [ ] **Verificar que NO se usa**:
  - [ ] `TestModule` en código SWM
  - [ ] `UserTestAccess` en permisos SWM
  - [ ] `ExecuteTestView` en frontend SWM
  - [ ] Guards de tests en rutas SWM

- [ ] **Crear índice de separación**:
  - [ ] Documentar qué tablas SON tests vs SWM
  - [ ] Documentar qué rutas SON tests vs SWM

---

### 9.2 Migración de Datos Existentes (Si Aplica)

- [ ] **Si existían workspaces MCMI-4 en sistema viejo**:
  - [ ] Script de migración de datos
  - [ ] Mapear estados viejos → estados FSM nuevos
  - [ ] Probar rollback

- [ ] **Si NO existían**:
  - [ ] Marcar como N/A

---

## FASE 10: DEPLOYMENT Y MONITOREO

### 10.1 Pre-Deployment

- [ ] **Code Review**:
  - [ ] Revisión por par (senior engineer)
  - [ ] Verificar adherencia a arquitectura

- [ ] **Performance**:
  - [ ] Queries optimizadas (EXPLAIN ANALYZE en queries complejas)
  - [ ] Índices creados en DB
  - [ ] Frontend bundle size aceptable

- [ ] **Documentación**:
  - [ ] README.md del módulo
  - [ ] Guía de despliegue
  - [ ] Changelog

---

### 10.2 Deployment

- [ ] **Staging**:
  - [ ] Deploy a staging environment
  - [ ] Smoke tests en staging
  - [ ] Performance tests

- [ ] **Production**:
  - [ ] Migración de DB (con backup previo)
  - [ ] Deploy backend
  - [ ] Deploy frontend
  - [ ] Verificar endpoints live

---

### 10.3 Post-Deployment

- [ ] **Monitoreo**:
  - [ ] Logs de errores (Sentry/similar)
  - [ ] Métricas de performance (Datadog/similar)
  - [ ] Alertas configuradas (errores 500, latencia alta)

- [ ] **Documentación de Usuario**:
  - [ ] Guía de uso para terapeutas
  - [ ] Guía de uso para ejecutores
  - [ ] FAQ

---

## FASE 11: VERIFICACIÓN FINAL

### 11.1 Checklist de Funcionalidad

- [ ] **Flujo completo funciona**:
  - [ ] Terapeuta crea workspace
  - [ ] Terapeuta otorga permiso executor a otro usuario
  - [ ] Ejecutor inicia sesión
  - [ ] Ejecutor completa fases (discovery → mapping → interpretation → synthesis)
  - [ ] Ejecutor sella workspace
  - [ ] Reviewer marca como revisado

- [ ] **Casos de borde**:
  - [ ] Usuario sin permisos intenta acceder → 403
  - [ ] Workspace no existe → 404
  - [ ] Sesión activa impide nueva sesión → 409
  - [ ] Artefactos incompletos impiden sellar → 400

---

### 11.2 Verificación de Arquitectura

- [ ] **NO se usan**:
  - [ ] ❌ `TestModule`
  - [ ] ❌ `ExecuteTestView`
  - [ ] ❌ `UserTestAccess`
  - [ ] ❌ Guards de tests
  - [ ] ❌ Rutas de tests

- [ ] **SE usan correctamente**:
  - [ ] ✅ `WorkspaceInstance`
  - [ ] ✅ `WorkspaceSession`
  - [ ] ✅ `WorkspacePermission`
  - [ ] ✅ FSM de estados
  - [ ] ✅ Auditoría en todas las acciones

---

### 11.3 Sign-Off

- [ ] **Backend Lead**: Firma código backend completo y correcto
- [ ] **Frontend Lead**: Firma código frontend completo y correcto
- [ ] **Arquitecto**: Firma adherencia a diseño arquitectónico
- [ ] **QA**: Firma pruebas exitosas en staging
- [ ] **Product Owner**: Firma funcionalidad cumple requisitos

---

## APÉNDICE: COMANDOS ÚTILES

### Migración de Base de Datos

```bash
# Crear migración
python manage.py makemigrations swm_mcmi4 --name "create_swm_mcmi4_tables"

# Aplicar migración
python manage.py migrate swm_mcmi4

# Rollback (si necesario)
python manage.py migrate swm_mcmi4 zero
```

### Tests

```bash
# Backend tests
pytest backend/swm/mcmi4/tests/ -v --cov=backend/swm/mcmi4

# Frontend tests
npm run test -- src/app/(dashboard)/dashboard/swm/mcmi4

# E2E tests
npm run test:e2e -- swm-mcmi4
```

### Build y Deploy

```bash
# Backend
docker build -t backend:swm-mcmi4 .
docker run -p 5000:5000 backend:swm-mcmi4

# Frontend
npm run build
npm run start
```

---

**FIN DE IMPLEMENTATION CHECKLIST**  

Este checklist es exhaustivo, determinista y cerrado. Cada paso puede ejecutarse sin ambigüedad. Implementar en orden estricto garantiza un SWM MCMI-4 Místico funcional, seguro y arquitectónicamente correcto, completamente separado del sistema de tests.

---

**LISTO PARA IMPLEMENTACIÓN CUANDO SE AUTORICE**
