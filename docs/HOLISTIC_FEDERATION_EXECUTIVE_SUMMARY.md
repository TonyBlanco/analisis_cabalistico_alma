# HOLISTIC_FEDERATION_EXECUTIVE_SUMMARY.md

**Fecha:** 2026-01-20  
**Versión:** 1.0  
**Autoridad:** Arquitectura / Gobernanza  
**Audiencia:** Stakeholders, Comité de Gobernanza, Equipo Técnico

---

## 1. RESUMEN EJECUTIVO

Este documento consolida la **re-fundación de la gobernanza** de la plataforma "Holística Aplicada", transitando desde un modelo de **"Aislamiento Absoluto"** hacia un modelo de **"Federación Holística"** que habilita:

1. **Síntesis transversal** de múltiples exploraciones (SCDF, SCID-5, MSHE).
2. **Ecosistema vivo** con resonancias, diarios simbólicos activos y timeline evolutivo.
3. **Integridad de dominio** preservada (no escritura cross-workspace).
4. **Auditoría automática** sin fricción.
5. **IA Mayéutica** reforzada (preguntas/hipótesis, nunca diagnósticos).

### Estado de Implementación:
- ✅ **Fase 0 (PASO 1): COMPLETADA** — Gobernanza, contratos, roadmap, migración legacy.
- 🔜 **Fase 1–5: PLANIFICADAS** — Implementación técnica gradual (4–12 meses).

---

## 2. DECISIONES DE GOBERNANZA (ANTES → DESPUÉS)

### 2.1 Compartición de Datos

| **Aspecto** | **ANTES (Aislamiento Absoluto)** | **DESPUÉS (Federación Holística)** |
|------------|----------------------------------|-----------------------------------|
| **Compartir datos entre workspaces** | ❌ **Prohibido** — Solo exportación manual estática | ✅ **Permitido** — Lectura federada para hubs autorizados (SCDF/SCID-5/MSHE) |
| **Mecanismo** | Export manual por terapeuta → snapshot estático | Federación automática con `FederationReadScope` explícito |
| **Auditoría** | ⚠️ Manual (fricción) | ✅ Automática e inmutable |

### 2.2 Escritura Cross-Workspace

| **Aspecto** | **ANTES** | **DESPUÉS** |
|------------|----------|-----------|
| **Escribir en workspace ajeno** | ❌ **Prohibido** | ❌ **Prohibido** (SIN CAMBIOS) |

**Conclusión:** La **integridad de dominio se mantiene estricta** — ningún workspace puede modificar otro.

### 2.3 Síntesis Holística

| **Aspecto** | **ANTES** | **DESPUÉS** |
|------------|----------|-----------|
| **SCDF (Formulación)** | ❌ **Bloqueado** — No puede funcionar sin datos transversales | ✅ **Operacional** — Lee artefactos normalizados de múltiples workspaces |
| **SCID-5 (Exploración socrática)** | ❌ **Bloqueado** | ✅ **Operacional** — Genera preguntas desde patrones transversales |
| **MSHE (Síntesis evaluativa)** | ❌ **Bloqueado** | ✅ **Operacional** — Síntesis de 6 ejes con alertas |

### 2.4 Visibilidad y Seguridad

| **Aspecto** | **ANTES** | **DESPUÉS** |
|------------|----------|-----------|
| **Visibilidad dual** | ⚠️ Mezclada en export manual | ✅ **Nativa** — `summary_public` (consultante) vs `summary_pro` (terapeuta) en todos los artefactos |
| **No diagnóstico** | ✅ Mantenido | ✅ **Reforzado** — IA Mayéutica obligatoria (preguntas/hipótesis, no sentencias) |
| **Consentimiento** | ⚠️ Implícito en export | ✅ **Explícito** — Consultante autoriza federación (opt-in) |

### 2.5 Ecosistema Vivo

