# CONTRATO FUNCIONAL — SWM TAROT EVOLUTIVO

> **Versión**: 1.0.0  
> **Fecha**: 2026-01-23  
> **Estado**: ACTIVO  
> **Referencia**: Patrón SWM MCMI-4 Místico

---

## 1. IDENTIDAD DEL MÓDULO

| Campo | Valor |
|-------|-------|
| **Código** | `TAROT_EVOLUTIVO` |
| **App Django** | `swm.tarot` |
| **Label** | `swm_tarot` |
| **Namespace URL** | `swm_tarot` |
| **Base Route** | `/api/swm/tarot/` |

---

## 2. QUÉ HACE (Scope Autorizado)

### 2.1 Funciones Principales

1. **Exploración Simbólica Guiada**
   - Facilitar tiradas de Tarot en contexto terapéutico
   - Registrar correspondencias con el Árbol de la Vida
   - Mapear arcanos a senderos y Sephiroth

2. **Persistencia de Tiradas**
   - Crear instancias de workspace por paciente
   - Guardar tiradas con cartas, posiciones y orientación
   - Sellar tiradas completadas (inmutable)

3. **Auditoría Completa**
   - Registro inmutable de todas las acciones
   - Trazabilidad de quién ejecutó cada acción
   - Historial de sesiones y artefactos

4. **Gestión de Permisos**
   - Asignar executor (terapeuta), observer, reviewer
   - Controlar acceso a tiradas de pacientes

### 2.2 Artefactos Soportados

| Tipo | Descripción |
|------|-------------|
| `spread` | Tirada completa con cartas y posiciones |
| `therapist_notes` | Notas del terapeuta sobre la tirada |
| `symbolic_map` | Mapeo a Árbol de la Vida |
| `session_summary` | Resumen de sesión |

### 2.3 Tipos de Tirada

| Código | Nombre | Cartas |
|--------|--------|--------|
| `free` | Tirada Libre | Variable |
| `tree_of_life` | Árbol de la Vida | 10 |
| `cross` | Cruz Celta | 10 |
| `three_cards` | Pasado/Presente/Futuro | 3 |
| `horseshoe` | Herradura | 7 |
| `sephiroth_path` | Sendero Sefirótico | Variable |

### 2.4 Sistemas de Tarot

| Código | Sistema |
|--------|---------|
| `rider-waite` | Rider-Waite-Smith (default) |
| `thoth` | Thoth de Aleister Crowley |
| `marseille` | Marsella clásico |
| `golden-dawn` | Golden Dawn |
| `bota` | B.O.T.A. (Paul Foster Case) |

---

## 3. QUÉ NO HACE (Prohibiciones Explícitas)

### 3.1 ❌ PROHIBIDO — Sin Excepción

| Prohibición | Motivo |
|-------------|--------|
| **Predicción de futuro** | No es adivinación, es exploración simbólica |
| **Diagnóstico psicológico** | Solo MCMI-4 tiene competencia diagnóstica |
| **Interpretación automática** | El terapeuta interpreta, no el sistema |
| **Conclusiones absolutas** | Nunca afirmar "significa X" |
| **Recomendaciones de tratamiento** | Compete al profesional |
| **Almacenamiento de datos sensibles no relacionados** | Solo datos de la tirada |

### 3.2 ❌ Límites de IA

```
LA INTELIGENCIA ARTIFICIAL EN ESTE MÓDULO:
- ✅ PUEDE: Sugerir correspondencias cabalísticas conocidas
- ✅ PUEDE: Ofrecer contexto histórico del arcano
- ✅ PUEDE: Presentar simbolismo tradicional
- ❌ NO PUEDE: Interpretar el significado para el paciente
- ❌ NO PUEDE: Generar conclusiones sobre la psique
- ❌ NO PUEDE: Predecir eventos o resultados
- ❌ NO PUEDE: Sugerir diagnósticos o tratamientos
```

---

## 4. FLUJO DE ESTADOS (FSM)

```
[created] → [in_progress] → [sealed] → [reviewed] → [archived]
     │            │              │           │
     └── cancel ──┴── cancel ────┘           │
                                             └── No se puede deshacer
```

### 4.1 Transiciones Permitidas

| De | A | Acción | Rol Requerido |
|----|---|--------|---------------|
| `created` | `in_progress` | `start` | executor |
| `created` | `cancelled` | `cancel` | executor, admin |
| `in_progress` | `sealed` | `seal` | executor |
| `in_progress` | `cancelled` | `cancel` | executor, admin |
| `sealed` | `reviewed` | `review` | reviewer |
| `reviewed` | `archived` | `archive` | admin |

