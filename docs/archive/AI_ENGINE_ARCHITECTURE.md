# ARQ > AI Engine Terapéutica - Arquitectura Completa

**Fecha**: 30 de enero de 2026  
**Fase**: 2 - AI Engine  
**Status**: DISEÑO ARQUITECTÓNICO

---

## 🎯 Objetivo

Construir un motor de IA que proporcione a los terapeutas:
1. **Interpretaciones narrativas profundas** de resultados de tests
2. **Sugerencias diagnósticas automáticas** (DSM-5, ICD-11)
3. **Rutas terapéuticas personalizadas** (modalidades, protocolos, próximos pasos)
4. **Análisis de patrones** cross-test y longitudinales
5. **Integración con MSHE** para síntesis holística

---

## 🏛️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ReadableResult Component                                 │  │
│  │  - Shows patient visualizations                          │  │
│  │  - {isTherapist && <AIInterpretationPanel />}           │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              │ GET /api/ai/interpret-result/
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND - AI Engine                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  InterpretResultView (DRF APIView)                       │  │
│  │  - Auth: IsTherapist only                                │  │
│  │  - Input: result_id, depth, options                     │  │
│  │  - Output: AIInterpretation object                       │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │                                              │
│                   ▼                                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AI Orchestrator                                          │  │
│  │  - Routes to appropriate interpreters                    │  │
│  │  - Combines multiple sources                             │  │
│  │  - Caches results                                        │  │
│  └────┬────┬────┬────┬────┬────────────────────────────────┘  │
│       │    │    │    │    │                                     │
│       ▼    ▼    ▼    ▼    ▼                                     │
│  ┌────┴────┴────┴────┴────┴───────────────────────────────┐  │
│  │  Specialized Interpreters                              │  │
│  │  - SHA Harmony Interpreter                              │  │
│  │  - MCMI-4 Interpreter                                   │  │
│  │  - Wellness Interpreter                                 │  │
│  │  - Past Lives Interpreter                               │  │
│  │  - Cross-Test Pattern Analyzer                          │  │
│  └────┬────┬────┬────┬────┬───────────────────────────────┘  │
│       │    │    │    │    │                                     │
│       ▼    ▼    ▼    ▼    ▼                                     │
│  ┌────┴────┴────┴────┴────┴───────────────────────────────┐  │
│  │  Knowledge Bases (RAG)                                  │  │
│  │  - DSM-5 completo (embeddings + retrieval)              │  │
│  │  - ICD-11 completo                                      │  │
│  │  - Therapeutic modalities (100+ terapias)               │  │
│  │  - Treatment protocols                                  │  │
│  │  - Research papers index                                │  │
│  └────┬────┬────┬────┬────┬───────────────────────────────┘  │
│       │    │    │    │    │                                     │
│       ▼    ▼    ▼    ▼    ▼                                     │
│  ┌────┴────┴────┴────┴────┴───────────────────────────────┐  │
│  │  LLM Layer (GPT-4 + Prompt Engineering)                │  │
│  │  - GPT-4-turbo for narrative generation                │  │
│  │  - Structured outputs for diagnostics                   │  │
│  │  - Function calling for KB retrieval                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Componentes Principales

### 1. InterpretResultView (Backend Endpoint)

**Ruta**: `POST /api/ai/interpret-result/`

**Request**:
```json
{
  "result_id": 12345,
  "test_code": "sha_harmony",
  "depth": "therapist",  // "basic" | "therapist" | "expert"
  "options": {
    "include_diagnostics": true,
    "include_therapeutic_route": true,
    "include_cross_test_patterns": true,
    "language": "es"
  }
}
```

