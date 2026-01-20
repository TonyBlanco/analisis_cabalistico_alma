# ARCHITECT_MODE: FASE 0.1 — CIERRE OPERACIONAL (PATCHES NORMATIVOS)

**Fecha:** 2026-01-20  
**Modo:** ARCHITECT_MODE (AGENTE_ARQ)  
**Fase:** 0.1 (Cierre Operacional — Solo Documentación)  
**Objetivo:** Eliminar contradicciones normativas bloqueantes entre política de federación y documentos legacy.

---

## RESUMEN EJECUTIVO

La Fase 0 creó la política de **Federación Holística**, pero documentos normativos existentes siguen bloqueando su aplicación al prohibir **absolutamente** toda lectura cross-workspace.

**Contradicciones detectadas:**
1. **WORKSPACE_EXPORT_CONTRACT.md** — Prohibe "vínculo vivo" sin distinguir entre inyección (prohibida) y lectura federada (autorizada para hubs).
2. **AGENT_ONBOARDING_README.md** — Regla "Prohibido sincronizar workspaces" es absoluta, sin excepción para Federation Hubs.
3. **PR_WORKSPACE_GOVERNANCE_CHECKLIST.md** — Pregunta "¿No introduce lectura cruzada implícita?" bloquea toda lectura cross-workspace, incluso federada autorizada.
4. **00_SOURCE_OF_TRUTH.md + DOCUMENT_INDEX.md** — No referencian HOLISTIC_FEDERATION_POLICY.md como norma vigente.
5. **Docs legacy** — No migrados ni etiquetados como SUPERSEDED.

**Solución (Fase 0.1):**
Parchear 5 documentos normativos para alinearlos con la nueva política, manteniendo:
- ✅ **No-escritura cross-workspace** (sin cambios).
- ✅ **Auditoría automática** obligatoria.
- ✅ **No-diagnóstico** y tono mayéutico.
- ✅ **Restricción:** Solo documentación (sin código, DB, endpoints).

---

## ORDEN DE APLICACIÓN (CRÍTICO)

Aplicar patches en este orden para evitar desalineación:

1. **B) AGENT_ONBOARDING_README.md** — Actualizar reglas para agentes.
2. **C) PR_WORKSPACE_GOVERNANCE_CHECKLIST.md** — Actualizar checklist para revisores.
3. **A) WORKSPACE_EXPORT_CONTRACT.md** — Distinguir exportación manual vs lectura federada.
4. **D) 00_SOURCE_OF_TRUTH.md + DOCUMENT_INDEX.md** — Declarar nueva norma vigente.
5. **E) LEGACY_MIGRATION_PLAN.md (completar)** — Añadir lista de docs a mover + ejecutar movimiento.

**Rationale:** Si actualizamos Source of Truth antes de actualizar las reglas operativas (onboarding + checklist), agentes/revisores seguirán operando con reglas contradictorias.

---

## PATCHES PROPUESTOS (TEXTO EXACTO LISTO PARA APLICAR)

---

### PATCH B) AGENT_ONBOARDING_README.md

**Ubicación:** `docs/AGENT_ONBOARDING_README.md`

**Cambio:** Actualizar sección "3) Reglas NO negociables" y "4) Qué SÍ está permitido" para incluir excepción explícita de Federation Hubs.

**Texto exacto a reemplazar:**

```markdown
3) Reglas NO negociables

- Prohibido sincronizar workspaces automáticamente.
- Prohibido inyectar información en otro workspace sin acción manual explícita.
- No modificar ni eliminar data legacy ni sus formatos.
- No crear documentos paralelos que contradigan los documentos canónicos listados arriba.
- No "mejorar" la UX si ello altera la semántica de los datos o crea expectativas de automatismo.

4) Qué SÍ está permitido

- Cambios explícitos y documentados en UI y copy, tras lectura de los documentos canónicos.
- Redacción clara y humana en los textos del UI; evitar ambigüedad sobre quién realiza una acción y sus efectos.
- Exportación solo por acción del usuario (botón claro, confirmación, registro de evento manual).
- Auditorías previas a cualquier cambio que toque workspaces o exportaciones.
```

**Nuevo texto (con excepción de Federation Hubs):**

```markdown
3) Reglas NO negociables

- **Prohibido sincronizar workspaces automáticamente.**
- **Prohibido inyectar/escribir información en otro workspace** (sin excepciones).
- **Prohibido lectura cross-workspace implícita** — con la ÚNICA excepción de **Federation Hubs autorizados** (SCDF, SCID-5, MSHE) que:
  - Solo leen artefactos normalizados (`AnalysisRecordNormalized` / `HubFeedSnapshot`).
  - Nunca escriben en workspaces fuente.
  - Generan auditoría automática de lectura.
  - Requieren consentimiento explícito del consultante.
- No modificar ni eliminar data legacy ni sus formatos.
- No crear documentos paralelos que contradigan los documentos canónicos listados arriba.
- No "mejorar" la UX si ello altera la semántica de los datos o crea expectativas de automatismo.

4) Qué SÍ está permitido

- Cambios explícitos y documentados en UI y copy, tras lectura de los documentos canónicos.
- Redacción clara y humana en los textos del UI; evitar ambigüedad sobre quién realiza una acción y sus efectos.
- **Exportación manual** solo por acción del usuario (botón claro, confirmación, registro de evento manual).
- **Lectura federada** (solo para Federation Hubs autorizados: SCDF, SCID-5, MSHE):
  - ✅ **Permitido:** Leer artefactos normalizados de múltiples workspaces para síntesis holística.
  - ✅ **Obligatorio:** Auditoría automática de lectura (log inmutable con timestamp, terapeuta, scope).
  - ❌ **Prohibido:** Escribir en workspaces fuente, inyectar datos, sincronizar estados.
  - **Ejemplo permitido:** MSHE lee `AnalysisRecordNormalized` de MCMI-4 + Astrología + PHQ-9 para generar `SynthesisResult` (6 ejes holísticos).
  - **Ejemplo prohibido:** SCDF copia datos de un workspace a otro, modifica records ajenos, sincroniza estados vivos.
- Auditorías previas a cualquier cambio que toque workspaces o exportaciones.
```

