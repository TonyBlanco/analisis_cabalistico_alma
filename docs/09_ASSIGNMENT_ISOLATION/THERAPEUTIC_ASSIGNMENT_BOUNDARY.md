---
title: Aislamiento de Asignaciones Terapéuticas
---

# Frontera de asignaciones terapéuticas

## 1. Objetivo

Establecer la lógica mínima que garantice que el *workspace del usuario* solo muestre tests **expresamente asignados** por un terapeuta bajo el modelo actual (`UserTestAccess.has_special_access`), sin heredar asignaciones legacy, tests técnicos ni prototipos internos. Este documento se limita a diseño + verificación; no se ejecutan writes ni se modifican modelos.

## 2. Modelado actual de asignaciones

### 2.1. `AssignTestToPatientView` (backend/api/test_views.py:1490-1825)
- Solo los terapeutas (`profile.user_type == 'therapist'`) pueden asignar tests con `available_for_therapists=True`.
- La vista resuelve un `TestModule` (buscando por `code`, `name` o versiones normalizadas) y, ante alias sin módulo canonical, crea:
  * Un `UserTestAccess` (marcado `has_special_access=True`).
  * O bien, un `TestResult` “assignment-only” con `details.legacy_assignment=True` (solo para alias legacy sin módulo en BD).
- El resultado final (return) expone `created`, `test_code` y `status` (heredado de `placeholder_payload`, si existe).

### 2.2. `UserTestAccess`
- Campos clave: `user`, `test_module`, `has_special_access`, `special_access_expires`, `created_at`, `updated_at`.
- Se usa como marca canónica de una asignación activa— el workspace ya consulta `UserTestAccess.has_special_access=True` para permitir accesos a usuarios.
- Actualmente no registra metadata como `assignment_origin`, `assignment_version` ni `assigned_by_role`. El único “marca” de asignación moderna es el flag `has_special_access` y su fecha de creación.

### 2.3. `TestResult` y estados “pending/completed”
- La vista `AvailableTestsView` (backend/api/test_views.py:68-189) calcula:
  * `has_result`: existen `TestResult` no archivados para `(patient, test_module)` → marca el test como `locked`/`completed`.
  * `already_assigned`: existe `UserTestAccess.has_special_access=True` → test aparece como `assigned_pending`.
  * Los legacy markers usan `result_data.assignment_only` y `details.legacy_assignment=True`. Esta señal no debe usarse en el nuevo filtro.

## 3. Falencias de los datos actuales

1. **Registros legacy reutilizados:** Las asignaciones “legacy” se conservan como `TestResult` con `test_module=None` y un `details` que incluye `'legacy_assignment': True`. No hay campo en `UserTestAccess` para distinguir si fue creado por la vista actual o por un proceso anterior.
2. **Falta de versión/origen:** No existe `assignment_version` u `origin`, lo que impide diferenciar `has_special_access` encendido automáticamente por jobs antiguos.

## 4. Regla mínima de filtrado para el workspace del usuario

### 4.1. Fuente de verdad: `UserTestAccess.has_special_access`
Los usuarios deben ver solo los tests referenciados por `UserTestAccess` con `has_special_access=True` y cuyo `test_module.is_active` aún esté vigente. Esto protege contra tests técnicos/internos y desactiva la herencia de configuraciones legacy.

```python
assigned_tests = UserTestAccess.objects.filter(
    user=patient.user,
    has_special_access=True,
    test_module__is_active=True,
)
```

### 4.2. Filtro adicional “scope activo”
Limitar la ventana temporal evita heredar assignments de migraciones anteriores:

```python
cutoff = timezone.now() - timedelta(days=30)  # o fecha del nuevo modelo
assigned_tests = assigned_tests.filter(created_at__gte=cutoff)
```

Si no hay consenso sobre el cutoff, documentar y publicar la fecha oficial en el `WorkspaceChecklist`. En paralelo, planificar la adición de `assignment_origin` para diferenciar asignaciones por fuente (API vs scripts legacy).

### 4.3. Rol del asignador
Aunque `UserTestAccess` no guarda explícitamente el `assigned_by`, la vista actual solo permite terapeutas. Como validación secundaria, se puede mantener un log de auditoría (tabla separada o `Patient.test_assignments_log`) que registre `assigned_by_role == 'therapist'`. Mientras tanto, confiar en el code path `AssignTestToPatientView` y en la bandera `has_special_access` como proxies seguros.

### 4.4. Estados del resultado en el workspace
Para que el UI muestre `pending` vs `completed`, reutilizar la lógica existente:

* `completed`: Existe un `TestResult` no archivado para el usuario (ej. `TestResult.objects.filter(patient=patient, test_module=module, is_archived=False).exists()`)
* `pending`: `UserTestAccess.has_special_access=True` pero sin `TestResult` no archivado.
* Ignorar `TestResult` con `result_data.assignment_only=True` y `details.legacy_assignment=True` para evitar mostrar legacy pending.

## 5. Verificación y monitoreo

1. **Indicadores clave:** contar `UserTestAccess.has_special_access` por usuario; rastrear cuántos no tienen `TestResult` asociado (pending).
2. **Alertas:** registrar en logs o servicios de observabilidad cuando aparezcan `UserTestAccess` sin `test_module.is_active` o con `has_special_access=False` pero en el workspace.
3. **Documentar “cutoff” y metadata:** cualquier cambio en `assignment_cutoff` debe versionarse en `docs/09_ASSIGNMENT_ISOLATION/THERAPEUTIC_ASSIGNMENT_BOUNDARY.md` y en el runbook del Arquitecto.

## 6. Próximos pasos propuestos

* Añadir columnas `assignment_origin` y `assignment_version` a `UserTestAccess` (solo para lectura en esta fase) para eliminar completamente la necesidad del cutoff temporal.
* Crear un script de auditoría que liste `UserTestAccess` anteriores al cutoff y marque manualmente cuáles se consideran legacy.
* Vincular el workspace del usuario a un reporte que liste “tests silenciosos” (sin `has_special_access`) y bloquearlos desde el UI.

Con esta frontera, el usuario solo verá tests asignados explícitamente por terapeutas actuales; el ruido legacy permanece fuera del feed y la gobernanza se mantiene intacta.
