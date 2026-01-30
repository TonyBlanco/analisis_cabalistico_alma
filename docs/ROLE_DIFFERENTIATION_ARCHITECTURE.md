# Arquitectura de Roles Diferenciados - Tests Holísticos

**Fecha**: 30 de enero de 2026  
**Estado**: ACTIVO - Implementación en progreso

---

## 🎯 Visión General

La plataforma diferencia claramente entre dos tipos de usuarios al mostrar resultados de tests:

### 👤 Consultante (Paciente)
**Objetivo**: Comprensión personal y auto-reflexión  
**Características**:
- ✅ Visualizaciones ricas y coloridas (barras de progreso, íconos, colores según nivel)
- ✅ Lenguaje simbólico y holístico (Sefirot, arquetipos, energías)
- ✅ Recomendaciones prácticas y accesibles
- ✅ Información clara sin jerga técnica
- ❌ **SIN** acceso a JSON técnico
- ❌ **SIN** herramientas de diagnóstico clínico
- ❌ **SIN** interpretaciones AI profundas (solo sugerencias básicas)

### 👨‍⚕️ Terapeuta
**Objetivo**: Diagnóstico, análisis profundo y planificación terapéutica  
**Características**:
- ✅ Todas las visualizaciones del consultante
- ✅ **Acceso a datos técnicos** (JSON, payloads, debugging)
- ✅ **Interpretaciones AI avanzadas** (patrones, correlaciones, señales sutiles)
- ✅ **Herramientas de diagnóstico automático** (integración con DSM-5, ICD-11)
- ✅ **Análisis comparativo** (evolución temporal, benchmarks poblacionales)
- ✅ **Sugerencias de próximos pasos** (qué test aplicar siguiente, rutas terapéuticas)
- ✅ **Mapeo a terapias específicas** (EMDR, CBT, psicodelia, constelaciones familiares)

---

## 📊 Estado Actual de Implementación

### ✅ Completado

#### 1. SHA Harmony (sha_harmony) - **GOLD STANDARD**
**Consultante**:
- ✅ Índice de armonía (2.8 / 5.0) con color dinámico
- ✅ Barra de progreso 1.0-5.0 con marcadores
- ✅ 10 Sefirot con barras individuales y colores
- ✅ Recomendaciones con checkmarks
- ✅ Sin JSON técnico visible

**Terapeuta**:
- ✅ Todo lo anterior +
- ✅ JSON técnico colapsable "Solo Terapeuta"
- ✅ Workspace SHA con distribución sefirótica completa
- ⚠️ **PENDIENTE**: AI interpretations (conexiones entre Sefirot, patrones kármicos)
- ⚠️ **PENDIENTE**: Diagnóstico automático (mapeo a DSM-5)

#### 2. Ocultamiento de JSON
**Implementado en**: `ReadableResult.tsx`
- ✅ JSON solo visible si `isTherapist === true`
- ✅ Etiqueta: "Ver datos técnicos (JSON) - Solo Terapeuta"
- ✅ Aplicado a: SHA v1, SHA v2, MCMI-4, resultados generales

### ⚠️ En Progreso

#### MCMI-4 Signal (mcmi4-signal)
**Estado actual**:
- ✅ Signal básico capturado
- ⚠️ Visualización mínima (solo media/desv.est)
- ❌ Falta: Barras por escala clínica
- ❌ Falta: Gráfico de perfil MCMI
- ❌ Falta: Interpretación narrativa

**Objetivo consultante**:
- Gráfico de perfil circular (estilo mandala)
- Escalas representadas como pétalos con colores
- Lenguaje: "Tu perfil muestra fuerza en X, exploración recomendada en Y"

**Objetivo terapeuta**:
- Gráfico MCMI estándar con T-scores
- Flags automáticos (elevaciones, patrones especiales)
- AI: Sugerencia de diagnósticos DSM-5 probables
- Correlación con otras evaluaciones del paciente

### 📋 Pendiente de Mejora

| Test Code | Nombre | Estado Actual | Visualización Objetivo |
|-----------|--------|---------------|------------------------|
| `wellness` | Wellness Assessment | Básica | Rueda de bienestar con 8 dimensiones |
| `screening-general` | Screening General | Básica | Dashboard multi-escala con semáforos |
| `past-lives` | Past Lives | Básica | Timeline visual con vidas clave identificadas |
| `insomnia` | Insomnia Wellness | Básica | Gráfico de ciclo circadiano con patrones |
| `nutrition` | Nutrition Wellness | Básica | Plato holístico con balance nutricional |
| `stress` | Stress Wellness | Básica | Termómetro de estrés con zonas de color |
| `anxiety-state-trait` | Anxiety State-Trait | Básica | Comparación estado vs rasgo (dual chart) |
| `eat26-spirit` | EAT-26 Spirit | ⚠️ REVISAR | Cuerpo simbólico con chakras y alimentación |