**Añadir nueva sección al final del documento (antes de "Formato y reglas de lectura"):**

```markdown
7) Excepción: Federation Hubs (SCDF, SCID-5, MSHE)

Los **Federation Hubs** son workspaces especializados en síntesis holística transversal, autorizados para lectura cross-workspace bajo estrictas condiciones:

**Hubs autorizados:**
- **SCDF** (Structured Clinical Data Formulation): Genera formulación holística estructurada.
- **SCID-5 Holístico**: Genera preguntas socráticas para exploración.
- **MSHE** (Motor de Síntesis Holística Evaluativa): Genera síntesis de 6 ejes + alertas.

**Reglas obligatorias para Federation Hubs:**
- ✅ **Solo lectura** de artefactos normalizados (`AnalysisRecordNormalized`, `HubFeedSnapshot`).
- ❌ **Prohibida escritura** en workspaces fuente (no inyección, no sincronización).
- ✅ **Auditoría automática** de toda lectura cross-workspace (log inmutable: timestamp, terapeuta, scope, dominios).
- ✅ **Consentimiento explícito** del consultante para síntesis federada.
- ✅ **Visibilidad dual** nativa: `summary_public` (consultante) vs `summary_pro` (terapeuta).
- ✅ **No-diagnóstico** mantenido: outputs mayéuticos (preguntas/hipótesis, no sentencias).

**Referencia normativa:**
- `docs/HOLISTIC_FEDERATION_POLICY.md` — Política completa de federación holística (v2.0).
- `docs/FEDERATION_HUBS_CONTRACT.md` — Contratos técnicos para hubs.
- `docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md` — IA Mayéutica y no-diagnóstico.

**⚠️ Importante:** Cualquier lectura cross-workspace fuera de estos 3 hubs autorizados es una violación de gobernanza y debe bloquearse.
```

---

### PATCH C) PR_WORKSPACE_GOVERNANCE_CHECKLIST.md

**Ubicación:** `docs/PR_WORKSPACE_GOVERNANCE_CHECKLIST.md`

**Cambio:** Actualizar "Sección 2 — Workspaces" para permitir lectura federada autorizada.

**Texto exacto a reemplazar:**

```markdown
## Sección 2 — Workspaces

- ☐ ¿La PR mantiene el aislamiento entre workspaces? (Sí/No)
- ☐ ¿No introduce lectura cruzada implícita? (Sí/No)
- ☐ ¿No empuja información automáticamente al Workspace del terapista? (Sí/No)
```

**Nuevo texto (con checks específicos de Federation Hubs):**

```markdown
## Sección 2 — Workspaces

- ☐ **¿La PR mantiene el aislamiento de escritura entre workspaces?** (Sí/No)
  - ✅ **Permitido:** Lectura federada desde Federation Hubs autorizados (SCDF, SCID-5, MSHE).
  - ❌ **Prohibido:** Escritura/inyección cross-workspace (sin excepciones).

- ☐ **¿La PR introduce lectura cross-workspace?** (Sí/No)
  - **Si SÍ**, verificar:
    - ☐ ¿El destino es un Federation Hub autorizado (SCDF/SCID-5/MSHE)? (Sí/No)
    - ☐ ¿La fuente son artefactos normalizados (`AnalysisRecordNormalized`/`HubFeedSnapshot`)? (Sí/No)
    - ☐ ¿No hay escritura en workspaces fuente? (Sí/No)
    - ☐ ¿Se genera auditoría automática de lectura?** (Sí/No)
    - ☐ ¿Se requiere consentimiento explícito del consultante?** (Sí/No)
  - **Si algún check es NO:** ❌ BLOQUEAR PR — Lectura cross-workspace no autorizada.

- ☐ **¿No empuja información automáticamente al Workspace del terapista?** (Sí/No)
  - **Excepción:** Federation Hubs pueden generar síntesis (sin escribir en workspaces fuente).
```

**Añadir nueva sección al final del checklist (antes de "Revisión final"):**

