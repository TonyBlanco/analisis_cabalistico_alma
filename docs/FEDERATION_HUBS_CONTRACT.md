# FEDERATION_HUBS_CONTRACT.md

**Estado:** ACTIVA  
**Autoridad:** Arquitectura / Gobernanza  
**Versión:** 1.0  
**Fecha:** 2026-01-20  
**Related:** `HOLISTIC_FEDERATION_POLICY.md`

---

## PROPÓSITO

Definir los **contratos técnicos, objetos de datos y reglas de seguridad** para los **Federation Hubs** (workspaces especializados en síntesis holística transversal).

Este documento es **vinculante** para cualquier implementación de SCDF, SCID-5, MSHE o futuros hubs federados.

---

## 1. FEDERATION HUBS AUTORIZADOS

Los siguientes workspaces están **autorizados** para lectura cross-workspace:

| **Código** | **Nombre** | **Función** | **Output Principal** |
|-----------|-----------|-----------|---------------------|
| `scdf` | Structured Clinical Data Formulation | Formulación holística estructurada | `FormulationDraft` |
| `scid5_holistic` | SCID-5 Holístico | Exploración socrática estructurada | `SocraticPromptSet` |
| `mshe` | Motor de Síntesis Holística Evaluativa | Síntesis de 6 ejes + alertas | `SynthesisResult` |

**Restricción:** Solo estos hubs pueden invocar endpoints de federación. Cualquier otro workspace debe solicitar autorización formal.

---

## 2. OBJETOS DE DATOS NORMALIZADOS

### 2.1 AnalysisRecordNormalized

**Descripción:** Artefacto mínimo estándar que cualquier workspace puede exponer para federación.

**Schema:**

```python
class AnalysisRecordNormalized(BaseModel):
    """
    Artefacto normalizado para federación holística.
    Válido incluso si el workspace está incompleto.
    """
    # Identidad y origen
    subject_user_id: int  # FK User
    workspace_code: str  # Ej: "mcmi4_mystic", "astrology_pro"
    created_at: datetime
    
    # Clasificación simbólica
    tags: List[str]  # Ej: ["Yesod", "Gevurah", "Límite"]
    
    # Visibilidad dual
    summary_public: str  # Resumen simbólico (consultante)
    summary_pro: str  # Resumen ampliado (terapeuta, puede incluir técnico)
    
    # Trazabilidad (solo terapeuta)
    evidence_refs: List[str]  # IDs de records subyacentes (ej: ["mcmi4_result_123"])
    
    # Metadata
    workspace_status: str  # "complete" | "in_progress" | "draft"
    confidence_level: Optional[float] = None  # 0.0-1.0 (opcional)
```

**Validez:** Un `AnalysisRecordNormalized` es válido **independientemente del estado del workspace**. Representa un snapshot interpretable en cualquier momento.

**Ejemplos:**

```json
{
  "subject_user_id": 18,
  "workspace_code": "mcmi4_mystic",
  "created_at": "2026-01-15T10:30:00Z",
  "tags": ["Yesod", "Gevurah", "Contención"],
  "summary_public": "Tendencia a estructuras rígidas y autoexigencia elevada. Puede manifestarse como necesidad de control y dificultad para fluir con lo inesperado.",
  "summary_pro": "Pattern 8A (Compulsive) 85/100. Pattern 6B (Negativistic) 72/100. Correlación con rigidez cognitiva y perfeccionismo defensivo. Evidence: MCMI4 Item Cluster Analysis.",
  "evidence_refs": ["mcmi4_result_123", "mcmi4_profile_456"],
  "workspace_status": "complete",
  "confidence_level": 0.92
}
```

