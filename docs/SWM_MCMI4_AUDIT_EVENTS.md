# SWM MCMI-4 MÍSTICO — AUDIT EVENTS SPECIFICATION

**Versión:** 1.0  
**Fecha:** 2026-01-17  
**Estado:** Frozen (Post-Hardening Fase 2)  
**Categoría:** Specialized Workspace Module (SWM)

---

## 1. PROPÓSITO

Este documento especifica todos los eventos de auditoría registrados en `WorkspaceAuditLog` por el sistema SWM MCMI-4 Místico. Cada evento queda registrado de forma inmutable para trazabilidad completa de operaciones sensibles.

---

## 2. EVENTOS DE CICLO DE VIDA (WORKSPACE)

### 2.1 `workspace_created`
**Trigger:** Usuario crea nuevo workspace  
**Endpoint:** `POST /api/swm/mcmi4/create`  
**Registrado en:** `workspace_service.py` → `WorkspaceService.create_workspace()`  
**Frecuencia:** 1 vez por workspace  

**Detalles capturados:**
```json
{
  "subject_user_id": "uuid",
  "mcmi4_source_data_id": "uuid",
  "config": {...},
  "metadata": {...}
}
```

**Context adicional:**
- `ip_address`: IP del creador
- `user_id`: Usuario que crea el workspace
- `workspace_instance_id`: ID del workspace creado

---

### 2.2 `workspace_started`
**Trigger:** Workspace transiciona de `created` a `in_progress`  
**Endpoint:** `POST /api/swm/mcmi4/start` (implícito al iniciar sesión)  
**Registrado en:** `workspace_service.py` → `WorkspaceService.transition_to_in_progress()`  
**Frecuencia:** 1 vez por workspace (primera sesión)

**Detalles capturados:**
```json
{
  "previous_status": "created",
  "new_status": "in_progress",
  "started_at": "ISO 8601 timestamp"
}
```

---

### 2.3 `workspace_sealed`
**Trigger:** Workspace se sella (status → `sealed`)  
**Endpoint:** `POST /api/swm/mcmi4/seal`  
**Registrado en:** `workspace_service.py` → `WorkspaceService.seal_workspace()`  
**Frecuencia:** 1 vez por workspace

**Detalles capturados:**
```json
{
  "previous_status": "in_progress",
  "new_status": "sealed",
  "sealed_at": "ISO 8601 timestamp",
  "sealed_by_user_id": "uuid",
  "artifacts_sealed_count": 7
}
```

**Nota:** Este evento es **crítico** para auditoría de integridad. Una vez sellado, ningún artefacto puede modificarse.

---

## 3. EVENTOS DE SESIÓN

### 3.1 `session_started`
**Trigger:** Ejecutor inicia sesión activa en workspace  
**Endpoint:** `POST /api/swm/mcmi4/start`  
**Registrado en:** `session_service.py` → `SessionService.start_session()`  
**Frecuencia:** 1 vez por sesión (puede haber múltiples sesiones históricas)

**Detalles capturados:**
```json
{
  "session_id": "uuid",
  "executor_user_id": "uuid",
  "workspace_status": "in_progress",
  "started_at": "ISO 8601 timestamp"
}
```

---

### 3.2 `session_ended`
**Trigger:** Sesión activa se cierra  
**Endpoint:** `POST /api/swm/mcmi4/close-session` o implícito en `seal`  
**Registrado en:** `session_service.py` → `SessionService.end_session()`  
**Frecuencia:** 1 vez por sesión

**Detalles capturados:**
```json
{
  "session_id": "uuid",
  "duration_seconds": 3600,
  "interactions_count": 87,
  "artifacts_generated": 12,
  "ended_at": "ISO 8601 timestamp"
}
```

---

### 3.3 `phase_advanced`
**Trigger:** Ejecutor avanza de fase interpretativa  
**Endpoint:** `POST /api/swm/mcmi4/progress` (action=`advance_phase`)  
**Registrado en:** `session_service.py` → `SessionService.record_progress()`  
**Frecuencia:** Típicamente 3-4 veces por sesión (discovery → mapping → interpretation → synthesis)

