# SWM MCMI-4 MÍSTICO — DOMAIN MODEL

**Versión:** 1.0  
**Fecha:** 2026-01-17  
**Estado:** Arquitectura Definitiva  
**Categoría:** Specialized Workspace Module (SWM)

---

## 1. ENTIDADES PRINCIPALES

### 1.1 WorkspaceDefinition
**Propósito**: Plantilla global que define QUÉ es el MCMI-4 Místico como tipo de workspace.

**Campos**:
| Campo | Tipo | Mutable | Descripción |
|-------|------|---------|-------------|
| `id` | UUID | NO | Identificador único |
| `name` | String | NO | "MCMI-4 Místico" |
| `code` | String | NO | "MCMI4_MYSTIC" (único) |
| `version` | String | NO | "1.0" |
| `description` | Text | SÍ | Descripción larga del workspace |
| `config_schema` | JSON | SÍ | Esquema de configuración permitida |
| `created_at` | Timestamp | NO | Fecha de creación de la definición |
| `updated_at` | Timestamp | SÍ | Última actualización de metadatos |
| `is_active` | Boolean | SÍ | Si está disponible para crear instancias |

**Ownership**: Sistema (no pertenece a usuario específico)  
**Cardinalidad**: 1 registro único en la base de datos

---

### 1.2 WorkspaceInstance
**Propósito**: Instancia concreta de un workspace MCMI-4 Místico, vinculada a un sujeto de análisis específico.

**Campos**:
| Campo | Tipo | Mutable | Descripción |
|-------|------|---------|-------------|
| `id` | UUID | NO | Identificador único de la instancia |
| `workspace_definition_id` | UUID | NO | FK a `WorkspaceDefinition` |
| `subject_user_id` | UUID | NO | Usuario cuyos datos MCMI-4 se analizan |
| `creator_user_id` | UUID | NO | Usuario que creó el workspace (típicamente terapeuta) |
| `status` | Enum | SÍ | `created`, `in_progress`, `sealed`, `reviewed`, `archived` |
| `mcmi4_source_data_id` | UUID | NO | Referencia a datos MCMI-4 clínicos del sujeto |
| `config` | JSON | NO | Configuración específica de esta instancia |
| `created_at` | Timestamp | NO | Cuándo se creó el workspace |
| `started_at` | Timestamp | SÍ | Cuándo se inició la sesión interpretativa (NULL si no iniciada) |
| `sealed_at` | Timestamp | SÍ | Cuándo se selló (NULL si no sellada) |
| `reviewed_at` | Timestamp | SÍ | Cuándo se revisó (NULL si no revisada) |
| `archived_at` | Timestamp | SÍ | Cuándo se archivó (NULL si activa) |
| `metadata` | JSON | SÍ | Metadatos clínicos, etiquetas, contexto |

**Ownership**: `creator_user_id` (quien creó el workspace)  
**Cardinalidad**: N instancias por `WorkspaceDefinition`

**Reglas de Mutabilidad**:
- `status`: Solo transiciones válidas permitidas (ver diagrama de estados)
- Campos `*_at`: Se fijan automáticamente en transiciones, no modificables manualmente
- `config`, `metadata`: Modificables solo en estado `created`

---

### 1.3 WorkspaceSession
**Propósito**: Captura una sesión de trabajo activa dentro de un `WorkspaceInstance`.

**Campos**:
| Campo | Tipo | Mutable | Descripción |
|-------|------|---------|-------------|
| `id` | UUID | NO | Identificador único de la sesión |
| `workspace_instance_id` | UUID | NO | FK a `WorkspaceInstance` |
| `executor_user_id` | UUID | NO | Usuario ejecutando el proceso interpretativo |
| `started_at` | Timestamp | NO | Inicio de la sesión |
| `ended_at` | Timestamp | SÍ | Fin de la sesión (NULL si activa) |
| `session_state` | JSON | SÍ | Estado interno: progreso, decisiones, contexto |
| `interactions_count` | Integer | SÍ | Número de interacciones registradas |
| `current_phase` | String | SÍ | Fase actual: "discovery", "mapping", "interpretation", "synthesis" |
| `is_active` | Boolean | SÍ | Si la sesión está abierta |

