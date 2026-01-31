# PROMPT: Implementación Arquitectura Consultante

**Fecha de ejecución**: 1 de febrero de 2026  
**Agente recomendado**: 🎯 **Claude Opus 4.5** (razonamiento profundo + implementación compleja)  
**Alternativa**: GPT-5 (si Opus no disponible)  
**Duración estimada**: 4-6 horas  
**Complejidad**: Alta (Backend + Frontend + Migrations)

---

## 🎯 OBJETIVO PRINCIPAL

Implementar la arquitectura **Patient → Consultante** completa según especificaciones en:
- [`UNIFIED_CONSULTANTE_ARCHITECTURE.md`](UNIFIED_CONSULTANTE_ARCHITECTURE.md)
- [`CONSULTANTE_MIGRATION_GUIDE.md`](CONSULTANTE_MIGRATION_GUIDE.md)
- [`CONSULTANTE_TERMINOLOGY.md`](CONSULTANTE_TERMINOLOGY.md)

---

## 📋 CONTEXTO PREVIO (Leer ANTES de empezar)

### ⚠️ Documentos OBLIGATORIOS:
1. **[`AGENT_ONBOARDING_README.md`](AGENT_ONBOARDING_README.md)** — Reglas del proyecto
2. **[`UNIFIED_CONSULTANTE_ARCHITECTURE.md`](UNIFIED_CONSULTANTE_ARCHITECTURE.md)** — Especificación técnica completa
3. **[`CONSULTANTE_MIGRATION_GUIDE.md`](CONSULTANTE_MIGRATION_GUIDE.md)** — Pasos específicos

### 🔒 Constraints NO NEGOCIABLES:
- **Workspace Isolation**: Cada workspace es soberano (ver `WORKSPACE_ISOLATION_POLICY.md`)
- **Zero Breaking Changes**: Código existente debe seguir funcionando durante migración
- **Compatibility Layer**: APIs legacy deben redirigir a nuevas APIs
- **Test Data Only**: TODOS los datos actuales son de prueba, se pueden borrar

### 🏗️ Arquitectura Actual:
```
Backend:  Django 5.0 + DRF (puerto 8000)
Frontend: Next.js 16 App Router (puerto 3000)
Database: SQLite (db.sqlite3)
SWM:      backend/swm/ (mcmi4, tarot, cabala, sha, transgenerational)
```

---

## 📝 TAREAS ESPECÍFICAS

### FASE 1: Backend Models (1-2 horas)

#### 1.1 Crear modelo Consultante
```python
# backend/api/models.py

class Consultante(models.Model):
    """
    COPIAR EXACTAMENTE de UNIFIED_CONSULTANTE_ARCHITECTURE.md
    Sección: "Modelo Principal: Consultante"
    """
    # UUID como primary key
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4)
    
    # Identidad personal
    full_name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    # ... (ver doc completo)
    
    # Relación terapéutica
    therapist = models.ForeignKey(User, ...)
    user_account = models.OneToOneField(User, ...)  # CRÍTICO!
    
    # Compatibility
    legacy_patient_id = models.IntegerField(null=True, blank=True)
```

#### 1.2 Actualizar modelos relacionados
```python
# Actualizar TODOS estos modelos:
- TestResult.consultante (FK to Consultante)
- Assignment.consultante (FK to Consultante)  
- AnalysisRecord.consultante (FK to Consultante)
- BioEmotionalPatientBrief.consultante (FK to Consultante)
```

#### 1.3 Crear Serializers
```python
# backend/api/serializers.py

class ConsultanteSerializer(serializers.ModelSerializer):
    # Include compatibility fields
    id = serializers.IntegerField(source='user_account.id', read_only=True)
    user_id = serializers.IntegerField(source='user_account.id', read_only=True)
    # ... (ver UNIFIED_CONSULTANTE_ARCHITECTURE.md sección "Formato de Respuesta")
```

#### 1.4 Crear Views y URLs
```python
# backend/api/views.py

class ConsultanteListCreateView(generics.ListCreateAPIView):
    """Ver UNIFIED_CONSULTANTE_ARCHITECTURE.md sección 'API Endpoints'"""
    serializer_class = ConsultanteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Consultante.objects.filter(therapist=self.request.user)

class ConsultanteDetailView(generics.RetrieveUpdateDestroyAPIView):
    lookup_field = 'uuid'
    # ... (ver doc)

# Legacy compatibility adapter
class PatientLegacyAdapter(APIView):
    """Adapta /api/therapist/patients/{id}/ a Consultante"""
    # ... (ver doc completo)
```

```python
# backend/api/urls.py

urlpatterns = [
    # New endpoints
    path('consultantes/', ConsultanteListCreateView.as_view()),
    path('consultantes/<uuid:uuid>/', ConsultanteDetailView.as_view()),
    
    # Legacy compatibility (redirect)
    path('therapist/patients/<int:pk>/', PatientLegacyAdapter.as_view()),
]
```

---

