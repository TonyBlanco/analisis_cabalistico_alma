PR_RETROACTIVE_AUDIT
=====================

Rol: Documentation & Governance Engineer (auditoría documental, no intervención técnica).

Alcance

- Revisar PRs recientes y commits relacionados con UI, copy, export y cambios que toquen Workspaces o notas clínicas.
- No es necesario auditar todo el historial; enfocar en PRs relevantes a copy, exportaciones y aislamiento.

Metodología

Para cada PR revisada crear una entrada con los siguientes campos. No pedir cambios ni abrir debates técnicos; el resultado es documental.

Template de entrada (usar tabla cuando ayude):

| PR / Commit | Área afectada | Checklist aplicado | Riesgo | Tipo de riesgo | Veredicto documental |
|-------------|---------------|--------------------|--------|----------------|---------------------|
| `#PR123` / `abcd1234` | Export UI / Workspaces | Lenguaje: Sí; Workspaces: Sí; Exportaciones: No | Medio | Expectativa de automatismo | Vigilar |

Campos y opciones

- PR / Commit: identificador (PR number o commit SHA).
- Área afectada: componente(s) o módulo(s) (UI copy, ExportHistory, Notas clínicas, Workspaces, etc.).
- Checklist aplicado: indicar sección por sección si se aplicó (Lenguaje / Workspaces / Exportaciones / Gobernanza). "Sí" / "Parcial" / "No".
- Riesgo detectado: Ninguno / Bajo / Medio / Alto.
- Tipo de riesgo: Lenguaje / Expectativa de automatismo / Aislamiento / Gobernanza.
- Veredicto documental: OK / Vigilar / No repetir patrón.

Reglas de auditoría

- Documentar solo riesgos y evidencia encontradas; no proponer remediaciones técnicas.
- Registrar ejemplos de copy o líneas de code relevantes (SHA y archivo), sin modificar PRs.
- Priorizar PRs que modifican strings que inducen a automatismo ("Copiar a notas", "Insertar en síntesis", "Se inyecta en ...").
- Marcar como "Alto" todo cambio que active automatismo o que modifique la persistencia de data legacy.

Resultado esperado

- Lista separada de PRs "seguras" y PRs con riesgo (con su veredicto documental).
- Patrón(s) recurrente(s) detectados y ejemplos (sin proponer arreglos).
- Documento conciso y utilizable por revisores futuros como referencia para bloquear regresiones.

Formato y reglas

- Markdown técnico.
- Usar tablas para las entradas principales cuando aporten claridad.
- Sin narrativa extensa ni juicios técnicos; lenguaje directo y factuales.

Criterio de éxito

La auditoría sirve como referencia clara y reduce la probabilidad de regresiones relacionadas con copy, export y aislamiento sin generar deuda documental.
