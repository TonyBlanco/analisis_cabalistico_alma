# SWM MCMI-4 MÍSTICO — PERMISSIONS MODEL

**Versión:** 1.0  
**Fecha:** 2026-01-17  
**Estado:** Arquitectura Definitiva  
**Categoría:** Specialized Workspace Module (SWM)

---

## 1. PRINCIPIOS FUNDAMENTALES

### 1.1 Separación Total de Tests
- **NO** usar `UserTestAccess` ni permisos de asignación de tests
- **NO** asumir que el sujeto del análisis tiene permisos implícitos
- **NO** heredar permisos de relaciones terapeuta-cliente genéricas (explícito siempre)

### 1.2 Explicitness Over Implicit
- Todo permiso es **otorgado explícitamente** vía `WorkspacePermission`
- No hay permisos "por defecto" excepto el `creator_user_id` (owner)
- Permisos deben renovarse/revocarse explícitamente

### 1.3 Least Privilege
- Usuarios reciben **mínimo permiso necesario** para su función
- `observer` NO puede ejecutar; `executor` NO puede revisar resultados finales; `reviewer` NO puede modificar sesiones

### 1.4 Auditable by Design
- **TODA** operación de permisos queda registrada en `WorkspaceAuditLog`
- Cambios de permisos son irreversibles en el log (histórico completo)

---

## 2. TIPOS DE PERMISO (permission_type)

### 2.1 `executor`
**Propósito**: Realizar el proceso interpretativo dentro del workspace.

**Puede**:
- Iniciar sesión (`POST /api/swm/mcmi4/start`)
- Actualizar progreso de sesión (`POST /api/swm/mcmi4/progress`)
- Generar artefactos durante sesión
- Cerrar sesión sin sellar (`POST /api/swm/mcmi4/close-session`)
- Sellar workspace al completar (`POST /api/swm/mcmi4/seal`)
- Ver estado del workspace (`GET /api/swm/mcmi4/status`)
- Ver resultados de sesiones propias

**NO puede**:
- Modificar permisos de otros usuarios
- Revisar workspace como `reviewer`
- Ver sesiones de otros ejecutores (a menos que también tenga permiso `observer`)
- Reabrir workspace sellado

**Restricciones**:
- Solo puede trabajar en **1 sesión activa** a la vez por workspace
- Debe completar sesión antes de que otro executor pueda iniciar nueva
- Pierde acceso automáticamente si permiso es revocado (sesión activa continúa hasta cierre manual)

---

### 2.2 `observer`
**Propósito**: Monitorear el progreso del workspace sin interferir.

**Puede**:
- Ver estado del workspace en tiempo real (`GET /api/swm/mcmi4/status`)
- Ver artefactos generados durante sesión activa (read-only)
- Ver progreso de fase actual
- Ver resultados finales post-seal (`GET /api/swm/mcmi4/results`)

**NO puede**:
- Iniciar sesión
- Modificar estado de sesión
- Generar artefactos
- Sellar workspace
- Modificar permisos

**Restricciones**:
- Acceso solo a workspaces donde tiene permiso explícito
- No puede ver datos crudos de sesión (solo resumen)

---

### 2.3 `reviewer`
**Propósito**: Validar y revisar workspaces sellados.

**Puede**:
- Ver resultados completos de workspaces sellados (`GET /api/swm/mcmi4/results`)
- Marcar workspace como revisado (`POST /api/swm/mcmi4/review`)
- Agregar notas de revisión
- Ver historial completo de auditoría (`GET /api/swm/mcmi4/audit-log`)
- Ver todas las sesiones históricas del workspace

**NO puede**:
- Iniciar sesiones
- Modificar artefactos sellados
- Reabrir workspaces sellados
- Modificar estado pre-seal

**Restricciones**:
- Solo puede revisar workspaces en estado `sealed` (no `created` ni `in_progress`)
- Una vez marcado como `reviewed`, no puede deshacer

---

### 2.4 `admin`
**Propósito**: Gestión completa del workspace (superusuario del workspace específico).

**Puede**:
- **TODO** lo que puede `executor`, `observer`, y `reviewer`
- Otorgar permisos a otros usuarios (`POST /api/swm/mcmi4/permissions/grant`)
- Revocar permisos de otros usuarios (`POST /api/swm/mcmi4/permissions/revoke`)
- Archivar workspace (`POST /api/swm/mcmi4/archive` - no especificado en API pero implícito)
- Ver log de auditoría completo

**NO puede**:
- Modificar artefactos sellados (inmutabilidad absoluta)
- Revertir transiciones de estado (FSM unidireccional)
- Borrar workspace (solo archivar)

