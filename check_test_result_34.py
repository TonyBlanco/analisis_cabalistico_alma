#!/usr/bin/env python
"""Check test result #34."""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.test_models import TestResult

try:
    test_result = TestResult.objects.get(pk=34)
    print(f"\n✅ Test Result #34 EXISTS")
    print(f"   Type: {test_result.test_module.test_type if test_result.test_module else 'Unknown'}")
    print(f"   Patient ID: {test_result.patient_id}")
    if test_result.patient:
        therapist = test_result.patient.therapist
        print(f"   Therapist: {therapist.username if therapist else 'None'}")
    else:
        print(f"   ⚠️ No patient assigned")
except TestResult.DoesNotExist:
    print(f"\n❌ Test Result #34 does NOT exist")
    print(f"   Available test results:")
    recent = TestResult.objects.all().order_by('-id')[:5]
    for r in recent:
        print(f"     • ID:{r.id} (patient #{r.patient_id})")
