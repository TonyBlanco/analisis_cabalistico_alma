# MODELO DE RECURSOS – ESPECIFICACIÓN VALIDADA

**Fecha**: 2025-12-16  
**Estado**: Propuesta Validada + FASE SELLADA (Modelo de Acceso)  
**Versión**: 1.0

---

## 0. MODELO DE ACCESO A RECURSOS (FASE SELLADA)

**⚠️ ESTA FASE ESTÁ SELLADA - NO NEGOCIABLE**

### 0.1 Principio Rector (No Negociable)

1. ✅ **El recurso existe una sola vez**
2. ✅ **El acceso NO se codifica en el recurso, sino en una tabla de relación**
3. ✅ **No hay pagos todavía → solo origen de acceso**
4. ✅ **No se rompe nada existente**

### 0.2 Nuevos Conceptos (Mínimos)

#### Resource (Conceptual)

Ya asumimos que existe o existirá algo como:

```python
Resource
- id (UUID)
- title
- type (audio | video | curso | clase | etc)
- category
- level (free | basic | advanced | premium)
- created_by (admin)
```

**⚠️ NO tocar ahora si ya existe algo parecido.**

---

### 0.3 MODELO CLAVE: UserResourceAccess

**Este es el núcleo de todo.**

#### 0.3.1 Tabla / Modelo

```python
class UserResourceAccess(models.Model):
    """
    Modelo de acceso a recursos - FASE SELLADA
    Define cómo un usuario accedió a un recurso específico.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resource_accesses')
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='user_accesses')
    
    # Fuente del acceso
    SOURCE_CHOICES = [
        ('free', 'Gratuito'),
        ('assigned_by_therapist', 'Asignado por terapeuta'),
        ('self_purchased', 'Comprado por el usuario'),
    ]
    source = models.CharField(max_length=30, choices=SOURCE_CHOICES)
    
    # Metadatos según la fuente
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_resources',
        help_text="Terapeuta que asignó el recurso (solo si source='assigned_by_therapist')"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'resource']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'source']),
            models.Index(fields=['resource', 'source']),
            models.Index(fields=['user', 'resource']),
        ]
    
    def clean(self):
        """Validación de integridad"""
        # assigned_by solo se rellena si source = assigned_by_therapist
        if self.source != 'assigned_by_therapist' and self.assigned_by is not None:
            raise ValidationError("assigned_by solo puede tener valor si source='assigned_by_therapist'")
        
        # Si source = assigned_by_therapist, assigned_by es obligatorio
        if self.source == 'assigned_by_therapist' and self.assigned_by is None:
            raise ValidationError("assigned_by es obligatorio si source='assigned_by_therapist'")
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
```

#### 0.3.2 Reglas de Integridad

1. **`(user, resource)` es único**
   - → Un recurso no se duplica por usuario
   - → Si un usuario ya tiene acceso, no se crea otro registro

2. **`assigned_by`:**
   - ✅ SOLO se rellena si `source = assigned_by_therapist`
   - ✅ Debe ser un usuario con rol `therapist`
   - ✅ Debe tener ownership sobre el paciente (validación en endpoint)

3. **`self_purchased`:**
   - ✅ No requiere terapeuta
   - ✅ En el futuro se enlazará con pagos
   - ✅ Por ahora es simulación

---

### 0.4 Reglas por Rol (Backend)

#### 👤 PERSONAL

**Puede tener `UserResourceAccess` solo con:**
- ✅ `free`
- ✅ `self_purchased`

**NO puede tener:**
- ❌ `assigned_by_therapist` (no tiene terapeuta)

#### 🧑‍⚕️ PATIENT

**Puede tener:**
- ✅ `free`
- ✅ `assigned_by_therapist`
- ✅ `self_purchased`

**Validaciones:**
- Si `source='assigned_by_therapist'`, `assigned_by` debe ser su terapeuta asignado
- Puede tener múltiples fuentes para el mismo recurso (aunque `(user, resource)` es único, solo se guarda el primero)

#### 🧑‍⚕️ TERAPEUTA

**Puede:**
- ✅ Asignar recursos a pacientes (`POST /api/patients/{id}/resources/assign`)
- ✅ Tener recursos propios (`self_purchased`)