**Response**:
```json
{
  "interpretation_id": "ai_interp_abc123",
  "result_id": 12345,
  "test_code": "sha_harmony",
  "generated_at": "2026-01-30T14:30:00Z",
  "depth": "therapist",
  
  "narrative": {
    "summary": "El consultante presenta un patrón de desconexión entre propósito divino (Keter) y manifestación material (Malkuth)...",
    "key_insights": [
      "Keter alto en Atzilut (4.5/5) pero bajo en Assiah (1.8/5) sugiere ideación sin acción",
      "Gevurah dominante (4.8/5) indica autocrítica severa, posible perfeccionismo paralizante",
      "Chesed bajo (1.9/5) revela déficit de autocompasión, correlacionado con shame loops"
    ],
    "clinical_concerns": [
      "Riesgo de agotamiento por auto-exigencia sin balance de autocuidado",
      "Patrón de sabotaje relacionado con miedo al fracaso"
    ]
  },
  
  "suggested_diagnoses": [
    {
      "code": "F60.5",
      "system": "ICD-11",
      "name": "Obsessive-compulsive personality disorder",
      "probability": 0.72,
      "confidence": "medium-high",
      "evidence": [
        "Gevurah dominante + Chesed bajo = perfeccionismo rígido",
        "Keter-Malkuth gap = ideales inalcanzables vs realidad",
        "Correlación con MCMI-4 escala 7 (Compulsive) si disponible"
      ],
      "differential_diagnoses": [
        {"code": "F41.1", "name": "Generalized anxiety disorder", "notes": "Considerar si hay rumiación excesiva"}
      ]
    }
  ],
  
  "therapeutic_route": {
    "immediate_focus": {
      "primary_intervention": "Compassion Focused Therapy (CFT)",
      "rationale": "Déficit severo en Chesed (autocompasión) es prioridad #1. CFT trabaja directamente con shame y autocrítica",
      "protocol": "Gilbert's 12-week CFT protocol adapted for Kabbalistic framework",
      "expected_outcome": "Increase Chesed from 1.9 to 3.5+ within 3 months"
    },
    
    "complementary_modalities": [
      {
        "name": "Internal Family Systems (IFS)",
        "match_score": 0.89,
        "rationale": "Gevurah dominante sugiere 'inner critic' parte fuerte. IFS ideal para trabajar con partes",
        "timing": "Parallel to CFT, start week 2"
      },
      {
        "name": "Somatic Experiencing",
        "match_score": 0.76,
        "rationale": "Gap Keter-Malkuth indica desconexión mente-cuerpo. SE reconecta con sensaciones",
        "timing": "Month 2-3, once emotional regulation improves"
      }
    ],
    
    "next_assessments": [
      {
        "test_code": "compassion-self",
        "test_name": "Escala de Autocompasión de Neff",
        "priority": "high",
        "timing": "Baseline + every 4 weeks",
        "rationale": "Medir progreso en Chesed cuantitativamente"
      },
      {
        "test_code": "inner-critic",
        "test_name": "Inventario del Crítico Interno",
        "priority": "medium",
        "timing": "Week 2",
        "rationale": "Mapear estructura del inner critic antes de IFS"
      }
    ],
    
    "contraindications": [
      "Avoid CBT as primary modality - may reinforce Gevurah rigidity",
      "Caution with achievement-oriented therapies (e.g., goal-setting coaching)"
    ]
  },
  
  "cross_test_patterns": [
    {
      "pattern_name": "Perfectionism-Shame Loop",
      "confidence": 0.84,
      "sources": [
        {"test": "sha_harmony", "evidence": "Gevurah 4.8, Chesed 1.9"},
        {"test": "mcmi4", "evidence": "Scale 7 (Compulsive) elevated, Scale 8A (Negativistic) moderate"}
      ],
      "clinical_significance": "High - drives both anxiety and depression",
      "research_support": "Hewitt & Flett (1991) perfectionism model, Gilbert shame research"
    }
  ],
  
  "longitudinal_analysis": {
    "available": false,
    "reason": "This is patient's first SHA Harmony assessment",
    "recommendation": "Re-test every 8 weeks to track Chesed/Gevurah balance evolution"
  },
  
  "safety_disclaimer": "Esta interpretación es asistida por IA y debe ser validada por criterio clínico profesional. No constituye diagnóstico definitivo.",
  
  "therapist_action_items": [
    "✓ Review CFT protocol with patient, explain Chesed/Gevurah imbalance",
    "✓ Schedule compassion-self baseline assessment",
    "✓ Educate on IFS parts model, introduce 'critic' identification",
    "⚠️ Monitor for decompensation if perfectionism challenged too quickly"
  ]
}
```