### FASE 2: Database Migration (30 min)

#### 2.1 Generar migrations
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

#### 2.2 Recrear datos de test
```bash
# backend/scripts/recreate_test_consultantes.py
# COPIAR EXACTAMENTE de UNIFIED_CONSULTANTE_ARCHITECTURE.md
# Sección: "Phase 4: Test Data Recreation"

python backend/scripts/recreate_test_consultantes.py
```

**⚠️ CRÍTICO**: Verificar que CADA consultante tiene `user_account` válido:
```python
from api.models import Consultante
assert Consultante.objects.filter(user_account__isnull=True).count() == 0
```

---

### FASE 3: Frontend Integration (2-3 horas)

#### 3.1 Crear adapter layer
```typescript
// tonyblanco-app/lib/consultante-api.ts
// COPIAR de UNIFIED_CONSULTANTE_ARCHITECTURE.md sección "Frontend Integration"

export interface Consultante {
    uuid: string;
    full_name: string;
    user_account: { id: number; username: string; };
    // Compatibility fields
    id: number;  // alias to user_account.id
    user_id: number;
}

export async function listConsultantes(): Promise<Consultante[]> { ... }
export async function getConsultante(uuid: string): Promise<Consultante> { ... }

// Legacy compatibility
export async function getPatientDetail(legacyId: number): Promise<any> {
    // Redirect to consultante API
}
```

#### 3.2 Actualizar contexto activo
```typescript
// tonyblanco-app/lib/active-consultante.ts

export interface ActiveConsultante {
    uuid: string;
    id: number;  // user_id for assignments
    name: string;
}

export function getActiveConsultante(): ActiveConsultante | null { ... }
export function setActiveConsultante(consultante: ActiveConsultante): void { ... }

// Legacy compatibility
export const getActivePatient = getActiveConsultante;
```

#### 3.3 Actualizar workspace contexts
```typescript
// components/BioEmotionalExperientialWorkspace/hooks/useExperientialContext.ts

const loadContext = useCallback(async () => {
    const activeConsultante = getActiveConsultante();
    
    if (!activeConsultante) {
        setContext({
            consultanteId: null,
            consultanteUserId: null,  // NEW: Always available
            // Legacy compatibility
            patientId: null,
            patientName: null
        });
        return;
    }
    
    const consultante = await getConsultante(activeConsultante.uuid);
    setContext({
        consultanteId: consultante.user_id,
        consultanteUserId: consultante.user_id,  // CRÍTICO!
        consultanteName: consultante.full_name,
        // Compatibility aliases
        patientId: consultante.user_id,
        patientName: consultante.full_name
    });
}, []);
```

#### 3.4 Actualizar modales de asignación
```typescript
// components/AssignBioEmotionalModal.tsx

// ✅ Ya está actualizado para recibir patientUserId
// Solo verificar que se pasa correctamente desde workspace:

<AssignBioEmotionalModal
    open={assignModalOpen}
    onClose={() => setAssignModalOpen(false)}
    patientUserId={experientialContext.consultanteUserId}  // Usar este!
/>
```

---

### FASE 4: Testing & Validation (1 hora)

#### 4.1 Backend Tests
```bash
# Verificar consultantes sin user_account
python manage.py shell -c "
from api.models import Consultante
count = Consultante.objects.filter(user_account__isnull=True).count()
print(f'Consultantes sin user_account: {count}')
assert count == 0, 'ERROR: Hay consultantes sin user_account!'
"

# Test API endpoints
curl -H "Authorization: Token <token>" http://localhost:8000/api/consultantes/
curl -H "Authorization: Token <token>" http://localhost:8000/api/therapist/patients/18/
```

#### 4.2 Frontend Tests
1. **Dashboard carga**: Lista de consultantes aparece
2. **Crear consultante**: Modal funciona sin errores
3. **Seleccionar consultante**: Contexto se actualiza
4. **Workspace carga**: Bio-Emotional muestra datos correctos
5. **Assignment funciona**: Modal asigna test sin errores 404
6. **Modal se cierra**: ESC key funciona

#### 4.3 SWM Workspaces Validation
```bash
# Probar CADA workspace:
- Bio-Emotional Experiential: Carga consultante activo ✅
- SHA (Auditoría Sefirótica): Contexto correcto ✅  
- Tarot: Lectura vinculada a consultante ✅
- MCMI-4: Verificar tras migración 🔄
- Transgenerational: Verificar tras migración 🔄
```

---

## 🚨 PROBLEMAS CONOCIDOS & SOLUCIONES

### Problema 1: "Consultante no tiene cuenta de usuario vinculada"
**Causa**: `user_account` es null  
**Solución**: 
```python
consultante = Consultante.objects.get(uuid='...')
user = User.objects.create_user(username=f'user_{consultante.uuid}', email=consultante.email)
consultante.user_account = user
consultante.save()
```

