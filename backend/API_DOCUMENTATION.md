# API Backend - Sistema Cabalístico del Alma

## 🚀 Configuración Completada

### Modelos Implementados

#### 1. **UserProfile** - Perfil Extendido de Usuario
- Tipos de usuario: `personal` y `therapist`
- Sistema de suscripciones con estados: `trial`, `active`, `canceled`, `expired`
- Límites de fichas por mes (10 para personal, ilimitado para terapeutas)
- Integración con Stripe (customer_id, subscription_id)
- Período de prueba: 7 días (personal), 14 días (therapist)

#### 2. **Ficha** - Análisis Numerológico Completo
- Almacena resultados JSON completos
- Puede pertenecer a un usuario o ser de un paciente de terapeuta
- Historial de creación y actualización

#### 3. **Patient** - Pacientes de Terapeutas (Solo terapeutas)
- Información completa del paciente
- Notas y seguimiento
- Estado activo/inactivo

#### 4. **Session** - Sesiones Terapéuticas (Solo terapeutas)
- Tipos: inicial, seguimiento, consulta, cierre
- Duración y fecha de sesión
- Notas públicas y privadas
- Vinculación con fichas

#### 5. **TherapistNote** - Notas del Terapeuta (Solo terapeutas)
- Notas asociadas a pacientes o fichas
- Sistema de tags para organización
- Búsqueda y filtrado

---

## 📍 Endpoints Disponibles

### 🔐 Autenticación

#### POST `/api/register/therapist/`
Registra un nuevo terapeuta profesional.

**Body:**
```json
{
  "username": "drsmith",
  "email": "smith@example.com",
  "password": "SecurePass123!",
  "full_name": "Dr. John Smith",
  "phone": "+1234567890",
  "profession": "psychologist",
  "specialization": "Terapia Transpersonal",
  "license_number": "PSI-12345",
  "years_of_experience": 10
}
```

**Response:**
```json
{
  "message": "Terapeuta registrado exitosamente",
  "user": {
    "id": 1,
    "username": "drsmith",
    "email": "smith@example.com",
    "user_type": "therapist"
  },
  "token": "abc123xyz...",
  "trial_days": 14
}
```

---

#### POST `/api/register/personal/`
Registra un nuevo usuario personal.

**Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "birth_date": "1990-05-15"
}
```

**Response:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 2,
    "username": "johndoe",
    "email": "john@example.com",
    "user_type": "personal"
  },
  "token": "xyz789abc...",
  "trial_days": 7
}
```

---

#### POST `/api/login/`
Inicia sesión con usuario y contraseña.

**Body:**
```json
{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "token": "abc123xyz..."
}
```

---

#### GET `/api/me/`
Obtiene información del usuario autenticado.

