# BioEmotional Session Flow: Simbiosis Consultante ↔ Terapeuta

> **Última actualización**: 2026-01-24
> **Estado**: ✅ Implementado
> **Versión**: 1.0

## 📋 Resumen Ejecutivo

Este documento describe el flujo de datos entre el **consultante** (paciente) y el **terapeuta** 
para sesiones BioEmotionales en el Workspace Experiencial. La implementación permite:

1. **Terapeuta** inicia sesión para un paciente
2. **Consultante** captura síntomas y notas pre-sesión
3. **Terapeuta** trabaja la sesión en el workspace experiencial
4. **Terapeuta** cierra sesión, datos disponibles en el timeline de evolución

---

## 🏗️ Arquitectura

### Modelo de Datos (`BioEmotionalSession`)

```
┌─────────────────────────────────────────────────────────────────┐
│                    BioEmotionalSession                          │
├─────────────────────────────────────────────────────────────────┤
│ id               : UUID (PK)                                    │
│ patient          : FK → Patient                                 │
│ therapist        : FK → User (nullable)                         │
│ date             : DateTime (auto)                              │
│ emotional_state  : 'better'|'same'|'worse'|'unknown'            │
│ observations_count: int (computed)                              │
│ hypotheses_count  : int (computed)                              │
│ synthesis_completed: bool                                       │
│ regions_observed  : JSON (string[])                             │
│ heatmap_data      : JSON ({region_id: intensity})               │
│ patient_notes     : TextField (input del consultante)           │
│ patient_feeling_score: int 1-10 (input del consultante)         │
│ patient_discomfort_regions: JSON (input del consultante)        │
│ is_closed         : bool                                        │
│ closed_at         : DateTime (nullable)                         │
│ created_at        : DateTime                                    │
│ updated_at        : DateTime                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Endpoints API

| Método | Endpoint | Rol | Descripción |
|--------|----------|-----|-------------|
| `GET` | `/api/bioemotional/sessions/?patient_id={id}` | Terapeuta | Lista sesiones de un paciente |
| `POST` | `/api/bioemotional/sessions/` | Terapeuta | Crea nueva sesión |
| `GET` | `/api/bioemotional/sessions/{id}/` | Terapeuta | Detalle de sesión |
| `PATCH` | `/api/bioemotional/sessions/{id}/` | Terapeuta | Actualiza sesión |
| `DELETE` | `/api/bioemotional/sessions/{id}/` | Terapeuta | Elimina sesión |
| `PATCH` | `/api/bioemotional/sessions/{id}/close/` | Terapeuta | Cierra sesión |
| `GET` | `/api/bioemotional/sessions/my/` | Consultante | Lista sus sesiones |
| `GET` | `/api/bioemotional/sessions/my/current/` | Consultante | Sesión abierta actual |
| `PATCH` | `/api/bioemotional/sessions/my/current/` | Consultante | Actualiza notas/síntomas |

---

## 🔄 Flujo de Trabajo

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   TERAPEUTA     │     │      SISTEMA     │     │  CONSULTANTE    │
└────────┬────────┘     └────────┬─────────┘     └────────┬────────┘
         │                       │                        │
    ┌────▼────┐                  │                        │
    │ Inicia  │                  │                        │
    │ Sesión  │──────────────────▶                        │
    └────┬────┘                  │                        │
         │                       │                        │
         │              ┌────────▼─────────┐              │
         │              │ BioEmotionalSession             │
         │              │ creada (is_closed=False)        │
         │              └────────┬─────────┘              │
         │                       │                        │
         │                       │◄──────────────────────┬┘
         │                       │                  ┌────▼────┐
         │                       │                  │ Captura │
         │                       │                  │ Síntomas│
         │                       │                  └────┬────┘
         │                       │                       │
         │              ┌────────▼─────────┐             │
         │              │ Actualiza:                     │
         │              │ - patient_notes                │
         │              │ - patient_feeling_score        │
         │              │ - patient_discomfort_regions   │
         │              └────────┬─────────┘             │
         │                       │                       │
    ┌────▼────┐                  │                       │
    │ Trabaja │                  │                       │
    │ Sesión  │◄─────────────────┘                       │
    │ (WS)    │                                          │
    └────┬────┘                                          │
         │                                               │
         │ Ve notas y síntomas del consultante           │
         │ Registra observaciones                        │
         │ Crea hipótesis                                │
         │ Genera síntesis                               │
         │                                               │
    ┌────▼────┐                                          │
    │ Cierra  │                                          │
    │ Sesión  │──────────────────────────────────────────▶
    └────┬────┘                                          │
         │                                               │
         │              ┌────────────────────┐           │
         │              │ is_closed=True                 │
         │              │ closed_at=now()                │
         │              │ Contadores actualizados        │
         │              └────────────────────┘           │
         │                                               │
         ▼                                               ▼
    ┌─────────┐                                   ┌─────────┐
    │ Timeline│                                   │ Historial│
    │ Evolución                                   │ Sesiones │
    └─────────┘                                   └─────────┘
```

---

## 🖥️ Componentes Frontend

### Terapeuta

| Componente | Ubicación | Función |
|------------|-----------|---------|
| `ExperientialEvolutionPanel` | `components/BioEmotionalExperientialWorkspace/` | Panel principal con timeline |
| `SessionTimeline` | `components/BioEmotionalExperientialWorkspace/` | Lista visual de sesiones |
| `EvolutionCharts` | `components/BioEmotionalExperientialWorkspace/` | Gráficos de tendencias |
| `SessionComparison` | `components/BioEmotionalExperientialWorkspace/` | Modal comparación sesiones |

### Consultante

