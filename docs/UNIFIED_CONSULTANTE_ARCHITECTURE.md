# Arquitectura Unificada: Consultante System

**Fecha**: 31 de enero de 2026  
**Estado**: Documentación de diseño para migración clínico→holístico  
**Ámbito**: Backend, Frontend, APIs, Tests

---

## Resumen Ejecutivo

Transición del modelo **Patient** (clínico legacy) al modelo **Consultante** (unificado holístico) para eliminar conflictos de identidad, problemas de permisos, y inconsistencias entre sistemas.

**Problema resuelto**: Endpoints como `/api/therapist/patients/4/` devolvían 404 por restricciones de permisos, causando fallos en modales de asignación y workspaces.

**Solución**: Modelo `Consultante` con UUID global, `user_account` siempre disponible, y compatibility layer para APIs legacy.

---

## Arquitectura del Sistema

### Modelo Principal: Consultante

```python
# backend/api/models.py
class Consultante(models.Model):
    """
    Modelo unificado para personas en terapia holística.
    Reemplaza al modelo Patient (clínico legacy).
    """
    
    # Identificación global
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Identidad personal
    full_name = models.CharField(max_length=200, help_text="Nombre completo del consultante")
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    
    # Datos de nacimiento (para análisis astrológicos/cabalísticos)
    birth_date = models.DateField(null=True, blank=True)
    birth_time = models.TimeField(null=True, blank=True)
    birth_place = models.CharField(max_length=200, null=True, blank=True)
    birth_city = models.CharField(max_length=100, null=True, blank=True)
    birth_country = models.CharField(max_length=100, null=True, blank=True)
    birth_latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    birth_longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    birth_timezone = models.CharField(max_length=50, null=True, blank=True)
    
    # Identidad biológica/energética
    biological_sex = models.CharField(
        max_length=20,
        choices=[
            ('male', 'Masculino'),
            ('female', 'Femenino'),
            ('intersex', 'Intersexual'),
            ('unknown', 'No especificado'),
        ],
        default='unknown'
    )
    gender_identity = models.CharField(max_length=50, null=True, blank=True)
    
    # Relación terapéutica
    therapist = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='consultantes',
        help_text="Terapeuta asignado a este consultante"
    )
    
    # Cuenta de usuario (para tests/assignments) - CRÍTICO
    user_account = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='consultante_profile',
        help_text="Cuenta de usuario para login y asignaciones de tests"
    )
    
    # Estado terapéutico
    therapy_status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Activo'),
            ('paused', 'Pausado'),
            ('completed', 'Completado'),
            ('archived', 'Archivado'),
        ],
        default='active'
    )
    pause_reason = models.TextField(null=True, blank=True)
    status_changed_at = models.DateTimeField(auto_now=True)
    status_changed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='consultante_status_changes'
    )
    
    # Consentimientos
    consent_federation = models.BooleanField(
        default=False,
        help_text="Consiente compartir datos en Federation Hub (SCDF, SCID-5, MSHE)"
    )
    consent_federation_date = models.DateTimeField(null=True, blank=True)
    
    # Historia clínica holística
    main_complaint = models.TextField(null=True, blank=True, help_text="Motivo principal de consulta")
    clinical_history = models.TextField(null=True, blank=True)
    treatment_plan = models.TextField(null=True, blank=True)
    therapy_level = models.CharField(
        max_length=20,
        choices=[
            ('exploratory', 'Exploratorio'),
            ('therapeutic', 'Terapéutico'),
            ('transformational', 'Transformacional'),
            ('mastery', 'Maestría'),
        ],
        default='exploratory'
    )
    
    # Metadatos
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Avatar/imagen
    avatar = models.ImageField(upload_to='consultante_avatars/', null=True, blank=True)
    
    # Compatibility con sistema legacy (temporal)
    legacy_patient_id = models.IntegerField(null=True, blank=True, unique=True)
    
    class Meta:
        verbose_name = "Consultante"
        verbose_name_plural = "Consultantes"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.full_name} ({str(self.uuid)[:8]})"
    
    @property
    def display_name(self):
        """Nombre para mostrar en UI"""
        return self.full_name
    
    @property
    def user_id(self):
        """Compatibility property para APIs legacy"""
        return self.user_account.id if self.user_account else None
    
    def get_absolute_url(self):
        return f"/dashboard/therapist/consultantes/{self.uuid}/"
```

