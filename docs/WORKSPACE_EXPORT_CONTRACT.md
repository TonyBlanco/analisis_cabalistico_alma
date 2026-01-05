# Workspace Export Contract

## Prop├│sito
Definir el contrato documental para exportaciones manuales desde Workspaces hacia el `Workspace del Terapista` como notas est├íticas. Este documento ├║nicamente describe las reglas, tipos de salida permitidos y restricciones. No describe implementaci├│n t├⌐cnica.

## Tipos permitidos de export
- Resumen: texto corto estructurado (1ΓÇô3 p├írrafos). Uso: s├¡ntesis humana legible.
- Observaciones: fragmentos de texto libre que describen hallazgos observacionales (no cl├¡nicos).
- Snapshot: captura inmutable del estado simb├│lico/visual en formato legible (JSON o markdown adjunto como artefacto), destinada a referencia, no a ejecuci├│n.

## Reglas estrictas
- Export: siempre manual (usuario expl├¡cito debe iniciar export). No workflows autom├íticos.
- Sin v├¡nculo vivo: la exportaci├│n produce un artefacto est├ítico. No hay sincronizaci├│n ni endpoint persistente que mantenga v├¡nculo entre origen y destino.
- Sin sincronizaci├│n: cambios posteriores en el Workspace origen NO actualizan la exportaci├│n.
- Destino ├║nico: `Workspace del Terapista` como nota est├ítica (campo de notas integrativas o repositorio documental interno). Si se requiere duplicaci├│n, debe realizarse manualmente y documentarse.

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
- Antes de exportar, validar que el contenido cumple la regla "No cl├¡nico".
- Registrar la exportaci├│n en el registro de proyecto (`01_PROJECT_STATE/PROJECT_STATE_CURRENT.md`) si la exportaci├│n se considera parte de una decisi├│n mayor.

---
Este contrato es documental y vinculante. No prescribe la forma t├⌐cnica de exportaci├│n; prescribe solo el comportamiento y las garant├¡as.
