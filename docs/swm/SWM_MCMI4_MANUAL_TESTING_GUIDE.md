# MCMI-4 MÍSTICO SWM - TESTING MANUAL

**Objetivo**: Verificar el funcionamiento end-to-end del módulo SWM MCMI-4 Místico

---

## 🔧 SETUP PREVIO

### 1. Backend Preparación

```powershell
# Iniciar backend Django
cd d:\analisis_cabalistico_alma
.\start-backend.ps1

# O manualmente:
cd backend
python manage.py runserver 8000
```

Verificar que backend responde:
```
http://localhost:8000/api/
```

### 2. Frontend Preparación

```powershell
# Iniciar frontend Next.js
cd d:\analisis_cabalistico_alma\tonyblanco-app
npm run dev

# O usar script:
cd d:\analisis_cabalistico_alma
.\start-frontend.ps1
```

Verificar que frontend responde:
```
http://localhost:3000
```

### 3. Obtener Token de Autenticación

**Opción A: Login desde Frontend**
```
1. Ir a http://localhost:3000/login
2. Login con usuario existente (therapist o admin)
3. Abrir DevTools → Application → LocalStorage
4. Copiar valor de 'authToken'
```

**Opción B: Login desde API**
```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "therapist1", "password": "YOUR_PASSWORD"}'
  
# Response incluye: {"token": "abc123..."}
```

---

## 🧪 FLUJO DE TESTING COMPLETO

### Test 1: Crear Workspace

**Endpoint**: `POST /api/swm/mcmi4/create`

**Request**:
```json
{
  "subject_user_id": "UUID_DEL_PACIENTE",
  "mcmi4_source_data_id": "MCMI4_2025_001",
  "config": {},
  "metadata": {
    "test_source": "manual_testing",
    "notes": "Primer workspace de prueba"
  }
}
```

**Headers**:
```
Authorization: Token YOUR_AUTH_TOKEN
Content-Type: application/json
```

**Comando cURL**:
```bash
curl -X POST http://localhost:8000/api/swm/mcmi4/create \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject_user_id": "PATIENT_UUID",
    "mcmi4_source_data_id": "MCMI4_TEST_001",
    "config": {},
    "metadata": {"test": true}
  }'
```

**Validaciones**:
- ✅ Status 201 Created
- ✅ Response incluye `workspace_id`
- ✅ Response.status = "created"
- ✅ Response.creator_user_id = tu user UUID
- ✅ Response.subject_user_id = UUID del paciente

**Guardar**: `workspace_id` para siguientes tests

---

### Test 2: Listar Workspaces

**Endpoint**: `GET /api/swm/mcmi4/list`

**Request**:
```
GET /api/swm/mcmi4/list?status=created
```

**Validaciones**:
- ✅ Status 200 OK
- ✅ Response.workspaces es array
- ✅ workspace_id del Test 1 aparece en lista

---

### Test 3: Obtener Status de Workspace

**Endpoint**: `GET /api/swm/mcmi4/status`

**Request**:
```
GET /api/swm/mcmi4/status?workspace_id=WORKSPACE_ID
```

**Validaciones**:
- ✅ Status 200 OK
- ✅ Response.status = "created"
- ✅ Response.active_session = null (aún no hay sesión)
- ✅ Response.permissions incluye creator con admin implícito
- ✅ Response.artifacts_count todos en 0

---

### Test 4: Grant Executor Permission

**Endpoint**: `POST /api/swm/mcmi4/grant-permission`

**Request**:
```json
{
  "workspace_id": "WORKSPACE_ID",
  "user_id": "YOUR_USER_ID",
  "permission_type": "executor"
}
```

**Validaciones**:
- ✅ Status 201 Created (si es nuevo) o 200 OK (si reactivó)
- ✅ Response.permission_id retornado

**Nota**: Si eres el creator_user, ya tienes admin implícito. Puedes grantear executor a ti mismo para testing.

---

### Test 5: Iniciar Sesión

**Endpoint**: `POST /api/swm/mcmi4/start`

**Request**:
```json
{
  "workspace_id": "WORKSPACE_ID"
}
```

**Validaciones**:
- ✅ Status 201 Created
- ✅ Response.session_id retornado
- ✅ Response.current_phase = "initial_review"
- ✅ Response.session_state es objeto JSON
- ✅ Verificar GET /status: workspace.status = "in_progress"
- ✅ Verificar GET /status: active_session no es null

**Guardar**: `session_id` para siguientes tests

---

### Test 6: Registrar Decisión (Progress)

**Endpoint**: `POST /api/swm/mcmi4/progress`

**Request**:
```json
{
  "workspace_id": "WORKSPACE_ID",
  "session_id": "SESSION_ID",
  "action": "record_decision",
  "payload": {
    "decision": "Paciente muestra elevación en escala 8B (Pasivo-Agresivo). Interpretar en contexto cabalístico de polaridad Marte-Venus."
  }
}
```