| **Característica** | **ANTES** | **DESPUÉS** |
|-------------------|----------|-----------|
| **Resonancias** | ❌ No detectadas | ✅ Motor detecta sincronicidades temporales (solo terapeuta) |
| **Co-investigación** | ❌ Pasiva (consultante solo recibe) | ✅ **Activa** — Diarios simbólicos del consultante alimentan feed |
| **Timeline evolutivo** | ❌ No existe | ✅ Tree Evolution Player (película del Árbol de la Vida) |

---

## 3. DOCUMENTOS ENTREGADOS (FASE 0)

### A) HOLISTIC_FEDERATION_POLICY.md (v2.0)

**Ubicación:** `docs/HOLISTIC_FEDERATION_POLICY.md`

**Contenido:**
- Define **Integridad de Dominio** + **Federación de Lectura**.
- Autoriza **Federation Hubs**: SCDF, SCID-5, MSHE.
- Reglas de **auditoría automática** sin fricción.
- **Visibilidad dual** obligatoria (public/pro).
- **No diagnóstico / No determinismo** mantenidos.
- Comparación ANTES vs DESPUÉS.

**Impacto:**
- ✅ Reemplaza `WORKSPACE_ISOLATION_POLICY.md` (v1.0).
- ✅ Habilita síntesis transversal sin comprometer integridad.
- ✅ Base normativa para Fases 1-5.

---

### B) FEDERATION_HUBS_CONTRACT.md (v1.0)

**Ubicación:** `docs/FEDERATION_HUBS_CONTRACT.md`

**Contenido:**
- **Objetos normalizados**:
  - `AnalysisRecordNormalized`: artefacto mínimo estándar por workspace.
  - `FederationReadScope`: alcance explícito de lectura.
  - `HubFeedSnapshot`: dataset consumido por hubs.
  - `FederationAuditLog`: auditoría inmutable.
- **Outputs de hubs**:
  - `SynthesisResult` (MSHE): 6 ejes holísticos + alertas.
  - `FormulationDraft` (SCDF): formulación estructurada preliminar.
  - `SocraticPromptSet` (SCID-5): preguntas mayéuticas.
- **Endpoints**:
  - `/api/<workspace>/federation/normalized-records/` (por workspace).
  - `/api/mshe/synthesize/` (MSHE).
  - `/api/scdf/formulate/` (SCDF).
  - `/api/scid5_holistic/generate-prompts/` (SCID-5).
- **Reglas de seguridad**:
  - Auth: solo terapeuta con asignación activa.
  - Consentimiento: consultante autoriza explícitamente.
  - Auditoría: logs inmutables obligatorios.

**Impacto:**
- ✅ Define contratos técnicos vinculantes para implementación.
- ✅ Garantiza interoperabilidad entre workspaces y hubs.
- ✅ Base para tests de compliance (no-diagnóstico, auditoría).

---

### C) SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md

**Ubicación:** `docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md`

**Contenido:**
- **IA Mayéutica obligatoria**:
  - Usar: "¿Podría ser...?", "¿Has notado...?", "Hipótesis: podría indicar...".
  - Prohibir: "Tienes [diagnóstico]", "Esto confirma...", "Debes hacer...".
- **Soporte de federación**:
  - Reglas para Federation Hubs (lectura cross-workspace autorizada).
  - Auditoría automática en outputs.
  - Trazabilidad: incluir número de records, dominios, timestamp.
- **Visibilidad dual nativa**:
  - `summary_public`: lenguaje simbólico, no técnico.
  - `summary_pro`: puede incluir scores, IDs, acrónimos clínicos interpretados.
- **Ejemplos completos**:
  - Output MSHE para consultante vs terapeuta.
  - Transformación clínico → mayéutico.
- **Checklist de cumplimiento** para outputs (consultante/terapeuta/hubs).

