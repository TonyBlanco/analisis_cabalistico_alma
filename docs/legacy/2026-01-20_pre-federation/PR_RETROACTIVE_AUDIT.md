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

PR_RETROACTIVE_AUDIT
=====================

Rol: Documentation & Governance Engineer (auditor├¡a documental, no intervenci├│n t├⌐cnica).

Alcance

- Revisar PRs recientes y commits relacionados con UI, copy, export y cambios que toquen Workspaces o notas cl├¡nicas.
- No es necesario auditar todo el historial; enfocar en PRs relevantes a copy, exportaciones y aislamiento.

Metodolog├¡a

Para cada PR revisada crear una entrada con los siguientes campos. No pedir cambios ni abrir debates t├⌐cnicos; el resultado es documental.

Template de entrada (usar tabla cuando ayude):

| PR / Commit | ├ürea afectada | Checklist aplicado | Riesgo | Tipo de riesgo | Veredicto documental |
|-------------|---------------|--------------------|--------|----------------|---------------------|
| `#PR123` / `abcd1234` | Export UI / Workspaces | Lenguaje: S├¡; Workspaces: S├¡; Exportaciones: No | Medio | Expectativa de automatismo | Vigilar |

Campos y opciones

- PR / Commit: identificador (PR number o commit SHA).
- ├ürea afectada: componente(s) o m├│dulo(s) (UI copy, ExportHistory, Notas cl├¡nicas, Workspaces, etc.).
- Checklist aplicado: indicar secci├│n por secci├│n si se aplic├│ (Lenguaje / Workspaces / Exportaciones / Gobernanza). "S├¡" / "Parcial" / "No".
- Riesgo detectado: Ninguno / Bajo / Medio / Alto.
- Tipo de riesgo: Lenguaje / Expectativa de automatismo / Aislamiento / Gobernanza.
- Veredicto documental: OK / Vigilar / No repetir patr├│n.

Reglas de auditor├¡a

- Documentar solo riesgos y evidencia encontradas; no proponer remediaciones t├⌐cnicas.
- Registrar ejemplos de copy o l├¡neas de code relevantes (SHA y archivo), sin modificar PRs.
- Priorizar PRs que modifican strings que inducen a automatismo ("Copiar a notas", "Insertar en s├¡ntesis", "Se inyecta en ...").
- Marcar como "Alto" todo cambio que active automatismo o que modifique la persistencia de data legacy.

Resultado esperado

- Lista separada de PRs "seguras" y PRs con riesgo (con su veredicto documental).
- Patr├│n(s) recurrente(s) detectados y ejemplos (sin proponer arreglos).
- Documento conciso y utilizable por revisores futuros como referencia para bloquear regresiones.

Formato y reglas

- Markdown t├⌐cnico.
- Usar tablas para las entradas principales cuando aporten claridad.
- Sin narrativa extensa ni juicios t├⌐cnicos; lenguaje directo y factuales.

Criterio de ├⌐xito

La auditor├¡a sirve como referencia clara y reduce la probabilidad de regresiones relacionadas con copy, export y aislamiento sin generar deuda documental.