**NO puede:**
- ❌ Asignarse recursos a sí mismo como terapeuta
- ❌ Tener `assigned_by_therapist` (no es paciente)

---

### 0.5 Endpoints Mínimos (Sin Frontend Complejo)

#### 0.5.1 Listar Recursos Accesibles para el Usuario Actual

```
GET /api/resources/my/
```

**Respuesta:**
```json
{
  "resources": [
    {
      "id": "uuid",
      "title": "Meditación Guiada",
      "type": "audio",
      "category": "meditaciones",
      "level": "free",
      "access": {
        "source": "free",
        "created_at": "2025-12-16T10:00:00Z"
      }
    },
    {
      "id": "uuid",
      "title": "Curso de Mindfulness",
      "type": "curso",
      "category": "desarrollo-personal",
      "level": "premium",
      "access": {
        "source": "assigned_by_therapist",
        "assigned_by": {
          "id": 123,
          "full_name": "Dr. García"
        },
        "created_at": "2025-12-15T14:30:00Z"
      }
    }
  ]
}
```

**Lógica:**
- Devuelve recursos `free` (según `level='free'` y `visibility_roles`)
- Devuelve recursos con `UserResourceAccess` para ese usuario
- Filtra por rol del usuario (Personal no ve clínicos)

#### 0.5.2 Asignar Recurso a Paciente (Terapeuta)

```
POST /api/patients/{id}/resources/assign
```

**Request:**
```json
{
  "resource_id": "uuid"
}
```

**Validaciones:**
1. ✅ `requester` es `therapist`
2. ✅ Ownership `therapist–patient` (el paciente está asignado al terapeuta)
3. ✅ No duplicar acceso (si ya existe `UserResourceAccess` para ese `(user, resource)`, retornar 409 Conflict)
4. ✅ El recurso existe y está activo
5. ✅ El recurso es `assignable_by_therapist=true` (opcional, según modelo Resource)

**Respuesta (201 Created):**
```json
{
  "id": "uuid",
  "user": 456,
  "resource": {
    "id": "uuid",
    "title": "Ejercicio de Mindfulness"
  },
  "source": "assigned_by_therapist",
  "assigned_by": {
    "id": 123,
    "full_name": "Dr. García"
  },
  "created_at": "2025-12-16T10:00:00Z"
}
```

**Errores:**
- `400 Bad Request`: Validación fallida
- `403 Forbidden`: No es terapeuta o no tiene ownership
- `404 Not Found`: Recurso o paciente no existe
- `409 Conflict`: Ya existe acceso para ese recurso

#### 0.5.3 Simular "Compra" (Temporal)

```
POST /api/resources/{id}/acquire
```

**Request:**
```json
{}
```

**Validaciones:**
1. ✅ Usuario autenticado
2. ✅ Recurso existe y está activo
3. ✅ Recurso es `purchasable=true` (opcional, según modelo Resource)
4. ✅ No duplicar acceso (si ya existe `UserResourceAccess`, retornar 409 Conflict)

**Lógica:**
- Crea `UserResourceAccess` con `source='self_purchased'`
- `assigned_by = null`
- Más adelante se engancha a Stripe (webhook de pago exitoso)

**Respuesta (201 Created):**
```json
{
  "id": "uuid",
  "user": 456,
  "resource": {
    "id": "uuid",
    "title": "Curso Avanzado de Cabalá"
  },
  "source": "self_purchased",
  "assigned_by": null,
  "created_at": "2025-12-16T10:00:00Z"
}
```

**Nota para Terapeutas:**
- Si el usuario es `patient` y tiene terapeuta asignado, crear notificación para el terapeuta:
  - `TherapistNotification`: "Tu paciente {patient} ha adquirido el recurso {resource}"

---

### 0.6 Resumen de la Fase Sellada

✅ **Modelo `UserResourceAccess`**: Tabla de relación que rastrea acceso sin duplicar recursos  
✅ **Tres fuentes de acceso**: `free`, `assigned_by_therapist`, `self_purchased`  
✅ **Reglas por rol**: Personal, Patient, Therapist tienen restricciones claras  
✅ **Endpoints mínimos**: Listar, asignar, adquirir (simulado)  
✅ **Preparado para pagos**: `self_purchased` se enganchará a Stripe en el futuro  
✅ **No rompe nada**: Es complementario al sistema existente  