**Ownership**: `executor_user_id`  
**Cardinalidad**: 1 sesión activa por `WorkspaceInstance` (múltiples sesiones históricas permitidas)

**Reglas de Mutabilidad**:
- `session_state`: Mutable solo mientras `is_active = true`
- `ended_at`: Se fija automáticamente al cerrar sesión, inmutable después
- No se puede reabrir una sesión cerrada

---

### 1.4 WorkspaceArtifact
**Propósito**: Artefactos generados durante/después de la sesión (mapas, narrativas, hipótesis).

**Campos**:
| Campo | Tipo | Mutable | Descripción |
|-------|------|---------|-------------|
| `id` | UUID | NO | Identificador único del artefacto |
| `workspace_instance_id` | UUID | NO | FK a `WorkspaceInstance` |
| `session_id` | UUID | SÍ | FK a `WorkspaceSession` (NULL si generado post-sesión) |
| `artifact_type` | Enum | NO | `symbolic_map`, `narrative`, `hypothesis`, `synthesis_report`, `archetype_profile` |
| `content` | JSON/Text | NO* | Contenido del artefacto (inmutable post-seal) |
| `created_by` | UUID | NO | Usuario que generó el artefacto |
| `created_at` | Timestamp | NO | Cuándo se creó |
| `is_sealed` | Boolean | NO* | Si el artefacto está sellado (sigue estado del workspace) |
| `metadata` | JSON | SÍ* | Metadatos adicionales (mutable solo pre-seal) |

**Ownership**: `workspace_instance_id`  
**Cardinalidad**: N artefactos por `WorkspaceInstance`

**Reglas de Mutabilidad**:
- `content`: Inmutable si `workspace_instance.status >= sealed`
- `metadata`: Mutable solo si `is_sealed = false`
- Artefactos sellados son permanentes

---

### 1.5 WorkspacePermission
**Propósito**: Control de acceso granular a instancias de workspace.

**Campos**:
| Campo | Tipo | Mutable | Descripción |
|-------|------|---------|-------------|
| `id` | UUID | NO | Identificador único del permiso |
| `workspace_instance_id` | UUID | NO | FK a `WorkspaceInstance` |
| `user_id` | UUID | NO | Usuario con permiso |
| `permission_type` | Enum | SÍ | `executor`, `observer`, `reviewer`, `admin` |
| `granted_by` | UUID | NO | Usuario que otorgó el permiso |
| `granted_at` | Timestamp | NO | Cuándo se otorgó |
| `revoked_at` | Timestamp | SÍ | Cuándo se revocó (NULL si activo) |
| `is_active` | Boolean | SÍ | Si el permiso está vigente |

**Ownership**: `workspace_instance.creator_user_id` (quien controla permisos)  
**Cardinalidad**: N permisos por `WorkspaceInstance`

**Reglas**:
- Un usuario puede tener múltiples tipos de permiso simultáneamente
- `permission_type = executor`: Puede iniciar/continuar sesiones
- `permission_type = observer`: Solo lectura durante sesión activa
- `permission_type = reviewer`: Puede marcar workspace como `reviewed`
- Revocar permiso no afecta sesiones ya abiertas

---

### 1.6 WorkspaceAuditLog
**Propósito**: Registro inmutable de todas las acciones en el workspace.

**Campos**:
| Campo | Tipo | Mutable | Descripción |
|-------|------|---------|-------------|
| `id` | UUID | NO | Identificador único del log |
| `workspace_instance_id` | UUID | NO | FK a `WorkspaceInstance` |
| `session_id` | UUID | SÍ | FK a `WorkspaceSession` (NULL si acción fuera de sesión) |
| `user_id` | UUID | NO | Usuario que realizó la acción |
| `action` | String | NO | Tipo de acción: `created`, `started`, `sealed`, `permission_granted`, etc. |
| `timestamp` | Timestamp | NO | Cuándo ocurrió |
| `details` | JSON | NO | Detalles contextuales de la acción |
| `ip_address` | String | NO | IP desde donde se realizó |

**Ownership**: Sistema (inmutable)  
**Cardinalidad**: N logs por `WorkspaceInstance`

**Reglas**:
- **NUNCA mutable**: Los logs son permanentes
- Retención según política de compliance clínico

