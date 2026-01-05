import os
import sys
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.core.settings')
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, PROJECT_ROOT)
BACKEND_PATH = os.path.join(PROJECT_ROOT, 'backend')
sys.path.insert(0, BACKEND_PATH)

import django
django.setup()

from django.contrib.auth import get_user_model
from api.models import Patient
from api.test_models import TestModule
from api.test_views import AssignTestToPatientView

User = get_user_model()


def main():
    try:
        patient = Patient.objects.filter(therapist__isnull=False).first()
        if not patient:
            therapist = User.objects.filter(profile__user_type='therapist', is_active=True).exclude(is_superuser=True).first()
            if not therapist:
                print('No therapist user found in DB')
                return
            patient = Patient.objects.filter(therapist=therapist).first()
            if not patient:
                print(f'No patient found for therapist {therapist.username}')
                return
        therapist = patient.therapist

        print('Therapist:', therapist.username, 'Patient:', patient.id)

        # Build dummy request
        class DummyRequest:
            pass

        dummy = DummyRequest()
        dummy.user = therapist
        dummy.data = {'patient_id': patient.id, 'test_code': 'gad-7'}

        view = AssignTestToPatientView()
        response = view.post(dummy)
        print('Response status:', getattr(response, 'status_code', None))
        try:
            print('Response data:', response.data)
        except Exception:
            print(repr(response))

    except Exception:
        traceback.print_exc()


if __name__ == '__main__':
    main()
