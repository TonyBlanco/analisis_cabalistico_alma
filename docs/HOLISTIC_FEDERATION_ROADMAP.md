# HOLISTIC_FEDERATION_ROADMAP.md

**Estado:** ACTIVA  
**Autoridad:** Arquitectura / Gobernanza  
**Versión:** 1.0  
**Fecha:** 2026-01-20  
**Related:** `HOLISTIC_FEDERATION_POLICY.md`, `FEDERATION_HUBS_CONTRACT.md`

---

## PROPÓSITO

Definir el plan de implementación por fases para la **Federación Holística**, transitando desde el modelo de "aislamiento absoluto" hacia un ecosistema vivo que permite síntesis transversal sin comprometer integridad de dominio.

---

## VISIÓN ESTRATÉGICA

**Estado Actual (pre-federación):**
- Workspaces aislados con exportación manual estática.
- SCDF, SCID-5, MSHE **bloqueados** (no pueden funcionar como diseñados).
- Síntesis holística imposible sin fricción manual.

**Estado Objetivo (post-federación completa):**
- Workspaces soberanos con endpoints de normalización.
- Federation Hubs operacionales (SCDF, SCID-5, MSHE) leyendo transversalmente.
- Síntesis automática con auditoría sin fricción.
- Ecosistema vivo que detecta resonancias, genera insights evolutivos y habilita co-investigación consultante-terapeuta.

---

## PRINCIPIOS RECTORES

1. **Integridad de dominio**: ningún workspace escribe en otro (nunca).
2. **Auditoría sin fricción**: automática, inmutable, no requiere acción manual.
3. **Visibilidad dual nativa**: public/pro en todo artefacto.
4. **IA Mayéutica obligatoria**: preguntas/hipótesis, no sentencias.
5. **Implementación gradual**: sin breaking changes, opt-in por fase.

---

## FASE 0: GOBERNANZA Y CONTRATOS (ACTUAL — PASO 1)

**Estado:** ✅ **COMPLETADA**  
**Duración:** 2026-01-20 (1 día)  
**Objetivo:** Re-fundar la gobernanza desde aislamiento hacia federación.

### Entregables:

✅ **docs/HOLISTIC_FEDERATION_POLICY.md**
  - Define integridad de dominio + federación de lectura.
  - Autoriza workspaces-hub (SCDF, SCID-5, MSHE).
  - Reglas de auditoría y visibilidad dual.

✅ **docs/FEDERATION_HUBS_CONTRACT.md**
  - Objetos normalizados: `AnalysisRecordNormalized`, `FederationReadScope`, `HubFeedSnapshot`.
  - Outputs: `SynthesisResult`, `FormulationDraft`, `SocraticPromptSet`.
  - Endpoints y reglas de seguridad.

✅ **docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md**
  - Actualiza System Prompt con soporte de federación.
  - IA Mayéutica obligatoria.
  - Checklist de cumplimiento para hubs.

