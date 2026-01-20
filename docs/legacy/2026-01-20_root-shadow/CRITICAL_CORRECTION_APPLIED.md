# CORRECCIÓN CRÍTICA APLICADA - Identity Refactor

## Fecha: 2026-01-16
## Estado: ✅ LISTO PARA EJECUCIÓN

---

## ⚠️ PROBLEMA IDENTIFICADO (Pre-corrección)

**Archivo**: `backfill_assignment_subject.py`  
**Línea problemática**:
```python
# LOGIC: subject = assigned_to_user (the executor)
assignment.subject_user = assignment.assigned_to_user
```

### Por qué era incorrecto

**Error conceptual**: Confunde **ejecutor** con **sujeto del análisis**.

En el modelo SWM:
- `assigned_to_user` = consultante que ejecuta el test
- `patient` = sujeto sobre el que se calcula (identidad clínica)
- **El sujeto del análisis es el patient, no el ejecutor**

**Ejemplo del error**:
```
Assignment {
  patient: Luis Antonio (user_id=4),
  assigned_to_user: consultant_test (user_id=10),
  subject_user: consultant_test ← ❌ INCORRECTO
}
```

Esto haría que:
- Los cálculos astrológicos se aplicaran al consultante, no al paciente
- Los resultados guardados no corresponderían a la identidad correcta
- La semántica de "sujeto" quedaría invertida

---

## ✅ SOLUCIÓN APLICADA

**Lógica correcta** (semántica de identidad):

```python
if assignment.patient and assignment.patient.user:
    # Caso clínico: el sujeto es el paciente (no el ejecutor)
    assignment.subject_user = assignment.patient.user
    assignment.clinical_profile = assignment.patient
    context = "clinical"
else:
    # Caso no clínico: el sujeto es el ejecutor
    assignment.subject_user = assignment.assigned_to_user
    assignment.clinical_profile = None
    context = "non-clinical"
```

### Resultado correcto

**Ejemplo clínico**:
```
Assignment {
  patient: Luis Antonio (user_id=4),
  assigned_to_user: consultant_test (user_id=10),
  subject_user: Luis Antonio ← ✅ CORRECTO
  clinical_profile: Patient(4)
}
```

**Ejemplo no clínico** (futuro):
```
Assignment {
  patient: NULL,
  assigned_to_user: consultant_test (user_id=10),
  subject_user: consultant_test ← ✅ CORRECTO (no hay patient)
  clinical_profile: NULL
}
```

---

## 🎯 IMPACTO DE LA CORRECCIÓN

### Antes (incorrecto)
- ❌ Sujeto = ejecutor (siempre)
- ❌ Patient ignorado en la asignación de identidad
- ❌ Resultados asociados a la persona incorrecta
- ❌ Astrología calculada para el consultante en vez del paciente

### Después (correcto)
- ✅ Sujeto = patient.user (cuando existe)
- ✅ Fallback a assigned_to_user solo si no hay patient
- ✅ Coherencia semántica completa
- ✅ Escalable a flujos no clínicos sin ambigüedad

---

## 📋 VALIDACIÓN POST-MIGRACIÓN

Después de ejecutar Fase 4b, verificar con:

```bash
python manage.py shell -c "
from api.test_models import Assignment

for a in Assignment.objects.all():
    if a.patient and a.patient.user:
        # Caso clínico: subject DEBE ser patient.user
        if a.subject_user != a.patient.user:
            print(f'❌ Assignment {a.id}: subject={a.subject_user.username}, expected={a.patient.user.username}')
        else:
            print(f'✅ Assignment {a.id}: clinical, subject={a.subject_user.username}')
    else:
        # Caso no clínico: subject DEBE ser assigned_to_user
        if a.subject_user != a.assigned_to_user:
            print(f'❌ Assignment {a.id}: subject={a.subject_user.username}, expected={a.assigned_to_user.username}')
        else:
            print(f'✅ Assignment {a.id}: non-clinical, subject={a.subject_user.username}')
"
```

**Resultado esperado**: Solo ✅, ningún ❌

---

## 🔧 CORRECCIÓN MENOR ADICIONAL

**Archivo**: `backfill_identityprofile.py`

**Mejora**: Filtro más robusto para capturar edge cases.

### Antes
```python
patients = Patient.objects.filter(
    user__isnull=False,
    birth_date__isnull=False
)
```

### Después
```python
patients = Patient.objects.filter(
    user__isnull=False
).filter(
    Q(birth_date__isnull=False) |
    Q(birth_time__isnull=False) |
    Q(birth_latitude__isnull=False) |
    Q(birth_longitude__isnull=False)
)
```

**Beneficio**: Cubre casos donde hay birth_time o coordenadas pero no birth_date.

---

## ✅ ESTADO FINAL

- [x] Corrección crítica aplicada en `backfill_assignment_subject.py`
- [x] Corrección menor aplicada en `backfill_identityprofile.py`
- [x] Plan de ejecución actualizado con validación semántica
- [x] Query SQL de validación agregada
- [x] Documentación actualizada

**Plan de migración**: APROBADO PARA EJECUCIÓN  
**Condición**: ✅ CUMPLIDA (corrección aplicada)

---

## 📝 CHECKLIST PRE-EJECUCIÓN

- [ ] Backup de `db.sqlite3` completado
- [ ] Correcciones aplicadas (este documento confirmado)
- [ ] Entorno de desarrollo (no producción)
- [ ] Git commit de archivos modificados
- [ ] Plan de rollback entendido

**Ejecutar**: `IDENTITY_REFACTOR_PLAN.md` Fase 0 → Fase 6
