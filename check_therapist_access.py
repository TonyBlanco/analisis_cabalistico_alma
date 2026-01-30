#!/usr/bin/env python
"""Check therapist-patient relationship."""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import Patient
from api.test_models import TestResult

User = get_user_model()

# Get supertony
therapist = User.objects.get(username='supertony')
print(f"\n{'='*60}")
print(f"Therapist: {therapist.username} (ID: {therapist.id})")
print(f"{'='*60}")

# Get their patients
patients = Patient.objects.filter(therapist=therapist)
print(f"\nPacientes de {therapist.username}:")
if not patients:
    print("  ❌ No tiene pacientes asignados")
else:
    for p in patients:
        print(f"  • Patient ID: {p.id} | User: {p.user.username if p.user else 'Sin usuario'}")

# Check test result 116
test_result = TestResult.objects.get(pk=116)
print(f"\nTest Result #116:")
print(f"  • Patient ID: {test_result.patient_id}")
if test_result.patient:
    print(f"  • Patient therapist: {test_result.patient.therapist.username if test_result.patient.therapist else 'Sin therapist'}")
else:
    print(f"  • ❌ No tiene patient asignado")

print(f"\n{'='*60}\n")

# Suggest fix if needed
if test_result.patient and test_result.patient.therapist != therapist:
    print("⚠️  El test result pertenece a otro therapist")
    print(f"   Solución: Reasignar patient #{test_result.patient_id} a {therapist.username}")
    print(f"   O crear un test result para un patient de {therapist.username}")
elif not patients:
    print("⚠️  El therapist no tiene pacientes")
    print("   Solución: Crear un patient con este therapist")
