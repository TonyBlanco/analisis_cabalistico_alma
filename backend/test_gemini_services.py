#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script de prueba para verificar que todos los servicios de Gemini responden correctamente
"""
import os
import sys
import django
import json

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

print("=" * 80)
print("TEST DE SERVICIOS GEMINI API")
print("=" * 80)

# Test 1: GematriaAI
print("\n" + "=" * 80)
print("TEST 1: GematriaAI")
print("=" * 80)

try:
    from api.utils.gematria_ai import gematria_ai
    
    if gematria_ai.enabled:
        print(f"[OK] GematriaAI habilitado (modelo: {gematria_ai.model_name})")
        
        # Test con datos de ejemplo
        result = gematria_ai.generate_interpretation(
            word="שלום",
            ragil=376,
            katan=19,
            gadol=376,
            atbash_value=123,
            resonances=[
                {"word": "שלום", "transliteration": "shalom", "meaning": "paz"}
            ]
        )
        
        if "error" in result:
            print(f"[ERROR] GematriaAI: {result['error']}")
            if 'raw_response' in result:
                print(f"   Raw response (primeros 500 chars): {result['raw_response']}")
        else:
            print(f"[OK] GematriaAI respondio correctamente")
            print(f"   Titulo: {result.get('titulo', 'N/A')[:50]}...")
    else:
        print(f"[WARNING] GematriaAI no habilitado: {gematria_ai.error_message}")
except Exception as e:
    print(f"[ERROR] GematriaAI: {e}")
    import traceback
    traceback.print_exc()

# Test 2: HolisticTherapistAI
print("\n" + "=" * 80)
print("TEST 2: HolisticTherapistAI")
print("=" * 80)

try:
    from api.utils.holistic_ai import holistic_ai
    
    if holistic_ai.enabled:
        print(f"[OK] HolisticTherapistAI habilitado (modelo: {holistic_ai.model_name})")
        
        # Test con datos de ejemplo
        patient_data = {
            "full_name": "Test Paciente",
            "birth_date": "1990-01-15",
            "main_complaint": "Ansiedad",
            "clinical_history": "Historial de prueba",
            "therapy_level": "Intermedio"
        }
        
        test_history = [
            {
                "test_id": "GAD-7",
                "test_name": "GAD-7",
                "score": 15,
                "clinical_diagnosis": "Ansiedad Severa",
                "angel_remedy": "Caliel"
            }
        ]
        
        result = holistic_ai.generate_report(patient_data, test_history)
        
        if "error" in result:
            print(f"[ERROR] HolisticTherapistAI: {result['error']}")
            if 'raw_response' in result:
                print(f"   Raw response (primeros 500 chars): {result['raw_response']}")
        else:
            print(f"[OK] HolisticTherapistAI respondio correctamente")
            print(f"   Sintesis: {result.get('sintesis_diagnostica', 'N/A')[:50]}...")
    else:
        print(f"[WARNING] HolisticTherapistAI no habilitado: {holistic_ai.error_message}")
except Exception as e:
    print(f"[ERROR] HolisticTherapistAI: {e}")
    import traceback
    traceback.print_exc()

# Test 3: TarotTherapeuticAI
print("\n" + "=" * 80)
print("TEST 3: TarotTherapeuticAI")
print("=" * 80)

try:
    from api.utils.tarot_service import tarot_ai
    
    if tarot_ai.enabled:
        print(f"[OK] TarotTherapeuticAI habilitado (modelo: {tarot_ai.model_name})")
        
        # Test con datos de ejemplo
        result = tarot_ai.analyze_archetype_vs_clinical(
            arcana_number=7,
            arcana_name="El Carro",
            hebrew_letter="ח",
            test_name="GAD-7",
            clinical_severity="Ansiedad Severa",
            patient_name="Test Paciente"
        )
        
        if "error" in result:
            print(f"[ERROR] TarotTherapeuticAI: {result['error']}")
            if 'raw_response' in result:
                print(f"   Raw response (primeros 500 chars): {result['raw_response']}")
        else:
            print(f"[OK] TarotTherapeuticAI respondio correctamente")
            print(f"   Analisis sombra: {result.get('analisis_sombra', 'N/A')[:50]}...")
            print(f"   Acciones sanadoras: {len(result.get('acciones_sanadoras', []))} acciones")
    else:
        print(f"[WARNING] TarotTherapeuticAI no habilitado: {tarot_ai.error_message}")
except Exception as e:
    print(f"[ERROR] TarotTherapeuticAI: {e}")
    import traceback
    traceback.print_exc()

# Test 4: GeminiInterpreter
print("\n" + "=" * 80)
print("TEST 4: GeminiInterpreter - generate_basic_interpretation")
print("=" * 80)

try:
    from api.ai_interpreter import gemini_interpreter
    
    if gemini_interpreter.enabled:
        print(f"[OK] GeminiInterpreter habilitado (modelo: {gemini_interpreter.model_name})")
        
        # Test con datos de ejemplo
        numeros = {
            "destino": 7,
            "alma": 5,
            "personalidad": 2,
            "expresion": 7
        }
        
        result = gemini_interpreter.generate_basic_interpretation(
            nombre="Test Usuario",
            fecha_nacimiento="1990-01-15",
            numeros=numeros
        )
        
        if result and len(result) > 100:
            print(f"[OK] GeminiInterpreter.generate_basic_interpretation respondio correctamente")
            print(f"   Longitud respuesta: {len(result)} caracteres")
            print(f"   Preview: {result[:100]}...")
        else:
            print(f"[WARNING] GeminiInterpreter respuesta muy corta o vacia")
    else:
        print(f"[WARNING] GeminiInterpreter no habilitado")
except Exception as e:
    print(f"[ERROR] GeminiInterpreter.generate_basic_interpretation: {e}")
    import traceback
    traceback.print_exc()

# Test 5: GeminiInterpreter - generate_career_guidance
print("\n" + "=" * 80)
print("TEST 5: GeminiInterpreter - generate_career_guidance")
print("=" * 80)

try:
    if gemini_interpreter.enabled:
        numeros = {
            "destino": 7,
            "expresion": 5
        }
        
        result = gemini_interpreter.generate_career_guidance(
            nombre="Test Usuario",
            numeros=numeros
        )
        
        if result and len(result) > 100:
            print(f"[OK] GeminiInterpreter.generate_career_guidance respondio correctamente")
            print(f"   Longitud respuesta: {len(result)} caracteres")
            print(f"   Preview: {result[:100]}...")
        else:
            print(f"[WARNING] GeminiInterpreter respuesta muy corta o vacia")
except Exception as e:
    print(f"[ERROR] GeminiInterpreter.generate_career_guidance: {e}")
    import traceback
    traceback.print_exc()

# Test 6: GeminiInterpreter - generate_spiritual_path
print("\n" + "=" * 80)
print("TEST 6: GeminiInterpreter - generate_spiritual_path")
print("=" * 80)

try:
    if gemini_interpreter.enabled:
        numeros = {
            "alma": 5,
            "destino": 7
        }
        
        result = gemini_interpreter.generate_spiritual_path(
            nombre="Test Usuario",
            numeros=numeros
        )
        
        if result and len(result) > 100:
            print(f"[OK] GeminiInterpreter.generate_spiritual_path respondio correctamente")
            print(f"   Longitud respuesta: {len(result)} caracteres")
            print(f"   Preview: {result[:100]}...")
        else:
            print(f"[WARNING] GeminiInterpreter respuesta muy corta o vacia")
except Exception as e:
    print(f"[ERROR] GeminiInterpreter.generate_spiritual_path: {e}")
    import traceback
    traceback.print_exc()

# Resumen
print("\n" + "=" * 80)
print("RESUMEN DE TESTS")
print("=" * 80)

print("\nTodos los servicios han sido probados.")
print("Revisa los resultados arriba para verificar que cada uno respondio correctamente.")

print("\n" + "=" * 80)
print("TEST COMPLETADO")
print("=" * 80)