✅ **docs/legacy/2026-01-20_pre-federation/**
  - Migración de `WORKSPACE_ISOLATION_POLICY.md` a legacy.
  - Headers de trazabilidad LEGACY.

✅ **Roadmap completo** (este documento).

### Criterios de Aceptación:

- [x] Documentos creados y versionados.
- [x] `00_SOURCE_OF_TRUTH.md` actualizado con referencias.
- [x] `DOCUMENT_INDEX.md` refleja nueva estructura.
- [x] Aprobación formal de gobernanza (pendiente).

### Riesgos:

- ⚠️ Resistencia organizacional al cambio de paradigma.
- ⚠️ Necesidad de alineación con stakeholders (terapeuta, compliance, legal).

**Mitigación:** Comunicación clara de beneficios (síntesis holística, ecosistema vivo) y garantías (integridad, auditoría, no-diagnóstico mantenido).

---

## FASE 1: META-LAYER FEDERADO (HubFeedSnapshot)

**Estado:** 🔜 **PRÓXIMA FASE**  
**Duración estimada:** 4–6 semanas  
**Objetivo:** Implementar capa de normalización y alimentar MSHE (primer hub).

### Alcance Técnico:

#### 1.1 Endpoints de Normalización (por workspace)

**Workspaces a implementar:**
- MCMI-4 Místico
- Astrología Profesional
- Vitalidad Emocional (PHQ-9)
- Anclaje y Alerta (GAD-7)
- Trama del Alma (BDI)

**Endpoint:**
```
GET /api/<workspace>/federation/normalized-records/
```

**Query params:**
- `subject_user_id` (required)
- `date_range_start` (required, ISO datetime)
- `date_range_end` (required, ISO datetime)

**Response:**
```json
{
  "workspace_code": "mcmi4_mystic",
  "records": [
    {
      "subject_user_id": 18,
      "workspace_code": "mcmi4_mystic",
      "created_at": "2026-01-15T10:30:00Z",
      "tags": ["Yesod", "Gevurah"],
      "summary_public": "...",
      "summary_pro": "...",
      "evidence_refs": ["mcmi4_result_123"],
      "workspace_status": "complete",
      "confidence_level": 0.92
    }
  ],
  "count": 1
}
```

**Restricciones:**
- Solo terapeuta con asignación activa puede invocar.
- Retorna solo datos del subject_user_id solicitado.
- Sin exposición de lógica interna del workspace.

#### 1.2 Modelos de Federación (backend core)

**Nuevos modelos Django:**

```python
# backend/api/federation_models.py

class FederationReadScope(models.Model):
    """Scope explícito de lectura cross-workspace."""
    subject_user = models.ForeignKey(User, on_delete=models.CASCADE)
    date_range_start = models.DateTimeField()
    date_range_end = models.DateTimeField()
    included_domains = models.JSONField()  # List[str]
    requested_by = models.ForeignKey(User, related_name='federation_requests', on_delete=models.CASCADE)
    requested_at = models.DateTimeField(auto_now_add=True)
    consent_explicit = models.BooleanField(default=True)
    consent_date = models.DateTimeField(null=True, blank=True)

class FederationAuditLog(models.Model):
    """Auditoría inmutable de lecturas federadas."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    timestamp = models.DateTimeField(auto_now_add=True)
    requested_by_user = models.ForeignKey(User, on_delete=models.PROTECT)
    federation_hub = models.CharField(max_length=50)  # "mshe", "scdf", "scid5_holistic"
    scope = models.JSONField()  # FederationReadScope serializado
    records_accessed_count = models.IntegerField()
    domains_accessed = models.JSONField()  # List[str]
    output_type = models.CharField(max_length=50)
    output_id = models.CharField(max_length=100, null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        # Inmutable: no delete, no update
```

#### 1.3 Servicio de Agregación (HubFeedBuilder)

**Nuevo servicio:**

```python
# backend/api/services/hub_feed_builder.py

class HubFeedBuilder:
    """Genera HubFeedSnapshot desde FederationReadScope."""
    
    def build_feed(self, scope: FederationReadScope) -> HubFeedSnapshot:
        """
        1. Valida scope (permisos, consentimiento).
        2. Invoca endpoints normalizados de cada dominio.
        3. Agrega records.
        4. Genera FederationAuditLog.
        5. Retorna HubFeedSnapshot.
        """
        pass
```

#### 1.4 MSHE (Primer Hub)

**Endpoint de síntesis:**

```
POST /api/mshe/synthesize/
```

**Body:**
```json
{
  "federation_read_scope": { /* ... */ },
  "synthesis_config": {
    "axes_weights": {
      "identity": 1.0,
      "vitality": 0.8,
      "relationships": 0.9,
      "purpose": 0.7,
      "structure": 0.85,
      "transcendence": 0.6
    }
  }
}
```

**Response:**
```json
{
  "synthesis_result": { /* SynthesisResult */ },
  "audit_log_id": "uuid"
}
```

**Lógica de síntesis:**
- Mapear tags de records a 6 ejes holísticos.
- Calcular resonancia por eje (weighted).
- Generar alertas por color (verde/amarillo/naranja/rojo).
- Producir narrativas dual (public/pro) con IA Mayéutica.

### Criterios de Aceptación (Fase 1):

- [ ] 5 workspaces exponen endpoint de normalización.
- [ ] Modelos `FederationReadScope` y `FederationAuditLog` migrados.
- [ ] Servicio `HubFeedBuilder` funcional con tests.
- [ ] Endpoint MSHE `/synthesize/` retorna `SynthesisResult` válido.
- [ ] Auditoría automática genera logs inmutables.
- [ ] UI terapeuta muestra síntesis MSHE con trazabilidad.
- [ ] UI consultante ve solo `summary_public` (sin scores).
- [ ] Tests de integración (E2E) pasan.
- [ ] Documentación técnica (OpenAPI spec) actualizada.

### Riesgos:

- ⚠️ Complejidad de agregación (múltiples endpoints, timeouts).
- ⚠️ Mapeo tags → ejes holísticos puede requerir ajuste iterativo.
- ⚠️ Performance: lectura de 5+ workspaces puede ser lenta.

**Mitigación:**
- Implementar caché de artefactos normalizados (TTL 5 min).
- Procesamiento asíncrono (Celery task para síntesis larga).
- Paginación y límites (máx 100 records por workspace).

---

## FASE 2: META-MOTOR DE RESONANCIA

**Estado:** 📅 **PLANIFICADA**  
**Duración estimada:** 6–8 semanas  
**Objetivo:** Detectar sincronicidades temporales y generar hipótesis de resonancia.

### Alcance Técnico:

#### 2.1 HolisticResonanceEngine

**Nuevo motor:**

```python
# backend/api/services/resonance_engine.py

