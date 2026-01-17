# SWM MCMI-4 MÍSTICO — API SPECIFICATION

**Versión:** 1.0  
**Fecha:** 2026-01-17  
**Estado:** Arquitectura Definitiva  
**Categoría:** Specialized Workspace Module (SWM)

---

## 1. BASE PATH

Todos los endpoints del MCMI-4 Místico están bajo:

```
/api/swm/mcmi4/
```

**Separación absoluta de tests**: NO usar `/api/tests/`, `/api/assessments/`, ni rutas compartidas.

---

## 2. ENDPOINTS

### 2.1 `POST /api/swm/mcmi4/create`

**Propósito**: Crear una nueva instancia de workspace MCMI-4 Místico.

**Quién puede llamarlo**:
- Usuarios con rol `therapist` o superior
- Usuario debe tener relación terapéutica con `subject_user_id` (verificar permisos clínicos)

**Request Body**:
```json
{
  "subject_user_id": "uuid",
  "mcmi4_source_data_id": "uuid",
  "config": {
    "include_symbolic_layers": ["archetypal", "relational", "transgenerational"],
    "focus_areas": ["string"],
    "notes": "string (opcional)"
  },
  "metadata": {
    "clinical_context": "string (opcional)",
    "therapeutic_goal": "string (opcional)"
  }
}
```

**Precondiciones**:
- `subject_user_id` debe existir en la base de datos
- `mcmi4_source_data_id` debe referenciar datos MCMI-4 válidos del `subject_user_id`
- Usuario autenticado debe tener permiso clínico sobre `subject_user_id`
- No existe otro workspace `in_progress` del mismo `subject_user_id` con mismos `mcmi4_source_data_id`

**Efectos**:
- Crea registro en `WorkspaceInstance` con `status = created`
- Crea `WorkspacePermission` para el creador con `permission_type = admin`
- Genera entrada en `WorkspaceAuditLog` con `action = workspace_created`
- Fija `creator_user_id` = usuario autenticado

**Response 201 Created**:
```json
{
  "workspace_id": "uuid",
  "status": "created",
  "subject_user_id": "uuid",
  "creator_user_id": "uuid",
  "created_at": "ISO 8601 timestamp",
  "mcmi4_source_data_id": "uuid"
}
```

**Errores**:
- `400 Bad Request`: Datos de entrada inválidos, `mcmi4_source_data_id` no corresponde al sujeto
- `403 Forbidden`: Usuario no tiene permiso clínico sobre `subject_user_id`
- `404 Not Found`: `subject_user_id` o `mcmi4_source_data_id` no existen
- `409 Conflict`: Ya existe workspace activo con mismos parámetros

---

### 2.2 `POST /api/swm/mcmi4/start`

**Propósito**: Iniciar sesión interpretativa en un workspace existente.

**Quién puede llamarlo**:
- Usuarios con `WorkspacePermission.permission_type = executor` o `admin` en el workspace

**Request Body**:
```json
{
  "workspace_id": "uuid"
}
```

**Precondiciones**:
- `workspace_id` debe existir
- Workspace debe estar en estado `created` (no puede reiniciar workspace `in_progress`, `sealed`, etc.)
- No debe existir sesión activa (`WorkspaceSession.is_active = true`) para el workspace
- Usuario autenticado debe tener permiso `executor` o `admin`

**Efectos**:
- Crea registro en `WorkspaceSession` con:
  - `executor_user_id` = usuario autenticado
  - `is_active = true`
  - `started_at` = timestamp actual
  - `current_phase = "discovery"`
- Actualiza `WorkspaceInstance.status` a `in_progress`
- Fija `WorkspaceInstance.started_at` = timestamp actual
- Genera entrada en `WorkspaceAuditLog` con `action = session_started`

**Response 200 OK**:
```json
{
  "session_id": "uuid",
  "workspace_id": "uuid",
  "executor_user_id": "uuid",
  "started_at": "ISO 8601 timestamp",
  "current_phase": "discovery",
  "session_state": {
    "progress_percentage": 0,
    "phases_completed": [],
    "current_step": "initial_orientation"
  }
}
```