**Impacto:**
- ✅ Reemplaza v1.0 (sin breaking changes — v1.0 sigue válida para workspaces no-federados).
- ✅ Garantiza outputs no-diagnósticos en síntesis federadas.
- ✅ Base para prompts de GPT-4/Gemini en MSHE/SCDF/SCID-5.

---

### D) LEGACY_MIGRATION_PLAN.md

**Ubicación:** `docs/LEGACY_MIGRATION_PLAN.md`

**Contenido:**
- **Documentos a migrar**:
  - `WORKSPACE_ISOLATION_POLICY.md` → `docs/legacy/2026-01-20_pre-federation/`
  - `SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md` (v1.0) → `docs/legacy/2026-01-20_pre-federation/`
- **Headers de trazabilidad** (plantillas):
  - LEGACY STATUS: SUPERSEDED
  - SUPERSEDED BY: [documento nuevo]
  - REASON: [razón del cambio]
  - EFFECTIVE UNTIL: 2026-01-20
  - Contexto histórico y qué se mantiene/cambia.
- **Procedimiento paso a paso**:
  - Crear directorio legacy.
  - Mover documentos con headers.
  - Actualizar `00_SOURCE_OF_TRUTH.md` y `DOCUMENT_INDEX.md`.
  - Commit con mensaje descriptivo y tag.
- **Plantilla de comunicación** a stakeholders.

**Impacto:**
- ✅ Preserva trazabilidad histórica.
- ✅ Clarifica qué documentos están vigentes vs legacy.
- ✅ Facilita onboarding de nuevos miembros del equipo.

---

### E) HOLISTIC_FEDERATION_ROADMAP.md

**Ubicación:** `docs/HOLISTIC_FEDERATION_ROADMAP.md`

**Contenido:**

#### Fase 0: Gobernanza y Contratos (✅ COMPLETADA)
- Duración: 1 día (2026-01-20)
- Entregables: docs A, B, C, D, E (este roadmap)
- Sin cambios de código

#### Fase 1: Meta-Layer Federado (🔜 PRÓXIMA)
- Duración: 4-6 semanas
- **Alcance:**
  - Endpoints de normalización en 5 workspaces (MCMI-4, Astrología, PHQ-9, GAD-7, BDI).
  - Modelos `FederationReadScope`, `FederationAuditLog`.
  - Servicio `HubFeedBuilder`.
  - MSHE operacional (`/api/mshe/synthesize/`).
- **Criterios de aceptación:**
  - 5 workspaces exponen endpoints.
  - MSHE retorna `SynthesisResult` válido.
  - Auditoría genera logs inmutables.
  - UI terapeuta muestra síntesis con trazabilidad.
  - UI consultante ve solo `summary_public`.

#### Fase 2: Meta-Motor de Resonancia (📅 PLANIFICADA)
- Duración: 6-8 semanas
- **Alcance:**
  - `HolisticResonanceEngine`: detecta sincronicidades temporales.
  - Modelo `ResonanceHypothesis`.
  - UI terapeuta: panel de resonancias (visible solo para terapeuta).
- **Ejemplos:**
  - Sincronicidad: pico de Pattern 8A (MCMI-4) coincide con tránsito saturnino (Astrología).
  - Patrón recurrente: tag "Gevurah" aparece en 3+ exploraciones en 1 mes.

#### Fase 3: Co-Investigador (Diarios Simbólicos) (📅 PLANIFICADA)
- Duración: 8-10 semanas
- **Alcance:**
  - `SymbolicJournal`: diario donde consultante registra reflexiones.
  - `SymbolicTagExtractor` (IA): extrae tags simbólicos de texto libre.
  - UI consultante: input libre + toggle "Compartir con terapeuta".
  - Diario alimenta feed federado.

#### Fase 4: Timeline Dinámico (Tree Evolution Player) (📅 PLANIFICADA)
- Duración: 6-8 semanas
- **Alcance:**
  - `TreeEvolutionSnapshot`: estado del Árbol de la Vida en momento dado.
  - `TreeEvolutionPlayer`: genera serie temporal (película evolutiva).
  - UI: timeline interactiva con animación del Árbol.
  - `EvolutionInsightGenerator`: detecta tendencias, regresiones, ciclos.

