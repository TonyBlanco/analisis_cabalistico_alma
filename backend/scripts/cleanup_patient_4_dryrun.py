import os, django, json, sys
# Ensure backend folder is on sys.path so `core` settings module is importable
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from django.db.models import Q
from api.models import Patient
from api.test_models import TestResult, Assignment, UserTestAccess

patient_id = 4
try:
    p = Patient.objects.get(id=patient_id)
except Patient.DoesNotExist:
    print(json.dumps({'error':'patient_not_found','patient_id':patient_id}))
    raise SystemExit(0)

if not p.user:
    print(json.dumps({'error':'patient_has_no_user','patient_id':patient_id}))
    raise SystemExit(0)

tr_linked = TestResult.objects.filter(patient=p).count()
tr_orphan = TestResult.objects.filter(user=p.user, patient__isnull=True).count()
assign_count = Assignment.objects.filter(Q(clinical_profile=p) | Q(subject_user=p.user)).count()
access_count = UserTestAccess.objects.filter(user=p.user).count()

total = tr_linked + tr_orphan + assign_count + access_count

out = {
    'patient': {'id': p.id, 'full_name': p.full_name},
    'counts': {
        'test_results_linked': tr_linked,
        'test_results_orphan': tr_orphan,
        'assignments': assign_count,
        'test_accesses': access_count,
        'total': total
    }
}
print(json.dumps(out, ensure_ascii=False))
