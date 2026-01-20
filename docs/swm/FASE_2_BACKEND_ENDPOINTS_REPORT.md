# FASE 2: BACKEND VIEWS + ENDPOINTS - REPORTE DE ENTREGA

## ✅ Archivos Modificados/Creados

### 1. **backend/swm/mcmi4/serializers.py**
- **Cambios**: Añadidos 7 serializers nuevos
- **Serializers añadidos**:
  - `QuestionnaireQuerySerializer` - Query params para GET /questionnaire
  - `QuestionnaireResponseSerializer` - Response de GET /questionnaire
  - `ProgressQuerySerializer` - Query params para GET /progress
  - `ProgressGetResponseSerializer` - Response de GET /progress
  - `ProgressActionSerializer` - Request para POST /action (save_response/change_world)
  - `ProgressActionResponseSerializer` - Response de POST /action
  - `SealQuestionnaireRequestSerializer` - Request para POST /seal

### 2. **backend/swm/mcmi4/views.py**
- **Cambios**: Añadidas 4 vistas nuevas (370+ líneas)
- **Vistas añadidas**:
  - `QuestionnaireView` - GET /api/swm/mcmi4/questionnaire
  - `QuestionnaireProgressView` - GET /api/swm/mcmi4/questionnaire/progress  
  - `ProgressActionView` - POST /api/swm/mcmi4/questionnaire/action
  - `SealQuestionnaireView` - POST /api/swm/mcmi4/questionnaire/seal
- **Imports añadidos**: QuestionnaireService integration

### 3. **backend/swm/mcmi4/urls.py**
- **Cambios**: Añadidas 4 rutas bajo /questionnaire
- **Rutas añadidas**:
  ```python
  path('questionnaire', QuestionnaireView.as_view())
  path('questionnaire/progress', QuestionnaireProgressView.as_view())
  path('questionnaire/action', ProgressActionView.as_view())
  path('questionnaire/seal', SealQuestionnaireView.as_view())
  ```

### 4. **backend/swm/mcmi4/models.py**
- **Cambios**: Añadida property `status` a WorkspaceSession
- **Detalles**: Property de compatibilidad que retorna 'active'/'ended' según `is_active`

### 5. **backend/swm/mcmi4/tests/__init__.py** (NUEVO)
- Archivo init para suite de tests

### 6. **backend/swm/mcmi4/tests/test_questionnaire_api.py** (NUEVO)
- **Contenido**: 4 tests DRF obligatorios
- **Tests implementados**:
  1. `test_questionnaire_get_requires_permission` - Valida permisos executor
  2. `test_progress_save_response_persists_artifact` - Valida persistencia de respuestas
  3. `test_change_world_forward_requires_completion` - Valida regla de navegación
  4. `test_seal_creates_completion_artifact_and_seals` - Valida sellado completo

---

## 📡 Endpoints Disponibles

### A) GET /api/swm/mcmi4/questionnaire
**Propósito**: Obtener cuestionario completo (195 preguntas organizadas por mundos) + progreso actual

**Query Params**:
```json
{
  "workspace_id": "UUID"
}
```

**Response (200 OK)**:
```json
{
  "workspace_id": "UUID",
  "status": "created|in_progress",
  "questionnaire": {
    "total_questions": 195,
    "worlds": {
      "atzilut": {
        "name": "atzilut",
        "total_questions": 49,
        "questions": [
          {
            "id": "atz_ktr_001",
            "text": "Siento una conexión clara con mi propósito divino...",
            "world": "atzilut",
            "dimension": "Keter",
            "dimension_id": "keter",
            "sefirah": "Corona/Voluntad",
            "reverse_scored": false,
            "weight": 1.0
          }
          // ...48 more questions
        ]
      },
      "briah": { /* 49 questions */ },
      "yetzirah": { /* 49 questions */ },
      "assiah": { /* 48 questions */ }
    }
  },
  "current_progress": {
    "current_world": "atzilut",
    "current_question_index": 0,
    "answered_count": 0,
    "progress_percentage": 0.0,
    "completed_worlds": [],
    "worlds_progress": {
      "atzilut": {"answered": 0, "total": 49},
      "briah": {"answered": 0, "total": 49},
      "yetzirah": {"answered": 0, "total": 49},
      "assiah": {"answered": 0, "total": 48}
    }
  }
}
```

**Permisos**: `executor` o `admin`

---

### B) GET /api/swm/mcmi4/questionnaire/progress
**Propósito**: Consultar progreso actual sin mutar estado

