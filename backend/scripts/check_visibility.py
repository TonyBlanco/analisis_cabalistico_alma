import os
import django
import sys
import json

# Setup Django environment
sys.path.append(r'd:\analisis_cabalistico_alma\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Patient
from api.test_views import AvailableTestsView
from rest_framework.test import APIRequestFactory, force_authenticate
from api.models import User

def check_patient_visibility():
    try:
        p = Patient.objects.get(id=4)
        user = p.user
        if not user:
            print("Patient 4 has no user.")
            return

        print(f"Checking Available Tests for User: {user.username} (ID: {user.id})")
        
        factory = APIRequestFactory()
        request = factory.get('/api/tests/')
        request.user = user
        force_authenticate(request, user=user)
        
        view = AvailableTestsView.as_view()
        response = view(request)
        
        if response.status_code != 200:
            print(f"Error: {response.status_code}")
            return

        data = response.data
        tests = data.get('tests', [])
        
        mcmi = next((t for t in tests if t.get('code') == 'mcmi4-mystic'), None)
        
        if mcmi:
            print("\n--- MCMI-4 MYSTIC FOUND ---")
            print(json.dumps(mcmi, indent=2, default=str))
            
            is_locked = mcmi.get('locked')
            lock_reason = mcmi.get('lock_reason')
            already_assigned = mcmi.get('already_assigned')
            
            print(f"\nANALYSIS:")
            print(f" Locked: {is_locked}")
            print(f" Reason: {lock_reason}")
            print(f" Assigned: {already_assigned}")
            
            if is_locked and lock_reason == 'assigned_pending':
                 print("\nISSUE DETECTED: Test is LOCKED but status is PENDING. Patient cannot start it.")
            elif not is_locked:
                 print("\nTest is UNLOCKED. Patient should see 'Start'.")
        else:
            print("\n--- MCMI-4 MYSTIC NOT FOUND IN LIST ---")
            print("Filtering applied?")

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    check_patient_visibility()