**Errores**:
- `400 Bad Request`: Workspace no en estado `created`
- `403 Forbidden`: Usuario no tiene permiso `executor`
- `404 Not Found`: `workspace_id` no existe
- `409 Conflict`: Sesión activa ya existe en el workspace

---

### 2.3 `POST /api/swm/mcmi4/progress`

**Propósito**: Actualizar el progreso de la sesión activa (avanzar fases, registrar decisiones).

**Quién puede llamarlo**:
- Usuario que inició la sesión activa (`WorkspaceSession.executor_user_id`)

**Request Body**:
```json
{
  "workspace_id": "uuid",
  "session_id": "uuid",
  "action": "advance_phase | record_decision | generate_artifact",
  "payload": {
    "current_phase": "mapping",
    "decision_context": "string (opcional)",
    "artifact_data": {
      "artifact_type": "symbolic_map | narrative | hypothesis",
      "content": "JSON or Text"
    }
  }
}
```

**Precondiciones**:
- `session_id` debe estar activo (`is_active = true`)
- Usuario autenticado debe ser `executor_user_id` de la sesión
- Workspace debe estar en estado `in_progress`

**Efectos**:
- Actualiza `WorkspaceSession.session_state` con nuevo progreso
- Actualiza `WorkspaceSession.current_phase` si aplica
- Incrementa `WorkspaceSession.interactions_count`
- Si `action = generate_artifact`: Crea registro en `WorkspaceArtifact` con `is_sealed = false`
- Genera entrada en `WorkspaceAuditLog` con `action = session_progress_updated`

**Response 200 OK**:
```json
{
  "session_id": "uuid",
  "current_phase": "mapping",
  "session_state": {
    "progress_percentage": 45,
    "phases_completed": ["discovery"],
    "current_step": "symbolic_mapping"
  },
  "interactions_count": 23,
  "artifact_created": "uuid (opcional)"
}
```

**Errores**:
- `400 Bad Request`: Payload inválido, transición de fase no permitida
- `403 Forbidden`: Usuario no es executor de la sesión
- `404 Not Found`: `workspace_id` o `session_id` no existen
- `409 Conflict`: Sesión no está activa

---

### 2.4 `POST /api/swm/mcmi4/seal`

**Propósito**: Completar y sellar el workspace, finalizando la sesión interpretativa.

**Quién puede llamarlo**:
- Usuario que es `executor_user_id` de la sesión activa

**Request Body**:
```json
{
  "workspace_id": "uuid",
  "session_id": "uuid",
  "final_synthesis": {
    "synthesis_report_content": "JSON",
    "key_findings": ["string"],
    "symbolic_closures": ["string"]
  }
}
```

**Precondiciones**:
- Sesión debe estar activa
- Workspace debe estar en estado `in_progress`
- Usuario autenticado debe ser `executor_user_id`
- Validación de completitud:
  - Todas las fases requeridas completadas
  - Al menos 1 artefacto de cada tipo mínimo generado (configurable)

**Efectos**:
- Crea `WorkspaceArtifact` de tipo `synthesis_report` con contenido de `final_synthesis`
- Actualiza `WorkspaceSession.is_active = false`
- Fija `WorkspaceSession.ended_at` = timestamp actual
- Actualiza `WorkspaceInstance.status` a `sealed`
- Fija `WorkspaceInstance.sealed_at` = timestamp actual
- Marca todos los `WorkspaceArtifact` del workspace como `is_sealed = true` (inmutables)
- Genera entrada en `WorkspaceAuditLog` con `action = workspace_sealed`

**Response 200 OK**:
```json
{
  "workspace_id": "uuid",
  "status": "sealed",
  "sealed_at": "ISO 8601 timestamp",
  "session_summary": {
    "session_id": "uuid",
    "started_at": "ISO 8601 timestamp",
    "ended_at": "ISO 8601 timestamp",
    "interactions_count": 87,
    "artifacts_generated": 12
  },
  "synthesis_report_id": "uuid"
}
```