**Headers:**
```
Authorization: Token abc123xyz...
```

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "",
  "last_name": "",
  "profile": {
    "user_type": "personal",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "birth_date": "1990-05-15",
    "subscription_status": "trial",
    "subscription_end_date": "2025-12-14T00:00:00Z",
    "max_fichas_per_month": 10,
    "fichas_created_this_month": 3
  }
}
```

---

### 🌍 Geocodificación

#### POST `/api/geocode/city/`
Convierte un nombre de ciudad en coordenadas geográficas y zona horaria.

**Headers:**
```
Authorization: Token abc123xyz...
```

**Body:**
```json
{
  "city": "La Habana",
  "country": "Cuba"
}
```

**Parámetros:**
- `city` (requerido): Nombre de la ciudad
- `country` (opcional): Nombre del país para mayor precisión

**Response (éxito):**
```json
{
  "success": true,
  "latitude": 23.113592,
  "longitude": -82.366592,
  "timezone": "America/Havana",
  "city": "La Habana",
  "country": "Cuba",
  "full_address": "La Habana, Cuba"
}
```

**Response (ciudad no encontrada):**
```json
{
  "success": false,
  "error": "City not found"
}
```

**Características:**
- ✅ Cache inteligente para evitar llamadas repetidas
- ✅ Rate limiting integrado
- ✅ Normalización automática de nombres
- ✅ Zona horaria calculada automáticamente
- ✅ Soporte para ambigüedades (país ayuda a desambiguar)

**Notas técnicas:**
- Usa OpenStreetMap Nominatim vía geopy
- Cache en memoria para optimización
- Autenticación requerida para prevenir abuso

---

### 🔮 Cálculos Numerológicos

#### POST `/api/calcular/`
Genera un análisis numerológico completo.

**Headers:**
```
Authorization: Token abc123xyz...
```

**Body:**
```json
{
  "nombre": "TONY BLANCO",
  "dia": 15,
  "mes": 8,
  "anio": 1985,
  "sistema": "dshevastan"
}
```

**Sistemas disponibles:**
- `dshevastan` - Español (con Ñ)
- `pitagorico` - Inglés/Universal
- `caldeo` - Caldeo Vibracional
- `hebreo` - Hebreo Clásico

**Response:** JSON completo con todos los análisis numerológicos

**Límites:**
- Usuarios personales: 10 fichas/mes
- Terapeutas: ilimitado

---

### 📄 Fichas

#### GET `/api/fichas/`
Lista todas las fichas del usuario autenticado.

**Headers:**
```
Authorization: Token abc123xyz...
```

**Response:**
```json
[
  {
    "id": 1,
    "usuario": "johndoe",
    "nombre": "TONY BLANCO",
    "fecha_nacimiento": "1985-08-15",
    "sistema": "dshevastan",
    "resultado": { /* JSON completo */ },
    "creado_en": "2025-12-07T10:00:00Z"
  }
]
```

---

#### GET `/api/fichas/{id}/`
Obtiene una ficha específica.

**Headers:**
```
Authorization: Token abc123xyz...
```

---

### 👥 Pacientes (Solo Terapeutas)

#### GET `/api/therapist/patients/`
Lista todos los pacientes activos del terapeuta.

**Headers:**
```
Authorization: Token abc123xyz...
```

**Response:**
```json
[
  {
    "id": 1,
    "therapist": "drsmith",
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "birth_date": "1995-03-20",
    "notes": "Paciente regular, sesiones semanales",
    "is_active": true,
    "total_sessions": 5,
    "total_fichas": 3,
    "created_at": "2025-11-01T10:00:00Z"
  }
]
```

---

### 🔯 Interpretación Cabalística (PoC)

#### POST `/api/therapist/patients/{id}/interpretation/kabbalah/`
Endpoint PoC para generar una interpretación kabbalística profunda para un paciente.

**Permisos:** Terapeuta (propietario del paciente)

**Comportamiento:**
- PoC determinista: utiliza el adaptador legacy `KabbalahAdapter` para producir `computed_result` y `legacy_output`.
- Intenta persistir un `AnalysisRecord`. Si la persistencia falla (entorno de pruebas o desincronización de esquema), cae a un **modo de ejecución no persistente** que devuelve el resultado directamente.
- **Requisito**: el perfil del paciente debe incluir `birth_latitude` y `birth_longitude` (la PoC no intenta geocoding automático).

**Body (opcional):**
```json
{
  "raw_input": { "sistema": "dshevastan" }
}
```

**Response (éxito):**
```json
{
  "success": true,
  "record": {
    "kind": "kabbalah",
    "module_code": "kabbalah_core",
    "patient": { "id": 123, "full_name": "Jane Doe" },
    "therapist": { "id": 1, "username": "drsmith" },
    "birth_snapshot": { /* snapshot used */ },
    "computed_result": { /* normalized computed_result */ },
    "legacy_output": { /* raw legacy engine output */ }
  }
}
```

**Response (error de datos):**
```json
{ "error": "El perfil del paciente debe incluir latitud y longitud para interpretación cabalística en esta fase." }
```

**Notas de gobernanza:**
- Por diseño, la PoC **no** expone texto generativo al paciente; solo el terapeuta recibe el `legacy_output` en el `record`.
- Integración con LLMs y salida textual exigirá un documento de gobernanza, revisión humana y flags de consentimiento explícito (fase posterior).

---

#### POST `/api/therapist/patients/`
Crea un nuevo paciente.

**Headers:**
```
Authorization: Token abc123xyz...
```

**Body:**
```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "birth_date": "1995-03-20",
  "notes": "Primera consulta"
}
```

---

#### GET `/api/therapist/patients/{id}/`
Obtiene detalles de un paciente específico.

#### PUT/PATCH `/api/therapist/patients/{id}/`
Actualiza información del paciente.

#### DELETE `/api/therapist/patients/{id}/`
Desactiva un paciente (soft delete).

---

### 📅 Sesiones Terapéuticas (Solo Terapeutas)

#### GET `/api/therapist/sessions/`
Lista todas las sesiones del terapeuta.

**Response:**
```json
[
  {
    "id": 1,
    "therapist": "drsmith",
    "patient": 1,
    "patient_name": "Jane Doe",
    "session_date": "2025-12-10T14:00:00Z",
    "session_type": "followup",
    "duration_minutes": 60,
    "notes": "Progreso significativo",
    "private_notes": "Notas confidenciales",
    "related_fichas": [1, 2],
    "created_at": "2025-12-07T10:00:00Z"
  }
]
```

---

#### POST `/api/therapist/sessions/`
Crea una nueva sesión.

**Body:**
```json
{
  "patient": 1,
  "session_date": "2025-12-15T10:00:00Z",
  "session_type": "initial",
  "duration_minutes": 90,
  "notes": "Primera sesión",
  "private_notes": "Observaciones privadas",
  "related_fichas": [1]
}
```

**Tipos de sesión:**
- `initial` - Sesión Inicial
- `followup` - Seguimiento
- `consultation` - Consulta
- `closure` - Cierre

---

### 📝 Notas del Terapeuta (Solo Terapeutas)

#### GET `/api/therapist/notes/`
Lista todas las notas del terapeuta.

#### POST `/api/therapist/notes/`
Crea una nueva nota.

**Body:**
```json
{
  "patient": 1,
  "ficha": null,
  "title": "Observación importante",
  "content": "Contenido de la nota...",
  "tags": "seguimiento, progreso, importante"
}
```

---

### 📊 Dashboard del Terapeuta

#### GET `/api/therapist/dashboard/`
Obtiene estadísticas y resumen para el terapeuta.

**Response:**
```json
{
  "total_patients": 15,
  "sessions_this_month": 23,
  "fichas_this_month": 18,
  "recent_sessions": [ /* últimas 5 sesiones */ ],
  "subscription_status": "active",
  "subscription_end_date": "2026-01-07T00:00:00Z"
}
```

---

### 💳 Pagos y Suscripciones

#### POST `/api/payments/create-checkout/`
Crea una sesión de checkout de Stripe.

**Body:**
```json
{
  "plan_type": "monthly"
}
```

**Nota:** Requiere configuración de Stripe (ver sección de configuración)

---

#### GET `/api/payments/subscription-status/`
Obtiene el estado de la suscripción del usuario.

**Response:**
```json
{
  "subscription_status": "trial",
  "user_type": "personal",
  "subscription_start_date": "2025-12-07T00:00:00Z",
  "subscription_end_date": "2025-12-14T00:00:00Z",
  "max_fichas_per_month": 10,
  "fichas_created_this_month": 3,
  "has_active_subscription": true,
  "can_create_more_fichas": true
}
```

---

#### POST `/api/payments/cancel-subscription/`
Cancela la suscripción actual.

---

#### POST `/api/payments/webhook/`
Webhook para recibir eventos de Stripe (configuración del lado de Stripe).

---

### 👨‍💼 Administración (Solo Administradores)

#### GET `/api/admin/check/`
Verifica si el usuario actual tiene permisos de administrador.

**Headers:**
```
Authorization: Token abc123xyz...
```

**Response (admin):**
```json
{
  "is_admin": true,
  "username": "admin",
  "email": "admin@example.com"
}
```

---

#### GET `/api/admin/stats/`
Obtiene estadísticas mejoradas del sistema.

**Headers:**
```
Authorization: Token abc123xyz...
```

**Permisos:** `is_staff=True`

**Response:**
```json
{
  "total_users": 150,
  "total_patients": 80,
  "total_fichas": 450,
  "users_by_type": {
    "personal": 100,
    "therapist": 50
  },
  "subscriptions_active": 120
}
```

**Nota:** Versión mejorada (`EnhancedAdminStatsView`).

---

#### GET `/api/admin/users/`
Lista todos los usuarios del sistema con filtrado avanzado.

**Headers:**
```
Authorization: Token abc123xyz...
```

**Permisos:** `is_staff=True`

**Query Parameters:**
- `user_type`: `personal` | `therapist`
- `subscription_status`: `trial` | `active` | `canceled` | `expired`
- `search`: Buscar por username, email o nombre

**Nota:** Versión mejorada (`EnhancedAdminUsersView`).

---

#### GET/PATCH/DELETE `/api/admin/users/<int:user_id>/`
Gestiona un usuario específico.

**Permisos:** `is_staff=True`

---

## 🔒 Permisos y Restricciones

### Usuarios Personales
- ✅ Crear hasta 10 fichas por mes
- ✅ Ver sus propias fichas
- ✅ Período de prueba de 7 días
- ❌ No puede crear pacientes
- ❌ No puede crear sesiones
- ❌ No puede crear notas terapéuticas

### Terapeutas
- ✅ Fichas ilimitadas
- ✅ Gestión completa de pacientes
- ✅ Registro de sesiones terapéuticas
- ✅ Sistema de notas y seguimiento
- ✅ Dashboard con estadísticas
- ✅ Período de prueba de 14 días

---

## ⚙️ Configuración de Stripe (Opcional)

Para habilitar pagos reales:

1. **Instalar Stripe:**
```bash
pip install stripe
```

2. **Configurar en `settings.py`:**
```python
STRIPE_SECRET_KEY = 'sk_test_...'
STRIPE_PUBLISHABLE_KEY = 'pk_test_...'
STRIPE_WEBHOOK_SECRET = 'whsec_...'
FRONTEND_URL = 'http://localhost:3000'
```

3. **Crear productos en Stripe Dashboard:**
   - Personal Mensual
   - Personal Anual
   - Terapeuta Mensual
   - Terapeuta Anual

4. **Descomentar código en `payment_views.py`**

5. **Configurar webhook en Stripe:**
   - URL: `https://tu-dominio.com/api/payments/webhook/`
   - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