```json
{
  "subject_user_id": 18,
  "workspace_code": "astrology_pro",
  "created_at": "2025-12-10T14:00:00Z",
  "tags": ["Saturno", "Capricornio", "Casa 10", "Estructura"],
  "summary_public": "Anclaje profundo en estructura, responsabilidad y logros tangibles. Resonancia con arquetipos de construcción y límites claros.",
  "summary_pro": "Saturno en Capricornio conjunción MC, orbe 2°. Aspectos tensos con Luna (cuadratura 4°). Eje Gevurah-Binah dominante. Chart ID: astro_chart_456.",
  "evidence_refs": ["astro_chart_456"],
  "workspace_status": "complete",
  "confidence_level": 1.0
}
```

---

### 2.2 FederationReadScope

**Descripción:** Define el alcance de lectura autorizada para un Federation Hub.

**Schema:**

```python
class FederationReadScope(BaseModel):
    """
    Scope explícito de lectura cross-workspace.
    Requerido para toda invocación de federación.
    """
    # Sujeto
    subject_user: User  # FK User
    
    # Rango temporal
    date_range_start: datetime
    date_range_end: datetime
    
    # Dominios incluidos
    included_domains: List[str]  # Ej: ["mcmi4_mystic", "astrology_pro", "phq9_vitality"]
    
    # Metadata de solicitud
    requested_by: User  # FK User (terapeuta)
    requested_at: datetime
    
    # Consentimiento
    consent_explicit: bool = True  # Consultante autorizó síntesis federada
    consent_date: Optional[datetime] = None
```

**Validación:**
- ✅ `subject_user` debe tener consentimiento explícito para federación.
- ✅ `requested_by` debe ser terapeuta con permisos.
- ✅ `included_domains` debe contener solo workspaces existentes.
- ✅ `date_range_end` >= `date_range_start`.

---

### 2.3 HubFeedSnapshot

**Descripción:** Dataset normalizado que consume un Federation Hub.

**Schema:**

```python
class HubFeedSnapshot(BaseModel):
    """
    Feed completo para síntesis federada.
    Generado automáticamente desde FederationReadScope.
    """
    # Scope original
    scope: FederationReadScope
    
    # Artefactos normalizados
    records: List[AnalysisRecordNormalized]
    
    # Auditoría
    audit: FederationAuditLog
    
    # Metadata
    generated_at: datetime
    records_count: int
    domains_included: List[str]
```

**Ejemplo:**

```json
{
  "scope": {
    "subject_user_id": 18,
    "date_range_start": "2025-01-01T00:00:00Z",
    "date_range_end": "2026-01-20T23:59:59Z",
    "included_domains": ["mcmi4_mystic", "astrology_pro", "phq9_vitality"],
    "requested_by_user_id": 5,
    "requested_at": "2026-01-20T12:00:00Z",
    "consent_explicit": true
  },
  "records": [
    { /* AnalysisRecordNormalized #1 */ },
    { /* AnalysisRecordNormalized #2 */ },
    { /* AnalysisRecordNormalized #3 */ }
  ],
  "audit": {
    "id": "audit_fed_789",
    "timestamp": "2026-01-20T12:00:01Z",
    "requested_by_user_id": 5,
    "federation_hub": "mshe",
    "records_accessed_count": 3
  },
  "generated_at": "2026-01-20T12:00:01Z",
  "records_count": 3,
  "domains_included": ["mcmi4_mystic", "astrology_pro", "phq9_vitality"]
}
```

---

### 2.4 FederationAuditLog

**Descripción:** Registro inmutable de lectura cross-workspace.

**Schema:**

```python
class FederationAuditLog(BaseModel):
    """
    Auditoría automática de lecturas federadas.
    Inmutable y persistente.
    """
    id: str  # UUID único
    timestamp: datetime
    
    # Quien solicita
    requested_by_user_id: int  # FK User (terapeuta)
    
    # Hub consumidor
    federation_hub: str  # Ej: "mshe", "scdf", "scid5_holistic"
    
    # Scope
    scope: dict  # JSON de FederationReadScope
    
    # Volumetría
    records_accessed_count: int
    domains_accessed: List[str]
    
    # Output
    output_type: str  # Ej: "SynthesisResult", "FormulationDraft"
    output_id: Optional[str] = None  # ID del output generado
```