class HolisticResonanceEngine:
    """
    Detecta sincronicidades entre eventos de workspaces.
    Genera ResonanceHypothesis y ResonanceAlert (solo terapeuta).
    """
    
    def detect_resonances(self, feed: HubFeedSnapshot) -> List[ResonanceHypothesis]:
        """
        Analiza timestamps, tags, patrones en HubFeedSnapshot.
        Detecta:
        - Eventos simultáneos (misma semana) en dominios diferentes.
        - Patrones recurrentes (tags repetidos en múltiples records).
        - Transiciones abruptas (cambios de intensidad simbólica).
        """
        pass
```

#### 2.2 ResonanceHypothesis (modelo)

```python
class ResonanceHypothesis(models.Model):
    """Hipótesis de resonancia detectada por el motor."""
    subject_user = models.ForeignKey(User, on_delete=models.CASCADE)
    generated_at = models.DateTimeField(auto_now_add=True)
    resonance_type = models.CharField(max_length=50)  # "temporal_sync", "pattern_recurrence", "abrupt_transition"
    
    # Workspaces involucrados
    involved_domains = models.JSONField()  # List[str]
    evidence_records = models.JSONField()  # List[record_ids]
    
    # Hipótesis narrativa (solo terapeuta)
    hypothesis_text = models.TextField()
    confidence_level = models.FloatField()  # 0.0-1.0
    
    # Visibilidad: solo terapeuta
    visible_to_client = models.BooleanField(default=False)
    
    # Estado
    status = models.CharField(max_length=20, default='pending')  # "pending", "validated", "dismissed"
    validated_by_user = models.ForeignKey(User, null=True, blank=True, related_name='validated_resonances', on_delete=models.SET_NULL)
    validation_notes = models.TextField(blank=True)
