import os
import sys
import traceback

# Ensure Django settings are loaded
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.core.settings')
# Add project path so `backend` package is importable
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, PROJECT_ROOT)
# Ensure backend package directory is importable (contains core, api apps)
BACKEND_PATH = os.path.join(PROJECT_ROOT, 'backend')
sys.path.insert(0, BACKEND_PATH)

import django
from rest_framework.test import APIRequestFactory
from rest_framework.request import Request as DRFRequest

django.setup()

from django.contrib.auth import get_user_model
from api.test_views import AssignTestToPatientView
from api.models import Patient
from api.test_models import TestModule
from django.db.models import Q

User = get_user_model()


def main():
    try:
        # Prefer any patient that already has a therapist assigned
        patient = Patient.objects.filter(therapist__isnull=False).first()
        if not patient:
            # Fallback: try to find any therapist user and their patient
            therapist = User.objects.filter(profile__user_type='therapist', is_active=True).exclude(is_superuser=True).first()
            if not therapist:
                print('No therapist user found in DB')
                return
            patient = Patient.objects.filter(therapist=therapist).first()
            if not patient:
                print(f'No patient found for therapist {therapist.username}')
                return
        therapist = patient.therapist
        # Build the filter safely: only use `execution_mode` if the model has that field
        field_names = [f.name for f in TestModule._meta.get_fields()]
        q_filters = Q(available_for_personal=True)
        if 'execution_mode' in field_names:
            q_filters = Q(execution_mode='holistic') | q_filters
        test_module = TestModule.objects.filter(q_filters).first()
        if not test_module:
            print('No suitable TestModule found (holistic or available_for_personal)')
            return

        print('Therapist:', therapist.username, 'Patient:', patient.id, 'Test:', test_module.code)

        # Build a minimal request-like object with `user` and `data` to call the view directly.
        class DummyRequest:
            pass

        dummy = DummyRequest()
        dummy.user = therapist
        dummy.data = {'patient_id': patient.id, 'test_code': test_module.code}

        view = AssignTestToPatientView()
        # call post directly with the lightweight dummy request
        response = view.post(dummy)
        print('Response status:', getattr(response, 'status_code', None))
        try:
            print('Response data:', response.data)
        except Exception:
            print('Response repr:', repr(response))

    except Exception as e:
        print('Exception during debug run:')
        traceback.print_exc()


if __name__ == '__main__':
    main()
