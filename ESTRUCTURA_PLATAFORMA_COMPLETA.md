# 📋 Estructura Completa de la Plataforma - Análisis Cabalístico y Clínico

**Documento de Arquitectura y Guía de Implementación**  
**Versión:** 1.0  
**Fecha:** Diciembre 2024

---

## 📑 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura General](#arquitectura-general)
3. [Backend (Django/Python)](#backend-djangopython)
4. [Frontend (Next.js/TypeScript)](#frontend-nextjstypescript)
5. [Sistema de Tests Modulares](#sistema-de-tests-modulares)
6. [Integración con IA (Gemini)](#integración-con-ia-gemini)
7. [Sistema de Análisis Cabalísticos](#sistema-de-análisis-cabalísticos)
8. [Sistema de Pacientes y Terapeutas](#sistema-de-pacientes-y-terapeutas)
9. [Sistema de Pagos y Membresías](#sistema-de-pagos-y-membresías)
10. [Guía para Implementar Nuevo Modelo Clínico](#guía-para-implementar-nuevo-modelo-clínico)

---

## 🎯 Resumen Ejecutivo

### ¿Qué hace esta plataforma?

Esta es una **plataforma holística de análisis cabalístico y clínico** que combina:

1. **Análisis Cabalísticos** (Gematría, Shejinah, Tarot, Astrología Kerykeion)
2. **Tests Psicométricos Clínicos** (PHQ-9, GAD-7, PAI, BDI-II, BAI, STAI, SCL-90-R, PTSD)
3. **Sistema de Pacientes** (para terapeutas profesionales)
4. **Análisis con IA** (Gemini AI para interpretaciones personalizadas)
5. **Sistema de Membresías** (Free, Personal, Professional, Premium)
6. **Marketplace de Servicios** (reservas, pagos, cursos)

### Stack Tecnológico

- **Backend:** Django 5.2.9 + Django REST Framework + PostgreSQL
- **Frontend:** Next.js 16.0.7 + React 19 + TypeScript + Tailwind CSS
- **IA:** Google Gemini AI (SDK `google-genai`)
- **Pagos:** Stripe + Bizum
- **Deployment:** Render (Backend) + Vercel (Frontend)

---

## 🏗️ Arquitectura General

```
analisis_cabalistico_alma/
├── backend/              # Django API REST
│   ├── api/             # App principal de API
│   ├── core/            # Configuración Django
│   ├── courses/         # Sistema LMS
│   └── cabala_py/       # Motor de cálculos cabalísticos
│
├── tonyblanco-app/      # Next.js Frontend
│   ├── app/             # Rutas y páginas (App Router)
│   ├── components/      # Componentes React reutilizables
│   ├── lib/             # Lógica de negocio TypeScript
│   └── data/            # Datos estáticos (JSON, traducciones)
│
└── docs/                # Documentación
```

### Flujo de Datos

```
Usuario → Frontend (Next.js) → API REST (Django) → Base de Datos (PostgreSQL)
                                    ↓
                            Motor de Cálculos (Python)
                                    ↓
                            Gemini AI (Interpretaciones)
```

---

## 🔧 Backend (Django/Python)

### Estructura de Directorios

```
backend/
├── api/                          # App principal
│   ├── models.py                 # Modelos de BD (UserProfile, Patient, TestModule, etc.)
│   ├── views.py                  # Vistas principales
│   ├── serializers.py            # Serializadores DRF
│   ├── urls.py                   # Rutas API
│   ├── test_views.py              # Vistas de tests modulares
│   ├── test_models.py            # Modelos de tests
│   ├── test_serializers.py       # Serializadores de tests
│   ├── cabalistic_views.py       # Análisis cabalísticos
│   ├── gematria_views.py         # Gematría
│   ├── tarot_views.py            # Tarot
│   ├── pai.py                    # Cálculo PAI
│   ├── diagnostics.py            # Tests clínicos (BDI, BAI, STAI, SCL-90-R)
│   ├── ai_interpreter.py         # Motor de IA (Gemini)
│   ├── synthesis_engine/         # Motor de síntesis cruzada
│   │   ├── engine.py
│   │   ├── normalizers.py
│   │   ├── rules.py
│   │   └── schemas.py
│   └── utils/
│       ├── gemini_rest.py        # Cliente Gemini REST
│       ├── holistic_ai.py        # Análisis holísticos
│       └── clinical_scorer.py   # Puntuación clínica
│
├── cabala_py/                    # Motor de cálculos cabalísticos
│   ├── gematria.py               # Cálculo de Gematría
│   ├── numerology.py             # Numerología
│   ├── inclusion.py               # Inclusión numérica
│   ├── arbol_vida.py              # Árbol de la Vida
│   ├── soul_analytics.py         # Análisis del alma
│   └── integracion_arbol.py      # Integración con Árbol
│
├── core/                          # Configuración Django
│   ├── settings.py                # Configuración principal
│   ├── urls.py                    # URLs raíz
│   └── wsgi.py / asgi.py          # Servidores WSGI/ASGI
│
└── courses/                       # Sistema LMS
    └── models.py                  # Modelos de cursos
```

### Modelos Principales de Base de Datos

#### 1. UserProfile
```python
# backend/api/models.py
class UserProfile(models.Model):
    user = OneToOneField(User)
    user_type = CharField(choices=['personal', 'therapist', 'patient', 'visitor'])
    full_name = CharField()  # Para cálculos cabalísticos
    birth_date = DateField()
    
    # Membresía
    membership_active = BooleanField()
    subscription_status = CharField(choices=['trial', 'active', 'canceled', 'expired'])
    subscription_plan = CharField()  # 'personal', 'professional', 'premium'
    
    # Límites
    max_fichas_per_month = IntegerField()
    max_patients = IntegerField()  # Para terapeutas
    current_patients_count = IntegerField()
    
    # Stripe
    stripe_customer_id = CharField()
    stripe_subscription_id = CharField()
```

#### 2. Patient
```python
class Patient(models.Model):
    user = ForeignKey(User)  # Terapeuta dueño
    full_name = CharField()
    birth_date = DateField()
    email = EmailField()
    phone = CharField()
    
    # Coordenadas para astrología
    latitude = DecimalField()
    longitude = DecimalField()
    city = CharField()
    country = CharField()
    
    # Análisis guardados
    # (relacionados vía TestResult con patient_id)
```

#### 3. TestModule
```python
class TestModule(models.Model):
    code = CharField(unique=True)  # 'phq-9', 'shekinah', 'gematria'
    name = CharField()
    description = TextField()
    test_type = CharField()  # 'clinical', 'cabala', 'astrology'
    
    # Control de acceso
    required_access_level = CharField()  # 'free', 'personal', 'professional', 'premium'
    uses_per_month = IntegerField(null=True)  # null = ilimitado
    
    # Disponibilidad
    is_active = BooleanField()
    available_for_therapists = BooleanField()
    available_for_personal = BooleanField()
    
    # Licencias
    requires_license = BooleanField()
    license_info = TextField()
```

#### 4. TestResult
```python
class TestResult(models.Model):
    user = ForeignKey(User)
    test_module = ForeignKey(TestModule, null=True)
    test_id = CharField()  # Para tests sin módulo (ej: 'phq-9')
    
    # Datos
    input_data = JSONField()   # Datos de entrada
    result_data = JSONField()  # Resultados calculados
    
    # Para terapeutas
    patient = ForeignKey(Patient, null=True)
    client_name = CharField()
    client_birth_date = DateField()
    
    # Metadata
    notes = TextField()
    is_favorite = BooleanField()
    is_archived = BooleanField()
    created_at = DateTimeField()
```

#### 5. UserTestAccess
```python
class UserTestAccess(models.Model):
    user = ForeignKey(User)
    test_module = ForeignKey(TestModule)
    
    # Control de uso
    uses_count = IntegerField()
    current_month_uses = IntegerField()
    
    # Acceso especial
    has_special_access = BooleanField()
    special_access_expires = DateTimeField()
    special_access_uses = IntegerField()
```

### Endpoints API Principales

#### Autenticación
- `POST /api/login/` - Login con email/username
- `POST /api/login/google/` - OAuth Google
- `POST /api/register/therapist/` - Registro terapeuta
- `POST /api/register/personal/` - Registro personal
- `GET /api/me/` - Usuario actual
- `PATCH /api/me/profile/` - Actualizar perfil

#### Tests Modulares
- `GET /api/tests/` - Lista tests disponibles
- `GET /api/tests/{code}/` - Detalle de test
- `POST /api/tests/execute/` - Ejecutar test
- `POST /api/tests/submit/` - Enviar test (procesamiento)
- `GET /api/tests/results/` - Lista resultados
- `GET /api/tests/results/{id}/` - Detalle resultado
- `GET /api/tests/stats/` - Estadísticas de uso

#### Análisis Cabalísticos
- `POST /api/therapist/patients/{id}/cabalistic-analysis/` - Guardar análisis
- `GET /api/therapist/patients/{id}/cabalistic-analyses/` - Listar análisis
- `POST /api/therapist/patients/{id}/astrology-kerykeion/` - Análisis astrológico
- `POST /api/therapist/patients/{id}/crossover/generate-and-save/` - Síntesis cruzada
- `POST /api/therapist/patients/{id}/tarot-analysis/generate-and-save/` - Tarot

#### Pacientes (Terapeutas)
- `POST /api/therapist/patients/create/` - Crear paciente
- `GET /api/therapist/patients/` - Lista pacientes
- `GET /api/therapist/patients/{id}/` - Detalle paciente
- `GET /api/therapist/dashboard/` - Dashboard terapeuta

#### Pagos
- `POST /api/payments/create-checkout/` - Crear sesión Stripe
- `POST /api/payments/webhook/` - Webhook Stripe
- `POST /api/payments/cancel-subscription/` - Cancelar suscripción
- `GET /api/payments/subscription-status/` - Estado suscripción

### Motor de Cálculos Cabalísticos

**Ubicación:** `backend/cabala_py/`

**Funciones principales:**
- `analisis_gemátrico_completo()` - Análisis completo de Gematría
- `calcular_inclusion_base()` - Inclusión numérica
- `generar_analisis_cabalista()` - Análisis con Árbol de la Vida
- `calcular_numerologia()` - Numerología pitagórica

**Sistemas soportados:**
- Pitagórico
- Caldeo
- Hebreo
- Ordinal
- D'Shevastan

### Tests Clínicos Implementados

**Ubicación:** `backend/api/diagnostics.py` y `backend/api/pai.py`

**Tests disponibles:**
1. **PAI** (`pai.py`) - Personality Assessment Inventory
2. **BDI-II** (`diagnostics.py`) - Beck Depression Inventory
3. **BAI** (`diagnostics.py`) - Beck Anxiety Inventory
4. **STAI** (`diagnostics.py`) - State-Trait Anxiety Inventory
5. **SCL-90-R** (`diagnostics.py`) - Symptom Checklist
6. **PTSD** - Post-Traumatic Stress Disorder

**Estructura de cálculo:**
```python
def compute_[test_name](input_data: dict) -> dict:
    """
    Calcula puntuaciones del test
    
    Args:
        input_data: {
            'responses': {question_id: score},
            'nombre': str,
            'edad': int,
            'fecha': str
        }
    
    Returns:
        {
            'puntuaciones': {...},
            'interpretacion': [...],
            'escalas_validez': {...}
        }
    """
```

---

## 🎨 Frontend (Next.js/TypeScript)

### Estructura de Directorios

```
tonyblanco-app/
├── app/                          # App Router (Next.js 13+)
│   ├── dashboard/                # Dashboard principal
│   │   ├── tools/                # Herramientas de análisis
│   │   │   ├── shekinah/         # Análisis Shejinah
│   │   │   ├── gematria/         # Gematría
│   │   │   ├── tarot/            # Tarot
│   │   │   ├── astrology-kerykeion/  # Astrología
│   │   │   └── soul-map/         # Mapa del alma
│   │   └── patients/             # Gestión de pacientes
│   │
│   ├── tests/                    # Tests modulares
│   │   ├── page.tsx              # Catálogo de tests
│   │   ├── [domain]/             # Por dominio (cabala, psicologia, astrologia)
│   │   │   └── [code]/           # Test específico
│   │   └── results/              # Resultados guardados
│   │
│   ├── patients/                  # Vista de pacientes
│   │   └── [id]/                 # Detalle paciente
│   │       ├── page.tsx
│   │       └── correlations/     # Correlaciones
│   │
│   ├── therapist/                # Panel terapeuta
│   │   └── patients/             # Gestión pacientes
│   │
│   ├── login/                     # Autenticación
│   ├── register/                  # Registro
│   └── wellness/                  # Análisis de bienestar
│
├── components/                    # Componentes React
│   ├── ui/                       # Componentes UI base (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── TestExecution.tsx         # Ejecutor genérico de tests
│   ├── TestSelector.tsx           # Selector de tests
│   ├── GenericTest.tsx            # Test genérico
│   ├── TherapistRoute.tsx         # Ruta protegida terapeuta
│   ├── ShekinahGuideModal.tsx     # Guía Shejinah
│   └── WellnessAnalysis.tsx       # Análisis de bienestar
│
├── lib/                          # Lógica de negocio
│   ├── api.ts                    # Cliente API REST
│   ├── auth.ts                   # Autenticación
│   ├── test-api.ts               # API de tests
│   ├── test-types.ts             # Tipos TypeScript
│   ├── test-domains.ts           # Mapeo de tests por dominio
│   │
│   ├── shekinah-engine.ts         # Motor Shejinah
│   ├── shekinah-cosmic-calc.ts    # Cálculo cósmico
│   ├── shekinah-shields.ts        # Escudos protectores
│   ├── gematria-engine.ts         # Motor Gematría
│   ├── tarot-calculator.ts        # Calculadora Tarot
│   ├── kerykeion-engine.ts        # Motor astrológico
│   │
│   ├── gemini-config.ts          # Configuración Gemini
│   ├── kabbalistic-ai-base.ts    # Base para IA cabalística
│   ├── wellness-ai-analysis.ts   # Análisis IA bienestar
│   └── financial-ai-analysis.ts  # Análisis IA financiero
│
└── data/                         # Datos estáticos
    ├── tests-questions.ts        # Preguntas de tests
    ├── tarot-arcana.ts           # Arcanos del Tarot
    └── hebrew_words_database.json # Base de datos hebrea
```

### Sistema de Rutas de Tests

**Estructura implementada:**
```
/tests/                           # Catálogo principal
/tests/cabala/[code]/            # Test cabalístico específico
/tests/psicologia/[code]/        # Test psicológico específico
/tests/astrologia/[code]/        # Test astrológico específico
/tests/results/                  # Lista de resultados
/tests/results/[id]/             # Detalle de resultado
```

**Componente genérico:** `components/TestExecution.tsx`
- Carga datos del usuario
- Maneja campos bloqueados
- Soporta tests de compatibilidad
- Guarda resultados automáticamente

### Motores de Cálculo Frontend

#### 1. Shejinah Engine
**Archivo:** `lib/shekinah-engine.ts`

**Funcionalidades:**
- Cálculo de Gematría
- OTD (Origen, Transformación, Destino)
- Vibraciones (Espíritu, Alma, Cuerpo)
- Escudos Protectores
- Imagen del Alma
- Cálculo Cósmico (T/L/P/C)

**Interfaz:**
```typescript
export interface ShekinahResult {
  identity: { gematriaTotal, scf, pin, et };
  vibrations: { spirit, soul, body, healingEffect, today };
  otd: { to, pt, td };
  shields: { active, list };
  soulImage: { active, portals };
  karmic: { openAccounts, archaic, pending };
  portals: Array<{id, name, number, status}>;
}
```

#### 2. Gematría Engine
**Archivo:** `lib/gematria-engine.ts`

**Sistemas soportados:**
- Pitagórico
- Caldeo
- Hebreo

#### 3. Tarot Calculator
**Archivo:** `lib/tarot-calculator.ts`

**Funcionalidades:**
- Cálculo de cartas por fecha
- Interpretación de arcanos
- Tiradas personalizadas

#### 4. Kerykeion Engine
**Archivo:** `lib/kerykeion-engine.ts`

**Funcionalidades:**
- Cálculo de carta astral
- Mapeo a Cábala
- Análisis de casas y planetas

---

## 🧪 Sistema de Tests Modulares

### Arquitectura

El sistema permite agregar nuevos tests sin modificar código existente mediante:

1. **TestModule** (BD) - Define el test
2. **TestExecution** (Frontend) - Componente genérico
3. **test_views.py** (Backend) - Procesamiento genérico
4. **diagnostics.py / pai.py** - Funciones de cálculo específicas

### Flujo de Ejecución

```
1. Usuario selecciona test → GET /api/tests/{code}/
2. Frontend carga TestExecution con código
3. Usuario completa formulario
4. POST /api/tests/execute/ → Backend valida acceso
5. Backend llama función de cálculo (compute_xxx)
6. Resultado se guarda en TestResult
7. Frontend muestra resultado
```

### Cómo Agregar un Nuevo Test Clínico

#### Paso 1: Crear función de cálculo (Backend)

**Archivo:** `backend/api/diagnostics.py` (o crear nuevo archivo)

```python
def compute_nuevo_test(input_data: dict) -> dict:
    """
    Calcula puntuaciones del nuevo test
    
    Args:
        input_data: {
            'responses': {question_id: score},
            'nombre': str,
            'edad': int,
            'fecha': str
        }
    
    Returns:
        {
            'puntuaciones': {
                'escala1': {'bruta': int, 'maxima': int, 'porcentaje': float},
                'escala2': {...}
            },
            'interpretacion': [...],
            'escalas_validez': {...},
            'codigo_evaluacion': str
        }
    """
    responses = input_data.get('responses', {})
    
    # Calcular puntuaciones
    scores = {
        'escala1': sum([responses.get(f'q{i}', 0) for i in range(1, 11)]),
        'escala2': sum([responses.get(f'q{i}', 0) for i in range(11, 21)])
    }
    
    # Interpretación
    interpretation = []
    if scores['escala1'] >= 15:
        interpretation.append('Indicadores significativos de...')
    
    return {
        'puntuaciones': {
            'escala1': {
                'puntuacion_bruta': scores['escala1'],
                'puntuacion_maxima': 30,
                'porcentaje': round((scores['escala1'] / 30) * 100)
            },
            # ... más escalas
        },
        'interpretacion': interpretation,
        'codigo_evaluacion': _generate_unique_code()
    }
```

#### Paso 2: Registrar en test_views.py

**Archivo:** `backend/api/test_views.py`

```python
# En ExecuteTestView.post()
from api.diagnostics import compute_nuevo_test

TEST_COMPUTERS = {
    'phq-9': compute_phq9,
    'gad-7': compute_gad7,
    'nuevo-test': compute_nuevo_test,  # ← Agregar aquí
    # ... más tests
}
```

#### Paso 3: Crear TestModule en BD

**Script:** `backend/initialize_tests.py` (o Django admin)

```python
TestModule.objects.create(
    code='nuevo-test',
    name='Nuevo Test Clínico',
    description='Descripción del test',
    test_type='clinical',
    required_access_level='professional',
    uses_per_month=10,
    is_active=True,
    available_for_therapists=True,
    available_for_personal=False
)
```

#### Paso 4: Crear página Frontend

**Archivo:** `tonyblanco-app/app/tests/psicologia/nuevo-test/page.tsx`

```typescript
'use client';

import TestExecution from '@/components/TestExecution';
import { questions } from '@/data/tests-questions';

export default function NuevoTestPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          Nuevo Test Clínico
        </h1>
        
        <TestExecution
          testCode="nuevo-test"
          domain="psicologia"
          questions={questions['nuevo-test']}
        />
      </div>
    </div>
  );
}
```

#### Paso 5: Agregar preguntas

**Archivo:** `tonyblanco-app/data/tests-questions.ts`

```typescript
export const questions = {
  'nuevo-test': [
    {
      id: 'q1',
      text: 'Pregunta 1...',
      type: 'scale',
      options: [
        { value: 0, label: 'Nunca' },
        { value: 1, label: 'A veces' },
        { value: 2, label: 'Frecuentemente' },
        { value: 3, label: 'Siempre' }
      ]
    },
    // ... más preguntas
  ]
};
```

#### Paso 6: Registrar en test-domains.ts

**Archivo:** `tonyblanco-app/lib/test-domains.ts`

```typescript
export const TEST_DOMAINS: Record<TestDomain, TestDomainMapping> = {
  psicologia: {
    name: 'Psicología Clínica',
    tests: {
      'nuevo-test': {  // ← Agregar aquí
        name: 'Nuevo Test Clínico',
        description: '...',
        icon: 'Brain',
        route: '/tests/psicologia/nuevo-test'
      },
      // ... más tests
    }
  }
};
```

---

## 🤖 Integración con IA (Gemini)

### Configuración

**Archivo:** `backend/core/settings.py`
```python
GEMINI_API_KEY = config('GEMINI_API_KEY')
GEMINI_MODEL = config('GEMINI_MODEL', default='gemini-2.0-flash')
```

**Cliente:** `backend/api/utils/gemini_rest.py`
```python
def call_gemini_api(
    prompt: str,
    model_name: str = 'gemini-2.0-flash',
    temperature: float = 0.8,
    max_output_tokens: int = 2048
) -> str:
    """Llama a Gemini API usando REST"""
```

### Uso en Análisis

**Archivo:** `backend/api/ai_interpreter.py`

```python
class GeminiInterpreter:
    def generate_basic_interpretation(self, nombre, fecha, numeros):
        """Genera interpretación cabalística"""
        
    def generate_compatibility_interpretation(self, persona1, persona2, score):
        """Genera interpretación de compatibilidad"""
        
    def generate_clinical_analysis(self, test_result, patient_data):
        """Genera análisis clínico con IA"""
```

### Servicios de IA Especializados

**Archivos:**
- `lib/wellness-ai-analysis.ts` - Análisis de bienestar
- `lib/financial-ai-analysis.ts` - Análisis financiero
- `lib/kabbalistic-ai-base.ts` - Base para análisis cabalísticos

**Patrón de uso:**
```typescript
import { generateAnalysis } from '@/lib/wellness-ai-analysis';

const analysis = await generateAnalysis({
  testResults: [...],
  patientData: {...},
  context: 'clinical'
});
```

---

## 🔮 Sistema de Análisis Cabalísticos

### Tipos de Análisis Implementados

1. **Shejinah** (`lib/shekinah-engine.ts`)
   - Gematría Total
   - OTD (Origen, Transformación, Destino)
   - Vibraciones del Ser
   - Escudos Protectores
   - Imagen del Alma
   - Cálculo Cósmico (T/L/P/C)

2. **Gematría** (`lib/gematria-engine.ts`)
   - Sistemas: Pitagórico, Caldeo, Hebreo
   - Análisis completo de nombre

3. **Tarot** (`lib/tarot-calculator.ts`)
   - Cálculo de cartas por fecha
   - Interpretación de arcanos

4. **Astrología Kerykeion** (`lib/kerykeion-engine.ts`)
   - Carta astral
   - Mapeo a Cábala
   - Análisis de casas

5. **Crossover Synthesis** (`backend/api/synthesis_engine/`)
   - Síntesis de múltiples análisis
   - Normalización de datos
   - Reglas de integración

### Guardado de Análisis

**Endpoint:** `POST /api/therapist/patients/{id}/cabalistic-analysis/`

**Estructura:**
```json
{
  "test_type": "shekinah",
  "result": {
    "identity": {...},
    "vibrations": {...},
    "otd": {...}
  },
  "summary": "Resumen del análisis"
}
```

**Modelo:** Se guarda en `TestResult` con `test_module` = null y `test_id` = 'shekinah'

---

## 👥 Sistema de Pacientes y Terapeutas

### Roles de Usuario

1. **Personal** - Usuario individual
   - Límite: 10 fichas/mes
   - Acceso a tests básicos

2. **Therapist** - Terapeuta profesional
   - Pacientes ilimitados (según plan)
   - Acceso a todos los tests
   - Dashboard de pacientes

3. **Patient** - Paciente asignado
   - Acceso limitado a su propio perfil
   - Tests asignados por terapeuta

### Flujo de Trabajo Terapeuta

```
1. Terapeuta crea paciente → POST /api/therapist/patients/create/
2. Terapeuta ejecuta análisis → POST /api/tests/execute/ (con patient_id)
3. Resultado se vincula al paciente
4. Terapeuta ve historial → GET /api/therapist/patients/{id}/
5. Terapeuta genera plan IA → POST /api/therapist/patients/{id}/generate-ai-plan/
```

### Modelo Patient

```python
class Patient(models.Model):
    user = ForeignKey(User)  # Terapeuta dueño
    full_name = CharField()
    birth_date = DateField()
    
    # Coordenadas (para astrología)
    latitude = DecimalField()
    longitude = DecimalField()
    city = CharField()
    
    # Análisis relacionados vía TestResult.patient
```

---

## 💳 Sistema de Pagos y Membresías

### Planes Disponibles

1. **Free (Trial)**
   - Análisis Básico (ilimitado)
   - Sin acceso a tests premium

2. **Personal (€29 único)**
   - Tests básicos
   - 10 fichas/mes

3. **Professional (€49/mes)** - Solo terapeutas
   - Todos los tests
   - Pacientes ilimitados

4. **Premium (€99/mes)**
   - Todo incluido
   - Tests exclusivos

### Integración Stripe

**Endpoints:**
- `POST /api/payments/create-checkout/` - Crear sesión
- `POST /api/payments/webhook/` - Webhook de eventos
- `POST /api/payments/cancel-subscription/` - Cancelar

**Modelo:** `UserProfile` almacena `stripe_customer_id` y `stripe_subscription_id`

### Integración Bizum

**Endpoints:**
- `POST /api/payments/bizum/notify/` - Notificación de pago
- `POST /api/payments/activate/` - Activar membresía

---

## 📝 Guía para Implementar Nuevo Modelo Clínico

### Checklist de Implementación

#### Backend (Python/Django)

- [ ] **1. Crear función de cálculo**
  - Archivo: `backend/api/diagnostics.py` (o nuevo archivo)
  - Función: `compute_nuevo_modelo(input_data: dict) -> dict`
  - Validar estructura de respuesta

- [ ] **2. Registrar en test_views.py**
  - Agregar a `TEST_COMPUTERS` dict
  - Mapear código del test → función

- [ ] **3. Crear TestModule en BD**
  - Código único
  - Nivel de acceso requerido
  - Límites de uso
  - Disponibilidad (therapists/personal)

- [ ] **4. Crear migración (si necesario)**
  - Solo si se agregan campos nuevos a modelos

#### Frontend (TypeScript/Next.js)

- [ ] **5. Crear página de test**
  - Ruta: `app/tests/[domain]/[code]/page.tsx`
  - Usar componente `TestExecution`

- [ ] **6. Agregar preguntas**
  - Archivo: `data/tests-questions.ts`
  - Estructura: `{id, text, type, options}`

- [ ] **7. Registrar en test-domains.ts**
  - Agregar al dominio correspondiente
  - Configurar metadata (nombre, descripción, icono)

- [ ] **8. Crear componente de visualización (opcional)**
  - Si requiere visualización especial
  - Archivo: `components/NuevoModeloReport.tsx`

#### Integración con IA (Opcional)

- [ ] **9. Crear servicio de IA**
  - Archivo: `lib/nuevo-modelo-ai.ts`
  - Función: `generateAnalysis(result_data, patient_data)`

- [ ] **10. Integrar en análisis**
  - Llamar desde página de resultados
  - Mostrar interpretación generada

### Estructura de Datos Estándar

#### Input Data (Frontend → Backend)
```typescript
{
  test_module_code: 'nuevo-modelo',
  input_data: {
    responses: {
      'q1': 2,
      'q2': 3,
      // ... más respuestas
    },
    nombre: 'Juan Pérez',
    edad: 35,
    fecha: '2024-12-15'
  },
  patient_id?: 123,  // Opcional (para terapeutas)
  client_name?: 'Juan Pérez',
  save_result: true
}
```

#### Result Data (Backend → Frontend)
```typescript
{
  codigo_evaluacion: 'ABC123',
  fecha_evaluacion: '2024-12-15',
  datos_cliente: {
    nombre: 'Juan Pérez',
    edad: 35
  },
  puntuaciones: {
    escala1: {
      puntuacion_bruta: 15,
      puntuacion_maxima: 30,
      porcentaje: 50
    }
  },
  interpretacion: [
    'Indicadores moderados de...',
    'Se recomienda...'
  ],
  escalas_validez: {
    inconsistencia: { puntuacion: 2, valido: true }
  }
}
```

### Ejemplo Completo: Implementar Test de Ansiedad

#### Backend

**1. Función de cálculo** (`backend/api/diagnostics.py`)
```python
def compute_ansiedad_test(input_data: dict) -> dict:
    responses = input_data.get('responses', {})
    
    # Calcular puntuación total
    total = sum([responses.get(f'q{i}', 0) for i in range(1, 21)])
    
    # Interpretación
    interpretation = []
    if total >= 60:
        interpretation.append('Ansiedad severa - Se recomienda consulta profesional')
    elif total >= 40:
        interpretation.append('Ansiedad moderada')
    elif total >= 20:
        interpretation.append('Ansiedad leve')
    else:
        interpretation.append('Niveles normales de ansiedad')
    
    return {
        'puntuaciones': {
            'total': {
                'puntuacion_bruta': total,
                'puntuacion_maxima': 80,
                'porcentaje': round((total / 80) * 100)
            }
        },
        'interpretacion': interpretation,
        'codigo_evaluacion': _generate_unique_code()
    }
```

**2. Registrar** (`backend/api/test_views.py`)
```python
from api.diagnostics import compute_ansiedad_test

TEST_COMPUTERS = {
    # ... otros tests
    'ansiedad-test': compute_ansiedad_test,
}
```

**3. Crear TestModule** (Django admin o script)
```python
TestModule.objects.create(
    code='ansiedad-test',
    name='Test de Ansiedad',
    description='Evaluación de niveles de ansiedad',
    test_type='clinical',
    required_access_level='personal',
    uses_per_month=5,
    is_active=True,
    available_for_therapists=True,
    available_for_personal=True
)
```

#### Frontend

**4. Página** (`tonyblanco-app/app/tests/psicologia/ansiedad-test/page.tsx`)
```typescript
'use client';

import TestExecution from '@/components/TestExecution';
import { questions } from '@/data/tests-questions';

export default function AnsiedadTestPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <TestExecution
        testCode="ansiedad-test"
        domain="psicologia"
        questions={questions['ansiedad-test']}
      />
    </div>
  );
}
```

**5. Preguntas** (`tonyblanco-app/data/tests-questions.ts`)
```typescript
export const questions = {
  'ansiedad-test': [
    {
      id: 'q1',
      text: 'Me siento nervioso/a',
      type: 'scale',
      options: [
        { value: 0, label: 'Nunca' },
        { value: 1, label: 'A veces' },
        { value: 2, label: 'Frecuentemente' },
        { value: 3, label: 'Siempre' }
      ]
    },
    // ... 19 preguntas más
  ]
};
```

**6. Registrar** (`tonyblanco-app/lib/test-domains.ts`)
```typescript
psicologia: {
  tests: {
    'ansiedad-test': {
      name: 'Test de Ansiedad',
      description: 'Evaluación de niveles de ansiedad',
      icon: 'AlertTriangle',
      route: '/tests/psicologia/ansiedad-test'
    }
  }
}
```

---

## 🔄 Flujos de Integración

### Flujo Completo: Ejecutar Test Clínico

```
1. Usuario accede a /tests/psicologia/ansiedad-test
2. Frontend carga TestExecution con código 'ansiedad-test'
3. Usuario completa 20 preguntas
4. Frontend envía POST /api/tests/execute/
   {
     test_module_code: 'ansiedad-test',
     input_data: { responses: {...} },
     save_result: true
   }
5. Backend valida acceso (UserTestAccess)
6. Backend llama compute_ansiedad_test(input_data)
7. Backend guarda en TestResult
8. Backend retorna resultado
9. Frontend muestra resultado con interpretación
10. Usuario puede ver historial en /tests/results/
```

### Flujo: Análisis Cabalístico para Paciente

```
1. Terapeuta accede a /therapist/patients/123/
2. Terapeuta selecciona "Análisis Shejinah"
3. Frontend carga datos del paciente
4. Frontend calcula análisis (lib/shekinah-engine.ts)
5. Frontend muestra resultado
6. Terapeuta guarda → POST /api/therapist/patients/123/cabalistic-analysis/
7. Backend guarda en TestResult vinculado al paciente
8. Análisis disponible en historial del paciente
```

---

## 📊 Base de Datos - Modelos Clave

### Relaciones Principales

```
User (Django Auth)
  └── UserProfile (1:1)
      ├── Fichas (1:N)
      ├── Patients (1:N) [si es therapist]
      └── TestResults (1:N)
          └── TestModule (N:1) [opcional]
          └── Patient (N:1) [opcional, si es de terapeuta]

TestModule
  ├── TestResults (1:N)
  └── UserTestAccess (1:N)

Patient
  └── TestResults (1:N)
```

### Campos JSON en TestResult

**input_data:**
```json
{
  "responses": {"q1": 2, "q2": 3},
  "nombre": "Juan Pérez",
  "edad": 35,
  "fecha": "2024-12-15"
}
```

**result_data:**
```json
{
  "puntuaciones": {...},
  "interpretacion": [...],
  "codigo_evaluacion": "ABC123"
}
```

---

## 🛠️ Utilidades y Helpers

### Backend

**`backend/api/utils/gemini_rest.py`**
- Cliente REST para Gemini AI
- Manejo de errores y retry

**`backend/api/utils/clinical_scorer.py`**
- Funciones de puntuación clínica
- Normalización de scores

**`backend/api/synthesis_engine/`**
- Motor de síntesis cruzada
- Normalización de múltiples análisis
- Reglas de integración

### Frontend

**`lib/api.ts`**
- Cliente API REST
- Funciones helper para llamadas
- Manejo de autenticación

**`lib/auth.ts`**
- Gestión de tokens
- Verificación de sesión
- Redirección de login

**`lib/utils.ts`**
- Utilidades generales
- Formateo de fechas
- Validaciones

---

## 🚀 Deployment

### Backend (Render)

**Archivos clave:**
- `Procfile` - Configuración de servidor
- `requirements.txt` - Dependencias Python
- `.env` - Variables de entorno

**Variables de entorno necesarias:**
```
SECRET_KEY
DEBUG
DATABASE_URL
GEMINI_API_KEY
GEMINI_MODEL
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

### Frontend (Vercel)

**Archivos clave:**
- `vercel.json` - Configuración Vercel
- `next.config.mjs` - Configuración Next.js
- `.env.local` - Variables de entorno

**Variables de entorno:**
```
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

---

## 📚 Documentación Adicional

### Archivos de Documentación Existentes

- `docs/TESTS_SYSTEM.md` - Sistema de tests modulares
- `IMPLEMENTACION_RUTAS_TESTS_COMPLETA.md` - Estructura de rutas
- `backend/API_DOCUMENTATION.md` - Documentación API
- `MODULOS_ANALISIS_CABALISTICO.md` - Módulos cabalísticos
- `SERVICIOS_IMPLEMENTACION.md` - Sistema de servicios

### Scripts Útiles

**Backend:**
- `initialize_tests.py` - Inicializar tests en BD
- `populate_services.py` - Poblar servicios
- `setup_admin.py` - Configurar admin

**Frontend:**
- `scripts/convert_db.js` - Conversión de datos
- `scripts/repair_json.js` - Reparar JSON

---

## ✅ Checklist para Nuevo Modelo Clínico

### Backend
- [ ] Función `compute_nuevo_modelo()` creada
- [ ] Registrada en `TEST_COMPUTERS`
- [ ] TestModule creado en BD
- [ ] Migración ejecutada (si aplica)
- [ ] Endpoint probado con Postman/curl

### Frontend
- [ ] Página creada en `/tests/[domain]/[code]/`
- [ ] Preguntas agregadas a `tests-questions.ts`
- [ ] Registrado en `test-domains.ts`
- [ ] Componente de visualización (si aplica)
- [ ] Pruebas de UI completadas

### Integración
- [ ] Flujo completo probado (crear → ejecutar → guardar → ver)
- [ ] Control de acceso verificado
- [ ] Límites de uso funcionando
- [ ] Vinculación con pacientes (terapeutas)
- [ ] IA integrada (si aplica)

### Documentación
- [ ] Documentado en este archivo
- [ ] Agregado a catálogo de tests
- [ ] Guía de uso creada

---

## 🎓 Conclusión

Esta plataforma está diseñada para ser **modular y extensible**. Para agregar un nuevo modelo clínico:

1. **Sigue el patrón existente** - Usa los tests actuales como referencia
2. **Reutiliza componentes** - `TestExecution`, `GenericTest`, etc.
3. **Respeta la estructura** - Backend calcula, Frontend muestra
4. **Integra con IA** - Usa los servicios existentes de Gemini
5. **Documenta todo** - Actualiza este archivo

**Archivos clave a revisar antes de implementar:**
- `backend/api/diagnostics.py` - Ejemplos de tests clínicos
- `backend/api/test_views.py` - Procesamiento genérico
- `tonyblanco-app/components/TestExecution.tsx` - Componente genérico
- `tonyblanco-app/lib/test-domains.ts` - Mapeo de tests

---

**Última actualización:** Diciembre 2024  
**Mantenedor:** Equipo de Desarrollo