```

#### 2.3 Ejemplos de Resonancias Detectadas

**Ejemplo 1: Sincronicidad temporal**

```json
{
  "resonance_type": "temporal_sync",
  "involved_domains": ["mcmi4_mystic", "astrology_pro"],
  "evidence_records": ["mcmi4_result_123", "astro_chart_456"],
  "hypothesis_text": "Se observa que el pico de Pattern 8A (Compulsive) en MCMI-4 (15-ene-2026) coincide temporalmente con tránsito de Saturno sobre Ascendente natal (12-ene-2026). Hipótesis: momento de confrontación con estructuras rígidas y autoridad interna.",
  "confidence_level": 0.78
}
```

**Ejemplo 2: Patrón recurrente**

```json
{
  "resonance_type": "pattern_recurrence",
  "involved_domains": ["phq9_vitality", "gad7_ancla", "mcmi4_mystic"],
  "evidence_records": ["phq9_result_789", "gad7_result_456", "mcmi4_result_123"],
  "hypothesis_text": "El tag 'Gevurah' (Límite) aparece como predominante en 3 exploraciones distintas en el último mes. Hipótesis: patrón sistémico de autoexigencia y contención que atraviesa múltiples dimensiones (vitalidad, anclaje, personalidad).",
  "confidence_level": 0.85
}
```

#### 2.4 UI Terapeuta: Panel de Resonancias

**Nueva vista:**
- `/dashboard/therapist/patient/[id]/resonances`

**Features:**
- Lista de resonancias detectadas (ordenadas por confidence_level).
- Filtros: tipo, dominios, estado.
- Acción: validar, descartar, añadir notas.
- Timeline visual: gráfico de eventos sincronizados.

**Restricción:** visible **solo para terapeuta**. Consultante **no ve** resonancias (pueden ser prematuras o requieren contexto profesional).

### Criterios de Aceptación (Fase 2):

- [ ] `HolisticResonanceEngine` implementado con 3 tipos de resonancia.
- [ ] Modelo `ResonanceHypothesis` migrado.
- [ ] Endpoint `/api/resonances/detect/` funcional.
- [ ] UI terapeuta muestra panel de resonancias.
- [ ] Sistema genera alertas automáticas (ej. 3+ patrones recurrentes → alerta).
- [ ] Tests unitarios para algoritmos de detección.
- [ ] Documentación de tipos de resonancia y ejemplos.

### Riesgos:

- ⚠️ Complejidad algorítmica (detección de patrones puede generar falsos positivos).
- ⚠️ Sobrecarga cognitiva del terapeuta (demasiadas hipótesis).

**Mitigación:**
- Umbral de confidence_level ajustable (default 0.7).
- Filtrado por relevancia (priorizar resonancias con 3+ records).
- Opción de "descartar similar" para reducir ruido.

---

## FASE 3: CO-INVESTIGADOR (DIARIOS SIMBÓLICOS ACTIVOS)

**Estado:** 📅 **PLANIFICADA**  
**Duración estimada:** 8–10 semanas  
**Objetivo:** Habilitar input activo del consultante (diarios simbólicos) que alimenta el feed de federación.

### Alcance Técnico:

#### 3.1 SymbolicJournal (nuevo workspace)

**Concepto:**
- Diario simbólico donde consultante registra reflexiones, emociones, eventos significativos.
- Input en lenguaje natural (sin tecnicismos).
- Sistema extrae tags simbólicos automáticamente (IA).

**Modelo:**

```python
class SymbolicJournalEntry(models.Model):
    """Entrada de diario simbólico del consultante."""
    subject_user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Entrada textual
    entry_text = models.TextField()  # Input libre del consultante
    
    # Tags extraídos automáticamente (IA)
    extracted_tags = models.JSONField()  # List[str]
    
    # Contexto emocional (opcional)
    mood_snapshot = models.CharField(max_length=50, blank=True)  # "sereno", "inquieto", "expansivo"
    
    # Visibilidad
    shared_with_therapist = models.BooleanField(default=False)
    therapist_notes = models.TextField(blank=True)
