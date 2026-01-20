# MCMI4-MYSTIC Assignments (Backend Only)

This patch introduces a persistent Assignment model and RBAC-protected endpoints
for the mcmi4-mystic workflow. It does not modify db.sqlite3 manually.

## Verification Steps (PowerShell)

Start backend:
.\start-backend.ps1

Create assignment (therapist):
curl -X POST http://localhost:8000/api/assignments `
  -H "Authorization: Bearer <THERAPIST_TOKEN>" `
  -H "Content-Type: application/json" `
  -d '{ "patient_id":42, "test_type":"mcmi4-mystic", "assigned_to_user_id":101, "n_questions":195 }'

Start (consultant):
curl -X POST http://localhost:8000/api/assignments/123/start `
  -H "Authorization: Bearer <CONSULTANT_TOKEN>"

Submit answers:
curl -X POST http://localhost:8000/api/assignments/123/submit `
  -H "Authorization: Bearer <CONSULTANT_TOKEN>" `
  -H "Content-Type: application/json" `
  -d '{ "responses":[{"question_id":"MCMI_CL_001","answer":1}] }'

Trigger compute (internal/admin):
curl -X POST http://localhost:8000/api/assignments/123/compute `
  -H "Authorization: Bearer <SYSTEM_TOKEN>"

Get results (therapist):
curl -X GET http://localhost:8000/api/assignments/123/results `
  -H "Authorization: Bearer <THERAPIST_TOKEN>"

## Expected Responses (Examples)

Create assignment (201):
{
  "id": 123,
  "patient_id": 42,
  "test_type": "mcmi4-mystic",
  "assigned_to_user_id": 101,
  "questions_count": 195,
  "times_assigned": 1,
  "max_reassign": 4,
  "status": "assigned"
}

Start (200):
{ "status": "in_progress", "locked": true }

Submit (202):
{ "status": "pending_compute" }

Compute (200):
{ "status": "completed", "results": { "analysis_record_id": "...", "symbolic": {...}, "mshe": {...} } }

## Edge Cases

max_reassign_exceeded:
- When times_assigned >= max_reassign, POST /api/assignments returns 403 with error "max_reassign_exceeded".

Selection collisions:
- When the bank is exhausted, select_questions returns collisions and logs them in audit_log.

Idempotent compute:
- Repeating POST /api/assignments/:id/compute returns the same results and does not append duplicate audit entries.

## Rollback Notes

1) Remove the migration file:
   - backend/api/migrations/0069_assignment_model.py

2) Drop the Assignment table (SQL):
   DROP TABLE api_assignment;

3) Revert code changes by reversing the applied patch.

4) Restore db.sqlite3 from backup if an unexpected migration was applied.