---

### 2. AI Orchestrator

**Responsabilidades**:
- Recibir request de InterpretResultView
- Identificar test type y cargar datos del resultado
- Determinar qué interpreters invocar
- Combinar outputs de múltiples interpreters
- Aplicar safety filters
- Cachear resultado

**Pseudocódigo**:
```python
class AIOrchestrator:
    def interpret(self, result_id, depth, options):
        # 1. Load result data
        result = TestResult.objects.get(id=result_id)
        test_code = result.test_module.code
        
        # 2. Select interpreters
        primary_interpreter = self.get_interpreter(test_code)
        cross_test_analyzer = CrossTestPatternAnalyzer()
        longitudinal_analyzer = LongitudinalAnalyzer()
        
        # 3. Run primary interpretation
        narrative = primary_interpreter.interpret(result.result_data, depth)
        
        # 4. Run diagnostic suggestions (if requested)
        diagnostics = None
        if options['include_diagnostics']:
            diagnostics = DiagnosticEngine.suggest(result, narrative)
        
        # 5. Run therapeutic route (if requested)
        therapeutic_route = None
        if options['include_therapeutic_route']:
            therapeutic_route = TherapeuticRouteEngine.generate(
                result, narrative, diagnostics
            )
        
        # 6. Cross-test patterns (if other tests available)
        patterns = []
        if options['include_cross_test_patterns']:
            patient_tests = TestResult.objects.filter(
                patient=result.patient
            ).exclude(id=result_id)
            patterns = cross_test_analyzer.find_patterns(result, patient_tests)
        
        # 7. Longitudinal analysis (if historical data)
        longitudinal = longitudinal_analyzer.analyze(result)
        
        # 8. Safety filtering
        narrative = SafetyFilter.apply(narrative)
        diagnostics = SafetyFilter.apply_diagnostics(diagnostics)
        
        # 9. Combine and return
        return AIInterpretation(
            narrative=narrative,
            suggested_diagnoses=diagnostics,
            therapeutic_route=therapeutic_route,
            cross_test_patterns=patterns,
            longitudinal_analysis=longitudinal
        )
```

---

### 3. Specialized Interpreters

Cada test tiene su propio interpreter que entiende su formato de datos:

#### SHAHarmonyInterpreter

```python
class SHAHarmonyInterpreter:
    def interpret(self, result_data, depth):
        harmony_index = result_data['harmony_index']
        harmony_level = result_data['harmony_level']
        sefirot_scores = result_data['sefirot_scores']
        
        # Identify patterns
        dominant_sefirot = self._get_dominant(sefirot_scores)  # Top 3
        shadow_sefirot = self._get_shadow(sefirot_scores)      # Bottom 3
        
        # Check for specific pathological patterns
        patterns = []
        if self._check_keter_malkuth_gap(sefirot_scores):
            patterns.append("ideation_without_manifestation")
        if self._check_gevurah_chesed_imbalance(sefirot_scores):
            patterns.append("rigidity_without_compassion")
        
        # Generate narrative using GPT-4
        prompt = self._build_sha_prompt(
            harmony_index, dominant_sefirot, shadow_sefirot, patterns
        )
        narrative = LLMEngine.generate(prompt, depth=depth)
        
        return narrative
```

#### MCMI4Interpreter

