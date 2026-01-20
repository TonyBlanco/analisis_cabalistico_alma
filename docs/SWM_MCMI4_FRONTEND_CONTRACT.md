# SWM MCMI-4 MÍSTICO — FRONTEND CONTRACT

**Versión:** 1.0  
**Fecha:** 2026-01-17  
**Estado:** Arquitectura Definitiva  
**Categoría:** Specialized Workspace Module (SWM)

---

## NATURALEZA DEL WORKSPACE (CONTEXTO OBLIGATORIO)

### Workspace como Espacio Interpretativo

El SWM MCMI-4 Místico es un **espacio de interpretación clínica posterior a la ejecución del test**. 

**Principios fundamentales:**

1. **Orden temporal**: El workspace existe DESPUÉS de que el consultante ha completado el test MCMI-4
2. **Separación de roles**:
   - El **consultante** ejecuta el test en el flujo `patient_self` y genera el `TestResult`
   - El **terapeuta** crea y trabaja en el workspace para interpretar ese resultado
   - El consultante **NO interactúa** con el workspace interpretativo
3. **Ubicación**: El workspace vive exclusivamente en `/dashboard/therapist/*`
4. **No es un cuestionario**: El workspace NO ejecuta preguntas, NO registra respuestas, NO es re-ejecutable

### Áreas de Enfoque (Focus Areas)

Las "Áreas de Enfoque" mencionadas en este contrato son **marcos simbólicos de interpretación**, no configuraciones de cuestionario. Estos marcos guían la lectura cabalística/simbólica del resultado ya existente.

### Fuente de Señal Requerida

Para crear un workspace válido, el terapeuta DEBE disponer de:
- Un `TestResult` MCMI-4 completado por el consultante, O
- Un `Assignment` completado, O  
- Un `AnalysisRecord` existente

**No es válido** crear un workspace sin una de estas fuentes de señal.

---

## 1. SEPARACIÓN TOTAL DE TESTS

### 1.1 NO Reutilizar Componentes de Tests
- ❌ `ExecuteTestView`
- ❌ `TestResultsView`
- ❌ `TestAssignmentPanel`
- ❌ Componentes de `/app/(dashboard)/dashboard/patient/tests/`

### 1.2 Rutas Propias (Solo Terapeuta)

El workspace MCMI-4 Místico vive exclusivamente en el dashboard del terapeuta.

**Rutas autorizadas:**
```
/dashboard/therapist/swm/mcmi4/
├── create                 (Formulario de creación - requiere TestResult existente)
├── [workspace_id]/
│   ├── overview           (Estado general del workspace)
│   ├── session/           (Sesión interpretativa activa - solo terapeuta)
│   │   ├── discovery      (Fase 1: Exploración simbólica)
│   │   ├── mapping        (Fase 2: Mapeo de patrones)
│   │   ├── interpretation (Fase 3: Interpretación clínica)
│   │   └── synthesis      (Fase 4: Síntesis final)
│   ├── results            (Resultados post-seal - lectura terapeuta)
│   └── audit              (Historial de auditoría)
└── list                   (Lista de workspaces del terapeuta)
```

> **Restricción crítica**: El consultante NO accede a estas rutas. El workspace es un artefacto terapéutico interno.

**Separación física**: Crear directorio `src/app/(dashboard)/dashboard/therapist/swm/mcmi4/` independiente.

---

## 2. APERTURA DE SWM (CÓMO EL FRONTEND ABRE UN WORKSPACE)

### 2.1 Flujo de Creación (Terapeuta)

> **Prerrequisito**: El consultante debe haber completado el test MCMI-4 previamente mediante el flujo `patient_self`. El workspace se crea DESPUÉS de que existe el `TestResult`.

**Paso 1**: Terapeuta navega a `/dashboard/therapist/swm/mcmi4/create`

**Paso 2**: Frontend carga formulario con:
- Selector de consultante/sujeto (filtrado: solo aquellos con `TestResult` MCMI-4 completo)
- Selector de `TestResult` MCMI-4 del consultante (si tiene múltiples ejecuciones históricas)
- Selección de marcos interpretativos (áreas de enfoque simbólico, capas cabalísticas)

> **Nota**: La "configuración" no afecta la ejecución del test (que ya ocurrió), sino el enfoque de la interpretación simbólica.

