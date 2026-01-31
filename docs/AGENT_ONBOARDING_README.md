AGENT_ONBOARDING_README
======================

Rol obligatorio: Documentation & Governance Engineer (lectura previa a cualquier intervenci├│n).

1) Qu├⌐ es este proyecto

Este repositorio alberga una plataforma con Workspaces aislados que representan espacios de trabajo aut├│nomos (p. ej. notas cl├¡nicas, exportaciones, hist├│ricos). La integridad de los datos legacy es prioritaria y no puede ser modificada. Todas las exportaciones y transferencias de contenido deben ser manuales y expl├¡citas. La gobernanza es estricta: cambios en copy, exportaciones o comportamiento de aislamiento requieren revisiones documentales y cumplimiento del contrato de workspace.

2) Documentos que mandan (orden de lectura)

- `PROJECT_LOCK.md`
- `DOCUMENT_AUTHORITY_INDEX.md`
- `UNIFIED_CONSULTANTE_ARCHITECTURE.md` ⭐ **NUEVO**: Arquitectura unificada Patient→Consultante
- `WORKSPACE_ISOLATION_POLICY.md`
- `WORKSPACE_MATRIX.md`
- `WORKSPACE_EXPORT_CONTRACT.md`
- `UI_COPY_FREEZE.md`
- `PR_WORKSPACE_GOVERNANCE_CHECKLIST.md`

Leerlos en ese orden antes de cualquier modificaci├│n de UI, copy o interacciones entre workspaces.

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

---
### Regla de Ubicación de Documentación (VINCULANTE)
- Prohibido crear o mantener documentación normativa en la raíz del repo (/). La única ubicación canónica es `docs/`.
- Borradores temporales → `docs/legacy/<YYYY-MM-DD>_drafts/` (o `docs/_work/` si existe).
- Duplicados históricos / “root-shadow” → `docs/legacy/<YYYY-MM-DD>_root-shadow/`.
---

### Regla A (decisión editorial cerrada): Ubicación canónica de documentación (Docs-Only + Regla A Phase-1)

**Fecha efectiva:** 2026-01-20
**Estado:** BINDING (obligatoria para todos los agentes y revisores)

1) Canon absoluto
- La única ubicación canónica para documentación es: **`docs/`**
- Está **prohibido** crear o mantener documentación normativa en la raíz del repositorio (`/`) o fuera de `docs/`.

2) Clasificación de ubicaciones permitidas
- **`docs/technical/`**  
  Contiene *toda* la documentación técnica activa y operativa, incluyendo:
  - planes, contratos, inventarios,
  - reportes de implementación,
  - reportes debug/E2E,
  - resúmenes ejecutivos de ejecución,
  - cualquier material Phase-1 (Federation MVP) sin excepción.

- **`docs/releases/phase-0/`**  
  Contiene exclusivamente *releases* y reportes de cierre de **Phase-0 / Phase-0.1** (gobernanza y normalización).

- **`docs/swm/`**  
  Reportes y documentación específica de SWM.

- **`docs/EXPLORACIONES_CANONICAS/`**  
  Documentos de Exploraciones Canónicas.

- **`docs/legacy/<YYYY-MM-DD>_root-shadow/`**  
  Duplicados históricos, auditorías antiguas, trazas no canónicas recuperadas desde root.

- **`docs/legacy/<YYYY-MM-DD>_drafts/`**  
  Borradores temporales.

3) Regla A (decisión editorial cerrada)
- **Phase-1 y posteriores NO usan `docs/releases/phase-1/`.**
- Todo material Phase-1 (incluida evidencia de ejecución) se mantiene en **`docs/technical/`**.
- Esta decisión es vinculante para evitar loops operativos de documentación.

4) Mecanismo de cumplimiento
- Si un agente genera un `.md` fuera de `docs/`, se considera incumplimiento y debe corregirse mediante `git mv` antes de cualquier PR.
- Los movimientos deben hacerse siempre con `git mv` para preservar historial.

**Fin de regla.**

Cualquier `.md` creado fuera de `docs/` debe migrarse en el mismo PR o se bloquea la revisión.

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
- Auditor├¡as previas a cualquier cambio que toque workspaces o exportaciones.

5) Errores comunes a evitar

- "Es solo un texto" ΓÇö el copy transmite expectativas y permisos.
- "Es m├ís c├│modo para el usuario" ΓÇö no justificar automatismos que rompan aislamiento.
- "Ya que est├í la dataΓÇª" ΓÇö no derivar en uso no autorizado de data legacy.
- "Lo integro r├ípido" ΓÇö atajos producen regresiones y violan gobernanza.

6) Qu├⌐ hacer si tienes dudas

- Parar inmediatamente cualquier cambio.
- Revisar los documentos can├│nicos listados en la secci├│n 2.
- Preguntar a los responsables de gobernanza o al equipo de documentaci├│n antes de tocar UI o exportaciones.
---

## 7) Excepción: Federation Hubs (SCDF, SCID-5, MSHE)

Los **Federation Hubs** son workspaces especializados en síntesis holística transversal, autorizados para lectura cross-workspace bajo estrictas condiciones:

**Hubs autorizados:**
- **SCDF** (Structured Contextual Data Formulation): Genera formulación holística estructurada.
- **SCID-5 Holístico**: Genera preguntas socráticas para exploración.
- **MSHE** (Motor de Síntesis Holística Evaluativa): Genera síntesis de 6 ejes + alertas.

**Reglas obligatorias para Federation Hubs:**
- ✅ **Solo lectura** de artefactos normalizados (`AnalysisRecordNormalized`, `HubFeedSnapshot`).
- ❌ **Prohibida escritura** en workspaces fuente (no inyección, no sincronización).
- ✅ **Auditoría automática** de toda lectura cross-workspace (log inmutable: timestamp, terapeuta, scope, dominios). **Nota:** `FederationAuditLog` es un concepto arquitectónico (Phase 1+).
- ✅ **Consentimiento explícito** del consultante para síntesis federada: opt-in revocable ligado a `FederationReadScope` (dominios + rango temporal específico).
- ✅ **Visibilidad dual** nativa: `summary_public` (consultante) vs `summary_pro` (terapeuta).
- ✅ **No-diagnóstico** mantenido: outputs mayéuticos (preguntas/hipótesis, no sentencias).

**Referencia normativa:**
- `docs/HOLISTIC_FEDERATION_POLICY.md` — Política completa de federación holística (v2.0).
- `docs/FEDERATION_HUBS_CONTRACT.md` — Contratos técnicos para hubs.
- `docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO_v2.md` — IA Mayéutica y no-diagnóstico.

**⚠️ Importante:** Cualquier lectura cross-workspace fuera de estos 3 hubs autorizados es una violación de gobernanza y debe bloquearse.

---
Formato y reglas de lectura

- Markdown simple.
- Lenguaje claro, directo y t├⌐cnico; sin emojis, sin marketing, sin roadmap.

Criterio de ├⌐xito

Un agente nuevo debe comprender el sistema en menos de 10 minutos, no introducir cambios que rompan aislamiento y evitar preguntas b├ísicas sobre reglas NO negociables.
