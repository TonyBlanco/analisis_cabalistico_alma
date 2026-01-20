"""
Verificar TestResults del paciente ID 4
"""

import os
import sys
import django

# Add backend to path and configure Django
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.test_models import TestResult
from api.models import Patient

PATIENT_ID = 4

def verify_results():
    print(f"\n🔍 Verificando TestResults del paciente ID {PATIENT_ID}...\n")
    
    try:
        patient = Patient.objects.get(id=PATIENT_ID)
        user_id = patient.user.id if patient.user else None
        print(f"📋 Paciente: {patient.full_name}")
        print(f"👤 User ID: {user_id}\n")
        
        if not user_id:
            print("❌ Paciente no tiene user asociado")
            return
        
        # Check TestResults by user_id
        results = TestResult.objects.filter(user_id=user_id).order_by('-created_at')
        
        if results.count() == 0:
            print("❌ No hay TestResults para este user_id")
            return
        
        print(f"✅ {results.count()} TestResult(s) encontrados:\n")
        for tr in results:
            test_code = tr.test_module.code if tr.test_module else tr.test_id
            schema_version = tr.result_data.get('schema_version') if isinstance(tr.result_data, dict) else None
            print(f"  ID: {tr.id}")
            print(f"  Test: {test_code}")
            print(f"  Schema: {schema_version}")
            print(f"  Created: {tr.created_at}")
            print(f"  User ID: {tr.user_id}")
            print(f"  Patient ID: {tr.patient_id}")
            print()
        
        # Check if mcmi4-signal exists
        signal_results = results.filter(test_module__code='mcmi4-signal')
        if signal_results.exists():
            print(f"✅ mcmi4-signal: {signal_results.count()} resultado(s)")
        else:
            print("❌ NO hay mcmi4-signal")
        
        # Check if mcmi4-reflection exists
        reflection_results = results.filter(test_module__code='mcmi4-reflection')
        if reflection_results.exists():
            print(f"✅ mcmi4-reflection: {reflection_results.count()} resultado(s)")
        else:
            print("⚠️ NO hay mcmi4-reflection (esperado si no ha completado)")
            
    except Patient.DoesNotExist:
        print(f"❌ Paciente ID {PATIENT_ID} no existe")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    verify_results()
