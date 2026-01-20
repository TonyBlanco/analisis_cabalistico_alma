# Estructura de Base de Datos - MCMI-4-Mystic SWM

## Diagrama Relacional

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Django Auth System                              │
├─────────────────────────────────────────────────────────────────────┤
│ User (Django built-in)                                             │
│  ├─ id (PK)                                                        │
│  ├─ username (unique)                                              │
│  ├─ email                                                          │
│  ├─ password                                                       │
│  ├─ is_staff                                                       │
│  ├─ is_superuser                                                   │
│  └─ is_active                                                      │
└─────────────────────────────────────────────────────────────────────┘
         │                    │                      │
         ├──── OneToOne ──────┐                      │
         │                    ▼                      │
         │          ┌──────────────────┐             │
         │          │ UserProfile      │             │
         │          ├──────────────────┤             │
         │          │ id (PK)          │             │
         │          │ user (FK)        │             │
         │          │ user_type        │◄─── Types:  │
         │          │ full_name        │  - therapist│
         │          │ subscription_plan│  - patient  │
         │          │ membership_active│  - personal │
         │          │ is_admin         │  - visitor  │
         │          └──────────────────┘             │
         │                                            │
         │                 ┌──────────────────────────┘
         │                 │ (FK therapist)
         │                 ▼
         │          ┌──────────────────┐
         │          │ Patient          │
         │          ├──────────────────┤
         │          │ id (PK)          │
         │          │ user (FK) ◄──────┼──── (optional: patient user)
         │          │ therapist (FK) ──┘     (required: therapist user)
         │          │ first_name       │
         │          │ last_name        │
         │          │ email            │
         │          │ birth_date       │
         │          │ birth_time       │
         │          │ birth_latitude   │
         │          │ birth_longitude  │
         │          │ birth_timezone   │
         │          │ full_name        │
         │          │ hebrew_name      │
         │          │ main_complaint   │
         │          │ clinical_history │
         │          │ treatment_plan   │
         │          │ is_active        │
         │          └──────────────────┘
         │                 │
         │                 │ (FK patient + assigned_to_user)
         │                 ▼
         │          ┌──────────────────────┐
         │          │ Assignment (SWM)     │
         │          ├──────────────────────┤
         │          │ id (PK)              │
         │          │ patient (FK) ────────┼─ Patient who takes the test
         │          │ test_type (CharField)│   (e.g., "mcmi4-mystic")
         │          │ assigned_by_user (FK)├─ Therapist who created it
         │          │ assigned_to_user (FK)├─ Consultant who executes
         │          │ status               │   ('assigned','in_progress',
         │          │ questions (JSON)     │    'pending_compute','completed')
         │          │ raw_responses (JSON) │
         │          │ results (JSON)       │
         │          │ audit_log (JSON)     │
         │          │ created_at           │
         │          │ completed_at         │
         │          └──────────────────────┘
         │
         └─ OneToOne ─────────────────────────────────┐
                                                     │
                                                     ▼
                                          ┌──────────────────────┐
                                          │ TestModule           │
                                          ├──────────────────────┤
                                          │ id (PK)              │
                                          │ code (unique) ◄──────┼─ "mcmi4-mystic"
                                          │ name                 │
                                          │ description          │
                                          │ test_type            │
                                          │ domain               │
                                          │ available_for_personal
                                          │ available_for_therapists
                                          │ is_assignable ◄──────┼─ True para SWM
                                          │ is_internal          │
                                          │ uses_per_month       │
                                          │ created_at           │
                                          └──────────────────────┘
                                                     │
                                                     │ (many-to-one)
                                                     ▼
                                          ┌──────────────────────┐
                                          │ TestResult           │
                                          ├──────────────────────┤
                                          │ id (PK)              │
                                          │ user (FK) ───────────┼─ Who ran it
                                          │ test_module (FK)     │
                                          │ patient (FK, null)   │
                                          │ input_data (JSON)    │
                                          │ result_data (JSON)   │
                                          │ score                │
                                          │ clinical_diagnosis   │
                                          │ details (JSON)       │
                                          │ created_at           │
                                          └──────────────────────┘


                                          (legacy compatibility)
                                          ┌──────────────────────┐
                                          │ UserTestAccess       │
                                          ├──────────────────────┤
                                          │ id (PK)              │
                                          │ user (FK)           │
                                          │ test_module (FK)     │
                                          │ has_special_access   │
                                          │ special_access_uses  │
                                          │ expires_at           │
                                          │ created_at           │
                                          └──────────────────────┘