---

## 5. API ENDPOINTS

### 5.1 Endpoints Core

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/definition` | Obtener definición del workspace |
| `POST` | `/create` | Crear nueva instancia |
| `GET` | `/list` | Listar instancias del usuario |
| `GET` | `/status?instance_id=` | Estado de instancia |
| `POST` | `/start` | Iniciar sesión de trabajo |
| `POST` | `/save-spread` | Guardar tirada |
| `POST` | `/seal` | Sellar workspace (inmutable) |
| `GET` | `/artifacts?instance_id=` | Obtener artefactos |
| `GET` | `/audit?instance_id=` | Obtener log de auditoría |
| `POST` | `/review` | Marcar como revisado |
| `POST` | `/grant-permission` | Otorgar permiso |
| `POST` | `/revoke-permission` | Revocar permiso |

### 5.2 Estructura de Tirada (save-spread)

```json
{
  "instance_id": "uuid",
  "spread_type": "tree_of_life",
  "tarot_system": "rider-waite",
  "cards": [
    {
      "position": 1,
      "position_name": "Kether - Corona",
      "card_id": "major_01",
      "card_name": "The Magician",
      "reversed": false,
      "therapist_note": "Voluntad activa..."
    }
  ],
  "session_context": "Primera sesión exploratoria",
  "therapist_notes": "Notas generales de la sesión"
}
```

---

## 6. MODELO DE DATOS

### 6.1 WorkspaceInstance — Campos Específicos Tarot

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `spread_type` | CharField | Tipo de tirada |
| `tarot_system` | CharField | Sistema de Tarot usado |
| `total_cards` | IntegerField | Cantidad de cartas en la tirada |
| `has_reversed` | BooleanField | Si incluye cartas invertidas |

### 6.2 Artifact Types

- `spread`: Tirada completa (JSON con array de cartas)
- `notes`: Notas del terapeuta
- `symbolic_map`: Correspondencias Árbol de la Vida
- `summary`: Resumen de sesión

---

## 7. PERMISOS

| Rol | Crear | Ejecutar | Ver | Sellar | Revisar | Admin |
|-----|-------|----------|-----|--------|---------|-------|
| `executor` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `observer` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `reviewer` | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| `admin` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 8. AUDITORÍA

### 8.1 Acciones Auditadas

| Acción | Cuándo |
|--------|--------|
| `workspace_created` | Al crear instancia |
| `session_started` | Al iniciar sesión |
| `spread_saved` | Al guardar tirada |
| `workspace_sealed` | Al sellar |
| `workspace_reviewed` | Al revisar |
| `permission_granted` | Al otorgar permiso |
| `permission_revoked` | Al revocar permiso |

### 8.2 Campos de Auditoría

```python
{
    "action": "spread_saved",
    "user_id": "uuid",
    "timestamp": "ISO8601",
    "ip_address": "x.x.x.x",
    "details": {
        "spread_type": "tree_of_life",
        "card_count": 10
    }
}
```

---

## 9. VALIDACIONES

### 9.1 Reglas de Negocio

1. **Creator ≠ Subject**: El terapeuta no puede crear workspace para sí mismo
2. **Una instancia activa por paciente**: No duplicar workspaces in_progress
3. **Inmutabilidad post-seal**: No modificar tiradas selladas
4. **Permiso requerido**: Solo executor puede guardar tiradas
5. **Sesión activa requerida**: Debe tener sesión para guardar spread

### 9.2 Validaciones de Tirada

- `spread_type` debe ser válido
- `tarot_system` debe ser válido
- Cada carta debe tener `position`, `card_id`
- No puede haber posiciones duplicadas
- `reversed` debe ser booleano

---

## 10. INTEGRACIÓN CON OTROS MÓDULOS

### 10.1 Dependencias

| Módulo | Relación |
|--------|----------|
| `api.models.User` | subject_user, creator_user |
| `auth` | IsAuthenticated |

### 10.2 No Integra Con (Por Ahora)

- ❌ MCMI-4 (módulos independientes)
- ❌ Astrology (separación de concerns)
- ❌ AI Engine (sin IA automatizada)

---

## 11. SAFE TAG

```
Tag: safe/tarot-backend-v1
Commit: (se asignará post-implementación)
Protege:
  - backend/swm/tarot/
  - docs/00_SOURCE_OF_TRUTH/CONTRATO_FUNCIONAL_TAROT.md
```

---

## 12. HISTORIAL DE CAMBIOS

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0.0 | 2026-01-23 | AGENTE_ARQ | Creación inicial |

---

**FIN DEL CONTRATO — Todo cambio requiere actualizar este documento.**
