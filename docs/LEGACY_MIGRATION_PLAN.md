# LEGACY_MIGRATION_PLAN.md

**Fecha:** 2026-01-20  
**Propósito:** Plan de migración de documentos legacy a nueva estructura post-federación.  
**Autoridad:** Arquitectura / Gobernanza

---

## RESUMEN EJECUTIVO

Con la adopción de **HOLISTIC_FEDERATION_POLICY.md** (v2.0), el modelo de "aislamiento absoluto" queda **SUPERSEDED**. Este plan documenta:

1. Qué documentos legacy se mueven.
2. Dónde se mueven.
3. Qué headers de trazabilidad se añaden.
4. Cómo se actualizan los índices y referencias.

---

## DOCUMENTOS A MIGRAR

### 1. WORKSPACE_ISOLATION_POLICY.md

**Origen:** `docs/WORKSPACE_ISOLATION_POLICY.md`  
**Destino:** `docs/legacy/2026-01-20_pre-federation/WORKSPACE_ISOLATION_POLICY.md`  
**Razón:** Superseded por HOLISTIC_FEDERATION_POLICY.md (v2.0).  
**Fecha efectiva:** 2026-01-20

#### Header a añadir (al inicio del documento):

```markdown
---
**LEGACY STATUS:** SUPERSEDED  
**SUPERSEDED BY:** `docs/HOLISTIC_FEDERATION_POLICY.md`  
**REASON:** Transición de aislamiento absoluto a federación holística con integridad de dominio.  
**EFFECTIVE UNTIL:** 2026-01-20  
**ARCHIVED BY:** Arquitectura / Gobernanza  
**DATE ARCHIVED:** 2026-01-20  

**Contexto histórico:**
Este documento definió la política de aislamiento total entre workspaces, prohibiendo cualquier compartición automática de datos. Fue fundamental para reducir complejidad y mantener claridad operativa en la fase inicial del proyecto.

**¿Por qué se reemplaza?**
El modelo de aislamiento absoluto bloqueaba la síntesis holística transversal (SCDF, SCID-5, MSHE), impidiendo que el ecosistema funcionara como diseñado. La nueva política (HOLISTIC_FEDERATION_POLICY.md v2.0) mantiene la integridad de dominio (no escritura cross-workspace) pero habilita lectura federada para workspaces-hub autorizados.

**¿Qué se mantiene?**
- ✅ Integridad de dominio: ningún workspace escribe en otro.
- ✅ No diagnóstico / No determinismo.
- ✅ Visibilidad dual (público/profesional).

**¿Qué cambia?**
- ✅ Federation Hubs (SCDF, SCID-5, MSHE) pueden leer artefactos normalizados.
- ✅ Auditoría automática sin fricción.
- ✅ Ecosistema vivo habilitado.

**Referencia:** Ver `docs/HOLISTIC_FEDERATION_POLICY.md` para el modelo actual.
---

[CONTENIDO ORIGINAL DEL DOCUMENTO A CONTINUACIÓN]
```

---

### 2. SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md (v1.0)

**Origen:** `docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md`  
**Destino:** `docs/legacy/2026-01-20_pre-federation/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v1.md`  
**Razón:** Superseded por v2.0 (con soporte de federación y IA Mayéutica reforzada).  
**Fecha efectiva:** 2026-01-20

#### Header a añadir:

```markdown
---
**LEGACY STATUS:** SUPERSEDED  
**SUPERSEDED BY:** `docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md`  
**REASON:** Actualización para soportar Federación Holística, IA Mayéutica y auditoría automática.  
**EFFECTIVE UNTIL:** 2026-01-20  
**ARCHIVED BY:** Arquitectura / Gobernanza  
**DATE ARCHIVED:** 2026-01-20  

**Contexto histórico:**
v1.0 estableció las bases de no-diagnóstico, visibilidad dual y lenguaje simbólico. Fue crítico para garantizar cumplimiento en la fase pre-federación.

**¿Qué añade v2.0?**
- ✅ Soporte para Federation Hubs (SCDF, SCID-5, MSHE).
- ✅ IA Mayéutica obligatoria (preguntas/hipótesis, no sentencias).
- ✅ Reglas de auditoría automática para lectura cross-workspace.
- ✅ ExplanationTrace en outputs.

**Compatibilidad:** v1.0 sigue siendo válido para workspaces no-federados. v2.0 es obligatorio para Federation Hubs.

**Referencia:** Ver `docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md`.
---

[CONTENIDO ORIGINAL DEL DOCUMENTO A CONTINUACIÓN]
```