**Restricciones**:
- `creator_user_id` tiene permiso `admin` implícito (no revocable)
- Permisos `admin` adicionales deben ser otorgados explícitamente por creator u otro admin

---

## 3. JERARQUÍA DE PERMISOS

```
┌─────────────────────────────────────────────┐
│              creator_user_id                │
│         (Owner - Permiso Permanente)        │
│  - admin implícito                          │
│  - NO revocable                             │
│  - Control total de permisos                │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
    ┌────▼────┐         ┌────▼────┐
    │  admin  │         │  admin  │  (Otorgado)
    └────┬────┘         └────┬────┘
         │                   │
    ┌────┴────────────────────┴────┐
    │                              │
┌───▼────┐  ┌────────┐  ┌────────▼┐
│executor│  │observer│  │reviewer │
└────────┘  └────────┘  └─────────┘
```

**Reglas de Jerarquía**:
- `creator_user_id` > `admin` > `reviewer` = `executor` = `observer`
- Un usuario puede tener **múltiples tipos** simultáneamente (ej. `executor` + `observer`)
- Permisos son **aditivos** (no se anulan entre sí)
- `admin` NO hereda automáticamente capacidad de ejecutar (debe tener `executor` explícito o iniciar sesión)

---

## 4. PERMISOS POR ROL GLOBAL (User Roles)

### 4.1 Roles Globales vs Permisos de Workspace

| Rol Global | Permisos Implícitos en SWM | Restricciones |
|------------|---------------------------|---------------|
| `therapist` | Puede crear workspaces, otorgar permisos | Solo si tiene relación clínica con `subject_user_id` |
| `admin` | Puede ver todos los workspaces, auditoría global | NO puede modificar workspaces ajenos sin permiso explícito |
| `compliance_officer` | Acceso a auditoría de todos los workspaces | Read-only, no puede modificar |
| `patient` | **NINGUNO** (no participa como actor) | No puede crear ni ejecutar SWM |
| `user` (genérico) | **NINGUNO** | Requiere permiso explícito vía `WorkspacePermission` |

**Nota crítica**: A diferencia de tests, **NO** hay relación automática entre rol global y permisos SWM. Todo es explícito.

---

## 5. PERMISOS POR SESIÓN

### 5.1 Ownership de Sesión
- Una `WorkspaceSession` pertenece a su `executor_user_id`
- Solo el ejecutor puede modificar el estado de **su** sesión
- Otros ejecutores NO pueden ver ni modificar sesiones ajenas (a menos que tengan `admin` + `observer`)

### 5.2 Sesión Activa y Permisos
- Tener permiso `executor` NO garantiza poder iniciar sesión si:
  - Ya existe sesión activa (de otro usuario)
  - Workspace no está en estado `created` o `in_progress`
- Cerrar sesión NO revoca permiso `executor` (puede iniciar nueva sesión después)

### 5.3 Concurrencia
- **1 sesión activa máxima** por workspace
- Si `executor_A` tiene sesión activa, `executor_B` debe esperar a que se cierre
- No hay cola de espera (first-come, first-served al intentar `POST /start`)

---

## 6. PERMISOS POR OWNERSHIP

### 6.1 Creator (Owner Permanente)
- `WorkspaceInstance.creator_user_id` es el **owner absoluto**
- Tiene permiso `admin` implícito **no revocable**
- Puede otorgar/revocar cualquier permiso (incluso `admin` a otros)
- No puede transferir ownership (permanente)

### 6.2 Subject del Análisis
- `WorkspaceInstance.subject_user_id` **NO tiene permisos automáticos**
- No puede ver el workspace a menos que se le otorgue permiso explícito (ej. `observer`)
- Caso de uso típico: terapeuta crea workspace del paciente; paciente NO lo ve hasta que terapeuta decida

### 6.3 Ejecutor de Sesión
- `WorkspaceSession.executor_user_id` tiene ownership de **esa sesión específica**
- Puede ver/modificar solo su sesión
- No tiene ownership del workspace completo (solo de su sesión)

---

## 7. QUÉ PUEDE HACER CADA ROL (MATRIZ DE PERMISOS)

