"""Debug Federation MVP Phase-1 - E2E HTTP Verification

Verifica endpoint /api/federation/hub-feed/ contra checklist:
1) RBAC/ownership se aplica (403 sin ownership)
2) Consentimiento se aplica (403 si consent_federation=False)
3) 200 si ownership + consentimiento
4) Audit log se genera siempre (allowed/denied)
5) Respuesta NO expone raw_input completo (solo normalizado)
"""

import django
import os
import sys
import requests
import json
from datetime import datetime, date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, 'backend')
django.setup()

from django.contrib.auth.models import User
from api.models import Patient, AnalysisRecord, FederationAuditLog
from rest_framework.authtoken.models import Token


BASE_URL = 'http://localhost:8000'
ENDPOINT = '/api/federation/hub-feed/'


def get_or_create_token(username):
    """Obtiene o crea token de autenticación para usuario"""
    user = User.objects.get(username=username)
    token, _ = Token.objects.get_or_create(user=user)
    return token.key


def setup_test_data():
    """Prepara datos de prueba usando datos reales existentes en DB"""
    print('\n=== SETUP TEST DATA ===')
    
    # Buscar record existente
    record = AnalysisRecord.objects.first()
    if not record:
        print('  [ERROR] No AnalysisRecord found in DB')
        return None
    
    therapist1 = record.therapist
    token1 = get_or_create_token(therapist1.username)
    print(f'  Therapist 1: {therapist1.username} (ID: {therapist1.id}) | Token: {token1[:10]}...')
    
    # Therapist 2 (diferente)
    therapist2 = User.objects.filter(profile__user_type='therapist').exclude(id=therapist1.id).first()
    if not therapist2:
        print('  [ERROR] No second therapist found')
        return None
    token2 = get_or_create_token(therapist2.username)
    print(f'  Therapist 2: {therapist2.username} (ID: {therapist2.id}) | Token: {token2[:10]}...')
    
    # Patient con record y consent activado
    patient_with_consent = record.patient
    patient_with_consent.consent_federation = True
    patient_with_consent.consent_federation_date = datetime.now()
    patient_with_consent.save()
    print(f'  Patient (WITH consent): ID {patient_with_consent.id} | Owner: {patient_with_consent.therapist.username} | Consent: {patient_with_consent.consent_federation}')
    
    # Patient del mismo therapist sin consent
    patient_no_consent = Patient.objects.filter(therapist=therapist1).exclude(id=patient_with_consent.id).first()
    if not patient_no_consent:
        # Buscar cualquier otro patient y asignarlo a therapist1
        patient_no_consent = Patient.objects.exclude(id=patient_with_consent.id).first()
        if patient_no_consent:
            patient_no_consent.therapist = therapist1
    
    if patient_no_consent:
        patient_no_consent.consent_federation = False
        patient_no_consent.save()
        print(f'  Patient (NO consent): ID {patient_no_consent.id} | Owner: {patient_no_consent.therapist.username} | Consent: {patient_no_consent.consent_federation}')
    else:
        print('  [WARNING] Only one patient available - will use same for both tests')
        patient_no_consent = patient_with_consent
    
    # Verificar AnalysisRecords
    records_count = AnalysisRecord.objects.filter(patient=patient_with_consent).count()
    print(f'  AnalysisRecords for patient with consent: {records_count}')
    
    return {
        'therapist1': {'user': therapist1, 'token': token1},
        'therapist2': {'user': therapist2, 'token': token2},
        'patient_no_consent': patient_no_consent,
        'patient_with_consent': patient_with_consent,
    }


def run_test(test_name, url, headers, expected_status, check_fn=None):
    """Ejecuta una prueba HTTP y valida resultado"""
    print(f'\n--- TEST: {test_name} ---')
    print(f'  URL: {url}')
    print(f'  Expected Status: {expected_status}')
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f'  Actual Status: {response.status_code}')
        
        success = response.status_code == expected_status
        
        if response.status_code in [200, 400, 403]:
            try:
                data = response.json()
                print(f'  Response keys: {list(data.keys())}')
                
                if check_fn:
                    check_result = check_fn(data)
                    print(f'  Check function result: {check_result}')
                    success = success and check_result
            except json.JSONDecodeError:
                print(f'  Response text: {response.text[:200]}')
        
        return '✅ PASS' if success else '❌ FAIL', response
    
    except requests.exceptions.RequestException as e:
        print(f'  ❌ ERROR: {e}')
        return '❌ ERROR', None


def check_no_raw_input(data):
    """Verifica que raw_input NO esté en la respuesta"""
    if 'records' not in data:
        return False
    
    for record in data['records']:
        if 'raw_input' in record:
            print(f'    ❌ SECURITY BREACH: raw_input found in record!')
            return False
    
    print(f'    ✅ Security OK: raw_input NOT in response')
    return True


