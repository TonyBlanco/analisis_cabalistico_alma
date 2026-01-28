# 🗄️ Estructura de Base de Datos y Funciones de Cross-Over

Documentación completa de la estructura de la base de datos, archivos que la utilizan y cómo se cruzan los datos entre diferentes módulos.

---

## 📊 **ESTRUCTURA DE LA BASE DE DATOS**

### **Modelos Principales**

#### 1. **User (Django Auth)**
- **Tabla**: `auth_user`
- **Descripción**: Usuario base del sistema Django
- **Campos Clave**:
  - `id`, `username`, `email`, `password`, `is_staff`, `is_superuser`

#### 2. **UserProfile** 
- **Tabla**: `api_userprofile`
- **Relación**: `OneToOne` con `User` (`related_name='profile'`)
- **Descripción**: Perfil extendido del usuario

**Campos Principales:**
```python
- user (OneToOne → User)
- user_type: 'personal' | 'therapist' | 'patient' | 'visitor'
- full_name: Nombre para cálculos cabalísticos
- birth_date: Fecha de nacimiento
- is_admin: Boolean
- subscription_status: 'trial' | 'active' | 'canceled' | 'expired'
- subscription_plan: 'personal' | 'professional' | 'premium'
- max_patients: Límite de consultantes (terapeutas)
- current_patients_count: Contador actual
```

**Archivos que lo Usan:**
- `backend/api/models.py` (definición)
- `backend/api/views.py` (autenticación, perfil)
- `backend/api/admin.py` (admin)
- `tonyblanco-app/lib/auth.ts` (frontend)

---

#### 3. **Patient**
- **Tabla**: `api_patient`
- **Relación**: `ForeignKey` a `User` (therapist) + `ForeignKey` opcional a `User` (user)
- **Descripción**: Consultante de un profesional - Ficha holística integral

**Campos Principales:**
```python
- therapist (ForeignKey → User, related_name='patients')
- user (ForeignKey → User, null=True, related_name='patient_profile')
- first_name, last_name, full_name
- email, phone, avatar
- birth_date, birth_time, birth_place
- hebrew_name
- main_complaint, clinical_history
- treatment_plan (JSONField)
- therapy_level: 'assiyah' | 'yetzirah' | 'beriah'
- is_active: Boolean
```

**Relaciones:**
- `patient.test_results` → TestResult (tests holísticos)
- `patient.cabalistic_analyses` → CabalisticAnalysis (análisis cabalísticos)
- `patient.sessions` → Session (sesiones terapéuticas)
- `patient.therapist_notes` → TherapistNote

**Archivos que lo Usan:**
- `backend/api/models.py` (definición)
- `backend/api/views.py` (CRUD consultantes)
- `backend/api/cabalistic_views.py` (análisis cabalísticos)
- `backend/api/utils/tarot_service.py` (análisis de Tarot)
- `backend/api/utils/holistic_ai.py` (reportes holísticos)
- `tonyblanco-app/app/therapist/patients/[id]/page.tsx` (ficha del consultante)

---

#### 4. **TestResult**
- **Tabla**: `api_testresult`
- **Relación**: `ForeignKey` a `User` + `ForeignKey` opcional a `Patient`
- **Descripción**: Resultados de tests psicométricos y análisis

**Campos Principales:**
```python
- user (ForeignKey → User, related_name='test_results')
- test_module (ForeignKey → TestModule, null=True)
- test_id: String (ej: 'phq-9', 'gad-7', 'complete-numerology')
- patient (ForeignKey → Patient, null=True, related_name='test_results')
- input_data (JSONField)
- result_data (JSONField)
- client_name, client_birth_date
- score: Integer (puntaje del test)
- clinical_diagnosis: String (ej: 'Ansiedad Severa')
- kabbalah_sefira: String (ej: 'Netzach', 'Malchut')
- angel_remedy: String (ej: 'Caliel', 'Veuliah')
- details (JSONField)
```