```

## Relaciones Clave para MCMI-4-Mystic

### Flujo SWM (Special Workflow Module)

```
1. CREACIÓN DE ASSIGNMENT (Terapeuta)
   ────────────────────────────────────
   
   Terapeuta (User: armando)
        │
        ├─ Selecciona Paciente
        │  (Patient: Luis Antonio, user=pat_luisantonio_6090)
        │
        └─ Crea Assignment
           ├─ assigned_by_user = armando (User.id)
           ├─ assigned_to_user = consultant (User.id) ◄─ CONSULTANTE DIFERENTE
           ├─ patient = Luis Antonio (Patient.id)
           ├─ test_type = "mcmi4-mystic"
           ├─ status = "assigned"
           └─ created_at = now()

2. EJECUCIÓN DEL ASSIGNMENT (Consultante)
   ──────────────────────────────────────
   
   Consultante (User: consultant_test)
        │
        └─ POST /api/tests/execute/
           ├─ request.user = consultant_test
           ├─ test_module_code = "mcmi4-mystic"
           └─ Backend valida:
              ├─ Assignment.objects.filter(
              │    assigned_to_user=request.user,
              │    test_type__iexact="mcmi4-mystic",
              │    status__in=['assigned', 'in_progress']
              │ ).exists() ✅ TRUE → assigned_override=True
              │
              └─ allowed_execution = True
                 (skips available_for_personal=False check)

3. GUARDADO DE RESULTADO (TestResult)
   ─────────────────────────────────
   
   TestResult creado:
   ├─ user = consultant_test (quien ejecutó)
   ├─ test_module = mcmi4-mystic (TestModule)
   ├─ patient = Luis Antonio (Patient, optional but filled)
   ├─ input_data = { responses: {...} }
   ├─ result_data = { scores: {...}, motors: {...} }
   ├─ details = {
   │    audit: {
   │      executed_by_user_id: consultant.id,
   │      executed_by_role: "personal",
   │      execution_mode: "patient_self"
   │    }
   │ }
   └─ created_at = now()

4. VISUALIZACIÓN (Terapeuta)
   ─────────────────────────
   
   GET /api/tests/patient-previous/?patient_id=4
   └─ Backend busca:
      ├─ TestResult.patient = 4 (Luis Antonio)
      ├─ Assignment.patient = 4
      └─ Returns: [TestResult, Assignment (as pseudo-entry)]
```

## Tablas en SQLite

```sql
-- CORE AUTH
auth_user
├─ id (INTEGER PRIMARY KEY)
├─ username (TEXT UNIQUE)
├─ email
├─ password
└─ is_staff, is_superuser, is_active

-- PROFILES
api_userprofile
├─ id (INTEGER PRIMARY KEY)
├─ user_id (FOREIGN KEY auth_user)
├─ user_type (TEXT: therapist, patient, personal)
├─ full_name (TEXT)
├─ subscription_plan
├─ membership_active
└─ is_admin

-- PATIENTS
api_patient
├─ id (INTEGER PRIMARY KEY)
├─ user_id (FOREIGN KEY auth_user, nullable)
├─ therapist_id (FOREIGN KEY auth_user)
├─ first_name
├─ last_name
├─ email
├─ birth_date
├─ birth_time
├─ birth_latitude
├─ birth_longitude
├─ birth_timezone
├─ full_name
├─ hebrew_name
├─ main_complaint
├─ clinical_history
├─ treatment_plan (JSON)
└─ is_active

-- ASSIGNMENTS (NEW - SWM)
api_assignment
├─ id (INTEGER PRIMARY KEY)
├─ patient_id (FOREIGN KEY api_patient)
├─ test_type (TEXT: "mcmi4-mystic")
├─ assigned_by_user_id (FOREIGN KEY auth_user)
├─ assigned_to_user_id (FOREIGN KEY auth_user)
├─ questions (JSON)
├─ questions_hash
├─ raw_responses (JSON)
├─ responses_hash
├─ status (TEXT: assigned, in_progress, pending_compute, completed)
├─ results (JSON)
├─ audit_log (JSON)
├─ locked (BOOLEAN)
├─ created_at (DATETIME)
└─ completed_at (DATETIME)