**Detalles capturados:**
```json
{
  "session_id": "uuid",
  "previous_phase": "discovery",
  "new_phase": "mapping",
  "phase_index": 1
}
```

---

## 4. EVENTOS DE DECISIÓN Y ARTEFACTOS

### 4.1 `decision_recorded`
**Trigger:** Ejecutor registra decisión interpretativa  
**Endpoint:** `POST /api/swm/mcmi4/progress` (action=`record_decision`)  
**Registrado en:** `session_service.py` → `SessionService.record_progress()`  
**Frecuencia:** Variable (dependiente de proceso interpretativo)

**Detalles capturados:**
```json
{
  "session_id": "uuid",
  "decision_type": "hypothesis | mapping_choice | etc.",
  "decision_summary": "string"
}
```

---

### 4.2 `artifact_generated`
**Trigger:** Sistema o usuario genera artefacto (mapa, narrativa, etc.)  
**Endpoint:** `POST /api/swm/mcmi4/progress` (action=`generate_artifact`)  
**Registrado en:** `session_service.py` → `SessionService.record_progress()`  
**Frecuencia:** Variable (típicamente 5-15 artefactos por sesión)

**Detalles capturados:**
```json
{
  "session_id": "uuid",
  "artifact_id": "uuid",
  "artifact_type": "symbolic_map | narrative | hypothesis | synthesis_report",
  "generated_at": "ISO 8601 timestamp"
}
```

---

## 5. EVENTOS DE CUESTIONARIO (MCMI-4)

### 5.1 `questionnaire_config_created`
**Trigger:** Sistema genera configuración de cuestionario (selección de 195 preguntas)  
**Endpoint:** `POST /api/swm/mcmi4/start` (implícito)  
**Registrado en:** `questionnaire_service.py` → `QuestionnaireService.create_questionnaire_config()`  
**Frecuencia:** 1 vez por workspace

**Detalles capturados:**
```json
{
  "workspace_id": "uuid",
  "total_questions": 195,
  "worlds_distribution": {
    "atzilut": 49,
    "briah": 49,
    "yetzirah": 49,
    "assiah": 48
  },
  "config_artifact_id": "uuid"
}
```

---

### 5.2 `questionnaire_loaded`
**Trigger:** Ejecutor carga cuestionario para responder  
**Endpoint:** `GET /api/swm/mcmi4/questionnaire`  
**Registrado en:** `views.py` → `QuestionnaireView.get()`  
**Frecuencia:** Múltiples veces (cada vez que se abre el cuestionario)

**Detalles capturados:**
```json
{
  "workspace_id": "uuid",
  "workspace_status": "created | in_progress",
  "loaded_at": "ISO 8601 timestamp"
}
```

**Nota:** Este evento NO se registra por cada respuesta individual (ver `response_batch_saved`).

---

### 5.3 `response_batch_saved`
**Trigger:** Sistema guarda lote de respuestas (cada 10 respuestas)  
**Endpoint:** `POST /api/swm/mcmi4/questionnaire/action` (action=`save_response`)  
**Registrado en:** `views.py` → `ProgressActionView.post()` → `_handle_save_response()`  
**Frecuencia:** **Cada 10 respuestas** (batch logging para reducir ruido)

**Detalles capturados:**
```json
{
  "session_id": "uuid",
  "total_responses": 50,
  "progress_percentage": 25.64
}
```

**Política de Logging:**
- NO se registra cada respuesta individual (evitar 195 logs por workspace)
- Se registra en múltiplos de 10: respuestas 10, 20, 30, ..., 190
- Última respuesta (195) se registra en `questionnaire_sealed`

---

### 5.4 `questionnaire_sealed`
**Trigger:** Cuestionario se sella tras completar 195 respuestas  
**Endpoint:** `POST /api/swm/mcmi4/questionnaire/seal`  
**Registrado en:** `views.py` → `SealQuestionnaireView.post()`  
**Frecuencia:** 1 vez por workspace

