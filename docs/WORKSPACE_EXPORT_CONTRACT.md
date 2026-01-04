# Workspace Export Contract

## Propósito
Definir el contrato documental para exportaciones manuales desde Workspaces hacia el `Workspace del Terapista` como notas estáticas. Este documento únicamente describe las reglas, tipos de salida permitidos y restricciones. No describe implementación técnica.

## Tipos permitidos de export
- Resumen: texto corto estructurado (1–3 párrafos). Uso: síntesis humana legible.
- Observaciones: fragmentos de texto libre que describen hallazgos observacionales (no clínicos).
- Snapshot: captura inmutable del estado simbólico/visual en formato legible (JSON o markdown adjunto como artefacto), destinada a referencia, no a ejecución.

## Reglas estrictas
- Export: siempre manual (usuario explícito debe iniciar export). No workflows automáticos.
- Sin vínculo vivo: la exportación produce un artefacto estático. No hay sincronización ni endpoint persistente que mantenga vínculo entre origen y destino.
- Sin sincronización: cambios posteriores en el Workspace origen NO actualizan la exportación.
- Destino único: `Workspace del Terapista` como nota estática (campo de notas integrativas o repositorio documental interno). Si se requiere duplicación, debe realizarse manualmente y documentarse.

## Metadatos mínimos que debe incluir una exportación
- origen_workspace: identificador del Workspace origen
- tipo_export: {Resumen|Observaciones|Snapshot}
- timestamp: ISO8601
- author_id: identificador del usuario que ejecutó la exportación
- artefacto: contenido exportado (texto o archivo adjunto)

## Restricciones y advertencias
- No clínico: el contenido exportado NO debe contener diagnósticos, puntuaciones clínicas, ni recomendaciones terapéuticas.
- No automático: ningún agente o proceso debe disparar exportaciones sin la intervención explícita del usuario.
- No reversible técnicamente: la exportación crea un artefacto estático; restaurar vínculo o retro-sincronizar está fuera del alcance de este contrato y requiere autorización de gobernanza.

## Cumplimiento
- Todos los procesos que implementen export deben registrar el metadato `export_trace` en el registro de auditoría (usuario, timestamp, origen_workspace).
- Cualquier excepción a estas reglas requiere aprobación documentada en `01_PROJECT_STATE` y firma de auditoría.

## Uso recomendado
- Antes de exportar, validar que el contenido cumple la regla "No clínico".
- Registrar la exportación en el registro de proyecto (`01_PROJECT_STATE/PROJECT_STATE_CURRENT.md`) si la exportación se considera parte de una decisión mayor.

---
Este contrato es documental y vinculante. No prescribe la forma técnica de exportación; prescribe solo el comportamiento y las garantías.