**Paso 3**: Usuario submit → Frontend hace `POST /api/swm/mcmi4/create`

**Paso 4**: Backend retorna `workspace_id` → Frontend redirige a:
```
/dashboard/swm/mcmi4/[workspace_id]/overview
```

**Componente**:
```tsx
// src/app/(dashboard)/dashboard/swm/mcmi4/create/page.tsx
'use client';

export default function CreateMCMI4WorkspacePage() {
  const [subjectUserId, setSubjectUserId] = useState<string>('');
  const [mcmi4DataId, setMcmi4DataId] = useState<string>('');
  const [config, setConfig] = useState({});
  
  const handleCreate = async () => {
    const response = await fetch('/api/swm/mcmi4/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject_user_id: subjectUserId,
        mcmi4_source_data_id: mcmi4DataId,
        config
      })
    });
    
    const { workspace_id } = await response.json();
    router.push(`/dashboard/swm/mcmi4/${workspace_id}/overview`);
  };
  
  return (
    <CreateWorkspaceForm onSubmit={handleCreate} />
  );
}
```

---

### 2.2 Flujo de Apertura (Ejecutor)

**Paso 1**: Usuario navega a `/dashboard/swm/mcmi4/list` o accede desde notificación

**Paso 2**: Frontend muestra lista de workspaces con permisos `executor`:
```tsx
// GET /api/swm/mcmi4/list?status=created&user_permission=executor
```

**Paso 3**: Usuario selecciona workspace → Frontend redirige a:
```
/dashboard/swm/mcmi4/[workspace_id]/overview
```

**Paso 4**: En overview, usuario ve botón "Iniciar Sesión" (solo si `status = created`)

**Paso 5**: Click → Frontend hace `POST /api/swm/mcmi4/start`

**Paso 6**: Backend retorna `session_id` → Frontend redirige a:
```
/dashboard/swm/mcmi4/[workspace_id]/session/discovery
```

**Componente**:
```tsx
// src/app/(dashboard)/dashboard/swm/mcmi4/[workspace_id]/overview/page.tsx
'use client';

export default function WorkspaceOverviewPage({ params }: { params: { workspace_id: string } }) {
  const [workspace, setWorkspace] = useState<WorkspaceStatus | null>(null);
  
  useEffect(() => {
    fetch(`/api/swm/mcmi4/status?workspace_id=${params.workspace_id}`)
      .then(res => res.json())
      .then(setWorkspace);
  }, [params.workspace_id]);
  
  const handleStartSession = async () => {
    const response = await fetch('/api/swm/mcmi4/start', {
      method: 'POST',
      body: JSON.stringify({ workspace_id: params.workspace_id })
    });
    
    const { session_id } = await response.json();
    router.push(`/dashboard/swm/mcmi4/${params.workspace_id}/session/discovery`);
  };
  
  return (
    <div>
      <WorkspaceStatusCard workspace={workspace} />
      {workspace?.status === 'created' && workspace?.user_permission === 'executor' && (
        <button onClick={handleStartSession}>Iniciar Sesión Interpretativa</button>
      )}
      {workspace?.status === 'sealed' && (
        <Link href={`/dashboard/swm/mcmi4/${params.workspace_id}/results`}>
          Ver Resultados
        </Link>
      )}
    </div>
  );
}

---

## 3-BIS. NOMENCLATURA Y ROLES

### Terminología Precisa

Para evitar confusión semántica:

| Término | Significado en este contexto |
|---------|-----------------------------|
| **Consultante / Sujeto** | Persona cuyos datos MCMI-4 son interpretados. NO es usuario del workspace. |
| **Terapeuta / Ejecutor** | Usuario autorizado que crea y trabaja en el workspace interpretativo. |
| **TestResult** | Artefacto persistido generado cuando el consultante completó el test MCMI-4. |
| **Workspace** | Contenedor interpretativo que consume el `TestResult` como entrada. |
| **Sesión Interpretativa** | Período de tiempo durante el cual el terapeuta trabaja activamente en el workspace. |

### Flujo Temporal

```
1. Consultante ejecuta test MCMI-4 (flujo patient_self)
   ↓
2. Se genera TestResult (persistido en BD)
   ↓