**Errores**:
- `400 Bad Request`: Validación de completitud falla, `final_synthesis` inválido
- `403 Forbidden`: Usuario no es executor de la sesión
- `404 Not Found`: `workspace_id` o `session_id` no existen
- `409 Conflict`: Sesión no está activa o workspace ya sellado

---

### 2.5 `GET /api/swm/mcmi4/status`

**Propósito**: Obtener el estado actual de un workspace.

**Quién puede llamarlo**:
- Usuarios con cualquier `WorkspacePermission` activo en el workspace
- `creator_user_id` del workspace

**Query Parameters**:
- `workspace_id` (required): UUID del workspace

**Precondiciones**:
- `workspace_id` debe existir
- Usuario autenticado debe tener permiso de lectura (cualquier permiso activo o ser creator)

**Response 200 OK**:
```json
{
  "workspace_id": "uuid",
  "status": "in_progress | sealed | reviewed | created",
  "subject_user_id": "uuid",
  "creator_user_id": "uuid",
  "created_at": "ISO 8601 timestamp",
  "started_at": "ISO 8601 timestamp (nullable)",
  "sealed_at": "ISO 8601 timestamp (nullable)",
  "reviewed_at": "ISO 8601 timestamp (nullable)",
  "active_session": {
    "session_id": "uuid",
    "executor_user_id": "uuid",
    "current_phase": "mapping",
    "started_at": "ISO 8601 timestamp",
    "progress_percentage": 45
  } | null,
  "permissions": [
    {
      "user_id": "uuid",
      "permission_type": "executor | observer | reviewer | admin",
      "granted_at": "ISO 8601 timestamp"
    }
  ],
  "artifacts_count": {
    "symbolic_map": 3,
    "narrative": 5,
    "hypothesis": 8,
    "synthesis_report": 1
  }
}
```

**Errores**:
- `403 Forbidden`: Usuario no tiene permiso de lectura
- `404 Not Found`: `workspace_id` no existe

---

### 2.6 `GET /api/swm/mcmi4/results`

**Propósito**: Obtener los artefactos y resultados finales de un workspace sellado.

**Quién puede llamarlo**:
- Usuarios con `WorkspacePermission.permission_type = observer`, `reviewer`, o `admin`
- `creator_user_id` del workspace
- `executor_user_id` de sesiones cerradas del workspace

**Query Parameters**:
- `workspace_id` (required): UUID del workspace
- `artifact_type` (optional): Filtrar por tipo (`symbolic_map`, `narrative`, `hypothesis`, `synthesis_report`, `archetype_profile`)
- `include_session_data` (optional): Booleano, si incluir datos de sesión (default: false)

**Precondiciones**:
- `workspace_id` debe existir
- Workspace debe estar en estado `sealed`, `reviewed`, o `archived` (NO `created` ni `in_progress`)
- Usuario autenticado debe tener permiso de lectura

**Response 200 OK**:
```json
{
  "workspace_id": "uuid",
  "status": "sealed",
  "sealed_at": "ISO 8601 timestamp",
  "subject_user_id": "uuid",
  "artifacts": [
    {
      "artifact_id": "uuid",
      "artifact_type": "synthesis_report",
      "created_at": "ISO 8601 timestamp",
      "created_by": "uuid",
      "is_sealed": true,
      "content": {
        "key_findings": ["string"],
        "symbolic_closures": ["string"],
        "archetypal_patterns": ["string"],
        "therapeutic_implications": "text"
      },
      "metadata": {}
    },
    {
      "artifact_id": "uuid",
      "artifact_type": "symbolic_map",
      "created_at": "ISO 8601 timestamp",
      "created_by": "uuid",
      "is_sealed": true,
      "content": {
        "map_data": "JSON structure"
      }
    }
  ],
  "session_summary": {
    "session_id": "uuid",
    "executor_user_id": "uuid",
    "started_at": "ISO 8601 timestamp",
    "ended_at": "ISO 8601 timestamp",
    "interactions_count": 87
  } | null
}
```

