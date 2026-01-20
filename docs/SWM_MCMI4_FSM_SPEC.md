# SWM MCMI-4 MÍSTICO — FSM SPECIFICATION

**Versión:** 1.0  
**Fecha:** 2026-01-17  
**Estado:** Frozen (Post-Hardening Fase 2)  
**Categoría:** Specialized Workspace Module (SWM)

---

## 1. PROPÓSITO

Este documento define la Máquina de Estados Finitos (FSM) que gobierna el ciclo de vida de un `WorkspaceInstance` en el sistema SWM MCMI-4 Místico. Cada transición de estado está estrictamente validada y auditada.

---

## 2. ESTADOS DEL WORKSPACE

### 2.1 Estados Permitidos

```
created → in_progress → sealed → reviewed → archived
```

| Estado | Descripción | Mutable | Operaciones Permitidas |
|--------|-------------|---------|------------------------|
| `created` | Workspace creado, sin sesión iniciada | SÍ | start, grant-permission, delete |
| `in_progress` | Sesión activa, proceso interpretativo en curso | SÍ | progress, seal, close-session, questionnaire |
| `sealed` | Cuestionario completado y sellado, inmutable | NO | review, results, audit, export |
| `reviewed` | Revisado por supervisor/reviewer | NO | archive, results, audit, export |
| `archived` | Archivado, solo consulta histórica | NO | results (read-only), audit (read-only) |

---

## 3. DIAGRAMA DE TRANSICIONES

```
┌─────────┐
│ created │────────────────────────────────┐
└────┬────┘                                │
     │                                     │
     │ POST /start                         │ DELETE (admin only)
     │ (session_started)                   │
     ▼                                     ▼
┌──────────────┐                      ┌──────────┐
│ in_progress  │                      │ DELETED  │
└──────┬───────┘                      └──────────┘
       │
       │ POST /seal (questionnaire complete)
       │ (questionnaire_sealed + workspace_sealed)
       ▼
  ┌────────┐
  │ sealed │
  └───┬────┘
      │
      │ POST /review
      │ (workspace_reviewed)
      ▼
 ┌──────────┐
 │ reviewed │
 └────┬─────┘
      │
      │ POST /archive
      │ (workspace_archived)
      ▼
 ┌──────────┐
 │ archived │
 └──────────┘
```

---

## 4. TRANSICIONES VÁLIDAS

### 4.1 `created` → `in_progress`

**Trigger:** `POST /api/swm/mcmi4/start`  
**Condiciones:**
- Usuario tiene permiso `executor` o `admin`
- NO existe sesión activa (`WorkspaceSession.is_active = false` para todas las sesiones del workspace)
- Workspace NO tiene `started_at` previo (primera inicialización)

**Efectos:**
- Crea `WorkspaceSession` con `is_active = true`
- Fija `WorkspaceInstance.started_at` = timestamp actual
- Fija `WorkspaceInstance.status = 'in_progress'`
- Genera `questionnaire_config` artifact
- Genera `questionnaire_progress` artifact
- Log: `session_started`, `workspace_started`

**Código de Error si Falla:**
- `SESSION_ALREADY_ACTIVE` (409): Ya existe sesión activa
- `PERMISSION_DENIED` (403): Usuario sin permiso executor

---

### 4.2 `in_progress` → `sealed`

**Trigger:** `POST /api/swm/mcmi4/questionnaire/seal`  
**Condiciones:**
- Workspace status = `in_progress` (estrictamente)
- Sesión activa existe (`WorkspaceSession.is_active = true`)
- Usuario autenticado = `session.executor_user`
- Cuestionario completo: **195 respuestas registradas**
- Todos los artefactos requeridos generados

**Efectos:**
- Crea `WorkspaceArtifact` tipo `questionnaire_completion` con todas las 195 respuestas
- Fija `WorkspaceSession.is_active = false`
- Fija `WorkspaceSession.ended_at` = timestamp actual
- Marca todos los `WorkspaceArtifact` del workspace como `is_sealed = true` (inmutables)
- Fija `WorkspaceInstance.status = 'sealed'`
- Fija `WorkspaceInstance.sealed_at` = timestamp actual
- Log: `questionnaire_sealed`, `workspace_sealed`, `session_ended`

**Código de Error si Falla:**
- `FSM_INVALID_STATE` (409): Workspace no está en `in_progress`
- `SESSION_NOT_ACTIVE` (409): No hay sesión activa
- `QUESTIONNAIRE_INCOMPLETE` (409): Faltan respuestas (< 195)
- `PERMISSION_DENIED` (403): Usuario no es executor de la sesión

---

### 4.3 `sealed` → `reviewed`

**Trigger:** `POST /api/swm/mcmi4/review`  
**Condiciones:**
- Workspace status = `sealed`
- Usuario tiene permiso `reviewer` o `admin`
- Review payload incluye notas de revisión