### Problema 2: Assignment falla con UUID
**Causa**: API de assignments necesita user_id, no UUID  
**Solución**:
```typescript
await createAssignment({
    patient_id: consultante.user_id,  // No consultante.uuid!
    assigned_to_user_id: consultante.user_id
})
```

### Problema 3: Legacy endpoints 404
**Causa**: Adapter no configurado  
**Solución**: Verificar `PatientLegacyAdapter` en `urls.py`

---

## ✅ CHECKLIST DE COMPLETITUD

### Backend
- [ ] Modelo Consultante creado con UUID primary key
- [ ] Relaciones actualizadas (TestResult, Assignment, etc.)
- [ ] Serializers implementados con compatibility fields
- [ ] Views y URLs creados (ConsultanteListCreateView, etc.)
- [ ] Legacy adapter implementado (PatientLegacyAdapter)
- [ ] Migrations aplicadas sin errores
- [ ] Test data recreado (3+ consultantes con user_account)
- [ ] ❌ Zero consultantes sin user_account

### Frontend  
- [ ] `consultante-api.ts` creado con interfaces
- [ ] `active-consultante.ts` actualizado
- [ ] Workspace contexts actualizados (useExperientialContext)
- [ ] Modales actualizados para pasar user_id correcto
- [ ] APIs de compatibility implementadas (getPatientDetail)

### Testing
- [ ] Backend: API endpoints responden correctamente
- [ ] Frontend: Dashboard carga lista de consultantes
- [ ] Workspaces: Bio-Emotional carga datos correctos
- [ ] Assignments: Modal asigna tests sin errores
- [ ] Legacy: APIs legacy redirigen correctamente
- [ ] UX: Modal se cierra con ESC key

### Documentation
- [ ] Código comentado con referencias a docs
- [ ] README actualizado si necesario
- [ ] Commit message descriptivo

---

## 🎬 COMANDOS DE INICIO

```powershell
# 1. Asegurar servicios corriendo
./start-all.ps1

# 2. Abrir documentación
code docs/UNIFIED_CONSULTANTE_ARCHITECTURE.md
code docs/CONSULTANTE_MIGRATION_GUIDE.md

# 3. Crear branch
git checkout -b feature/consultante-architecture

# 4. Iniciar implementación
# Fase 1: Backend models...
```

---

## 📊 CRITERIOS DE ÉXITO

### Métricas de Aceptación:
1. ✅ **Zero consultantes sin user_account**
2. ✅ **Assignments funcionan** sin errores 404
3. ✅ **Workspaces cargan** consultante activo correctamente
4. ✅ **Legacy APIs** redirigen sin romper
5. ✅ **Modal se cierra** con ESC key
6. ✅ **Tests pasan** sin errores

### Definition of Done:
- [ ] Código implementado según arquitectura
- [ ] Tests funcionando (backend + frontend)
- [ ] Sin errores en consola del navegador
- [ ] Sin warnings de TypeScript
- [ ] Commit hecho con mensaje descriptivo
- [ ] Documentación actualizada si necesario

---

## 🚀 DESPUÉS DE IMPLEMENTACIÓN

1. **Testing extensivo**: Probar todos los SWM workspaces
2. **Performance check**: Verificar tiempos de carga
3. **Rollback plan**: Documentar en caso de issues
4. **Deploy staging**: Verificar en ambiente similar a producción
5. **Monitoreo**: Observar logs por 24-48 horas

---

## 🎯 MODELO RECOMENDADO

### 🥇 **Claude Opus 4.5** (PRIMERA OPCIÓN)
**Por qué:**
- ✅ Razonamiento profundo para arquitectura compleja
- ✅ Excelente con Python/Django
- ✅ Maneja múltiples archivos simultáneamente
- ✅ Debugging efectivo de issues complejos
- ✅ Genera código idiomático y bien estructurado

**Cuándo usar:**
- Implementaciones complejas multi-capa
- Migraciones de arquitectura
- Debugging de problemas no obvios

### 🥈 **GPT-5** (ALTERNATIVA)
**Por qué:**
- ✅ Velocidad de respuesta rápida
- ✅ Bueno con TypeScript/React
- ✅ Code generation efectivo

**Cuándo usar:**
- Si Opus no está disponible
- Tasks más directos
- Frontend-heavy work

### ❌ **NO usar:**
- **Claude Sonnet 4.5**: Bueno para docs, limitado para implementación pesada
- **GPT-4/4o**: Menos capacidad de razonamiento profundo
- **Gemini**: Menos experiencia con Django específicamente

---

## 📞 SOPORTE

Si encuentras issues no documentados:
1. Consultar troubleshooting en `UNIFIED_CONSULTANTE_ARCHITECTURE.md`
2. Revisar migration guide en `CONSULTANTE_MIGRATION_GUIDE.md`
3. Verificar terminología en `CONSULTANTE_TERMINOLOGY.md`
4. Consultar políticas en `WORKSPACE_ISOLATION_POLICY.md`

**RECUERDA**: Zero breaking changes, compatibility primero! 🛡️