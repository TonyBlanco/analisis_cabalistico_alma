"""
Script de inspección: listar AnalysisRecord para patient ID 4
Ejecución: D:/analisis_cabalistico_alma/.venv/Scripts/python.exe backend/scripts/inspect_analysis_records_patient4.py
"""
import os
import sys
import django
from pprint import pprint

BASE = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, BASE)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

django.setup()

from api.models import Patient
from api.analysis_models import AnalysisRecord

PATIENT_ID = 4

try:
    patient = Patient.objects.get(id=PATIENT_ID)
except Exception as e:
    print(f"Paciente {PATIENT_ID} no encontrado: {e}")
    sys.exit(1)

print(f"Paciente: {patient.full_name} (user_id={patient.user.id if patient.user else 'None'})")

records = AnalysisRecord.objects.filter(patient=patient).order_by('-created_at')
print(f"Total analysis records: {records.count()}")
for r in records:
    print('---')
    print('ID:', r.id)
    print('kind:', r.kind)
    print('module_code:', getattr(r, 'module_code', None))
    print('created_at:', r.created_at)
    ta = getattr(r, 'therapist_annotations', None)
    print('therapist_annotations:', ta)
    print('visible_to_patient:', r.visibility)
    try:
        if isinstance(r.computed_result, dict):
            print('computed_result keys:', list(r.computed_result.keys())[:10])
    except Exception as e:
        print('computed_result read error', e)

# Also search for any holistic_evaluative_synthesis for subject_user corresponding to patient.user
if patient.user:
    subj_records = AnalysisRecord.objects.filter(subject_user=patient.user).order_by('-created_at')
    print('\nSubject_user records count:', subj_records.count())
    for r in subj_records[:5]:
        print('SUBJ ID', r.id, 'kind', r.kind, 'therapist_annotations', r.therapist_annotations)

print('\nDone')