```python
class MCMI4Interpreter:
    def interpret(self, result_data, depth):
        # Parse MCMI-4 specific data
        scales = result_data['scales']
        t_scores = result_data['t_scores']
        
        # Identify elevated scales (T > 75)
        elevated = [scale for scale, t in t_scores.items() if t > 75]
        
        # Check for special patterns (e.g., all-elevation, V-pattern)
        patterns = self._identify_mcmi_patterns(t_scores)
        
        # Map to DSM-5
        dsm_candidates = self._map_to_dsm5(elevated, patterns)
        
        # Generate narrative
        prompt = self._build_mcmi_prompt(elevated, patterns, dsm_candidates)
        narrative = LLMEngine.generate(prompt, depth=depth)
        
        return narrative
```

---

### 4. Knowledge Bases (RAG System)

**Stack**:
- **Vector DB**: Pinecone o Qdrant
- **Embeddings**: OpenAI text-embedding-3-large
- **Index size**: ~50k documents

**Contenido**:

#### DSM-5 Knowledge Base
```
- Full DSM-5 text (all disorders)
- Diagnostic criteria per disorder
- Differential diagnosis guidelines
- Prevalence data
- Treatment recommendations
- Research updates (2013-2026)
```

#### ICD-11 Knowledge Base
```
- Full ICD-11 mental health chapter
- Code mappings (ICD-11 ↔ DSM-5)
- WHO guidelines
- Cultural considerations
```

#### Therapeutic Modalities KB
```
100+ therapies indexed:
- CBT (all variants: standard, DBT, ACT, schema therapy)
- Psychodynamic (Freudian, Jungian, Lacanian)
- Humanistic (Person-centered, Gestalt, Existential)
- Somatic (SE, Hakomi, sensorimotor psychotherapy)
- Energy/Spiritual (Kabbalah therapy, chakra work, breathwork)
- Trauma-focused (EMDR, IFS, ART, Brainspotting)
- Systemic (family therapy, constellations, narrative therapy)
- Mind-body (mindfulness, yoga therapy, biofeedback)

Each entry includes:
- Evidence base (RCT quality)
- Best suited for (conditions)
- Contraindications
- Protocol length
- Resources (books, certifications)
```

**Retrieval Flow**:
```python
def retrieve_knowledge(query: str, kb_type: str, top_k: int = 5):
    # 1. Embed query
    query_embedding = openai.embeddings.create(
        input=query,
        model="text-embedding-3-large"
    )
    
    # 2. Search vector DB
    results = vector_db.search(
        embedding=query_embedding,
        filter={"kb_type": kb_type},
        top_k=top_k
    )
    
    # 3. Return relevant chunks
    return [r.text for r in results]
```

---

### 5. LLM Layer (GPT-4 Prompt Engineering)

**Model**: `gpt-4-turbo-2024-04-09` (128k context)

**Prompt Structure**:

```python
SYSTEM_PROMPT = """
Eres un asistente clínico experto especializado en psicología profunda, 
Kabbalah aplicada y diagnóstico diferencial. Tu rol es ayudar a terapeutas 
certificados a interpretar resultados de tests holísticos.

DIRECTRICES ÉTICAS CRÍTICAS:
1. NUNCA generes diagnósticos definitivos - solo "sugerencias preliminares"
2. SIEMPRE incluye disclaimer de validación profesional requerida
3. EVITA lenguaje alarmista o catastrofista
4. PRIORIZA interpretaciones que empoderan al paciente
5. SÉ TRANSPARENTE sobre limitaciones de IA

CONOCIMIENTO BASE:
- DSM-5 completo
- ICD-11 mental health
- Kabbalah (10 Sefirot, 4 Mundos, 72 Nombres)
- 100+ modalidades terapéuticas
- Literatura científica actualizada

ESTILO:
- Preciso y fundamentado en evidencia
- Lenguaje técnico apropiado para terapeuta
- Estructura clara (summary → insights → concerns)
- Citas a investigación cuando relevante
"""

def build_sha_narrative_prompt(harmony_index, sefirot_scores, patterns):
    # Retrieve relevant KB chunks
    kb_sefirot = retrieve_knowledge(
        f"Sefirot {dominant_sefirot} dominant {shadow_sefirot} shadow",
        kb_type="kabbalah"
    )
    kb_patterns = retrieve_knowledge(
        f"psychological patterns {patterns}",
        kb_type="research"
    )
    
    return f"""
DATOS DEL RESULTADO:
- Test: SHA Harmony (Auditoría de Armonía Sefirótica)
- Índice de armonía: {harmony_index}/5.0
- Sefirot dominantes: {dominant_sefirot}
- Sefirot en sombra: {shadow_sefirot}
- Patrones identificados: {patterns}

DISTRIBUCIÓN COMPLETA:
{json.dumps(sefirot_scores, indent=2)}

CONTEXTO CABALÍSTICO:
{kb_sefirot}

INVESTIGACIÓN RELEVANTE:
{kb_patterns}

TAREA:
Genera una interpretación terapéutica profunda de este perfil sefirótico.
Incluye:
1. Resumen ejecutivo (2-3 frases)
2. Insights clave (3-5 bullets)
3. Preocupaciones clínicas (si las hay)
4. Fortalezas identificadas

Formato JSON:
{{
  "summary": "...",
  "key_insights": ["...", "..."],
  "clinical_concerns": ["..."] or [],
  "strengths": ["...", "..."]
}}
"""
```

---

## 📂 Estructura de Archivos

```
backend/
  api/
    ai_engine/
      __init__.py
      views.py                    # InterpretResultView
      orchestrator.py             # AIOrchestrator
      interpreters/
        __init__.py
        base.py                   # BaseInterpreter abstract class
        sha_harmony.py            # SHAHarmonyInterpreter
        mcmi4.py                  # MCMI4Interpreter
        wellness.py               # WellnessInterpreter
        past_lives.py             # PastLivesInterpreter
      engines/
        __init__.py
        diagnostic.py             # DiagnosticEngine
        therapeutic_route.py      # TherapeuticRouteEngine
        cross_test_patterns.py    # CrossTestPatternAnalyzer
        longitudinal.py           # LongitudinalAnalyzer
      knowledge_base/
        __init__.py
        rag.py                    # RAG retrieval functions
        vector_store.py           # Vector DB interface
        embeddings.py             # Embedding generation
      llm/
        __init__.py
        gpt4.py                   # GPT-4 interface
        prompts.py                # Prompt templates
        safety.py                 # SafetyFilter
      models.py                   # AIInterpretation, InterpretationCache
      serializers.py
      urls.py
      
    knowledge_base_data/          # Static knowledge files
      dsm5/
        disorders.json
        criteria.json
      icd11/
        codes.json
      therapies/
        modalities.json
        protocols.json
      kabbalah/
        sefirot.yaml
        names_72.yaml

tonyblanco-app/
  components/
    ai/
      AIInterpretationPanel.tsx   # Main therapist-only component
      NarrativeView.tsx
      DiagnosticSuggestions.tsx
      TherapeuticRoute.tsx
      CrossTestPatterns.tsx
  lib/
    api/
      ai-engine.ts                # API client functions
```

---

## 🔐 Seguridad y Ética

### 1. Control de Acceso
- **SOLO terapeutas** pueden acceder al AI Engine
- `permission_classes = [IsAuthenticated, IsTherapist]`
- Logs detallados de todas las interpretaciones generadas