#### Fase 5: IA Socrática (SCDF + SCID-5) (📅 PLANIFICADA)
- Duración: 8-12 semanas
- **Alcance:**
  - SCDF operacional: `/api/scdf/formulate/` → `FormulationDraft`.
  - SCID-5 operacional: `/api/scid5_holistic/generate-prompts/` → `SocraticPromptSet`.
  - UI terapeuta: formulación editable + validación.
  - UI terapeuta: generador de preguntas socráticas calibradas.
  - `ExplanationTrace` visible en todos los outputs IA.

**Impacto:**
- ✅ Plan claro para 4–12 meses de implementación.
- ✅ Sin breaking changes (opt-in gradual).
- ✅ Criterios de aceptación por fase.
- ✅ Gestión de riesgos y mitigaciones.

---

## 4. LISTA DE ARCHIVOS LEGACY A MOVER

| **Archivo Origen** | **Destino Legacy** | **Razón** | **Header LEGACY** |
|-------------------|-------------------|----------|------------------|
| `docs/WORKSPACE_ISOLATION_POLICY.md` | `docs/legacy/2026-01-20_pre-federation/WORKSPACE_ISOLATION_POLICY.md` | Superseded por HOLISTIC_FEDERATION_POLICY.md (v2.0) | ✅ Añadir header con STATUS: SUPERSEDED, SUPERSEDED BY, REASON, contexto histórico |
| `docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md` | `docs/legacy/2026-01-20_pre-federation/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v1.md` | Superseded por v2.0 (con soporte de federación) | ✅ Añadir header con STATUS: SUPERSEDED, SUPERSEDED BY, qué añade v2.0 |

**Plantilla de header LEGACY** (ver `LEGACY_MIGRATION_PLAN.md` para contenido completo):

```markdown
---
**LEGACY STATUS:** SUPERSEDED  
**SUPERSEDED BY:** [documento nuevo]  
**REASON:** [razón del cambio]  
**EFFECTIVE UNTIL:** 2026-01-20  
**ARCHIVED BY:** Arquitectura / Gobernanza  
**DATE ARCHIVED:** 2026-01-20  

**Contexto histórico:** [por qué existió este documento]
**¿Por qué se reemplaza?** [qué problema tenía]
**¿Qué se mantiene?** [continuidades]
**¿Qué cambia?** [mejoras]

**Referencia:** Ver [documento nuevo] para el modelo actual.
---
```

---

## 5. ROADMAP POR FASES (SÍNTESIS)

| **Fase** | **Duración** | **Alcance Principal** | **Criterio de Éxito Clave** | **Estado** |
|---------|-------------|----------------------|---------------------------|----------|
| **Fase 0** | 1 día | Gobernanza + Contratos + Roadmap | ✅ 5 documentos creados y aprobados | ✅ **COMPLETADA** |
| **Fase 1** | 4-6 sem | Meta-Layer Federado + MSHE | ✅ MSHE operacional con auditoría | 🔜 **PRÓXIMA** |
| **Fase 2** | 6-8 sem | Motor de Resonancia | ✅ Detección de sincronicidades (3+ tipos) | 📅 **PLANIFICADA** |
| **Fase 3** | 8-10 sem | Co-Investigador (Diarios) | ✅ Diarios simbólicos alimentan feed | 📅 **PLANIFICADA** |
| **Fase 4** | 6-8 sem | Timeline Dinámico (Tree Player) | ✅ Película evolutiva del Árbol | 📅 **PLANIFICADA** |
| **Fase 5** | 8-12 sem | IA Socrática (SCDF + SCID-5) | ✅ Formulación + Preguntas mayéuticas operacionales | 📅 **PLANIFICADA** |

**Total estimado:** 4–12 meses (Fase 1–5)

