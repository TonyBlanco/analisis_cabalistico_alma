from django.utils import timezone
from datetime import datetime, timezone as dt_timezone
from api.test_models import TestResult

# T6.8 safe cleanup script
# Deletes TestResult rows matching:
# - patient_id == PATIENT_ID
# - test_module IS NULL
# - created_at < FECHA_CORTE
# - excludes records with details->legacy_assignment == True

PATIENT_ID = 1
FECHA_CORTE = datetime(2024, 6, 1, tzinfo=dt_timezone.utc)

qs = TestResult.objects.filter(
    patient_id=PATIENT_ID,
    test_module__isnull=True,
    created_at__lt=FECHA_CORTE,
).exclude(
    details__legacy_assignment=True
)

print('T6.8 safe cleanup:')
print('Patient ID:', PATIENT_ID)
print('Cutoff date:', FECHA_CORTE.isoformat())
print('Matched count:', qs.count())
for r in qs.order_by('created_at'):
    print(r.id, getattr(r, 'test_id', None), r.created_at)

if qs.exists():
    deleted_count, _ = qs.delete()
    print('Deleted objects:', deleted_count)
else:
    print('No objects to delete.')