------

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
| `PR_WORKSPACE_GOVERNANCE_CHECKLIST.md` (sin patch) | Pregunta "¿No introduce lectura cruzada implícita?" bloqueaba toda lectura cross-workspace. | Mismo documento (patcheado) | Añadida sección 2.1 con checks específicos para Federation Hubs (permitir si cumple 5 condiciones). |
| `TESTS_SYSTEM.md` | Documento histórico desactualizado respecto a runtime actual. | Runtime reports en `docs/00_SOURCE_OF_TRUTH/` | Migrado a legacy como informativo. Datos actuales en runtime dumps. |
| `SYMBOLIC_AI_PHASE_0_CONTRACT.md` | Contratos IA fragmentados y preliminares. | `SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md` | Contratos consolidados en System Prompt v2.0. |
| `PR_RETROACTIVE_AUDIT.md` | Metodología histórica no actualizada con federación. | `PR_WORKSPACE_GOVERNANCE_CHECKLIST.md` | Metodología vigente en checklist actualizado. |

**Impacto:** Con estas resoluciones, no quedan documentos normativos activos que contradigan HOLISTIC_FEDERATION_POLICY.md.

---

## ACTUALIZACIÓN DE ÍNDICES Y REFERENCIAS

### 1. docs/00_SOURCE_OF_TRUTH.md

**Acción:** Añadir sección "Transición a Federación Holística (2026-01-20)".

**Contenido a añadir:**

```markdown
## Transición a Federación Holística (2026-01-20)

**Decisión de gobernanza:** Aprobada por Arquitectura / Gobernanza el 2026-01-20.

**Cambios clave:**
1. ✅ Modelo de aislamiento absoluto **SUPERSEDED** por modelo de federación holística.
2. ✅ Documentos legacy migrados a `docs/legacy/2026-01-20_pre-federation/`.
3. ✅ Nuevos documentos canónicos:
   - `HOLISTIC_FEDERATION_POLICY.md` (v2.0)
   - `FEDERATION_HUBS_CONTRACT.md` (v1.0)
   - `SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md`
   - `HOLISTIC_FEDERATION_ROADMAP.md` (Fases 0-5)

**Rationale:** El modelo de aislamiento absoluto bloqueaba la síntesis holística transversal (SCDF, SCID-5, MSHE), impidiendo que el ecosistema funcionara como diseñado. La nueva política mantiene integridad de dominio (no escritura cross-workspace) pero habilita lectura federada para hubs autorizados.

**Impacto en código:** Sin breaking changes en Fase 0 (solo docs y arquitectura). Implementación gradual en Fases 1-5 (ver Roadmap).

**Compliance:** Auditoría automática obligatoria para toda lectura cross-workspace. No-diagnóstico y visibilidad dual mantenidos estrictamente.

**Referencia:** Ver `docs/HOLISTIC_FEDERATION_POLICY.md` y `docs/HOLISTIC_FEDERATION_ROADMAP.md`.
```

---

### 2. docs/DOCUMENT_INDEX.md

**Acción:** Actualizar estado y rutas de documentos.

**Cambios:**

| Documento | Ruta Anterior | Ruta Nueva | Estado Anterior | Estado Nuevo |
|-----------|--------------|-----------|----------------|-------------|
| `WORKSPACE_ISOLATION_POLICY.md` | `docs/WORKSPACE_ISOLATION_POLICY.md` | `docs/legacy/2026-01-20_pre-federation/WORKSPACE_ISOLATION_POLICY.md` | **ACTIVA** | **LEGACY (SUPERSEDED)** |
| `SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md` (v1.0) | `docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md` | `docs/legacy/2026-01-20_pre-federation/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v1.md` | **ACTIVA** | **LEGACY (SUPERSEDED)** |
| `HOLISTIC_FEDERATION_POLICY.md` | — | `docs/HOLISTIC_FEDERATION_POLICY.md` | — | **ACTIVA** |
| `FEDERATION_HUBS_CONTRACT.md` | — | `docs/FEDERATION_HUBS_CONTRACT.md` | — | **ACTIVA** |
| `SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md` | — | `docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md` | — | **ACTIVA** |
| `HOLISTIC_FEDERATION_ROADMAP.md` | — | `docs/HOLISTIC_FEDERATION_ROADMAP.md` | — | **ACTIVA** |

