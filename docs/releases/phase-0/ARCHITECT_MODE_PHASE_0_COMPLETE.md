# ARCHITECT_MODE: HOLISTIC FEDERATION — FASE 0 COMPLETADA

**Fecha:** 2026-01-20  
**Modo:** ARCHITECT_MODE (AGENTE_ARQ)  
**Fase:** 0 (Gobernanza y Contratos)  
**Estado:** ✅ **COMPLETADA**

---

## RESUMEN EJECUTIVO

Se ha completado la **re-fundación de la gobernanza** de la plataforma "Holística Aplicada", transitando desde **"Aislamiento Absoluto"** hacia **"Federación Holística"**.

### Objetivo Alcanzado:
✅ Permitir **síntesis transversal** (SCDF, SCID-5, MSHE) sin comprometer **integridad de dominio**.

### Cambios Clave:
1. ✅ **Integridad preservada**: Ningún workspace escribe en otro (sin cambios).
2. ✅ **Federación autorizada**: Workspaces-hub leen artefactos normalizados.
3. ✅ **Auditoría automática**: Sin fricción, logs inmutables.
4. ✅ **IA Mayéutica**: Preguntas/hipótesis, nunca diagnósticos.
5. ✅ **Visibilidad dual nativa**: public/pro en todos los artefactos.

---

## ENTREGABLES (PASO 1)

### A) docs/HOLISTIC_FEDERATION_POLICY.md (v2.0)
**✅ CREADO** — Política completa de federación holística.

**Contenido clave:**
- Principio fundamental: Integridad de dominio + Federación de lectura.
- Definiciones: Domain Workspace, Federation Hub, AnalysisRecordNormalized.
- Reglas de federación (6 NO NEGOCIABLES).
- Arquitectura de federación (normalización, hubs, auditoría).
- Comparación ANTES vs DESPUÉS.
- Migración desde modelo anterior.

---

### B) docs/FEDERATION_HUBS_CONTRACT.md (v1.0)
**✅ CREADO** — Contratos técnicos para Federation Hubs.

**Contenido clave:**
- **Objetos de datos normalizados**:
  - `AnalysisRecordNormalized` (artefacto mínimo estándar)
  - `FederationReadScope` (alcance de lectura)
  - `HubFeedSnapshot` (dataset para síntesis)
  - `FederationAuditLog` (auditoría inmutable)
- **Outputs de hubs**:
  - `SynthesisResult` (MSHE): 6 ejes + alertas
  - `FormulationDraft` (SCDF): formulación estructurada
  - `SocraticPromptSet` (SCID-5): preguntas mayéuticas
- **Endpoints de federación** (specs completos)
- **Reglas de seguridad** (auth, consentimiento, auditoría, visibilidad, no-diagnóstico)
- **Ejemplo completo de flujo** (terapeuta solicita síntesis MSHE)

---

### C) docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md
**✅ CREADO** — System Prompt actualizado con soporte de federación.

**Contenido clave:**
- **Cambios en v2.0**:
  - Federación de lectura autorizada (hubs).
  - IA Mayéutica obligatoria (sección 5).
  - Reglas de auditoría para hubs.
  - ExplanationTrace en outputs.
- **IA Mayéutica (NUEVO)**:
  - Reglas obligatorias: usar preguntas, hipótesis, propuestas.
  - Prohibido: sentencias, diagnósticos, predicciones.
  - Ejemplos de transformación clínico → mayéutico.
- **Política de Federación (sección 4)**:
  - Integridad de dominio (sin cambios).
  - Federación autorizada (solo hubs).
  - Auditoría automática.
- **Ejemplo completo** de síntesis MSHE (consultante vs terapeuta).
- **Checklist de cumplimiento** (3 modos: consultante/terapeuta/hubs).

---

### D) docs/LEGACY_MIGRATION_PLAN.md
**✅ CREADO** — Plan de migración de documentos legacy.

**Contenido clave:**
- **Documentos a migrar**:
  1. `WORKSPACE_ISOLATION_POLICY.md` → `docs/legacy/2026-01-20_pre-federation/`
  2. `SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md` (v1.0) → legacy