**Errores**:
- `400 Bad Request`: Workspace no está sellado (resultados no disponibles)
- `403 Forbidden`: Usuario no tiene permiso de lectura de resultados
- `404 Not Found`: `workspace_id` no existe

---

### 2.7 `POST /api/swm/mcmi4/review`

**Propósito**: Marcar un workspace sellado como revisado por un revisor autorizado.

**Quién puede llamarlo**:
- Usuarios con `WorkspacePermission.permission_type = reviewer` o `admin`

**Request Body**:
```json
{
  "workspace_id": "uuid",
  "review_notes": "string (opcional)",
  "validation_status": "approved | needs_revision"
}
```

**Precondiciones**:
- Workspace debe estar en estado `sealed` (no `created`, `in_progress`, ni ya `reviewed`)
- Usuario autenticado debe tener permiso `reviewer` o `admin`

**Efectos**:
- Actualiza `WorkspaceInstance.status` a `reviewed`
- Fija `WorkspaceInstance.reviewed_at` = timestamp actual
- Guarda `review_notes` en `WorkspaceInstance.metadata.review`
- Genera entrada en `WorkspaceAuditLog` con `action = workspace_reviewed`

**Response 200 OK**:
```json
{
  "workspace_id": "uuid",
  "status": "reviewed",
  "reviewed_at": "ISO 8601 timestamp",
  "reviewed_by": "uuid",
  "validation_status": "approved"
}
```

**Errores**:
- `400 Bad Request`: Workspace no está en estado `sealed`
- `403 Forbidden`: Usuario no tiene permiso `reviewer`
- `404 Not Found`: `workspace_id` no existe

---

### 2.8 `POST /api/swm/mcmi4/close-session`

**Propósito**: Cerrar sesión activa sin sellar el workspace (pausa temporal).

**Quién puede llamarlo**:
- Usuario que es `executor_user_id` de la sesión activa

**Request Body**:
```json
{
  "workspace_id": "uuid",
  "session_id": "uuid",
  "pause_reason": "string (opcional)"
}
```

**Precondiciones**:
- Sesión debe estar activa
- Usuario autenticado debe ser `executor_user_id`

**Efectos**:
- Actualiza `WorkspaceSession.is_active = false`
- Fija `WorkspaceSession.ended_at` = timestamp actual
- Workspace permanece en estado `in_progress` (puede reabrirse nueva sesión)
- Guarda `pause_reason` en `WorkspaceSession.session_state.pause_reason`
- Genera entrada en `WorkspaceAuditLog` con `action = session_closed`

**Response 200 OK**:
```json
{
  "session_id": "uuid",
  "workspace_id": "uuid",
  "ended_at": "ISO 8601 timestamp",
  "status": "closed",
  "workspace_status": "in_progress"
}
```

**Errores**:
- `403 Forbidden`: Usuario no es executor de la sesión
- `404 Not Found`: `workspace_id` o `session_id` no existen
- `409 Conflict`: Sesión ya está cerrada

---

### 2.9 `POST /api/swm/mcmi4/permissions/grant`

**Propósito**: Otorgar permiso de acceso a un usuario en un workspace.

**Quién puede llamarlo**:
- `creator_user_id` del workspace
- Usuarios con `WorkspacePermission.permission_type = admin` en el workspace

**Request Body**:
```json
{
  "workspace_id": "uuid",
  "user_id": "uuid",
  "permission_type": "executor | observer | reviewer | admin"
}
```

**Precondiciones**:
- `workspace_id` debe existir
- `user_id` debe existir
- Usuario autenticado debe ser creator o admin del workspace
- `user_id` no debe tener ya el mismo `permission_type` activo

**Efectos**:
- Crea registro en `WorkspacePermission` con:
  - `granted_by` = usuario autenticado
  - `granted_at` = timestamp actual
  - `is_active = true`
- Genera entrada en `WorkspaceAuditLog` con `action = permission_granted`