**Añadir nuevas filas:**

```markdown
| `HOLISTIC_FEDERATION_POLICY.md` | `docs/HOLISTIC_FEDERATION_POLICY.md` | **Active** | Governance | Arquitectura | Política de federación holística (v2.0). |
| `FEDERATION_HUBS_CONTRACT.md` | `docs/FEDERATION_HUBS_CONTRACT.md` | **Active** | Governance / Contracts | Arquitectura | Contratos técnicos para Federation Hubs (SCDF, SCID-5, MSHE). |
| `SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md` | `docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md` | **Active** | AI / Prompts | Arquitectura | System Prompt v2.0 con soporte de federación y IA Mayéutica. |
| `HOLISTIC_FEDERATION_ROADMAP.md` | `docs/HOLISTIC_FEDERATION_ROADMAP.md` | **Active** | Governance / Roadmap | Arquitectura | Plan de implementación por fases (0-5). |
| `WORKSPACE_ISOLATION_POLICY.md` | `docs/legacy/2026-01-20_pre-federation/WORKSPACE_ISOLATION_POLICY.md` | **LEGACY (SUPERSEDED)** | Governance | Arquitectura | Superseded por HOLISTIC_FEDERATION_POLICY.md. |
| `SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md` (v1.0) | `docs/legacy/2026-01-20_pre-federation/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v1.md` | **LEGACY (SUPERSEDED)** | AI / Prompts | Arquitectura | Superseded por v2.0. |
```

---

### 3. README.md (si existe)

**Acción:** Actualizar sección de documentación con link a nueva política.

**Contenido a añadir/actualizar:**

```markdown
## Documentación Canónica

### Gobernanza y Políticas

- 📋 **[00_SOURCE_OF_TRUTH.md](docs/00_SOURCE_OF_TRUTH.md)** — Fuente maestra de gobernanza.
- 🔗 **[HOLISTIC_FEDERATION_POLICY.md](docs/HOLISTIC_FEDERATION_POLICY.md)** *(Nuevo 2026-01-20)* — Política de federación holística (v2.0).
- 📜 **[FEDERATION_HUBS_CONTRACT.md](docs/FEDERATION_HUBS_CONTRACT.md)** *(Nuevo 2026-01-20)* — Contratos técnicos para hubs federados.
- 🗺️ **[HOLISTIC_FEDERATION_ROADMAP.md](docs/HOLISTIC_FEDERATION_ROADMAP.md)** *(Nuevo 2026-01-20)* — Roadmap de implementación (Fases 0-5).

### AI / Prompts

- 🤖 **[SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md](docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md)** *(Nuevo 2026-01-20)* — System Prompt v2.0 con IA Mayéutica y federación.

### Legacy (Superseded)

- 🗂️ **[docs/legacy/2026-01-20_pre-federation/](docs/legacy/2026-01-20_pre-federation/)** — Documentos anteriores a la federación holística.
```

---

## PROCEDIMIENTO DE MIGRACIÓN (PASO A PASO)

### Paso 1: Crear directorio legacy

```bash
mkdir -p docs/legacy/2026-01-20_pre-federation
```

### Paso 2: Mover y añadir headers

```bash
# Mover WORKSPACE_ISOLATION_POLICY.md
cp docs/WORKSPACE_ISOLATION_POLICY.md docs/legacy/2026-01-20_pre-federation/WORKSPACE_ISOLATION_POLICY.md

# Añadir header LEGACY al inicio del archivo (manual o script)
# Ver sección "Header a añadir" arriba
```

```bash
# Mover SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md (v1.0)
cp docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md docs/legacy/2026-01-20_pre-federation/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v1.md

# Añadir header LEGACY al inicio del archivo
```

### Paso 3: Actualizar 00_SOURCE_OF_TRUTH.md

Editar `docs/00_SOURCE_OF_TRUTH.md` y añadir la sección "Transición a Federación Holística (2026-01-20)" (ver contenido arriba).

### Paso 4: Actualizar DOCUMENT_INDEX.md

Editar `docs/DOCUMENT_INDEX.md`:
1. Cambiar estado de documentos legacy a "LEGACY (SUPERSEDED)".
2. Actualizar rutas de documentos legacy.
3. Añadir nuevos documentos (HOLISTIC_FEDERATION_POLICY, etc.) con estado "Active".