- **Headers de trazabilidad** (plantillas completas):
  - LEGACY STATUS: SUPERSEDED
  - SUPERSEDED BY, REASON, EFFECTIVE UNTIL
  - Contexto histórico, qué se mantiene/cambia
- **Procedimiento paso a paso**:
  - Crear directorio legacy
  - Mover documentos con headers
  - Actualizar `00_SOURCE_OF_TRUTH.md` y `DOCUMENT_INDEX.md`
  - Commit con mensaje descriptivo + tag
- **Checklist de verificación**
- **Plantilla de comunicación** a stakeholders

---

### E) docs/HOLISTIC_FEDERATION_ROADMAP.md
**✅ CREADO** — Roadmap completo de implementación (Fases 0-5).

**Contenido clave:**

#### Fase 0: Gobernanza + Contratos (✅ COMPLETADA)
- Duración: 1 día
- Entregables: docs A, B, C, D, E
- Sin cambios de código

#### Fase 1: Meta-Layer Federado + MSHE (🔜 PRÓXIMA)
- Duración: 4-6 semanas
- Alcance: Endpoints normalizados (5 workspaces), MSHE operacional
- Criterios: 5 endpoints, síntesis válida, auditoría automática, UI dual

#### Fase 2: Motor de Resonancia (📅 PLANIFICADA)
- Duración: 6-8 semanas
- Alcance: `HolisticResonanceEngine`, detección de sincronicidades
- Ejemplos: Sincronicidad temporal, patrón recurrente, transición abrupta

#### Fase 3: Co-Investigador (Diarios Simbólicos) (📅 PLANIFICADA)
- Duración: 8-10 semanas
- Alcance: `SymbolicJournal`, extracción automática de tags (IA)
- UI consultante: input libre + toggle compartir

#### Fase 4: Timeline Dinámico (Tree Evolution Player) (📅 PLANIFICADA)
- Duración: 6-8 semanas
- Alcance: `TreeEvolutionSnapshot`, película evolutiva del Árbol
- UI: timeline interactiva con animación

#### Fase 5: IA Socrática (SCDF + SCID-5) (📅 PLANIFICADA)
- Duración: 8-12 semanas
- Alcance: SCDF formulación, SCID-5 preguntas mayéuticas
- UI terapeuta: formulación editable, generador de preguntas

**Total estimado:** 4-12 meses (Fase 1-5)

---

### F) docs/HOLISTIC_FEDERATION_EXECUTIVE_SUMMARY.md
**✅ CREADO** — Resumen ejecutivo consolidado.

**Contenido clave:**
- Resumen de decisiones de gobernanza (ANTES vs DESPUÉS)
- Síntesis de los 5 documentos entregados
- Lista de archivos legacy a mover
- Roadmap por fases (tabla síntesis)
- Criterios de aceptación globales (post-Fase 5)
- Comparación estado actual vs objetivo
- Impacto y beneficios (consultante/terapeuta/ecosistema)
- Riesgos y mitigaciones
- Próximos pasos inmediatos

---

## DECISIONES DE GOBERNANZA: ANTES → DESPUÉS

### 1. Compartir Datos entre Workspaces
- **ANTES:** ❌ Prohibido (solo export manual estático)
- **DESPUÉS:** ✅ Permitido para hubs autorizados (SCDF/SCID-5/MSHE)

### 2. Escritura Cross-Workspace
- **ANTES:** ❌ Prohibido
- **DESPUÉS:** ❌ Prohibido (**SIN CAMBIOS**)

### 3. Síntesis Holística
- **ANTES:** ❌ Bloqueada (SCDF/SCID-5/MSHE no podían funcionar)
- **DESPUÉS:** ✅ Operacional (lectura federada autorizada)

### 4. Auditoría
- **ANTES:** ⚠️ Manual (fricción)
- **DESPUÉS:** ✅ Automática (sin fricción, inmutable)

### 5. Visibilidad Dual
- **ANTES:** ⚠️ Mezclada en export manual
- **DESPUÉS:** ✅ Nativa (public/pro) en todos los artefactos

### 6. No Diagnóstico
- **ANTES:** ✅ Mantenido
- **DESPUÉS:** ✅ **Reforzado** (IA Mayéutica obligatoria)