### Modelos Relacionados

```python
# backend/api/models.py - ACTUALIZAR RELACIONES EXISTENTES

# TestResult: cambiar patient_id por consultante
class TestResult(models.Model):
    consultante = models.ForeignKey(Consultante, on_delete=models.CASCADE, related_name='test_results')
    # ... resto igual

# Assignment: cambiar patient_id por consultante  
class Assignment(models.Model):
    consultante = models.ForeignKey(Consultante, on_delete=models.CASCADE, related_name='assignments')
    assigned_to_user = models.ForeignKey(User, on_delete=models.CASCADE)  # mismo que consultante.user_account
    # ... resto igual

# AnalysisRecord: cambiar patient_id por consultante
class AnalysisRecord(models.Model):
    consultante = models.ForeignKey(Consultante, on_delete=models.CASCADE, related_name='analysis_records')
    # ... resto igual

# BioEmotional models: actualizar relaciones
class BioEmotionalPatientBrief(models.Model):
    consultante = models.ForeignKey(Consultante, on_delete=models.CASCADE, related_name='bioemotional_briefs')
    # ... resto igual
```

---

## API Endpoints

### Endpoints Principales

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | `/api/consultantes/` | Lista consultantes del terapeuta | Terapeuta autenticado |
| POST | `/api/consultantes/` | Crear nuevo consultante | Terapeuta autenticado |
| GET | `/api/consultantes/{uuid}/` | Detalle de consultante | Propietario (terapeuta) |
| PUT/PATCH | `/api/consultantes/{uuid}/` | Actualizar consultante | Propietario (terapeuta) |
| DELETE | `/api/consultantes/{uuid}/` | Archivar consultante | Propietario (terapeuta) |
| POST | `/api/consultantes/{uuid}/assign/` | Asignar test a consultante | Propietario (terapeuta) |
| GET | `/api/consultantes/{uuid}/tests/` | Tests del consultante | Propietario (terapeuta) |
| GET | `/api/consultantes/{uuid}/profile/` | Perfil completo | Propietario (terapeuta) |

### Endpoints de Compatibilidad (Legacy)

| Endpoint Legacy | Redirige a | Notas |
|----------------|------------|-------|
| `/api/therapist/patients/` | `/api/consultantes/` | Adapter automático |
| `/api/therapist/patients/{id}/` | `/api/consultantes/{uuid}/` | Convierte ID→UUID |
| `/api/patients/{id}/` | `/api/consultantes/{uuid}/` | Solo si público |

### Formato de Respuesta

```json
{
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "full_name": "Luis Antonio Blanco Fontela",
    "email": "luis@example.com",
    "phone": "+34 600 123 456",
    "birth_date": "1985-03-15",
    "birth_place": "Madrid, España",
    "biological_sex": "male",
    "therapy_status": "active",
    "therapy_level": "therapeutic",
    "therapist": {
        "id": 1,
        "username": "dr.armando",
        "full_name": "Dr. Armando Ledezma"
    },
    "user_account": {
        "id": 18,
        "username": "luis.blanco",
        "email": "luis@example.com"
    },
    "main_complaint": "Ansiedad y desconexión espiritual",
    "consent_federation": true,
    "is_active": true,
    "created_at": "2026-01-15T10:30:00Z",
    "updated_at": "2026-01-31T08:45:00Z",
    
    // Campos de compatibilidad para frontend legacy
    "id": 18,  // user_account.id para assignments
    "user_id": 18,  // mismo valor
    "user": {
        "id": 18,
        "username": "luis.blanco"
    }
}
```

---

## Frontend Integration

### Adapter Layer