### 2. Safety Filtering
```python
class SafetyFilter:
    PROHIBITED_TERMS = [
        'definitivamente tiene',
        'diagnóstico confirmado',
        'sin duda alguna',
        'es incurable',
        # ... 50+ términos prohibidos
    ]
    
    def apply(self, text: str) -> str:
        # Remove prohibited terms
        for term in self.PROHIBITED_TERMS:
            text = text.replace(term, '[término filtrado - validación clínica requerida]')
        
        # Add disclaimers
        if 'diagnóstico' in text.lower():
            text += "\n\n⚠️ IMPORTANTE: Estas son sugerencias preliminares basadas en IA. Requieren validación mediante entrevista clínica estructurada."
        
        return text
```

### 3. Auditoría
```python
class AIInterpretationLog(models.Model):
    interpretation_id = models.CharField(max_length=50, unique=True)
    therapist = models.ForeignKey(User)
    patient = models.ForeignKey(Patient)
    test_result = models.ForeignKey(TestResult)
    generated_at = models.DateTimeField(auto_now_add=True)
    depth = models.CharField(max_length=20)
    options = models.JSONField()
    output = models.JSONField()  # Full AI response
    llm_calls = models.JSONField()  # Track all LLM calls made
    cost_usd = models.DecimalField(max_digits=8, decimal_places=4)
```

---

## 💰 Costos Estimados

**Por interpretación completa** (depth="therapist"):

| Componente | Tokens | Costo |
|------------|--------|-------|
| Narrative generation | ~2k input + 1k output | $0.06 |
| Diagnostic suggestions | ~1.5k input + 500 output | $0.03 |
| Therapeutic route | ~2k input + 1.5k output | $0.08 |
| Cross-test patterns | ~1k input + 500 output | $0.03 |
| **TOTAL** | **~10k tokens** | **~$0.20** |

**Optimizaciones**:
- Cachear interpretaciones por 30 días
- Si result_data no cambió → servir desde cache
- Batch processing para análisis longitudinal
- Usar GPT-3.5-turbo para tareas simples (~$0.02 por interpretación)

**Proyección mensual** (100 interpretaciones/mes):
- Sin cache: $20/mes
- Con cache (70% hit rate): $6/mes

---

## 📊 Métricas de Éxito

### KPIs Técnicos
- **Latencia**: < 10 segundos para interpretación completa
- **Cache hit rate**: > 60%
- **Error rate**: < 2%
- **Safety filter accuracy**: 100% (cero falsos negativos en prohibited terms)

### KPIs Clínicos
- **Therapist satisfaction**: > 4.5/5 en utilidad de interpretaciones
- **Diagnostic accuracy**: Comparar sugerencias IA vs diagnóstico final del terapeuta (target: 70% overlap)
- **Time saved**: Reducir tiempo de análisis de resultados en 40%

### KPIs de Negocio
- **Adoption rate**: 80% de terapeutas usan AI al menos 1 vez/semana
- **Retention impact**: Terapeutas con AI activo tienen 25% más retención

---

## 🚧 Limitaciones Conocidas

1. **No reemplaza juicio clínico**: IA es asistente, no sustituto
2. **Sesgos en datos de entrenamiento**: GPT-4 tiene sesgos occidentales, angloparlantes
3. **Contexto cultural limitado**: Puede no captar matices específicos de cultura latina/hispana
4. **Novedad de tests holísticos**: Poca investigación peer-reviewed en SHA Harmony, necesita validación
5. **Dependencia de calidad de datos**: Si result_data está incompleto, interpretación será limitada

---

## 🎯 Próximos Pasos

Ver documento `DOC > AI Engine Documentation` para:
- Guías de implementación detalladas
- Ejemplos de prompts completos
- Scripts de setup de Knowledge Base
- Procedimientos de testing

Ver documento `CODE > AI Engine Implementation` para:
- Código completo de todos los componentes
- Tests unitarios e integración
- Scripts de deployment

---

**Arquitectura diseñada por**: Luis Antonio Blanco Fontela + GitHub Copilot  
**Fecha**: 2026-01-30  
**Status**: ✅ ARQUITECTURA COMPLETA - Lista para implementación
