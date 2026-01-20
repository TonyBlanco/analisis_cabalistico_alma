# HOLISTIC_FEDERATION_POLICY.md

**Estado:** ACTIVA  
**Autoridad:** Arquitectura / Gobernanza  
**Versión:** 2.0  
**Fecha de entrada en vigor:** 2026-01-20  
**Supersedes:** `WORKSPACE_ISOLATION_POLICY.md` (v1.0)  
**Razón:** Transición de "aislamiento absoluto" a "integridad de dominio + federación de lectura"

---

## RESUMEN EJECUTIVO

Esta política **re-funda la gobernanza** de workspaces, transitando desde un modelo de **"Aislamiento Absoluto"** (útil para control, pero incompatible con síntesis holística) hacia un modelo de **"Federación Holística"** que permite:

1. **Integridad de dominio**: cada workspace mantiene soberanía sobre su escritura y lógica.
2. **Lectura transversal autorizada**: workspaces especializados (hubs) pueden consultar artefactos normalizados de otros workspaces para síntesis.
3. **Auditoría automática sin fricción**: toda lectura cross-workspace queda registrada.
4. **Visibilidad dual**: outputs diferenciados para Consultante (resumen público) vs Terapeuta (detalle profesional).
5. **No diagnóstico / No determinismo**: outputs mayéuticos (preguntas, hipótesis), nunca sentencias clínicas.

---

## 1. OBJETIVO

Establecer una **arquitectura federada** que permita la **síntesis holística y transversal** sin comprometer:

- La integridad de cada dominio (no inyección).
- La trazabilidad y auditoría.
- La seguridad y el cumplimiento de políticas de no-diagnóstico.
- La claridad operativa y cognitiva.

---

## 2. PRINCIPIO FUNDAMENTAL (ACTUALIZADO)

> **Cada Workspace es soberano de su información, pero puede compartir artefactos normalizados para síntesis holística.**

### Modelo Anterior (WORKSPACE_ISOLATION_POLICY v1.0):
- ❌ Prohibido compartir datos de forma automática.
- ❌ Prohibido consumir estados vivos de otros Workspaces.
- ✅ Exportación manual explícita (snapshot estático).

### Modelo Actual (HOLISTIC_FEDERATION_POLICY v2.0):
- ✅ **Integridad de dominio**: ningún workspace escribe en otro.
- ✅ **Federación de lectura**: workspaces-hub autorizados (SCDF, SCID-5, MSHE) pueden leer artefactos normalizados.
- ✅ **Auditoría automática**: toda lectura cross-workspace genera registro (quién/cuándo/scope).
- ✅ **Visibilidad dual**: summary_public (consultante) vs summary_pro (terapeuta).
- ❌ **No inyección**: prohibido escribir en otros workspaces o alterar su lógica.

---

## 3. DEFINICIONES CLAVE

### 3.1 Workspace de Dominio (Domain Workspace)

Un workspace **soberano** que contiene:

- Su propio modelo de datos.
- Su propio historial y estado.
- Su propia lógica de transformación.
- Su propia interfaz y contexto semántico.

**Ejemplos:**
- MCMI-4 Místico
- Astrología Profesional
- Resonancia Ancestral
- 72 Ángeles
- Vitalidad Emocional (PHQ-9)
- Anclaje y Alerta (GAD-7)

**Restricción:** un workspace de dominio **no puede escribir** en otro workspace.

---

### 3.2 Federation Hub (Workspace-Hub)

Un workspace **especializado en síntesis** que:

- Lee artefactos normalizados (`AnalysisRecordNormalized`) de múltiples workspaces.
- Genera outputs holísticos transversales.
- **No modifica** los workspaces fuente.
- Cumple estrictamente políticas de no-diagnóstico y visibilidad dual.

**Ejemplos autorizados:**
1. **SCDF** (Structured Clinical Data Formulation) — Formulación holística estructurada.
2. **SCID-5** (Structured Clinical Interview for DSM-5 adapted to Holistic) — Exploración holística estructurada socrática.
3. **MSHE** (Motor de Síntesis Holística Evaluativa) — Síntesis de 6 ejes holísticos con alertas.

**Restricción crítica:** un Federation Hub **nunca escribe** en workspaces de dominio. Solo **lee** artefactos normalizados y **produce** síntesis nuevas.

---

### 3.3 Artefacto Normalizado (AnalysisRecordNormalized)

Un **objeto mínimo estándar** que cualquier workspace puede exponer para federación. Define:

- **subject_user_id** (FK User): sujeto de la exploración.
- **workspace_code** (str): código único del workspace origen (ej. "mcmi4_mystic", "astrology_pro").
- **created_at** (datetime): timestamp de creación.
- **tags** (JSON array): categorías simbólicas (sefirot, ejes, arquetipos).
- **summary_public** (str): resumen simbólico para consultante (no técnico).
- **summary_pro** (str): resumen ampliado para terapeuta (puede incluir refs técnicas).
- **evidence_refs** (JSON array, solo terapeuta): IDs de records subyacentes.

**Validez del artefacto:** un `AnalysisRecordNormalized` es válido **incluso si el workspace está incompleto**. Representa un "snapshot interpretable" en cualquier momento.