---

## 2. DIAGRAMA DE ENTIDADES (ASCII)

```
┌────────────────────────────┐
│  WorkspaceDefinition       │
│  (Plantilla Global)        │
│  - code: "MCMI4_MYSTIC"    │
└────────────┬───────────────┘
             │ 1
             │
             │ N
┌────────────▼───────────────┐
│  WorkspaceInstance         │◄─────────┐
│  (Instancia Concreta)      │          │
│  - subject_user_id         │          │
│  - creator_user_id         │          │
│  - status (FSM)            │          │
│  - mcmi4_source_data_id    │          │
└────────────┬───────────────┘          │
             │ 1                        │
             │                          │
             │ N                        │ N
┌────────────▼───────────────┐   ┌──────┴──────────────────┐
│  WorkspaceSession          │   │  WorkspaceArtifact      │
│  (Sesión Activa)           │   │  (Resultados Generados) │
│  - executor_user_id        │   │  - artifact_type        │
│  - session_state (JSON)    │   │  - content (JSON/Text)  │
│  - current_phase           │   │  - is_sealed            │
└────────────────────────────┘   └─────────────────────────┘
             │ N                        │ N
             │                          │
             └──────────┬───────────────┘
                        │
                        │ N
             ┌──────────▼───────────────┐
             │  WorkspaceAuditLog       │
             │  (Registro Inmutable)    │
             │  - action                │
             │  - timestamp             │
             │  - details (JSON)        │
             └──────────────────────────┘

┌────────────────────────────┐
│  WorkspacePermission       │
│  (Control de Acceso)       │
│  - user_id                 │
│  - permission_type         │
│  - is_active               │
└────────────┬───────────────┘
             │ N
             │
             │ 1
       (ref: WorkspaceInstance)
```

---

## 3. DIAGRAMA DE ESTADOS (FSM)

```
WorkspaceInstance.status:

┌─────────┐
│ created │  (Workspace reservado, no iniciado)
└────┬────┘
     │ start_session (executor)
     ▼
┌─────────────┐
│ in_progress │  (Sesión activa, ejecutor trabajando)
└──────┬──────┘
       │ seal_workspace (executor)
       ▼
┌─────────┐
│ sealed  │  (Proceso completado, resultados inmutables)
└────┬────┘
     │ mark_reviewed (reviewer)
     ▼
┌──────────┐
│ reviewed │  (Observadores han revisado)
└────┬─────┘
     │ archive (admin)
     ▼
┌──────────┐
│ archived │  (Workspace archivado, solo lectura)
└──────────┘

TRANSICIONES VÁLIDAS:
- created → in_progress (requiere: executor con permiso, mcmi4_source_data válido)
- in_progress → sealed (requiere: sesión completa, validación de artefactos mínimos)
- sealed → reviewed (requiere: reviewer con permiso)
- reviewed → archived (requiere: admin con permiso, retención cumplida)
- created → archived (excepcional: workspace cancelado sin iniciar)

TRANSICIONES PROHIBIDAS:
- sealed → in_progress (NO rollback)
- reviewed → sealed (NO rollback)
- archived → cualquier otro (permanente)
```

---

## 4. OWNERSHIP Y CONTROL DE ACCESO

### 4.1 WorkspaceDefinition
- **Owner**: Sistema
- **Quién modifica**: Administradores de plataforma
- **Quién lee**: Todos los usuarios autenticados (metadatos públicos)

### 4.2 WorkspaceInstance
- **Owner**: `creator_user_id` (usualmente terapeuta)
- **Quién crea**: Terapeutas con rol `therapist` o superior
- **Quién inicia sesión**: Usuarios con `WorkspacePermission.permission_type = executor`
- **Quién lee**: Usuarios con cualquier `WorkspacePermission` activo + owner
- **Quién modifica estado**: Solo ejecutores/revisores según FSM

### 4.3 WorkspaceSession
- **Owner**: `executor_user_id`
- **Quién crea**: Usuario con permiso `executor` al iniciar sesión
- **Quién modifica**: Solo el ejecutor mientras `is_active = true`
- **Quién lee**: Ejecutor + observers con permiso

