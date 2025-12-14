# PATIENT DASHBOARD - PHASE 0: DISCOVERY

**Fecha:** 2025-01-14  
**Objetivo:** Inspeccionar endpoints y estructura de datos antes de implementar

---

## 📋 Endpoints a Inspeccionar

### 1. GET /api/me/ - Current User Info

**Ubicación:** `backend/api/views.py` → `CurrentUserView`

**Respuesta actual:**
```python
{
  'id': int,
  'username': str,
  'email': str,
  'first_name': str,
  'full_name': str,  # del profile
  'user_type': str,  # 'patient' | 'therapist' | 'personal' | 'admin'
  'is_admin': bool,
  'subscription_status': str,
  'subscription_plan': str,
  # ... otros campos del profile
}
```

**PREGUNTA CRÍTICA:** ¿Incluye `patient_id` cuando `user_type === 'patient'`?

**Necesito verificar:**
- Si Patient.user apunta al User
- Si el response incluye el ID del Patient asociado
- Cómo obtener el Patient desde el User autenticado

---

### 2. GET /api/tests/patient-previous/ - Assigned Tests

**Ubicación:** `backend/api/test_views.py` → `PatientPreviousTestsView`

**Parámetros:**
- `patient_id` (opcional): number
- `patient_name` (opcional): string
- `patient_birth_date` (opcional): string

**Respuesta:**
```python
{
  'count': int,
  'results': TestResult[]
}
```

**PREGUNTA:** Para un paciente autenticado, ¿cómo obtener sus tests asignados?
- ¿Usa `patient_id` del session?
- ¿Filtra automáticamente por `user.patient_profile`?

---

### 3. POST /api/tests/execute/ - Execute Test

**Ubicación:** `backend/api/test_views.py` → `ExecuteTestView`

**Body requerido:**
```json
{
  "test_module_code": string,
  "input_data": object,
  "patient_id": number?,  // ¿Requerido para patient_self?
  "client_name": string?,
  "client_birth_date": string?,
  "save_result": boolean
}
```

**PREGUNTA:** Cuando un paciente ejecuta `patient_self` test:
- ¿Debe incluir `patient_id`?
- ¿Backend lo infiere del `request.user`?

---

## 🔍 Verificaciones Pendientes

1. **Modelo Patient:**
   - ¿Patient.user es ForeignKey a User?
   - ¿Cómo se relaciona un User con user_type='patient' a un Patient?

2. **CurrentUserView:**
   - ¿Incluye `patient_id` en la respuesta?
   - ¿Incluye referencia al therapist?

3. **Tests asignados:**
   - ¿Hay endpoint específico para obtener tests asignados a un usuario?
   - ¿O se usa `patient-previous` con `patient_id`?

4. **Ejecución de tests:**
   - ¿Un paciente puede ejecutar sin `patient_id` en el body?
   - ¿Backend infiere `patient_id` del `user.patient_profile.id`?

---

## ⚠️ CHECKPOINT

**NO CODIFICAR hasta confirmar:**
- Estructura exacta de respuesta de `/api/me/` para pacientes
- Cómo obtener `patient_id` desde el session
- Cómo obtener tests asignados para el paciente autenticado
- Cómo ejecutar tests como paciente (si requiere `patient_id` o no)

---

---

## ✅ HALLAZGOS CONFIRMADOS

### 1. GET /api/me/ - Current User

**Respuesta actual NO incluye `patient_id` directamente**, pero:
- Si `user_type === 'patient'`, existe relación inversa: `user.patient_profile` (Patient)
- Para obtener `patient_id`: `user.patient_profile.id` (si existe)

**Acción necesaria:** 
- Modificar `CurrentUserView` para incluir `patient_id` cuando es paciente
- O obtenerlo en frontend desde `user.patient_profile.id`

### 2. Tests Asignados

**NO hay endpoint específico para "tests asignados"**, pero:
- `GET /api/tests/` ya devuelve todos los tests con `user_access` por cada test
- `user_access.has_special_access === true` indica que el test está asignado
- `user_access.can_use_test()` indica si puede ejecutarlo ahora

**Endpoint a usar:** `GET /api/tests/` y filtrar por `user_access.has_special_access === true`

### 3. Ejecutar Test

**Para pacientes ejecutando `patient_self`:**
- `POST /api/tests/execute/` con `test_module_code` e `input_data`
- **NO debe incluir `patient_id`** (backend lo valida: `validate_patient_self_context()`)
- Backend infiere execution_mode como `patient_self` cuando no hay `patient_id`

### 4. Resultados

**Ya existe y funciona:**
- `GET /api/tests/results/` filtra automáticamente por `user=request.user` para pacientes
- Solo muestra resultados propios

---

## 🎯 DECISIONES DE IMPLEMENTACIÓN

1. **Obtener `patient_id`:**
   - Modificar `CurrentUserView` para incluir `patient_id` cuando `user_type='patient'`
   - O crear helper en frontend: `getPatientIdFromUser(user)`

2. **Tests asignados:**
   - Usar `GET /api/tests/` 
   - Filtrar tests donde `test.user_access?.has_special_access === true`
   - Mostrar solo tests con `available_for_personal === true`

3. **Ejecutar test:**
   - NO incluir `patient_id` en el body
   - Backend maneja correctamente el execution_mode

4. **Resultados:**
   - Usar `GET /api/tests/results/` (ya filtra correctamente)

---

**SIGUIENTE PASO:** Comenzar PHASE 1 - ROUTE & ACCESS CONTROL
