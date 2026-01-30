import os
import django
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.test_models import Assignment
from api.ai_engine.orchestrator import AIEngineOrchestrator

assignment_id = 34
try:
    a = Assignment.objects.get(id=assignment_id)
    user = a.patient.therapist
    class F: pass
    f = F()
    f.id = a.id
    f.test_module = type('t', (), {'code': a.test_type})
    f.details = a.results
    f.created_at = a.completed_at or a.created_at
    f.patient = a.patient

    print('Calling orchestrator for assignment', assignment_id)
    result = AIEngineOrchestrator().generate_interpretation(f, user, force_refresh=False)
    print('RESULT:')
    print(result)
except Exception:
    traceback.print_exc()