**Esta fase está SELLADA y lista para implementación.**

---

## 1. PRINCIPIO FUNDAMENTAL

**Un recurso existe una sola vez físicamente. Lo que cambia es quién puede verlo, comprarlo, asignarlo o adquirirlo.**

Este modelo elimina duplicación de recursos y permite gestión centralizada por ADMIN, mientras mantiene control granular de acceso por rol.

---

## 2. ESTRUCTURA FÍSICA ÚNICA (ADMIN)

### 2.1 Repositorio Central

Existe **UN SOLO repositorio de recursos**, gestionado exclusivamente por ADMIN:

```
/recursos
  /audios
  /books
  /videos
  /meditaciones
  /cabala
  /desarrollo-personal
  /cursos
  /clases
  /...
```

### 2.2 Características Clave

- ✅ **Los recursos NO se duplican por rol**
- ✅ **El recurso existe una sola vez**
- ✅ **Lo que cambia es**:
  - Quién puede verlo (`visibility_roles`)
  - Quién puede comprarlo (`purchasable`)
  - Quién puede asignarlo (`assignable_by_therapist`)
  - Quién lo ha adquirido (tabla de relaciones `UserResource` o `PatientResource`)

### 2.3 Permisos de ADMIN

ADMIN puede:
- ✅ Crear categorías nuevas **sin tocar código**
- ✅ Subir recursos
- ✅ Marcar metadatos (tipo, nivel, acceso, precio futuro, etc.)
- ✅ Gestionar visibilidad por rol
- ✅ Configurar reglas de asignación

---

## 3. MODELO LÓGICO DEL RECURSO

### 3.1 Estructura de Metadatos

Cada recurso tiene metadatos claros que definen su comportamiento:

```typescript
interface Resource {
  // Identificación
  id: string | number;
  title: string;
  description?: string;
  
  // Clasificación
  type: 'audio' | 'video' | 'book' | 'curso' | 'clase' | 'meditacion' | 'pdf' | 'otro';
  category: string; // Categoría libre (ej: "cabala", "desarrollo-personal", "clínica")
  
  // Nivel de acceso
  level: 'free' | 'basic' | 'advanced' | 'premium';
  
  // Control de visibilidad
  visibility_roles: ('therapist' | 'patient' | 'personal')[];
  
  // Reglas de acceso
  purchasable: boolean; // ¿Se puede comprar?
  assignable_by_therapist: boolean; // ¿Puede un terapeuta asignarlo a pacientes?
  
  // Metadatos administrativos
  created_by: number; // ID del admin que lo creó
  created_at: string;
  updated_at: string;
  
  // Archivo físico
  file_url?: string; // URL del archivo (S3, CDN, etc.)
  file_size?: number;
  file_type?: string;
  
  // Precio futuro (opcional, para sistema de pagos)
  price_usd?: number;
  price_eur?: number;
  
  // Estado
  is_active: boolean;
  is_featured?: boolean;
}
```

### 3.2 Ejemplos de Configuración

#### Recurso Gratuito para Todos
```json
{
  "title": "Meditación Guiada - Respiración",
  "type": "audio",
  "category": "meditaciones",
  "level": "free",
  "visibility_roles": ["therapist", "patient", "personal"],
  "purchasable": false,
  "assignable_by_therapist": true
}
```

#### Recurso Premium Solo para Personal
```json
{
  "title": "Curso Avanzado de Cabalá",
  "type": "curso",
  "category": "cabala",
  "level": "premium",
  "visibility_roles": ["personal"],
  "purchasable": true,
  "assignable_by_therapist": false,
  "price_usd": 99.99
}
```

#### Recurso Clínico Solo para Terapeutas
```json
{
  "title": "Protocolo de Evaluación Clínica",
  "type": "pdf",
  "category": "clínica",
  "level": "advanced",
  "visibility_roles": ["therapist"],
  "purchasable": false,
  "assignable_by_therapist": true
}
```