**Response 200 OK**:
```json
{
  "permission_id": "uuid",
  "workspace_id": "uuid",
  "user_id": "uuid",
  "permission_type": "executor",
  "granted_by": "uuid",
  "granted_at": "ISO 8601 timestamp",
  "is_active": true
}
```

**Errores**:
- `400 Bad Request`: `permission_type` inválido
- `403 Forbidden`: Usuario no tiene permiso para otorgar permisos
- `404 Not Found`: `workspace_id` o `user_id` no existen
- `409 Conflict`: Usuario ya tiene ese permiso activo

---

### 2.10 `POST /api/swm/mcmi4/permissions/revoke`

**Propósito**: Revocar permiso de acceso de un usuario en un workspace.

**Quién puede llamarlo**:
- `creator_user_id` del workspace
- Usuarios con `WorkspacePermission.permission_type = admin` en el workspace

**Request Body**:
```json
{
  "workspace_id": "uuid",
  "user_id": "uuid",
  "permission_type": "executor | observer | reviewer | admin"
}
```

**Precondiciones**:
- `workspace_id` debe existir
- `user_id` debe tener el `permission_type` activo en el workspace
- Usuario autenticado debe ser creator o admin del workspace
- No puede revocarse permiso del `creator_user_id` (owner permanente)

**Efectos**:
- Actualiza `WorkspacePermission.is_active = false`
- Fija `WorkspacePermission.revoked_at` = timestamp actual
- Genera entrada en `WorkspaceAuditLog` con `action = permission_revoked`
- **NO cierra sesiones activas** del usuario con permiso revocado (sesión continúa hasta cierre manual)

**Response 200 OK**:
```json
{
  "permission_id": "uuid",
  "workspace_id": "uuid",
  "user_id": "uuid",
  "permission_type": "executor",
  "is_active": false,
  "revoked_at": "ISO 8601 timestamp"
}
```

**Errores**:
- `400 Bad Request`: Usuario no tiene ese permiso activo, intentando revocar owner
- `403 Forbidden`: Usuario no tiene permiso para revocar permisos
- `404 Not Found`: `workspace_id` o `user_id` no existen

---

### 2.11 `GET /api/swm/mcmi4/list`

**Propósito**: Listar workspaces accesibles por el usuario autenticado.

**Quién puede llamarlo**:
- Cualquier usuario autenticado

**Query Parameters**:
- `status` (optional): Filtrar por estado (`created`, `in_progress`, `sealed`, `reviewed`, `archived`)
- `subject_user_id` (optional): Filtrar por sujeto del análisis (requiere permisos clínicos)
- `creator_user_id` (optional): Filtrar por creador
- `page` (optional): Número de página (default: 1)
- `limit` (optional): Resultados por página (default: 20, max: 100)

**Precondiciones**:
- Usuario autenticado debe tener:
  - Permisos en workspaces específicos (vía `WorkspacePermission`), O
  - Ser `creator_user_id` de workspaces, O
  - Rol `admin` (ve todos)

**Response 200 OK**:
```json
{
  "workspaces": [
    {
      "workspace_id": "uuid",
      "status": "sealed",
      "subject_user_id": "uuid",
      "subject_name": "string (si tiene permiso)",
      "creator_user_id": "uuid",
      "created_at": "ISO 8601 timestamp",
      "sealed_at": "ISO 8601 timestamp (nullable)",
      "user_permission": "executor | observer | reviewer | admin | owner",
      "has_active_session": false,
      "artifacts_count": 12
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_results": 45,
    "total_pages": 3
  }
}
```

**Errores**:
- `400 Bad Request`: Parámetros de paginación inválidos
- `403 Forbidden`: Usuario intenta filtrar por `subject_user_id` sin permisos clínicos

---

### 2.12 `GET /api/swm/mcmi4/audit-log`

**Propósito**: Obtener el historial de auditoría de un workspace.

**Quién puede llamarlo**:
- `creator_user_id` del workspace
- Usuarios con `WorkspacePermission.permission_type = admin` en el workspace
- Usuarios con rol global `compliance_officer` o `admin`

