"""
Script para limpiar datos de prueba del paciente ID 4
Elimina TestResults y Assignments para permitir reasignación
"""

import os
import sys
import django

# Add backend to path and configure Django
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.test_models import TestResult, Assignment
from api.models import Patient

PATIENT_ID = 4

def clean_patient_data():
    print(f"\n🧹 Limpiando datos del paciente ID {PATIENT_ID}...")
    
    # Get Patient and their user_id
    try:
        patient = Patient.objects.get(id=PATIENT_ID)
        user_id = patient.user.id if patient.user else None
        print(f"📋 Paciente: {patient.full_name}, User ID: {user_id}")
    except Patient.DoesNotExist:
        print(f"❌ Paciente ID {PATIENT_ID} no existe")
        return
    
    # Delete TestResults by user (consultante ejecuta como su user)
    if user_id:
        test_results_user = TestResult.objects.filter(user_id=user_id)
        tr_user_count = test_results_user.count()
        if tr_user_count > 0:
            print(f"\n📊 TestResults (por user_id={user_id}): {tr_user_count}")
            for tr in test_results_user:
                test_code = tr.test_module.code if tr.test_module else tr.test_id
                print(f"  - ID: {tr.id}, Test: {test_code}, Created: {tr.created_at}")
            test_results_user.delete()
            print(f"✅ {tr_user_count} TestResult(s) eliminados")
        else:
            print(f"✅ No hay TestResults por user_id")
    
    # Delete TestResults by patient (si hay asignados por terapeuta)
    test_results_patient = TestResult.objects.filter(patient_id=PATIENT_ID)
    tr_patient_count = test_results_patient.count()
    if tr_patient_count > 0:
        print(f"\n📊 TestResults (por patient_id={PATIENT_ID}): {tr_patient_count}")
        for tr in test_results_patient:
            test_code = tr.test_module.code if tr.test_module else tr.test_id
            print(f"  - ID: {tr.id}, Test: {test_code}, Created: {tr.created_at}")
        test_results_patient.delete()
        print(f"✅ {tr_patient_count} TestResult(s) eliminados")
    else:
        print(f"✅ No hay TestResults por patient_id")
    
    # Delete Assignments
    assignments = Assignment.objects.filter(patient_id=PATIENT_ID)
    assign_count = assignments.count()
    if assign_count > 0:
        print(f"\n📋 Assignments encontrados: {assign_count}")
        for a in assignments:
            print(f"  - ID: {a.id}, Test Type: {a.test_type}, Status: {a.status}")
        assignments.delete()
        print(f"✅ {assign_count} Assignment(s) eliminados")
    else:
        print("✅ No hay Assignments para eliminar")
    
    print(f"\n✨ Paciente ID {PATIENT_ID} listo para reasignación\n")

if __name__ == '__main__':
    clean_patient_data()