```typescript
// tonyblanco-app/lib/consultante-api.ts

export interface Consultante {
    uuid: string;
    full_name: string;
    email: string;
    phone?: string;
    birth_date?: string;
    biological_sex: 'male' | 'female' | 'intersex' | 'unknown';
    therapy_status: 'active' | 'paused' | 'completed' | 'archived';
    therapy_level: string;
    therapist: {
        id: number;
        username: string;
        full_name: string;
    };
    user_account: {
        id: number;
        username: string;
        email: string;
    };
    // Compatibility fields
    id: number;     // alias to user_account.id
    user_id: number; // alias to user_account.id
    user: {
        id: number;
        username: string;
    };
}

// API Functions
export async function listConsultantes(): Promise<Consultante[]> {
    const response = await fetch(`${API_BASE}/consultantes/`, {
        headers: getAuthHeaders()
    });
    return response.json();
}

export async function getConsultante(uuid: string): Promise<Consultante> {
    const response = await fetch(`${API_BASE}/consultantes/${uuid}/`, {
        headers: getAuthHeaders()
    });
    return response.json();
}

export async function createConsultante(data: Partial<Consultante>): Promise<Consultante> {
    const response = await fetch(`${API_BASE}/consultantes/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return response.json();
}

// Legacy compatibility adapter
export async function getPatientDetail(legacyId: number): Promise<any> {
    // Convert legacy Patient.id calls to Consultante UUID calls
    const response = await fetch(`${API_BASE}/consultantes/resolve/${legacyId}/`, {
        headers: getAuthHeaders()
    });
    const consultante = await response.json();
    
    // Return in expected legacy format
    return {
        id: consultante.user_id,
        full_name: consultante.full_name,
        email: consultante.email,
        user_id: consultante.user_id,
        user: {
            id: consultante.user_id,
            username: consultante.user_account.username
        },
        // Include all original fields for compatibility
        ...consultante
    };
}
```

### Active Patient Context (Updated)

```typescript
// tonyblanco-app/lib/active-consultante.ts

export interface ActiveConsultante {
    uuid: string;        // Primary ID
    id: number;          // Compatibility (user_id)
    name: string;        // Display name
}

