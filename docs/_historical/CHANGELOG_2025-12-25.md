# Changelog — 2025-12-25

## Resumen
Esta actualización consolida el flujo clínico (terapeuta) y el autoservicio (paciente) alrededor de:

- SCDF operativo en rutas actuales (sin redirecciones a legacy/404).
- Edición de paciente por terapeuta (modal centrado, overlay correcto y campos completos).
- Persistencia consistente de identidad (alineación entre `Patient.full_name` y `UserProfile.legal_full_name`).
- Nuevos tests internos (Wellness + Screening General) y visor de resultados para terapeutas.
- Normalización de `NEXT_PUBLIC_API_URL` para evitar regresiones por URLs inconsistentes.

---

## Backend (Django/DRF)

### Demografía + anotaciones clínicas
- Se agregan campos de demografía básica:
  - `Patient.biological_sex`, `Patient.gender_identity`
  - `UserProfile.biological_sex`, `UserProfile.gender_identity`
- Se agrega `AnalysisRecord.therapist_annotations` (JSON) para adjuntar anotaciones del terapeuta.
- Migración: `backend/api/migrations/0041_analysisrecord_therapist_annotations_and_more.py`

### Endpoints relevantes
- Perfil paciente (terapeuta): `PATCH /api/therapist/patients/<id>/profile/update/`
  - Importante: el backend actualiza `UserProfile.legal_full_name` **solo** si viene en el payload.

---

## Frontend (Next.js / App Router)

### Modal “Editar paciente” (terapeuta)
- Modal centrado, con overlay por encima del header (portal en `document.body`).
- Campos incluidos (además de los existentes):
  - `full_name` (fuente primaria para identidad del paciente)
  - `biologicalSex`, `genderIdentity`
  - Coordenadas y timezone de nacimiento (solo lectura): `birth_latitude`, `birth_longitude`, `birth_timezone`
- Guardado consistente:
  - Se envía `full_name` (actualiza `Patient`)
  - También se envía `legal_full_name` cuando corresponde (mantiene sincronía con cuenta ligada)

Archivos principales:
- `tonyblanco-app/components/patient/PatientProfileEditor.tsx`
- `tonyblanco-app/components/clinical/ClinicalContextHeader.tsx`
- `tonyblanco-app/components/ActivePatientIndicator.tsx`

### SCDF en rutas actuales
- Redirección de la ruta legacy de herramientas hacia la ruta de terapeuta.
- Wrapper cliente para asegurar `patient_id` en query cuando hay paciente activo.

Archivos principales:
- `tonyblanco-app/app/(dashboard)/dashboard/therapist/(core)/scdf/page.tsx`
- `tonyblanco-app/app/(dashboard)/dashboard/therapist/(core)/scdf/scdf-client.tsx`
- `tonyblanco-app/app/(dashboard)/dashboard/tools/scdf/page.tsx`

### Visor de resultados para terapeuta
- Nueva ruta: `/dashboard/therapist/tests/results/[id]`
- Vista específica para `phq-9`, `gad-7`, `bdi-ii`, `bai`, `isi`, `wellness`, `screening-general` y fallback genérico (JSON).

Archivo:
- `tonyblanco-app/app/(dashboard)/dashboard/therapist/(core)/tests/results/[id]/page.tsx`

### Tests paciente (submit + UX)
- Mejora de envío con `submitting`/errores y navegación a resultados.
- Nuevos tests internos:
  - `screening-general`
  - `wellness`

Archivos principales:
- `tonyblanco-app/app/(dashboard)/dashboard/patient/tests/*/page.tsx`
- `tonyblanco-app/components/PatientAssignedTestsSection.tsx`
- `tonyblanco-app/lib/clinicalTests.registry.ts`

### Normalización de API base URL
- Helper para normalizar `NEXT_PUBLIC_API_URL` (agrega `/api` si falta, elimina trailing slashes).

Archivo:
- `tonyblanco-app/lib/api-base.ts`

---

## Operación / Deploy

- Aplicar migraciones backend: `python manage.py migrate`
- Verificar que `NEXT_PUBLIC_API_URL` apunte al backend (con o sin `/api` — se normaliza).