#### Recurso Asignable a Pacientes
```json
{
  "title": "Ejercicio de Mindfulness",
  "type": "video",
  "category": "desarrollo-personal",
  "level": "basic",
  "visibility_roles": ["therapist", "patient"],
  "purchasable": false,
  "assignable_by_therapist": true
}
```

---

## 4. MODELO DE ACCESO POR ROL

### 4.1 Reglas de Acceso por Rol

#### 🔹 PERSONAL

**Ve:**
- ✅ Recursos `free`
- ✅ Recursos `basic`
- ❌ **NO ve**: Recursos clínicos o terapéuticos

**Puede:**
- ✅ Explorar el catálogo general (con filtros)
- ✅ Consumir recursos disponibles
- ✅ Comprar cursos si existen (sistema de pagos futuro)

**Restricciones:**
- ❌ NO hay terapeuta asociado (todavía)
- ❌ NO puede ver recursos marcados como `category: 'clínica'` o `level: 'advanced'` (si son clínicos)

#### 🔹 PATIENTE

**Ve:**
- ✅ Recursos asignados por su terapeuta
- ✅ Recursos `free`
- ✅ Recursos que él mismo compró

**Puede:**
- ✅ Comprar recursos por curiosidad personal
- ✅ Consumir sin intervención del terapeuta

**El sistema:**
- 📧 **Notifica al terapeuta**: "Tu paciente ha adquirido el recurso X"

**⚠️ Importante:**
- El terapeuta **NO bloquea** lo que el paciente compra por iniciativa propia.
- El terapeuta puede usar esa información como input terapéutico, **no como control**.

#### 🔹 TERAPEUTA

**Ve:**
- ✅ Todo el catálogo general (igual que los demás)

**Puede:**
- ✅ Comprar cursos para sí mismo
- ✅ Asignar recursos a pacientes

**Recibe notificaciones cuando:**
- 📧 Un paciente compra algo por su cuenta

**Uso de información:**
- Puede usar esa información como input terapéutico, **no como control**.

#### 🔹 ADMIN

**Ve:**
- ✅ Todos los recursos (sin filtros)

**Puede:**
- ✅ Crear, editar, eliminar recursos
- ✅ Gestionar catálogo completo
- ✅ Configurar metadatos y reglas de acceso

---

### 4.2 Catálogo General (CLAVE)

**Existe un Catálogo General de Recursos** accesible por:
- ✅ Therapist
- ✅ Patient
- ✅ Personal

**Pero con filtros automáticos:**

1. **"Disponible para ti"**
   - Recursos que el usuario puede ver según su rol y `visibility_roles`
   - Recursos `free` y `basic` para todos
   - Recursos `premium` si el usuario los ha comprado

2. **"Asignado por tu terapeuta"** (solo Patient)
   - Recursos asignados específicamente al paciente por su terapeuta
   - Incluye recursos que el terapeuta marcó como `assignable_by_therapist=true`

3. **"Comprado por ti"**
   - Recursos que el usuario ha adquirido mediante compra
   - Solo visible si `purchasable=true` y el usuario completó la compra

4. **"Recomendado"**
   - Recursos destacados (`is_featured=true`)
   - Recursos sugeridos según el perfil del usuario
   - Recursos populares en la categoría del usuario

**👉 Esto es MUY importante:**
- ✅ **Todos pueden explorar**, pero no todos pueden consumir todo
- ✅ Esto genera:
  - **Curiosidad**: Ver recursos que no están disponibles aún
  - **Deseo**: Querer acceder a recursos premium
  - **Monetización futura**: Incentivo para comprar
  - **Autonomía del usuario**: El paciente puede comprar por su cuenta

---

### 4.3 Matriz de Acceso (Resumen)

| Rol | Ver Catálogo | Ver Clínicos | Comprar | Asignar | Recibir Asignado | Notificaciones |
|-----|--------------|--------------|---------|---------|------------------|----------------|
| **ADMIN** | ✅ Todo | ✅ Todo | ✅ Todo | ✅ Todo | N/A | N/A |
| **Therapist** | ✅ General | ✅ Sí | ✅ Sí | ✅ Sí | N/A | 📧 Cuando paciente compra |
| **Patient** | ✅ General | ❌ No | ✅ Sí | ❌ No | ✅ Sí | - |
| **Personal** | ✅ General | ❌ No | ✅ Sí | ❌ No | ❌ No | - |