### 4.4 WorkspaceArtifact
- **Owner**: `workspace_instance_id` (hereda ownership del workspace)
- **Quién crea**: Ejecutor durante sesión, sistema al sellar
- **Quién modifica**: Nadie (post-seal)
- **Quién lee**: Usuarios con permiso en workspace

### 4.5 WorkspacePermission
- **Owner**: `workspace_instance.creator_user_id`
- **Quién otorga**: Owner del workspace o admin
- **Quién revoca**: Owner del workspace o admin
- **Quién lee**: Owner + admins

### 4.6 WorkspaceAuditLog
- **Owner**: Sistema (sin ownership de usuario)
- **Quién crea**: Sistema automáticamente
- **Quién modifica**: Nadie (inmutable)
- **Quién lee**: Owner del workspace + admins + compliance officers

---

## 5. DATOS MUTABLES VS INMUTABLES

### 5.1 Inmutables Post-Creación
- `WorkspaceInstance.subject_user_id`
- `WorkspaceInstance.creator_user_id`
- `WorkspaceInstance.mcmi4_source_data_id`
- `WorkspaceInstance.created_at`
- `WorkspaceSession.workspace_instance_id`
- `WorkspaceSession.executor_user_id`
- `WorkspaceSession.started_at`
- `WorkspaceArtifact.artifact_type`
- `WorkspaceArtifact.created_by`
- `WorkspaceArtifact.created_at`
- Todos los campos de `WorkspaceAuditLog`

### 5.2 Inmutables Post-Seal (workspace.status >= sealed)
- `WorkspaceArtifact.content`
- `WorkspaceArtifact.is_sealed`
- `WorkspaceSession.session_state` (de sesiones cerradas)

### 5.3 Siempre Mutables (con restricciones de estado)
- `WorkspaceInstance.status` (solo transiciones válidas FSM)
- `WorkspaceInstance.metadata` (solo en estados tempranos)
- `WorkspaceSession.session_state` (solo si sesión activa)
- `WorkspaceSession.current_phase` (solo si sesión activa)
- `WorkspacePermission.is_active` (puede revocarse)

---

## 6. REGLAS DE NEGOCIO CRÍTICAS

### 6.1 Unicidad de Sesión Activa
- Un `WorkspaceInstance` solo puede tener **1 sesión activa** (`WorkspaceSession.is_active = true`) a la vez
- Intentar iniciar sesión con sesión activa existente debe fallar con error específico
- Sesiones históricas (cerradas) permitidas sin límite

### 6.2 Validación de Transiciones de Estado
- Cada transición de `WorkspaceInstance.status` debe validar precondiciones específicas
- Ejemplo: `in_progress → sealed` requiere:
  - Sesión activa cerrada
  - Al menos 1 `WorkspaceArtifact` de tipo `synthesis_report` generado
  - Ejecutor que inició sesión sea quien sella

### 6.3 Integridad de Artefactos
- Artefactos creados durante sesión deben referenciar `session_id`
- Artefactos post-sesión (ej. informes generados por sistema) pueden tener `session_id = NULL`
- Artefactos de workspace sellado NO pueden borrarse ni modificarse

### 6.4 Auditoría Obligatoria
- **TODA** transición de estado debe generar entrada en `WorkspaceAuditLog`
- **TODA** modificación de permisos debe quedar registrada
- Inicio/fin de sesión debe quedar auditado

### 6.5 Datos del Sujeto
- `mcmi4_source_data_id` debe apuntar a resultados MCMI-4 **existentes y válidos** del `subject_user_id`
- No se permite crear workspace sin datos MCMI-4 previos del sujeto
- Datos MCMI-4 del sujeto son **solo lectura** desde el workspace (no se modifican)

---

## 7. ÍNDICES REQUERIDOS (Base de Datos)

### 7.1 WorkspaceInstance
- `workspace_definition_id, status` (búsqueda de workspaces por tipo y estado)
- `subject_user_id, status` (todos los workspaces de un sujeto)
- `creator_user_id, created_at DESC` (workspaces creados por terapeuta)

### 7.2 WorkspaceSession
- `workspace_instance_id, is_active` (sesión activa de un workspace)
- `executor_user_id, started_at DESC` (sesiones de un ejecutor)