def verify_audit_log(test_name, therapist_username, patient_id, expected_status):
    """Verifica que audit log se haya creado"""
    print(f'\n  Verifying audit log for: {test_name}')
    
    therapist = User.objects.get(username=therapist_username)
    
    # Buscar audit log más reciente
    audit_log = FederationAuditLog.objects.filter(
        requested_by_user=therapist,
        subject_patient_id=patient_id
    ).order_by('-timestamp').first()
    
    if audit_log:
        print(f'    ✅ Audit log found: ID {audit_log.id} | Status: {audit_log.status} | Hub: {audit_log.federation_hub}')
        
        if expected_status == 'allowed':
            return audit_log.status == 'allowed'
        else:
            return audit_log.status == 'denied'
    else:
        print(f'    ❌ No audit log found')
        return False


def main():
    print('=' * 80)
    print('FEDERATION MVP PHASE-1 - E2E HTTP VERIFICATION')
    print('=' * 80)
    
    # Setup
    test_data = setup_test_data()
    
    if not test_data['patient_no_consent'] or not test_data['patient_with_consent']:
        print('\n❌ ERROR: Test data setup incomplete. Cannot proceed.')
        return
    
    therapist1_token = test_data['therapist1']['token']
    therapist1_username = test_data['therapist1']['user'].username
    therapist2_token = test_data['therapist2']['token']
    therapist2_username = test_data['therapist2']['user'].username
    patient_no_consent_id = test_data['patient_no_consent'].id
    patient_with_consent_id = test_data['patient_with_consent'].id
    
    headers_t1 = {'Authorization': f'Token {therapist1_token}'}
    headers_t2 = {'Authorization': f'Token {therapist2_token}'}
    
    # Audit log count inicial
    audit_count_initial = FederationAuditLog.objects.count()
    print(f'\n=== INITIAL AUDIT LOG COUNT: {audit_count_initial} ===')
    
    print('\n' + '=' * 80)
    print('RUNNING TESTS')
    print('=' * 80)
    
    results = []
    
    # TEST 1: Therapist2 intenta acceder a patient de therapist1 (sin ownership) - 403
    url = f'{BASE_URL}{ENDPOINT}?patient_id={patient_with_consent_id}&hub=MSHE'
    result, resp = run_test(
        'TEST 1: No ownership - 403',
        url,
        headers_t2,
        403
    )
    results.append(('TEST 1: No ownership - 403', result))
    
    if resp and resp.status_code == 403:
        audit_ok = verify_audit_log('TEST 1', therapist2_username, patient_with_consent_id, 'denied')
        results.append(('TEST 1: Audit log (denied)', '✅ PASS' if audit_ok else '❌ FAIL'))
    
    # TEST 2: Therapist1 intenta acceder a patient sin consent_federation - 403
    url = f'{BASE_URL}{ENDPOINT}?patient_id={patient_no_consent_id}&hub=MSHE'
    result, resp = run_test(
        'TEST 2: No consent - 403',
        url,
        headers_t1,
        403
    )
    results.append(('TEST 2: No consent - 403', result))
    
    if resp and resp.status_code == 403:
        audit_ok = verify_audit_log('TEST 2', therapist1_username, patient_no_consent_id, 'denied')
        results.append(('TEST 2: Audit log (denied)', '✅ PASS' if audit_ok else '❌ FAIL'))
    
    # TEST 3: Therapist1 accede a patient CON consent_federation - 200
    url = f'{BASE_URL}{ENDPOINT}?patient_id={patient_with_consent_id}&hub=MSHE'
    result, resp = run_test(
        'TEST 3: Ownership + consent - 200',
        url,
        headers_t1,
        200,
        check_fn=check_no_raw_input
    )
    results.append(('TEST 3: Ownership + consent - 200', result))
    
    if resp and resp.status_code == 200:
        audit_ok = verify_audit_log('TEST 3', therapist1_username, patient_with_consent_id, 'allowed')
        results.append(('TEST 3: Audit log (allowed)', '✅ PASS' if audit_ok else '❌ FAIL'))
    
    # TEST 4: Sin parámetros requeridos - 400
    url = f'{BASE_URL}{ENDPOINT}'
    result, resp = run_test(
        'TEST 4: Missing params - 400',
        url,
        headers_t1,
        400
    )
    results.append(('TEST 4: Missing params - 400', result))
    
    # Audit log count final
    audit_count_final = FederationAuditLog.objects.count()
    print(f'\n=== FINAL AUDIT LOG COUNT: {audit_count_final} ===')
    print(f'  Audit logs created: {audit_count_final - audit_count_initial}')
    
    # RESULTS SUMMARY
    print('\n' + '=' * 80)
    print('RESULTS SUMMARY')
    print('=' * 80)
    
    for test_name, result in results:
        print(f'{result} {test_name}')
    
    # Overall assessment
    passed = sum(1 for _, r in results if r == '✅ PASS')
    total = len(results)
    
    print(f'\nOverall: {passed}/{total} tests passed')
    
    if passed == total:
        print('\n✅ ALL TESTS PASSED - Federation MVP Phase-1 verified')
    else:
        print(f'\n❌ {total - passed} tests failed - Review needed')
    
    print('\n' + '=' * 80)


if __name__ == '__main__':
    main()