---

### 4.4 Reglas de Visibilidad Técnicas

Un recurso es visible para un rol si:
1. El rol está en `visibility_roles` **Y**
2. El recurso está `is_active=true` **Y**
3. (Opcional) El usuario ha adquirido el recurso (si `purchasable=true`) **O**
4. (Para Patient) El recurso está asignado por su terapeuta

**Filtros adicionales:**
- **Personal**: NO ve recursos con `category: 'clínica'` o marcados como terapéuticos
- **Patient**: Ve recursos asignados + recursos `free` + recursos comprados
- **Therapist**: Ve todo el catálogo general sin restricciones de categoría

---

### 4.5 Asignación por Terapeuta

- Un terapeuta puede asignar un recurso a un paciente si:
  - `assignable_by_therapist=true` **Y**
  - El recurso es visible para `therapist` **Y**
  - El paciente está asignado al terapeuta

- El paciente recibe el recurso asignado automáticamente en su dashboard.

- **Independencia del paciente**: Si el paciente compra un recurso por su cuenta, el terapeuta recibe notificación pero NO puede bloquearlo.

- **Valor clínico y terapéutico**: 
  - ✅ **Si el paciente compra algo por su cuenta, el terapeuta lo ve y ya no tiene que recomendarlo.**
  - ✅ Esto es excelente porque:
    - **Respeta la autonomía del paciente**: El paciente toma decisiones propias
    - **Reduce fricción terapeuta–paciente**: No hay conflicto por control
    - **Convierte el sistema en ecosistema, no en control**: El terapeuta acompaña, no dirige
    - **Permite**:
      - **Terapia reactiva**: El terapeuta responde a las acciones del paciente
      - **Acompañamiento inteligente**: El terapeuta entiende el proceso interno del paciente
      - **Lectura del proceso interno**: Las compras revelan intereses y necesidades del paciente

- **Evaluación del modelo**:
  - ✅ Desde el punto de vista **clínico y espiritual**: ✔️
  - ✅ Desde el punto de vista de **negocio**: ✔️✔️
  - ✅ Desde el punto de vista **ético**: ✔️✔️✔️

---

## 5. MODELO DE DATOS (Backend - Django)

### 5.1 Modelo Resource (Propuesto)

```python
class Resource(models.Model):
    # Identificación
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Clasificación
    RESOURCE_TYPES = [
        ('audio', 'Audio'),
        ('video', 'Video'),
        ('book', 'Libro'),
        ('curso', 'Curso'),
        ('clase', 'Clase'),
        ('meditacion', 'Meditación'),
        ('pdf', 'PDF'),
        ('otro', 'Otro'),
    ]
    type = models.CharField(max_length=20, choices=RESOURCE_TYPES)
    category = models.CharField(max_length=100)  # Categoría libre
    
    # Nivel de acceso
    LEVEL_CHOICES = [
        ('free', 'Gratuito'),
        ('basic', 'Básico'),
        ('advanced', 'Avanzado'),
        ('premium', 'Premium'),
    ]
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='free')
    
    # Control de visibilidad (JSONField o ManyToMany)
    visibility_roles = models.JSONField(default=list)  # ['therapist', 'patient', 'personal']
    
    # Reglas de acceso
    purchasable = models.BooleanField(default=False)
    assignable_by_therapist = models.BooleanField(default=False)
    
    # Archivo físico
    file_url = models.URLField(blank=True, null=True)
    file_size = models.IntegerField(blank=True, null=True)
    file_type = models.CharField(max_length=50, blank=True)
    
    # Precio futuro
    price_usd = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    price_eur = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    # Estado
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    # Metadatos administrativos
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_resources')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['type', 'category']),
            models.Index(fields=['is_active', 'level']),
        ]
```

### 5.2 Modelo de Asignación (Propuesto)