**Query Parameters**:
- `workspace_id` (required): UUID del workspace
- `start_date` (optional): Filtrar desde fecha (ISO 8601)
- `end_date` (optional): Filtrar hasta fecha (ISO 8601)
- `action` (optional): Filtrar por tipo de acción
- `user_id` (optional): Filtrar por usuario que realizó acciones

**Precondiciones**:
- `workspace_id` debe existir
- Usuario autenticado debe tener permiso de auditoría

**Response 200 OK**:
```json
{
  "workspace_id": "uuid",
  "audit_entries": [
    {
      "log_id": "uuid",
      "timestamp": "ISO 8601 timestamp",
      "user_id": "uuid",
      "user_name": "string",
      "action": "workspace_created | session_started | workspace_sealed",
      "details": {
        "previous_status": "created",
        "new_status": "in_progress",
        "additional_context": {}
      },
      "ip_address": "string"
    }
  ],
  "total_entries": 87
}
```

**Errores**:
- `403 Forbidden`: Usuario no tiene permiso de auditoría
- `404 Not Found`: `workspace_id` no existe

---

## 3. CÓDIGOS DE ERROR ESTANDARIZADOS

Todos los endpoints deben retornar errores en formato consistente:

```json
{
  "error": {
    "code": "WORKSPACE_NOT_FOUND | PERMISSION_DENIED | INVALID_STATE_TRANSITION | etc.",
    "message": "Descripción legible del error",
    "details": {
      "field": "workspace_id",
      "reason": "Workspace with id 'xxx' does not exist"
    },
    "timestamp": "ISO 8601 timestamp",
    "request_id": "uuid (para tracing)"
  }
}
```

### 3.1 Códigos de Error Específicos del SWM

**Códigos de Validación (400 Bad Request)**

| Código | HTTP Status | Descripción | Implementado en |
|--------|-------------|-------------|-----------------|
| `MISSING_WORKSPACE_ID` | 400 | Parámetro `workspace_id` requerido ausente | WorkspaceStatusView |
| `INVALID_UUID` | 400 | Formato de UUID inválido (workspace_id, session_id) | Todos los endpoints |
| `VALIDATION_ERROR` | 400 | Error de validación de datos de entrada | ProgressActionView |
| `INVALID_MCMI4_DATA` | 400 | Datos MCMI-4 inválidos o no corresponden al sujeto | CreateWorkspaceView |
| `MISSING_REQUIRED_ARTIFACTS` | 400 | Faltan artefactos obligatorios para sellar | SealWorkspaceView |
| `WORKSPACE_NOT_SEALED` | 400 | Operación requiere workspace sellado | ReviewWorkspaceView |
| `INVALID_STATE_TRANSITION` | 400 | Transición de estado no permitida | WorkspaceService |
| `CANNOT_REVOKE_OWNER` | 400 | No se puede revocar permiso del creator | RevokePermissionView |

**Códigos de Permisos (403 Forbidden)**

| Código | HTTP Status | Descripción | Implementado en |
|--------|-------------|-------------|-----------------|
| `PERMISSION_DENIED` | 403 | Usuario sin permiso para la operación | Guards (HasWorkspaceExecutorPermission, etc.) |
| `CLINICAL_PERMISSION_REQUIRED` | 403 | Operación requiere relación clínica con sujeto | CreateWorkspaceView |

**Códigos de Recursos (404 Not Found)**

| Código | HTTP Status | Descripción | Implementado en |
|--------|-------------|-------------|-----------------|
| `WORKSPACE_NOT_FOUND` | 404 | Workspace ID no existe | WorkspaceStatusView, ListWorkspacesView |
| `ARTIFACT_NOT_FOUND` | 404 | Artefacto esperado no existe (questionnaire_config, etc.) | QuestionnaireView |

**Códigos FSM (409 Conflict)**

