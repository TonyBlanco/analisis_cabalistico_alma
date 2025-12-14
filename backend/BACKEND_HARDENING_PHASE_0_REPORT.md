# FASE 0 - ORIENTATION REPORT
## Backend Hardening - Test Execution Security

---

## 📋 ENDPOINTS IDENTIFICADOS

### 1. TEST EXECUTION ENDPOINTS
**Archivo:** `backend/api/test_views.py`

#### `POST /api/tests/execute/`
- **Vista:** `ExecuteTestView.post()` (línea 205)
- **Clase:** `ExecuteTestView` (línea 72)
- **Permisos:** `IsAuthenticated`
- **Lógica actual:**
  - Infiere `execution_mode` mediante `_infer_execution_mode()` (línea 76)
  - Valida modo con `_validate_execution_mode()` (línea 101)
  - Valida rol con `_validate_role()` (línea 126)
  - Valida propiedad paciente con `_validate_therapist_patient_ownership()` (línea 177)
  - Ya tiene validaciones básicas implementadas, pero pueden necesitar refuerzo

#### `POST /api/tests/submit/`
- **Vista:** `ProcessTestSubmissionView.post()` (línea 744)
- **Clase:** `ProcessTestSubmissionView` (línea 737)
- **Permisos:** `AllowAny` ⚠️ (permite acceso sin autenticación)
- **Nota:** Este endpoint NO valida roles ni execution_mode actualmente
- **Ubicación URL:** Definido en `backend/api/urls.py` línea 173

---

### 2. TEST LISTING ENDPOINTS

#### `GET /api/tests/`
- **Vista:** `AvailableTestsView.get()` (línea 24)
- **Clase:** `AvailableTestsView` (línea 20)
- **Permisos:** `IsAuthenticated`
- **Lógica actual:**
  - Filtra por `user_type`: therapist → `available_for_therapists`, otros → `available_for_personal`
  - NO filtra por execution_mode explícitamente

#### `GET /api/tests/{code}/`
- **Vista:** `TestModuleDetailView.get()` (línea 54)
- **Clase:** `TestModuleDetailView` (línea 50)
- **Permisos:** `IsAuthenticated`
- **Lógica actual:**
  - Verifica acceso con `test_module.is_available_for_user(request.user)`
  - NO valida execution_mode

---

### 3. TEST RESULTS ENDPOINTS

#### `GET /api/tests/results/`
- **Vista:** `TestResultsView.get()` (línea 501)
- **Clase:** `TestResultsView` (línea 497)
- **Permisos:** `IsAuthenticated`
- **Lógica actual:**
  - Filtra solo por `user=request.user`
  - NO considera ownership de pacientes para terapeutas
  - NO diferencia entre execution_modes

#### `GET /api/tests/results/{id}/`
- **Vista:** `TestResultDetailView.get()` (línea 535)
- **Clase:** `TestResultDetailView` (línea 531)
- **Permisos:** `IsAuthenticated`
- **Lógica actual:**
  - Filtra solo por `user=request.user`
  - NO considera ownership de pacientes para terapeutas

---

## 🔍 EXECUTION MODE RESOLUTION

### Dónde se resuelve
**Archivo:** `backend/api/test_views.py`
**Función:** `ExecuteTestView._infer_execution_mode()` (línea 76)

### Lógica actual:
1. Si `available_for_therapists=True` y `available_for_personal=False` → `therapist_clinical`
2. Si `available_for_personal=True` y `available_for_therapists=False` → `patient_self`
3. Si ambos `True`:
   - Si hay `patient_id` en request → `therapist_clinical`
   - Si no → `patient_self`
4. Fallback: Si usuario es therapist y hay `patient_id` → `therapist_clinical`, sino `patient_self`

### Validación actual:
- `_validate_execution_mode()`: Valida coherencia entre modo inferido y contexto (patient_id)
- `_validate_role()`: Valida que el rol del usuario permita el modo
- `_validate_therapist_patient_ownership()`: Valida ownership y auto-evaluación

---

## 👤 USER ROLE READING

### Cómo se lee
**Modelo:** `UserProfile.user_type` (definido en `backend/api/models.py` línea 26)
**Valores posibles:** `'personal'`, `'therapist'`, `'patient'` (según migraciones)

### Acceso en vistas:
```python
profile = request.user.profile
user_type = profile.user_type
```

### Verificación de admin:
```python
profile.is_admin  # Campo boolean
# O también:
request.user.is_staff
request.user.is_superuser
```

---

## 🔗 PATIENT OWNERSHIP REPRESENTATION

### Modelo Patient
**Archivo:** `backend/api/models.py` línea 188

### Relaciones clave:
```python
class Patient(models.Model):
    therapist = models.ForeignKey(
        User, 
        related_name='patients',
        limit_choices_to={'profile__user_type': 'therapist'}
    )
    user = models.ForeignKey(
        User,
        related_name='patient_profile',
        null=True,
        blank=True
    )
```

### Validación actual:
**Archivo:** `backend/api/test_views.py`
**Función:** `ExecuteTestView._validate_therapist_patient_ownership()` (línea 177)

### Lógica:
- Busca: `Patient.objects.get(id=patient_id, therapist=therapist_user)`
- Valida que `patient.user != therapist_user` (no auto-evaluación)
- Retorna error 403 si paciente no existe o no pertenece al terapeuta

---

## 📊 RESUMEN DE ESTADO ACTUAL

### ✅ Fortalezas:
1. `ExecuteTestView` ya tiene validaciones básicas implementadas
2. Ownership está parcialmente validado en ejecución
3. Auto-evaluación está bloqueada

### ⚠️ Gaps identificados:
1. **`ProcessTestSubmissionView`** permite `AllowAny` - NO tiene validaciones de rol/execution_mode
2. **Listados** no filtran por execution_mode
3. **Resultados** no consideran ownership de pacientes para terapeutas
4. **Admin** puede ejecutar therapist_clinical según código actual (línea 157 valida solo `user_type != 'therapist'`)
5. Validaciones están mezcladas en la vista, no son reutilizables

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
backend/
├── api/
│   ├── models.py              # UserProfile, Patient, TestModule, TestResult
│   ├── test_models.py         # TestModule, TestResult, UserTestAccess
│   ├── test_views.py          # ExecuteTestView, TestResultsView, etc.
│   ├── urls.py                # Routing
│   └── serializers.py         # TestExecutionSerializer, etc.
```

---

## 🎯 PRÓXIMOS PASOS (FASE 1)

1. Crear `api/validators/test_execution.py` con funciones puras de validación
2. Extraer lógica de validación de `ExecuteTestView` a helpers reutilizables
3. Asegurar que las validaciones sean exhaustivas según reglas globales

---

**Estado:** ✅ FASE 0 COMPLETA - LISTO PARA FASE 1
**Fecha:** $(date)

