"""Debug Federation MVP Phase-1 - DB State Verification

Verifica estado de DB para pruebas E2E (therapists, patients, records, consent).
"""

import django
import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, 'backend')
django.setup()

from django.contrib.auth.models import User
from api.models import Patient, AnalysisRecord, FederationAuditLog, UserProfile


def main():
    print('=' * 60)
    print('FEDERATION MVP PHASE-1 - DB STATE VERIFICATION')
    print('=' * 60)
    
    # Verificar therapists
    print('\n=== THERAPISTS ===')
    therapists = User.objects.filter(profile__user_type='therapist')[:3]
    if therapists:
        for t in therapists:
            print(f'  ID: {t.id} | Username: {t.username} | Email: {t.email} | Type: {t.profile.user_type}')
    else:
        print('  [WARNING] No therapists found')
    
    # Verificar patients
    print('\n=== PATIENTS (primeros 5) ===')
    patients = Patient.objects.all()[:5]
    if patients:
        for p in patients:
            consent = getattr(p, 'consent_federation', None)
            therapist_username = p.therapist.username if p.therapist else 'N/A'
            print(f'  ID: {p.id} | Therapist: {therapist_username} | Name: {p.first_name} {p.last_name} | Consent: {consent}')
    else:
        print('  [WARNING] No patients found')
    
    # Verificar AnalysisRecords
    print('\n=== ANALYSIS RECORDS ===')
    records_count = AnalysisRecord.objects.count()
    print(f'  Total records: {records_count}')
    
    if records_count > 0:
        # Mostrar 3 ejemplos
        records = AnalysisRecord.objects.all()[:3]
        for rec in records:
            patient_id = rec.patient.id if rec.patient else 'N/A'
            therapist_username = rec.therapist.username if rec.therapist else 'N/A'
            has_raw_input = bool(rec.raw_input)
            print(f'  Record ID: {rec.id} | Patient: {patient_id} | Therapist: {therapist_username} | Has raw_input: {has_raw_input}')
    else:
        print('  [WARNING] No analysis records found')
    
    # Verificar FederationAuditLog
    print('\n=== FEDERATION AUDIT LOGS ===')
    audit_count = FederationAuditLog.objects.count()
    print(f'  Total audit logs: {audit_count}')
    if audit_count > 0:
        recent_audits = FederationAuditLog.objects.order_by('-timestamp')[:3]
        for audit in recent_audits:
            print(f'  ID: {audit.id} | User: {audit.requested_by_user.username} | Status: {audit.status} | Hub: {audit.federation_hub}')
    
    # Verificar consent_federation field
    print('\n=== CONSENT_FEDERATION FIELD CHECK ===')
    try:
        patient = Patient.objects.first()
        if patient:
            has_field = hasattr(patient, 'consent_federation')
            print(f'  Patient.consent_federation field exists: {has_field}')
            if has_field:
                print(f'  Sample value: {patient.consent_federation}')
        else:
            print('  [WARNING] No patients to check')
    except Exception as e:
        print(f'  [ERROR] {e}')
    
    print('\n' + '=' * 60)
    print('DB VERIFICATION COMPLETE')
    print('=' * 60)


if __name__ == '__main__':
    main()