| Operación | creator | admin | executor | observer | reviewer | Notas |
|-----------|---------|-------|----------|----------|----------|-------|
| **Crear workspace** | ✅ | ❌ | ❌ | ❌ | ❌ | Solo con relación clínica |
| **Iniciar sesión** | ✅* | ✅* | ✅ | ❌ | ❌ | *Si también tiene `executor` |
| **Actualizar progreso** | ✅* | ✅* | ✅ | ❌ | ❌ | Solo en sesión propia |
| **Sellar workspace** | ✅* | ✅* | ✅ | ❌ | ❌ | Solo ejecutor de sesión activa |
| **Ver estado** | ✅ | ✅ | ✅ | ✅ | ✅ | Según nivel de detalle |
| **Ver resultados** | ✅ | ✅ | ✅** | ✅ | ✅ | **Solo de sesiones propias |
| **Marcar revisado** | ✅*** | ✅*** | ❌ | ❌ | ✅ | ***Si también tiene `reviewer` |
| **Otorgar permisos** | ✅ | ✅ | ❌ | ❌ | ❌ | |
| **Revocar permisos** | ✅ | ✅ | ❌ | ❌ | ❌ | Excepto owner |
| **Ver auditoría** | ✅ | ✅ | ❌ | ❌ | ✅ | |
| **Archivar** | ✅ | ✅ | ❌ | ❌ | ❌ | |

---

## 8. QUÉ NO PUEDE HACER NADIE

### 8.1 Operaciones Prohibidas Absolutamente
- ❌ Modificar artefactos de workspace sellado
- ❌ Revertir estado de workspace (ej. `sealed` → `in_progress`)
- ❌ Borrar `WorkspaceAuditLog` entries
- ❌ Modificar `creator_user_id` de workspace
- ❌ Modificar `subject_user_id` de workspace
- ❌ Modificar `executor_user_id` de sesión cerrada
- ❌ Reabrir sesión cerrada (solo crear nueva)
- ❌ Transferir ownership de workspace
- ❌ Ejecutar múltiples sesiones activas simultáneas (mismo workspace)

### 8.2 Operaciones Prohibidas Excepto Admin Global (Plataforma)
- ❌ Borrar workspace (solo archivable por admins)
- ❌ Modificar `WorkspaceDefinition` (solo admin de plataforma)
- ❌ Bypass de FSM (transiciones de estado fuera de flujo)

---

## 9. FLUJOS DE PERMISOS TÍPICOS

### 9.1 Flujo: Terapeuta Crea Workspace para Paciente

```
1. Terapeuta (user_id: T1) crea workspace
   - subject_user_id: P1 (paciente)
   - creator_user_id: T1
   - T1 obtiene permiso `admin` implícito

2. T1 otorga permiso `executor` a sí mismo
   - POST /permissions/grant { user_id: T1, permission_type: executor }

3. T1 inicia sesión
   - POST /start { workspace_id: W1 }
   - Sesión activa creada con executor_user_id: T1

4. T1 completa interpretación y sella
   - POST /seal { workspace_id: W1 }
   - Workspace.status → sealed

5. T1 otorga permiso `observer` a P1 (paciente puede ver resultados)
   - POST /permissions/grant { user_id: P1, permission_type: observer }

6. P1 puede ahora ver resultados
   - GET /results { workspace_id: W1 }
```

---

### 9.2 Flujo: Supervisor Revisa Workspace de Terapeuta

```
1. Terapeuta T1 completa workspace W1 (sellado)

2. T1 otorga permiso `reviewer` a supervisor S1
   - POST /permissions/grant { user_id: S1, permission_type: reviewer }

3. S1 revisa resultados
   - GET /results { workspace_id: W1 }

4. S1 marca como revisado
   - POST /review { workspace_id: W1, validation_status: approved }

5. Workspace.status → reviewed
```

---

### 9.3 Flujo: Ejecutor Externo (No Terapeuta)

```
1. Terapeuta T1 crea workspace W1
   - subject_user_id: P1
   - creator_user_id: T1

2. T1 otorga permiso `executor` a especialista E1 (ejecutor externo)
   - POST /permissions/grant { user_id: E1, permission_type: executor }

3. T1 otorga permiso `observer` a sí mismo (para monitorear)
   - T1 ya tiene `admin`, pero explícitamente quiere `observer` también

4. E1 inicia y ejecuta sesión
   - POST /start { workspace_id: W1 }
   - E1 es owner de esa sesión

5. T1 puede ver progreso (como `observer`)
   - GET /status { workspace_id: W1 }

6. E1 sella workspace
   - POST /seal { workspace_id: W1 }

7. T1 puede revocar permiso de E1 post-seal (ya no necesario)
   - POST /permissions/revoke { user_id: E1, permission_type: executor }
```

---

## 10. VALIDACIÓN DE PERMISOS (IMPLEMENTACIÓN)

### 10.1 Algoritmo de Validación

