# PROJECT STATE – LOCKED

## Arquitectura
- Frontend: Next.js App Router
- Backend: Django + DRF
- Auth: Token-based
- Roles: admin / therapist / personal / patient (SEALED)
- Execution modes: patient_self / therapist_clinical (SEALED)

## Núcleo de datos
- AnalysisRecord: IMPLEMENTADO
- Snapshots: birth_data_snapshot + algorithm_snapshot (inmutables)
- Adapters: clinical / kabbalah / astrology / legacy
- Service: create_and_execute_analysis
- Legacy: NO TOCADO

## Dashboards
- Admin: mínimo funcional
- Therapist: workspace clínico completo
- Personal: mínimo clínico
- Patient: pendiente de integración final

## Reglas clave
- Admin no es actor clínico
- execution_mode nunca viene del request
- No autoevaluación
- Ownership terapeuta–paciente obligatorio

## Estado actual
- Build estable
- Zero regression
- Fase siguiente: consumidores de AnalysisRecord