---

## 🧪 Testing

### Crear un usuario de prueba:

```bash
python manage.py shell
```

```python
from django.contrib.auth.models import User
from api.models import UserProfile
from datetime import datetime, timedelta

# Crear terapeuta
user = User.objects.create_user('drtest', 'dr@test.com', 'password123')
profile = user.profile
profile.user_type = 'therapist'
profile.full_name = 'Dr. Test'
profile.profession = 'psychologist'
profile.subscription_status = 'active'
profile.subscription_end_date = datetime.now() + timedelta(days=365)
profile.save()
```

---

## 📦 Comandos Útiles

```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario (admin)
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver

# Acceder al admin
http://localhost:8000/admin/
```

---

## 🔗 URLs Completas

- **API Root:** `http://localhost:8000/api/`
- **Admin:** `http://localhost:8000/admin/`
- **Frontend:** `http://localhost:3000/`

---

## ✅ Estado de Implementación

- ✅ Modelos de usuario extendidos
- ✅ Sistema de permisos por tipo de usuario
- ✅ Endpoints de registro con validación
- ✅ Funcionalidades específicas para terapeutas
- ✅ Estructura de pagos con Stripe (lista para configurar)
- ✅ Dashboard de terapeutas
- ✅ Sistema de límites y suscripciones
- ⏳ Configuración real de Stripe (pendiente según necesidad)

---

## 📧 Próximos Pasos Sugeridos

1. ✉️ Implementar sistema de emails (confirmación, notificaciones)
2. 📱 Agregar notificaciones push
3. 📊 Reportes y analytics avanzados para terapeutas
4. 🔐 Autenticación de dos factores (2FA)
5. 🌐 Internacionalización (i18n)
6. 📄 Exportación de fichas a PDF
7. 🎨 Personalización de plantillas para terapeutas
