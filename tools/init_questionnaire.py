import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE','core.settings')
import django
django.setup()
from swm.mcmi4.models import WorkspaceInstance, WorkspaceSession
from swm.mcmi4.services.questionnaire_service import QuestionnaireService
import uuid

ws_id = '56dc6785-bb8d-4fa4-96de-e5bc87b3a12f'
session_id = '5ec88352-59f6-4cd7-aef0-4d62aedf8b24'

ws = WorkspaceInstance.objects.get(id=uuid.UUID(ws_id))
sess = WorkspaceSession.objects.get(id=uuid.UUID(session_id))
print('Workspace status before:', ws.status)
selected, meta = QuestionnaireService.select_questions(subject_user_id=ws.subject_user.id, id=str(ws.id))
config = QuestionnaireService.create_questionnaire_config(ws, selected, meta)
print('Created config:', config.id)
progress = QuestionnaireService.initialize_progress(ws, sess)
print('Created progress:', progress.id)