| Componente | Ubicación | Función |
|------------|-----------|---------|
| `BioEmotionalSessionPage` | `app/(dashboard)/dashboard/patient/bioemotional-session/` | Captura de síntomas pre-sesión |

---

## 🔌 Cliente API TypeScript

```typescript
// En lib/api/bioemotional-clinical.ts

// --- Para Terapeuta ---
listSessions(patientId?: number): Promise<BioEmotionalSessionListItem[]>
createSession(payload): Promise<BioEmotionalSession>
getSession(sessionId): Promise<BioEmotionalSession>
updateSession(sessionId, payload): Promise<BioEmotionalSession>
closeSession(sessionId): Promise<BioEmotionalSession>
deleteSession(sessionId): Promise<void>

// --- Para Consultante ---
listMySessions(): Promise<BioEmotionalSessionListItem[]>
getMyCurrentSession(): Promise<BioEmotionalSession>
updateMySessionInput(payload): Promise<BioEmotionalSession>
```

---

## 📝 Serializers

### BioEmotionalSessionSerializer (completo, para detalle)
Campos: `id`, `therapist_id`, `patient_id`, `patient_name`, `date`, `emotional_state`, 
`observations_count`, `hypotheses_count`, `synthesis_completed`, `regions_observed`, 
`heatmap_data`, `patient_notes`, `patient_feeling_score`, `patient_discomfort_regions`,
`is_closed`, `closed_at`, `created_at`, `updated_at`

### BioEmotionalSessionListSerializer (ligero, para timeline)
Campos: `id`, `patient_id`, `patient_name`, `date`, `emotional_state`, 
`observations_count`, `hypotheses_count`, `synthesis_completed`, `regions_observed`, `is_closed`

### BioEmotionalSessionPatientInputSerializer (consultante)
Campos: `id` (read-only), `patient_notes`, `patient_feeling_score`, `patient_discomfort_regions`

---

## 🛡️ Permisos

| Rol | Crear | Leer | Actualizar | Cerrar | Eliminar |
|-----|-------|------|------------|--------|----------|
| Terapeuta | ✅ (sus pacientes) | ✅ (sus pacientes) | ✅ | ✅ | ✅ |
| Consultante | ❌ | ✅ (solo sus sesiones) | ✅ (solo campos de input) | ❌ | ❌ |

---

## 🚀 Uso

### Terapeuta: Iniciar Sesión

```typescript
import { createSession } from '@/lib/api/bioemotional-clinical';

const session = await createSession({
  patient_id: 123,
  emotional_state: 'unknown',
});
```

### Consultante: Capturar Síntomas

```typescript
import { updateMySessionInput } from '@/lib/api/bioemotional-clinical';

await updateMySessionInput({
  patient_notes: 'He sentido mucha tensión esta semana...',
  patient_feeling_score: 4,
  patient_discomfort_regions: ['cabeza', 'cuello', 'hombros'],
});
```

### Terapeuta: Ver Notas del Consultante y Cerrar

```typescript
import { getSession, closeSession } from '@/lib/api/bioemotional-clinical';

const session = await getSession('session-uuid');
console.log(session.patient_notes); // "He sentido mucha tensión..."
console.log(session.patient_feeling_score); // 4
console.log(session.patient_discomfort_regions); // ["cabeza", "cuello", "hombros"]

// Después de trabajar...
await closeSession('session-uuid');
```

---

## 📊 Migración

Ejecutar después de implementar:

```bash
cd backend
python manage.py makemigrations bioemotional
python manage.py migrate
```

---

## 🧪 Verificación

1. **Crear sesión** (terapeuta):
   ```
   POST /api/bioemotional/sessions/
   {"patient_id": 1}
   ```

2. **Ver sesión actual** (consultante):
   ```
   GET /api/bioemotional/sessions/my/current/
   ```

3. **Actualizar notas** (consultante):
   ```
   PATCH /api/bioemotional/sessions/my/current/
   {"patient_notes": "Test", "patient_feeling_score": 7}
   ```

4. **Verificar que terapeuta ve las notas**:
   ```
   GET /api/bioemotional/sessions/{session_id}/
   ```

5. **Cerrar sesión** (terapeuta):
   ```
   PATCH /api/bioemotional/sessions/{session_id}/close/
   ```

---

## 📁 Archivos Relacionados

### Backend
- [models.py](../backend/api/bioemotional/models.py#L250-L340) - Modelo BioEmotionalSession
- [serializers.py](../backend/api/bioemotional/serializers.py) - Serializers
- [views.py](../backend/api/bioemotional/views.py) - Views (Session CRUD)
- [urls.py](../backend/api/bioemotional/urls.py) - URL patterns

### Frontend
- [bioemotional-clinical.ts](../tonyblanco-app/lib/api/bioemotional-clinical.ts) - API client
- [bioemotional-session/page.tsx](../tonyblanco-app/app/(dashboard)/dashboard/patient/bioemotional-session/page.tsx) - Página consultante
- [ExperientialEvolutionPanel.tsx](../tonyblanco-app/components/BioEmotionalExperientialWorkspace/ExperientialEvolutionPanel.tsx) - Panel terapeuta

---

## ⚠️ Notas Importantes

1. **No eliminar sesiones cerradas**: Una vez cerrada, la sesión forma parte del historial clínico.

2. **Campos computados**: `observations_count` y `hypotheses_count` se actualizan automáticamente al cerrar la sesión.

3. **Privacidad**: El consultante solo ve información limitada de sus propias sesiones; no ve observaciones ni hipótesis del terapeuta.

4. **Validación**: `patient_feeling_score` debe estar entre 1 y 10.
