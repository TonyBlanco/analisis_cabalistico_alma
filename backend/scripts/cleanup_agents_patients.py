import os, django, json, sys
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from django.db.models import Q
from api.models import Patient
from api.test_models import TestResult, Assignment, UserTestAccess

# Criteria: patients whose therapist username is not 'armando' (keep patient id 4)
EXCLUDE_THERAPIST = 'armando'
KEEP_PATIENT_ID = 4

patients = Patient.objects.exclude(id=KEEP_PATIENT_ID).select_related('therapist','user')
candidates = [p for p in patients if (p.therapist and p.therapist.username.lower() != EXCLUDE_THERAPIST)]

summary = []
for p in candidates:
    user = p.user
    tr_linked_qs = TestResult.objects.filter(patient=p)
    tr_orphan_qs = TestResult.objects.filter(user=user, patient__isnull=True) if user else TestResult.objects.none()
    assign_qs = Assignment.objects.filter(Q(clinical_profile=p) | Q(subject_user=user))
    access_qs = UserTestAccess.objects.filter(user=user) if user else UserTestAccess.objects.none()

    counts = {
        'patient_id': p.id,
        'patient_name': p.full_name,
        'therapist': p.therapist.username if p.therapist else None,
        'user_id': user.id if user else None,
        'test_results_linked': tr_linked_qs.count(),
        'test_results_orphan': tr_orphan_qs.count(),
        'assignments': assign_qs.count(),
        'test_accesses': access_qs.count(),
    }
    summary.append((p, tr_linked_qs, tr_orphan_qs, assign_qs, access_qs, counts))

# Print summary
print(json.dumps({'candidates': [s[5] for s in summary]}, ensure_ascii=False, indent=2))

# Execute deletions
total_deleted = {'test_results':0,'assignments':0,'test_accesses':0}
for p, tr_linked_qs, tr_orphan_qs, assign_qs, access_qs, counts in summary:
    if tr_orphan_qs.exists():
        deleted = tr_orphan_qs.delete()
        total_deleted['test_results'] += deleted[0]
    if tr_linked_qs.exists():
        deleted = tr_linked_qs.delete()
        total_deleted['test_results'] += deleted[0]
    if assign_qs.exists():
        deleted = assign_qs.delete()
        total_deleted['assignments'] += deleted[0]
    if access_qs.exists():
        deleted = access_qs.delete()
        total_deleted['test_accesses'] += deleted[0]

print('\nDeletion summary:')
print(json.dumps(total_deleted, ensure_ascii=False, indent=2))
print(f"Processed {len(summary)} candidate patients.")