**Validaciones**:
- ✅ Status 200 OK
- ✅ Response.artifact_created retorna UUID de artifact
- ✅ Response.interactions_count incrementó
- ✅ Verificar GET /artifacts: artifact_type = "decision_log"

---

### Test 7: Avanzar Fase (Progress)

**Endpoint**: `POST /api/swm/mcmi4/progress`

**Request**:
```json
{
  "workspace_id": "WORKSPACE_ID",
  "session_id": "SESSION_ID",
  "action": "advance_phase",
  "payload": {
    "new_phase": "interpretive_work"
  }
}
```

**Validaciones**:
- ✅ Status 200 OK
- ✅ Response.current_phase = "interpretive_work"
- ✅ Verificar GET /status: active_session.current_phase actualizado

---

### Test 8: Generar Artifact (Progress)

**Endpoint**: `POST /api/swm/mcmi4/progress`

**Request**:
```json
{
  "workspace_id": "WORKSPACE_ID",
  "session_id": "SESSION_ID",
  "action": "generate_artifact",
  "payload": {
    "artifact_type": "interpretation_note",
    "content": {
      "note": "Análisis de Sefirot: Paciente presenta desbalance en Netzaj (Victoria/Marte). Recomendar trabajo con energía Hod (Gloria/Mercurio) para equilibrio.",
      "sefira_analysis": {
        "netzaj": "elevated",
        "hod": "deficient"
      }
    }
  }
}
```

**Validaciones**:
- ✅ Status 200 OK
- ✅ Response.artifact_created retorna UUID
- ✅ Verificar GET /artifacts: nuevo artifact con tipo "interpretation_note"

---

### Test 9: Sellar Workspace

**Endpoint**: `POST /api/swm/mcmi4/seal`

**Request**:
```json
{
  "workspace_id": "WORKSPACE_ID",
  "session_id": "SESSION_ID",
  "final_synthesis": {
    "synthesis": "Síntesis cabalística completa del perfil MCMI-4",
    "sefirotic_balance": {
      "keter": "aligned",
      "hokhmah": "neutral",
      "binah": "elevated",
      "hesed": "neutral",
      "gevurah": "deficient",
      "tiferet": "aligned",
      "netzaj": "elevated",
      "hod": "deficient",
      "yesod": "neutral",
      "malkuth": "grounded"
    },
    "therapeutic_recommendations": [
      "Trabajo con energía Gevurah para balance emocional",
      "Integración Hod-Netzaj mediante prácticas de auto-observación",
      "Exploración de patrones transgeneracionales en eje Binah-Hokhmah"
    ],
    "mystical_interpretation": "El alma del sujeto transita un camino de polarización Netzaj con déficit Hod. Indicado trabajo con Pilar Derecho del Árbol de la Vida."
  }
}
```

**Validaciones**:
- ✅ Status 200 OK
- ✅ Response.status = "sealed"
- ✅ Response.sealed_at tiene timestamp
- ✅ Response.synthesis_report_id retorna UUID
- ✅ Verificar GET /status: workspace.status = "sealed"
- ✅ Verificar GET /status: active_session = null (sesión finalizada)
- ✅ Verificar GET /artifacts: todos los artifacts tienen is_sealed = true

---

### Test 10: Ver Resultados

**Endpoint**: `GET /api/swm/mcmi4/results`

**Request**:
```
GET /api/swm/mcmi4/results?workspace_id=WORKSPACE_ID
```

**Validaciones**:
- ✅ Status 200 OK
- ✅ Response.status = "sealed"
- ✅ Response.final_synthesis contiene objeto completo del Test 9
- ✅ Response.artifacts es array con todos los artifacts generados
- ✅ Response.sealed_at tiene timestamp

---

### Test 11: Ver Audit Trail

**Endpoint**: `GET /api/swm/mcmi4/audit`

**Request**:
```
GET /api/swm/mcmi4/audit?workspace_id=WORKSPACE_ID&limit=50
```

**Validaciones**:
- ✅ Status 200 OK
- ✅ Response.audit_trail es array con entradas:
  - workspace_created
  - permission_granted (si hiciste Test 4)
  - session_started
  - phase_advanced
  - decision_recorded
  - artifact_generated
  - workspace_sealed
- ✅ Cada entry tiene: id, action, timestamp, user_id, details

---

## 🎨 TESTING FRONTEND

### Test F1: Ver Lista de Workspaces

1. Navegar a: `http://localhost:3000/swm-mcmi4`
2. Verificar que aparece workspace creado en Test 1
3. Verificar badge de status ("Creado", "En Progreso", "Sellado")
4. Probar filtros de status

### Test F2: Abrir Workspace Individual

1. Click en botón "Abrir Sesión" del workspace creado
2. Navegar a: `http://localhost:3000/swm-mcmi4/WORKSPACE_ID`
3. Verificar SessionControl muestra botón "Iniciar Sesión"
4. Click en "Iniciar Sesión"
5. Verificar que SessionControl cambia a "Sesión Activa"
6. Verificar fase actual ("Revisión Inicial")