**Query Params**:
```json
{
  "workspace_id": "UUID",
  "session_id": "UUID"  // opcional
}
```

**Response (200 OK)**:
```json
{
  "workspace_id": "UUID",
  "session_id": "UUID",
  "session_status": "active|ended",
  "current_progress": {
    "current_world": "atzilut",
    "current_question_index": 5,
    "answered_count": 5,
    "progress_percentage": 2.56,
    "completed_worlds": [],
    "worlds_progress": {
      "atzilut": {"answered": 5, "total": 49},
      "briah": {"answered": 0, "total": 49},
      "yetzirah": {"answered": 0, "total": 49},
      "assiah": {"answered": 0, "total": 48}
    }
  },
  "responses": {
    "atz_ktr_001": {
      "value": 4,
      "timestamp": "2026-01-17T12:30:45Z",
      "world": "atzilut",
      "dimension": "Keter",
      "sefirah": "Corona/Voluntad"
    }
    // ...4 more responses
  }
}
```

**Permisos**: `executor` o `admin`

---

### C) POST /api/swm/mcmi4/questionnaire/action
**Propósito**: Ejecutar acciones sobre el progreso (save_response o change_world)

#### Acción: save_response
**Request Body**:
```json
{
  "workspace_id": "UUID",
  "session_id": "UUID",
  "action": "save_response",
  "payload": {
    "question_id": "atz_ktr_001",
    "value": 4,  // 1-5 (Likert scale)
    "world": "atzilut"
  }
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "action": "save_response",
  "current_progress": {
    "progress_percentage": 0.51,
    "current_world": "atzilut",
    "current_question_index": 1,
    "world_completed": false,
    "questionnaire_completed": false,
    "total_answered": 1
  },
  "next_question": {
    "id": "atz_ktr_002",
    "text": "Experimento claridad en mis pensamientos...",
    "world": "atzilut",
    "dimension": "Chochmah",
    "sefirah": "Sabiduría",
    "index": 1,
    "total": 195
  }
}
```

#### Acción: change_world
**Request Body**:
```json
{
  "workspace_id": "UUID",
  "session_id": "UUID",
  "action": "change_world",
  "payload": {
    "target_world": "briah"  // atzilut|briah|yetzirah|assiah
  }
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "action": "change_world",
  "current_world": "briah",
  "first_question": {
    "id": "bri_ktr_001",
    "text": "Mis pensamientos fluyen con claridad...",
    "world": "briah",
    "dimension": "Keter",
    "sefirah": "Corona/Voluntad"
  }
}
```

**Validaciones**:
- Navegar hacia atrás: siempre permitido
- Navegar hacia adelante: requiere mundo actual completo (49/49 o 48/48)

**Permisos**: `executor` o `admin`  
**Restricciones**: Workspace `in_progress`, sesión `active`

---

### D) POST /api/swm/mcmi4/questionnaire/seal
**Propósito**: Sellar workspace y crear artifact `questionnaire_completion`

**Request Body**:
```json
{
  "workspace_id": "UUID",
  "session_id": "UUID",  // opcional, busca última sesión activa
  "final_synthesis": {}  // opcional
}
```

**Response (200 OK)**:
```json
{
  "workspace_id": "UUID",
  "status": "sealed",
  "sealed_at": "2026-01-17T14:25:30Z",
  "session_summary": {
    "session_id": "UUID",
    "interactions_count": 195,
    "total_responses": 195
  },
  "completion_artifact_id": "UUID",
  "synthesis_report_id": "UUID"  // si se proporcionó final_synthesis
}
```

**Validaciones**:
- Workspace debe estar en `in_progress`
- 195 respuestas completas (100%)
- Sesión válida (activa o última activa)

**Efectos**:
1. Crea artifact `questionnaire_completion` con todas las respuestas
2. Marca artifacts `questionnaire_config` y `questionnaire_progress` como `sealed=True`
3. Cambia workspace.status → `sealed`
4. Finaliza sesión si está activa
5. Audita acción `workspace_sealed`

**Permisos**: `executor` o `admin`

---

## 🧪 Ejemplo de Uso: Flujo P0 Completo