```python
class PatientResourceAssignment(models.Model):
    """Asignación de recurso a paciente por terapeuta"""
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='assigned_resources')
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='patient_assignments')
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='resource_assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)  # Notas del terapeuta sobre la asignación
    
    class Meta:
        unique_together = ['patient', 'resource']
        ordering = ['-assigned_at']
```

### 5.3 Modelo de Adquisición (Futuro - Sistema de Pagos)

```python
class UserResourcePurchase(models.Model):
    """Adquisición de recurso por usuario (sistema de pagos futuro)"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchased_resources')
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='purchases')
    purchased_at = models.DateTimeField(auto_now_add=True)
    price_paid = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    payment_method = models.CharField(max_length=50, blank=True)
    
    class Meta:
        unique_together = ['user', 'resource']
        ordering = ['-purchased_at']
```

### 5.4 Modelo de Acceso a Recursos (Mínimo - Sin Pagos)

```python
class UserResourceAccess(models.Model):
    """
    Modelo mínimo para rastrear acceso a recursos (sin pagos todavía).
    Define cómo un usuario accedió a un recurso.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resource_accesses')
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='user_accesses')
    
    # Fuente del acceso
    SOURCE_CHOICES = [
        ('assigned_by_therapist', 'Asignado por terapeuta'),
        ('self_purchased', 'Comprado por el usuario'),
        ('free', 'Gratuito'),
    ]
    source = models.CharField(max_length=30, choices=SOURCE_CHOICES)
    
    # Metadatos según la fuente
    assigned_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_resources',
        help_text="Terapeuta que asignó el recurso (si source='assigned_by_therapist')"
    )
    assigned_at = models.DateTimeField(null=True, blank=True)
    purchased_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamp de creación
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'resource']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'source']),
            models.Index(fields=['resource', 'source']),
        ]
    
    def save(self, *args, **kwargs):
        # Auto-set timestamps según source
        if self.source == 'assigned_by_therapist' and not self.assigned_at:
            self.assigned_at = timezone.now()
        elif self.source == 'self_purchased' and not self.purchased_at:
            self.purchased_at = timezone.now()
        super().save(*args, **kwargs)
```

**Nota**: Este modelo es **mínimo** y no incluye pagos todavía. Solo rastrea el acceso y la fuente.

### 5.5 Modelo de Notificaciones (Terapeutas)

```python
class TherapistNotification(models.Model):
    """Notificaciones para terapeutas cuando pacientes realizan acciones"""
    therapist = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resource_notifications')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='therapist_notifications')
    notification_type = models.CharField(max_length=50)  # 'patient_purchased_resource'
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, null=True, blank=True)
    message = models.TextField()  # "Tu paciente {patient} ha adquirido el recurso {resource}"
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['therapist', 'read']),
        ]
```

---

## 6. ENDPOINTS PROPUESTOS (Backend API)

### 6.1 ADMIN

```
POST   /api/admin/resources/              # Crear recurso
GET    /api/admin/resources/             # Listar todos los recursos
GET    /api/admin/resources/{id}/        # Detalle de recurso
PATCH  /api/admin/resources/{id}/       # Actualizar recurso
DELETE /api/admin/resources/{id}/        # Eliminar recurso (soft delete)
POST   /api/admin/resources/{id}/upload/ # Subir archivo
```

### 6.2 CATÁLOGO GENERAL (Común para Therapist, Patient, Personal)

```
GET    /api/resources/                  # Catálogo general con filtros automáticos
GET    /api/resources/{id}/            # Detalle de recurso
GET    /api/resources/?filter=available_for_me  # "Disponible para ti"
GET    /api/resources/?filter=recommended        # "Recomendado"
```

### 6.3 TERAPEUTA

```
GET    /api/therapist/resources/                    # Catálogo completo (sin filtros de categoría)
GET    /api/therapist/resources/{id}/              # Detalle de recurso
POST   /api/therapist/patients/{id}/resources/     # Asignar recurso a paciente
DELETE /api/therapist/patients/{id}/resources/{resource_id}/  # Desasignar recurso
GET    /api/therapist/patients/{id}/resources/     # Ver recursos asignados a paciente
POST   /api/therapist/resources/{id}/purchase/      # Comprar recurso para sí mismo
GET    /api/therapist/notifications/                # Notificaciones (cuando paciente compra)
```

