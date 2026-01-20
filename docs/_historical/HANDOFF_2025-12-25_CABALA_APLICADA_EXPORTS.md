# Handoff — 2025-12-25 (Cabala Aplicada → History/Exports)

Fecha: 2025-12-25

Branch actual: `feat/tarot-workspace-e2e`

## Objetivo del día

1) Que el workspace terapeuta **/dashboard/therapist/cabala-aplicada** reporte/persista ejecuciones como artefactos longitudinales (historia del usuario).
2) Que esos artefactos queden disponibles para **History/Professional history** y para el **Holistic Export**.

## Qué quedó implementado

### 1) Nuevo endpoint de persistencia para Cabala Aplicada (backend)

- Endpoint:
  - `POST /api/therapist/patients/<id>/cabala-aplicada/records/`
- Implementación:
  - Guarda un `AnalysisRecord(kind='kabbalah')` con:
    - `module_code = CABALA_APLICADA_<method>` (truncado a 64)
    - `computed_result.cabala_aplicada = { method_id, method_name, method_output, tree_state, backend_structural_state, symbolic_interpretation }`
    - `visibility = therapist`
    - ownership validada por `patient.therapist == request.user`

Archivos:
- backend/api/cabalistic_views.py
- backend/api/urls.py

### 2) Frontend: persistencia automática al presionar “Ejecutar”

- En Cabala Aplicada, el botón “Ejecutar” ahora hace:
  - corre el método local (pitágoras/gematrías/temurah/notarikon/etc)
  - genera el tree state
  - llama al backend para persistir (best-effort; no bloquea UX)

Archivos:
- tonyblanco-app/components/CabalAppliedWorkspace/CabalAppliedVisualCore.tsx
- tonyblanco-app/lib/cabala-aplicada-api.ts

### 3) Holistic export: incluye ejecuciones de Cabala Aplicada

- El digest `sections.cabalistic.cabala_aplicada` (ya existente) ahora expone también ejecuciones guardadas como `computed_result.cabala_aplicada`.
- Mantiene compatibilidad con el flujo previo de `kabbalah_engine`.

Archivo:
- backend/api/patient_holistic_export_views.py

## Cambios relacionados (ya estaban en WIP pero se incluyen en el commit)

Estos archivos aparecen como modificados en el working tree actual y se incluyen para mantener el estado consistente:
- backend/api/analysis_views.py (annotations PATCH + regeneración markdown para HOLISTIC_EXPORT_V1)
- tonyblanco-app/components/PatientSymbolicOverview/index.tsx
- tonyblanco-app/components/TherapistClinicalDashboard/RightPanel.tsx
- tonyblanco-app/components/TherapistClinicalDashboard/index.tsx
- tonyblanco-app/components/TherapistWorkspace/PanelDock.tsx
- tonyblanco-app/components/TherapistWorkspace/HistoryPanelContent.tsx
- tonyblanco-app/components/HolisticExportHistory/*
- tonyblanco-app/lib/report-printing.ts

(Nota: varias de estas piezas corresponden al flujo de “History + PDF/print” ya trabajado.)

## Cómo verificar mañana (rápido)

1) Levantar stack
- `powershell -NoProfile -Command "cd d:\analisis_cabalistico_alma; .\start-all.ps1"`

2) Login como terapeuta → abrir paciente → ir a:
- `/dashboard/therapist/cabala-aplicada`

3) Seleccionar un método → click “Ejecutar”
- Debe persistir un record (silencioso si falla).

4) Confirmar en backend (opción A: UI)
- Ir a la ficha del usuario (espacio profesional) y revisar History/exports.

5) Confirmar en backend (opción B: API)
- `GET /api/analysis-records/?patient_id=<id>`
- Debe aparecer `module_code` tipo `CABALA_APLICADA_pitagoras` (u otro método) y en `computed_result.cabala_aplicada` el payload.

6) Confirmar Holistic Export
- Generar un Holistic Export del usuario.
- En el JSON/markdown, la sección “Cábala aplicada (registros)” debe aumentar.

## Riesgos / notas

- Persistencia desde frontend es best-effort (no bloquea UX). Si hay error de permisos/token, solo se loguea en consola.
- `AnalysisRecordSerializer` valida snapshots en `validate()` para algunos kinds (especialmente `clinical_test`).
  - Para Cabala Aplicada se crea el record directamente en el view (no pasa por serializer validate), para evitar requisitos estrictos de snapshots.
- Si se decide que Cabala Aplicada debe tener su propio `kind` (más semántico), habría que extender `KIND_CHOICES` y el export digest.

## Próximo paso sugerido

- Mostrar estos records de Cabala Aplicada explícitamente en el panel History (p.ej. etiquetándolos como “Cabala Aplicada”) para que el terapeuta los distinga de `kabbalah_core`.