### Test F3: Registrar Decisión desde Frontend

1. Click en botón "Registrar Decisión"
2. Ingresar texto de decisión en prompt
3. Verificar que ArtifactViewer muestra nuevo artifact
4. Verificar contador de interacciones incrementó

### Test F4: Avanzar Fase desde Frontend

1. Click en botón "Avanzar a Trabajo Interpretativo"
2. Verificar que SessionControl muestra nueva fase
3. Repetir para avanzar a "Síntesis" y "Revisión Final"

### Test F5: Sellar Workspace desde Frontend

1. Click en botón "Sellar Workspace"
2. Confirmar diálogo
3. Ingresar síntesis final (JSON o texto)
4. Verificar redirección a página de resultados

### Test F6: Ver Resultados desde Frontend

1. Navegar a: `http://localhost:3000/swm-mcmi4/WORKSPACE_ID/results`
2. Verificar síntesis final se muestra
3. Verificar lista de artifacts completa
4. Probar botón "Exportar JSON" (descarga archivo)
5. Probar botón "Imprimir Reporte" (abre print dialog)

---

## ❌ TESTS NEGATIVOS (Validar Errores)

### N1: Crear Workspace con Datos Inválidos

**Test**: Creator = Subject (mismo usuario)
```json
{
  "subject_user_id": "YOUR_OWN_USER_ID",
  "mcmi4_source_data_id": "TEST"
}
```
**Esperado**: 400 Bad Request con mensaje "Creator and subject cannot be the same user"

---

### N2: Iniciar Sesión sin Permission

1. Crear workspace con subject_user diferente
2. NO grantear executor permission
3. Intentar POST /start
**Esperado**: 403 Forbidden

---

### N3: Crear Segunda Sesión Activa

1. Iniciar sesión en workspace
2. Intentar POST /start nuevamente sin finalizar primera
**Esperado**: 400 Bad Request con mensaje "already has an active session"

---

### N4: Avanzar Fase en Workspace Sellado

1. Sellar workspace
2. Intentar POST /progress con action="advance_phase"
**Esperado**: 400 Bad Request con mensaje "Session X is not active"

---

### N5: Ver Resultados de Workspace No Sellado

1. Crear workspace (status="created")
2. GET /results?workspace_id=X
**Esperado**: 400 Bad Request con mensaje "Results not available for workspace in status created"

---

## 📊 CHECKLIST DE VALIDACIÓN

### Backend
- [ ] Workspace creado correctamente (Test 1)
- [ ] Workspace listado con filtros (Test 2)
- [ ] Status retorna datos completos (Test 3)
- [ ] Permisos se pueden grantear (Test 4)
- [ ] Sesión inicia correctamente (Test 5)
- [ ] Decisiones se registran (Test 6)
- [ ] Fases avanzan (Test 7)
- [ ] Artifacts se generan (Test 8)
- [ ] Workspace se sella (Test 9)
- [ ] Resultados se obtienen (Test 10)
- [ ] Audit trail completo (Test 11)

### Frontend
- [ ] Lista de workspaces funciona (Test F1)
- [ ] Navegación a workspace individual (Test F2)
- [ ] Control de sesión funciona (Test F3-F4)
- [ ] Sellar desde UI (Test F5)
- [ ] Resultados se muestran (Test F6)

### Validaciones Negativas
- [ ] Validaciones de permisos (N1-N2)
- [ ] Constraint de sesión única (N3)
- [ ] FSM previene acciones inválidas (N4)
- [ ] Resultados solo en workspaces sellados (N5)

---

## 🐛 DEBUGGING

### Ver Logs Backend

```bash
# Terminal donde corre Django
# Verás outputs de:
# - SQL queries
# - AuditService.log_action()
# - Errores de validación
```

### Ver Network Requests Frontend

```
Chrome DevTools → Network tab
Filtrar por: "mcmi4"
Revisar:
- Request Headers (Authorization token)
- Request Payload (JSON enviado)
- Response (status code + body)
```

### Consultar DB Directamente

```bash
cd d:\analisis_cabalistico_alma\backend
python manage.py dbshell

# SQLite commands:
.tables
SELECT * FROM swm_mcmi4_workspaceinstance;
SELECT * FROM swm_mcmi4_workspacesession WHERE is_active = 1;
SELECT * FROM swm_mcmi4_workspaceauditlog ORDER BY timestamp DESC LIMIT 10;
```

---

## 📝 NOTAS FINALES

- **User IDs**: Usar UUIDs reales de usuarios existentes en DB
- **Auth Token**: Obtener token válido antes de testing
- **Workspace ID**: Guardar ID retornado en Test 1 para reusar en otros tests
- **Session ID**: Guardar ID retornado en Test 5 para progress/seal

**Última actualización**: 2025-01-12
