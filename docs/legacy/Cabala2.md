# Portal de Análisis Cabalístico del Alma - Documentación Técnica

## 📋 Índice

1. [Resumen del Sistema](#resumen-del-sistema)
2. [Arquitectura](#arquitectura)
3. [Backend Django](#backend-django)
4. [Backend Flask](#backend-flask)
5. [Frontend Next.js](#frontend-nextjs)
6. [Tests Psicológicos Disponibles](#tests-psicológicos-disponibles)
7. [Flujo de Procesamiento](#flujo-de-procesamiento)
8. [Endpoints API](#endpoints-api)
9. [Modelos de Datos](#modelos-de-datos)
10. [Configuración y Despliegue](#configuración-y-despliegue)

---

## 🎯 Resumen del Sistema

El portal de Análisis Cabalístico del Alma es una plataforma completa que integra:

- **Análisis Clínico**: Tests psicológicos estandarizados con baremos clínicos
- **Análisis Cabalístico**: Interpretación espiritual basada en la Cábala (Sefirot, Ángeles, Conceptos)
- **Sistema de Usuarios Multi-Rol**: Terapeutas, Pacientes, Usuarios Personales y Visitantes
- **Gestión de Pacientes**: Para terapeutas que administran múltiples pacientes con cuentas propias
- **Experiencia Diferenciada**: Resultados parciales para visitantes, completos para usuarios registrados

### Tecnologías Principales

- **Backend Django**: API REST principal con autenticación por tokens
- **Backend Flask**: API complementaria para procesamiento de tests
- **Frontend Next.js**: Interfaz de usuario con React y TypeScript
- **Base de Datos**: PostgreSQL (producción) / SQLite (desarrollo)

---

## 🏗️ Arquitectura

```
analisis_cabalistico_alma/
├── backend/                    # Backend Django
│   ├── api/
│   │   ├── models.py           # Modelos de datos (User, Patient, TestResult, etc.)
│   │   ├── views.py            # Vistas principales
│   │   ├── test_views.py       # Vistas de tests (incluye ProcessTestSubmissionView)
│   │   ├── test_models.py      # Modelos de tests (TestModule, TestResult)
│   │   ├── utils/              # Utilidades
│   │   │   ├── clinical_scorer.py    # Motor de calificación clínica
│   │   │   └── test_mappings.py      # Mapeos cabalísticos
│   │   └── urls.py             # Rutas de la API
│   └── manage.py
│
├── cabala_py/                  # Módulos Python compartidos
│   ├── clinical_scorer.py      # Motor clínico (usado por Flask)
│   ├── test_mappings.py        # Mapeos cabalísticos (usado por Flask)
│   ├── soul_analytics.py       # Motor de análisis del alma
│   └── data_loader.py          # Carga de datos (ángeles, léxico hebreo)
│
├── app_cabalistica.py          # API Flask (procesamiento de tests)
│
└── tonyblanco-app/             # Frontend Next.js
    ├── app/
    │   ├── tests/              # Páginas de tests individuales
    │   │   ├── phq-9/page.tsx
    │   │   ├── gad-7/page.tsx
    │   │   ├── ptsd/page.tsx
    │   │   └── ... (15 tests total)
    │   ├── ptsd-pcl5/page.tsx  # Test profesional PCL-5
    │   └── tests/page.tsx      # Catálogo de tests
    ├── components/
    │   └── GenericTest.tsx      # Componente reutilizable para tests
    ├── data/
    │   ├── tests-questions.ts  # Base de datos de preguntas
    │   └── angels-translations.ts  # Traducciones de ángeles
    └── lib/
        └── auth.ts              # Utilidades de autenticación
```

---

## 🔧 Backend Django

### Modelos Principales

#### 1. TestResult (Actualizado)

**Ubicación**: `backend/api/test_models.py`

```python
class TestResult(models.Model):
    user = ForeignKey(User)                    # Usuario que realizó el test
    patient = ForeignKey(Patient, null=True)    # Paciente (opcional, para terapeutas)
    test_module = ForeignKey(TestModule, null=True)  # Módulo de test (opcional)
    test_id = CharField                         # ID del test (ej: 'phq-9', 'gad-7')
    
    # Resultados clínicos
    score = IntegerField                        # Puntaje numérico
    clinical_diagnosis = CharField              # Diagnóstico clínico
    
    # Análisis cabalístico
    kabbalah_sefira = CharField                 # Sefirá relacionada
    angel_remedy = CharField                    # Ángel remedio
    
    # Datos adicionales
    details = JSONField                         # Respuestas, análisis completo
    input_data = JSONField                      # Datos de entrada
    result_data = JSONField                     # Resultados calculados
    
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

#### 2. Patient (Actualizado)

**Ubicación**: `backend/api/models.py`

```python
class Patient(models.Model):
    therapist = ForeignKey(User)                # Terapeuta propietario
    user = ForeignKey(User, null=True)           # Usuario asociado (si tiene cuenta de login)
    full_name = CharField
    email = EmailField
    phone = CharField
    birth_date = DateField
    notes = TextField
    is_active = BooleanField(default=True)
    
    class Meta:
        unique_together = [['therapist', 'email'], ['therapist', 'user']]
```

**Características**:
- Vinculación opcional con `User` para pacientes con cuenta de login
- Permite que pacientes se logueen y vean sus propios resultados
- Relación única por terapeuta (un paciente no puede estar duplicado)

#### 3. UserProfile (Sistema de Roles)

**Ubicación**: `backend/api/models.py`

```python
USER_TYPE_CHOICES = [
    ('personal', 'Usuario Personal'),
    ('therapist', 'Terapeuta Profesional'),
    ('patient', 'Paciente'),
    ('visitor', 'Visitante'),
]

class UserProfile(models.Model):
    user = OneToOneField(User)
    user_type = CharField(choices=USER_TYPE_CHOICES)  # Role del usuario
    full_name = CharField
    # ... otros campos
```

### Utilidades de Tests

#### ClinicalScorer

**Ubicación**: `backend/api/utils/clinical_scorer.py`

```python
from api.utils import ClinicalScorer

scorer = ClinicalScorer()
result = scorer.calcular_score('phq-9', [2, 3, 1, 2, 3, 2, 2, 1, 3])
# Retorna: { "score_bruto": 18, "diagnostico_clinico": "Depresión Moderadamente Severa" }
```

**Tests soportados**: 15 tests con baremos estandarizados

#### TEST_LINKS

**Ubicación**: `backend/api/utils/test_mappings.py`

```python
from api.utils import TEST_LINKS

mapping = TEST_LINKS['phq-9']
# Retorna mapeo cabalístico con sefira_id, organo_ref_id, concepto_clave_id, angel_remedio_idx
```

### Vista de Procesamiento

#### ProcessTestSubmissionView

**Ubicación**: `backend/api/test_views.py`  
**Ruta**: `POST /api/tests/submit/`  
**Permisos**: `AllowAny` (con `@csrf_exempt` para permitir desde frontend)

**Body esperado**:
```json
{
  "test_id": "phq-9",
  "answers": [2, 3, 1, 2, 3, 2, 2, 1, 3],
  "patient_id": 1  // Opcional
}
```

**Respuesta**:
```json
{
  "score": 18,
  "diagnosis": "Depresión Moderadamente Severa",
  "sefira": "sef_127",
  "angel": "Veuliah",
  "angel_meditation_key": "Veuliah",
  "kabbalah": {
    "test_name": "Depresión (PHQ-9)",
    "organo_ref_id": "cue_1",
    "concepto_clave_id": "con_160",
    "angel_remedio_idx": 42,
    "bio_desc": "Sensación de vacío y falta de luz reflejada."
  },
  "test_result_id": 123  // Solo si está autenticado
}
```

---

## 🐍 Backend Flask

### API Flask

**Archivo**: `app_cabalistica.py`  
**Puerto**: 5000

### Endpoint Principal

**Ruta**: `POST /api/tests/procesar-completo`

**Funcionalidad**:
1. Recibe `test_id` y `answers`
2. Calcula score clínico usando `ClinicalScorer`
3. Obtiene análisis del alma usando `SoulAnalyticsEngine`
4. Retorna resultado unificado

**Nota**: Este endpoint está siendo migrado a Django. El nuevo endpoint es `/api/tests/submit/` en Django.

---

## ⚛️ Frontend Next.js

### Sistema de Roles y Autenticación

**Ubicación**: `tonyblanco-app/lib/auth.ts`

**Funciones principales**:
```typescript
// Guardar datos de login
saveLoginData(token: string, role: UserRole, username: string)

// Obtener datos
getAuthToken(): string | null
getUserRole(): UserRole | null  // 'therapist' | 'patient' | 'personal' | 'visitor'
getUsername(): string | null

// Verificar roles
isTherapist(): boolean
isPatient(): boolean
hasRole(role: UserRole): boolean
```

**Almacenamiento**: Los datos se guardan en `localStorage`:
- `authToken`: Token de autenticación
- `userRole`: Rol del usuario
- `username`: Nombre de usuario

### Componentes de Protección de Rutas

#### TherapistRoute

**Ubicación**: `tonyblanco-app/components/TherapistRoute.tsx`

- Protege rutas solo para terapeutas
- Redirige a `/login` si no está autenticado o no es terapeuta
- Muestra spinner mientras verifica permisos

**Uso**:
```typescript
<TherapistRoute>
  <div>Contenido solo para terapeutas</div>
</TherapistRoute>
```

#### PatientRoute

**Ubicación**: `tonyblanco-app/components/PatientRoute.tsx`

- Protege rutas solo para pacientes
- Redirige a `/login` si no está autenticado o no es paciente
- Muestra spinner mientras verifica permisos

**Uso**:
```typescript
<PatientRoute>
  <div>Contenido solo para pacientes</div>
</PatientRoute>
```

### Componente Principal: GenericTest

**Ubicación**: `tonyblanco-app/components/GenericTest.tsx`

**Características**:
- Componente reutilizable para todos los tests
- Maneja estado de respuestas
- Envía peticiones a Django API
- **Versión diferenciada según autenticación**:
  - **Visitantes**: Muestra solo ángel y meditación (resultado parcial)
  - **Usuarios logueados**: Muestra análisis completo (clínico + cabalístico)
- Integra traducciones de ángeles
- CTA para registro cuando es visitante

**Configuración de API**:
```typescript
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com';
const API_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

// Autenticación
const token = getAuthToken();
if (token) {
  headers['Authorization'] = `Token ${token}`;
}
```

### Base de Datos de Tests

**Archivo**: `tonyblanco-app/data/tests-questions.ts`

**Estructura**:
```typescript
export const TESTS_DB: Record<string, TestConfig> = {
  'phq-9': {
    id: 'phq-9',
    title: 'PHQ-9 - Test de Depresión',
    description: '...',
    questions: [
      {
        id: 'phq9-q1',
        text: 'Poco interés o placer en hacer cosas.',
        options: [
          { value: 0, label: 'Nunca' },
          { value: 1, label: 'Varios días' },
          // ...
        ]
      }
    ]
  },
  // ... 15 tests total
}
```

### Traducciones de Ángeles

**Archivo**: `tonyblanco-app/data/angels-translations.ts`

**Estructura**:
```typescript
export const ANGELS_SPANISH: Record<string, AngelTranslation> = {
  'Veuliah': {
    name: { he: 'ווליה', en: 'Veuliah', es: 'Veuliah' },
    attribute: { en: '...', es: '...' },
    description: { es: '...' },
    meditation: { es: '...' },
    invocation: { es: '...' },
    qualities: ['...'],
    audioUrl: '/audio/angels/veuliah.mp3'
  },
  // ... todos los ángeles
}
```

### Catálogo de Tests

**Archivo**: `tonyblanco-app/app/tests/page.tsx`

**Características**:
- **Público**: Accesible sin autenticación
- Muestra todos los tests disponibles (15 tests)
- Organizados por categorías:
  - Depresión y Ansiedad (5 tests)
  - Diagnóstico Específico (5 tests)
  - Personalidad y Evaluación (3 tests)
  - Screening y Detección (2 tests)
- Tarjetas con iconos, descripción y botón "Iniciar Test"

### Dashboards por Rol

#### Dashboard de Terapeuta

**Ubicación**: `tonyblanco-app/app/dashboard/therapist/page.tsx`

**Características**:
- Protegido con `TherapistRoute`
- **Botones principales**:
  - **Crear Nuevo Paciente**: Abre formulario para crear paciente con cuenta
  - **Ver Lista de Pacientes**: Gestiona pacientes existentes
  - **Catálogo de Tests**: Acceso a los 15 tests disponibles
- Estadísticas: Pacientes activos, sesiones, fichas creadas
- Actividad reciente y próximas sesiones

#### Dashboard de Paciente

**Ubicación**: `tonyblanco-app/app/dashboard/patient/page.tsx`

**Características**:
- Protegido con `PatientRoute`
- **Saludo personalizado**: "Hola, [Nombre] 👋"
- **Sección "Mis Tareas"**:
  - Botón para acceder al catálogo de tests
  - Mensaje sobre tests recomendados por el terapeuta
- **Sección "Mi Camino"**:
  - Historial de tests realizados
  - Muestra: nombre del test, ángel guía, score y fecha
  - **Enfoque positivo**: Oculta jerga clínica pesada, destaca el ángel y consejo espiritual
  - Clic en resultado para ver análisis completo
  - Estado vacío cuando no hay tests
- Estadísticas: Tests completados, resultados guardados, próxima sesión

### Página de Login

**Ubicación**: `tonyblanco-app/app/login/page.tsx`

**Características**:
- Guarda `token`, `role` y `username` en localStorage
- **Redirección inteligente según role**:
  - `therapist` → `/dashboard/therapist`
  - `patient` → `/dashboard/patient`
  - `personal` → `/dashboard/personal`
  - Otros → `/`

---

## 📊 Tests Psicológicos Disponibles

### Tests Básicos (4)

1. **PHQ-9** - Test de Depresión
   - 9 preguntas
   - Baremos: 0-4 (Ninguna), 5-9 (Leve), 10-14 (Moderada), 15-19 (Moderadamente Severa), 20-27 (Severa)
   - Ángel: Veuliah (índice 42)

2. **GAD-7** - Ansiedad Generalizada
   - 7 preguntas
   - Baremos: 0-4 (Mínima), 5-9 (Leve), 10-14 (Moderada), 15-21 (Severa)
   - Ángel: Caliel (índice 17)

3. **BAI** - Ansiedad de Beck
   - 21 preguntas (5 en versión screening)
   - Baremos: 0-7 (Mínima), 8-15 (Leve), 16-25 (Moderada), 26-63 (Severa)
   - Ángel: Vehuiah (índice 0)

4. **BDI-II** - Depresión de Beck
   - 21 preguntas (5 en versión screening)
   - Baremos: 0-13 (Mínima), 14-19 (Leve), 20-28 (Moderada), 29-63 (Severa)
   - Ángel: Sitael (índice 2)

### Tests de Diagnóstico Específico (5)

5. **PTSD** - Estrés Postraumático (Screening)
   - 5 preguntas
   - Baremos: 0-32 (Bajo riesgo), 33-80 (Riesgo clínico alto)
   - Ángel: Veuliah (índice 42)
   - Ruta: `/tests/ptsd`

6. **PTSD-PCL5** - Evaluación Clínica PTSD (Profesional)
   - 20 preguntas
   - Baremos: 0-32 (Sub-clínico), 33-45 (Moderado), 46-80 (Severo)
   - Ángel: Mitzrael (índice 61)
   - Ruta: `/ptsd-pcl5` (portal profesional)

7. **OCD** - Obsesivo-Compulsivo
   - 5 preguntas
   - Baremos: 0-7 (Subclínico), 8-15 (Leve), 16-23 (Moderado), 24-31 (Severo), 32-40 (Extremo)
   - Ángel: Caliel (índice 17)

8. **Insomnia** - Índice de Severidad de Insomnio
   - 5 preguntas
   - Baremos: 0-7 (Sin insomnio), 8-14 (Subumbral), 15-21 (Moderado), 22-28 (Severo)
   - Ángel: Lauviah (índice 10)

9. **ADHD** - Screening TDAH Adultos
   - 6 preguntas
   - Baremos: 0-13 (Poco probable), 14-19 (Probable), 20-24 (Muy Probable)
   - Ángel: Harahel (índice 58)

### Tests Avanzados (4)

10. **SCL-90-R** - Psicopatología
    - 10 preguntas (versión screening)
    - Baremos: 0.0-0.99 (Normal), 1.00-2.49 (Riesgo Moderado), 2.50-4.00 (Patología Severa)
    - **Nota especial**: Calcula promedio (GSI) en lugar de suma
    - Ángel: Melahel (índice 22)

11. **STAI** - Ansiedad Estado-Rasgo
    - 10 preguntas (versión screening)
    - Baremos: 20-39 (Ansiedad Baja), 40-59 (Ansiedad Media), 60-80 (Ansiedad Alta)
    - Ángel: Mikael (índice 41)

12. **PAI** - Evaluación de Personalidad
    - 10 preguntas (versión screening)
    - Baremos: 0-59 (Normal), 60-69 (Riesgo Leve), 70-90 (Significativo)
    - Ángel: Nithael (índice 53)

13. **SCID-5-RV** - Entrevista Estructurada DSM-5
    - 8 preguntas (versión screening)
    - Baremos: 0-1 (Sin criterios), 2-8 (Posible diagnóstico - Requiere entrevista)
    - Ángel: Haamiah (índice 37)

### Tests de Screening (2)

14. **Substance** - Screening Consumo (CAGE)
    - 4 preguntas
    - Baremos: 0-1 (Bajo Riesgo), 2-4 (Riesgo de Abuso/Dependencia)
    - Ángel: Eyael (índice 66)

15. **Eating** - Screening Alimentario (SCOFF)
    - 5 preguntas
    - Baremos: 0-1 (Bajo Riesgo), 2-5 (Posible Trastorno Alimentario)
    - Ángel: Mizrael (índice 59)

---

## 🔄 Flujo de Procesamiento

### Flujo Completo de un Test

```
1. Usuario accede a /tests/phq-9
   ↓
2. GenericTest.tsx carga configuración desde TESTS_DB
   ↓
3. Usuario responde las preguntas
   ↓
4. Al hacer submit:
   - Frontend obtiene token de autenticación (si existe)
   - Envía POST a /api/tests/submit/ con:
     {
       test_id: "phq-9",
       answers: [2, 3, 1, 2, 3, 2, 2, 1, 3]
     }
   ↓
5. Backend Django (ProcessTestSubmissionView):
   a) Valida datos de entrada
   b) Usa ClinicalScorer.calcular_score() para obtener:
      - score_bruto: 18
      - diagnostico_clinico: "Depresión Moderadamente Severa"
   c) Usa TEST_LINKS['phq-9'] para obtener:
      - sefira_id: "sef_127"
      - organo_ref_id: "cue_1"
      - concepto_clave_id: "con_160"
      - angel_remedio_idx: 42
   d) Carga nombre del ángel desde JSON (KabbalahDataLoader)
   e) Guarda resultado en TestResult (si usuario autenticado)
   ↓
6. Retorna JSON con resultados clínicos y cabalísticos
   ↓
7. Frontend muestra:
   - Tarjeta azul: Score y diagnóstico clínico
   - Tarjeta violeta/dorada: Análisis del alma
     - Sefirá afectada
     - Ángel remedio con meditación (si disponible)
     - Descripción bioenergética
```

### Flujo de Autenticación y Roles

```
1. Usuario se loguea → Backend retorna { token, username, role }
   ↓
2. Frontend guarda en localStorage:
   - authToken: token
   - userRole: role ('therapist' | 'patient' | 'personal' | 'visitor')
   - username: username
   ↓
3. Redirección según role:
   - therapist → /dashboard/therapist
   - patient → /dashboard/patient
   - personal → /dashboard/personal
   - visitor → /
   ↓
4. En cada petición:
   - Frontend obtiene token con getAuthToken()
   - Agrega header: Authorization: Token {token}
   ↓
5. Backend valida token:
   - Si válido: procesa y guarda resultado
   - Si inválido: procesa pero no guarda (solo retorna resultados)
```

### Flujo de Visitantes (No Autenticados)

```
1. Visitante accede a /tests (público)
   ↓
2. Selecciona y completa un test
   ↓
3. Backend procesa y retorna resultados
   ↓
4. Frontend muestra versión simplificada:
   - Solo ángel guía y meditación
   - Oculta diagnóstico clínico detallado
   - Enfoque positivo y espiritual
   ↓
5. CTA destacado para registrarse:
   - "Para guardar tu progreso y hablar con un terapeuta"
   - Botones: "Crear Cuenta Gratis" y "Soy Terapeuta"
   ↓
6. Si se registra → Login → Redirección según role
```

### Flujo de Creación de Paciente por Terapeuta

```
1. Terapeuta accede a /dashboard/therapist
   ↓
2. Clic en "Crear Nuevo Paciente"
   ↓
3. Formulario: email, full_name, password, birth_date, etc.
   ↓
4. POST /api/therapist/patients/create/
   ↓
5. Backend:
   a) Crea User con role='patient'
   b) Crea UserProfile con user_type='patient'
   c) Crea Patient vinculado al terapeuta y al usuario
   ↓
6. Paciente recibe credenciales y puede loguearse
   ↓
7. Al loguearse, ve su dashboard personal con "Mi Camino"
```

---

## 🌐 Endpoints API

### Django REST Framework

#### Autenticación

- `POST /api/login/` - Login con username/email y password
  - **Respuesta actualizada**: Retorna `{ token, username, role }`
  - El `role` puede ser: `'therapist'`, `'patient'`, `'personal'`, o `'visitor'`
- `POST /api/register/therapist/` - Registro de terapeuta
- `POST /api/register/personal/` - Registro de usuario personal
- `GET /api/me/` - Información del usuario actual

#### Tests Psicológicos

- `POST /api/tests/submit/` - **Nuevo endpoint principal**
  - Procesa test psicométrico
  - Retorna análisis clínico y cabalístico
  - Guarda resultado si usuario autenticado
  
- `GET /api/tests/` - Lista tests disponibles
- `POST /api/tests/execute/` - Ejecuta test modular (legacy)
- `GET /api/tests/results/` - Lista resultados del usuario
- `GET /api/tests/results/<id>/` - Detalle de resultado

#### Pacientes (Terapeutas)

- `GET /api/therapist/patients/` - Lista pacientes del terapeuta
- `POST /api/therapist/patients/` - Crear paciente (sin cuenta)
- `POST /api/therapist/patients/create/` - **Nuevo**: Crear paciente con cuenta de usuario
  - Crea un `User` con `role='patient'`
  - Crea un `UserProfile` con `user_type='patient'`
  - Crea un `Patient` vinculado al terapeuta y al usuario
  - **Body**: `{ email, full_name, password, phone, birth_date, notes }`
  - **Respuesta**: `{ patient: {...}, user: { id, username, email, role } }`
- `GET /api/therapist/patients/<id>/` - Detalle de paciente

### Flask API (Complementaria)

- `POST /api/tests/procesar-completo` - Procesamiento completo (legacy, siendo migrado)

---

## 💾 Modelos de Datos

### TestResult (Completo)

```python
{
  "id": 123,
  "user": 1,                    # ID del usuario
  "patient": null,              # ID del paciente (si aplica)
  "test_module": null,          # ID del módulo (opcional)
  "test_id": "phq-9",          # ID del test
  "score": 18,                  # Puntaje numérico
  "clinical_diagnosis": "Depresión Moderadamente Severa",
  "kabbalah_sefira": "sef_127", # Sefirá relacionada
  "angel_remedy": "Veuliah",    # Ángel remedio
  "details": {                  # JSON con datos completos
    "answers": [2, 3, 1, ...],
    "kabbalah_mapping": {...},
    "full_result": {...},
    "score_bruto_original": 18
  },
  "input_data": {...},         # Datos de entrada
  "result_data": {...},         # Resultados calculados
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

## ⚙️ Configuración y Despliegue

### Variables de Entorno

#### Frontend (Next.js)

**Archivo**: `.env.local` o configuración en Vercel

```env
NEXT_PUBLIC_API_URL=https://analisis-cabalistico-alma.onrender.com/api
```

O sin `/api`:
```env
NEXT_PUBLIC_API_URL=https://analisis-cabalistico-alma.onrender.com
```

#### Backend Django

**Archivo**: `.env` o configuración en Render

```env
SECRET_KEY=tu-secret-key
DEBUG=False
DATABASE_URL=postgresql://...
ALLOWED_HOSTS=analisis-cabalistico-alma.onrender.com
```

### Migraciones Django

Para aplicar los cambios del modelo `TestResult`:

```bash
cd backend
python manage.py makemigrations api
python manage.py migrate api
```

### Estructura de Archivos Creados/Modificados

#### Backend

**Nuevos archivos**:
- `backend/api/utils/__init__.py`
- `backend/api/utils/clinical_scorer.py`
- `backend/api/utils/test_mappings.py`
- `backend/api/utils/README.md`
- `backend/api/utils/example_view.py`
- `backend/MIGRACION_TEST_RESULT.md`

**Archivos modificados**:
- `backend/api/models.py` - Agregado campo `user` a Patient, actualizado USER_TYPE_CHOICES
- `backend/api/views.py` - Login actualizado para retornar role, agregado CreatePatientWithAccountView
- `backend/api/test_models.py` - Agregados campos a TestResult
- `backend/api/test_views.py` - Agregada ProcessTestSubmissionView
- `backend/api/urls.py` - Agregadas rutas `/api/tests/submit/` y `/api/therapist/patients/create/`

#### Frontend

**Archivos modificados**:
- `tonyblanco-app/components/GenericTest.tsx` - Actualizado para usar Django API + versión visitantes
- `tonyblanco-app/lib/auth.ts` - Sistema de roles completo
- `tonyblanco-app/app/login/page.tsx` - Redirección según role
- `tonyblanco-app/data/tests-questions.ts` - Agregados 15 tests
- `tonyblanco-app/data/angels-translations.ts` - Agregadas traducciones de ángeles
- `tonyblanco-app/app/tests/page.tsx` - Catálogo completo de tests (público)
- `tonyblanco-app/app/dashboard/therapist/page.tsx` - Botones actualizados
- `tonyblanco-app/app/dashboard/patient/page.tsx` - Rediseño completo con "Mis Tareas" y "Mi Camino"

**Componentes creados**:
- `tonyblanco-app/components/TherapistRoute.tsx` - Protección de rutas para terapeutas
- `tonyblanco-app/components/PatientRoute.tsx` - Protección de rutas para pacientes
- `tonyblanco-app/components/ROLES_USAGE.md` - Documentación de uso de roles

**Páginas creadas**:
- `tonyblanco-app/app/tests/phq-9/page.tsx`
- `tonyblanco-app/app/tests/gad-7/page.tsx`
- `tonyblanco-app/app/tests/bai/page.tsx`
- `tonyblanco-app/app/tests/bdi-ii/page.tsx`
- `tonyblanco-app/app/tests/ptsd/page.tsx`
- `tonyblanco-app/app/tests/ocd/page.tsx`
- `tonyblanco-app/app/tests/insomnia/page.tsx`
- `tonyblanco-app/app/tests/scl-90-r/page.tsx`
- `tonyblanco-app/app/tests/stai/page.tsx`
- `tonyblanco-app/app/tests/pai/page.tsx`
- `tonyblanco-app/app/tests/scid-5-rv/page.tsx`
- `tonyblanco-app/app/tests/adhd/page.tsx`
- `tonyblanco-app/app/tests/substance/page.tsx`
- `tonyblanco-app/app/tests/eating/page.tsx`
- `tonyblanco-app/app/ptsd-pcl5/page.tsx` (portal profesional)

---

## 🔐 Autenticación y Sistema de Roles

### Sistema de Tokens

- **Tipo**: Token Authentication (Django REST Framework)
- **Almacenamiento**: `localStorage` en frontend
- **Header**: `Authorization: Token {token}`
- **Obtención**: `POST /api/login/` retorna `{ token, username, role }`

### Sistema de Roles

El sistema soporta 4 tipos de usuarios:

1. **therapist** (Terapeuta)
   - Puede crear pacientes con cuentas
   - Gestiona múltiples pacientes
   - Acceso a dashboard profesional
   - Protección: `TherapistRoute`

2. **patient** (Paciente)
   - Tiene cuenta creada por terapeuta
   - Ve su propio historial de tests
   - Acceso a dashboard personal ("Mi Camino")
   - Protección: `PatientRoute`

3. **personal** (Usuario Personal)
   - Usuario independiente
   - Acceso a dashboard personal
   - Puede hacer tests y guardar resultados

4. **visitor** (Visitante)
   - No autenticado
   - Puede hacer tests pero no guarda resultados
   - Ve resultados parciales (solo ángel y meditación)
   - CTA para registrarse

### Permisos

- **ProcessTestSubmissionView**: `AllowAny` (permite peticiones sin autenticación)
- **Guardado de resultados**: Solo si usuario está autenticado
- **CreatePatientWithAccountView**: Solo terapeutas (`IsTherapist`)
- **CSRF**: Deshabilitado con `@csrf_exempt` para permitir desde frontend

---

## 📈 Estadísticas del Sistema

### Tests Disponibles

- **Total**: 15 tests psicológicos
- **Categorías**: 4 categorías
- **Tests básicos**: 4 (PHQ-9, GAD-7, BAI, BDI-II)
- **Tests específicos**: 5 (PTSD, PTSD-PCL5, OCD, Insomnia, ADHD)
- **Tests avanzados**: 4 (SCL-90-R, STAI, PAI, SCID-5-RV)
- **Tests screening**: 2 (Substance, Eating)

### Ángeles Configurados

- **Total**: 72 ángeles disponibles
- **Traducciones completas**: ~20 ángeles con meditaciones en español
- **Ángeles usados en tests**: 15 ángeles únicos

### Baremos Clínicos

- **Total**: 15 baremos configurados
- **Tests con promedio**: 1 (SCL-90-R)
- **Tests con suma**: 14

---

## 🚀 Próximos Pasos

### Mejoras Sugeridas

1. **Completar traducciones de ángeles**: Agregar meditaciones para los 52 ángeles restantes
2. **Optimización**: Cachear resultados de tests frecuentes
3. **Analytics**: Dashboard con estadísticas de uso de tests
4. **Exportación**: Permitir exportar resultados en PDF
5. **Historial**: Vista de historial de tests por paciente
6. **Comparativas**: Comparar resultados de tests a lo largo del tiempo
7. **Asignación de tests**: Sistema para que terapeutas asignen tests específicos a pacientes
8. **Notificaciones**: Alertas cuando un paciente completa un test asignado
9. **Vista de resultados para pacientes**: Página dedicada con enfoque positivo (sin jerga clínica)

### Migración Completa

- Migrar completamente de Flask a Django
- Deprecar endpoint Flask `/api/tests/procesar-completo`
- Unificar toda la lógica en Django

### Funcionalidades Implementadas Recientemente

✅ **Sistema de roles completo** (therapist, patient, personal, visitor)  
✅ **Creación de pacientes con cuenta** por terapeutas  
✅ **Dashboards diferenciados** por rol  
✅ **Protección de rutas** con componentes React  
✅ **Experiencia para visitantes** con resultados parciales y CTA  
✅ **Redirección inteligente** según role después del login  
✅ **Historial de tests** para pacientes ("Mi Camino")

---

## 📝 Notas Técnicas

### Manejo de Scores

- **SCL-90-R**: Calcula promedio (GSI) con 2 decimales
- **Otros tests**: Suma simple de respuestas
- **Guardado**: Score se convierte a int para guardar en BD, pero se preserva el valor original en `details`

### Mapeos Cabalísticos

- Cada test tiene un mapeo único a:
  - **Sefirá**: Una de las 10 Sefirot del Árbol de la Vida
  - **Órgano**: Referencia a órgano/concepto biológico
  - **Concepto Clave**: Concepto cabalístico relacionado
  - **Ángel Remedio**: Índice del ángel (0-71) de los 72 ángeles

### Compatibilidad

- El sistema mantiene compatibilidad con el modelo `TestModule` existente
- Los campos nuevos en `TestResult` son opcionales para no romper datos existentes
- El frontend puede funcionar sin autenticación (solo no guarda resultados)
- El campo `user` en `Patient` es opcional para mantener compatibilidad con pacientes existentes sin cuenta

### Experiencia Diferenciada por Rol

- **Visitantes**: Resultados parciales (solo ángel y meditación), CTA para registro
- **Pacientes**: Dashboard enfocado en crecimiento espiritual, historial positivo
- **Terapeutas**: Herramientas de gestión, creación de pacientes, análisis completo
- **Usuarios Personales**: Acceso completo a todas las funcionalidades

---

## 🐛 Troubleshooting

### Error: "Test ID no está configurado en los baremos"

**Solución**: Verificar que el `test_id` existe en `ClinicalScorer.baremos`

### Error: "No se pudo conectar con el servidor"

**Solución**: 
1. Verificar que `NEXT_PUBLIC_API_URL` esté configurado correctamente
2. Verificar que el servidor Django esté corriendo
3. Verificar CORS en Django settings

### Error: "Meditación no disponible"

**Solución**: Agregar entrada en `angels-translations.ts` para el ángel correspondiente

### Error: "ModuleNotFoundError: No module named 'api.utils'"

**Solución**: Verificar que `backend/api/utils/__init__.py` existe y está correcto

---

## 📚 Referencias

- **Baremos clínicos**: Basados en estándares DSM-5 y baremos publicados
- **Cábala**: Sistema basado en el Árbol de la Vida y los 72 Ángeles del Shem ha-Mephorash
- **Tests**: Versiones screening adaptadas de tests estandarizados

---

---

## 📱 Experiencia de Usuario por Rol

### Visitante (No Autenticado)

**Flujo**:
1. Accede a `/tests` (público)
2. Selecciona y completa un test
3. Ve resultado parcial:
   - ✨ Ángel guía con nombre hebreo
   - 🧘 Meditación personalizada
   - 📿 Invocación del ángel
   - ❌ **Oculta**: Diagnóstico clínico detallado, score numérico
4. CTA destacado para registrarse:
   - "Para guardar tu progreso y hablar con un terapeuta"
   - Botones: "Crear Cuenta Gratis" y "Soy Terapeuta"

### Paciente

**Flujo**:
1. Login → Redirección a `/dashboard/patient`
2. Dashboard personalizado:
   - Saludo: "Hola, [Nombre] 👋"
   - **Mis Tareas**: Acceso al catálogo de tests
   - **Mi Camino**: Historial de tests con enfoque positivo
3. Al hacer un test:
   - Ve resultado completo (clínico + cabalístico)
   - Resultado se guarda automáticamente
   - Aparece en "Mi Camino" inmediatamente

### Terapeuta

**Flujo**:
1. Login → Redirección a `/dashboard/therapist`
2. Dashboard profesional:
   - Estadísticas de pacientes y sesiones
   - **Botones principales**:
     - Crear Nuevo Paciente (con cuenta)
     - Ver Lista de Pacientes
     - Catálogo de Tests
3. Crear paciente:
   - Formulario completo
   - Se crea cuenta de usuario automáticamente
   - Paciente puede loguearse inmediatamente

---

---

## 🔮 Módulo de Tarot Terapéutico Cruzado

### Descripción General

El módulo de **Tarot Terapéutico Cruzado** combina el **Arcano de Vida** del paciente (calculado desde su fecha de nacimiento) con su **estado clínico actual** (último test realizado) para generar un análisis terapéutico que identifica cómo el arquetipo nativo está contribuyendo al desequilibrio actual.

**Objetivo**: No es adivinación, sino **diagnóstico del desequilibrio energético** mediante el cruce de datos clínicos y cabalísticos.

### Arquitectura del Módulo

#### Backend - Servicio de Análisis

**Ubicación**: `backend/api/utils/tarot_service.py`

**Componentes principales**:

1. **`calculate_life_arcana(birth_date)`**
   - Calcula el Arcano de Vida (0-21) desde la fecha de nacimiento
   - Fórmula: Suma día + mes + año → Reduce a 1-22
   - Retorna el número del arcano correspondiente

2. **`ARCANA_MAP`**
   - Diccionario con los 22 arcanos mayores
   - Incluye: nombre, letra hebrea, sendero en el Árbol de la Vida
   - Ejemplo: `{ 0: {'name': 'El Loco', 'hebrew': 'א', 'path': 'Keter → Chokmah'} }`

3. **`TarotTherapeuticAI`**
   - Clase que integra con Google Gemini AI
   - Método `analyze_archetype_vs_clinical()`:
     - Recibe: número de arcano, nombre, letra hebrea, test clínico, severidad
     - Genera prompt estructurado para Gemini
     - Retorna análisis con:
       - `analisis_sombra`: Explicación de cómo el arquetipo en sombra agrava el síntoma
       - `acciones_sanadoras`: Array de 3 acciones terapéuticas concretas
       - `mensaje_integrador`: Mensaje final que conecta todo

4. **`analyze_archetype_vs_clinical(patient, birth_date)`**
   - Función principal que orquesta el análisis completo
   - **Paso A**: Calcula Arcano de Vida
   - **Paso B**: Busca último test clínico del paciente
   - **Paso C**: Consulta IA con contexto completo
   - Retorna análisis estructurado

#### Vista API

**Ubicación**: `backend/api/tarot_views.py`

**Clase**: `TarotAnalysisView`

**Ruta**: `GET /api/therapist/patients/<id>/tarot-analysis/`

**Permisos**: `IsAuthenticated` (solo terapeutas pueden acceder)

**Validaciones**:
- Verifica que el paciente pertenezca al terapeuta actual
- Verifica que tenga fecha de nacimiento registrada
- Verifica que tenga al menos un test clínico realizado

**Respuesta JSON**:
```json
{
  "success": true,
  "carta_img_url": "/static/tarot/card_14.jpg",
  "nombre_carta": "La Templanza",
  "arcana_number": 14,
  "hebrew_letter": "ס",
  "sendero": "Tiferet → Yesod",
  "test_name": "GAD-7",
  "clinical_severity": "Ansiedad Severa",
  "test_date": "2024-01-15T10:30:00",
  "analisis_sombra": "Explicación detallada de cómo el arquetipo está agravando el síntoma...",
  "acciones_sanadoras": [
    {
      "titulo": "Anclaje Terrestre",
      "descripcion": "Caminar descalzo en la tierra para conectar con el elemento Tierra...",
      "tipo": "Biomagnetismo"
    },
    // ... 2 acciones más
  ],
  "mensaje_integrador": "Mensaje final que integra el arquetipo, el síntoma y el camino de sanación."
}
```

**Manejo de errores**:
- Fecha de nacimiento faltante → `400 Bad Request`
- Sin tests clínicos → `400 Bad Request`
- Paciente no encontrado → `404 Not Found`
- Error de IA → `500 Internal Server Error`

#### Frontend - Página de Tarot

**Ubicación**: `tonyblanco-app/app/dashboard/tools/tarot/page.tsx`

**Características**:
- Calculadora de Arcano de Vida basada en fecha de nacimiento
- Visualización de la carta del Tarot correspondiente
- Integración con el Árbol de la Vida interactivo (`TreeOfLifeTarot`)
- Botón "Protocolo Clínico" que abre la guía educativa

**Componente**: `TreeOfLifeTarot`
- Renderiza el Árbol de la Vida como SVG interactivo
- Muestra los 22 senderos con sus arcanos correspondientes
- Hover: Muestra tooltip con información del arcano
- Click: Abre modal con detalles completos de la carta
- Resalta el sendero del Arcano de Vida calculado

#### Contenido Educativo

**Ubicación**: `tonyblanco-app/data/tarot-guide-sections.ts`

**Secciones de la guía**:

1. **¿Qué es el Diagnóstico Cruzado?**
   - Explica que no es adivinación, sino cruce clínico
   - Metodología: Arquetipo (Hardware) + Síntoma (Software) = Análisis de Fricción

2. **El Arquetipo (La Energía Base)**
   - El "Hardware del Alma"
   - Ejemplo: El Loco (Aire, Libertad, Caos creativo)
   - Analogía: Hardware de computadora (no cambia)

3. **La Realidad Clínica (El Síntoma)**
   - El "Software Actual"
   - Ejemplo: Ansiedad Severa (exceso simpático, falta de regulación)
   - Analogía: Software que está corriendo (puede cambiar)

4. **La Fricción y la Sombra**
   - Cómo el arquetipo agrava el síntoma
   - Ejemplo: El Loco con Ansiedad → su naturaleza alimenta el fuego
   - Explica la lógica del conflicto

5. **Terapia de Sanidad Aplicada (Tikún)**
   - Prescripción del opuesto complementario
   - Caso práctico: El Loco con Ansiedad → Anclaje (Tierra)
   - Lista de acciones específicas (caminar descalzo, aceites de raíces, pesas, etc.)

6. **Protocolo de Interpretación**
   - Pasos del diagnóstico cruzado
   - Recordatorio: No eliminar el arquetipo, equilibrarlo

**Componente**: `AnalysisGuide`
- Panel lateral (Sheet/Slide-over) que muestra el contenido educativo
- Se abre al hacer clic en "Protocolo Clínico"
- Diseño elegante con secciones estructuradas

### Flujo de Uso

```
1. Terapeuta accede a ficha del paciente
   ↓
2. Clic en "Generar Análisis de Tarot" (botón en ficha)
   ↓
3. Frontend envía GET /api/therapist/patients/<id>/tarot-analysis/
   ↓
4. Backend:
   a) Calcula Arcano de Vida desde birth_date
   b) Busca último test clínico del paciente
   c) Consulta Gemini AI con contexto completo
   ↓
5. IA genera análisis:
   - Análisis de Sombra (cómo el arquetipo agrava el síntoma)
   - 3 Acciones de Sanación (terapéuticas concretas)
   - Mensaje Integrador
   ↓
6. Frontend muestra:
   - Carta del Tarot correspondiente
   - Análisis de Sombra
   - Grid de 3 acciones de sanación
   - Mensaje integrador
```

### Integración con Gemini AI

**Configuración**:
- Usa `GEMINI_API_KEY` de Django settings
- Modelo: `gemini-1.5-flash` (configurable)
- Temperature: 0.8 (creatividad balanceada)
- Max tokens: 2048

**Prompt estructurado**:
- Actúa como Terapeuta Experto en Psicología Transpersonal y Cábala
- Analiza cómo el arquetipo en sombra está relacionado con el síntoma
- Genera acciones terapéuticas específicas y aplicables
- Integra sabiduría cabalística con psicología clínica

### Archivos Creados/Modificados

#### Backend

**Nuevos archivos**:
- `backend/api/utils/tarot_service.py` - Servicio de análisis de Tarot
- `backend/api/tarot_views.py` - Vista API para análisis de Tarot

**Archivos modificados**:
- `backend/api/urls.py` - Agregada ruta `/api/therapist/patients/<id>/tarot-analysis/`

#### Frontend

**Archivos modificados**:
- `tonyblanco-app/data/tarot-guide-sections.ts` - Contenido educativo actualizado (enfoque diagnóstico cruzado)
- `tonyblanco-app/app/dashboard/tools/tarot/page.tsx` - Botón "Protocolo Clínico" actualizado

**Componentes existentes**:
- `tonyblanco-app/components/TreeOfLifeTarot.tsx` - Árbol de la Vida interactivo
- `tonyblanco-app/components/shared/AnalysisGuide.tsx` - Componente universal de guía educativa
- `tonyblanco-app/data/tarot-arcana.ts` - Definición de los 22 arcanos
- `tonyblanco-app/lib/tarot-calculator.ts` - Calculadora de Arcano de Vida

### Ejemplo de Uso

**Caso**: Paciente con fecha de nacimiento `1985-03-15` y último test `GAD-7` con resultado `Ansiedad Severa`

1. **Cálculo de Arcano de Vida**:
   - Suma: 1+9+8+5+0+3+1+5 = 32
   - Reduce: 3+2 = 5
   - **Arcano 5: El Hierofante (ו)**

2. **Análisis de IA**:
   - Identifica que El Hierofante (estructura, tradición, autoridad) en sombra puede agravar la ansiedad
   - Genera acciones de sanación específicas (ej: trabajo con Agua para suavizar la rigidez)

3. **Resultado**:
   - Terapeuta ve cómo el arquetipo nativo está contribuyendo al desequilibrio
   - Recibe 3 acciones concretas para equilibrar la energía
   - Puede aplicar el Tikún (corrección) de forma específica

### Notas Técnicas

- **Dependencia de Gemini AI**: El módulo requiere `GEMINI_API_KEY` configurada
- **Validación de datos**: Requiere fecha de nacimiento y al menos un test clínico
- **Permisos**: Solo terapeutas pueden generar análisis (el paciente debe pertenecer al terapeuta)
- **Caché**: Los resultados no se guardan automáticamente (se pueden guardar manualmente en la ficha del paciente)

---

**Última actualización**: Enero 2024  
**Versión del sistema**: 2.2 (Módulo de Tarot Terapéutico Cruzado Implementado)  
**Estado**: Producción