**Efectos:**
- Crea `WorkspaceArtifact` tipo `review_notes`
- Fija `WorkspaceInstance.status = 'reviewed'`
- Fija `WorkspaceInstance.reviewed_at` = timestamp actual
- Log: `workspace_reviewed`

**Código de Error si Falla:**
- `FSM_INVALID_STATE` (409): Workspace no está en `sealed`
- `PERMISSION_DENIED` (403): Usuario sin permiso reviewer

---

### 4.4 `reviewed` → `archived`

**Trigger:** `POST /api/swm/mcmi4/archive`  
**Condiciones:**
- Workspace status = `reviewed`
- Usuario es `creator_user` o tiene permiso `admin`

**Efectos:**
- Fija `WorkspaceInstance.status = 'archived'`
- Fija `WorkspaceInstance.archived_at` = timestamp actual
- Log: `workspace_archived`

**Código de Error si Falla:**
- `FSM_INVALID_STATE` (409): Workspace no está en `reviewed`
- `PERMISSION_DENIED` (403): Usuario no es owner/admin

---

## 5. TRANSICIONES INVÁLIDAS (CÓDIGOS 409)

### 5.1 Intentos de Sellar sin Completar

**Escenario:** `POST /seal` con workspace en `in_progress` pero < 195 respuestas

**Error Response:**
```json
{
  "error": "Cannot seal workspace: questionnaire incomplete",
  "code": "QUESTIONNAIRE_INCOMPLETE",
  "details": {
    "current_state": "in_progress",
    "responses_count": 187,
    "required_count": 195,
    "missing_count": 8
  }
}
```

**HTTP Status:** `409 Conflict`

---

### 5.2 Intentos de Iniciar Sesión en Workspace Sellado

**Escenario:** `POST /start` con workspace en `sealed`

**Error Response:**
```json
{
  "error": "Cannot start session in sealed workspace",
  "code": "FSM_INVALID_STATE",
  "details": {
    "current_state": "sealed",
    "allowed_states": ["created"],
    "reason": "Sealed workspaces are immutable"
  }
}
```

**HTTP Status:** `409 Conflict`

---

### 5.3 Intentos de Cargar Cuestionario en Estado Inválido

**Escenario:** `GET /questionnaire` con workspace en `sealed`

**Error Response:**
```json
{
  "error": "Cannot load questionnaire in state 'sealed'",
  "code": "FSM_INVALID_STATE",
  "details": {
    "current_state": "sealed",
    "allowed_states": ["created", "in_progress"]
  }
}
```

**HTTP Status:** `409 Conflict`

---

### 5.4 Intentos de Guardar Respuestas sin Sesión Activa

**Escenario:** `POST /questionnaire/action` (save_response) sin sesión activa

**Error Response:**
```json
{
  "error": "Cannot save response: no active session",
  "code": "SESSION_NOT_ACTIVE",
  "details": {
    "workspace_id": "uuid",
    "workspace_status": "in_progress",
    "active_session": null
  }
}
```

**HTTP Status:** `409 Conflict`

---

### 5.5 Intentos de Avanzar Fase sin Workspace `in_progress`

**Escenario:** `POST /progress` con action=`advance_phase` en workspace `created`

**Error Response:**
```json
{
  "error": "Cannot advance phase: workspace not in progress",
  "code": "FSM_INVALID_STATE",
  "details": {
    "current_state": "created",
    "required_state": "in_progress",
    "action": "advance_phase"
  }
}
```

**HTTP Status:** `409 Conflict`

---

## 6. VALIDACIONES FSM EN CÓDIGO

### 6.1 `QuestionnaireView.get()` (líneas 580-590)

```python
# FSM validation: only 'created' or 'in_progress' states allowed
if workspace.status not in ['created', 'in_progress']:
    return Response(
        {
            'error': f"Cannot load questionnaire in state '{workspace.status}'",
            'code': 'FSM_INVALID_STATE',
            'details': {'current_state': workspace.status, 'allowed_states': ['created', 'in_progress']}
        },
        status=status.HTTP_409_CONFLICT
    )
```

---

### 6.2 `ProgressActionView.post()` (líneas 814-825)

```python
# FSM validation: workspace must be in_progress
if workspace.status != 'in_progress':
    return Response(
        {
            'error': f"Cannot record progress: workspace is '{workspace.status}'",
            'code': 'FSM_INVALID_STATE',
            'details': {'current_state': workspace.status, 'required_state': 'in_progress'}
        },
        status=status.HTTP_409_CONFLICT
    )

# Session must be active
if not session.is_active:
    return Response(
        {'error': 'Session is not active', 'code': 'SESSION_NOT_ACTIVE'},
        status=status.HTTP_409_CONFLICT
    )
```

