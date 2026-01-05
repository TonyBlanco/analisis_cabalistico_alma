import os, sys, traceback
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.core.settings')
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, PROJECT_ROOT)
BACKEND_PATH = os.path.join(PROJECT_ROOT, 'backend')
sys.path.insert(0, BACKEND_PATH)
import django
django.setup()
from django.contrib.auth import get_user_model
from api.test_views import PatientPreviousTestsView
from api.models import Patient

User = get_user_model()

class DummyRequest:
    pass


def main():
    try:
        patient = Patient.objects.filter(therapist__isnull=False).first()
        if not patient:
            print('No patient with therapist found')
            return
        therapist = patient.therapist
        print('Testing for patient', patient.id)
        req = DummyRequest()
        req.user = therapist
        req.query_params = {'patient_id': str(patient.id)}

        view = PatientPreviousTestsView()
        resp = view.get(req)
        print('Status:', getattr(resp, 'status_code', None))
        try:
            print(resp.data)
        except Exception:
            print(repr(resp))
    except Exception:
        traceback.print_exc()

if __name__=='__main__':
    main()
