
import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import TestModule
from django.db.models import Q

def check_tests():
    print("--- Checking TestModule State ---")
    all_tests = TestModule.objects.all()
    print(f"Total TestModules in DB: {all_tests.count()}")
    
    active_tests = TestModule.objects.filter(is_active=True)
    print(f"Active TestModules (is_active=True): {active_tests.count()}")
    
    therapist_visible = active_tests.filter(
        Q(available_for_therapists=True) | Q(available_for_personal=True)
    )
    print(f"Tests visible to Therapist (active + available_for_*): {therapist_visible.count()}")
    
    print("\n--- Listing Therapist Visible Tests ---")
    for test in therapist_visible:
        print(f"Code: {test.code}, Name: {test.name}, Modes: (T:{test.available_for_therapists}, P:{test.available_for_personal})")

    # Check for specific known tests
    known_codes = ['bai', 'phq-9', 'bdi-ii', 'stai', 'scid-5-rv']
    print("\n--- Checking Specific Known Tests ---")
    for code in known_codes:
        try:
            t = TestModule.objects.get(code=code)
            print(f"[{code}] Exists. Active: {t.is_active}, T:{t.available_for_therapists}, P:{t.available_for_personal}")
        except TestModule.DoesNotExist:
            print(f"[{code}] DOES NOT EXIST in DB")

if __name__ == "__main__":
    check_tests()