```markdown
## Sección 2.1 — Federation Hubs (si aplica)

**Solo aplicar si la PR modifica/crea funcionalidad en SCDF, SCID-5 o MSHE.**

- ☐ ¿El hub consume solo artefactos normalizados (no DB directo)? (Sí/No)
- ☐ ¿El hub NO escribe en workspaces fuente? (Sí/No)
- ☐ ¿Se genera `FederationAuditLog` automático? (Sí/No)
- ☐ ¿Outputs tienen visibilidad dual (`summary_public`/`summary_pro`)? (Sí/No)
- ☐ ¿Outputs son mayéuticos (preguntas/hipótesis, no diagnósticos)? (Sí/No)
- ☐ ¿Se requiere consentimiento explícito del consultante? (Sí/No)

**Si algún check es NO:** ❌ BLOQUEAR PR — Violación del contrato de Federation Hubs.

**Referencia:**
- `docs/HOLISTIC_FEDERATION_POLICY.md`
- `docs/FEDERATION_HUBS_CONTRACT.md`
```

---

### PATCH A) WORKSPACE_EXPORT_CONTRACT.md

**Ubicación:** `docs/WORKSPACE_EXPORT_CONTRACT.md`

**Cambio:** Añadir distinción formal entre Exportación Manual (estática) y Lectura Federada (viva, read-only, auditada).

**Añadir después de "## Propósito" y antes de "## Tipos permitidos de export":**

```markdown
## Actualización (2026-01-20): Modalidades de Compartición

Este contrato describe **Exportación Manual** (legacy, vigente). Para **Lectura Federada** (Federation Hubs), ver sección al final de este documento.

### Modalidad 1: Exportación Manual (este contrato)
- **Descripción:** Usuario exporta snapshot estático desde workspace origen → Workspace del Terapista.
- **Características:** Sin vínculo vivo, sin sincronización, artefacto inmutable.
- **Uso:** Notas clínicas, resúmenes puntuales, snapshots de referencia.
- **Normativa:** Este documento (WORKSPACE_EXPORT_CONTRACT.md).

### Modalidad 2: Lectura Federada (nuevo en v2.0)
- **Descripción:** Federation Hubs (SCDF/SCID-5/MSHE) leen artefactos normalizados para síntesis transversal.
- **Características:** Read-only, auditada automáticamente, requiere consentimiento explícito.
- **Uso:** Síntesis holística de 6 ejes (MSHE), formulación estructurada (SCDF), preguntas socráticas (SCID-5).
- **Normativa:** `docs/HOLISTIC_FEDERATION_POLICY.md` y `docs/FEDERATION_HUBS_CONTRACT.md`.

**⚠️ Distinción crítica:**
- **Exportación Manual** crea artefacto estático → NO es federación.
- **Lectura Federada** consume artefactos vivos (read-only) → SÍ es federación, pero NO inyecta en workspaces.

---
```

**Añadir nueva sección al final del documento (después de "## Uso recomendado"):**

```markdown
---

## Modalidad 2: Lectura Federada (Federation Hubs)

**Actualización 2026-01-20:** Este contrato se enfoca en Exportación Manual. Para **Lectura Federada** desde Federation Hubs, aplica lo siguiente:

### Definición
**Lectura Federada** es el proceso mediante el cual **Federation Hubs autorizados** (SCDF, SCID-5, MSHE) consumen artefactos normalizados de múltiples workspaces para generar síntesis holística transversal, **sin escribir en workspaces fuente**.

### Hubs Autorizados
Solo estos 3 workspaces pueden realizar lectura cross-workspace:
1. **SCDF** (Structured Clinical Data Formulation)
2. **SCID-5 Holístico** (Exploración socrática estructurada)
3. **MSHE** (Motor de Síntesis Holística Evaluativa)

### Reglas Obligatorias (NO NEGOCIABLES)
- ✅ **Solo lectura** de artefactos normalizados (`AnalysisRecordNormalized`, `HubFeedSnapshot`).
- ❌ **Prohibida escritura** en workspaces fuente (no inyección, no sincronización, no modificación).
- ✅ **Auditoría automática** de toda lectura cross-workspace:
  - Log inmutable (`FederationAuditLog`) con timestamp, terapeuta solicitante, scope, dominios.
- ✅ **Consentimiento explícito** del consultante para síntesis federada (opt-in).
- ✅ **Visibilidad dual** nativa:
  - `summary_public` (consultante): lenguaje simbólico, sin scores ni IDs técnicos.
  - `summary_pro` (terapeuta): puede incluir scores, IDs, acrónimos clínicos interpretados.
- ✅ **No-diagnóstico** mantenido: outputs mayéuticos (preguntas, hipótesis, propuestas — nunca sentencias o diagnósticos).

### Diferencia con Exportación Manual

| **Aspecto** | **Exportación Manual** | **Lectura Federada** |
|------------|----------------------|---------------------|
| **Trigger** | Usuario manual (botón) | Terapeuta solicita síntesis (manual) |
| **Artefacto** | Snapshot estático (texto/PDF) | Artefactos normalizados vivos (read-only) |
| **Vínculo** | ❌ Sin vínculo (inmutable) | ✅ Vínculo de lectura (no escritura) |
| **Sincronización** | ❌ No sincroniza | ❌ No sincroniza (read-only) |
| **Inyección** | ❌ No inyecta | ❌ No inyecta (read-only) |
| **Destino** | Workspace del Terapista (nota) | Federation Hub (síntesis) |
| **Auditoría** | Manual (registro de evento) | Automática (log inmutable) |

### Restricciones de Lectura Federada
- **No acceso directo a DB**: Hubs consumen solo endpoints de normalización expuestos por workspaces.
- **No inferencia sin scope**: Toda lectura requiere `FederationReadScope` explícito (sujeto, rango temporal, dominios).
- **No exposición de datos internos**: Solo artefactos normalizados (no flags técnicos, no estados intermedios).

### Cumplimiento
- Cualquier lectura cross-workspace fuera de los 3 hubs autorizados es **violación de gobernanza** y debe bloquearse.
- Implementación técnica en **Fases 1-5** (ver `docs/HOLISTIC_FEDERATION_ROADMAP.md`).
- Endpoints en contratos son **NON-BINDING** y **FUTURE** (Fase 1+) — solo specs arquitectónicas.

### Referencia Normativa
- **Política completa:** `docs/HOLISTIC_FEDERATION_POLICY.md` (v2.0)
- **Contratos técnicos:** `docs/FEDERATION_HUBS_CONTRACT.md` (v1.0)
- **System Prompt IA:** `docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md`
- **Roadmap:** `docs/HOLISTIC_FEDERATION_ROADMAP.md` (Fases 0-5)

---

**Nota final:** Este documento (WORKSPACE_EXPORT_CONTRACT.md) sigue vigente para Exportación Manual. Para Lectura Federada, prevalece HOLISTIC_FEDERATION_POLICY.md.
```

