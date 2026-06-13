"""
Script to re-enable newly implemented tests.

This marks the 3 symbolic tests that now have compute functions as assignable.

Usage:
cd backend
python scripts/enable_implemented_tests.py
"""

import os
import sys
import django

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.test_models import TestModule

# Tests that now have full implementations
NEWLY_IMPLEMENTED_TESTS = [
    'ybocs_soul',    # Y-BOCS-Soul - compute_ybocs_soul implemented
    'sha_harmony',   # SHA - compute_sha_harmony implemented
    'eat26_spirit',  # EAT-26-Spirit - compute_eat26_spirit implemented
]

def enable_implemented_tests():
    """Mark newly implemented tests as assignable."""
    
    updated_count = 0
    
    for code in NEWLY_IMPLEMENTED_TESTS:
        try:
            test = TestModule.objects.get(code=code)
            
            needs_update = (
                not test.is_active
                or not test.is_assignable
                or not test.available_for_therapists
                or test.is_internal
                or test.domain != 'holistic'
            )
            if needs_update:
                test.is_active = True
                test.is_assignable = True
                test.is_internal = False
                test.domain = 'holistic'
                test.available_for_therapists = True
                if code == 'sha_harmony':
                    test.available_for_personal = True
                else:
                    test.available_for_personal = False
                test.save()
                
                print(f"✅ ENABLED: {test.name} (code={code})")
                updated_count += 1
            else:
                print(f"⏭️  SKIP: {test.name} (code={code}) - already enabled")
                
        except TestModule.DoesNotExist:
            print(f"⚠️  NOT FOUND: {code} - test not in database")
    
    print(f"\n{'='*60}")
    print(f"Tests enabled: {updated_count}")
    print(f"{'='*60}\n")
    
    # Show status of ALL symbolic tests
    print("\n📊 Status of Symbolic Tests:\n")
    symbolic_tests = ['asrs_essence', 'dudit_spirit', 'sha_harmony', 
                      'ybocs_soul', 'eat26_spirit', 'mcmi4_mystic']
    
    for code in symbolic_tests:
        try:
            test = TestModule.objects.get(code=code)
            status = "✅" if test.is_assignable else "❌"
            impl = "🟢 IMPLEMENTED" if code in NEWLY_IMPLEMENTED_TESTS + ['asrs_essence', 'dudit_spirit', 'mcmi4_mystic'] else "🔴 NOT IMPLEMENTED"
            print(f"{status} {test.name} ({code}) - {impl}")
        except TestModule.DoesNotExist:
            print(f"⚠️  {code} - NOT IN DB")

if __name__ == '__main__':
    print("Enabling newly implemented tests...\n")
    enable_implemented_tests()
    print("\n✅ Done!")