**Relaciones:**
- `test_results` → User (quien ejecutó el test)
- `test_results` → Patient (si fue ejecutado para un usuario)
- `test_results` → TestModule (módulo del test)

**Archivos que lo Usan:**
- `backend/api/test_models.py` (definición)
- `backend/api/test_views.py` (ejecución de tests)
- `backend/api/utils/tarot_service.py` (cruce con Tarot)
- `backend/api/utils/holistic_ai.py` (reportes holísticos)
- `tonyblanco-app/lib/test-api.ts` (frontend)
- `tonyblanco-app/app/tests/results/[id]/page.tsx` (visualización)

---

#### 5. **CabalisticAnalysis**
- **Tabla**: `api_cabalisticanalysis`
- **Relación**: `ForeignKey` a `Patient` + `ForeignKey` a `User` (therapist)
- **Descripción**: Análisis de Alta Cábala (Gematria, Tarot, Mapa del Alma, etc.)

**Campos Principales:**
```python
- patient (ForeignKey → Patient, related_name='cabalistic_analyses')
- therapist (ForeignKey → User, related_name='cabalistic_analyses')
- analysis_type: 'gematria' | 'tarot' | 'soul-map' | 'astrology' | 'tikun'
- input_data (JSONField): Datos de entrada
- result_data (JSONField): Resultados completos
- summary: Text (resumen breve)
- therapist_notes: Text
```

**Relaciones:**
- `cabalistic_analyses` → Patient (usuario analizado)
- `cabalistic_analyses` → User (terapeuta que ejecutó)

**Archivos que lo Usan:**
- `backend/api/models.py` (definición)
- `backend/api/cabalistic_views.py` (CRUD análisis)
- `backend/api/tarot_views.py` (análisis de Tarot)
- `backend/api/utils/tarot_service.py` (generación de Tarot)
- `tonyblanco-app/app/therapist/patients/[id]/page.tsx` (visualización)

---

#### 6. **TestModule**
- **Tabla**: `api_testmodule`
- **Descripción**: Módulos de tests disponibles

**Campos Principales:**
```python
- code: String (ej: 'complete-numerology', 'phq-9')
- name: String
- test_type: 'basic' | 'numerology' | 'diagnostic' | etc.
- required_access_level: 'free' | 'personal' | 'professional' | 'premium'
- requires_license: Boolean
- is_active: Boolean
```

**Relaciones:**
- `test_modules` → TestResult (resultados)
- `test_modules` → UserTestAccess (accesos)

**Archivos que lo Usan:**
- `backend/api/test_models.py` (definición)
- `backend/api/test_views.py` (ejecución)
- `backend/api/initialize_tests.py` (inicialización)

---

#### 7. **Ficha** (Legacy)
- **Tabla**: `api_ficha`
- **Descripción**: Fichas numerológicas (sistema legacy)

**Campos Principales:**
```python
- usuario (ForeignKey → User, related_name='fichas')
- nombre, fecha_nacimiento
- sistema: String
- resultado (JSONField)
- is_patient: Boolean
- patient_of (ForeignKey → User, null=True)
```

**Archivos que lo Usan:**
- `backend/api/models.py` (definición)
- `backend/api/views.py` (CRUD fichas)

---

#### 8. **Session**
- **Tabla**: `api_session`
- **Descripción**: Sesiones terapéuticas

**Campos Principales:**
```python
- therapist (ForeignKey → User)
- patient (ForeignKey → Patient, related_name='sessions')
- session_date: DateTime
- session_type: 'initial' | 'followup' | 'consultation' | 'closure'
- notes, private_notes: Text
- related_fichas (ManyToMany → Ficha)
```

**Archivos que lo Usan:**
- `backend/api/models.py` (definición)

---

## 🔗 **RELACIONES ENTRE MODELOS (Diagrama)**