3. Terapeuta crea Workspace apuntando a ese TestResult
   ↓
4. Terapeuta inicia sesión interpretativa
   ↓
5. Terapeuta trabaja en fases (discovery → mapping → interpretation → synthesis)
   ↓
6. Terapeuta sella el workspace (resultados inmutables)
   ↓
7. Resultados quedan disponibles para revisión post-hoc
```

> **Nota crítica**: El consultante NO participa en los pasos 3-7.

---

## 3. RECUPERACIÓN DE ESTADO (CÓMO SE RECUPERA ESTADO)

### 3.1 Estado Global del Workspace

**Endpoint**: `GET /api/swm/mcmi4/status?workspace_id={id}`

**Cuándo llamar**:
- Al montar componente `/overview`
- Al reanudar sesión
- Cada 30 segundos (polling si sesión activa de otro usuario)

**Qué hace el frontend**:
```tsx
interface WorkspaceState {
  workspace_id: string;
  status: 'created' | 'in_progress' | 'sealed' | 'reviewed';
  active_session: {
    session_id: string;
    executor_user_id: string;
    current_phase: string;
    progress_percentage: number;
  } | null;
  user_permission: 'executor' | 'observer' | 'reviewer' | 'admin' | 'owner';
}

// Decisiones basadas en estado:
if (workspaceState.status === 'created') {
  // Mostrar botón "Iniciar Sesión"
}

if (workspaceState.status === 'in_progress' && workspaceState.active_session) {
  if (workspaceState.active_session.executor_user_id === currentUserId) {
    // Mostrar botón "Continuar Sesión"
    router.push(`/session/${workspaceState.active_session.current_phase}`);
  } else {
    // Mostrar "Sesión activa de otro usuario"
  }
}

