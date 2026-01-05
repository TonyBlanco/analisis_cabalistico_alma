from datetime import datetime, timezone as dt_timezone
from api.test_models import TestResult

# T6.9 safe cleanup script
# Deletes TestResult rows matching:
# - patient_id == PATIENT_ID
# - created_at < FECHA_CORTE
# - details->source == 'patient_self'

PATIENT_ID = 1
FECHA_CORTE = datetime(2024, 7, 1, tzinfo=dt_timezone.utc)

qs = TestResult.objects.filter(
    patient_id=PATIENT_ID,
    created_at__lt=FECHA_CORTE,
).filter(
    details__source='patient_self'
)

print('T6.9 patient_self cleanup:')
print('Patient ID:', PATIENT_ID)
print('Cutoff date:', FECHA_CORTE.isoformat())
print('Matched count:', qs.count())
for r in qs.order_by('created_at'):
    print(r.id, getattr(r, 'test_id', None), getattr(r, 'test_module_id', None), r.details, r.created_at)

if qs.exists():
    deleted_count, _ = qs.delete()
    print('Deleted objects:', deleted_count)
else:
    print('No objects to delete.')