```
User (Django Auth)
  ├── UserProfile (OneToOne)
  │   └── user_type: 'therapist' | 'personal'
  │
  ├── Patient (ForeignKey: therapist)
  │   ├── TestResult (ForeignKey: patient)
  │   ├── CabalisticAnalysis (ForeignKey: patient)
  │   ├── Session (ForeignKey: patient)
  │   └── TherapistNote (ForeignKey: patient)
  │
  ├── TestResult (ForeignKey: user)
  │   └── TestModule (ForeignKey: test_module)
  │
  ├── Ficha (ForeignKey: usuario)
  └── Session (ForeignKey: therapist)
```

---

## 🔄 **FUNCIONES DE CROSS-OVER (Cruce de Datos)**

### **1. Tarot Holístico Evolutivo (Exploración Simbólica)** 🎴

**Función**: Cruza el Arcano de Vida (calculado por fecha de nacimiento) con contexto actual del consultante para exploración simbólica educativa (NO terapéutica).

**Archivo**: `backend/api/utils/tarot_service.py` (legacy - en migración a multi-provider)

**Servicio Multi-Provider**: `backend/api/astrology_ai_service.py` (Groq → Ollama → Gemini)

**Función Principal**: `analyze_archetype_holistic(consultant, birth_date)` (NO "analyze_archetype_vs_clinical")

**Proceso de Exploración Simbólica:**
```python
1. Calcula Arcano de Vida:
   - Toma birth_date del Consultant (NO "Patient")
   - Suma todos los dígitos: day + month + year
   - Reduce a 1-22 → Arcano (0-21)

2. Recopila Contexto Holístico (opcional):
   - Contexto actual del consultante
   - Temas de interés o exploración
   - NO usar terminología clínica ("síntomas", "diagnóstico")

3. Genera Análisis Holístico con Multi-Provider IA:
   - HolisticAI() desde astrology_ai_service.py
   - Auto-selección: Groq (prioritario) → Ollama → Gemini
   - Input: Arcano + Contexto Holístico
   - Output: 
     * exploracion_simbolica (patrones arquetípicos)
     * reflexiones_educativas (insights no clínicos)
     * mensaje_integrador (síntesis)
     * provider_used (groq/ollama/gemini)
     * holistic_disclaimer

4. Guarda en CabalisticAnalysis:
   - analysis_type: 'tarot'
   - input_data: { birth_date, consultant_name }
   - result_data: { arcana, contexto, análisis, reflexiones, provider }
```

**Terminología Correcta:**
- "Consultante" (NO "paciente")
- "Lectura simbólica" (NO "diagnóstico")
- "Exploración holística" (NO "terapia")
- "Reflexiones educativas" (NO "tratamiento" o "prescripciones")

**Archivos Relacionados:**
- `backend/api/utils/tarot_service.py` (legacy - en proceso de migración)
- `backend/api/astrology_ai_service.py` (multi-provider Groq/Ollama/Gemini - ACTUAL)
- `backend/api/tarot_holistic_views.py` (nuevo - API endpoints holísticos)
- `backend/swm/tarot/` (SWM v3 - arquitectura workspace)
- `backend/api/cabalistic_views.py` (guardado)
- `tonyblanco-app/app/therapist/patients/[id]/page.tsx` (visualización)

---

### **2. Reporte Holístico con IA** 🧠

**Función**: Cruza todos los datos del consultante (tests, análisis cabalísticos, historial) para generar un reporte completo.

**Archivo**: `backend/api/utils/holistic_ai.py`

**Función Principal**: `generate_holistic_report(patient_data, test_results, cabalistic_analyses)`