---

### PATCH D.1) 00_SOURCE_OF_TRUTH.md

**Ubicación:** `docs/00_SOURCE_OF_TRUTH.md`

**Cambio:** Añadir sección "Transición a Federación Holística (2026-01-20)" después de "## Flujo oficial de trabajo con agentes (VINCULANTE)" y antes de "## Siguientes pasos propuestos".

**Texto exacto a insertar:**

```markdown
---

## Transición a Federación Holística (2026-01-20)

**Decisión de gobernanza:** Aprobada por Arquitectura / Gobernanza el 2026-01-20.

### Cambios Fundamentales

**Política supersedida:**
- `docs/WORKSPACE_ISOLATION_POLICY.md` (v1.0) → **SUPERSEDED** → migrado a `docs/legacy/2026-01-20_pre-federation/`

**Nueva política vigente:**
- `docs/HOLISTIC_FEDERATION_POLICY.md` (v2.0) — **ACTIVA** — Autoridad máxima para gobernanza de workspaces.

### Qué Cambia (ANTES → DESPUÉS)

| **Aspecto** | **ANTES (Aislamiento Absoluto)** | **DESPUÉS (Federación Holística)** |
|------------|----------------------------------|-----------------------------------|
| **Compartir datos** | ❌ Prohibido (solo export manual estático) | ✅ Lectura federada para hubs autorizados (SCDF/SCID-5/MSHE) |
| **Escritura cross-workspace** | ❌ Prohibida | ❌ Prohibida (**SIN CAMBIOS**) |
| **Síntesis holística** | ❌ Bloqueada | ✅ Operacional (lectura federada) |
| **Auditoría** | ⚠️ Manual (fricción) | ✅ Automática (sin fricción, inmutable) |
| **Visibilidad dual** | ⚠️ Mezclada | ✅ Nativa (public/pro) |
| **No-diagnóstico** | ✅ Mantenido | ✅ **Reforzado** (IA Mayéutica) |
| **Ecosistema vivo** | ❌ Bloqueado | ✅ **Habilitado** |

### Qué Se Mantiene (SIN CAMBIOS)

- ✅ **Integridad de dominio**: Ningún workspace escribe en otro (prohibición absoluta).
- ✅ **No-diagnóstico**: Outputs simbólicos, educativos, orientativos — nunca diagnósticos clínicos.
- ✅ **Visibilidad dual**: Separación estricta consultante (público) vs terapeuta (profesional).
- ✅ **Consentimiento explícito**: Consultante autoriza síntesis federada (opt-in).

### Federation Hubs Autorizados

Solo estos 3 workspaces pueden realizar lectura cross-workspace:
1. **SCDF** (Structured Clinical Data Formulation) — Formulación holística estructurada.
2. **SCID-5 Holístico** — Exploración socrática con preguntas mayéuticas.
3. **MSHE** (Motor de Síntesis Holística Evaluativa) — Síntesis de 6 ejes + alertas.

**Restricciones obligatorias:**
- Solo lectura de artefactos normalizados (`AnalysisRecordNormalized` / `HubFeedSnapshot`).
- Prohibida escritura en workspaces fuente.
- Auditoría automática de toda lectura cross-workspace (`FederationAuditLog` inmutable).
- Outputs mayéuticos (preguntas/hipótesis, no sentencias diagnósticas).

### Documentos Canónicos de Federación

| **Documento** | **Propósito** | **Estado** |
|--------------|-------------|----------|
| `HOLISTIC_FEDERATION_POLICY.md` (v2.0) | Política completa de federación | **ACTIVA** |
| `FEDERATION_HUBS_CONTRACT.md` (v1.0) | Contratos técnicos para hubs | **ACTIVA** |
| `SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md` | IA Mayéutica y no-diagnóstico | **ACTIVA** |
| `HOLISTIC_FEDERATION_ROADMAP.md` | Plan de implementación (Fases 0-5) | **ACTIVA** |
| `WORKSPACE_ISOLATION_POLICY.md` (v1.0) | Política anterior (aislamiento absoluto) | **LEGACY (SUPERSEDED)** |

### Impacto en Código

- **Fase 0 (2026-01-20):** Solo documentación y arquitectura — **sin cambios de código, DB ni endpoints**.
- **Fases 1-5 (4-12 meses):** Implementación gradual sin breaking changes (opt-in).
  - Fase 1: Meta-Layer Federado + MSHE (4-6 sem)
  - Fase 2: Motor de Resonancia (6-8 sem)
  - Fase 3: Co-Investigador (Diarios Simbólicos) (8-10 sem)
  - Fase 4: Timeline Dinámico (Tree Evolution Player) (6-8 sem)
  - Fase 5: IA Socrática (SCDF + SCID-5) (8-12 sem)

### Compliance

- **Auditoría automática** obligatoria para toda lectura cross-workspace.
- **No-diagnóstico** verificado en 100% de outputs IA.
- **Visibilidad dual** nativa en todos los artefactos normalizados.
- **Consentimiento explícito** del consultante para síntesis federada.

### Referencias

- **Política completa:** `docs/HOLISTIC_FEDERATION_POLICY.md`
- **Contratos técnicos:** `docs/FEDERATION_HUBS_CONTRACT.md`
- **Roadmap detallado:** `docs/HOLISTIC_FEDERATION_ROADMAP.md`
- **Resumen ejecutivo:** `docs/HOLISTIC_FEDERATION_EXECUTIVE_SUMMARY.md`
- **Plan de migración legacy:** `docs/LEGACY_MIGRATION_PLAN.md`

---
```