---

## 🤖 Funcionalidades AI por Rol

### Consultante (AI Básica)
**Acceso**: Sugerencias generadas automáticamente  
**Implementado en**: `result_data.recommendations`

```json
{
  "recommendations": [
    "Medita sobre Keter para reconectar con tu propósito divino",
    "Trabaja con Chesed para cultivar la bondad y compasión",
    "Considera acompañamiento terapéutico para las Sefirot más bajas"
  ]
}
```

**Características**:
- Lenguaje esperanzador y empoderante
- Acciones concretas y realizables
- Sin jerga clínica

### Terapeuta (AI Avanzada) - **PENDIENTE**

#### 1. Análisis de Patrones
**Objetivo**: Identificar correlaciones no obvias entre tests  
**Ejemplo**:
```
"El paciente muestra elevación en Gevurah (SHA) + escala 8A del MCMI-4 (Negativista).
Esto sugiere patrón de auto-sabotaje y rigidez perfeccionista. 
Considerar terapia EMDR para procesar núcleo de autocrítica."
```

#### 2. Diagnóstico Automático Sugerido
**Objetivo**: Mapear resultados a códigos DSM-5/ICD-11  
**Ejemplo**:
```
Sugerencias diagnósticas preliminares (requiere validación clínica):
- F60.6 - Trastorno de personalidad por evitación (probabilidad 72%)
- F41.1 - Trastorno de ansiedad generalizada (probabilidad 65%)
- Z73.0 - Agotamiento (burnout) (probabilidad 58%)

Basado en: MCMI-4 escalas 2A, 2B, A + SHA (Hod bajo, Keter bajo)
```

#### 3. Ruta Terapéutica Recomendada
**Objetivo**: Sugerir próximos pasos terapéuticos  
**Implementado parcialmente en**: `therapist_next_exploration_suggestion`

**Ampliación necesaria**:
```json
{
  "current_world": "Mundo del Rigor (Gevurah)",
  "next_world": "Mundo de la Compasión (Chesed)",
  "suggested_tests": [
    { "code": "compassion-self", "name": "Autocompasión Radical", "priority": "high" },
    { "code": "inner-critic", "name": "Crítico Interno", "priority": "medium" }
  ],
  "therapeutic_modalities": [
    { "name": "Internal Family Systems (IFS)", "match_score": 0.89, "reason": "Alto crítico interno identificado" },
    { "name": "Compassion Focused Therapy", "match_score": 0.82, "reason": "Déficit en Chesed/autocompasión" }
  ],
  "ai_narrative": "El perfil sugiere un patrón de autocrítica severa con origen en Gevurah sin balance de Chesed..."
}
```

#### 4. Análisis Longitudinal
**Objetivo**: Seguimiento de evolución del paciente  
**Ejemplo**:
```
Evolución SHA Harmony (últimos 6 meses):
- Keter: 2 → 3 → 4 (mejora significativa en sentido de propósito)
- Gevurah: 5 → 4 → 3 (reducción de autocrítica, pero aún alta)
- Chesed: 1 → 2 → 2 (ligera mejora en autocompasión, requiere trabajo)

Interpretación AI: El paciente ha logrado reconectar con su propósito (Keter ↑) 
y reducir autocrítica (Gevurah ↓), pero la autocompasión (Chesed) sigue siendo 
el área de mayor oportunidad. Considerar intensificar trabajo con IFS o CFT.
```

---

## 🛠️ Implementación Técnica

### Frontend: Diferenciación de Vistas

**Props clave**:
```typescript
interface ReadableResultProps {
  resultData: any;
  isTherapist?: boolean;  // ← Clave para mostrar/ocultar
  executionMode?: string;
  therapistSuggestion?: { ... };
}
```

**Lógica de renderizado**:
```typescript
// Paciente ve visualización hermosa
<HarmonyIndexDisplay index={2.8} level="moderate" />
<SefirotBars scores={sefirot_scores} />
<Recommendations items={recommendations} />

// Solo terapeuta ve datos técnicos
{isTherapist && (
  <TechnicalDetails>
    <JSONViewer data={resultData} />
    <AIInterpretation suggestions={ai_analysis} />
    <DiagnosticMapping codes={suggested_diagnoses} />
  </TechnicalDetails>
)}
```

### Backend: AI Engine

**Endpoint propuesto**: `POST /api/ai/interpret-result/`

**Request**:
```json
{
  "result_id": 12345,
  "test_code": "sha_harmony",
  "depth": "therapist",  // "basic" | "therapist" | "expert"
  "include_diagnostics": true,
  "include_therapeutic_route": true
}
```

