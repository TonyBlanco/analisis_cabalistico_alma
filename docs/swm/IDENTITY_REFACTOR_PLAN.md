# ARQUITECTURA FINAL - PLAN DE EJECUCIÓN COMPLETO

## FASE 0: PRE-MIGRACIÓN (VALIDACIÓN)

```bash
# 1. Backup completo
cd d:\analisis_cabalistico_alma\backend
copy db.sqlite3 db.sqlite3.pre-identity-refactor-$(date +%Y%m%d).backup

# 2. Verificar estado actual
python manage.py shell -c "
from api.models import Patient
from api.test_models import Assignment
print(f'Patients sin user_id: {Patient.objects.filter(user__isnull=True).count()}')
print(f'Assignments total: {Assignment.objects.count()}')
print(f'Patients total: {Patient.objects.count()}')
"

# 3. Si hay patients sin user_id → DETENER y resolver manualmente
```

## FASE 1: IDENTITY DECLARATION (5 min)

```bash
# Migración: Solo validación, sin cambios de schema
python manage.py migrate api 0070

# Verificar output:
# ✅ Identity integrity: All Patients have user_id
# ⚠️  WARNING: X Patient records without user_id → DETENER

# Si hay warnings, resolver:
python manage.py shell
>>> from api.models import Patient
>>> orphans = Patient.objects.filter(user__isnull=True)
>>> for p in orphans:
...     print(f"ID: {p.id}, Name: {p.full_name}, Email: {p.email}")
# → Crear users manualmente o vincular a users existentes
```

## FASE 2: PATIENT NORMALIZATION (10 min)

```bash
# Migración: Patient.user_id → NOT NULL
python manage.py migrate api 0071

# Verifica que pasa sin errores
# Si falla con "Cannot proceed: X patients without user_id"
# → Volver a Fase 1 y resolver orphans

# Verificar estado:
python manage.py shell -c "
from api.models import Patient
print(f'Patients con user_id: {Patient.objects.exclude(user__isnull=True).count()}')
print('✅ Todos los Patients tienen user_id obligatorio')
"
```

## FASE 3: IDENTITY PROFILE (15 min)

### 3a. Crear tabla
```bash
python manage.py migrate api 0072

# Verifica que tabla se creó:
python manage.py dbshell
sqlite> .schema api_identityprofile
# Debe mostrar estructura
sqlite> .quit
```

### 3b. Backfill de datos
```bash
# Migrar birth data de Patient → IdentityProfile
python backfill_identityprofile.py

# Output esperado:
# Created: X
# Skipped: 0
# Errors: 0
# ✅ Backfill completed successfully

# Verificar:
python manage.py shell -c "
from api.models import IdentityProfile
print(f'IdentityProfiles creados: {IdentityProfile.objects.count()}')
"
```

## FASE 4: ASSIGNMENT RESTRUCTURE (20 min)

### 4a. Agregar campos subject_user / clinical_profile
```bash
python manage.py migrate api 0073

# Verifica que campos se agregaron:
python manage.py dbshell
sqlite> PRAGMA table_info(api_assignment);
# Debe mostrar: subject_user_id, clinical_profile_id
sqlite> .quit
```

### 4b. Backfill Assignment.subject_user_id
```bash
python backfill_assignment_subject.py

# LÓGICA CORRECTA APLICADA (CRÍTICA):
# - Si patient.user existe → subject = patient.user (sujeto del análisis)
# - Si no → subject = assigned_to_user (fallback no clínico)

# Output esperado:
# Updated: X (clinical: Y, non-clinical: Z)
# Errors: 0
# ✅ VALIDATION: All assignments have subject_user_id

# Verificar:
python manage.py shell -c "
from api.test_models import Assignment
nulls = Assignment.objects.filter(subject_user__isnull=True).count()
print(f'Assignments sin subject_user_id: {nulls}')
if nulls == 0:
    print('✅ Listo para Fase 4c')
else:
    print('❌ DETENER - Revisar backfill')
"

# Verificar coherencia semántica:
python manage.py shell -c "
from api.test_models import Assignment
for a in Assignment.objects.all()[:5]:
    print(f'ID {a.id}: subject={a.subject_user.username}, patient={a.patient.full_name if a.patient else None}')
# subject debe ser patient.user cuando hay patient, NO assigned_to_user
"
```