---

### PATCH D.2) DOCUMENT_INDEX.md

**Ubicación:** `docs/DOCUMENT_INDEX.md`

**Cambio:** Actualizar tabla para reflejar nueva norma vigente y docs legacy.

**Añadir estas filas después de la fila de `CHAT_CONTINUITY_PROTOCOL.md` y antes de las filas de `SYMBOLIC_INTERPRETER_AI_IMPLEMENTATION.md`:**

```markdown
| `HOLISTIC_FEDERATION_POLICY.md` | `docs/HOLISTIC_FEDERATION_POLICY.md` | **Active** | Governance | Arquitectura | Política de federación holística (v2.0). Supersede WORKSPACE_ISOLATION_POLICY.md. |
| `FEDERATION_HUBS_CONTRACT.md` | `docs/FEDERATION_HUBS_CONTRACT.md` | **Active** | Governance / Contracts | Arquitectura | Contratos técnicos para Federation Hubs (SCDF, SCID-5, MSHE). |
| `SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md` | `docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md` | **Active** | AI / Prompts | Arquitectura | System Prompt v2.0 con IA Mayéutica y soporte de federación. |
| `HOLISTIC_FEDERATION_ROADMAP.md` | `docs/HOLISTIC_FEDERATION_ROADMAP.md` | **Active** | Governance / Roadmap | Arquitectura | Plan de implementación por fases (0-5). Estimado 4-12 meses. |
| `HOLISTIC_FEDERATION_EXECUTIVE_SUMMARY.md` | `docs/HOLISTIC_FEDERATION_EXECUTIVE_SUMMARY.md` | **Active** | Governance / Executive | Arquitectura | Resumen ejecutivo de transición a federación holística. |
| `LEGACY_MIGRATION_PLAN.md` | `docs/LEGACY_MIGRATION_PLAN.md` | **Active** | Governance / Migration | Arquitectura | Plan de migración de documentos legacy a nueva estructura. |
| `WORKSPACE_ISOLATION_POLICY.md` | `docs/legacy/2026-01-20_pre-federation/WORKSPACE_ISOLATION_POLICY.md` | **LEGACY (SUPERSEDED)** | Governance | Arquitectura | Superseded por HOLISTIC_FEDERATION_POLICY.md (v2.0). Archivado 2026-01-20. |
| `SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md` (v1.0) | `docs/legacy/2026-01-20_pre-federation/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v1.md` | **LEGACY (SUPERSEDED)** | AI / Prompts | Arquitectura | Superseded por v2.0 con IA Mayéutica. Archivado 2026-01-20. |
| `TESTS_SYSTEM.md` | `docs/legacy/2026-01-20_pre-federation/TESTS_SYSTEM.md` | **LEGACY (INFORMATIVO)** | Tests / Runtime | Arquitectura | Sistema de tests modulares (histórico). Superseded por runtime reports. |
| `SYMBOLIC_AI_PHASE_0_CONTRACT.md` | `docs/legacy/2026-01-20_pre-federation/SYMBOLIC_AI_PHASE_0_CONTRACT.md` | **LEGACY (SUPERSEDED)** | AI / Contracts | Arquitectura | Superseded por SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md. |
| `PR_RETROACTIVE_AUDIT.md` | `docs/legacy/2026-01-20_pre-federation/PR_RETROACTIVE_AUDIT.md` | **LEGACY (INFORMATIVO)** | Governance / Audit | Arquitectura | Auditoría retroactiva de PRs (histórico). |
```