**Detalles capturados:**
```json
{
  "workspace_id": "uuid",
  "session_id": "uuid",
  "total_responses": 195,
  "completion_artifact_id": "uuid",
  "sealed_at": "ISO 8601 timestamp"
}
```

**Efectos colaterales:**
- Workspace transiciona a `sealed`
- Todos los artefactos se marcan `is_sealed = true`
- Sesión activa se finaliza

---

## 6. POLÍTICA DE AUDITORÍA

### 6.1 Principios de Logging

1. **Inmutabilidad:** Todos los logs son append-only (no se modifican ni borran)
2. **Atomicidad:** Logs se registran en la misma transacción que la operación principal
3. **No-Noise:** Solo eventos significativos (no cada GET, no cada respuesta individual)
4. **Context completo:** IP, user_id, timestamps, request_id cuando disponible

### 6.2 Frecuencias de Logging

| Tipo de Evento | Frecuencia | Política |
|----------------|------------|----------|
| Ciclo de vida workspace | 1 vez por transición | Siempre registrado |
| Sesiones | 1 vez por sesión (start/end) | Siempre registrado |
| Fases | 1 vez por avance de fase | Siempre registrado |
| Decisiones | Variable | Solo decisiones significativas |
| Artefactos | 1 vez por artefacto | Siempre registrado |
| Cuestionario config | 1 vez por workspace | Siempre registrado |
| Respuestas | **Batch cada 10** | Política anti-ruido |
| Seal cuestionario | 1 vez por workspace | Siempre registrado |

### 6.3 Retención de Logs

- **Producción:** Retención indefinida (compliance)
- **Staging:** 90 días
- **Development:** 30 días

---

## 7. CONSULTA DE LOGS

### 7.1 Endpoint de Auditoría

`GET /api/swm/mcmi4/audit`

**Query Parameters:**
- `workspace_id` (required): UUID del workspace
- `action` (optional): Filtrar por tipo de evento
- `user_id` (optional): Filtrar por usuario
- `from_date` (optional): ISO 8601 timestamp
- `to_date` (optional): ISO 8601 timestamp

**Response:**
```json
{
  "audit_logs": [
    {
      "id": "uuid",
      "workspace_instance_id": "uuid",
      "session_id": "uuid | null",
      "user_id": "uuid",
      "action": "workspace_created",
      "details": {...},
      "timestamp": "ISO 8601 timestamp",
      "ip_address": "192.168.1.1"
    }
  ],
  "total_count": 47,
  "page": 1,
  "page_size": 20
}
```

### 7.2 Permisos de Consulta

- **Admin global:** Acceso completo a todos los logs
- **Workspace owner:** Acceso a logs de sus workspaces
- **Reviewer:** Acceso a logs de workspaces con permiso `reviewer`
- **Observer:** Solo lectura de logs no-sensibles (excluyendo IPs, detalles completos)

---

## 8. COMPLIANCE Y SEGURIDAD

### 8.1 Datos Sensibles

**NO registrar en logs:**
- Respuestas MCMI-4 individuales (contenido clínico)
- Tokens de autenticación
- Contraseñas o credenciales
- PII innecesario (nombres completos, emails solo en metadata si estrictamente necesario)

**Registrar solo:**
- UUIDs de usuarios (no nombres)
- Timestamps
- Actions/eventos
- IPs (para seguridad)

### 8.2 Alertas de Seguridad

Eventos que disparan alertas automáticas:
- Múltiples intentos de acceso no autorizado (PERMISSION_DENIED > 5 en 1 minuto)
- Intentos de modificar workspace sellado
- Revocaciones masivas de permisos (> 10 en 1 hora)

---

**FIN DE AUDIT EVENTS SPECIFICATION**  
Este documento define la política completa de auditoría del SWM MCMI-4 Místico post-hardening Fase 2.
