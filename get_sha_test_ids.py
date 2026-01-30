#!/usr/bin/env python
"""Quick script to get SHA test result IDs for testing."""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.test_models import TestResult

# Get any recent test results
all_results = TestResult.objects.all().order_by('-created_at')[:10]

print("\n" + "="*60)
print("Test Results (últimos 10):")
print("="*60)

if not all_results:
    print("❌ No hay resultados de tests en la base de datos")
else:
    for r in all_results:
        patient_info = f"Patient #{r.patient_id}" if r.patient_id else "Sin paciente"
        test_type = r.test_module.test_type if r.test_module else "Unknown"
        print(f"• ID: {r.id:4d} | Type: {test_type:10s} | {patient_info} | Created: {r.created_at.strftime('%Y-%m-%d %H:%M')}")

print("="*60 + "\n")
