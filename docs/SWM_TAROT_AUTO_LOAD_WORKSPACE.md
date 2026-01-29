# Auto-carga de Workspace Activo - SWM Tarot

> **Versión**: 1.1.0  
> **Fecha**: 2026-01-29  
> **Estado**: ✅ Implementado

## Problema Resuelto

Anteriormente, cuando un consultante tenía un workspace de Tarot activo (`created` o `in_progress`), al intentar crear uno nuevo el backend retornaba error 400:

```json
{
  "error": "An active Tarot workspace already exists for this patient. Please complete or cancel it first."
}
```

Esto causaba:
- ❌ Botón "Iniciar Lectura de Tarot" aparecía habilitado pero fallaba al hacer clic
- ❌ No había indicación visual de que existía un workspace activo
- ❌ El usuario no podía continuar trabajando en el workspace existente

## Solución Implementada

Se agregó detección automática de workspace activo al cargar el componente `AstrologyTarotWorkspace`.

### Flujo de Auto-carga

```
Usuario selecciona paciente
       ↓
Frontend: Fetch profile → obtener user_id
       ↓
Frontend: Llamar GET /api/swm/tarot/list?subject_user_id={user_id}
       ↓
Backend: Retornar lista de workspaces
       ↓
Frontend: Filtrar workspaces con status 'created' o 'in_progress'
       ↓
¿Se encontró workspace activo?
    │
    ├─ SI → Cargar automáticamente
    │       - setCurrentInstanceId(workspace.id)
    │       - setWorkspaceStatus('active')
    │       - Mostrar indicador verde "Workspace activo"
    │       - Mostrar botón "Sellar Sesión"
    │
    └─ NO → Permitir crear nuevo
            - setWorkspaceStatus('none')
            - Mostrar botón "Iniciar Lectura de Tarot"
```

## Cambios en el Código

### 1. Archivo: `tonyblanco-app/components/AstrologyTarotWorkspace/index.tsx`

#### Importaciones nuevas

```typescript
import { swmTarotApi } from '@/lib/api/swm/tarot/client';
```

#### Estado nuevo

```typescript
const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);
```

#### useEffect para auto-carga

```typescript
// Auto-load active workspace when patientUserId is available
useEffect(() => {
  if (!patientUserId) return;
  
  const loadActiveWorkspace = async () => {
    setIsLoadingWorkspace(true);
    try {
      // Check for existing active workspace (created or in_progress)
      const workspaces = await swmTarotApi.listWorkspaces({
        subject_user_id: patientUserId,
      });
      
      // Find active workspace (not sealed, not reviewed)
      const activeWorkspace = workspaces.find(
        w => w.status === 'created' || w.status === 'in_progress'
      );
      
      if (activeWorkspace) {
        console.log('📂 Auto-loading active workspace:', activeWorkspace.id);
        setCurrentInstanceId(activeWorkspace.id);
        setWorkspaceStatus('active');
      } else {
        console.log('ℹ️ No active workspace found for patient');
        setCurrentInstanceId(null);
        setWorkspaceStatus('none');
      }
    } catch (error) {
      console.error('Error loading active workspace:', error);
    } finally {
      setIsLoadingWorkspace(false);
    }
  };
  
  loadActiveWorkspace();
}, [patientUserId]);
```

#### UI actualizada - Indicador de workspace activo

```tsx
{/* Active Workspace Indicator */}
{workspaceStatus === 'active' && currentInstanceId && (
  <div className="mb-4 flex items-center gap-3">
    <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      <span className="text-sm font-medium text-green-700">Workspace activo</span>
    </div>
    <button
      onClick={handleSealWorkspace}
      disabled={isSealing}
      className="flex items-center gap-2 rounded-lg border border-amber-600 bg-white px-4 py-2 text-sm font-medium text-amber-700 shadow-sm hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSealing ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
          Sellando...
        </>
      ) : (
        <>
          <Lock className="h-4 w-4" />
          Sellar Sesión
        </>
      )}
    </button>
  </div>
)}
```

