---
title: Tests implícitos con disponibilidad restringida
---

# Clasificación implícita de tests con disponibilidad restringida

## 1. Contexto

Dado que `TestModule` no expone un flag `is_clinical`, la clasificación de tests con disponibilidad restringida surge de las guardias de ejecución y disponibilidad. En la práctica, un test queda no disponible para usuarios cuando una (o más) de las siguientes condiciones se cumple en el backend:

| Regla | Fuente |
| --- | --- |
| `available_for_personal=False` → `ExecuteTestView._infer_execution_mode()` devuelve `therapist_clinical` y `validate_execution_mode()` rechaza el modo `patient_self`. | `TestModule.is_available_for_user`, `ExecuteTestView`, `validate_execution_mode` |
| `required_access_level` > `personal` → `is_available_for_user` exige planes profesionales/premium. | `TestModule.is_available_for_user` |
| `requires_license=True` → solo usuarios con licencia activa pasan `is_available_for_user`. | `TestModule.is_available_for_user` |
| `test_type` en categorías restringidas (`diagnostic`, `health`, `poi`, etc.) → el equipo considera que deben tratarse como tests con disponibilidad restringida (el scheduler interno no los cataloga como holísticos). | gobernanza vigente (implicit) |

Además, `validate_role_for_execution` niega `patient_self` a terapeutas/admins y bloquea `therapist_clinical` para cualquier rol que no sea terapeuta, reforzando los cortes.

## 2. Criterios de bloqueo utilizados para el análisis

Con base en los fragmentos anteriores, el siguiente query devuelve los módulos que cumplen alguna de las condiciones de “clínico implícito” (sin ejecutar cambios):

```python
from api.test_models import TestModule

blocked = TestModule.objects.filter(is_active=True).filter(
    models.Q(available_for_personal=False) |
    models.Q(requires_license=True) |
    models.Q(required_access_level__in=['professional', 'premium']) |
    ~models.Q(test_type__in=['holistic', 'holistic_screening', 'wellness'])
)
```

Al menos una de esas cláusulas es suficiente para que el flujo de `ExecuteTestView` lance un `ValidationError` si el usuario intenta ejecutar el test sin una asignación especial.

## 3. Tabla de tests bloqueados

Los tests listados abajo fueron identificados por el query anterior y clasificados según la(s) condición(es) que los mantienen no disponibles:

| code | name | test_type | execution_mode (inferred) | available_for_personal | available_for_therapists | required_access_level | requires_license | blocked_reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `bai` | BAI | diagnostic | therapist_clinical | ✅ | ✅ | personal | ❌ | test_type=diagnostic (no holístico) |
| `gad-7` | GAD-7 | diagnostic | therapist_clinical | ✅ | ✅ | personal | ❌ | test_type=diagnostic |
| `phq-9` | PHQ-9 | diagnostic | therapist_clinical | ✅ | ✅ | personal | ❌ | test_type=diagnostic |
| `bdi-ii` | BDI-II - Inventario de Depresión de Beck | diagnostic | therapist_clinical | ❌ | ✅ | personal | ❌ | available_for_personal=False; test_type=diagnostic |
| `insomnia` | Insomnia — Descanso y hábitos | health | therapist_clinical | ❌ | ✅ | personal | ❌ | available_for_personal=False; test_type=health |
| `past-lives` | Vidas Pasadas – Exploración de Memorias del Alma | holistic_screening | therapist_clinical | ❌ | ✅ | premium | ❌ | available_for_personal=False; required_access_level=premium |
| `nutrition` | Alimentación — Relación y hábitos | holistic_screening | therapist_clinical | ❌ | ✅ | free | ❌ | available_for_personal=False |
| `stress-regulation` | Estrés — Carga y regulación | wellness | therapist_clinical | ❌ | ✅ | free | ❌ | available_for_personal=False |
| `scl90` | SCL-90 — Screening Holístico | wellness | therapist_clinical | ❌ | ✅ | free | ❌ | available_for_personal=False |
| `screening-general` | Screening Psicológico General | holistic_screening | therapist_clinical | ❌ | ✅ | personal | ❌ | available_for_personal=False |
| `wellness` | Wellness Assessment | holistic_screening | therapist_clinical | ❌ | ✅ | personal | ❌ | available_for_personal=False |
| `anxiety-state-trait` | Ansiedad — Estado y rasgo | wellness | therapist_clinical | ❌ | ✅ | free | ❌ | available_for_personal=False |
| `dbg-test-1` | DBG Test | wellness | therapist_clinical | ❌ | ✅ | personal | ❌ | available_for_personal=False |
| `dbg-test-2` | DBG Test | wellness | therapist_clinical | ❌ | ✅ | personal | ❌ | available_for_personal=False |
| `lock-test-8dc2dc` | Lock Test | wellness | therapist_clinical | ❌ | ✅ | personal | ❌ | available_for_personal=False |
| `lock-test-904d25` | Lock Test | wellness | therapist_clinical | ❌ | ✅ | personal | ❌ | available_for_personal=False |
| `lock-test-ca1983` | Lock Test | wellness | therapist_clinical | ❌ | ✅ | personal | ❌ | available_for_personal=False |
| `lock-test2-9839aa` | Lock Test | wellness | therapist_clinical | ❌ | ✅ | personal | ❌ | available_for_personal=False |

> Nota: la inferencia de `execution_mode` se deriva de `_infer_execution_mode()` (therapist_clinical cuando `available_for_personal=False`). En todos estos casos, el usuario recibe `/tests/execute` → `ValidationError: Test no disponible para ejecución personal`.

## 4. Próximos pasos

1. Validar que cada uno de los códigos arriba mencionados esté incluido en el catálogo canónico si debe ser reubicado como holístico (ver `docs/00_SOURCE_OF_TRUTH/TESTS_HOLISTIC_CATALOG.md`).
2. Documentar si alguno debe permanecer restringido (por ejemplo, porque requiere licencia o plan premium) y agregar `notes` en el catálogo para evitar confusiones en el initializer.
3. Mantener este diagnóstico actualizado cada vez que cambie la disponibilidad (`available_for_personal/therapists`), el acceso requerido o el `test_type` del módulo.

Con este análisis podemos decir que la “restricción implícita” proviene exclusivamente de las banderas de disponibilidad, tipo y nivel de acceso, y no de un campo explícito en el modelo. La tabla anterior permite priorizar qué módulos deben reclasificarse para liberar al usuario de la restricción “No disponible en esta versión”.
