import os
import json
import django
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from swm.mcmi4.models import WorkspaceInstance, WorkspaceArtifact, WorkspaceSession

# Workspace id used in the P0 run
WORKSPACE_ID = '56dc6785-bb8d-4fa4-96de-e5bc87b3a12f'

out_dir = Path(__file__).resolve().parent.parent

progress = WorkspaceArtifact.objects.filter(
    workspace_instance__id=WORKSPACE_ID,
    artifact_type='questionnaire_progress'
).order_by('-created_at').first()

completion = WorkspaceArtifact.objects.filter(
    workspace_instance__id=WORKSPACE_ID,
    artifact_type='questionnaire_completion'
).order_by('-created_at').first()

config = WorkspaceArtifact.objects.filter(
    workspace_instance__id=WORKSPACE_ID,
    artifact_type='questionnaire_config'
).order_by('-created_at').first()

session = WorkspaceSession.objects.filter(workspace_instance__id=WORKSPACE_ID).order_by('-started_at').first()

if not progress:
    raise SystemExit('questionnaire_progress artifact not found')
if not completion:
    raise SystemExit('questionnaire_completion artifact not found')

# Prepare progress export
progress_payload = {
    'responses': progress.content.get('responses', {}),
    'completed_worlds': progress.content.get('completed_worlds', []),
    'progress_percentage': progress.content.get('progress_percentage'),
    'worlds_progress': progress.content.get('worlds_progress', {})
}

# Prepare completion export
completion_content = completion.content or {}
responses = completion_content.get('responses', {})
answered_questions = completion_content.get('total_answered', len(responses))

# time_spent_seconds (if session has timestamps)
time_spent_seconds = None
if session and session.started_at and session.ended_at:
    delta = session.ended_at - session.started_at
    time_spent_seconds = int(delta.total_seconds())

completion_payload = {
    'responses': responses,
    'worlds_completion': completion_content.get('completed_worlds', []),
    'answered_questions': answered_questions,
    'time_spent_seconds': time_spent_seconds,
    'metadata_final': {
        'artifact_metadata': completion.metadata or {},
        'selection_metadata': config.content.get('selection_metadata', {}) if config else {}
    }
}

# Write files
p1 = out_dir / 'questionnaire_progress.final.json'
p2 = out_dir / 'questionnaire_completion.json'

with open(p1, 'w', encoding='utf-8') as f:
    json.dump(progress_payload, f, ensure_ascii=False, indent=2)

with open(p2, 'w', encoding='utf-8') as f:
    json.dump(completion_payload, f, ensure_ascii=False, indent=2)

print('WROTE', p1)
print('WROTE', p2)