### 4c. Hacer subject_user_id obligatorio
```bash
python manage.py migrate api 0074

# Si falla → assignments sin subject_user_id → volver a 4b

# Verificar constraint:
python manage.py dbshell
sqlite> SELECT sql FROM sqlite_master WHERE name='assignment_subject_user_required';
# Debe mostrar CHECK constraint
sqlite> .quit
```

## FASE 5: INTEGRITY CONSTRAINTS (10 min)

```bash
python manage.py migrate api 0075

# Verifica deprecation markers:
python manage.py shell -c "
from api.models import Patient
print(Patient._meta.get_field('birth_date').help_text)
# Debe contener 'DEPRECATED'
"

# Verificar trigger (SQLite):
python manage.py dbshell
sqlite> SELECT name FROM sqlite_master WHERE type='trigger' AND name='prevent_assignment_without_subject';
# Debe existir
sqlite> .quit
```

## FASE 6: VERIFICACIÓN FINAL (15 min)

```bash
# Test 1: Crear IdentityProfile para usuario sin Patient
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> from api.models import IdentityProfile
>>> User = get_user_model()
>>> consultant = User.objects.get(username='consultant_test')
>>> identity = IdentityProfile.objects.create(
...     user=consultant,
...     birth_date='1990-01-15',
...     birth_latitude=40.7128,
...     birth_longitude=-74.0060
... )
>>> print(f"✅ IdentityProfile creado para {consultant.username}")
>>> exit()

# Test 2: Crear Assignment con subject_user (sin patient)
python manage.py shell
>>> from api.test_models import Assignment
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> therapist = User.objects.get(username='armando')
>>> consultant = User.objects.get(username='consultant_test')
>>> assignment = Assignment.objects.create(
...     subject_user=consultant,  # ← Identidad universal
...     test_type='test-universal',
...     assigned_by_user=therapist,
...     assigned_to_user=consultant,
...     status='assigned',
...     clinical_profile=None  # ← Sin contexto clínico
... )
>>> print(f"✅ Assignment creado sin Patient: {assignment.id}")
>>> exit()

# Test 3: Verificar que no se puede crear Assignment sin subject_user
python manage.py shell
>>> from api.test_models import Assignment
>>> try:
...     Assignment.objects.create(
...         test_type='test-fail',
...         status='assigned',
...         # subject_user = None → debe fallar
...     )
... except Exception as e:
...     print(f"✅ Constraint funcionando: {e}")
>>> exit()

# Test 4: Astrología desde IdentityProfile (no Patient)
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> consultant = User.objects.get(username='consultant_test')
>>> identity = consultant.identity_profile
>>> print(f"Birth data: {identity.birth_date}, {identity.birth_latitude}, {identity.birth_longitude}")
>>> print("✅ Astrología puede funcionar sin Patient")
>>> exit()
```

## ROLLBACK PLAN

### Si Fase 1-2 fallan (pre-data)
```bash
# No hay cambios de schema, solo revertir migración
python manage.py migrate api 0069
```

### Si Fase 3 falla (IdentityProfile)
```bash
# Revertir migraciones
python manage.py migrate api 0071

# Eliminar tabla IdentityProfile
python manage.py dbshell
sqlite> DROP TABLE IF EXISTS api_identityprofile;
sqlite> .quit

# NO HAY PÉRDIDA DE DATOS (fuente en Patient)
```

### Si Fase 4 falla (Assignment)
```bash
# Revertir a antes de Assignment changes
python manage.py migrate api 0072

# Datos en patient_id se preservan
# subject_user_id y clinical_profile_id se pierden pero se pueden recrear
```

### Si Fase 5 falla (Constraints)
```bash
# Revertir constraints
python manage.py migrate api 0074

# Los datos siguen intactos
# Solo se pierden constraints DB
```

### Rollback completo (emergencia)
```bash
# Restaurar backup
cd d:\analisis_cabalistico_alma\backend
copy db.sqlite3 db.sqlite3.failed-migration
copy db.sqlite3.pre-identity-refactor-YYYYMMDD.backup db.sqlite3

# Revertir todas las migraciones
python manage.py migrate api 0069

# Verificar estado
python manage.py shell -c "
from api.test_models import Assignment
from api.models import Patient
print(f'Assignments: {Assignment.objects.count()}')
print(f'Patients: {Patient.objects.count()}')
"
```

