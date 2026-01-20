#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.test_models import Assignment
from api.models import Patient

User = get_user_model()

print("=" * 60)
print("CREANDO CONSULTANTE Y ASSIGNMENT CORRECTA")
print("=" * 60)

# 1. Crear consultante
consultant, created = User.objects.get_or_create(
    username='consultant_test',
    defaults={'email': 'consultant@test.com'}
)

if created:
    consultant.set_password('test123')
    consultant.save()
    print(f"✅ Consultante CREADO: {consultant.username} (ID: {consultant.id})")
else:
    print(f"✅ Consultante EXISTE: {consultant.username} (ID: {consultant.id})")

# 2. Obtener terapeuta
therapist = User.objects.get(username='armando')
print(f"✅ Terapeuta: {therapist.username} (ID: {therapist.id})")

# 3. Obtener paciente
patient_user = User.objects.get(username='pat_luisantonio_6090')
patient = Patient.objects.get(user=patient_user)
print(f"✅ Paciente: {patient.full_name} (user: {patient_user.username}, ID: {patient.id})")

# 4. Eliminar assignment incorrecta
old_count = Assignment.objects.filter(test_type='mcmi4-mystic').count()
if old_count > 0:
    Assignment.objects.filter(test_type='mcmi4-mystic').delete()
    print(f"🔄 Eliminadas {old_count} assignment(s) anterior(es)")

# 5. Crear assignment CORRECTA
assignment = Assignment.objects.create(
    patient=patient,
    test_type='mcmi4-mystic',
    assigned_by_user=therapist,
    assigned_to_user=consultant,  # ✓ CONSULTANTE, NO PACIENTE
    status='assigned',
    questions=None,
    results={}
)

print("\n" + "=" * 60)
print("✅ ASSIGNMENT CREADA CORRECTAMENTE")
print("=" * 60)
print(f"Assignment ID: {assignment.id}")
print(f"Patient: {assignment.patient.full_name}")
print(f"Test Type: {assignment.test_type}")
print(f"Assigned BY: {assignment.assigned_by_user.username} (Terapeuta)")
print(f"Assigned TO: {assignment.assigned_to_user.username} (Consultante)")
print(f"Status: {assignment.status}")
print(f"Created: {assignment.created_at}")
print("\nAhora el flujo debería funcionar correctamente:")
print("1. Consultante (consultant_test) ejecuta mcmi4-mystic")
print("2. Backend valida: assigned_to_user=consultant_test ✓")
print("3. Test se ejecuta y guarda resultado")
print("4. Terapeuta ve resultado en vista de paciente")
