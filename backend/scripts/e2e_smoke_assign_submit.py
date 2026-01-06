import os
import sys
import django

# Ensure backend package is importable
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Patient
from api.test_models import TestResult
from rest_framework.test import APIRequestFactory, force_authenticate
from api.test_views import AssignTestToPatientView, PatientPreviousTestsView, ProcessTestSubmissionView

factory = APIRequestFactory()

# Find a therapist with at least one patient; prefer non-admin therapist
therapist = User.objects.filter(profile__user_type='therapist', profile__is_admin=False, is_staff=False, is_superuser=False).first()
if not therapist:
    # Fallback to any therapist
    therapist = User.objects.filter(profile__user_type='therapist').first()
if not therapist:
    print('No therapist user found; aborting e2e')
    sys.exit(1)

patient = Patient.objects.filter(therapist=therapist, user__isnull=False).select_related('user').first()
if not patient:
    # Create a temporary patient user and Patient record for the e2e smoke
    from django.contrib.auth.models import User
    from api.models import UserProfile
    import random
    uname = f'e2e_patient_{random.randint(1000,9999)}'
    pwd = 'testpass123'
    user = User.objects.create_user(username=uname, password=pwd, email=f'{uname}@example.test')
    # Ensure profile exists and is marked as patient
    from api.models import UserProfile
    up, created_up = UserProfile.objects.get_or_create(user=user, defaults={'user_type': 'patient', 'full_name': 'E2E Patient'})
    if not created_up:
        up.user_type = 'patient'
        up.full_name = 'E2E Patient'
        up.save()

    patient = Patient.objects.create(
        therapist=therapist,
        user=user,
        first_name='E2E',
        last_name='Patient',
        email=user.email,
        full_name='E2E Patient',
        birth_date='1990-01-01'
    )
    print('Created temporary patient and user for e2e:', user.username)

patient_user = patient.user

assign_view = AssignTestToPatientView.as_view()
codes = ['phq-9', 'gad-7', 'bai']

print(f'Using therapist={therapist.username}, patient={patient.full_name} (id={patient.id})')

for code in codes:
    req = factory.post('/api/tests/assign-to-patient/', {'patient_id': patient.id, 'test_code': code}, format='json')
    force_authenticate(req, user=therapist)
    resp = assign_view(req)
    status = getattr(resp, 'status_code', None)
    print(f'Assign {code}: status={status}, data={getattr(resp, "data", None)}')

# Verify patient sees pending via PatientPreviousTestsView
pp_view = PatientPreviousTestsView.as_view()
req = factory.get(f'/api/tests/patient-previous/?patient_id={patient.id}')
force_authenticate(req, user=patient_user)
resp = pp_view(req)
print('PatientPrevious after assign (patient view):', getattr(resp, 'status_code', None))
try:
    results = resp.data.get('results', [])
    codes_seen = [r.get('test_module_code') or r.get('test_id') or (r.get('test_module') or {}).get('code') for r in results]
    print('Codes seen (patient):', codes_seen)
except Exception as e:
    print('Could not read patient response:', e)

# Patient submits tests via ProcessTestSubmissionView
submit_view = ProcessTestSubmissionView.as_view()

answers_map = {
    'phq-9': [1]*9,
    'gad-7': [1]*7,
    'bai': [1]*21,
}

for code in codes:
    payload = {'test_id': code, 'answers': answers_map[code]}
    req = factory.post('/api/tests/submit/', payload, format='json')
    force_authenticate(req, user=patient_user)
    resp = submit_view(req)
    print(f'Patient submit {code}: status={getattr(resp, "status_code", None)}, data_keys={(list(resp.data.keys()) if isinstance(resp.data, dict) else type(resp.data))}')

# Verify TestResult entries exist and therapist sees them
for code in codes:
    tr_qs_patient = TestResult.objects.filter(patient=patient, test_id__iexact=code)
    tr_qs_user = TestResult.objects.filter(user=patient_user, test_id__iexact=code)
    print(f'TestResult count for {code} (patient-linked):', tr_qs_patient.count(), ' (by user):', tr_qs_user.count())

req = factory.get(f'/api/tests/patient-previous/?patient_id={patient.id}')
force_authenticate(req, user=therapist)
resp = pp_view(req)
print('PatientPrevious after submits (therapist view):', getattr(resp, 'status_code', None))
try:
    results = resp.data.get('results', [])
    for r in results:
        print(' -', r.get('test_id') or r.get('test_module_code') or (r.get('test_module') or {}).get('code'), 'score=', (r.get('result_data') or {}).get('total') or r.get('score') or r.get('clinical_diagnosis'))
except Exception as e:
    print('Could not parse therapist response:', e)

print('E2E smoke complete')
