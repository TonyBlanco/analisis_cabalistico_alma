import os
import django
import sys

# Setup Django environment
sys.path.append(r'd:\analisis_cabalistico_alma\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Patient
from api.test_models import TestResult, UserTestAccess

def reset_patient_4():
    try:
        target_id = 4
        # Verify patient exists
        try:
            p = Patient.objects.get(id=target_id)
        except Patient.DoesNotExist:
            print(f"Paciente ID {target_id} no encontrado.")
            return

        print(f"--- RESETEANDO DATOS DE TEST PARA: {p.full_name} (ID: {target_id}) ---")

        # 1. Delete TestResults (Assignments + Completed results)
        # Using filter(patient=p) is safer than client_name lookup for ID-based reset
        results = TestResult.objects.filter(patient=p)
        count_r = results.count()
        results.delete()
        print(f" [OK] Eliminados {count_r} registros de TestResult.")

        # 2. Delete UserTestAccess (Permissions/Assignments linked to User)
        if p.user:
            accesses = UserTestAccess.objects.filter(user=p.user)
            count_a = accesses.count()
            accesses.delete()
            print(f" [OK] Eliminados {count_a} registros de UserTestAccess.")
        else:
            print(" [INFO] Paciente no tiene usuario vinculado, omitiendo UserTestAccess.")

        print("--- PROCESO COMPLETADO EXITOSAMENTE ---")

    except Exception as e:
        print(f"Error crítico durante el reset: {str(e)}")

if __name__ == "__main__":
    reset_patient_4()