## RIESGOS REALES

### 1. Patients sin user_id (BLOQUEANTE)
**Probabilidad**: Media  
**Impacto**: Alto (bloquea Fase 2)  
**Mitigación**: Fase 1 detecta y reporta antes de cambios

### 2. Assignments sin assigned_to_user (CRÍTICO)
**Probabilidad**: Baja  
**Impacto**: Alto (backfill falla)  
**Mitigación**: Validar antes de Fase 4b

### 3. Duplicación de IdentityProfile (MEDIO)
**Probabilidad**: Baja  
**Impacto**: Medio (constraint falla)  
**Mitigación**: Backfill es idempotente, verifica existencia

### 4. Pérdida de datos en rollback (BAJO)
**Probabilidad**: Muy baja  
**Impacto**: Crítico  
**Mitigación**: Backup completo en Fase 0, no se borran columnas

### 5. Frontend rompe por cambio de API (BLOQUEANTE SI OCURRE)
**Probabilidad**: Media  
**Impacto**: Alto  
**Mitigación**: NO SE TOCAN APIS EXISTENTES en esta fase
- Patient.birth_date sigue existiendo (deprecated)
- Assignment.patient_id sigue existiendo (nullable)
- Código actual sigue funcionando

## BENEFICIOS POST-MIGRACIÓN

1. **Astrología para todos los usuarios**
   - Consultantes pueden tener IdentityProfile sin ser pacientes
   - SWM puede ejecutarse sin contexto clínico

2. **Assignment universal**
   - Cualquier User puede ser sujeto
   - No se requiere Patient para tests no clínicos

3. **Separación conceptual clara**
   - Patient = contexto clínico
   - IdentityProfile = identidad simbólica
   - auth_user = identidad única

4. **Escalabilidad**
   - Nuevos roles (consultant, etc.) funcionan sin parches
   - No más ifs/bypasses en código

5. **Integridad de datos**
   - Constraints DB impiden estados inválidos
   - Migraciones son reversibles sin pérdida

## TIEMPO TOTAL ESTIMADO

- Fase 0: Pre-validación: 10 min
- Fase 1: Identity Declaration: 5 min
- Fase 2: Patient Normalization: 10 min
- Fase 3: IdentityProfile: 15 min
- Fase 4: Assignment Restructure: 20 min
- Fase 5: Integrity Constraints: 10 min
- Fase 6: Verificación Final: 15 min

**TOTAL: ~1.5 horas**  
(+ tiempo de resolución de orphans si existen)

## APROBACIÓN REQUERIDA

Antes de ejecutar, confirmar:
- [ ] Backup de db.sqlite3 completado
- [ ] Entorno de desarrollo (NO producción)
- [ ] No hay cambios pendientes en git
- [ ] Frontend NO será tocado en esta fase
- [ ] Plan de rollback entendido
- [ ] **CORRECCIÓN CRÍTICA APLICADA**: backfill_assignment_subject.py usa lógica semántica correcta (subject = patient.user cuando existe, NO assigned_to_user)

**INICIO AUTORIZADO POR**: ____________  
**FECHA**: ____________

---

## VALIDACIÓN SEMÁNTICA POST-MIGRACIÓN

Después de Fase 4c, verificar coherencia:

```sql
-- Query de validación (SQLite)
SELECT 
    a.id,
    a.subject_user_id,
    a.assigned_to_user_id,
    a.patient_id,
    p.user_id AS patient_user_id,
    CASE 
        WHEN p.user_id IS NOT NULL AND a.subject_user_id != p.user_id 
        THEN '❌ INCOHERENTE'
        WHEN p.user_id IS NOT NULL AND a.subject_user_id = p.user_id
        THEN '✅ clinical'
        WHEN p.user_id IS NULL AND a.subject_user_id = a.assigned_to_user_id
        THEN '✅ non-clinical'
        ELSE '⚠️  revisar'
    END AS semantic_check
FROM api_assignment a
LEFT JOIN api_patient p ON a.patient_id = p.id;
```

**ESPERADO**: Todos los registros deben mostrar ✅  
**SI APARECE** ❌: El backfill falló - rollback inmediato
