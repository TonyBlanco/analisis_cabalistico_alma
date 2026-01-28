# 🔮 Módulos de Análisis Cabalístico - Documentación Completa

Lista completa de todas las aplicaciones/módulos de análisis cabalístico disponibles en la plataforma, qué hace cada una y sus nombres.

---

## 📋 **Índice de Módulos**

### **Módulos Activos (Implementados)**
1. ✅ **Gematria** - Calculadora de Gematría
2. ✅ **Tarot Holístico** - Exploración Simbólica con Tarot (NO clínico)
3. ✅ **Numerología Completa** - Análisis Numerológico Cabalístico
4. ✅ **Astrología Cabalística** - Carta Astral con Perspectiva Cabalística

### **Módulos en Desarrollo (Placeholder)**
5. 🚧 **Mapa del Alma** - Análisis de Sefirot y Diseño Energético
6. 🚧 **Carta Astral Cabalística** (Dashboard) - Versión para Terapeutas
7. 🚧 **Análisis de Tikún** - Corrección del Alma y Misión de Vida

---

## 🔍 **Módulos Detallados**

### 1. **Gematria** 📜
- **Nombre Completo**: Calculadora Gematria
- **Ruta**: `/dashboard/tools/gematria`
- **Icono**: `Scroll` (📜)
- **Estado**: ✅ **Activo y Funcional**

#### **¿Qué hace?**
Calcula los valores numéricos de palabras o textos en hebreo usando diferentes sistemas de Gematría:

- **Ragil (Gematría Estándar)**: Valor numérico básico de cada letra hebrea
- **Katan (Gematría Pequeña)**: Suma reducida de los valores
- **Gadol (Gematría Grande)**: Usa valores finales de letras (Mem Sofit = 600, etc.)
- **Atbash**: Sistema de cifrado donde Alef (א) = Tav (ת), Bet (ב) = Shin (ש), etc.

#### **Funcionalidades:**
- ✅ Transliteración automática de español/inglés a hebreo
- ✅ Cálculo en tiempo real de los 4 sistemas
- ✅ Búsqueda de resonancias (palabras con el mismo valor)
- ✅ Diccionario de palabras hebreas con valores
- ✅ Interpretación con IA (Google Gemini)
- ✅ Guardado de análisis en ficha del usuario
- ✅ Guía educativa integrada

#### **Datos de Entrada:**
- Texto en hebreo o español/inglés (se translitera automáticamente)

#### **Datos de Salida:**
- Valores numéricos (Ragil, Katan, Gadol, Atbash)
- Palabras resonantes (mismo valor numérico)
- Interpretación cabalística generada por IA

#### **Uso en Backend:**
- Tipo de análisis: `'gematria'`
- Guardado en: `CabalisticAnalysis` model

---

### 2. **Tarot Holístico Evolutivo** 🎴
- **Nombre Completo**: Tarot Simbólico Holístico / Tarot del Alma (NO terapéutico)
- **Ruta**: `/dashboard/tools/tarot`
- **Icono**: `BookOpen` (📖)
- **Estado**: ✅ **Activo y Funcional**
- **Enfoque**: **Educativo y exploratorio** (NO clínico)

#### **¿Qué hace?**
Realiza una exploración simbólica holística entre el Arcano de Vida (calculado por fecha de nacimiento) y el estado actual del consultante:

1. **Calcula el Arcano de Vida**: Suma la fecha completa de nacimiento → Reduce a 1-22 → Muestra el Arcano Mayor correspondiente
2. **Lectura Simbólica**: Compara el arquetipo nativo con temas holísticos del consultante
3. **Análisis Evolutivo**: Identifica patrones simbólicos y oportunidades de crecimiento
4. **Orientación Holística**: Sugiere reflexiones basadas en el elemento complementario

#### **Funcionalidades:**
- ✅ Calculadora de Sendero Personal (fecha de nacimiento → Arcano)
- ✅ Visualizador Interactivo del Árbol de la Vida
- ✅ Muestra la carta del Tarot correspondiente al sendero
- ✅ Hover sobre senderos muestra información del Arcano
- ✅ **Integración Multi-Provider IA**:
  - **Groq AI** (prioritario): `llama-3.3-70b-versatile`
  - **Ollama** (local/Vercel): `llama3.2`
  - **Gemini** (fallback): `gemini-2.5-flash`