if (workspaceState.status === 'sealed') {
  // Mostrar botón "Ver Resultados"
}
```

---

### 3.2 Estado de Sesión Activa

**Endpoint**: `GET /api/swm/mcmi4/status` (incluye `active_session`)

**Persistencia en Frontend**:
```tsx
// Context Provider para estado de sesión
const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ workspace_id, children }) {
  const [session, setSession] = useState<SessionState | null>(null);
  
  useEffect(() => {
    // Fetch inicial
    fetchSessionState();
    
    // Auto-save cada 30 segundos
    const interval = setInterval(() => {
      if (session?.is_active) {
        syncSessionState();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [workspace_id]);
  
  const syncSessionState = async () => {
    // POST /api/swm/mcmi4/progress (actualizar backend)
  };
  
  return (
    <SessionContext.Provider value={{ session, syncSessionState }}>
      {children}
    </SessionContext.Provider>
  );
}
```

---

### 3.3 Recuperación Post-Cierre de Sesión Incompleta

**Escenario**: Usuario cierra browser durante sesión activa.

**Flujo**:
1. Usuario regresa y navega a `/dashboard/swm/mcmi4/list`
2. Frontend hace `GET /api/swm/mcmi4/list`
3. Backend indica workspace `in_progress` con `active_session.executor_user_id = currentUserId`
4. Frontend muestra banner: "Tienes una sesión activa en progreso"
5. Click → Frontend redirige a `/session/{current_phase}` directamente
6. Fase actual se carga desde `active_session.current_phase`
7. Estado interno se recupera desde `active_session.session_state`

**Componente**:
```tsx
// Banner global en layout
export function ActiveSessionBanner() {
  const { data: workspaces } = useSWR('/api/swm/mcmi4/list?status=in_progress');
  
  const activeWorkspace = workspaces?.find(w => 
    w.active_session?.executor_user_id === currentUserId
  );
  
  if (!activeWorkspace) return null;
  
  return (
    <div className="active-session-banner">
      <p>Tienes una sesión MCMI-4 Místico activa</p>
      <button onClick={() => router.push(
        `/dashboard/swm/mcmi4/${activeWorkspace.workspace_id}/session/${activeWorkspace.active_session.current_phase}`
      )}>
        Continuar Sesión
      </button>
    </div>
  );
}
```

---

## 4. RENDERIZADO DE PROGRESO (CÓMO SE RENDERIZA PROGRESO)

### 4.1 Progress Bar Global

**Ubicación**: Header de todas las páginas de sesión

**Datos**:
```tsx
const { session } = useSessionContext();

<ProgressBar 
  current={session.session_state.progress_percentage} 
  total={100}
  phases={[
    { name: 'Discovery', completed: session.session_state.phases_completed.includes('discovery') },
    { name: 'Mapping', completed: session.session_state.phases_completed.includes('mapping') },
    { name: 'Interpretation', completed: session.session_state.phases_completed.includes('interpretation') },
    { name: 'Synthesis', completed: session.session_state.phases_completed.includes('synthesis') }
  ]}
/>
```

---

### 4.2 Indicadores de Fase Actual

**UI**:
```tsx
// src/components/swm/mcmi4/PhaseIndicator.tsx
export function PhaseIndicator({ currentPhase }: { currentPhase: string }) {
  const phases = ['discovery', 'mapping', 'interpretation', 'synthesis'];
  const currentIndex = phases.indexOf(currentPhase);
  
  return (
    <div className="phase-indicator">
      {phases.map((phase, idx) => (
        <div 
          key={phase}
          className={cn(
            'phase-step',
            idx < currentIndex && 'completed',
            idx === currentIndex && 'active',
            idx > currentIndex && 'pending'
          )}
        >
          {phase}
        </div>
      ))}
    </div>
  );
}
```

---

### 4.3 Estado Interno de Fase

Cada fase tiene estado propio:

```tsx
// src/app/(dashboard)/dashboard/swm/mcmi4/[workspace_id]/session/discovery/page.tsx
export default function DiscoveryPhasePage({ params }) {
  const { session, syncSessionState } = useSessionContext();
  const [localState, setLocalState] = useState(
    session.session_state.phases.discovery || {}
  );
  
  const handleStepComplete = async (step: string) => {
    const newState = {
      ...localState,
      steps_completed: [...localState.steps_completed, step]
    };
    
    setLocalState(newState);
    
    // Sync to backend
    await fetch('/api/swm/mcmi4/progress', {
      method: 'POST',
      body: JSON.stringify({
        workspace_id: params.workspace_id,
        session_id: session.session_id,
        action: 'record_decision',
        payload: {
          current_phase: 'discovery',
          decision_context: step,
          phase_state: newState
        }
      })
    });
    
    syncSessionState();
  };
  
  return (
    <DiscoveryPhaseContent 
      state={localState}
      onStepComplete={handleStepComplete}
    />
  );
}
```

---

## 5. BLOQUEO DE NAVEGACIÓN INDEBIDA (CÓMO SE BLOQUEA NAVEGACIÓN)

### 5.1 Guardias de Ruta

**Implementación**:
```tsx
// src/app/(dashboard)/dashboard/swm/mcmi4/[workspace_id]/session/layout.tsx
'use client';

export default function SessionLayout({ params, children }) {
  const { workspace_id } = params;
  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  
  useEffect(() => {
    fetch(`/api/swm/mcmi4/status?workspace_id=${workspace_id}`)
      .then(res => res.json())
      .then(workspace => {
        // Validar:
        // 1. Workspace en estado in_progress
        // 2. Usuario es executor de sesión activa
        const hasAccess = 
          workspace.status === 'in_progress' &&
          workspace.active_session?.executor_user_id === currentUserId &&
          workspace.user_permission === 'executor';
        
        setCanAccess(hasAccess);
        
        if (!hasAccess) {
          router.push(`/dashboard/swm/mcmi4/${workspace_id}/overview`);
        }
      });
  }, [workspace_id]);
  
  if (canAccess === null) return <LoadingSpinner />;
  if (!canAccess) return <AccessDenied />;
  
  return <>{children}</>;
}

---

### 5.1-BIS Restricción de Acceso por Rol

**Regla de oro**: Solo usuarios con rol `therapist` o `executor` autorizado pueden acceder a rutas del workspace.

```tsx
// Validación adicional en guards
const canAccessWorkspace = (user: User, workspace: Workspace): boolean => {
  // El consultante (subject_user_id) NUNCA puede acceder
  if (user.id === workspace.subject_user_id) {
    return false; // "Este es un espacio interpretativo del terapeuta"
  }
  
  // Solo terapeuta owner o executor autorizado
  return (
    workspace.owner_user_id === user.id ||
    workspace.user_permission === 'executor'
  ) && user.role === 'therapist';
};
```

> **Implicación UX**: Si un consultante intenta acceder (navegando manualmente a la URL), debe mostrarse: *"Este workspace es un espacio clínico reservado para tu terapeuta. Los resultados interpretados te serán compartidos cuando estén listos."*

---

### 5.2 Bloqueo de Avance Prematuro de Fase

**Regla**: Usuario NO puede navegar manualmente a fase siguiente sin completar anterior.

**Implementación**:
```tsx
// src/hooks/usePhaseNavigation.ts
export function usePhaseNavigation(workspace_id: string) {
  const { session } = useSessionContext();
  
  const canNavigateToPhase = (targetPhase: string): boolean => {
    const phaseOrder = ['discovery', 'mapping', 'interpretation', 'synthesis'];
    const currentIndex = phaseOrder.indexOf(session.current_phase);
    const targetIndex = phaseOrder.indexOf(targetPhase);
    
    // Solo puede ir a fase actual o anteriores completadas
    return targetIndex <= currentIndex;
  };
  
  const navigateToPhase = (phase: string) => {
    if (!canNavigateToPhase(phase)) {
      toast.error('Debes completar la fase actual antes de avanzar');
      return;
    }
    
    router.push(`/dashboard/swm/mcmi4/${workspace_id}/session/${phase}`);
  };
  
  return { canNavigateToPhase, navigateToPhase };
}
```

---

### 5.3 Advertencia de Navegación con Cambios No Guardados

**Implementación**:
```tsx
// src/hooks/useUnsavedChanges.ts
export function useUnsavedChanges(hasChanges: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requiere esto
        return 'Tienes cambios sin guardar. ¿Seguro que quieres salir?';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);
  
  // También bloquear navegación interna Next.js
  useEffect(() => {
    const handleRouteChange = () => {
      if (hasChanges && !confirm('Tienes cambios sin guardar. ¿Continuar?')) {
        router.events.emit('routeChangeError');
        throw 'Navegación cancelada por usuario';
      }
    };
    
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [hasChanges]);
}
```

---

## 6. REANUDACIÓN DE SESIÓN (CÓMO SE REANUDA UNA SESIÓN)

### 6.1 Sesión Pausada (Cerrada sin Sellar)

**Escenario**: Ejecutor llamó `POST /api/swm/mcmi4/close-session`

**Estado del Workspace**: `in_progress`, pero `active_session = null`

**Flujo de Reanudación**:
1. Usuario navega a `/dashboard/swm/mcmi4/[workspace_id]/overview`
2. Frontend detecta `status = in_progress` pero sin sesión activa
3. Muestra botón "Reanudar Sesión" (similar a "Iniciar Sesión")
4. Click → Frontend hace `POST /api/swm/mcmi4/start` (crea nueva sesión)
5. Backend carga estado desde `WorkspaceInstance.metadata.last_session_state`
6. Frontend redirige a última fase activa

**Componente**:
```tsx
// Botón condicional en overview
{workspace.status === 'in_progress' && !workspace.active_session && (
  <button onClick={handleResumeSession}>
    Reanudar Sesión
  </button>
)}

const handleResumeSession = async () => {
  const response = await fetch('/api/swm/mcmi4/start', {
    method: 'POST',
    body: JSON.stringify({ workspace_id: params.workspace_id })
  });
  
  const { session_id, current_phase } = await response.json();
  router.push(`/dashboard/swm/mcmi4/${params.workspace_id}/session/${current_phase}`);
};
```

---

### 6.2 Sesión Activa de Otro Usuario

**Escenario**: Usuario A tiene sesión activa, Usuario B (también executor) intenta iniciar.

**Backend**: Retorna `409 Conflict`

**Frontend**:
```tsx
const handleStartSession = async () => {
  try {
    const response = await fetch('/api/swm/mcmi4/start', {
      method: 'POST',
      body: JSON.stringify({ workspace_id: params.workspace_id })
    });
    
    if (response.status === 409) {
      const { error } = await response.json();
      toast.error(error.message); // "Ya existe una sesión activa"
      
      // Mostrar info de quién tiene la sesión
      const workspace = await fetchWorkspaceStatus(params.workspace_id);
      setActiveExecutor(workspace.active_session.executor_user_id);
    }
  } catch (err) {
    toast.error('Error al iniciar sesión');
  }
};
```

---

### 6.3 Reconexión Post-Network Failure

**Escenario**: Usuario pierde conexión durante sesión.

**Estrategia**:
```tsx
// src/hooks/useSessionReconnect.ts
export function useSessionReconnect(workspace_id: string, session_id: string) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { syncSessionState } = useSessionContext();
  
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      
      // Revalidar estado del backend
      const workspace = await fetch(`/api/swm/mcmi4/status?workspace_id=${workspace_id}`)
        .then(res => res.json());
      
      // Verificar que sesión sigue activa
      if (workspace.active_session?.session_id !== session_id) {
        toast.error('La sesión fue cerrada mientras estabas desconectado');
        router.push(`/dashboard/swm/mcmi4/${workspace_id}/overview`);
        return;
      }
      
      // Sincronizar estado local → backend
      await syncSessionState();
      toast.success('Reconectado exitosamente');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Conexión perdida. Cambios se sincronizarán al reconectar.');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [workspace_id, session_id]);
  
  return { isOnline };
}
```

---

## 7. COMPONENTES CLAVE (ARQUITECTURA FRONTEND)

### 7.1 Estructura de Directorios

```
src/
├── app/(dashboard)/dashboard/swm/mcmi4/
│   ├── create/
│   │   └── page.tsx                       (Formulario creación)
│   ├── list/
│   │   └── page.tsx                       (Lista workspaces)
│   ├── [workspace_id]/
│   │   ├── layout.tsx                     (Layout + guards)
│   │   ├── overview/
│   │   │   └── page.tsx                   (Estado general)
│   │   ├── session/
│   │   │   ├── layout.tsx                 (SessionProvider)
│   │   │   ├── discovery/
│   │   │   │   └── page.tsx
│   │   │   ├── mapping/
│   │   │   │   └── page.tsx
│   │   │   ├── interpretation/
│   │   │   │   └── page.tsx
│   │   │   └── synthesis/
│   │   │       └── page.tsx
│   │   ├── results/
│   │   │   └── page.tsx                   (Post-seal)
│   │   └── audit/
│   │       └── page.tsx                   (Historial)
│   └── page.tsx                           (Redirect a /list)
├── components/swm/mcmi4/
│   ├── WorkspaceStatusCard.tsx
│   ├── PhaseIndicator.tsx
│   ├── ProgressBar.tsx
│   ├── SessionControls.tsx
│   ├── ArtifactViewer.tsx
│   └── PermissionsManager.tsx
├── hooks/
│   ├── useSessionContext.ts
│   ├── usePhaseNavigation.ts
│   ├── useUnsavedChanges.ts
│   └── useSessionReconnect.ts
└── lib/api/swm/
    └── mcmi4.ts                           (API client)
```

---

### 7.2 API Client (lib/api/swm/mcmi4.ts)

```tsx
export const mcmi4Api = {
  create: async (data: CreateWorkspacePayload) => {
    const res = await fetch('/api/swm/mcmi4/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  
  start: async (workspace_id: string) => {
    const res = await fetch('/api/swm/mcmi4/start', {
      method: 'POST',
      body: JSON.stringify({ workspace_id })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  
  progress: async (workspace_id: string, session_id: string, payload: ProgressPayload) => {
    const res = await fetch('/api/swm/mcmi4/progress', {
      method: 'POST',
      body: JSON.stringify({ workspace_id, session_id, ...payload })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  
  seal: async (workspace_id: string, session_id: string, finalSynthesis: any) => {
    const res = await fetch('/api/swm/mcmi4/seal', {
      method: 'POST',
      body: JSON.stringify({ workspace_id, session_id, final_synthesis: finalSynthesis })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  
  getStatus: async (workspace_id: string) => {
    const res = await fetch(`/api/swm/mcmi4/status?workspace_id=${workspace_id}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  
  getResults: async (workspace_id: string) => {
    const res = await fetch(`/api/swm/mcmi4/results?workspace_id=${workspace_id}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  
  list: async (filters?: ListFilters) => {
    const params = new URLSearchParams(filters as any);
    const res = await fetch(`/api/swm/mcmi4/list?${params}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};
```

---

## 8. CONSIDERACIONES DE UX

### 8.1 Feedback Visual de Estado
- **Loading states**: Mostrar spinners durante llamadas API
- **Optimistic updates**: Actualizar UI antes de confirmar backend (revertir si falla)
- **Error boundaries**: Capturar errores de componentes y mostrar fallback

### 8.2 Auto-guardado
- Guardar estado local cada 30 segundos automáticamente
- Mostrar indicador "Guardando..." / "Guardado"
- No bloquear UI durante guardado (async)

### 8.3 Navegación Intuitiva
- Breadcrumbs: `Workspaces > MCMI-4 Místico > [Subject Name] > Sesión > Discovery`
- Botones de navegación solo habilitados si fase previa completa
- Resaltar fase actual en indicador de progreso

### 8.4 Permisos en UI
- Ocultar botones de acciones no permitidas (no solo deshabilitar)
- Mostrar badge de rol/permiso en header del workspace
- Explicar por qué una acción no está disponible (tooltip)

---

## 9. MANEJO DE ERRORES

### 9.1 Errores de Backend

```tsx
// src/lib/api/errorHandler.ts
export function handleApiError(error: any) {
  if (error.error?.code === 'WORKSPACE_NOT_FOUND') {
    toast.error('El workspace no existe o fue eliminado');
    router.push('/dashboard/swm/mcmi4/list');
  } else if (error.error?.code === 'PERMISSION_DENIED') {
    toast.error('No tienes permiso para realizar esta acción');
  } else if (error.error?.code === 'SESSION_ALREADY_ACTIVE') {
    toast.error('Ya existe una sesión activa. Espera a que finalice.');
  } else {
    toast.error('Error inesperado. Contacta soporte.');
    console.error('API Error:', error);
  }
}
```

---

### 9.2 Errores de Red

```tsx
// Retry automático para GET requests
export async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url);
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

---

## 10. TESTING (FRONTEND)

### 10.1 Tests de Integración

```tsx
// src/app/(dashboard)/dashboard/swm/mcmi4/__tests__/session-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

describe('MCMI-4 Session Flow', () => {
  it('should start session and navigate to discovery phase', async () => {
    const mockWorkspace = { workspace_id: 'w1', status: 'created', user_permission: 'executor' };
    
    // Mock API
    global.fetch = jest.fn((url) => {
      if (url.includes('/status')) return Promise.resolve({ json: () => mockWorkspace });
      if (url.includes('/start')) return Promise.resolve({ json: () => ({ session_id: 's1' }) });
    });
    
    render(<WorkspaceOverviewPage params={{ workspace_id: 'w1' }} />);
    
    const startButton = await screen.findByText('Iniciar Sesión Interpretativa');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(window.location.pathname).toContain('/session/discovery');
    });
  });
});
```

---

## ALINEACIÓN CON CONTRATO CANÓNICO

Este documento frontend está subordinado al contrato canónico definido en:
- `SWM_MCMI4_MISTICO_CONTRATO.md` (fuente de verdad semántica)
- `SWM_MCMI4_OVERVIEW.md` (contexto arquitectónico)

### Principios No Negociables

1. El workspace es **interpretativo**, no ejecutivo
2. El workspace es **posterior** a la existencia de `TestResult`
3. El consultante **NO interactúa** con el workspace
4. El workspace vive **exclusivamente** en `/dashboard/therapist/*`
5. Las "Áreas de Enfoque" son **marcos interpretativos**, no configuraciones de test

### Validación de Coherencia

Cualquier implementación frontend que:
- Sugiera ejecución de cuestionarios dentro del workspace
- Permita acceso del consultante a rutas interpretativas
- Cree workspace sin `TestResult` válido
- Confunda "configuración" con "parametrización de test"

...está en **violación del contrato canónico** y debe ser rechazada.

---

**FIN DE FRONTEND CONTRACT — VERSIÓN NORMALIZADA**  

Este documento define el contrato frontend del SWM MCMI-4 Místico alineado con su naturaleza interpretativa post-ejecución, garantizando separación de roles y coherencia con la arquitectura sellada.

**Última normalización**: 2026-01-18  
**Referencia canónica**: `SWM_MCMI4_MISTICO_CONTRATO.md`
