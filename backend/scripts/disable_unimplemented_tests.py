"""
Script to disable unimplemented tests from being assigned.

This prevents tests without compute functions from showing as "completed"
when they have no structured_data.

Usage:
cd backend
python scripts/disable_unimplemented_tests.py
"""

import os
import sys
import django

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.test_models import TestModule

# Tests that are registered but have NO compute function
UNIMPLEMENTED_TESTS = [
    'ybocs_soul',      # Y-BOCS-Soul - No compute_ybocs_soul
    'sha_harmony',     # SHA - No compute_sha_harmony  
    'eat26_spirit',    # EAT-26-Spirit - No compute_eat26_spirit
]

def disable_unimplemented_tests():
    """Mark unimplemented tests as non-assignable."""
    
    updated_count = 0
    
    for code in UNIMPLEMENTED_TESTS:
        try:
            test = TestModule.objects.get(code=code)
            
            if test.is_assignable or test.available_for_therapists:
                test.is_assignable = False
                test.available_for_therapists = False
                test.available_for_personal = False
                test.save()
                
                print(f"✅ DISABLED: {test.name} (code={code})")
                updated_count += 1
            else:
                print(f"⏭️  SKIP: {test.name} (code={code}) - already disabled")
                
        except TestModule.DoesNotExist:
            print(f"⚠️  NOT FOUND: {code} - test not in database")
    
    print(f"\n{'='*60}")
    print(f"Tests updated: {updated_count}")
    print(f"{'='*60}\n")
    
    # Show status of ALL symbolic tests
    print("\n📊 Status of Symbolic Tests:\n")
    symbolic_tests = ['asrs_essence', 'dudit_spirit', 'sha_harmony', 
                      'ybocs_soul', 'eat26_spirit', 'mcmi4_mystic']
    
    for code in symbolic_tests:
        try:
            test = TestModule.objects.get(code=code)
            status = "✅ " if test.is_assignable else "❌"
            impl = "🟢 IMPLEMENTED" if code in ['asrs_essence', 'dudit_spirit', 'mcmi4_mystic'] else "🔴 NOT IMPLEMENTED"
            print(f"{status} {test.name} ({code}) - {impl}")
        except TestModule.DoesNotExist:
            print(f"⚠️  {code} - NOT IN DB")

if __name__ == '__main__':
    print("Disabling unimplemented tests...\n")
    disable_unimplemented_tests()
    print("\n✅ Done!")
