# Frontend Holistic Rebrand — 2026-01-31

Resumen de cambios realizados (intervención de UI para eliminar nombres/tags clínicos visibles):

- Fecha: 2026-01-31
- Autor: cambios aplicados por agente (ediciones en repo local)
- Objetivo: Remover acrónimos y framing clínico de las interfaces de usuario, manteniendo `test_code`/IDs y contratos API.

Cambios de archivos (user-visible):

- Modified: app/(dashboard)/dashboard/therapist/components/TherapistSidebar.tsx
  - Replaced menu label `Pacientes` → `Consultantes`.

- Modified: app/(dashboard)/dashboard/patient/tests/phq9/phq9.config.ts
  - Updated `target_population` from `Pacientes adultos` → `Consultantes adultos`.
  - Title remains: `Pulso del Ánimo — 9 señales` (holistic label preserved).

- Modified: app/(dashboard)/dashboard/therapist/(swm)/swm/mcmi4/[workspace_id]/page.tsx
  - Replaced user-facing sentence `Puedes acceder a la reflexión desde el panel de gestión de pacientes.`
    → `Puedes acceder a la reflexión desde el panel de consultantes.`

Notas sobre alcance y seguridad de cambios:

- No se modificaron `test_code` ni IDs de pregunta. API contracts permanecen intactos.
- Cambios son textuales/UI-only, pensados para evitar sugerir diagnóstico automático.
- Se han reescrito varios otros archivos previamente (registry/data) en rondas anteriores; este documento refleja los cambios realizados hoy y las tareas pendientes.

Tareas pendientes (ver TODO list):

- Completar reescritura en `lib/clinicalTestKnowledge.registry.ts` y `data/tests-questions.ts` donde queden entradas clínicas visibles.
- Reescribir `data/tarot-guide-sections.tsx` y revisar SWM adicionales para copy 'clínico' residual.
- Ejecutar build y typecheck opcional de Next.js para verificar que no hay errores de tipo.

Commits incluidos:
- Se creó este documento y se guardaron los archivos modificados en el commit (mensaje detallado en el historial de commits).

Contacto / next steps:
- Si quieres que haga el build (`npm run build` en `tonyblanco-app`) o que siga con los items pendientes, indícamelo y lo ejecuto.