---

### 3.4 FederationReadScope

Define el alcance de lectura autorizada para un Federation Hub:

- **subject_user** (FK User): sujeto cuya información se consulta.
- **date_range** (start, end): rango temporal de análisis.
- **included_domains** (array de workspace_codes): qué workspaces incluir.
- **requested_by** (FK User): terapeuta que solicita la síntesis.
- **requested_at** (datetime): timestamp de solicitud.

**Auditoría:** cada `FederationReadScope` genera un registro inmutable.

---

### 3.5 HubFeedSnapshot

Dataset normalizado que consume un Federation Hub:

```python
{
  "scope": {
    "subject_user_id": 18,
    "date_range": {"start": "2025-01-01", "end": "2026-01-20"},
    "included_domains": ["mcmi4_mystic", "astrology_pro", "phq9_vitality"]
  },
  "records": [
    {
      "workspace_code": "mcmi4_mystic",
      "created_at": "2026-01-15T10:30:00Z",
      "tags": ["Yesod", "Límite", "Contención"],
      "summary_public": "Tendencia a estructuras rígidas...",
      "summary_pro": "Pattern 8A (Compulsive) 85/100...",
      "evidence_refs": ["mcmi4_result_123"]
    },
    {
      "workspace_code": "astrology_pro",
      "created_at": "2025-12-10T14:00:00Z",
      "tags": ["Saturno", "Capricornio", "Casa 10"],
      "summary_public": "Anclaje en estructura y responsabilidad...",
      "summary_pro": "Saturno conjunción MC, orbe 2°...",
      "evidence_refs": ["astro_chart_456"]
    }
  ],
  "audit": {
    "requested_by_user_id": 5,
    "requested_at": "2026-01-20T12:00:00Z",
    "federation_hub": "MSHE"
  }
}
```

---

## 4. REGLAS DE FEDERACIÓN (NO NEGOCIABLES)

### 4.1 Integridad de Dominio

✅ **Cada workspace** es soberano de su información.  
❌ **Prohibido** escribir en workspaces ajenos (no inyección, no sincronización).  
✅ **Permitido** leer artefactos normalizados con scope explícito.

---

### 4.2 Autorización de Lectura

✅ **Solo Federation Hubs autorizados** (SCDF, SCID-5, MSHE) pueden leer cross-workspace.  
✅ **Lectura sujeta a FederationReadScope** explícito (sujeto, rango, dominios).  
❌ **Prohibido** acceso ad-hoc o inferencia sin scope.

---

### 4.3 Auditoría Automática

✅ **Toda lectura cross-workspace** genera entrada de auditoría inmutable:
  - Timestamp.
  - Usuario solicitante (terapeuta).
  - Federation Hub consumidor.
  - Scope (sujeto, dominios, rango temporal).

✅ **Sin fricción**: auditoría es automática, no requiere acción manual del terapeuta.

---

### 4.4 Visibilidad Dual

✅ **summary_public**: Solo lenguaje simbólico, educativo, no técnico. Visible para consultante.  
✅ **summary_pro**: Incluye referencias técnicas, scores, IDs. Solo visible para terapeuta.  
✅ **evidence_refs**: Trazabilidad de records subyacentes. Solo terapeuta.

---

### 4.5 No Diagnóstico / No Determinismo

✅ **Outputs de Federation Hubs** son mayéuticos:
  - Preguntas reflexivas.
  - Hipótesis simbólicas.
  - Propuestas de exploración.

❌ **Prohibido** emitir diagnósticos, sentencias clínicas o predicciones deterministas.

---

### 4.6 Consentimiento del Consultante

✅ **Lectura cross-workspace** requiere consentimiento explícito del consultante para síntesis federada.  
✅ **Transparencia**: consultante debe saber qué workspaces alimentan la síntesis.  
✅ **Revocación**: consultante puede excluir workspaces específicos de la federación en cualquier momento.

---

## 5. ARQUITECTURA DE FEDERACIÓN

### 5.1 Capa de Normalización (por workspace)

Cada workspace de dominio expone un **endpoint de federación**:

```
GET /api/federation/normalized-records/?subject_user_id={id}&date_range_start={iso}&date_range_end={iso}
```

**Respuesta:**
```json
[
  {
    "workspace_code": "mcmi4_mystic",
    "created_at": "2026-01-15T10:30:00Z",
    "tags": ["Yesod", "Gevurah"],
    "summary_public": "...",
    "summary_pro": "...",
    "evidence_refs": [...]
  }
]
```

---

### 5.2 Capa de Federación (Federation Hubs)

Federation Hubs consumen múltiples endpoints normalizados:

1. **Solicitud de síntesis** (por terapeuta):
   - Define `FederationReadScope` (sujeto, rango, dominios).
   - Sistema genera `HubFeedSnapshot`.

2. **Generación de síntesis**:
   - Federation Hub procesa `HubFeedSnapshot`.
   - Produce output diferenciado (público/profesional).
   - Genera auditoría automática.

