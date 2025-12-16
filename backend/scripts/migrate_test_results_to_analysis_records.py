"""
Script de migración: Convertir TestResult existentes en AnalysisRecord

Este script crea AnalysisRecord para todos los TestResult que no tienen
un AnalysisRecord asociado, permitiendo que los resultados antiguos aparezcan
en la página de resultados del paciente.

Ejecutar con:
    python manage.py shell < scripts/migrate_test_results_to_analysis_records.py
    O directamente:
    cd backend && python scripts/migrate_test_results_to_analysis_records.py
"""

import os
import sys
import django
from pathlib import Path

# Setup Django
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.utils import timezone
from api.models import AnalysisRecord, Patient, UserProfile
from api.test_models import TestResult, TestModule
from django.contrib.auth.models import User


def migrate_test_results():
    """Migra TestResult existentes a AnalysisRecord"""
    
    print("=" * 80)
    print("MIGRACION: TestResult -> AnalysisRecord")
    print("=" * 80)
    print()
    
    # Buscar todos los TestResult que no tienen AnalysisRecord asociado
    test_results = TestResult.objects.filter(analysis_records__isnull=True)
    total = test_results.count()
    
    print(f"Total de TestResult sin AnalysisRecord: {total}")
    print()
    
    if total == 0:
        print("[OK] No hay TestResult para migrar.")
        return
    
    migrated = 0
    skipped = 0
    errors = 0
    
    for test_result in test_results:
        try:
            # Verificar si ya existe un AnalysisRecord para este TestResult
            if AnalysisRecord.objects.filter(test_result=test_result).exists():
                skipped += 1
                continue
            
            user = test_result.user
            profile = getattr(user, 'profile', None)
            
            if not profile:
                print(f"[!] TestResult {test_result.id}: Usuario {user.username} no tiene perfil. Saltando...")
                skipped += 1
                continue
            
            test_module = test_result.test_module
            
            if not test_module:
                print(f"[!] TestResult {test_result.id}: No tiene test_module asociado. Saltando...")
                skipped += 1
                continue
            
            # Determinar execution_mode basado en el contexto
            execution_mode = 'patient_self'
            if test_result.patient:
                execution_mode = 'therapist_clinical'
            
            # Determinar role_context
            role_context = profile.user_type if profile.user_type in ['patient', 'personal', 'therapist'] else 'personal'
            
            # Determinar kind
            kind = 'clinical_test'
            
            # Preparar birth_data_snapshot
            birth_snapshot = {}
            
            if profile:
                birth_snapshot = {
                    'legal_name': profile.legal_full_name or profile.full_name or '',
                    'birth_date': str(profile.birth_date) if profile.birth_date else None,
                    'birth_time': str(profile.birth_time) if hasattr(profile, 'birth_time') and profile.birth_time else None,
                    'city': profile.birth_city or '',
                    'country': profile.birth_country or '',
                    'lat': float(profile.birth_latitude) if profile.birth_latitude else None,
                    'lng': float(profile.birth_longitude) if profile.birth_longitude else None,
                    'timezone': getattr(profile, 'timezone', 'UTC') or 'UTC',
                    'geocode_source': 'profile'
                }
            
            # Intentar obtener birth_data si existe
            try:
                birth_data = user.birth_data
                if birth_data:
                    birth_snapshot.update({
                        'legal_name': birth_data.full_name or birth_snapshot.get('legal_name', ''),
                        'birth_date': str(birth_data.birth_date) if birth_data.birth_date else birth_snapshot.get('birth_date'),
                        'birth_time': str(birth_data.birth_time) if birth_data.birth_time else birth_snapshot.get('birth_time'),
                    })
            except Exception:
                pass
            
            # Preparar algorithm_snapshot
            algorithm_snapshot = {
                'engine': 'test_module',
                'version': '1.0',
                'test_module_code': test_module.code,
                'test_module_name': test_module.name,
                'test_type': test_module.test_type,
            }
            
            # Determinar visibility
            # Si es patient_self, visibility = 'patient'
            # Si es therapist_clinical, visibility = 'therapist' (el terapeuta decide después)
            if execution_mode == 'patient_self':
                visibility = 'patient'
            else:
                visibility = 'therapist'  # Por defecto, solo terapeuta puede ver
            
            # Obtener Patient si existe
            patient_obj = test_result.patient
            if not patient_obj and profile.user_type == 'patient':
                try:
                    patient_obj = Patient.objects.get(user=user)
                except Patient.DoesNotExist:
                    pass
            
            # Obtener therapist si es therapist_clinical
            therapist_obj = None
            if execution_mode == 'therapist_clinical' and patient_obj:
                therapist_obj = patient_obj.therapist
            
            # Crear AnalysisRecord
            # Nota: No establecemos created_at manualmente porque Django lo maneja con auto_now_add
            # Si necesitamos preservar la fecha, debemos usar update después de crear
            analysis_record = AnalysisRecord(
                kind=kind,
                module_code=test_module.code,
                subject_user=user,
                created_by_user=user,
                role_context=role_context,
                execution_mode=execution_mode,
                patient=patient_obj,
                therapist=therapist_obj,
                birth_data_snapshot=birth_snapshot,
                algorithm_snapshot=algorithm_snapshot,
                raw_input=test_result.input_data,
                computed_result=test_result.result_data,
                visibility=visibility,
                test_result=test_result,
            )
            analysis_record.save()
            
            # Preservar fecha original si es necesario
            if test_result.created_at:
                AnalysisRecord.objects.filter(pk=analysis_record.pk).update(created_at=test_result.created_at)
                analysis_record.refresh_from_db()
            
            migrated += 1
            if migrated % 10 == 0:
                print(f"  Progreso: {migrated}/{total} migrados...")
        
        except Exception as e:
            errors += 1
            print(f"[ERROR] Error migrando TestResult {test_result.id}: {str(e)}")
            import traceback
            traceback.print_exc()
            continue
    
    print()
    print("=" * 80)
    print("RESUMEN DE MIGRACION")
    print("=" * 80)
    print(f"[OK] Migrados exitosamente: {migrated}")
    print(f"[SKIP] Saltados: {skipped}")
    print(f"[ERROR] Errores: {errors}")
    print(f"[TOTAL] Total procesado: {migrated + skipped + errors} de {total}")
    print()
    
    if migrated > 0:
        print("[OK] Migracion completada. Los resultados antiguos ahora apareceran en la pagina de resultados.")
    else:
        print("[!] No se migraron registros. Verifica los mensajes anteriores.")


if __name__ == '__main__':
    migrate_test_results()