export function getActiveConsultante(): ActiveConsultante | null {
    if (typeof window === 'undefined') return null;
    
    try {
        const stored = localStorage.getItem('therapist_active_consultante');
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

export function setActiveConsultante(consultante: ActiveConsultante): void {
    if (typeof window === 'undefined') return;
    
    try {
        localStorage.setItem('therapist_active_consultante', JSON.stringify(consultante));
        window.dispatchEvent(new Event('activeConsultanteChanged'));
    } catch (error) {
        console.warn('Error setting active consultante:', error);
    }
}

// Legacy compatibility
export const getActivePatient = getActiveConsultante;
export const setActivePatientId = (id: number, name?: string) => {
    // Convert legacy calls to new format
    setActiveConsultante({
        uuid: '', // Will be resolved by backend
        id,
        name: name || `Consultante #${id}`
    });
};
```

### Workspace Context (Minimal Changes)

```typescript
// components/BioEmotionalExperientialWorkspace/hooks/useExperientialContext.ts

export const useExperientialContext = () => {
    // ... existing code ...
    
    const loadContext = useCallback(async () => {
        const activeConsultante = getActiveConsultante(); // Changed from getActivePatient
        if (!activeConsultante) {
            setContext({
                consultanteId: null,    // Changed from patientId
                consultanteName: null,  // Changed from patientName
                consultanteUserId: null, // NEW: Always available
                biologicalSex: 'unknown',
                sessionLabel: 'Sesion actual: sin registro',
            });
            return;
        }

        setLoading(true);
        try {
            const consultante = await getConsultante(activeConsultante.uuid);
            setContext({
                consultanteId: consultante.user_id,      // Legacy compatibility
                consultanteName: consultante.full_name,
                consultanteUserId: consultante.user_id,  // Always available!
                biologicalSex: normalizeBiologicalSex(consultante.biological_sex),
                sessionLabel: 'Sesion actual: activa',
                // Compatibility aliases
                patientId: consultante.user_id,    // For legacy workspaces
                patientName: consultante.full_name // For legacy workspaces
            });
        } catch (err) {
            console.error('Error loading experiential context', err);
            // ... error handling
        } finally {
            setLoading(false);
        }
    }, []);
    
    // ... rest unchanged
};
```

---

## Migration Strategy

### Phase 1: Backend Schema (Day 1)

```bash
# Create new models
python manage.py makemigrations
python manage.py migrate

# Data migration script
python manage.py migrate_patients_to_consultantes
```

### Phase 2: API Endpoints (Day 1)

```python
# backend/api/views.py - NEW VIEWS

class ConsultanteListCreateView(generics.ListCreateAPIView):
    serializer_class = ConsultanteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only consultantes of the authenticated therapist
        return Consultante.objects.filter(therapist=self.request.user)
    
    def perform_create(self, serializer):
        # Auto-assign therapist
        serializer.save(therapist=self.request.user)

class ConsultanteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ConsultanteSerializer
    lookup_field = 'uuid'
    
    def get_queryset(self):
        return Consultante.objects.filter(therapist=self.request.user)

# Legacy compatibility view
class PatientLegacyAdapter(APIView):
    """Adapts legacy /api/therapist/patients/{id}/ calls"""
    
    def get(self, request, pk):
        try:
            # Find consultante by legacy_patient_id or user_account.id
            consultante = Consultante.objects.filter(
                Q(legacy_patient_id=pk) | Q(user_account__id=pk),
                therapist=request.user
            ).first()
            
            if not consultante:
                return Response({'detail': 'Not found.'}, status=404)
            
            # Return in legacy format expected by frontend
            return Response({
                'id': consultante.user_id,
                'full_name': consultante.full_name,
                'email': consultante.email,
                'user_id': consultante.user_id,
                'user': {
                    'id': consultante.user_id,
                    'username': consultante.user_account.username
                },
                'therapy_status': consultante.therapy_status,
                'uuid': str(consultante.uuid)
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)
```

### Phase 3: Frontend Gradual Update (Days 2-3)

1. Update assignment modals to use legacy adapter first
2. Update workspace contexts with compatibility aliases
3. Test all SWM workspaces still work
4. Gradually migrate to UUID endpoints

### Phase 4: Test Data Recreation (Day 1)

```python
# backend/scripts/recreate_test_consultantes.py

def recreate_test_data():
    """Recreate clean test consultantes"""
    
    # Clear test data
    Consultante.objects.filter(therapist__username__startswith='test_').delete()
    User.objects.filter(username__startswith='test_').delete()
    
    # Create test therapist
    therapist = User.objects.create_user(
        username='test_therapist',
        email='therapist@test.com',
        password='test123',
        first_name='Dr. Armando',
        last_name='Ledezma'
    )
    
    # Create test consultantes
    consultantes_data = [
        {
            'name': 'Luis Antonio Blanco Fontela',
            'email': 'luis@test.com',
            'birth_date': '1985-03-15',
            'biological_sex': 'male',
            'main_complaint': 'Ansiedad y desconexión espiritual'
        },
        {
            'name': 'María García Rodríguez', 
            'email': 'maria@test.com',
            'birth_date': '1990-07-22',
            'biological_sex': 'female',
            'main_complaint': 'Depresión y búsqueda de propósito'
        },
        {
            'name': 'Carlos Mendoza Silva',
            'email': 'carlos@test.com', 
            'birth_date': '1978-11-05',
            'biological_sex': 'male',
            'main_complaint': 'Estrés laboral y relaciones familiares'
        }
    ]
    
    for i, data in enumerate(consultantes_data):
        # Create user account for consultante
        user = User.objects.create_user(
            username=f'consultante_{i+1}',
            email=data['email'],
            password='test123',
            first_name=data['name'].split()[0],
            last_name=' '.join(data['name'].split()[1:])
        )
        
        # Create consultante
        consultante = Consultante.objects.create(
            full_name=data['name'],
            email=data['email'],
            birth_date=data['birth_date'],
            biological_sex=data['biological_sex'],
            main_complaint=data['main_complaint'],
            therapist=therapist,
            user_account=user,
            therapy_status='active',
            therapy_level='therapeutic'
        )
        
        print(f"Created consultante: {consultante.full_name} (UUID: {consultante.uuid})")
```

---

## Breaking Changes & Compatibility

### ⚠️ Breaking Changes

1. **Model Name**: `Patient` → `Consultante`
2. **Primary Key**: `id` (int) → `uuid` (UUID) 
3. **URL patterns**: `/patients/` → `/consultantes/`
4. **Field names**: `patient_id` → `consultante_id`

### ✅ Compatibility Maintained

1. **Assignment APIs**: Still work with user IDs
2. **Test execution**: Still uses user_account.id  
3. **Workspace contexts**: Include legacy aliases
4. **Active patient storage**: Backward compatible
5. **SWM modules**: No changes needed initially

### Migration Mapping

| Legacy | New | Notes |
|--------|-----|-------|
| `Patient.id` | `Consultante.user_account.id` | For assignments |
| `Patient` model | `Consultante` model | New unified schema |
| `/api/therapist/patients/` | `/api/consultantes/` | Redirected |
| `patient_id` fields | `consultante` ForeignKey | Updated relations |
| `getActivePatient()` | `getActiveConsultante()` | With compatibility |

---

## Testing Strategy

### Backend Tests

```python
# backend/tests/test_consultante_api.py

class ConsultanteAPITestCase(APITestCase):
    def setUp(self):
        self.therapist = User.objects.create_user(
            username='test_therapist',
            password='test123'
        )
        self.client.force_authenticate(user=self.therapist)
        
    def test_create_consultante(self):
        """Test creating a new consultante"""
        data = {
            'full_name': 'Test Consultante',
            'email': 'test@example.com',
            'biological_sex': 'female'
        }
        response = self.client.post('/api/consultantes/', data)
        self.assertEqual(response.status_code, 201)
        
        consultante = Consultante.objects.get(uuid=response.data['uuid'])
        self.assertEqual(consultante.full_name, 'Test Consultante')
        self.assertEqual(consultante.therapist, self.therapist)
        self.assertIsNotNone(consultante.user_account)
        
    def test_legacy_patient_adapter(self):
        """Test legacy API compatibility"""
        consultante = create_test_consultante(self.therapist)
        
        # Test legacy endpoint
        response = self.client.get(f'/api/therapist/patients/{consultante.user_id}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['user_id'], consultante.user_id)
        
    def test_assignment_compatibility(self):
        """Test that assignments still work with user IDs"""
        consultante = create_test_consultante(self.therapist)
        
        assignment_data = {
            'patient_id': consultante.user_id,  # Legacy field name
            'assigned_to_user_id': consultante.user_id,
            'test_type': 'bioemotional_intake'
        }
        response = self.client.post('/api/assignments/', assignment_data)
        self.assertEqual(response.status_code, 201)
```

### Frontend Tests

```typescript
// tonyblanco-app/__tests__/consultante-api.test.ts

describe('Consultante API', () => {
    test('getPatientDetail compatibility', async () => {
        const mockConsultante = {
            uuid: 'test-uuid',
            full_name: 'Test Consultante',
            user_id: 123
        };
        
        jest.spyOn(global, 'fetch').mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockConsultante)
        } as any);
        
        const result = await getPatientDetail(123);
        
        expect(result.user_id).toBe(123);
        expect(result.user.id).toBe(123);
        expect(result.full_name).toBe('Test Consultante');
    });
    
    test('active consultante context', () => {
        const consultante = {
            uuid: 'test-uuid',
            id: 123,
            name: 'Test Consultante'
        };
        
        setActiveConsultante(consultante);
        const retrieved = getActiveConsultante();
        
        expect(retrieved?.uuid).toBe('test-uuid');
        expect(retrieved?.id).toBe(123);
    });
});
```

---

## Security & Permissions

### Permission Classes

```python
# backend/api/permissions.py

class IsConsultanteOwner(permissions.BasePermission):
    """
    Permission to only allow therapists to access their own consultantes.
    """
    
    def has_object_permission(self, request, view, obj):
        # obj is a Consultante instance
        return obj.therapist == request.user

class IsConsultanteUserAccount(permissions.BasePermission):
    """
    Permission for consultantes to access their own data.
    """
    
    def has_object_permission(self, request, view, obj):
        # obj is a Consultante instance
        return obj.user_account == request.user
```

### View Permissions

```python
# backend/api/views.py

class ConsultanteDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsConsultanteOwner]
    # ...

class ConsultanteTestsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsConsultanteOwner]
    # ...
```

---

## Configuration & Settings

### Django Settings Updates

```python
# backend/core/settings.py

# Add new model to admin
INSTALLED_APPS = [
    # ... existing apps
    'api',  # Make sure api app is included
]

# Update serializers default field mapping
REST_FRAMEWORK = {
    # ... existing config
    'DEFAULT_FIELD_MAPPING': {
        models.UUIDField: serializers.UUIDField,
    }
}

# Logging for consultante operations
LOGGING = {
    'loggers': {
        'consultante_operations': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    }
}
```

### Environment Variables

```bash
# .env additions for consultante system

# UUID format validation
CONSULTANTE_UUID_VERSION=4

# Auto-create user accounts for new consultantes
AUTO_CREATE_CONSULTANTE_ACCOUNTS=true

# Legacy compatibility mode (during migration)
ENABLE_PATIENT_COMPATIBILITY=true
```

---

## Monitoring & Observability

### Key Metrics

1. **Consultante Creation Rate**: New consultantes per day/week
2. **Legacy API Usage**: Calls to `/therapist/patients/` endpoints
3. **Assignment Success Rate**: Test assignments via new system
4. **User Account Sync**: Consultantes without user_account (should be 0)

### Health Checks

```python
# backend/api/health.py