---

### 6.3 `SealQuestionnaireView.post()` (líneas 1040-1051)

```python
# FSM validation: must be in_progress
if workspace.status != 'in_progress':
    return Response(
        {
            'error': f"Cannot seal workspace in state '{workspace.status}'",
            'code': 'FSM_INVALID_STATE',
            'details': {'current_state': workspace.status, 'required_state': 'in_progress'}
        },
        status=status.HTTP_409_CONFLICT
    )
```

---

## 7. ENFORCEMENT EN BASE DE DATOS

### 7.1 Check Constraint

```sql
-- WorkspaceInstance table
CHECK (status IN ('created', 'in_progress', 'sealed', 'reviewed', 'archived'))
```

### 7.2 Timestamp Constraints

```sql
CHECK (started_at IS NULL OR started_at >= created_at)
CHECK (sealed_at IS NULL OR sealed_at >= started_at)
CHECK (reviewed_at IS NULL OR reviewed_at >= sealed_at)
CHECK (archived_at IS NULL OR archived_at >= reviewed_at)
```

Estos constraints **previenen transiciones inválidas a nivel de base de datos** incluso si la lógica de aplicación falla.

---

## 8. POLÍTICA DE MUTABILIDAD

| Estado | Config Mutable | Artifacts Mutable | Responses Mutable | Permisos Mutables |
|--------|----------------|-------------------|-------------------|-------------------|
| `created` | ✅ SÍ | N/A | N/A | ✅ SÍ |
| `in_progress` | ❌ NO | ✅ SÍ (durante sesión) | ✅ SÍ (solo agregar) | ✅ SÍ |
| `sealed` | ❌ NO | ❌ NO (`is_sealed=true`) | ❌ NO | ⚠️ Solo lectura |
| `reviewed` | ❌ NO | ❌ NO | ❌ NO | ⚠️ Solo lectura |
| `archived` | ❌ NO | ❌ NO | ❌ NO | ⚠️ Solo lectura |

**Nota:** Una vez en estado `sealed`, **ningún dato del workspace puede modificarse**. Esto garantiza integridad forense de resultados MCMI-4.

---

## 9. TESTING FSM

### 9.1 Tests de Transiciones Válidas

```python
def test_valid_transition_created_to_in_progress():
    """Test: created → in_progress con start exitoso."""
    workspace = create_workspace(status='created')
    session = start_session(workspace)
    assert workspace.status == 'in_progress'
    assert session.is_active == True

def test_valid_transition_in_progress_to_sealed():
    """Test: in_progress → sealed con 195 respuestas."""
    workspace = create_workspace(status='in_progress')
    fill_questionnaire(workspace, responses=195)
    seal_workspace(workspace)
    assert workspace.status == 'sealed'
    assert workspace.sealed_at is not None
```

### 9.2 Tests de Transiciones Inválidas (409)

```python
def test_invalid_seal_without_completion():
    """Test: seal con < 195 respuestas debe retornar 409."""
    workspace = create_workspace(status='in_progress')
    fill_questionnaire(workspace, responses=187)
    
    response = client.post('/api/swm/mcmi4/questionnaire/seal', {...})
    
    assert response.status_code == 409
    assert response.data['code'] == 'QUESTIONNAIRE_INCOMPLETE'

def test_invalid_start_on_sealed():
    """Test: start en workspace sealed debe retornar 409."""
    workspace = create_workspace(status='sealed')
    
    response = client.post('/api/swm/mcmi4/start', {...})
    
    assert response.status_code == 409
    assert response.data['code'] == 'FSM_INVALID_STATE'
```

---

## 10. RESUMEN DE CÓDIGOS FSM

| Código | Status HTTP | Transición Intentada | Estado Actual |
|--------|-------------|----------------------|---------------|
| `FSM_INVALID_STATE` | 409 | start → sealed | sealed |
| `FSM_INVALID_STATE` | 409 | questionnaire → sealed | sealed |
| `FSM_INVALID_STATE` | 409 | progress → created | created |
| `FSM_INVALID_STATE` | 409 | seal → created | created |
| `SESSION_NOT_ACTIVE` | 409 | save_response sin sesión | in_progress |
| `SESSION_ALREADY_ACTIVE` | 409 | start con sesión activa | in_progress |
| `QUESTIONNAIRE_INCOMPLETE` | 409 | seal con < 195 | in_progress |
| `WORKSPACE_ALREADY_SEALED` | 409 | seal en sealed | sealed |

---

**FIN DE FSM SPECIFICATION**  
Este documento define el comportamiento completo de la FSM del SWM MCMI-4 Místico post-hardening Fase 2, con todas las transiciones válidas, inválidas y códigos de error asociados.