```

#### 3.2 Extracción Automática de Tags (IA)

**Servicio:**

```python
# backend/api/services/symbolic_tag_extractor.py

class SymbolicTagExtractor:
    """Extrae tags simbólicos de texto libre usando IA."""
    
    def extract_tags(self, entry_text: str) -> List[str]:
        """
        Invoca LLM (GPT-4 / Gemini) con prompt:
        
        "Identifica arquetipos, sefirot y dinámicas simbólicas en este texto:
        [entrada del consultante]
        
        Responde solo con tags separados por comas (ej: Yesod, Contención, Ansiedad)."
        """
        pass
```

**Ejemplo:**

**Input consultante:**
> "Hoy me sentí abrumado con todas las tareas pendientes. Necesito control para sentirme seguro, pero eso me agota. ¿Por qué no puedo simplemente dejar ir?"

**Tags extraídos (IA):**
```json
["Gevurah", "Contención", "Agotamiento", "Control", "Yesod-desbalanceado"]
```

#### 3.3 Integración con HubFeedSnapshot

El diario simbólico expone endpoint de normalización:

```
GET /api/symbolic_journal/federation/normalized-records/
```

**Response:**
```json
{
  "workspace_code": "symbolic_journal",
  "records": [
    {
      "subject_user_id": 18,
      "workspace_code": "symbolic_journal",
      "created_at": "2026-02-10T18:30:00Z",
      "tags": ["Gevurah", "Contención", "Agotamiento"],
      "summary_public": "Reflexión sobre necesidad de control y agotamiento asociado.",
      "summary_pro": "Entrada diario: patrón Gevurah (contención) sin compensación Chesed. Cliente reporta agotamiento por hipercontrol. Evidence: journal_entry_789.",
      "evidence_refs": ["journal_entry_789"],
      "workspace_status": "in_progress",
      "confidence_level": 0.65
    }
  ]
}
```

#### 3.4 UI Consultante: Diario Simbólico

**Nueva vista:**
- `/dashboard/client/symbolic-journal`

**Features:**
- Input de texto libre (markdown).
- Selector de mood (opcional): sereno, inquieto, expansivo, contenido, etc.
- Opción: "Compartir con mi terapeuta".
- Visualización de tags extraídos (explicación simbólica).

**Ejemplo de UI:**

```
📖 Diario Simbólico

[Área de texto grande]
Escribe tus reflexiones, emociones, eventos significativos...

[Selector de mood: 😌 Sereno | 😟 Inquieto | 🌱 Expansivo | 🛡️ Contenido]

[Botón: "Guardar entrada"]

---

Tags detectados:
- Yesod (Anclaje): Necesidad de certeza y seguridad.
- Gevurah (Límite): Autoexigencia y contención.

🔹 Compartir con mi terapeuta: [Toggle]
```

### Criterios de Aceptación (Fase 3):

- [ ] Modelo `SymbolicJournalEntry` migrado.
- [ ] Servicio `SymbolicTagExtractor` funcional con LLM.
- [ ] Endpoint de normalización para diario simbólico.
- [ ] UI consultante: diario con input libre y extracción de tags.
- [ ] Integración con MSHE: diario alimenta síntesis federada.
- [ ] UI terapeuta: acceso a entradas compartidas con notas.
- [ ] Tests de extracción de tags (casos edge: entradas ambiguas, sin contenido simbólico).

### Riesgos:

- ⚠️ Precisión de extracción de tags (LLM puede fallar con entradas muy abstractas).
- ⚠️ Consultante puede sentir "vigilancia" si tags son muy técnicos.

**Mitigación:**
- Mostrar tags con explicaciones amigables (ej. "Yesod: tu necesidad de anclaje").
- Opción de editar/eliminar tags manualmente.
- Claridad sobre privacidad: solo compartido si consultante activa toggle.

---

## FASE 4: TIMELINE DINÁMICO (TREE EVOLUTION PLAYER)

**Estado:** 📅 **PLANIFICADA**  
**Duración estimada:** 6–8 semanas  
**Objetivo:** Generar "película evolutiva" del Árbol de la Vida a lo largo del tiempo.

### Alcance Técnico:

#### 4.1 TreeEvolutionSnapshot (modelo)

```python
class TreeEvolutionSnapshot(models.Model):
    """Snapshot del Árbol de la Vida en un momento dado."""
    subject_user = models.ForeignKey(User, on_delete=models.CASCADE)
    snapshot_date = models.DateTimeField()
    
    # Estado de las 10 sefirot
    sefirot_states = models.JSONField()  # {"Keter": 0.8, "Chokhmah": 0.6, ...}
    
    # Fuente de datos
    source_records = models.JSONField()  # List[record_ids]
    source_domains = models.JSONField()  # List[workspace_codes]
    
    # Metadata
    generated_by_hub = models.CharField(max_length=50, default="mshe")
    confidence_level = models.FloatField()