def consultante_system_health():
    """Health check for consultante system integrity"""
    
    checks = {
        'total_consultantes': Consultante.objects.count(),
        'consultantes_without_user': Consultante.objects.filter(user_account__isnull=True).count(),
        'orphaned_users': User.objects.filter(consultante_profile__isnull=True, is_staff=False).count(),
        'legacy_patient_references': Consultante.objects.exclude(legacy_patient_id__isnull=True).count()
    }
    
    # Health status
    checks['status'] = 'healthy' if checks['consultantes_without_user'] == 0 else 'warning'
    
    return checks
```

---

## Troubleshooting Guide

### Common Issues

#### 1. "Consultante no tiene cuenta de usuario vinculada"

**Causa**: `user_account` es `null`  
**Solución**: 
```python
# Fix orphaned consultante
consultante = Consultante.objects.get(uuid='...')
user = User.objects.create_user(
    username=f'user_{consultante.uuid}',
    email=consultante.email
)
consultante.user_account = user
consultante.save()
```

#### 2. Legacy endpoints returning 404

**Causa**: Compatibility adapter not configured  
**Verificación**:
```python
# Check if legacy adapter is in urls.py
python manage.py show_urls | grep patients
```

#### 3. UUID not recognized in frontend

**Causa**: Frontend expecting integer IDs  
**Solución**: Use compatibility fields
```typescript
// Use user_id instead of uuid for legacy components
const consultanteId = consultante.user_id; // not consultante.uuid
```

#### 4. Assignment failing with consultante UUID

**Causa**: Assignment API expects user IDs, not UUIDs  
**Solución**:
```typescript
// Use user_account.id for assignments
await createAssignment({
    patient_id: consultante.user_id,  // Not consultante.uuid
    assigned_to_user_id: consultante.user_id
});
```

### Debug Commands

```bash
# Check consultante integrity
python manage.py shell -c "
from api.models import Consultante
print('Consultantes without user_account:', Consultante.objects.filter(user_account__isnull=True).count())
print('Total consultantes:', Consultante.objects.count())
"

# Migrate legacy patient data
python manage.py migrate_patients_to_consultantes --dry-run

# Test legacy API compatibility
curl -H "Authorization: Token <token>" http://localhost:8000/api/therapist/patients/18/

# Check active consultante storage
# Browser console:
# localStorage.getItem('therapist_active_consultante')
```

---

## Rollback Plan

### Emergency Rollback (if needed)

1. **Revert migrations**: `python manage.py migrate api <previous_migration>`
2. **Restore legacy views**: Comment out new views, uncomment old ones
3. **Frontend rollback**: Revert to `getActivePatient()` calls
4. **Database backup**: Restore from pre-migration backup

### Rollback Commands

```bash
# 1. Database rollback
python manage.py migrate api 0025_patient_model  # Replace with actual migration

# 2. Code rollback
git revert <consultante_commit_hash>

# 3. Clear cached data
python manage.py shell -c "
from django.core.cache import cache
cache.clear()
"

