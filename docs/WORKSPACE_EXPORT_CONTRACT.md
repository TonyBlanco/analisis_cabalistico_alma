# Workspace Export Contract

## Propósito
Definir el contrato documental para exportaciones manuales desde Workspaces hacia el `Workspace del Terapista` como notas estáticas. Este documento únicamente describe las reglas, tipos de salida permitidos y restricciones. No describe implementación técnica.

---

## Actualización (2026-01-20): Modalidades de Compartición

Este contrato describe **Exportación Manual** (legacy, vigente). Para **Lectura Federada** (Federation Hubs), ver sección al final de este documento.

### Modalidad 1: Exportación Manual (este contrato)
- **Descripción:** Usuario exporta snapshot estático desde workspace origen → Workspace del Terapista.
- **Características:** Sin vínculo vivo, sin sincronización, artefacto inmutable.
- **Uso:** Notas profesionales, resúmenes puntuales, snapshots de referencia.
- **Normativa:** Este documento (WORKSPACE_EXPORT_CONTRACT.md).

### Modalidad 2: Lectura Federada (nuevo en v2.0)
- **Descripción:** Federation Hubs (SCDF/SCID-5/MSHE) leen artefactos normalizados para síntesis transversal.
- **Características:** Read-only, auditada automáticamente, requiere consentimiento explícito.
- **Uso:** Síntesis holística de 6 ejes (MSHE), formulación estructurada (SCDF), preguntas socráticas (SCID-5).
- **Normativa:** `docs/HOLISTIC_FEDERATION_POLICY.md` y `docs/FEDERATION_HUBS_CONTRACT.md`.
- **⚠️ Importante:** Endpoints mencionados son **NON-BINDING** y **FUTURE** (Phase 1+) — solo especificaciones arquitectónicas.

**⚠️ Distinción crítica:**
- **Exportación Manual** crea artefacto estático → NO es federación.
- **Lectura Federada** consume artefactos vivos (read-only) → SÍ es federación, pero NO inyecta en workspaces.

---

## Tipos permitidos de export
- Resumen: texto corto estructurado (1–3 párrafos). Uso: síntesis humana legible.
- Observaciones: fragmentos de texto libre que describen hallazgos observacionales (no deterministas).
- Snapshot: captura inmutable del estado simbólico/visual en formato legible (JSON o markdown adjunto como artefacto), destinada a referencia, no a ejecución.

## Reglas estrictas
- Export: siempre manual (usuario explícito debe iniciar export). No workflows automáticos.
- Sin vínculo vivo: la exportación produce un artefacto estático. No hay sincronización ni endpoint persistente que mantenga vínculo entre origen y destino.
- Sin sincronización: cambios posteriores en el Workspace origen NO actualizan la exportación.
- Destino único: `Workspace del Terapista` como nota estática (campo de notas profesionales o repositorio documental interno). Si se requiere duplicación, debe realizarse manualmente y documentarse.

## Metadatos m├¡nimos que debe incluir una exportaci├│n
- origen_workspace: identificador del Workspace origen
- tipo_export: {Resumen|Observaciones|Snapshot}
- timestamp: ISO8601
- author_id: identificador del usuario que ejecut├│ la exportaci├│n
- artefacto: contenido exportado (texto o archivo adjunto)

## Restricciones y advertencias
- No cl├¡nico: el contenido exportado NO debe contener diagn├│sticos, puntuaciones cl├¡nicas, ni recomendaciones terap├⌐uticas.
- No autom├ítico: ning├║n agente o proceso debe disparar exportaciones sin la intervenci├│n expl├¡cita del usuario.
- No reversible t├⌐cnicamente: la exportaci├│n crea un artefacto est├ítico; restaurar v├¡nculo o retro-sincronizar est├í fuera del alcance de este contrato y requiere autorizaci├│n de gobernanza.

## Cumplimiento
- Todos los procesos que implementen export deben registrar el metadato `export_trace` en el registro de auditor├¡a (usuario, timestamp, origen_workspace).
- Cualquier excepci├│n a estas reglas requiere aprobaci├│n documentada en `01_PROJECT_STATE` y firma de auditor├¡a.

## Uso recomendado
- Antes de exportar, validar que el contenido cumple la regla "No determinismo" (outputs simbólicos, educativos, orientativos).
- Registrar la exportación en el registro de proyecto (`01_PROJECT_STATE/PROJECT_STATE_CURRENT.md`) si la exportación se considera parte de una decisión mayor.

---

## Modalidad 2: Lectura Federada (Federation Hubs)

**Actualización 2026-01-20:** Este contrato se enfoca en Exportación Manual. Para **Lectura Federada** desde Federation Hubs, aplica lo siguiente:

### Definición
**Lectura Federada** es el proceso mediante el cual **Federation Hubs autorizados** (SCDF, SCID-5, MSHE) consumen artefactos normalizados de múltiples workspaces para generar síntesis holística transversal, **sin escribir en workspaces fuente**.

### Hubs Autorizados
Solo estos 3 workspaces pueden realizar lectura cross-workspace:
1. **SCDF** (Structured Contextual Data Formulation)
2. **SCID-5 Holístico** (Exploración socrática estructurada)
3. **MSHE** (Motor de Síntesis Holística Evaluativa)

### Reglas Obligatorias (NO NEGOCIABLES)
- ✅ **Solo lectura** de artefactos normalizados (`AnalysisRecordNormalized`, `HubFeedSnapshot`). **Nota:** Endpoints son NON-BINDING/FUTURE (Phase 1+).
- ❌ **Prohibida escritura** en workspaces fuente (no inyección, no sincronización, no modificación).
- ✅ **Auditoría automática** de toda lectura cross-workspace:
  - Log inmutable (`FederationAuditLog`, concepto Phase 1+) con timestamp, terapeuta solicitante, scope, dominios.
- ✅ **Consentimiento explícito** del consultante para síntesis federada: opt-in revocable ligado a `FederationReadScope` (dominios + rango temporal específico).
- ✅ **Visibilidad dual** nativa:
  - `summary_public` (consultante): lenguaje simbólico, sin scores ni IDs técnicos.
  - `summary_pro` (terapeuta): puede incluir scores, IDs, acrónimos técnicos/profesionales interpretados.
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
| **Auditoría** | Manual (registro de evento) | Automática (log inmutable, Phase 1+) |

### Restricciones de Lectura Federada
- **No acceso directo a DB**: Hubs consumen solo endpoints de normalización expuestos por workspaces (NON-BINDING/FUTURE, Phase 1+).
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

---
Este contrato es documental y vinculante. No prescribe la forma técnica de exportación; prescribe solo el comportamiento y las garantías.