```

#### 4.2 TreeEvolutionPlayer (servicio)

```python
class TreeEvolutionPlayer:
    """Genera serie temporal de TreeEvolutionSnapshot."""
    
    def generate_timeline(self, subject_user_id: int, date_range_start: datetime, date_range_end: datetime, granularity: str = 'monthly') -> List[TreeEvolutionSnapshot]:
        """
        1. Divide rango temporal en intervalos (mensual, trimestral).
        2. Para cada intervalo, genera HubFeedSnapshot.
        3. Calcula estado de sefirot basado en tags predominantes.
        4. Retorna serie temporal.
        """
        pass
```

#### 4.3 UI: Tree Evolution Player

**Nueva vista:**
- `/dashboard/therapist/patient/[id]/tree-evolution`

**Features:**
- Timeline interactiva (slider temporal).
- Visualización del Árbol de la Vida animado.
- Play/Pause: "película" que muestra evolución mes a mes.
- Marcadores de eventos significativos (ej. exploración MCMI-4, entrada diario importante).

**Ejemplo de visualización:**
- Ene-2025: Árbol con Yesod (amarillo), Gevurah (naranja), Tiferet (verde).
- Feb-2025: Yesod (verde), Gevurah (amarillo), Chesed (naranja) — shift evidente.
- Mar-2025: Árbol más equilibrado (mayoría verde).

#### 4.4 Insights Evolutivos (IA)

**Servicio:**

```python
class EvolutionInsightGenerator:
    """Genera insights narrativos sobre evolución."""
    
    def generate_insights(self, timeline: List[TreeEvolutionSnapshot]) -> List[EvolutionInsight]:
        """
        Detecta:
        - Tendencias (ej. mejora sostenida en Tiferet).
        - Regresiones (ej. caída abrupta en Yesod).
        - Ciclos (ej. patrón recurrente de expansión-contención).
        """
        pass
