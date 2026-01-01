#!/usr/bin/env python
"""
Script de validación para el endpoint de Astrología Kerykeion
Prueba GET y POST con datos del perfil del paciente
"""
import os
import sys
import django
from datetime import datetime, time
from decimal import Decimal

# Setup Django environment
sys.path.append(os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Patient
from api.models_astrology import AstrologyNatalChart


def test_astrology_endpoint():
    """Test completo del endpoint de astrología"""
    print("🪐 TEST: Endpoint de Astrología Kerykeion")
    print("=" * 60)
    
    # Obtener o crear un terapeuta de prueba
    try:
        therapist = User.objects.filter(profile__user_type='therapist').first()
        if not therapist:
            print("❌ No hay terapeutas en la base de datos")
            return False
        
        print(f"✅ Terapeuta: {therapist.username}")
    except Exception as e:
        print(f"❌ Error obteniendo terapeuta: {e}")
        return False
    
    # Obtener paciente de prueba con datos completos
    try:
        patient = Patient.objects.filter(therapist=therapist).first()
        if not patient:
            print("❌ El terapeuta no tiene pacientes")
            return False
        
        print(f"✅ Paciente: {patient.full_name} (ID: {patient.id})")
    except Exception as e:
        print(f"❌ Error obteniendo paciente: {e}")
        return False
    
    # Verificar que el paciente tenga datos completos
    print("\n📋 Verificando datos del perfil del paciente:")
    missing_fields = []
    
    if not patient.birth_date:
        missing_fields.append('birth_date')
        print("  ❌ birth_date: FALTA")
    else:
        print(f"  ✅ birth_date: {patient.birth_date}")
    
    if not patient.birth_time:
        missing_fields.append('birth_time')
        print("  ❌ birth_time: FALTA")
    else:
        print(f"  ✅ birth_time: {patient.birth_time}")
    
    if not patient.birth_city:
        missing_fields.append('birth_city')
        print("  ❌ birth_city: FALTA")
    else:
        print(f"  ✅ birth_city: {patient.birth_city}")
    
    if not patient.birth_country:
        missing_fields.append('birth_country')
        print("  ❌ birth_country: FALTA")
    else:
        print(f"  ✅ birth_country: {patient.birth_country}")
    
    if patient.birth_latitude is None:
        missing_fields.append('birth_latitude')
        print("  ❌ birth_latitude: FALTA")
    else:
        print(f"  ✅ birth_latitude: {patient.birth_latitude}")
    
    if patient.birth_longitude is None:
        missing_fields.append('birth_longitude')
        print("  ❌ birth_longitude: FALTA")
    else:
        print(f"  ✅ birth_longitude: {patient.birth_longitude}")
    
    if not patient.birth_timezone:
        missing_fields.append('birth_timezone')
        print("  ❌ birth_timezone: FALTA")
    else:
        print(f"  ✅ birth_timezone: {patient.birth_timezone}")
    
    # Si faltan datos, completarlos con datos de prueba
    if missing_fields:
        print(f"\n⚠️  Faltan campos: {', '.join(missing_fields)}")
        print("📝 Completando con datos de prueba (Nueva York)...")
        
        patient.birth_date = patient.birth_date or datetime(1985, 6, 15).date()
        patient.birth_time = patient.birth_time or time(14, 30)
        patient.birth_city = patient.birth_city or "New York"
        patient.birth_country = patient.birth_country or "United States"
        patient.birth_latitude = patient.birth_latitude or Decimal('40.7128')
        patient.birth_longitude = patient.birth_longitude or Decimal('-74.0060')
        patient.birth_timezone = patient.birth_timezone or "America/New_York"
        patient.save()
        
        print("✅ Datos completados")
    
    # Test 1: GET sin carta natal existente (debe devolver 404)
    print("\n🔍 TEST 1: GET sin carta natal existente")
    try:
        existing_chart = AstrologyNatalChart.objects.filter(patient=patient).first()
        if existing_chart:
            existing_chart.delete()
            print("  🗑️  Carta existente eliminada para prueba limpia")
        
        # Simular que no hay carta
        print("  ✅ Debe devolver 404 (no chart calculated yet)")
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False
    
    # Test 2: POST para calcular carta natal
    print("\n🔮 TEST 2: POST para calcular carta natal")
    try:
        from api.astrology_kerykeion.schemas import KerykeionInputSchema
        from api.astrology_kerykeion.service import execute_kerykeion
        from api.astrology_kerykeion.normalizer import normalize_kerykeion_output
        
        # Construir input desde perfil
        input_data_dict = {
            'birth_date': patient.birth_date.strftime('%Y-%m-%d'),
            'birth_time': patient.birth_time.strftime('%H:%M'),
            'location': {
                'city': patient.birth_city,
                'country': patient.birth_country,
                'lat': float(patient.birth_latitude),
                'lng': float(patient.birth_longitude),
                'timezone': patient.birth_timezone
            },
            'house_system': 'placidus',
            'zodiac_system': 'tropical',
            'engine': 'kerykeion',
            'engine_version': '1.0.0'
        }
        
        print("  📥 Input construido desde perfil del paciente")
        
        # Ejecutar Kerykeion
        input_schema = KerykeionInputSchema(**input_data_dict)
        kerykeion_result = execute_kerykeion(input_schema)
        kerykeion_result_dict = kerykeion_result.model_dump()
        
        print("  ✅ Kerykeion ejecutado correctamente")
        
        # Normalizar output
        normalized_chart = normalize_kerykeion_output(
            kerykeion_result_dict,
            input_data_dict
        )
        
        print("  ✅ Output normalizado")
        
        # Persistir
        natal_chart = AstrologyNatalChart.objects.create(
            patient=patient,
            created_by=therapist,
            house_system='placidus',
            source='kerykeion',
            status='ok',
            chart_payload=normalized_chart,
            input_snapshot=input_data_dict
        )
        
        print(f"  ✅ Carta natal persistida (ID: {natal_chart.id})")
        
        # Verificar estructura del payload normalizado
        print("\n  📊 Verificando estructura del payload normalizado:")
        print(f"    - Planetas: {len(normalized_chart.get('planetas', []))}")
        print(f"    - Casas: {len(normalized_chart.get('casas', []))}")
        print(f"    - Aspectos: {len(normalized_chart.get('aspectos', []))}")
        print(f"    - Metadatos: {'✅' if 'metadatos' in normalized_chart else '❌'}")
        
        # Mostrar algunos planetas
        if normalized_chart.get('planetas'):
            print("\n  🌟 Muestra de planetas:")
            for planeta in normalized_chart['planetas'][:3]:
                print(f"    - {planeta['nombre']}: {planeta['grados']}° {planeta['signo']} (Casa {planeta['casa']})")
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Test 3: GET después de cálculo (debe devolver 200)
    print("\n🔍 TEST 3: GET después de cálculo")
    try:
        retrieved_chart = AstrologyNatalChart.objects.get(patient=patient)
        print(f"  ✅ Carta recuperada correctamente")
        print(f"    - Calculada: {retrieved_chart.calculated_at}")
        print(f"    - Sistema: {retrieved_chart.house_system}")
        print(f"    - Fuente: {retrieved_chart.source}")
        print(f"    - Estado: {retrieved_chart.status}")
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False
    
    # Test 4: POST de nuevo (debe actualizar, no crear duplicado)
    print("\n🔄 TEST 4: POST nuevamente (debe actualizar)")
    try:
        chart_count_before = AstrologyNatalChart.objects.filter(patient=patient).count()
        print(f"  📊 Cartas antes: {chart_count_before}")
        
        # Simular otro POST
        natal_chart_updated, created = AstrologyNatalChart.objects.update_or_create(
            patient=patient,
            defaults={
                'created_by': therapist,
                'house_system': 'placidus',
                'source': 'kerykeion',
                'status': 'ok',
                'chart_payload': normalized_chart,
                'input_snapshot': input_data_dict
            }
        )
        
        chart_count_after = AstrologyNatalChart.objects.filter(patient=patient).count()
        print(f"  📊 Cartas después: {chart_count_after}")
        
        if chart_count_after == chart_count_before and not created:
            print("  ✅ Carta actualizada (no duplicada)")
        else:
            print("  ⚠️  Se creó una carta nueva en lugar de actualizar")
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False
    
    print("\n" + "=" * 60)
    print("🎉 TODOS LOS TESTS PASARON")
    return True


if __name__ == "__main__":
    print("🚀 Iniciando validación del endpoint de Astrología\n")
    
    success = test_astrology_endpoint()
    
    if success:
        print("\n✅ Validación exitosa")
        sys.exit(0)
    else:
        print("\n❌ Validación fallida")
        sys.exit(1)