**Restricción:** Estos logs son **inmutables** y **no pueden borrarse** (compliance).

---

## 3. OUTPUTS DE FEDERATION HUBS

### 3.1 SynthesisResult (MSHE)

**Descripción:** Síntesis holística evaluativa en 6 ejes con alertas por color.

**Schema:**

```python
class SynthesisResult(BaseModel):
    """
    Output del Motor de Síntesis Holística Evaluativa (MSHE).
    """
    # Identidad
    subject_user_id: int
    generated_at: datetime
    generated_by_hub: str = "mshe"
    
    # Ejes holísticos (6 ejes)
    axes: List[HolisticAxis]  # Ver schema abajo
    
    # Alertas agregadas
    alerts: List[HolisticAlert]  # Ver schema abajo
    
    # Visibilidad dual
    summary_public: str  # Resumen simbólico (consultante)
    summary_pro: str  # Detalle técnico (terapeuta)
    
    # Trazabilidad
    source_records_count: int
    source_domains: List[str]
    feed_snapshot_id: str  # FK HubFeedSnapshot
```

**HolisticAxis schema:**

```python
class HolisticAxis(BaseModel):
    """
    Un eje holístico (de 6 total).
    """
    code: str  # Ej: "identity", "vitality", "relationships", "purpose", "structure", "transcendence"
    name: str  # Nombre simbólico
    
    # Ponderación
    weight: float  # 0.0-1.0 (configurable por terapeuta)
    
    # Evaluación simbólica
    resonance_level: str  # "low" | "medium" | "high"
    color_code: str  # "green" | "yellow" | "orange" | "red"
    
    # Narrativa
    summary_public: str
    summary_pro: str
    
    # Evidencia (solo terapeuta)
    contributing_records: List[str]  # IDs de AnalysisRecordNormalized
```

**HolisticAlert schema:**

```python
class HolisticAlert(BaseModel):
    """
    Alerta holística por color.
    """
    severity: str  # "green" | "yellow" | "orange" | "red"
    axis_code: str  # Eje afectado
    
    # Narrativa
    message_public: str  # Ej: "Momento de pausa y reflexión profunda"
    message_pro: str  # Ej: "Indicadores de desregulación emocional persistente"
    
    # Sugerencias
    recommendations_public: List[str]  # Prácticas de anclaje, etc.
    recommendations_pro: List[str]  # Intervenciones terapéuticas sugeridas
    
    # Evidencia
    evidence_records: List[str]
```

---

### 3.2 FormulationDraft (SCDF)

**Descripción:** Formulación holística estructurada preliminar (SCDF).

**Schema:**

```python
class FormulationDraft(BaseModel):
    """
    Output de Structured Clinical Data Formulation (SCDF).
    Borrador de formulación holística para validación terapéutica.
    """
    subject_user_id: int
    generated_at: datetime
    generated_by_hub: str = "scdf"
    
    # Secciones de formulación
    presenting_patterns: str  # Patrones presentados
    symbolic_dynamics: str  # Dinámicas simbólicas (Árbol de la Vida)
    historical_context: str  # Contexto histórico y evolutivo
    relational_map: str  # Mapa relacional (vínculos)
    intervention_hypotheses: List[str]  # Hipótesis de intervención
    
    # Visibilidad
    summary_public: str  # Resumen para consultante
    full_draft_pro: str  # Formulación completa (solo terapeuta)
    
    # Trazabilidad
    source_records_count: int
    source_domains: List[str]
    feed_snapshot_id: str
    
    # Estado
    status: str = "draft"  # "draft" | "validated" | "finalized"
    validated_by_user_id: Optional[int] = None  # FK User (terapeuta)
    validation_notes: Optional[str] = None
```

---

### 3.3 SocraticPromptSet (SCID-5 Holístico)

**Descripción:** Set de preguntas socráticas para exploración estructurada.

**Schema:**