### 7. Ecosistema Vivo
- **ANTES:** ❌ Bloqueado
- **DESPUÉS:** ✅ **Habilitado** (resonancias, diarios, timeline)

---

## ARCHIVOS LEGACY A MOVER

### 1. WORKSPACE_ISOLATION_POLICY.md
**Origen:** `docs/WORKSPACE_ISOLATION_POLICY.md`  
**Destino:** `docs/legacy/2026-01-20_pre-federation/WORKSPACE_ISOLATION_POLICY.md`  
**Razón:** Superseded por `HOLISTIC_FEDERATION_POLICY.md` (v2.0)  
**Header:** ✅ Plantilla completa en `LEGACY_MIGRATION_PLAN.md`

### 2. SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md (v1.0)
**Origen:** `docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md`  
**Destino:** `docs/legacy/2026-01-20_pre-federation/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v1.md`  
**Razón:** Superseded por v2.0 (con soporte de federación y IA Mayéutica)  
**Header:** ✅ Plantilla completa en `LEGACY_MIGRATION_PLAN.md`

---

## ROADMAP POR FASES (SÍNTESIS)

| Fase | Duración | Alcance Principal | Estado |
|------|----------|-------------------|--------|
| **0** | 1 día | Gobernanza + Contratos | ✅ **COMPLETADA** |
| **1** | 4-6 sem | Meta-Layer Federado + MSHE | 🔜 **PRÓXIMA** |
| **2** | 6-8 sem | Motor de Resonancia | 📅 **PLANIFICADA** |
| **3** | 8-10 sem | Co-Investigador (Diarios) | 📅 **PLANIFICADA** |
| **4** | 6-8 sem | Timeline Dinámico (Tree Player) | 📅 **PLANIFICADA** |
| **5** | 8-12 sem | IA Socrática (SCDF + SCID-5) | 📅 **PLANIFICADA** |

**Total estimado:** 4–12 meses (Fase 1-5)

---

## CRITERIOS DE ACEPTACIÓN GLOBALES (POST-FASE 5)

Al finalizar Fase 5, el sistema debe cumplir:

1. ✅ MSHE operacional (síntesis de 6 ejes + alertas)
2. ✅ SCDF generando formulaciones estructuradas
3. ✅ SCID-5 generando preguntas socráticas
4. ✅ Motor de resonancia detectando sincronicidades
5. ✅ Diarios simbólicos activos (consultante co-investiga)
6. ✅ Tree Evolution Player (película del Árbol)
7. ✅ Auditoría automática sin fricción
8. ✅ No diagnóstico mantenido (IA Mayéutica verificada)
9. ✅ Visibilidad dual nativa (public/pro)
10. ✅ Integridad de dominio preservada (0 escrituras cross-workspace)

---

## PRÓXIMOS PASOS INMEDIATOS

### 1. Aprobación Formal (Fase 0)
- **Responsable:** Comité de Gobernanza
- **Acción:** Revisar y aprobar documentos A-F
- **Plazo:** 2026-01-21

### 2. Ejecución de Migración Legacy
- **Responsable:** Arquitectura
- **Acción:** Ejecutar `LEGACY_MIGRATION_PLAN.md`
- **Plazo:** 2026-01-21

### 3. Comunicación a Stakeholders
- **Responsable:** Product Owner / Arquitectura
- **Acción:** Enviar email/Slack (plantilla en migration plan)
- **Plazo:** 2026-01-22

### 4. Kickoff Técnico Fase 1
- **Responsable:** Tech Lead
- **Acción:** Asignar equipo, setup infra, plan de testing
- **Plazo:** 2026-01-27

### 5. Sprint Planning Fase 1
- **Responsable:** Scrum Master
- **Acción:** Descomponer Fase 1 en sprints (2-3 sprints)
- **Plazo:** 2026-01-27

---

## ARCHIVOS CREADOS (ESTRUCTURA)