- ✅ Análisis IA holístico para:
  - Exploración Simbólica
  - Reflexiones Educativas
  - Mensaje Integrador
- ✅ Guardado de lecturas en ficha del consultante
- ✅ Disclaimer holístico educativo

#### **Datos de Entrada:**
- Fecha de nacimiento (YYYY-MM-DD)
- Contexto actual del consultante (opcional, para lectura contextual)

#### **Datos de Salida:**
- Número del Arcano de Vida (0-21)
- Nombre del Arcano
- Letra hebrea correspondiente
- Sendero en el Árbol de la Vida
- Significado simbólico holístico
- Exploración simbólica (si hay contexto)
- Reflexiones educativas
- Mensaje integrador
- **Provider usado** (Groq/Ollama/Gemini)

#### **Terminología:**
- **"Consultante"** (NO "paciente")
- **"Lectura simbólica"** (NO "diagnóstico")
- **"Exploración holística"** (NO "terapia")
- **"Reflexiones educativas"** (NO "tratamiento")

#### **Uso en Backend:**
- Tipo de análisis: `'tarot'`
- Endpoint: `/api/therapist/patients/<id>/tarot-analysis/`
- Guardado en: `CabalisticAnalysis` model

---

### 3. **Numerología Completa** 🔢
- **Nombre Completo**: Numerología Completa / Análisis Numerológico Cabalístico
- **Ruta**: `/tests/complete-numerology`
- **Icono**: `Hash` (#)
- **Estado**: ✅ **Activo y Funcional**

#### **¿Qué hace?**
Genera un análisis numerológico completo usando el método Dshevastan® y Coquatrix, integrado con el Árbol de la Vida:

1. **Números Principales**:
   - Número de Destino
   - Número del Alma
   - Número de Personalidad
   - Número de Madurez
   - Número de Realización
   - Número de Misión

2. **Inclusión de Base (Coquatrix)**:
   - Números dominantes (1-9)
   - Números ausentes (Karmas)
   - Gráfico de inclusión

3. **Correspondencias Cabalísticas**:
   - Mapeo a Sefirot
   - Mapeo a Senderos del Árbol de la Vida
   - Significados espirituales

4. **Razones Kármicas**:
   - Números ausentes y su significado
   - Lecciones a aprender

#### **Funcionalidades:**
- ✅ Cálculo completo de todos los números principales
- ✅ Inclusión de Base (método Coquatrix)
- ✅ Mapeo automático al Árbol de la Vida
- ✅ Visualización de Sefirot y Senderos
- ✅ Identificación de Karmas
- ✅ Reporte visual con tarjetas
- ✅ Modo terapeuta (fondo blanco) y modo personal (fondo místico)
- ✅ Validación de fecha de nacimiento
- ✅ Guía de interpretación modal
- ✅ Descarga de JSON
- ✅ Guardado de resultados

#### **Datos de Entrada:**
- Nombre completo
- Fecha de nacimiento (YYYY-MM-DD)

#### **Datos de Salida:**
- Objeto `NumerologyResult` con:
  - `numeros_principales`: Todos los números calculados
  - `inclusion_base`: Números dominantes y ausentes
  - `sefirot_info`: Correspondencias con Sefirot
  - `razones_karmicas`: Análisis de karmas
  - `familias`: Agrupación por familias numerológicas

#### **Uso en Backend:**
- Test module code: `'complete-numerology'`
- Guardado en: `TestResult` model
- También puede guardarse en: `CabalisticAnalysis` (tipo: `'numerology'`)

---

### 4. **Astrología Cabalística** ⭐
- **Nombre Completo**: Astrología Cabalística / Carta Astral Cabalística
- **Ruta**: `/tests/cabalistic-astrology`
- **Icono**: `Star` (⭐)
- **Estado**: ✅ **Activo y Funcional**

#### **¿Qué hace?**
Genera una carta astral completa interpretada desde la perspectiva cabalística:

1. **Cálculo Astrológico**:
   - Posiciones planetarias
   - Signos zodiacales
   - Casas astrológicas
   - Aspectos planetarios

2. **Integración Cabalística**:
   - Mapeo de planetas a Sefirot
   - Correspondencias zodiacales con Árbol de la Vida
   - Cálculo de los 72 Ángeles de Dios según carta natal
   - Interpretación espiritual de aspectos

3. **Análisis del Alma**:
   - Misión espiritual según carta
   - Desafíos kármicos
   - Dones y talentos

#### **Funcionalidades:**
- ✅ Cálculo preciso de posiciones planetarias (usando `astronomy-engine`)
- ✅ Visualización de carta astral
- ✅ Cálculo de 72 Ángeles según fecha/hora/lugar
- ✅ Interpretación cabalística de aspectos
- ✅ Mapeo planeta → Sefirá
- ✅ Análisis con IA para interpretación profunda
- ✅ Reporte visual completo

#### **Datos de Entrada:**
- Fecha de nacimiento
- Hora de nacimiento (opcional pero recomendado)
- Lugar de nacimiento (ciudad, país)

#### **Datos de Salida:**
- Carta astral completa
- Posiciones planetarias
- Ángeles calculados
- Interpretación cabalística
- Análisis del alma

#### **Uso en Backend:**
- Test module code: `'cabalistic-astrology'`
- También puede guardarse en: `CabalisticAnalysis` (tipo: `'astrology'`)

---

### 5. **Mapa del Alma** ✨
- **Nombre Completo**: Mapa del Alma
- **Ruta**: `/dashboard/tools/soul-map`
- **Icono**: `Sparkles` (✨)
- **Estado**: 🚧 **En Desarrollo (Placeholder)**

#### **¿Qué hace?**
Análisis profundo de las Sefirot y el diseño energético del usuario:

1. **Análisis de Sefirot**:
   - Estado de cada una de las 10 Sefirot
   - Bloqueos energéticos
   - Flujos de energía

2. **Diseño Energético**:
   - Patrones de activación
   - Desequilibrios
   - Fortalezas espirituales

3. **Senderos Activos**:
   - Senderos más transitados
   - Senderos bloqueados
   - Recomendaciones de trabajo

#### **Funcionalidades Planificadas:**
- 🚧 Visualización interactiva del Árbol de la Vida
- 🚧 Análisis de estado de cada Sefirá
- 🚧 Identificación de bloqueos
- 🚧 Recomendaciones terapéuticas
- 🚧 Integración con tests clínicos

#### **Datos de Entrada:**
- Nombre completo
- Fecha de nacimiento
- Tests clínicos (opcional)

#### **Datos de Salida:**
- Mapa completo de Sefirot
- Análisis de bloqueos
- Recomendaciones

#### **Uso en Backend:**
- Tipo de análisis: `'soul-map'`
- Guardado en: `CabalisticAnalysis` model

---

### 6. **Carta Astral Cabalística (Dashboard)** ⭐
- **Nombre Completo**: Carta Astral Cabalística
- **Ruta**: `/dashboard/tools/astrology`
- **Icono**: `Star` (⭐)
- **Estado**: 🚧 **En Desarrollo (Placeholder)**

#### **¿Qué hace?**
Versión para terapeutas del módulo de Astrología Cabalística, con funcionalidades adicionales:

- Integración con ficha del paciente
- Guardado de análisis
- Historial de análisis
- Reportes avanzados

#### **Funcionalidades Planificadas:**
- 🚧 Mismas funcionalidades que `/tests/cabalistic-astrology`
- 🚧 Integración con pacientes
- 🚧 Guardado automático
- 🚧 Historial

#### **Uso en Backend:**
- Tipo de análisis: `'astrology'`
- Guardado en: `CabalisticAnalysis` model

---

### 7. **Análisis de Tikún** 🔷
- **Nombre Completo**: Análisis de Tikún
- **Ruta**: `/dashboard/tools/tikun`
- **Icono**: `Hexagon` (🔷)
- **Estado**: 🚧 **En Desarrollo (Placeholder)**

#### **¿Qué hace?**
Identifica el Tikún (corrección) específico del alma del usuario:

1. **Tikún del Alma**:
   - Misión de vida específica
   - Corrección kármica a realizar
   - Desafíos espirituales

2. **Análisis de Reencarnación**:
   - Vidas pasadas relevantes
   - Patrones kármicos
   - Lecciones pendientes

3. **Prescripción Espiritual**:
   - Prácticas recomendadas
   - Trabajo interior específico
   - Meditaciones

#### **Funcionalidades Planificadas:**
- 🚧 Cálculo del Tikún según nombre y fecha
- 🚧 Análisis de patrones kármicos
- 🚧 Recomendaciones espirituales
- 🚧 Integración con otros análisis

#### **Datos de Entrada:**
- Nombre completo
- Fecha de nacimiento

#### **Datos de Salida:**
- Tikún identificado
- Misión de vida
- Recomendaciones

#### **Uso en Backend:**
- Tipo de análisis: `'tikun'`
- Guardado en: `CabalisticAnalysis` model

---

## 📊 **Resumen por Estado**

### ✅ **Módulos Activos (4)**
1. Gematria
2. Tarot Terapéutico
3. Numerología Completa
4. Astrología Cabalística

### 🚧 **Módulos en Desarrollo (3)**
5. Mapa del Alma
6. Carta Astral Cabalística (Dashboard)
7. Análisis de Tikún

---

## 🗂️ **Estructura en el Backend**

### **Modelo: `CabalisticAnalysis`**
```python
ANALYSIS_TYPE_CHOICES = [
    ('gematria', 'Gematria'),
    ('tarot', 'Tarot Terapéutico'),
    ('soul-map', 'Mapa del Alma'),
    ('astrology', 'Carta Astral Cabalística'),
    ('tikun', 'Análisis de Tikún'),
    ('numerology', 'Numerología Completa'),  # Agregado recientemente
]
```

### **Campos del Modelo:**
- `therapist`: Terapeuta que realizó el análisis
- `patient`: Usuario analizado
- `analysis_type`: Tipo de análisis (de las opciones arriba)
- `input_data`: JSON con datos de entrada
- `result_data`: JSON con resultados
- `summary`: Resumen textual
- `therapist_notes`: Notas del terapeuta
- `created_at`, `updated_at`: Timestamps

---

## 🔗 **Rutas y Accesos**

### **Dashboard del Terapeuta** (`/dashboard/therapist`)
- Sección: **"Alta Cábala"**
- Todos los módulos listados en el sidebar

### **Ficha del Usuario** (`/therapist/patients/[id]`)
- Sección: **"Herramientas de Alta Cábala"**
- Botones para ejecutar cada análisis
- Sección: **"Historial de Análisis Cabalísticos"**
- Lista de todos los análisis guardados

### **Rutas Individuales:**
- Gematria: `/dashboard/tools/gematria`
- Tarot: `/dashboard/tools/tarot`
- Mapa del Alma: `/dashboard/tools/soul-map`
- Astrología: `/dashboard/tools/astrology`
- Tikún: `/dashboard/tools/tikun`
- Numerología: `/tests/complete-numerology`
- Astrología (Test): `/tests/cabalistic-astrology`

---

## 🎯 **Casos de Uso**

### **Para Terapeutas:**
1. **Diagnóstico Cruzado**: Usar Tarot + Tests Clínicos
2. **Análisis Profundo**: Numerología Completa para entender patrones
3. **Gematría**: Analizar nombres, síntomas, palabras clave
4. **Astrología**: Carta natal con perspectiva cabalística
5. **Historial**: Seguimiento de análisis a lo largo del tiempo

### **Para Pacientes/Usuarios Personales:**
1. **Autoconocimiento**: Numerología Completa
2. **Exploración Espiritual**: Astrología Cabalística
3. **Meditación**: Gematría de palabras sagradas
4. **Guía**: Tarot del Alma para entender su sendero

---

## 📝 **Notas Técnicas**

1. **Integración con IA**: Todos los módulos activos usan Google Gemini para interpretaciones
2. **Guardado Automático**: Los análisis se guardan en `CabalisticAnalysis` cuando se ejecutan desde la ficha del paciente
3. **Modo Terapeuta vs Personal**: Algunos módulos tienen estilos diferentes según el contexto
4. **Validación**: Todos los módulos validan datos de entrada (fechas, nombres, etc.)
5. **Exportación**: Algunos módulos permiten descargar JSON de resultados

---

## 🚀 **Próximos Pasos**

1. Completar implementación de **Mapa del Alma**
2. Completar implementación de **Análisis de Tikún**
3. Unificar **Astrología Cabalística** (test y dashboard)
4. Agregar más integraciones entre módulos
5. Mejorar visualizaciones del Árbol de la Vida