```python
def has_permission(user_id, workspace_id, required_permission_type):
    """
    Retorna True si usuario tiene el permiso requerido.
    
    Args:
        user_id: UUID del usuario
        workspace_id: UUID del workspace
        required_permission_type: 'executor' | 'observer' | 'reviewer' | 'admin'
    
    Returns:
        bool: True si tiene permiso, False caso contrario
    """
    workspace = get_workspace(workspace_id)
    
    # Owner (creator) tiene admin implícito
    if workspace.creator_user_id == user_id:
        if required_permission_type in ['admin', 'executor', 'observer', 'reviewer']:
            return True
    
    # Verificar permiso explícito
    permission = WorkspacePermission.query.filter_by(
        workspace_instance_id=workspace_id,
        user_id=user_id,
        permission_type=required_permission_type,
        is_active=True
    ).first()
    
    if permission:
        return True
    
    # Admin global puede ver auditoría (read-only)
    if required_permission_type == 'audit_read' and user.has_global_role('admin'):
        return True
    
    return False
```

### 10.2 Validación de Relación Clínica (Creación)

```python
def can_create_workspace(therapist_id, subject_user_id):
    """
    Valida si terapeuta puede crear workspace para sujeto.
    
    Args:
        therapist_id: UUID del terapeuta
        subject_user_id: UUID del sujeto del análisis
    
    Returns:
        bool: True si tiene relación clínica activa
    """
    # Verificar rol global
    if not user_has_role(therapist_id, 'therapist'):
        return False
    
    # Verificar relación terapéutica activa
    relationship = TherapeuticRelationship.query.filter_by(
        therapist_id=therapist_id,
        patient_id=subject_user_id,
        is_active=True
    ).first()
    
    return relationship is not None
```

---

## 11. SEGURIDAD Y COMPLIANCE

### 11.1 Protección de Datos del Sujeto
- Acceso a `subject_user_id` y datos personales requiere:
  - Permiso explícito en workspace, O
  - Relación clínica documentada, O
  - Rol `compliance_officer` con justificación auditada

### 11.2 Retención de Permisos Revocados
- `WorkspacePermission` con `is_active = false` se **conserva indefinidamente**
- Historial completo de permisos otorgados/revocados disponible en auditoría
- No se borran registros de permisos (soft delete vía `is_active`)

### 11.3 Auditoría de Cambios de Permisos
Todo cambio de permisos genera log:
```json
{
  "action": "permission_granted",
  "timestamp": "2026-01-17T14:23:00Z",
  "user_id": "uuid (quien otorgó)",
  "details": {
    "granted_to": "uuid",
    "permission_type": "executor",
    "workspace_id": "uuid"
  }
}
```

---

## 12. EDGE CASES Y MANEJO DE CONFLICTOS

### 12.1 Permiso Revocado Durante Sesión Activa
- **Comportamiento**: Sesión activa continúa hasta cierre manual
- **Rationale**: No interrumpir trabajo en progreso
- **Post-cierre**: Usuario no puede iniciar nueva sesión sin permiso

### 12.2 Múltiples Ejecutores con Permiso
- **Comportamiento**: Solo 1 puede tener sesión activa a la vez
- **Resolución**: First-come, first-served al llamar `POST /start`
- **Notificación**: Usuario B recibe `409 Conflict` si A tiene sesión activa

### 12.3 Creator Revoca su Propio Admin
- **Comportamiento**: Operación falla con `400 Bad Request`
- **Rationale**: Owner es permanente, no puede auto-revocarse

### 12.4 Admin Revoca a Otro Admin
- **Comportamiento**: Permitido (solo creator es inamovible)
- **Auditoría**: Queda registrado quién revocó a quién

---

## 13. CONSIDERACIONES DE IMPLEMENTACIÓN

### 13.1 Caché de Permisos
- Cachear permisos de usuario por request (Redis, memoria)
- Invalidar caché al otorgar/revocar permisos
- TTL: 5 minutos (balance entre performance y consistencia)

### 13.2 Validación en Cada Request
- Validar permisos **antes** de ejecutar operación
- No confiar en validaciones frontend (servidor es fuente de verdad)
- Usar decoradores/middleware para checks consistentes

### 13.3 Permisos en Respuestas API
- Incluir `user_permission` en respuestas de `GET /status` y `GET /list`
- Frontend puede adaptar UI según permisos del usuario
- No exponer permisos de otros usuarios (solo los propios)

---

**FIN DE PERMISSIONS MODEL**  
Este documento define el modelo completo de permisos del SWM MCMI-4 Místico, separado totalmente de la lógica de tests, con control granular y auditoría exhaustiva.