### Paso 5: Actualizar README.md (si existe)

Añadir sección de documentación canónica con links a nuevos docs (ver contenido arriba).

### Paso 6: Commit y tag

```bash
git add docs/
git commit -m "chore(docs): migrate to Holistic Federation Policy v2.0

- Supersede WORKSPACE_ISOLATION_POLICY.md (v1.0)
- Supersede SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md (v1.0)
- Add HOLISTIC_FEDERATION_POLICY.md (v2.0)
- Add FEDERATION_HUBS_CONTRACT.md (v1.0)
- Add SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md
- Add HOLISTIC_FEDERATION_ROADMAP.md (Phases 0-5)
- Update 00_SOURCE_OF_TRUTH.md and DOCUMENT_INDEX.md
- Move legacy docs to docs/legacy/2026-01-20_pre-federation/

Ref: Governance decision 2026-01-20
Breaking: None (documentation only, Phase 0)
"

git tag -a "governance/federation-v2.0" -m "Holistic Federation Policy v2.0 - Phase 0 Complete"
```

---

## VERIFICACIÓN POST-MIGRACIÓN

### Checklist:

- [ ] Directorio `docs/legacy/2026-01-20_pre-federation/` creado.
- [ ] `WORKSPACE_ISOLATION_POLICY.md` movido con header LEGACY.
- [ ] `SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v1.md` movido con header LEGACY.
- [ ] `00_SOURCE_OF_TRUTH.md` actualizado con sección de transición.
- [ ] `DOCUMENT_INDEX.md` refleja nuevas rutas y estados.
- [ ] `README.md` (si existe) actualizado con links nuevos.
- [ ] Commit realizado con mensaje descriptivo.
- [ ] Tag `governance/federation-v2.0` creado.
- [ ] Documentación nueva accesible en rutas correctas:
  - `docs/HOLISTIC_FEDERATION_POLICY.md`
  - `docs/FEDERATION_HUBS_CONTRACT.md`
  - `docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md`
  - `docs/HOLISTIC_FEDERATION_ROADMAP.md`

---

## COMUNICACIÓN A STAKEHOLDERS

### Email / Slack Announcement (plantilla):

**Subject:** 🔄 Transición a Holistic Federation Policy v2.0 (Fase 0 completada)

**Body:**

> Hola equipo,
>
> Les informamos que hemos completado la **Fase 0** del plan de **Federación Holística**, re-fundando la gobernanza de workspaces para habilitar síntesis transversal sin comprometer integridad de dominio.
>
> **¿Qué cambia en documentación?**
> - ✅ Nueva política: `HOLISTIC_FEDERATION_POLICY.md` (v2.0)
> - ✅ Contratos técnicos: `FEDERATION_HUBS_CONTRACT.md`
> - ✅ System Prompt actualizado: `SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md` (IA Mayéutica reforzada)
> - ✅ Roadmap por fases: `HOLISTIC_FEDERATION_ROADMAP.md` (Fases 0-5)
>
> **¿Qué cambia en código?**
> - ❌ **Nada todavía** — Fase 0 es solo documentación y arquitectura.
> - ✅ Implementación gradual en Fases 1-5 (sin breaking changes).
>
> **¿Qué se mantiene?**
> - ✅ Integridad de dominio: ningún workspace escribe en otro.
> - ✅ No diagnóstico / No determinismo.
> - ✅ Visibilidad dual (público/profesional).
>
> **¿Qué habilita?**
> - ✅ SCDF, SCID-5, MSHE operacionales (síntesis federada).
> - ✅ Ecosistema vivo con resonancias, diarios simbólicos, timeline evolutivo.
>
> **Documentos legacy:**
> - `WORKSPACE_ISOLATION_POLICY.md` → migrado a `docs/legacy/2026-01-20_pre-federation/`
>
> **Próximos pasos:**
> - Fase 1 (Meta-Layer Federado): implementación de endpoints normalizados y MSHE.
> - Kickoff técnico: [fecha TBD]
>
> Ver roadmap completo: `docs/HOLISTIC_FEDERATION_ROADMAP.md`
>
> Preguntas o comentarios: [canal de Slack / email]
>
> — Equipo de Arquitectura / Gobernanza

---

**Fin del plan de migración legacy.**  
**Para consultas: contactar a Arquitectura / Gobernanza.**