---

## 6. CRITERIOS DE ACEPTACIÓN GLOBALES (POST-FASE 5)

Al finalizar Fase 5, el sistema debe cumplir:

1. ✅ **MSHE operacional** generando síntesis de 6 ejes holísticos con alertas por color.
2. ✅ **SCDF generando formulaciones** estructuradas preliminares validables por terapeuta.
3. ✅ **SCID-5 generando preguntas** socráticas calibradas (depth_level 1-3).
4. ✅ **Motor de resonancia** detectando sincronicidades temporales y patrones recurrentes.
5. ✅ **Diarios simbólicos activos** (consultante co-investiga, input alimenta feed).
6. ✅ **Tree Evolution Player** mostrando "película" del Árbol de la Vida con insights evolutivos.
7. ✅ **Auditoría automática** sin fricción (logs inmutables, compliance garantizado).
8. ✅ **No diagnóstico** mantenido (IA Mayéutica verificada en 100% de outputs).
9. ✅ **Visibilidad dual** nativa (public/pro) en todos los artefactos.
10. ✅ **Integridad de dominio** preservada (0 escrituras cross-workspace no autorizadas).

---

## 7. COMPARACIÓN: ESTADO ACTUAL vs ESTADO OBJETIVO

| **Dimensión** | **Estado Actual (Pre-Federación)** | **Estado Objetivo (Post-Fase 5)** |
|--------------|-----------------------------------|----------------------------------|
| **Síntesis holística** | ❌ Imposible (manual, fragmentada) | ✅ Automática y transversal (MSHE/SCDF/SCID-5) |
| **Resonancias** | ❌ No detectadas | ✅ Motor detecta y alerta (solo terapeuta) |
| **Co-investigación** | ❌ Pasiva (consultante solo consume) | ✅ Activa (diarios simbólicos aportan datos) |
| **Timeline evolutivo** | ❌ No existe | ✅ Tree Evolution Player (película del Árbol) |
| **Auditoría** | ⚠️ Manual (fricción) | ✅ Automática (sin fricción, inmutable) |
| **Visibilidad dual** | ⚠️ Mezclada en export manual | ✅ Nativa en todos los artefactos |
| **No diagnóstico** | ✅ Mantenido | ✅ Reforzado (IA Mayéutica obligatoria) |
| **Integridad** | ✅ Preservada | ✅ Preservada (sin cambios) |
| **Ecosistema vivo** | ❌ Bloqueado | ✅ **Habilitado** |

---

## 8. IMPACTO Y BENEFICIOS

### Para el Consultante:
- ✅ **Síntesis holística coherente** de múltiples exploraciones (sin tecnicismos).
- ✅ **Co-investigación activa** mediante diarios simbólicos.
- ✅ **Timeline evolutivo** visible (su propia "película" del Árbol de la Vida).
- ✅ **Transparencia** sobre qué workspaces alimentan la síntesis (consentimiento explícito).

### Para el Terapeuta:
- ✅ **Formulación estructurada** preliminar (SCDF) como borrador validable.
- ✅ **Preguntas socráticas** generadas automáticamente (SCID-5) para exploración en sesión.
- ✅ **Detección de resonancias** (sincronicidades, patrones recurrentes) que podrían pasar desapercibidos.
- ✅ **Síntesis evaluativa** de 6 ejes (MSHE) con alertas por color.
- ✅ **Auditoría automática** (compliance sin esfuerzo adicional).

### Para el Ecosistema:
- ✅ **Workspaces-hub operacionales** (SCDF/SCID-5/MSHE desbloqueados).
- ✅ **Ecosistema vivo** que evoluciona con cada interacción.
- ✅ **Integridad arquitectónica** preservada (no escritura cross-workspace).
- ✅ **Escalabilidad** para nuevos workspaces (solo necesitan endpoint de normalización).

---

## 9. RIESGOS Y MITIGACIONES