-- TEST MODULES
api_testmodule
├─ id (INTEGER PRIMARY KEY)
├─ code (TEXT UNIQUE: "mcmi4-mystic")
├─ name (TEXT)
├─ description (TEXT)
├─ test_type (TEXT)
├─ domain (TEXT: holistic, technical)
├─ available_for_personal (BOOLEAN: False para SWM)
├─ available_for_therapists (BOOLEAN: False para SWM)
├─ is_assignable (BOOLEAN: True para SWM)
├─ is_internal (BOOLEAN)
├─ is_active (BOOLEAN)
├─ uses_per_month (INTEGER nullable)
├─ required_access_level
└─ created_at (DATETIME)

-- TEST RESULTS
api_testresult
├─ id (INTEGER PRIMARY KEY)
├─ user_id (FOREIGN KEY auth_user)
├─ test_module_id (FOREIGN KEY api_testmodule)
├─ patient_id (FOREIGN KEY api_patient, nullable)
├─ input_data (JSON)
├─ result_data (JSON)
├─ score (FLOAT nullable)
├─ clinical_diagnosis (TEXT)
├─ details (JSON)
├─ is_archived (BOOLEAN)
├─ created_at (DATETIME)
└─ updated_at (DATETIME)

-- USER TEST ACCESS (LEGACY)
api_usertestaccess
├─ id (INTEGER PRIMARY KEY)
├─ user_id (FOREIGN KEY auth_user)
├─ test_module_id (FOREIGN KEY api_testmodule)
├─ has_special_access (BOOLEAN)
├─ special_access_uses (INTEGER)
├─ expires_at (DATETIME nullable)
└─ created_at (DATETIME)
```

## Estado Actual (Enero 16, 2026)

### Usuario: armando (Terapeuta)
```
auth_user.id = 5
username = "armando"
profile.user_type = "therapist"
is_staff = False (pero es terapeuta)
is_superuser = False
```

### Usuario: pat_luisantonio_6090 (Paciente)
```
auth_user.id = 4
username = "pat_luisantonio_6090"
profile.user_type = "patient"
```

### FALTA: Usuario Consultante
```
CREAR:
auth_user.username = "consultant_test"
profile.user_type = "personal" (o crear nuevo tipo "consultant")
```

### Assignment Actual (INCORRECTA - NECESITA FIX)
```
Assignment.id = 5
├─ patient_id = 4 (Luis Antonio)
├─ test_type = "mcmi4-mystic"
├─ assigned_by_user_id = 5 (armando ✓ correcto)
├─ assigned_to_user_id = 4 (pat_luisantonio_6090 ✗ INCORRECTO - debe ser consultante)
├─ status = "assigned"
└─ created_at = 2026-01-16
```

### TestModule: mcmi4-mystic
```
TestModule.id = ? (search for code='mcmi4-mystic')
├─ code = "mcmi4-mystic"
├─ name = "MCMI-4-Mystic"
├─ available_for_personal = False ✓ (SWM only)
├─ available_for_therapists = False ✓ (SWM only)
├─ is_assignable = True ✓ (can be assigned)
├─ is_internal = False
├─ is_active = True
└─ domain = "holistic"
```

## Query de Debugging

```python
# Ver estado actual
from django.contrib.auth import get_user_model
from api.test_models import Assignment
from api.models import Patient

User = get_user_model()

# Usuarios
therapist = User.objects.get(username='armando')
patient_user = User.objects.get(username='pat_luisantonio_6090')
patient = Patient.objects.get(user=patient_user)

# Assignment
assignment = Assignment.objects.filter(test_type='mcmi4-mystic').first()
print(f"Patient: {assignment.patient.user.username}")
print(f"Assigned BY: {assignment.assigned_by_user.username}")
print(f"Assigned TO: {assignment.assigned_to_user.username}")
print(f"Status: {assignment.status}")
```

## Pasos para Fix

1. **Crear usuario consultante**
   ```python
   consultant = User.objects.create(username='consultant_test')
   consultant.set_password('test123')
   consultant.save()
   ```

2. **Recrear Assignment correctamente**
   ```python
   Assignment.objects.filter(test_type='mcmi4-mystic').delete()
   
   assignment = Assignment.objects.create(
       patient=patient,  # Luis Antonio
       test_type='mcmi4-mystic',
       assigned_by_user=therapist,  # armando
       assigned_to_user=consultant,  # ✓ CONSULTANTE DIFERENTE
       status='assigned'
   )
   ```

3. **Luego el flujo funcionará:**
   - Terapeuta armando → crea assignment (assigned_by_user)
   - Consultante_test → ejecuta (request.user = consultant_test = assigned_to_user) ✓
   - Paciente Luis Antonio → recibe el test (patient field)