```
docs/
├── HOLISTIC_FEDERATION_POLICY.md (v2.0) ← A
├── FEDERATION_HUBS_CONTRACT.md (v1.0) ← B
├── HOLISTIC_FEDERATION_ROADMAP.md ← E
├── HOLISTIC_FEDERATION_EXECUTIVE_SUMMARY.md ← F
├── LEGACY_MIGRATION_PLAN.md ← D
├── prompts/
│   └── SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md ← C
└── legacy/
    └── 2026-01-20_pre-federation/
        ├── (pendiente) WORKSPACE_ISOLATION_POLICY.md
        └── (pendiente) SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v1.md
```

---

## RESUMEN DE MEJORAS ESTRATÉGICAS INTEGRADAS

Las 4 mejoras estratégicas solicitadas están integradas en las fases del roadmap:

### 1. Meta-Layer Federado (Fase 1)
**HubFeedSnapshot read-only + auditoría**
- Permite a MSHE leer transversalmente sin escribir
- Auditoría automática de toda lectura
- Alimenta MSHE primero (síntesis de 6 ejes)

### 2. Meta-Motor de Resonancia (Fase 2)
**HolisticResonanceEngine**
- Detecta sincronicidades temporales entre workspaces
- Genera `ResonanceHypothesis` con confidence_level
- Produce `ResonanceAlert` (solo terapeuta, no escribe en workspaces)
- 3 tipos: temporal_sync, pattern_recurrence, abrupt_transition

### 3. Co-Investigador (Fase 3)
**Diarios simbólicos activos**
- Consultante aporta input (texto libre, sin tecnicismos)
- IA extrae tags simbólicos automáticamente
- Alimenta el feed federado (workspace `symbolic_journal`)
- Toggle "Compartir con terapeuta" (consentimiento explícito)

### 4. Timeline Dinámico (Fase 4)
**TreeEvolutionPlayer**
- Genera serie temporal de `TreeEvolutionSnapshot` (estado del Árbol por período)
- UI: animación del Árbol de la Vida evolucionando mes a mes
- `EvolutionInsightGenerator`: detecta tendencias, regresiones, ciclos
- "Película evolutiva" con marcadores de eventos significativos

### 5. IA Socrática (Fase 5)
**Ajuste del guardián + prompts**
- System Prompt v2.0 con IA Mayéutica obligatoria
- SCID-5 genera preguntas reflexivas (depth_level 1-3)
- SCDF genera formulaciones preliminares (hipótesis, no certezas)
- ExplanationTrace visible en UI (trazabilidad completa)

---

## RESTRICCIONES CUMPLIDAS (PASO 1)

✅ **NO modificar código ni DB** — Fase 0 solo documentación y arquitectura.  
✅ **NO crear endpoints ni migraciones** — Implementación en Fases 1-5.  
✅ **NO rediseñar UI** — Specs de UI incluidas en roadmap, ejecución en Fases 1-5.  
✅ **Solo docs, contratos, plan por fases, transición legacy** — Completado.

---

## FORMATO DE SALIDA OBLIGATORIO: CUMPLIDO

1. ✅ **Resumen ejecutivo** — Ver `HOLISTIC_FEDERATION_EXECUTIVE_SUMMARY.md`
2. ✅ **Decisiones de gobernanza (ANTES → DESPUÉS)** — Sección "Decisiones de Gobernanza" en este doc y Executive Summary
3. ✅ **Contenido completo de A, B, C (Markdown)** — Documentos completos creados
4. ✅ **Lista de archivos legacy a mover (origen → destino) + headers** — Ver `LEGACY_MIGRATION_PLAN.md`
5. ✅ **Roadmap por fases con criterios de aceptación por fase** — Ver `HOLISTIC_FEDERATION_ROADMAP.md`

---

## FIRMADO

**Arquitectura / Gobernanza**  
**Fecha:** 2026-01-20  
**Fase:** 0 — COMPLETADA  
**Modo:** ARCHITECT_MODE (AGENTE_ARQ)

---

**Pendiente:**
- [ ] Aprobación formal del Comité de Gobernanza
- [ ] Ejecución de migración legacy (mover archivos, añadir headers)
- [ ] Actualización de `00_SOURCE_OF_TRUTH.md` y `DOCUMENT_INDEX.md`
- [ ] Comunicación a stakeholders
- [ ] Kickoff técnico Fase 1

**Estado:** ✅ **FASE 0 COMPLETADA — LISTA PARA APROBACIÓN**
