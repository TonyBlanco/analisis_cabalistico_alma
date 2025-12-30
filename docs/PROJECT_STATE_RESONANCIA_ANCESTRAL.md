# PROJECT_STATE — Resonancia Ancestral (SWM)

## Contexto

Este documento describe el estado del SWM **Resonancia Ancestral** en fase de recuperación post-T5.

## Estado previo (pre-T5)

En este repositorio no existe un contrato técnico canónico ni una implementación previa verificable del SWM “Resonancia Ancestral”.
Las referencias externas a “A1–A4, B3, T1–T4” no están documentadas aquí, por lo que no se reconstruyen ni se asumen.

## Reintegración realizada (este commit)

- Launcher en sidebar del terapeuta (solo navegación): `tonyblanco-app/app/(dashboard)/dashboard/therapist/components/TherapistSidebar.tsx`
- Ruta SWM propia: `tonyblanco-app/app/(dashboard)/dashboard/therapist/(swm)/resonancia-ancestral/page.tsx`
- Workspace aislado (sin clínica, sin legacy): `tonyblanco-app/components/ResonanciaAncestralWorkspace/ResonanciaAncestralWorkspace.tsx`
- Scaffolding visual T1–T4 **placeholder** (solo lectura, sin inferencias, sin cálculo, sin backend).

## Qué NO se toca (innegociable)

- Core clínico del terapeuta (layout, lógica, estado global clínico).
- Imports desde `_legacy_*`.
- Guards globales o cambios de requisitos de identidad.
- APIs backend.

## Validación manual

1. `npm -C tonyblanco-app run build`
2. Login como terapeuta.
3. Verificar que en el sidebar aparece “Resonancia Ancestral”.
4. Click → abre `/dashboard/therapist/resonancia-ancestral`.
5. Sin consultante activo → muestra mensaje informativo (no bloquea, no crashea).
6. Con consultante activo → se renderiza UI simbólica (T1–T4) en modo read-only.