**Proceso de Cross-Over:**
```python
1. Recopila Datos del Consultante:
   - Patient: name, birth_date, main_complaint, clinical_history
   - TestResult: Todos los tests del consultante
   - CabalisticAnalysis: Todos los análisis cabalísticos

2. Organiza por Categorías:
   - Tests Holísticos (PHQ-9, GAD-7, etc.)
   - Análisis Cabalísticos (Gematria, Tarot, etc.)
   - Historial Holístico

3. Genera Reporte con IA (Gemini):
   - Analiza correlaciones entre:
     * Síntomas holísticos ↔ Sefirot
     * Tests ↔ Análisis Cabalísticos
     * Patrones temporales
   - Genera recomendaciones integradas

4. Retorna Reporte Completo:
   - Análisis integrado
   - Correlaciones identificadas
   - Recomendaciones holísticas
```

**Archivos Relacionados:**
- `backend/api/utils/holistic_ai.py` (lógica)
- `backend/api/views.py` (endpoint `/api/therapist/patients/<id>/holistic-report/`)
- `tonyblanco-app/app/therapist/patients/[id]/page.tsx` (botón "Generar Reporte IA")

---

### **3. Correlación Tests ↔ Sefirot** ⚡

**Función**: Mapea resultados de tests holísticos a Sefirot del Árbol de la Vida.

**Archivo**: `backend/api/utils/clinical_scorer.py` y `backend/cabala_py/soul_analytics.py`

**Proceso de Cross-Over:**
```python
1. Calcula Score Holístico:
   - TestResult.score → Severidad
   - TestResult.clinical_diagnosis → Diagnóstico

2. Mapea a Sefirá:
   - clinical_scorer.py: test_id → sefira
   - Ejemplos:
     * PHQ-9 (Depresión) → Malchut
     * GAD-7 (Ansiedad) → Netzach
     * PTSD → Gevurah

3. Identifica Ángel Remedio:
   - soul_analytics.py: sefira → ángel
   - Guarda en TestResult.angel_remedy

4. Guarda en TestResult:
   - kabbalah_sefira: String
   - angel_remedy: String
```

**Archivos Relacionados:**
- `backend/api/utils/clinical_scorer.py` (mapeo test → sefira)
- `backend/cabala_py/soul_analytics.py` (análisis de alma)
- `backend/api/test_views.py` (guardado en TestResult)

---

### **4. Numerología Completa ↔ Árbol de la Vida** 🌳

**Función**: Mapea números numerológicos a Sefirot y Senderos.

**Archivo**: `backend/cabala_py/integracion_arbol.py`

**Proceso de Cross-Over:**
```python
1. Calcula Números Principales:
   - Esencia, Expresión, Herencia, Destino
   - Usando: calcular_valores_nombre() + calcular_camino_destino()

2. Mapea a Árbol de la Vida:
   - mapear_a_arbol_vida(numero):
     * Si numero <= 10 → Sefirá
     * Si numero > 10 → Sendero (11-32)
   - obtener_sefira_por_numero()
   - obtener_sendero_por_numero()

3. Genera Análisis Cabalístico:
   - generar_analisis_cabalista()
   - generar_recomendaciones()
   - generar_temas_clave()

4. Guarda en TestResult:
   - test_id: 'complete-numerology'
   - result_data: Mapa completo con correspondencias
```

**Archivos Relacionados:**
- `backend/cabala_py/integracion_arbol.py` (mapeo)
- `backend/cabala_py/arbol_vida.py` (datos del Árbol)
- `backend/api/test_views.py` (ejecución)
- `tonyblanco-app/components/CabalisticReport.tsx` (visualización)

---

### **5. Gematría ↔ Diccionario Hebreo** 📜

**Función**: Cruza valores de Gematría con palabras hebreas del diccionario.

**Archivo**: `tonyblanco-app/lib/gematria-engine.ts` + `tonyblanco-app/data/gematria-dictionary.ts`

**Proceso de Cross-Over:**
```python
1. Calcula Valores:
   - Ragil, Katan, Gadol, Atbash

2. Busca Resonancias:
   - findWordsByValue(valor) → Palabras con mismo valor
   - searchWords(query) → Búsqueda en diccionario

3. Filtra por Categorías:
   - nombres_divinos
   - conceptos_misticos
   - emociones
   - sefirot

4. Muestra Correspondencias:
   - Palabras resonantes
   - Significados
   - Categorías
```

