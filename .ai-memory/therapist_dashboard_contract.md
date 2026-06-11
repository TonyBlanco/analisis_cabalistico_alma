# Contrato congelado — Therapist Dashboard Workload (D1)

**Fecha:** 2026-06-11  
**Estado:** FROZEN — SUB-FRONTEND debe implementar contra este shape.  
**Endpoint:** `GET /api/therapist/dashboard/` (ampliado, backward-compatible)

## Principios

- `therapist=request.user` en todas las queries.
- Sin PHI clínico: no `main_complaint`, `clinical_history`, `notes`, `private_notes`, scores, `result_data`.
- Nombres de consultante permitidos (necesarios para operar); sin email/teléfono en lista.
- Lexico clínico: **no** incluido; gated server-side en otros endpoints.

## Response shape (nuevo bloque `workload`)

```json
{
  "total_patients": 0,
  "sessions_this_month": 0,
  "fichas_this_month": 0,
  "recent_sessions": [],
  "subscription_status": "active",
  "subscription_end_date": null,
  "workload": {
    "summary": {
      "patients_active": 0,
      "tests_assigned_total": 0,
      "tests_pending_total": 0,
      "tests_completed_total": 0,
      "action_items_total": 0
    },
    "patients": [
      {
        "id": 1,
        "display_name": "Nombre Apellido",
        "therapy_status": "active",
        "therapy_level": "assiyah",
        "has_login": true,
        "profile_complete": true,
        "last_session_at": "2026-06-01T10:00:00Z",
        "sessions_count": 3,
        "tests": {
          "assigned": 2,
          "pending": 1,
          "completed": 1
        },
        "tests_recent": [
          {
            "assignment_id": 10,
            "test_module_id": 3,
            "test_code": "phq9",
            "test_name": "PHQ-9",
            "status": "pending",
            "result_id": null,
            "assigned_at": "2026-06-05T12:00:00Z",
            "completed_at": null
          }
        ],
        "progress": {
          "stage": "assiyah",
          "sessions_count": 3,
          "last_activity_at": "2026-06-05T12:00:00Z"
        },
        "action_items": [
          {
            "type": "test_pending",
            "label": "1 test pendiente de respuesta",
            "href": "/dashboard/therapist/patients/1"
          }
        ]
      }
    ],
    "action_items": [
      {
        "type": "completed_unreviewed",
        "patient_id": 1,
        "patient_display_name": "Nombre Apellido",
        "test_code": "gad7",
        "test_name": "GAD-7",
        "result_id": 42,
        "label": "GAD-7 completado — revisar",
        "href": "/dashboard/therapist/tests/results/42"
      }
    ]
  }
}
```

## Definiciones de estado de test (por consultante)

| status | Criterio |
|--------|----------|
| `assigned` | `UserTestAccess.has_special_access=True` para `patient.user`, sin `TestResult` completado para ese módulo |
| `pending` | Asignado y sin resultado con score/datos (incluye legacy assignment markers) |
| `completed` | `TestResult` vinculado a `patient` o matcher tolerante (mismo criterio que `PatientPreviousTestsView`) sin `assignment_only` |

Reutilizar lógica de matching de `PatientPreviousTestsView` — **no duplicar reglas divergentes**.

## Campos legacy (se mantienen)

- `total_patients`, `sessions_this_month`, `fichas_this_month`, `recent_sessions`, `subscription_*`

## `/api/therapist/sessions/` y `/api/therapist/notes/` (D4)

- **Decisión:** NO cablear en dashboard principal; datos de avance vienen agregados en `workload.patients[].progress` y `last_session_at`.
- **Estado:** endpoints se mantienen para ficha de paciente y sesión nueva; documentar como "consumo diferido — no dashboard home".
- **Incidencia 2026-01-05:** cerrar al cablear `workload` + UI operativa.

## Frontend hook

- `useTherapistWorkload()` → `GET /api/therapist/dashboard/` → expone `workload` + estados loading/error/empty.