| Código | HTTP Status | Descripción | Implementado en |
|--------|-------------|-------------|-----------------|
| `FSM_INVALID_STATE` | 409 | Workspace no está en estado válido para operación | QuestionnaireView, ProgressActionView, SealQuestionnaireView |
| `SESSION_NOT_ACTIVE` | 409 | Sesión requerida no está activa | ProgressActionView, SealQuestionnaireView |
| `SESSION_ALREADY_ACTIVE` | 409 | Ya existe sesión activa en el workspace | StartSessionView |
| `WORKSPACE_ALREADY_SEALED` | 409 | Workspace ya está sellado (inmutable) | SealWorkspaceView |
| `QUESTIONNAIRE_INCOMPLETE` | 409 | No se puede sellar: faltan respuestas (195 requeridas) | SealQuestionnaireView |
| `PERMISSION_ALREADY_GRANTED` | 409 | Usuario ya tiene ese permiso activo | GrantPermissionView |

**Códigos de Fallo de Operación (500 Internal Server Error)**

| Código | HTTP Status | Descripción | Implementado en |
|--------|-------------|-------------|-----------------|
| `SESSION_END_FAILED` | 500 | Error al finalizar sesión durante seal | SealQuestionnaireView |
| `FINALIZE_FAILED` | 500 | Error al finalizar workspace durante seal | SealQuestionnaireView |
| `UNKNOWN_ACTION` | 500 | Acción no reconocida en progress endpoint | ProgressActionView |

> **Nota Fase 2 Hardening:** Todos los códigos de error fueron estandarizados en formato JSON con estructura `{"error": "mensaje", "code": "CODIGO", "details": {...}}` para facilitar manejo en frontend.

---

## 4. AUTENTICACIÓN Y HEADERS

### 4.1 Headers Requeridos

Todas las requests deben incluir:

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
X-Request-ID: <UUID> (opcional, para tracing)
```

### 4.2 Headers de Respuesta

Todas las responses incluyen:

```
Content-Type: application/json
X-Request-ID: <UUID>
X-RateLimit-Limit: <número>
X-RateLimit-Remaining: <número>
```

---

## 5. RATE LIMITING

- **Lectura** (GET): 100 requests/minuto por usuario
- **Escritura** (POST): 30 requests/minuto por usuario
- **Seal/Review**: 10 requests/minuto por usuario (operaciones críticas)

Exceder límites retorna `429 Too Many Requests` con header:
```
Retry-After: <segundos>
```

---

## 6. VERSIONADO DE API

- Versión actual: `v1`
- Path completo con versión: `/api/v1/swm/mcmi4/`
- Cambios breaking requieren nueva versión mayor (`v2`)
- Versiones anteriores soportadas por 12 meses post-deprecación

---

## 7. CONSIDERACIONES DE IMPLEMENTACIÓN

### 7.1 Idempotencia
- `POST /create`: NO idempotente (cada llamada crea nueva instancia)
- `POST /start`: Idempotente (reintentar con mismo `workspace_id` retorna sesión existente si activa)
- `POST /seal`: Idempotente (reintentar con workspace sellado retorna 409 pero no causa error crítico)
- `POST /permissions/*`: Idempotente (otorgar permiso ya existente retorna el existente)

### 7.2 Transacciones
- Operaciones de cambio de estado (`start`, `seal`, `review`) deben ser transaccionales
- Fallar cualquier paso (ej. crear artefacto) debe revertir cambio de estado completo
- Usar locks optimistas o pesimistas en `WorkspaceInstance` para evitar race conditions

### 7.3 Validación de Permisos
- Validar permisos **antes** de cualquier operación de escritura
- Cachear permisos de usuario por request (no re-query en cada validación)
- Permisos de `admin` global bypasean checks de workspace-specific permissions

### 7.4 Auditoría
- **TODO** cambio de estado debe generar log en `WorkspaceAuditLog`
- Logs deben capturarse en transacción junto con operación principal
- Fallar log NO debe fallar operación principal (log en background si necesario)

---

**FIN DE API SPECIFICATION**  
Este documento define los endpoints REST del SWM MCMI-4 Místico con semántica completa, listo para implementación backend.
