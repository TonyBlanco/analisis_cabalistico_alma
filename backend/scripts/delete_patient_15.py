import os, django, sys, json
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from api.models import Patient

PATIENT_ID = 15
try:
    p = Patient.objects.get(id=PATIENT_ID)
except Patient.DoesNotExist:
    print(json.dumps({'status':'not_found','patient_id':PATIENT_ID}, ensure_ascii=False))
    raise SystemExit(0)

info = {
    'id': p.id,
    'full_name': p.full_name,
    'therapist': p.therapist.username if p.therapist else None,
    'user_id': p.user.id if p.user else None,
}
print(json.dumps({'deleting': info}, ensure_ascii=False))

# Delete patient record
p.delete()
print(json.dumps({'status':'deleted','patient_id':PATIENT_ID}, ensure_ascii=False))