```

**Ejemplo de insight:**

```json
{
  "insight_type": "sustained_improvement",
  "period": "2025-06 a 2025-12",
  "affected_sefira": "Tiferet",
  "narrative": "Se observa mejora sostenida en el eje Tiferet (Integración) a lo largo de 6 meses, con predominio de color verde. Hipótesis: prácticas de integración emocional están siendo efectivas."
}
```

### Criterios de Aceptación (Fase 4):

- [ ] Modelo `TreeEvolutionSnapshot` migrado.
- [ ] Servicio `TreeEvolutionPlayer` genera timeline.
- [ ] UI: Tree Evolution Player con animación.
- [ ] Servicio `EvolutionInsightGenerator` detecta tendencias.
- [ ] Exportación de timeline (PDF, video).
- [ ] Tests de generación de timeline (casos: datos escasos, gaps temporales).

### Riesgos:

- ⚠️ Datos escasos en períodos antiguos (timeline incompleto).
- ⚠️ Complejidad de visualización (árbol animado puede ser pesado).

**Mitigación:**
- Interpolación inteligente para gaps (ej. estado "unknown" en períodos sin datos).
- Optimización de rendering (canvas 2D, no 3D).

---

## FASE 5: IA SOCRÁTICA (SCDF + SCID-5)

**Estado:** 📅 **PLANIFICADA**  
**Duración estimada:** 8–12 semanas  
**Objetivo:** Implementar SCDF (formulación estructurada) y SCID-5 Holístico (exploración socrática).

### Alcance Técnico:

#### 5.1 SCDF: Structured Clinical Data Formulation

**Endpoint:**

```
POST /api/scdf/formulate/
```

**Body:**
```json
{
  "federation_read_scope": { /* ... */ }
}
```

**Response:**
```json
{
  "formulation_draft": {
    "presenting_patterns": "...",
    "symbolic_dynamics": "...",
    "historical_context": "...",
    "relational_map": "...",
    "intervention_hypotheses": ["...", "..."],
    "summary_public": "...",
    "full_draft_pro": "...",
    "status": "draft"
  }
}
```

**Lógica:**
- Consume `HubFeedSnapshot`.
- Genera secciones de formulación usando IA (GPT-4).
- Prompt incluye System Prompt Guardián Holístico v2.
- Outputs mayéuticos (hipótesis, no certezas).

#### 5.2 SCID-5 Holístico: Exploración Socrática

**Endpoint:**

```
POST /api/scid5_holistic/generate-prompts/
```

**Body:**
```json
{
  "federation_read_scope": { /* ... */ },
  "depth_level": 2,  // 1-3
  "focus_areas": ["identity", "vitality", "relationships"]
}
```

**Response:**
```json
{
  "socratic_prompt_set": {
    "prompts_by_category": {
      "identity": [
        {
          "question_text": "¿Qué partes de ti sientes que están en tensión últimamente?",
          "context_clue": "Pattern 8A (Compulsive) + Saturno MC → autoexigencia",
          "depth_level": 1
        }
      ],
      "vitality": [ /* ... */ ]
    }
  }
}
```

**Lógica:**
- Genera preguntas abiertas basadas en patterns detectados.
- Preguntas calibradas por depth_level (1=superficial, 3=profunda).
- IA genera preguntas mayéuticas (nunca diagnósticas).

#### 5.3 UI Terapeuta: Asistentes de Formulación y Exploración

**Nuevas vistas:**
- `/dashboard/therapist/patient/[id]/formulation` (SCDF)
- `/dashboard/therapist/patient/[id]/socratic-exploration` (SCID-5)

**Features SCDF:**
- Botón "Generar formulación preliminar".
- Editor de formulación con secciones colapsables.
- Validación: botón "Validar formulación" (marca status=validated).
- Exportación a PDF.

**Features SCID-5:**
- Selector de áreas de enfoque (identity, vitality, etc.).
- Selector de profundidad (1-3).
- Generación de preguntas.
- Modo sesión: ir marcando preguntas como "exploradas".

#### 5.4 ExplanationTrace (trazabilidad en UI)

**Nuevo feature cross-cutting:**

Para toda síntesis IA (MSHE, SCDF, SCID-5), incluir en UI:

```
🔍 Trazabilidad:
- Exploración MCMI-4 Místico (15-ene-2026)
- Exploración Astrología Profesional (10-dic-2025)
- Entrada Diario Simbólico (10-feb-2026)