3. **Salida**:
   - **SynthesisResult** (MSHE): 6 ejes holísticos + alertas por color.
   - **FormulationDraft** (SCDF): formulación estructurada preliminar.
   - **SocraticPromptSet** (SCID-5): set de preguntas socráticas para exploración.

---

### 5.3 Capa de Auditoría

Cada lectura cross-workspace genera:

```python
FederationAuditLog(
  timestamp=datetime.utcnow(),
  requested_by_user_id=5,  # terapeuta
  federation_hub="MSHE",
  scope={
    "subject_user_id": 18,
    "date_range": {"start": "2025-01-01", "end": "2026-01-20"},
    "included_domains": ["mcmi4_mystic", "astrology_pro"]
  },
  records_accessed_count=12,
  output_type="SynthesisResult"
)
```

---

## 6. COMPARACIÓN: ANTES vs DESPUÉS

| **Aspecto** | **Modelo Anterior (Aislamiento Absoluto)** | **Modelo Actual (Federación Holística)** |
|------------|-------------------------------------------|------------------------------------------|
| **Compartir datos** | ❌ Prohibido (solo export manual estático) | ✅ Permitido lectura normalizada cross-workspace (hubs autorizados) |
| **Escritura cross-workspace** | ❌ Prohibida | ❌ Prohibida (sin cambio) |
| **Síntesis transversal** | ❌ Imposible (requiere export manual fragmentado) | ✅ Posible (Federation Hubs leen artefactos normalizados) |
| **Auditoría** | ⚠️ Manual (fricción) | ✅ Automática (sin fricción) |
| **Visibilidad** | ⚠️ Mezclada en export | ✅ Dual (public/pro) nativa |
| **No diagnóstico** | ✅ Mantenido | ✅ Mantenido (sin cambio) |
| **Consentimiento** | ⚠️ Implícito en export | ✅ Explícito (consultante autoriza federación) |
| **Ecosistema vivo** | ❌ Bloqueado | ✅ Habilitado (SCDF/SCID-5/MSHE funcionan como diseñados) |

---

## 7. MIGRACIÓN DESDE MODELO ANTERIOR

### 7.1 Documentos Legacy

Los siguientes documentos quedan **SUPERSEDED** por esta política:

- `docs/WORKSPACE_ISOLATION_POLICY.md` → mover a `docs/legacy/2026-01-20_pre-federation/WORKSPACE_ISOLATION_POLICY.md`

**Header a añadir:**
```markdown
---
**LEGACY STATUS:** SUPERSEDED  
**SUPERSEDED BY:** `docs/HOLISTIC_FEDERATION_POLICY.md`  
**REASON:** Transición de aislamiento absoluto a federación holística  
**EFFECTIVE UNTIL:** 2026-01-20  
**ARCHIVED BY:** Arquitectura / Gobernanza  
**DATE ARCHIVED:** 2026-01-20  
---
```

---

### 7.2 Compatibilidad con Código Existente

✅ **Sin breaking changes**: workspaces actuales funcionan sin modificación.  
✅ **Opt-in gradual**: Federation Hubs se implementan en fases (Fase 1–5).  
✅ **Endpoints legacy**: exports manuales siguen disponibles durante transición.

---

## 8. CUMPLIMIENTO Y CONTROL

### 8.1 Reglas de Cumplimiento

✅ **Todo nuevo Federation Hub** debe cumplir `FEDERATION_HUBS_CONTRACT.md`.  
✅ **Todo workspace** debe exponer endpoint normalizado para federación (si aplica).  
❌ **Prohibido** crear lecturas cross-workspace fuera de Federation Hubs autorizados.

---

### 8.2 Violaciones

Las siguientes acciones se consideran **violaciones arquitectónicas**:

- ❌ Escribir en workspace ajeno (inyección).
- ❌ Leer cross-workspace sin `FederationReadScope`.
- ❌ Omitir auditoría de lectura federada.
- ❌ Emitir diagnósticos o sentencias deterministas desde Federation Hubs.
- ❌ Exponer `summary_pro` o `evidence_refs` a consultante.

---

## 9. RELACIÓN CON DOCUMENTOS CANÓNICOS

Este documento es complementario y obligatorio junto a:

- ✅ `FEDERATION_HUBS_CONTRACT.md` — Contratos técnicos para hubs.
- ✅ `SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md` — IA mayéutica y no-diagnóstico.
- ✅ `00_SOURCE_OF_TRUTH.md` — Fuente maestra de gobernanza.
- ✅ `UI_COPY_FREEZE.md` — Terminología holística.
- ✅ `HOLISTIC_EXPLORATION_VISIBILITY.md` — Visibilidad dual.

En caso de conflicto, prevalece:
1. `00_SOURCE_OF_TRUTH.md`
2. Este documento (`HOLISTIC_FEDERATION_POLICY.md`)
3. Documentos específicos de contrato/implementación

---

## 10. PRÓXIMOS PASOS

Ver `HOLISTIC_FEDERATION_ROADMAP.md` para plan de implementación por fases (0–5).

---

**Firmado por:** Arquitectura / Gobernanza  
**Fecha:** 2026-01-20  
**Versión:** 2.0  
**Estado:** ACTIVA