```bash
# 1. CREATE workspace
POST /api/swm/mcmi4/create
{
  "subject_user_id": 50,
  "mcmi4_source_data_id": "FLOW_TEST_001",
  "config": {},
  "metadata": {"test": true}
}
# → workspace_id: "abc123..."

# 2. GRANT permission
POST /api/swm/mcmi4/grant-permission
{
  "workspace_id": "abc123...",
  "user_id": 25,  # executor
  "permission_type": "executor"
}

# 3. START session
POST /api/swm/mcmi4/start
{
  "workspace_id": "abc123..."
}
# → session_id: "def456...", workspace.status: "in_progress"
# → QuestionnaireService.create_questionnaire_config() called
# → QuestionnaireService.initialize_progress() called

# 4. GET questionnaire
GET /api/swm/mcmi4/questionnaire?workspace_id=abc123...
# → 195 questions, current_progress

# 5. SAVE responses (×195)
POST /api/swm/mcmi4/questionnaire/action
{
  "workspace_id": "abc123...",
  "session_id": "def456...",
  "action": "save_response",
  "payload": {
    "question_id": "atz_ktr_001",
    "value": 4,
    "world": "atzilut"
  }
}
# → next_question, progress_percentage

# 6. CHANGE world (opcional)
POST /api/swm/mcmi4/questionnaire/action
{
  "workspace_id": "abc123...",
  "session_id": "def456...",
  "action": "change_world",
  "payload": {"target_world": "briah"}
}
# → current_world: "briah", first_question

# 7. GET progress (verificación)
GET /api/swm/mcmi4/questionnaire/progress?workspace_id=abc123...&session_id=def456...
# → progress_percentage: 100.0, answered_count: 195

# 8. SEAL workspace
POST /api/swm/mcmi4/questionnaire/seal
{
  "workspace_id": "abc123...",
  "session_id": "def456..."
}
# → status: "sealed", completion_artifact_id

# 9. GET results (legacy endpoint)
GET /api/swm/mcmi4/results?workspace_id=abc123...
# → artifacts, final_synthesis

# 10. AUDIT trail
GET /api/swm/mcmi4/audit?workspace_id=abc123...
# → log completo de acciones
```

---

## 🔒 Restricciones Aplicadas

- ❌ NO usa TestModule, Assignment, ExecuteTestView, UserTestAccess
- ✅ Usa solo: WorkspaceInstance, WorkspaceSession, WorkspaceArtifact, WorkspacePermission
- ✅ Permisos basados en WorkspacePermission (executor/admin)
- ✅ Estado gestionado vía artifacts (questionnaire_config, progress, completion)
- ✅ Auditoría en transiciones clave (config_created, world_changed, workspace_sealed)
- ✅ Sin scoring clínico, solo análisis simbólico
- ❌ No modifica modelos SWM existentes
- ❌ No toca frontend
- ❌ No limpia legacy aún
- ❌ No crea migraciones DB

---

## ✅ Checklist de Cumplimiento

- [x] Serializers completamente tipados
- [x] 4 vistas implementadas con validaciones
- [x] Endpoints responden JSON (nunca HTML)
- [x] Permisos HasWorkspaceExecutorPermission aplicados
- [x] QuestionnaireService integrado en todas las vistas
- [x] Auditoría en acciones clave
- [x] 4 tests DRF básicos implementados
- [x] Código sin errores de import
- [x] Sin side-effects ni prints
- [x] Property `status` añadida a WorkspaceSession para compatibilidad

---

## 🚀 Próximos Pasos (NO ejecutar en esta fase)

**FASE 3 - Frontend Integration** (fuera de scope actual):
- Extender tonyblanco-app/lib/api/swm-mcmi4-api.ts
- Crear componentes React (QuestionnaireContainer, WorldNavigator, QuestionCard, etc.)
- Crear páginas de cuestionario
- Migrar rutas /swm-mcmi4 → /dashboard/therapist/(swm)/mcmi4-mystic

**FASE 4 - Legacy Cleanup** (fuera de scope actual):
- Eliminar componente Mcmi4MysticWorkspace
- Actualizar sidebar terapeuta
- Buscar y remover referencias legacy

---

## 📄 Archivos para Revisión

1. [backend/swm/mcmi4/serializers.py](backend/swm/mcmi4/serializers.py) - Líneas 168-279 (serializers Fase 2)
2. [backend/swm/mcmi4/views.py](backend/swm/mcmi4/views.py) - Líneas 530-1004 (vistas Fase 2)
3. [backend/swm/mcmi4/urls.py](backend/swm/mcmi4/urls.py) - Líneas 29-36 (rutas questionnaire)
4. [backend/swm/mcmi4/models.py](backend/swm/mcmi4/models.py) - Líneas 177-180 (property status)
5. [backend/swm/mcmi4/tests/test_questionnaire_api.py](backend/swm/mcmi4/tests/test_questionnaire_api.py) - 334 líneas (suite completa)

---

**FIN DEL REPORTE FASE 2**