**Archivos Relacionados:**
- `tonyblanco-app/lib/gematria-engine.ts` (cálculos)
- `tonyblanco-app/data/gematria-dictionary.ts` (diccionario)
- `tonyblanco-app/data/hebrew_database_master.json` (base de datos)
- `tonyblanco-app/app/dashboard/tools/gematria/page.tsx` (interfaz)

---

## 📁 **ARCHIVOS QUE USAN LA BASE DE DATOS**

### **Backend (Django)**

#### **Modelos:**
- `backend/api/models.py` - UserProfile, Patient, Ficha, Session, CabalisticAnalysis
- `backend/api/test_models.py` - TestModule, TestResult, UserTestAccess

#### **Vistas/APIs:**
- `backend/api/views.py` - CRUD usuarios, consultantes, fichas
- `backend/api/test_views.py` - Ejecución y guardado de tests
- `backend/api/cabalistic_views.py` - CRUD análisis cabalísticos
- `backend/api/tarot_views.py` - Análisis de Tarot
- `backend/api/admin_views.py` - Administración

#### **Servicios/Utilidades:**
- `backend/api/utils/tarot_service.py` - **Cross-over Tarot ↔ Tests**
- `backend/api/utils/holistic_ai.py` - **Cross-over Reportes Holísticos**
- `backend/api/utils/clinical_scorer.py` - **Cross-over Tests ↔ Sefirot**
- `backend/cabala_py/soul_analytics.py` - Análisis de alma
- `backend/cabala_py/integracion_arbol.py` - **Cross-over Numerología ↔ Árbol**

#### **Serializadores:**
- `backend/api/serializers.py` - Serialización de modelos
- `backend/api/test_serializers.py` - Serialización de tests

#### **Admin:**
- `backend/api/admin.py` - Interfaz de administración

---

### **Frontend (Next.js/TypeScript)**

#### **Páginas:**
- `tonyblanco-app/app/therapist/patients/[id]/page.tsx` - **Ficha del consultante (principal cross-over)**
- `tonyblanco-app/app/tests/results/[id]/page.tsx` - Visualización de resultados
- `tonyblanco-app/app/dashboard/tools/gematria/page.tsx` - Calculadora Gematría
- `tonyblanco-app/app/dashboard/tools/tarot/page.tsx` - Tarot Terapéutico

#### **Librerías/Utilidades:**
- `tonyblanco-app/lib/test-api.ts` - API de tests
- `tonyblanco-app/lib/gematria-engine.ts` - **Cross-over Gematría ↔ Diccionario**
- `tonyblanco-app/lib/patient-storage.ts` - Almacenamiento local

#### **Componentes:**
- `tonyblanco-app/components/CabalisticReport.tsx` - Reporte numerológico
- `tonyblanco-app/components/CabalisticAstrologyReport.tsx` - Reporte astrológico

---

## 🔍 **QUERIES PRINCIPALES DE CROSS-OVER**

### **1. Obtener Tests Holísticos de un Consultante:**
```python
# backend/api/utils/tarot_service.py
test_results = TestResult.objects.filter(
    patient=patient
).order_by('-created_at')

# Si no hay, buscar por usuario
if not test_results.exists() and patient.user:
    test_results = TestResult.objects.filter(
        user=patient.user
    ).order_by('-created_at')
```

### **2. Obtener Análisis Cabalísticos de un Consultante:**
```python
# backend/api/cabalistic_views.py
analyses = CabalisticAnalysis.objects.filter(
    patient=patient
).order_by('-created_at')

# Filtrar por tipo
if analysis_type:
    analyses = analyses.filter(analysis_type=analysis_type)
```