```python
class SocraticPromptSet(BaseModel):
    """
    Output de SCID-5 Holístico.
    Set de preguntas mayéuticas para exploración terapeuta-consultante.
    """
    subject_user_id: int
    generated_at: datetime
    generated_by_hub: str = "scid5_holistic"
    
    # Categorías de preguntas
    prompts_by_category: Dict[str, List[SocraticPrompt]]
    # Ej: {"identity": [...], "vitality": [...], "relationships": [...]}
    
    # Trazabilidad
    source_records_count: int
    source_domains: List[str]
    feed_snapshot_id: str
```

**SocraticPrompt schema:**

```python
class SocraticPrompt(BaseModel):
    """
    Una pregunta socrática individual.
    """
    category: str  # Ej: "identity", "vitality"
    question_text: str  # Pregunta abierta
    context_clue: str  # Pista simbólica para terapeuta
    evidence_ref: Optional[str] = None  # ID del record que motivó la pregunta
    
    # Metadata
    depth_level: int = 1  # 1 (superficial) a 3 (profunda)
    suggested_timing: Optional[str] = None  # "early" | "mid" | "late"
```

---

## 4. ENDPOINTS DE FEDERACIÓN

### 4.1 Endpoint de Normalización (por workspace)

Cada workspace de dominio **debe** exponer:

```
GET /api/federation/normalized-records/
```

**Query params:**
- `subject_user_id` (required): ID del sujeto.
- `date_range_start` (required): ISO datetime.
- `date_range_end` (required): ISO datetime.

**Auth:** Bearer token (terapeuta con permisos).

**Response:**

```json
{
  "workspace_code": "mcmi4_mystic",
  "records": [
    { /* AnalysisRecordNormalized */ }
  ],
  "count": 1
}
```

**Restricciones:**
- ✅ Solo retorna records del `subject_user_id` solicitado.
- ✅ Solo terapeuta autorizado puede invocar.
- ❌ No expone datos internos del workspace (solo artefactos normalizados).

---

### 4.2 Endpoint de Síntesis (Federation Hub)

Ejemplo para MSHE:

```
POST /api/mshe/synthesize/
```

**Body:**

```json
{
  "federation_read_scope": {
    "subject_user_id": 18,
    "date_range_start": "2025-01-01T00:00:00Z",
    "date_range_end": "2026-01-20T23:59:59Z",
    "included_domains": ["mcmi4_mystic", "astrology_pro"],
    "requested_by_user_id": 5,
    "consent_explicit": true
  },
  "synthesis_config": {
    "axes_weights": {
      "identity": 1.0,
      "vitality": 0.8,
      "relationships": 0.9
    }
  }
}
```

**Response:**

```json
{
  "synthesis_result": { /* SynthesisResult */ },
  "audit_log_id": "audit_fed_789"
}
```

**Workflow interno:**
1. Validar `FederationReadScope`.
2. Generar `HubFeedSnapshot` (invocar endpoints normalizados).
3. Crear `FederationAuditLog`.
4. Procesar síntesis (IA + reglas).
5. Retornar `SynthesisResult`.

---

## 5. REGLAS DE SEGURIDAD

### 5.1 Autenticación y Autorización

✅ **Solo terapeutas** pueden invocar endpoints de federación.  
✅ **Permisos granulares**: terapeuta debe tener asignación activa con el sujeto.  
❌ **Prohibido** acceso directo por consultante (solo ve outputs públicos).

---

### 5.2 Consentimiento Explícito

✅ **Consultante debe autorizar** síntesis federada explícitamente.  
✅ **Revocación**: consultante puede excluir workspaces específicos en cualquier momento.  
✅ **Transparencia**: UI debe mostrar qué workspaces alimentan la síntesis.

---

### 5.3 Auditoría Obligatoria

✅ **Toda invocación** de endpoints de federación genera `FederationAuditLog`.  
✅ **Logs inmutables**: no pueden editarse ni borrarse.  
✅ **Acceso a logs**: auditoría disponible para compliance y revisión.

---

### 5.4 Visibilidad Dual Obligatoria