ℹ️ Esta síntesis fue generada con [Modelo GPT-4] y revisada con políticas de no-diagnóstico.
```

### Criterios de Aceptación (Fase 5):

- [ ] Endpoint SCDF `/formulate/` funcional.
- [ ] Endpoint SCID-5 `/generate-prompts/` funcional.
- [ ] UI terapeuta: formulación editable con validación.
- [ ] UI terapeuta: generador de preguntas socráticas.
- [ ] System Prompt v2 integrado en todos los prompts IA.
- [ ] ExplanationTrace visible en todas las síntesis.
- [ ] Tests de outputs IA (verificar no-diagnóstico, mayéutica).

### Riesgos:

- ⚠️ Calidad de preguntas socráticas (LLM puede generar preguntas cerradas o diagnósticas).
- ⚠️ Sobrecarga del terapeuta (demasiadas herramientas).

**Mitigación:**
- Prompt engineering riguroso con ejemplos de preguntas mayéuticas.
- Revisión humana obligatoria antes de usar en sesión.
- Onboarding y capacitación para terapeutas.

---

## RESUMEN COMPARATIVO: ANTES vs DESPUÉS (POST-FASE 5)

| **Aspecto** | **Estado Actual (pre-federación)** | **Estado Final (post-Fase 5)** |
|------------|-----------------------------------|-------------------------------|
| **Compartir datos** | ❌ Prohibido (solo export manual estático) | ✅ Federación de lectura autorizada (hubs) |
| **Síntesis holística** | ❌ Imposible (manual, fragmentada) | ✅ MSHE operacional (automática, transversal) |
| **Formulación estructurada** | ❌ Bloqueada (no hay SCDF) | ✅ SCDF genera borradores preliminares |
| **Exploración socrática** | ❌ Manual (sin asistencia) | ✅ SCID-5 genera preguntas mayéuticas |
| **Resonancias** | ❌ No detectadas | ✅ Motor detecta sincronicidades (solo terapeuta) |
| **Co-investigación** | ❌ Pasiva (consultante solo recibe) | ✅ Diarios simbólicos activos (consultante aporta) |
| **Timeline evolutivo** | ❌ No existe | ✅ Tree Evolution Player (película del Árbol) |
| **Auditoría** | ⚠️ Manual (fricción) | ✅ Automática e inmutable |
| **No diagnóstico** | ✅ Mantenido | ✅ Mantenido + IA Mayéutica reforzada |
| **Visibilidad dual** | ⚠️ Mezclada | ✅ Nativa (public/pro) en todos los artefactos |

---

## CRITERIOS DE ÉXITO GLOBAL

Al finalizar Fase 5:

1. ✅ **MSHE operacional** generando síntesis de 6 ejes con alertas.
2. ✅ **SCDF generando formulaciones** preliminares validables.
3. ✅ **SCID-5 generando preguntas** socráticas calibradas.
4. ✅ **Motor de resonancia** detectando sincronicidades.
5. ✅ **Diarios simbólicos** alimentando feed federado.
6. ✅ **Tree Evolution Player** mostrando película evolutiva.
7. ✅ **Auditoría automática** sin fricción.
8. ✅ **No diagnóstico** mantenido (IA Mayéutica verificada).
9. ✅ **Visibilidad dual** nativa en todos los outputs.
10. ✅ **Integridad de dominio** preservada (no escritura cross-workspace).

---

## PRÓXIMOS PASOS INMEDIATOS (POST-FASE 0)

1. **Aprobación formal** de gobernanza (Fase 0).
2. **Kickoff técnico** de Fase 1 (Meta-Layer Federado).
3. **Asignación de equipo**:
   - Backend: implementación de endpoints normalizados.
   - Frontend: UI MSHE.
   - IA/Prompts: System Prompt v2 en pipelines IA.
4. **Setup de infra**:
   - Caché (Redis) para artefactos normalizados.
   - Celery para procesamiento asíncrono.
5. **Plan de testing**:
   - Tests unitarios (servicios).
   - Tests de integración (E2E).
   - Tests de compliance (no-diagnóstico, auditoría).

---

**Firmado por:** Arquitectura / Gobernanza  
**Fecha:** 2026-01-20  
**Versión:** 1.0  
**Estado:** ACTIVA