**Actualizar la fila existente de `WORKSPACE_ISOLATION_POLICY.md` (cambiar ruta y estado):**

Buscar la fila que contiene `WORKSPACE_ISOLATION_POLICY.md` y reemplazarla por:

```markdown
| `WORKSPACE_ISOLATION_POLICY.md` | `docs/legacy/2026-01-20_pre-federation/WORKSPACE_ISOLATION_POLICY.md` | **LEGACY (SUPERSEDED)** | Governance | Arquitectura | Superseded por HOLISTIC_FEDERATION_POLICY.md (v2.0). Archivado 2026-01-20. |
```

---

### PATCH E) LEGACY_MIGRATION_PLAN.md (COMPLETAR)

**Ubicación:** `docs/LEGACY_MIGRATION_PLAN.md`

**Cambio:** Añadir lista completa de docs a mover + tabla de contradicciones resueltas.

**Añadir después de la sección "### 2. SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md (v1.0)" y antes de "## ACTUALIZACIÓN DE ÍNDICES Y REFERENCIAS":**

```markdown
---

### 3. TESTS_SYSTEM.md

**Origen:** `docs/TESTS_SYSTEM.md`  
**Destino:** `docs/legacy/2026-01-20_pre-federation/TESTS_SYSTEM.md`  
**Razón:** Histórico / Informativo — Runtime reports superseden este documento.  
**Fecha efectiva:** 2026-01-20

#### Header a añadir:

```markdown
---
**LEGACY STATUS:** INFORMATIVO (HISTÓRICO)  
**SUPERSEDED BY:** `docs/00_SOURCE_OF_TRUTH/legacy_tests_runtime_report_2026-01-10.md`  
**REASON:** Documento histórico de sistema de tests. Runtime reports y catálogos actuales superseden este contenido.  
**EFFECTIVE UNTIL:** 2026-01-20  
**ARCHIVED BY:** Arquitectura / Gobernanza  
**DATE ARCHIVED:** 2026-01-20  

**Contexto histórico:**
Este documento describía el sistema de tests modulares legacy antes de la auditoría y reconciliación de 2026-01-10. Los datos actuales de runtime están en:
- `docs/00_SOURCE_OF_TRUTH/runtime_testmodule_dump.csv`
- `docs/00_SOURCE_OF_TRUTH/runtime_analysis_kinds.csv`
- `docs/00_SOURCE_OF_TRUTH/legacy_tests_runtime_report_2026-01-10.md`

**Referencia:** Ver `docs/00_SOURCE_OF_TRUTH/` para datos actuales de runtime.
---

[CONTENIDO ORIGINAL DEL DOCUMENTO A CONTINUACIÓN]
```

---

### 4. SYMBOLIC_AI_PHASE_0_CONTRACT.md

**Origen:** `docs/SYMBOLIC_AI_PHASE_0_CONTRACT.md`  
**Destino:** `docs/legacy/2026-01-20_pre-federation/SYMBOLIC_AI_PHASE_0_CONTRACT.md`  
**Razón:** Superseded por SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md (contratos IA consolidados).  
**Fecha efectiva:** 2026-01-20

#### Header a añadir:

```markdown
---
**LEGACY STATUS:** SUPERSEDED  
**SUPERSEDED BY:** `docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md`  
**REASON:** Contratos IA consolidados en System Prompt v2.0 con IA Mayéutica y soporte de federación.  
**EFFECTIVE UNTIL:** 2026-01-20  
**ARCHIVED BY:** Arquitectura / Gobernanza  
**DATE ARCHIVED:** 2026-01-20  

**Contexto histórico:**
Este documento definía contratos preliminares para IA simbólica en Fase 0 (pre-federación). Los contratos actuales están consolidados en:
- `docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md` — System Prompt completo con IA Mayéutica.
- `docs/HOLISTIC_FEDERATION_POLICY.md` — Política de no-diagnóstico y visibilidad dual.
- `docs/FEDERATION_HUBS_CONTRACT.md` — Contratos técnicos para Federation Hubs.

**Referencia:** Ver System Prompt v2.0 para contratos IA vigentes.
---

[CONTENIDO ORIGINAL DEL DOCUMENTO A CONTINUACIÓN]
```

---

### 5. PR_RETROACTIVE_AUDIT.md

**Origen:** `docs/PR_RETROACTIVE_AUDIT.md`  
**Destino:** `docs/legacy/2026-01-20_pre-federation/PR_RETROACTIVE_AUDIT.md`  
**Razón:** Histórico / Informativo — Auditoría retroactiva completada, metodología vigente en PR_WORKSPACE_GOVERNANCE_CHECKLIST.md.  
**Fecha efectiva:** 2026-01-20

#### Header a añadir:

```markdown
---
**LEGACY STATUS:** INFORMATIVO (HISTÓRICO)  
**SUPERSEDED BY:** `docs/PR_WORKSPACE_GOVERNANCE_CHECKLIST.md`  
**REASON:** Auditoría retroactiva completada. Metodología vigente consolidada en PR checklist actualizado con soporte de federación.  
**EFFECTIVE UNTIL:** 2026-01-20  
**ARCHIVED BY:** Arquitectura / Gobernanza  
**DATE ARCHIVED:** 2026-01-20  