**Response**:
```json
{
  "interpretation": {
    "narrative": "El consultante muestra un patrón de...",
    "patterns_identified": [
      { "pattern": "auto_sabotaje", "confidence": 0.78, "sources": ["sha_harmony", "mcmi4"] }
    ],
    "suggested_diagnoses": [
      { "code": "F60.6", "name": "...", "probability": 0.72, "evidence": [...] }
    ],
    "therapeutic_modalities": [...],
    "next_steps": {
      "immediate": "Aplicar test de autocompasión",
      "short_term": "3 sesiones de IFS enfocadas en crítico interno",
      "long_term": "Integración de partes con EMDR"
    }
  },
  "safety_disclaimer": "Esta interpretación es asistida por IA y requiere validación clínica profesional."
}
```

---

## 📚 Checklist de Gold Standard

Para que un test alcance el nivel SHA Harmony:

### Consultante
- [ ] Visualización principal clara (índice/score con color)
- [ ] Barra de progreso visual
- [ ] Desglose por dimensiones (con íconos/barras)
- [ ] Recomendaciones prácticas (3-5 items con checkmarks)
- [ ] Lenguaje holístico y esperanzador
- [ ] SIN JSON técnico visible

### Terapeuta
- [ ] Todo lo anterior +
- [ ] JSON técnico colapsable (Solo Terapeuta)
- [ ] Workspace específico del test (si aplica)
- [ ] Interpretación AI narrativa
- [ ] Sugerencias diagnósticas (DSM-5/ICD-11)
- [ ] Ruta terapéutica recomendada
- [ ] Comparación con tests previos (evolución)
- [ ] Banderas automáticas (alertas clínicas)

---

## 🚀 Roadmap de Implementación

### Fase 1: Fundamentos (Actual)
- ✅ SHA Harmony como gold standard
- ✅ Ocultamiento de JSON para pacientes
- ✅ Diferenciación básica por rol (isTherapist prop)

### Fase 2: AI Terapéutica (Próxima)
**Prioridad**: ALTA  
**Tiempo estimado**: 2-3 semanas

- [ ] Endpoint `/api/ai/interpret-result/`
- [ ] Motor de interpretación con GPT-4 + RAG
- [ ] Base de conocimiento:
  - DSM-5 completo
  - ICD-11 completo
  - Modalidades terapéuticas (100+ terapias)
  - Protocolos por diagnóstico
- [ ] Integración en `ReadableResult` para terapeutas
- [ ] Testing con casos reales anonimizados

### Fase 3: Visualizaciones Avanzadas
**Prioridad**: MEDIA  
**Tiempo estimado**: 4-6 semanas

- [ ] MCMI-4: Gráfico de perfil circular
- [ ] Wellness: Rueda de bienestar
- [ ] Screening General: Dashboard multi-escala
- [ ] Past Lives: Timeline visual
- [ ] Cada test con visualización única y memorable

### Fase 4: Análisis Longitudinal
**Prioridad**: MEDIA  
**Tiempo estimado**: 3-4 semanas

- [ ] Base de datos de evolución temporal
- [ ] Gráficos de tendencias por test
- [ ] Comparaciones pre/post intervención
- [ ] Reportes de progreso automatizados

---

## 🔒 Consideraciones de Seguridad

### Límites Éticos de AI
1. **Nunca** generar diagnósticos definitivos (solo "sugerencias preliminares")
2. **Siempre** incluir disclaimer: "Requiere validación clínica profesional"
3. **Evitar** lenguaje alarmista o catastrofista
4. **Priorizar** interpretaciones que empoderan al paciente
5. **Transparencia**: Indicar que es asistencia AI, no juicio humano

### Control de Acceso
- **Pacientes**: NO acceso a AI interpretations, solo recomendaciones básicas
- **Terapeutas**: Acceso completo pero con responsabilidad profesional
- **Admin**: Logs de todas las interpretaciones AI generadas

### Privacidad de Datos
- Interpretaciones AI se guardan cifradas
- Nunca se envía información identificable a APIs externas
- Anonimización de datos para entrenamiento de modelos

---

## 📖 Referencias

- **DSM-5**: Diagnostic and Statistical Manual of Mental Disorders, 5th Edition
- **ICD-11**: International Classification of Diseases, 11th Revision
- **MCMI-4**: Millon Clinical Multiaxial Inventory, 4th Edition
- **Kabbalah**: Árbol de la Vida, 10 Sefirot
- **IFS**: Internal Family Systems (Richard Schwartz)
- **CFT**: Compassion Focused Therapy (Paul Gilbert)
- **EMDR**: Eye Movement Desensitization and Reprocessing

---

## 👥 Responsables

**Arquitectura de roles**: Luis Antonio Blanco Fontela  
**AI Engine**: Pendiente de asignación  
**Visualizaciones**: Pendiente de asignación  
**Testing clínico**: Requiere colaboración con terapeutas certificados

---

**Última actualización**: 2026-01-30  
**Estado**: Documento vivo - se actualiza con cada iteración