✅ **summary_public**: solo lenguaje simbólico, no técnico.  
✅ **summary_pro**: puede incluir scores, IDs, acrónimos clínicos.  
✅ **evidence_refs**: solo visible para terapeuta.  
❌ **Prohibido** exponer datos profesionales al consultante.

---

### 5.5 No Diagnóstico / IA Mayéutica

✅ **Outputs federados** deben ser mayéuticos:
  - Preguntas reflexivas.
  - Hipótesis simbólicas ("parece que...", "podría indicar...").
  - Propuestas de exploración.

❌ **Prohibido**:
  - Diagnósticos clínicos.
  - Sentencias deterministas ("tienes X trastorno").
  - Predicciones cerradas ("vas a...").

---

## 6. EJEMPLO COMPLETO DE FLUJO

### Caso: Terapeuta solicita síntesis MSHE para consultante

1. **Terapeuta** accede a panel de consultante (ID 18).
2. **UI** muestra botón "Generar Síntesis Holística (MSHE)".
3. **Sistema** verifica:
   - Terapeuta tiene asignación activa con consultante.
   - Consultante tiene consentimiento explícito para federación.
4. **Terapeuta** selecciona:
   - Workspaces a incluir: MCMI-4 Místico, Astrología Profesional, Vitalidad Emocional.
   - Rango temporal: últimos 12 meses.
5. **Sistema** genera `FederationReadScope`.
6. **Backend MSHE** invoca endpoints normalizados:
   ```
   GET /api/mcmi4_mystic/federation/normalized-records/?subject_user_id=18&...
   GET /api/astrology_pro/federation/normalized-records/?subject_user_id=18&...
   GET /api/phq9_vitality/federation/normalized-records/?subject_user_id=18&...
   ```
7. **Backend MSHE** construye `HubFeedSnapshot` con 12 records.
8. **Backend MSHE** crea `FederationAuditLog`.
9. **Motor de síntesis IA** procesa:
   - Mapea tags a 6 ejes holísticos.
   - Calcula resonancia por eje.
   - Genera alertas (verde/amarillo/naranja/rojo).
   - Produce narrativas dual (public/pro).
10. **Sistema** retorna `SynthesisResult`.
11. **UI terapeuta** muestra:
    - Árbol de la Vida con ejes coloreados.
    - Alertas detalladas.
    - Recomendaciones de intervención.
    - Trazabilidad (12 records, 3 dominios).
12. **Terapeuta** exporta summary_public para compartir con consultante.
13. **UI consultante** (si accede) ve solo:
    - Resumen simbólico (sin scores).
    - Recomendaciones de autocuidado.
    - Aviso: "Esto no es un diagnóstico".

---

## 7. VALIDACIÓN Y COMPLIANCE

### 7.1 Checklist de Implementación

Para cada Federation Hub nuevo:

- [ ] Implementa `FederationReadScope` con validación estricta.
- [ ] Consume solo endpoints de normalización (no DB directo).
- [ ] Genera `FederationAuditLog` automático.
- [ ] Produce output con visibilidad dual (public/pro).
- [ ] Cumple política de no-diagnóstico (IA mayéutica).
- [ ] Valida consentimiento explícito del consultante.
- [ ] Expone solo outputs, nunca lógica interna de otros workspaces.

---

### 7.2 Revisión de Seguridad

Toda implementación debe pasar auditoría de:

1. **Auth**: permisos granulares verificados.
2. **Consentimiento**: consultante autorizó explícitamente.
3. **Auditoría**: logs inmutables generados.
4. **Visibilidad**: datos profesionales no expuestos a consultante.
5. **No-diagnóstico**: outputs revisados por panel ético/legal.

---

## 8. PRÓXIMOS PASOS

Ver `HOLISTIC_FEDERATION_ROADMAP.md` para implementación por fases.

---

**Firmado por:** Arquitectura / Gobernanza  
**Fecha:** 2026-01-20  
**Versión:** 1.0  
**Estado:** ACTIVA