#### Botón "Iniciar Lectura" - Estados de carga mejorados

```tsx
disabled={isCreating || isStarting || isLoadingPatient || isLoadingWorkspace || !patientUserId}

{isLoadingPatient || isLoadingWorkspace ? (
  <>
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
    {isLoadingWorkspace ? 'Verificando workspace...' : 'Cargando consultante...'}
  </>
) : ...}
```

## Beneficios

| Antes | Después |
|-------|---------|
| ❌ Error 400 sin explicación | ✅ Workspace detectado y cargado automáticamente |
| ❌ Botón habilitado pero no funcional | ✅ Botón deshabilitado mientras se verifica |
| ❌ No hay indicación visual | ✅ Indicador verde con pulso animado |
| ❌ No se puede continuar sesión existente | ✅ Se carga automáticamente y se puede continuar |

## Endpoints Backend Usados

### GET `/api/swm/tarot/list`

**Parámetros de filtro:**
- `subject_user_id` (int): ID del usuario asociado al consultante
- `status` (string, opcional): Filtrar por status específico

**Response:**
```json
{
  "workspaces": [
    {
      "id": "uuid",
      "subject_user": { "id": 18, "username": "..." },
      "status": "created",
      "spread_type": "free",
      "tarot_system": "thoth",
      "created_at": "2026-01-28T...",
      ...
    }
  ]
}
```

## Validación Manual

### Escenario 1: Sin workspace activo

1. ✅ Seleccionar paciente sin workspace activo
2. ✅ Ver mensaje "Verificando workspace..." brevemente
3. ✅ Ver botón "Iniciar Lectura de Tarot" habilitado
4. ✅ Hacer clic → Crear workspace exitosamente

### Escenario 2: Con workspace activo

1. ✅ Seleccionar paciente con workspace activo existente
2. ✅ Ver mensaje "Verificando workspace..." brevemente
3. ✅ Ver indicador verde "Workspace activo" con pulso
4. ✅ Ver botón "Sellar Sesión" junto al indicador
5. ✅ No ver botón "Iniciar Lectura de Tarot"

### Escenario 3: Cambio de paciente

1. ✅ Seleccionar paciente A (con workspace)
2. ✅ Ver indicador de workspace activo
3. ✅ Cambiar a paciente B (sin workspace)
4. ✅ Ver botón "Iniciar Lectura de Tarot"
5. ✅ Volver a paciente A
6. ✅ Ver nuevamente indicador de workspace activo

## Logs de Debug

### Console logs para troubleshooting

```javascript
// Al cargar workspace activo
'📂 Auto-loading active workspace: {uuid}'

// Cuando no hay workspace
'ℹ️ No active workspace found for patient'

// En caso de error
'Error loading active workspace: {error}'
```

## Próximas Mejoras (Futuras)

- [ ] Permitir **cambiar de workspace** si hay múltiples sellados
- [ ] Mostrar **lista completa de workspaces** en panel lateral
- [ ] Agregar **botón "Nuevo Workspace"** que selle automáticamente el activo
- [ ] **Confirmación** antes de sellar workspace con trabajo no guardado
- [ ] **Restore** de workspace desde historial con un clic

## Referencias

- [SWM Tarot API Client](../tonyblanco-app/lib/api/swm/tarot/client.ts)
- [SWM Tarot Types](../tonyblanco-app/lib/api/swm/tarot/types.ts)
- [Backend SWM Tarot Views](../backend/swm/tarot/views.py)
- [Backend SWM Tarot Models](../backend/swm/tarot/models.py)

---

## Historial de Cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.1.0 | 2026-01-29 | Auto-carga de workspace activo implementada |
| 1.0.0 | 2026-01-28 | Sistema SWM Tarot creado |