# 4. Restart services
./start-all.ps1
```

---

## Cabala Aplicada Integration

### Endpoints Específicos de Cabala Aplicada (UUID-based)

Implementados el 31 de enero de 2026:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/consultantes/{uuid}/cabala-aplicada/records/` | Guardar ejecución de método simbólico |
| GET | `/api/consultantes/{uuid}/cabala-analyses/` | Listar análisis cabalísticos |
| POST | `/api/consultantes/{uuid}/cabala-analyses/` | Crear nuevo análisis |
| GET | `/api/consultantes/{uuid}/cabala-cycles/` | Obtener ciclos cabalísticos |

### Views (backend/api/cabalistic_views.py)

```python
# Nuevas vistas implementadas

class ConsultanteCabalaAplicadaRecordView(APIView):
    """POST /api/consultantes/<uuid>/cabala-aplicada/records/"""
    # Guarda ejecuciones de métodos simbólicos

class ConsultanteCabalaAnalysisListView(APIView):
    """GET/POST /api/consultantes/<uuid>/cabala-analyses/"""
    # Lista y crea análisis cabalísticos

class ConsultanteCabalaCyclesView(APIView):
    """GET /api/consultantes/<uuid>/cabala-cycles/"""
    # Retorna ciclos septenarios y novenarios
```

### Frontend API (lib/consultante-api.ts)

```typescript
// Funciones añadidas

// Guardar registro de Cabala Aplicada
await saveCabalaAplicadaRecord(consultanteUuid, {
  method_id: 'pitagoras',
  method_name: 'Método Pitágoras',
  method_output: { /* resultados */ },
  tree_state: { /* estado del árbol */ }
});

// Listar análisis
const { analyses } = await listCabalaAnalyses(consultanteUuid);

// Obtener ciclos
const { cycles } = await getCabalaCycles(consultanteUuid);
```

### Compatibilidad Layer (backend/api/compatibility.py)

```python
from api.compatibility import LegacyPatientAdapter

# Convertir patient_id a consultante_uuid
uuid = LegacyPatientAdapter.patient_id_to_uuid(patient_id, therapist)

# Obtener consultante por ID legacy
consultante = LegacyPatientAdapter.get_consultante_by_legacy_id(patient_id, therapist)

# Convertir a formato legacy para frontend antiguo
legacy_data = LegacyPatientAdapter.to_legacy_format(consultante)
```

### UI Terminology Updates

Archivos actualizados para usar "consultante" en lugar de "paciente":

- `CabalAppliedToolsPanel.tsx`
- `CabalaAplicadaHistoryList.tsx`
- `CabalAppliedVisualCore.tsx`

Ejemplo de cambio:
```tsx
// ❌ ANTES
<span>Selecciona un paciente para ver el historial.</span>

// ✅ DESPUÉS
<span>Selecciona un consultante para ver el historial.</span>
```

---

## Future Enhancements

### Phase 2 Features (Post-Migration)

1. **Consultante Groups**: Family therapy, couples, etc.
2. **Energy Profile**: Aura colors, chakra states, etc.
3. **Sacred Geometry**: Personal geometric patterns
4. **Astrological Cache**: Pre-computed charts
5. **Holistic Timeline**: Life events with cosmic correlations

### Phase 3 Features

1. **Multi-Therapist Support**: Consultante with multiple therapists
2. **Peer Consultante Network**: Connections between consultantes
3. **Consultante Portal**: Self-service dashboard for consultantes
4. **Mobile App**: Native iOS/Android for consultantes

---

## Conclusion

La migración de **Patient** a **Consultante** elimina los problemas fundamentales de permisos y identidad que causaban fallos en assignments y workspaces. 

**Beneficios clave**:
✅ **User ID siempre disponible** (OneToOne con User)  
✅ **Sin problemas de permisos** (ownership claro)  
✅ **Esquema holístico unificado**  
✅ **Compatibilidad con código existente**  
✅ **Escalable para futuras funcionalidades**  

**Timeline recomendado**: 
- **Día 1**: Implementar backend + recrear data de test
- **Día 2**: Probar todos los workspaces y assignments
- **Día 3**: Cleanup y documentación final

La arquitectura está diseñada para **zero-breaking-changes** en el corto plazo y **máxima flexibilidad** en el largo plazo.