### 6.4 PACIENTE

```
GET    /api/patient/resources/                      # Catálogo general (filtrado: sin clínicos)
GET    /api/patient/resources/?filter=available_for_me  # "Disponible para ti"
GET    /api/patient/resources/?filter=assigned     # "Asignado por tu terapeuta"
GET    /api/patient/resources/?filter=purchased    # "Comprado por ti"
GET    /api/patient/resources/{id}/                # Detalle de recurso
POST   /api/patient/resources/{id}/purchase/       # Comprar recurso por iniciativa propia
GET    /api/patient/resources/purchased/           # Recursos adquiridos
```

### 6.5 PERSONAL

```
GET    /api/personal/resources/                    # Catálogo general (filtrado: solo free/basic, sin clínicos)
GET    /api/personal/resources/?filter=available_for_me  # "Disponible para ti"
GET    /api/personal/resources/?filter=recommended       # "Recomendado"
GET    /api/personal/resources/{id}/               # Detalle de recurso
POST   /api/personal/resources/{id}/purchase/       # Comprar recurso (futuro)
GET    /api/personal/resources/purchased/          # Recursos adquiridos (futuro)
```

---

## 7. COMPATIBILIDAD CON SISTEMA ACTUAL

### 7.1 No Rompe Nada Existente

- ✅ Este modelo es **complementario** al sistema actual
- ✅ No requiere cambios en `AnalysisRecord`, `TestModule`, `Patient`, etc.
- ✅ Los recursos son una **capa adicional** de contenido

### 7.2 Integración con Dashboards Actuales

- **Therapist Dashboard**: 
  - Sección "Recursos" → Catálogo completo
  - Ver recursos asignables → Asignar a pacientes
  - Notificaciones cuando pacientes compran recursos
  - Comprar recursos para uso personal

- **Patient Dashboard**: 
  - Sección "Recursos" → Catálogo general (filtrado)
  - Pestañas: "Disponible para ti", "Asignado por tu terapeuta", "Comprado por ti"
  - Comprar recursos por iniciativa propia
  - Consumir recursos sin intervención del terapeuta

- **Personal Dashboard**: 
  - Sección "Recursos" → Catálogo general (solo free/basic, sin clínicos)
  - Pestañas: "Disponible para ti", "Recomendado"
  - Explorar catálogo completo (con indicadores de bloqueo)
  - Comprar cursos premium (futuro)

---

## 8. VENTAJAS DEL MODELO

### 8.1 Escalabilidad

- ✅ **Sin duplicación**: Un recurso existe una vez
- ✅ **Gestión centralizada**: ADMIN controla todo
- ✅ **Categorías dinámicas**: Sin tocar código
- ✅ **Catálogo general**: Un solo punto de acceso con filtros automáticos

### 8.2 Flexibilidad

- ✅ **Control granular**: Visibilidad por rol, nivel, asignación
- ✅ **Preparado para pagos**: Metadatos de precio listos
- ✅ **Asignación clínica**: Terapeutas asignan recursos a pacientes
- ✅ **Autonomía del usuario**: Pacientes pueden comprar por iniciativa propia
- ✅ **Notificaciones informativas**: Terapeutas reciben info sin control

### 8.3 Monetización y UX

- ✅ **Genera curiosidad**: Todos pueden explorar, no todos pueden consumir
- ✅ **Genera deseo**: Ver recursos bloqueados incentiva compra
- ✅ **Autonomía**: Paciente compra sin bloqueo del terapeuta
- ✅ **Input terapéutico**: Terapeuta usa info de compras como contexto, no control

### 8.4 Mantenibilidad

- ✅ **Un solo lugar**: Todos los recursos en un repositorio
- ✅ **Metadatos claros**: Fácil de entender y gestionar
- ✅ **Extensible**: Fácil añadir nuevos tipos o categorías
- ✅ **Filtros automáticos**: Lógica de acceso centralizada

---

## 9. LO QUE NO VAMOS A HACER TODAVÍA (Correctamente)