### Riesgo 1: Resistencia organizacional al cambio
- **Probabilidad:** Media
- **Impacto:** Alto (bloqueo de aprobación de Fase 0)
- **Mitigación:** Comunicación clara de beneficios, garantías de integridad, comparación ANTES vs DESPUÉS.

### Riesgo 2: Complejidad técnica de agregación (Fase 1)
- **Probabilidad:** Media
- **Impacto:** Medio (delays en Fase 1)
- **Mitigación:** Caché de artefactos (TTL 5 min), procesamiento asíncrono (Celery), límites (máx 100 records/workspace).

### Riesgo 3: Calidad de outputs IA (Fases 2-5)
- **Probabilidad:** Media-Alta
- **Impacto:** Alto (riesgo de diagnósticos involuntarios)
- **Mitigación:** System Prompt v2.0 estricto, revisión humana obligatoria, tests de compliance automatizados.

### Riesgo 4: Sobrecarga cognitiva del terapeuta (Fases 2-5)
- **Probabilidad:** Media
- **Impacto:** Medio (fatiga, resistencia)
- **Mitigación:** Filtros ajustables (confidence_level), priorización por relevancia, onboarding gradual.

### Riesgo 5: Privacidad y consentimiento (Fase 3)
- **Probabilidad:** Baja
- **Impacto:** Alto (compliance/legal)
- **Mitigación:** Consentimiento explícito obligatorio, toggle "Compartir con terapeuta", auditoría inmutable.

---

## 10. PRÓXIMOS PASOS INMEDIATOS

### Paso 1: Aprobación Formal de Fase 0
- **Responsable:** Comité de Gobernanza
- **Acción:** Revisar y aprobar los 5 documentos entregados (A-E).
- **Plazo:** 2026-01-21

### Paso 2: Ejecución de Migración Legacy
- **Responsable:** Arquitectura
- **Acción:** Ejecutar `LEGACY_MIGRATION_PLAN.md` (mover docs, añadir headers, actualizar índices).
- **Plazo:** 2026-01-21

### Paso 3: Comunicación a Stakeholders
- **Responsable:** Product Owner / Arquitectura
- **Acción:** Enviar email/Slack con plantilla de `LEGACY_MIGRATION_PLAN.md`.
- **Plazo:** 2026-01-22

### Paso 4: Kickoff Técnico de Fase 1
- **Responsable:** Tech Lead
- **Acción:**
  - Asignar equipo (backend, frontend, IA/prompts).
  - Setup de infra (Redis cache, Celery).
  - Plan de testing (unitarios, integración, compliance).
- **Plazo:** 2026-01-27 (semana siguiente)

### Paso 5: Sprint Planning Fase 1
- **Responsable:** Scrum Master / Tech Lead
- **Acción:** Descomponer Fase 1 en sprints (2 semanas c/u, estimado 2-3 sprints).
- **Plazo:** 2026-01-27

---

## 11. CONTACTO Y REFERENCIAS

**Para consultas sobre gobernanza:**
- Arquitectura / Gobernanza
- [email/slack TBD]

**Documentos relacionados:**
- `docs/HOLISTIC_FEDERATION_POLICY.md` — Política completa (v2.0)
- `docs/FEDERATION_HUBS_CONTRACT.md` — Contratos técnicos
- `docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md` — System Prompt IA
- `docs/HOLISTIC_FEDERATION_ROADMAP.md` — Roadmap detallado (Fases 0-5)
- `docs/LEGACY_MIGRATION_PLAN.md` — Plan de migración legacy
- `docs/00_SOURCE_OF_TRUTH.md` — Fuente maestra de gobernanza

**Tags Git:**
- `governance/federation-v2.0` — Marca la aprobación de Fase 0

---

**Fin del resumen ejecutivo.**  
**Firmado por:** Arquitectura / Gobernanza  
**Fecha:** 2026-01-20  
**Versión:** 1.0