### **3. Obtener Todos los Datos para Reporte Holístico:**
```python
# backend/api/utils/holistic_ai.py
patient_data = {
    'full_name': patient.full_name,
    'birth_date': patient.birth_date,
    'main_complaint': patient.main_complaint,
    'clinical_history': patient.clinical_history,
    'therapy_level': patient.therapy_level
}

test_results = TestResult.objects.filter(
    patient=patient
).order_by('-created_at')

cabalistic_analyses = CabalisticAnalysis.objects.filter(
    patient=patient
).order_by('-created_at')
```

### **4. Buscar Consultante por Profesional:**
```python
# backend/api/views.py
patients = Patient.objects.filter(
    therapist=request.user,
    is_active=True
).order_by('-created_at')
```

---

## 📊 **ÍNDICES Y OPTIMIZACIONES**

### **Índices Definidos:**

```python
# TestResult
indexes = [
    Index(fields=['test_id', 'created_at']),
    Index(fields=['user', 'created_at']),
    Index(fields=['patient', 'created_at']),
]

# CabalisticAnalysis
indexes = [
    Index(fields=['patient', 'analysis_type', '-created_at']),
    Index(fields=['therapist', '-created_at']),
]

# Patient
unique_together = [
    ['therapist', 'email'],
    ['therapist', 'user']
]
```

---

## 🎯 **CASOS DE USO DE CROSS-OVER**

### **Caso 1: Profesional ve Ficha del Consultante**
```
1. GET /api/therapist/patients/<id>/
   → Patient + TestResult + CabalisticAnalysis

2. Frontend muestra:
   - Datos personales (Patient)
   - Tests holísticos (TestResult)
   - Análisis cabalísticos (CabalisticAnalysis)
   - Correlaciones visuales
```

### **Caso 2: Generar Análisis de Tarot Cruzado**
```
1. POST /api/therapist/patients/<id>/tarot-analysis/generate-and-save/
   → tarot_service.analyze_archetype_vs_clinical()
   
2. Proceso:
   - Calcula Arcano (birth_date)
   - Busca TestResult más reciente
   - Genera análisis con IA
   - Guarda en CabalisticAnalysis
```

### **Caso 3: Generar Reporte Holístico**
```
1. POST /api/therapist/patients/<id>/holistic-report/
   → holistic_ai.generate_holistic_report()
   
2. Proceso:
   - Recopila Patient + TestResult + CabalisticAnalysis
   - Analiza correlaciones
   - Genera reporte con IA
   - Retorna JSON completo
```

---

## 🔐 **PERMISOS Y SEGURIDAD**

### **Validaciones de Acceso:**

```python
# Solo el profesional puede ver sus consultantes
patient = get_object_or_404(
    Patient.objects.filter(therapist=request.user),
    id=id
)

# Solo el profesional puede crear análisis para sus consultantes
analysis = CabalisticAnalysis.objects.create(
    patient=patient,  # Ya validado que es del terapeuta
    therapist=request.user
)
```

---

## 📝 **NOTAS IMPORTANTES**

1. **Patient.user** es opcional: Un paciente puede tener cuenta de login o no
2. **TestResult.patient** es opcional: Los tests pueden ser personales o para pacientes
3. **CabalisticAnalysis** siempre requiere Patient: Solo se crea desde ficha del paciente
4. **Cross-over principal**: Tarot ↔ Tests Holísticos (en `tarot_service.py`)
5. **Reportes holísticos**: Cruzan todos los datos (en `holistic_ai.py`)

---

## 🚀 **MEJORAS FUTURAS**

1. **Tabla de Correlaciones**: Guardar correlaciones calculadas
2. **Historial de Cross-Overs**: Trackear cuándo se cruzaron datos
3. **Caché de Análisis**: Cachear análisis de IA para evitar recálculos
4. **Webhooks**: Notificar cuando hay nuevos datos para cruzar
5. **Análisis Predictivo**: Predecir correlaciones futuras

