import os
import django

# Ensure backend package is importable when running as script
import sys
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Patient
from rest_framework.test import APIRequestFactory, force_authenticate
from api.test_views import PatientPreviousTestsView

factory = APIRequestFactory()

# Try to find an existing Patient that has a linked user
patient = Patient.objects.filter(user__isnull=False).select_related('user').first()
if patient:
    patient_user = patient.user
else:
    # Fallback: try to find any user with patient role
    patient_user = User.objects.filter(profile__user_type='patient').first()
    if not patient_user:
        print('No patient users or patient records found in DB; aborting smoke test')
        exit(1)
    # Try to resolve Patient linked to that user
    try:
        patient = Patient.objects.get(user=patient_user)
    except Patient.DoesNotExist:
        print('Patient record not linked to patient user; aborting smoke test')
        exit(1)

view = PatientPreviousTestsView.as_view()

# Patient accessing their own data
req = factory.get(f'/api/tests/patient-previous/?patient_id={patient.id}')
force_authenticate(req, user=patient_user)
resp = view(req)
print('Patient access status:', getattr(resp, 'status_code', None))
try:
    print('Patient response data keys:', list(resp.data.keys()) if isinstance(resp.data, dict) else type(resp.data))
except Exception as e:
    print('Could not read response data for patient:', e)

# Therapist accessing patient's data
therapist_user = patient.therapist
if therapist_user:
    req2 = factory.get(f'/api/tests/patient-previous/?patient_id={patient.id}')
    force_authenticate(req2, user=therapist_user)
    resp2 = view(req2)
    print('Therapist access status:', getattr(resp2, 'status_code', None))
    try:
        print('Therapist response count:', resp2.data.get('count') if isinstance(resp2.data, dict) else None)
    except Exception as e:
        print('Could not read therapist response data:', e)
else:
    print('No therapist linked to patient')

# Admin access (first superuser)
admin = User.objects.filter(is_superuser=True).first()
if admin:
    req3 = factory.get(f'/api/tests/patient-previous/?patient_id={patient.id}')
    force_authenticate(req3, user=admin)
    resp3 = view(req3)
    print('Admin access status:', getattr(resp3, 'status_code', None))
else:
    print('No superuser in DB to test admin access')
