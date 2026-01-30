# AI Engine → MSHE Integration

Purpose
-------
This document describes how the AI Engine (SHA interpreter) can export a compact summary to the BioEmotional MSHE module for synthesis and display in the therapist MSHE workspace.

Design
------
- After an AI interpretation is generated (for either a `TestResult` or `Assignment`), the orchestrator attaches `patient_id` to the JSON response.
- A new backend endpoint was added: `POST /api/ai-engine/export-to-mshe/<interpretation_id>/`.
- The endpoint will validate therapist ownership, create a `BioEmotionalPatientBrief` with a compact summary (summary, key insights, suggested diagnoses) and return the `brief_id` and `patient_id`.
- Frontend `AIInterpretationPanel` shows an `Exportar a MSHE` button after an interpretation is generated. When clicked it calls the new endpoint and redirects the therapist to `/dashboard/therapist/mshe?patient_id=<patient_id>`.

Notes & Safety
--------------
- Only therapists who own the patient can export.
- The created brief is stored under `BioEmotionalPatientBrief` and is not auto-published; the therapist can publish/share from the BioEmotional UI.
- Changes include defensive checks to avoid breaking existing flows.

Files changed
-------------
- `backend/api/ai_engine/orchestrator.py` - attach `patient_id` to orchestration output.
- `backend/api/ai_engine/views.py` - added `ExportInterpretationToMSHEView`.
- `backend/api/ai_engine/urls.py` - registered `/export-to-mshe/` route.
- `tonyblanco-app/components/ai/AIInterpretationPanel.tsx` - added `Exportar a MSHE` button.

Testing
-------
1. Generate an AI interpretation for an SHA assignment.
2. Click `Exportar a MSHE`.
3. Confirm a `BioEmotionalPatientBrief` is created (`/api/bioemotional/my-briefs/`) and MSHE page loads.

Commit Strategy
---------------
Commits created per logical change: backend changes, frontend changes, documentation.

If you want, I can open a PR with these changes or revert/publish any part on request.