**Por ahora NO implementamos:**

- ❌ **Pagos**: No hay integración con pasarelas de pago
- ❌ **Suscripciones**: No hay modelo de suscripciones
- ❌ **Stripe**: No hay integración con Stripe u otras pasarelas
- ❌ **Permisos complejos**: No hay sistema de licencias o permisos avanzados
- ❌ **Sistema de compra real**: No hay checkout, carrito, o procesamiento de pagos

**Solo dejamos:**
- ✅ El modelo mental y la arquitectura preparada
- ✅ El modelo `UserResourceAccess` mínimo (sin pagos)
- ✅ La estructura de datos lista para cuando se implemente el sistema de pagos

**Razón**: 
- No dispersarnos en múltiples features complejas
- Enfocarnos en el modelo de acceso básico primero
- Preparar la arquitectura para el futuro sin implementar todo ahora

---

## 10. PRÓXIMO PASO RECOMENDADO (Uno Solo)

### 👉 SIGUIENTE PASO CORRECTO

**Definir el "ResourceAccess" mínimo (sin pagos)**

**Conceptual:**

```python
UserResourceAccess
- user (ForeignKey)
- resource (ForeignKey)
- source:
    - assigned_by_therapist
    - self_purchased
    - free
- assigned_at / purchased_at (timestamps según source)
```

**Implementación mínima:**

1. **Modelo `UserResourceAccess`** (ya definido en Sección 5.4)
   - Rastrea cómo un usuario accedió a un recurso
   - Sin lógica de pagos todavía
   - Solo fuente de acceso y timestamps

2. **Endpoints básicos:**
   - `GET /api/resources/` - Catálogo general (filtrado por rol)
   - `POST /api/therapist/patients/{id}/resources/` - Asignar recurso
   - `GET /api/patient/resources/` - Ver recursos accesibles
   - `GET /api/therapist/notifications/` - Ver notificaciones

3. **Lógica de acceso:**
   - Si `source='free'`: Acceso automático si el recurso es `level='free'`
   - Si `source='assigned_by_therapist'`: Creado cuando terapeuta asigna
   - Si `source='self_purchased'`: Placeholder para futuro (por ahora no se crea)

**Objetivo:**
- Establecer la base de datos y lógica de acceso
- Preparar para sistema de pagos futuro
- Permitir asignación clínica ya
- No implementar pagos todavía

---

## 11. ROADMAP DE IMPLEMENTACIÓN (Futuro)

### Fase 1: Estructura Base (PRÓXIMO)
- [ ] Modelo `Resource` en backend
- [ ] Modelo `UserResourceAccess` mínimo (sin pagos)
- [ ] Endpoints ADMIN básicos (CRUD)
- [ ] Endpoints de listado por rol con filtros

### Fase 2: Asignación Clínica
- [ ] Endpoints de asignación para terapeutas
- [ ] Vista de recursos asignados en Patient Dashboard
- [ ] Sistema de notificaciones básico

### Fase 3: Sistema de Pagos (Futuro)
- [ ] Modelo `UserResourcePurchase` (extiende `UserResourceAccess`)
- [ ] Integración con pasarela de pagos
- [ ] Endpoints de compra para usuarios PERSONAL y PATIENT
- [ ] Checkout y procesamiento de pagos

### Fase 4: UI/UX
- [ ] Panel ADMIN de gestión de recursos
- [ ] Sección de recursos en Therapist Dashboard
- [ ] Sección de recursos en Patient Dashboard
- [ ] Sección de recursos en Personal Dashboard

---

## 12. NOTAS FINALES

- ✅ **Este modelo está validado** y listo para implementación futura
- ✅ **No requiere cambios inmediatos** en el código existente
- ✅ **Es compatible** con el sistema de pagos futuro
- ✅ **Escalable** y **mantenible**
- ✅ **Ético y clínico**: Respeta autonomía del paciente, reduce fricción, permite acompañamiento inteligente
- ✅ **Preparado para negocio**: Genera curiosidad, deseo, monetización futura
- ✅ **Próximo paso claro**: Implementar `UserResourceAccess` mínimo sin pagos

---

**FIN DEL DOCUMENTO**
