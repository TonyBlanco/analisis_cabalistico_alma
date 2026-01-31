#!/usr/bin/env python3
"""
Script de Validación - Ciclos de Sombra Personal (Qliphoth)

Valida el funcionamiento completo del sistema de ciclos Qliphoth:
- Calculadora backend
- API endpoints  
- Mapeo de eventos históricos
- Generación de alertas éticas
"""

import os
import sys
import django
from datetime import date, datetime
import json

# Setup Django - ajustar paths
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, 'backend')
sys.path.append(current_dir)
sys.path.append(backend_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.core.settings')
django.setup()

from django.contrib.auth.models import User
from backend.api.models import Patient, Consultante
from backend.api.cabala_qliphoth_cycles import qliphoth_cycle_calculator, QliphothCycleCalculator
from backend.api.test_models import TestResult, TestModule

def crear_consultante_test():
    """Crea un consultante de prueba para validación"""
    try:
        # Crear usuario terapeuta
        therapist = User.objects.filter(username='test_therapist').first()
        if not therapist:
            therapist = User.objects.create_user(
                username='test_therapist',
                email='therapist@test.com',
                password='test123'
            )
            print(f"✓ Terapeuta creado: {therapist.username}")
        
        # Crear consultante
        consultante = Consultante.objects.filter(
            therapist=therapist, 
            full_name='Test Consultante Qliphoth'
        ).first()
        
        if not consultante:
            consultante = Consultante.objects.create(
                therapist=therapist,
                full_name='Test Consultante Qliphoth',
                birth_date=date(1990, 5, 15),  # 33-34 años
                email='consultante@test.com'
            )
            print(f"✓ Consultante creado: {consultante.full_name} (UUID: {consultante.uuid})")
        
        return consultante
        
    except Exception as e:
        print(f"❌ Error creando consultante test: {e}")
        return None

def validar_calculadora_qliphoth():
    """Valida la calculadora de Qliphoth"""
    print("\n=== Validando Calculadora Qliphoth ===")
    
    # Test 1: Cálculo de Qliphoth actual
    birth_date = date(1990, 5, 15)
    current_date = date(2024, 1, 31)
    
    try:
        result = qliphoth_cycle_calculator.calculate_current_qliphoth(birth_date, current_date)
        
        print(f"✓ Fecha nacimiento: {birth_date}")
        print(f"✓ Fecha análisis: {current_date}")
        print(f"✓ Edad: {result['current_age']} años")
        print(f"✓ Qliphoth actual: {result['current_qliphoth']}")
        print(f"✓ Año del ciclo: {result['cycle_year']}")
        print(f"✓ Sefirá correspondiente: {result['corresponding_sefira']}")
        print(f"✓ Manifestación sombría: {result['shadow_manifestation'][:60]}...")
        print(f"✓ Próxima transición en: {result['days_until_transition']} días")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en calculadora: {e}")
        return False

def validar_mapeo_eventos():
    """Valida el mapeo de eventos históricos"""
    print("\n=== Validando Mapeo de Eventos ===")
    
    consultante = crear_consultante_test()
    if not consultante:
        return False
    
    try:
        # Crear algunos eventos de prueba
        test_module = TestModule.objects.filter(code='GAD7').first()
        if not test_module:
            test_module = TestModule.objects.create(
                code='GAD7',
                name='Escala de Ansiedad GAD-7'
            )
        
        # Simular paciente legacy asociado
        patient = Patient.objects.filter(therapist=consultante.therapist).first()
        if not patient:
            patient = Patient.objects.create(
                therapist=consultante.therapist,
                full_name=consultante.full_name,
                birth_date=consultante.birth_date,
                email=consultante.email
            )
        
        # Crear test result de prueba
        test_result = TestResult.objects.create(
            patient=patient,
            test_module=test_module,
            score=85,
            clinical_severity='Alto',
            created_at=datetime(2020, 3, 15)  # Hace varios años
        )
        
        # Mapear eventos
        events = qliphoth_cycle_calculator.map_events_to_qliphoth(
            str(patient.id),  # Usar patient ID porque la función espera un ID de Patient
            consultante.birth_date
        )
        
        print(f"✓ Eventos mapeados: {len(events)}")
        
        if events:
            evento = events[0]
            print(f"✓ Ejemplo evento:")
            print(f"  - Año: {evento['year']}")
            print(f"  - Edad: {evento['age']}")
            print(f"  - Qliphoth: {evento['qliphoth']}")
            print(f"  - Eventos: {len(evento['events'])}")
            print(f"  - Patrón detectado: {evento['detected_pattern']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en mapeo de eventos: {e}")
        import traceback
        traceback.print_exc()
        return False

def validar_patrones_sombra():
    """Valida la detección de patrones de sombra"""
    print("\n=== Validando Detección de Patrones ===")
    
    # Crear eventos de prueba
    eventos_prueba = [
        {
            'year': 2015,
            'age': 25,
            'qliphoth': 'samael',
            'events': [{'is_crisis': True, 'name': 'GAD-7', 'severity': 'Alto'}],
            'detected_pattern': 'Crisis durante Samael'
        },
        {
            'year': 2018,
            'age': 28,
            'qliphoth': 'golachab',
            'events': [{'is_crisis': True, 'name': 'PHQ-9', 'severity': 'Severo'}],
            'detected_pattern': 'Crisis durante Golachab'
        },
        {
            'year': 2024,
            'age': 34,
            'qliphoth': 'samael',
            'events': [{'is_crisis': False, 'name': 'Evaluación', 'severity': 'Normal'}],
            'detected_pattern': 'Evaluación durante Samael'
        }
    ]
    
    try:
        patterns = qliphoth_cycle_calculator.detect_shadow_patterns(eventos_prueba)
        
        print(f"✓ Total eventos: {patterns['total_events']}")
        print(f"✓ Eventos de crisis: {patterns['crisis_events']}")
        print(f"✓ Correlaciones crisis-Qliphoth: {patterns['qliphoth_crisis_correlation']}")
        
        if patterns['cycle_repetition']:
            print(f"✓ Repeticiones detectadas: {len(patterns['cycle_repetition'])}")
            for rep in patterns['cycle_repetition']:
                print(f"  - {rep['qliphoth']}: años {rep['years']}")
        
        if patterns.get('most_challenging_qliphoth'):
            print(f"✓ Qliphoth más desafiante: {patterns['most_challenging_qliphoth']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en detección de patrones: {e}")
        return False

def validar_alertas_eticas():
    """Valida la generación de alertas éticas"""
    print("\n=== Validando Alertas Éticas ===")
    
    patterns = {
        'qliphoth_crisis_correlation': {'samael': 2, 'golachab': 1},
        'cycle_repetition': [
            {
                'qliphoth': 'samael',
                'years': [2015, 2024],
                'pattern': 'Patrón de Samael cada ~9 años'
            }
        ],
        'most_challenging_qliphoth': 'samael'
    }
    
    try:
        birth_date = date(1990, 5, 15)
        alerts = qliphoth_cycle_calculator.generate_shadow_alerts(
            patterns, 
            birth_date
        )
        
        print(f"✓ Alertas generadas: {len(alerts)}")
        
        for i, alert in enumerate(alerts, 1):
            print(f"✓ Alerta {i}:")
            print(f"  - Tipo: {alert['type']}")
            print(f"  - Qliphoth: {alert['qliphoth']}")
            print(f"  - Días hasta entrada: {alert['days_until']}")
            print(f"  - Mensaje: {alert['message'][:80]}...")
            print(f"  - Sugerencia: {alert['suggestion'][:60]}...")
        
        # Verificar que no hay lenguaje determinista
        for alert in alerts:
            mensaje = alert['message'].lower()
            if any(palabra in mensaje for palabra in ['vas a', 'tendrás', 'sucederá']):
                print(f"❌ ALERTA: Lenguaje determinista detectado: {alert['message']}")
                return False
        
        print("✓ Verificación ética: No se detectó lenguaje determinista")
        return True
        
    except Exception as e:
        print(f"❌ Error en alertas éticas: {e}")
        return False

def validar_endpoint_api():
    """Valida que el endpoint API esté configurado correctamente"""
    print("\n=== Validando Configuración API ===")
    
    try:
        from backend.api.cabalistic_views import ConsultanteQliphothCyclesView
        print("✓ Vista ConsultanteQliphothCyclesView importada correctamente")
        
        # Verificar que está en urls.py
        from backend.api.urls import urlpatterns
        qliphoth_urls = [
            pattern for pattern in urlpatterns 
            if hasattr(pattern, 'pattern') and 'qliphoth-cycles' in str(pattern.pattern)
        ]
        
        if qliphoth_urls:
            print(f"✓ URL pattern configurada: {qliphoth_urls[0].pattern}")
        else:
            print("❌ URL pattern para qliphoth-cycles no encontrada")
            return False
        
        return True
        
    except ImportError as e:
        print(f"❌ Error importando vista: {e}")
        return False
    except Exception as e:
        print(f"❌ Error validando API: {e}")
        return False

def ejecutar_validacion_completa():
    """Ejecuta todas las validaciones"""
    print("🔮 VALIDACIÓN COMPLETA - CICLOS DE SOMBRA PERSONAL (QLIPHOTH)")
    print("=" * 60)
    
    tests = [
        validar_calculadora_qliphoth,
        validar_mapeo_eventos,  
        validar_patrones_sombra,
        validar_alertas_eticas,
        validar_endpoint_api
    ]
    
    resultados = []
    
    for test in tests:
        try:
            resultado = test()
            resultados.append(resultado)
        except Exception as e:
            print(f"❌ Error en test {test.__name__}: {e}")
            resultados.append(False)
    
    print("\n" + "=" * 60)
    print("RESUMEN DE VALIDACIÓN")
    print("=" * 60)
    
    exitosos = sum(resultados)
    total = len(resultados)
    
    print(f"✓ Tests exitosos: {exitosos}/{total}")
    print(f"❌ Tests fallidos: {total - exitosos}/{total}")
    
    if exitosos == total:
        print("🎉 ¡VALIDACIÓN COMPLETA EXITOSA!")
        print("El sistema de Ciclos de Sombra Personal está funcionando correctamente.")
    else:
        print("⚠️  Algunos tests fallaron. Revisa los errores arriba.")
    
    return exitosos == total

if __name__ == '__main__':
    ejecutar_validacion_completa()