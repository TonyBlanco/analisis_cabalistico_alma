import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.test_models import Assignment, TestResult
from api.models import Patient
from django.contrib.auth.models import User

# Fix TestResult 110
tr = TestResult.objects.get(id=110)
p = Patient.objects.filter(user=tr.user, is_active=True).first()

if p and not tr.patient:
    tr.patient = p
    tr.save()
    print(f'Fixed TestResult {tr.id}: linked to Patient {p.id}')

# Update Assignment 27 with results
a = Assignment.objects.get(id=27)
if a.status != 'completed':
    a.status = 'completed'
    a.results = tr.result_data
    a.save()
    print(f'Fixed Assignment {a.id}: status=completed')

print('Done!')