### 7.3 WorkspaceArtifact
- `workspace_instance_id, artifact_type` (artefactos por tipo)
- `session_id` (artefactos de una sesión específica)

### 7.4 WorkspacePermission
- `workspace_instance_id, user_id, is_active` (permisos activos de usuario en workspace)
- `user_id, is_active` (todos los workspaces donde usuario tiene permisos)

### 7.5 WorkspaceAuditLog
- `workspace_instance_id, timestamp DESC` (historial de workspace)
- `user_id, timestamp DESC` (acciones de usuario)

---

## 8. CONSTRAINTS DE INTEGRIDAD

### 8.1 Check Constraints
```sql
-- WorkspaceInstance
CHECK (status IN ('created', 'in_progress', 'sealed', 'reviewed', 'archived'))
CHECK (started_at IS NULL OR started_at >= created_at)
CHECK (sealed_at IS NULL OR sealed_at >= started_at)
CHECK (reviewed_at IS NULL OR reviewed_at >= sealed_at)

-- WorkspaceSession
CHECK (ended_at IS NULL OR ended_at >= started_at)
CHECK (is_active = false OR ended_at IS NULL)  -- Sesión activa no puede tener ended_at

-- WorkspacePermission
CHECK (permission_type IN ('executor', 'observer', 'reviewer', 'admin'))
CHECK (is_active = false OR revoked_at IS NULL)  -- Permiso activo no puede estar revocado
```

### 8.2 Unique Constraints
```sql
-- Solo 1 WorkspaceDefinition con code = 'MCMI4_MYSTIC'
UNIQUE (code) ON WorkspaceDefinition

-- Solo 1 sesión activa por workspace
UNIQUE (workspace_instance_id) WHERE is_active = true ON WorkspaceSession
```

### 8.3 Foreign Key Constraints
```sql
-- WorkspaceInstance
FOREIGN KEY (workspace_definition_id) REFERENCES WorkspaceDefinition(id) ON DELETE RESTRICT
FOREIGN KEY (subject_user_id) REFERENCES User(id) ON DELETE RESTRICT
FOREIGN KEY (creator_user_id) REFERENCES User(id) ON DELETE RESTRICT

-- WorkspaceSession
FOREIGN KEY (workspace_instance_id) REFERENCES WorkspaceInstance(id) ON DELETE CASCADE
FOREIGN KEY (executor_user_id) REFERENCES User(id) ON DELETE RESTRICT

-- WorkspaceArtifact
FOREIGN KEY (workspace_instance_id) REFERENCES WorkspaceInstance(id) ON DELETE CASCADE
FOREIGN KEY (session_id) REFERENCES WorkspaceSession(id) ON DELETE SET NULL
FOREIGN KEY (created_by) REFERENCES User(id) ON DELETE RESTRICT

-- WorkspacePermission
FOREIGN KEY (workspace_instance_id) REFERENCES WorkspaceInstance(id) ON DELETE CASCADE
FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
FOREIGN KEY (granted_by) REFERENCES User(id) ON DELETE RESTRICT

-- WorkspaceAuditLog
FOREIGN KEY (workspace_instance_id) REFERENCES WorkspaceInstance(id) ON DELETE RESTRICT
FOREIGN KEY (session_id) REFERENCES WorkspaceSession(id) ON DELETE SET NULL
FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE RESTRICT
```

---

## 9. EXTENSIBILIDAD FUTURA

### 9.1 Soporte Multi-Definición
El modelo permite múltiples `WorkspaceDefinition` (ej. futuro "Tarot Analítico SWM") sin cambiar esquema de instancias.

### 9.2 Versionado de Artefactos
Si se requiere versionado de artefactos mutables, agregar:
- `WorkspaceArtifact.version` (INTEGER)
- `WorkspaceArtifact.parent_artifact_id` (UUID, FK a sí mismo)

### 9.3 Colaboración Multiusuario
Para múltiples ejecutores simultáneos (futuro):
- Modificar constraint de sesión activa única
- Agregar `WorkspaceSession.collaboration_mode` (boolean)
- Implementar locks optimistas en `session_state`

---

**FIN DEL DOMAIN MODEL**  
Este documento define las entidades, relaciones, estados y reglas de integridad del SWM MCMI-4 Místico, listo para traducción directa a SQL/ORM.