**Contexto histórico:**
Este documento describía la metodología para auditoría retroactiva de PRs (pre-federación). La metodología actual está consolidada en:
- `docs/PR_WORKSPACE_GOVERNANCE_CHECKLIST.md` — Checklist actualizado con checks de Federation Hubs.
- `docs/AGENT_ONBOARDING_README.md` — Reglas operativas actualizadas para agentes.

**Referencia:** Ver PR_WORKSPACE_GOVERNANCE_CHECKLIST.md para metodología vigente.
---

[CONTENIDO ORIGINAL DEL DOCUMENTO A CONTINUACIÓN]
```

---

## TABLA DE CONTRADICCIONES RESUELTAS

**Propósito:** Documentar qué documentos legacy contradecían la nueva política y cómo se resolvieron.

| **Doc Legacy** | **Contradicción** | **Doc Activo que lo reemplaza** | **Resolución** |
|---------------|------------------|--------------------------------|---------------|
| `WORKSPACE_ISOLATION_POLICY.md` (v1.0) | Prohibía absolutamente toda compartición cross-workspace, bloqueando síntesis holística (SCDF/SCID-5/MSHE). | `HOLISTIC_FEDERATION_POLICY.md` (v2.0) | Permite lectura federada para hubs autorizados (read-only, auditada). Mantiene prohibición de escritura cross-workspace. |
| `SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md` (v1.0) | No incluía soporte de federación ni IA Mayéutica reforzada. | `SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md` | Añade reglas de federación, IA Mayéutica obligatoria, auditoría automática. |
| `WORKSPACE_EXPORT_CONTRACT.md` (sin patch) | Prohibía "vínculo vivo" sin distinguir entre inyección (prohibida) y lectura federada (autorizada). | Mismo documento (patcheado) | Añadida sección "Modalidad 2: Lectura Federada" que distingue exportación manual (estática) vs lectura federada (viva, read-only). |
| `AGENT_ONBOARDING_README.md` (sin patch) | Regla "Prohibido sincronizar workspaces" era absoluta, sin excepción para Federation Hubs. | Mismo documento (patcheado) | Añadida excepción explícita: "con la ÚNICA excepción de Federation Hubs autorizados (SCDF, SCID-5, MSHE)...". |
| `PR_WORKSPACE_GOVERNANCE_CHECKLIST.md` (sin patch) | Pregunta "¿No introduce lectura cruzada implícita?" bloqueaba toda lectura cross-workspace. | Mismo documento (patcheado) | Añadida sección 2.1 con checks específicos para Federation Hubs (permitir si cumple 6 condiciones). |
| `TESTS_SYSTEM.md` | Documento histórico desactualizado respecto a runtime actual. | Runtime reports en `docs/00_SOURCE_OF_TRUTH/` | Migrado a legacy como informativo. Datos actuales en runtime dumps. |
| `SYMBOLIC_AI_PHASE_0_CONTRACT.md` | Contratos IA fragmentados y preliminares. | `SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md` | Contratos consolidados en System Prompt v2.0. |
| `PR_RETROACTIVE_AUDIT.md` | Metodología histórica no actualizada con federación. | `PR_WORKSPACE_GOVERNANCE_CHECKLIST.md` | Metodología vigente en checklist actualizado. |

**Impacto:** Con estas resoluciones, no quedan documentos normativos activos que contradigan HOLISTIC_FEDERATION_POLICY.md.

---
```

---

## LISTA FINAL DE LEGACY (ORIGEN → DESTINO + HEADERS)

### Archivos a Mover:

| # | **Origen** | **Destino** | **Header** |
|---|-----------|-----------|----------|
| 1 | `docs/WORKSPACE_ISOLATION_POLICY.md` | `docs/legacy/2026-01-20_pre-federation/WORKSPACE_ISOLATION_POLICY.md` | LEGACY STATUS: SUPERSEDED |
| 2 | `docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md` | `docs/legacy/2026-01-20_pre-federation/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v1.md` | LEGACY STATUS: SUPERSEDED |
| 3 | `docs/TESTS_SYSTEM.md` | `docs/legacy/2026-01-20_pre-federation/TESTS_SYSTEM.md` | LEGACY STATUS: INFORMATIVO (HISTÓRICO) |
| 4 | `docs/SYMBOLIC_AI_PHASE_0_CONTRACT.md` | `docs/legacy/2026-01-20_pre-federation/SYMBOLIC_AI_PHASE_0_CONTRACT.md` | LEGACY STATUS: SUPERSEDED |
| 5 | `docs/PR_RETROACTIVE_AUDIT.md` | `docs/legacy/2026-01-20_pre-federation/PR_RETROACTIVE_AUDIT.md` | LEGACY STATUS: INFORMATIVO (HISTÓRICO) |

**Nota:** `docs/technical/TESTS_SYSTEM.md` también existe — si es duplicado, mover ambos o consolidar.

---

## CHECKLIST DE CIERRE DE FASE 0.1

### Documentación Normativa:

- [ ] **B) AGENT_ONBOARDING_README.md** — Patcheado con excepción de Federation Hubs
- [ ] **C) PR_WORKSPACE_GOVERNANCE_CHECKLIST.md** — Patcheado con sección 2.1 (checks de hubs)
- [ ] **A) WORKSPACE_EXPORT_CONTRACT.md** — Patcheado con Modalidad 2 (Lectura Federada)
- [ ] **D.1) 00_SOURCE_OF_TRUTH.md** — Añadida sección "Transición a Federación Holística"
- [ ] **D.2) DOCUMENT_INDEX.md** — Añadidas filas de docs nuevos y actualizadas rutas legacy
- [ ] **E) LEGACY_MIGRATION_PLAN.md** — Completado con lista de 5 docs + tabla de contradicciones

### Migración Legacy:

- [ ] Directorio `docs/legacy/2026-01-20_pre-federation/` creado
- [ ] `WORKSPACE_ISOLATION_POLICY.md` movido con header SUPERSEDED
- [ ] `SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md` (v1.0) movido con header SUPERSEDED
- [ ] `TESTS_SYSTEM.md` movido con header INFORMATIVO
- [ ] `SYMBOLIC_AI_PHASE_0_CONTRACT.md` movido con header SUPERSEDED
- [ ] `PR_RETROACTIVE_AUDIT.md` movido con header INFORMATIVO

### Verificación:

- [ ] No hay contradicciones normativas entre docs activos
- [ ] Agentes tienen reglas claras (onboarding actualizado)
- [ ] Revisores tienen checklist actualizado (PR governance)
- [ ] Source of Truth apunta a nueva norma vigente
- [ ] DOCUMENT_INDEX refleja estado actual (activos vs legacy)

### Commit y Tag:

- [ ] Commit realizado con mensaje descriptivo
- [ ] Tag `governance/federation-v2.0-phase-0.1` creado

---

## ORDEN PRÁCTICO DE APLICACIÓN

**Recomendación:** Aplicar patches en este orden exacto para evitar desalineación:

### Paso 1: Actualizar Reglas Operativas (agentes + revisores)
```bash
# Aplicar patches B y C primero
# Esto evita que agentes/revisores sigan usando reglas antiguas
```

1. Aplicar **PATCH B)** en `docs/AGENT_ONBOARDING_README.md`
2. Aplicar **PATCH C)** en `docs/PR_WORKSPACE_GOVERNANCE_CHECKLIST.md`

### Paso 2: Actualizar Contratos de Compartición
```bash
# Aplicar patch A para matar bloqueo del "no vínculo vivo"
```

3. Aplicar **PATCH A)** en `docs/WORKSPACE_EXPORT_CONTRACT.md`

### Paso 3: Actualizar Source of Truth e Índice
```bash
# Declarar nueva norma vigente oficialmente
```

4. Aplicar **PATCH D.1)** en `docs/00_SOURCE_OF_TRUTH.md`
5. Aplicar **PATCH D.2)** en `docs/DOCUMENT_INDEX.md`

### Paso 4: Completar Plan Legacy
```bash
# Añadir lista completa de docs a mover
```

6. Aplicar **PATCH E)** en `docs/LEGACY_MIGRATION_PLAN.md`

### Paso 5: Ejecutar Migración Legacy
```bash
# Mover archivos físicamente con headers
```

7. Crear directorio: `mkdir -p docs/legacy/2026-01-20_pre-federation`
8. Mover 5 documentos con headers según `LEGACY_MIGRATION_PLAN.md`
9. Verificar que rutas en `DOCUMENT_INDEX.md` coinciden con ubicación física

### Paso 6: Commit y Tag
```bash
git add docs/
git commit -m "chore(docs): Phase 0.1 — Resolve normative contradictions for Federation v2.0

- Patch AGENT_ONBOARDING_README.md: Add Federation Hubs exception
- Patch PR_WORKSPACE_GOVERNANCE_CHECKLIST.md: Add Section 2.1 (hub checks)
- Patch WORKSPACE_EXPORT_CONTRACT.md: Add Modality 2 (Federated Reading)
- Update 00_SOURCE_OF_TRUTH.md: Add Federation transition section
- Update DOCUMENT_INDEX.md: Reflect active vs legacy docs
- Complete LEGACY_MIGRATION_PLAN.md: Add 5 docs to migrate + contradictions table
- Migrate 5 legacy docs to docs/legacy/2026-01-20_pre-federation/

Ref: HOLISTIC_FEDERATION_POLICY.md (v2.0)
Breaking: None (documentation only, Phase 0.1)
"

git tag -a "governance/federation-v2.0-phase-0.1" -m "Holistic Federation Policy v2.0 - Phase 0.1 Complete (Normative Contradictions Resolved)"
```

---

**Estado:** ✅ **FASE 0.1 LISTA PARA EJECUCIÓN**

Todos los patches están listos para copiar/pegar. Aplicar en el orden especificado para evitar desalineación transitoria entre documentos.

---

**Firmado por:** Arquitectura / Gobernanza  
**Fecha:** 2026-01-20  
**Fase:** 0.1 (Cierre Operacional)  
**Modo:** ARCHITECT_MODE (AGENTE_ARQ)
