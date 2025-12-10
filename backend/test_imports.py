#!/usr/bin/env python
"""Test script para verificar imports y configuración"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

print("=" * 60)
print("VERIFICACIÓN DE MÓDULOS")
print("=" * 60)

# Test 1: Settings de Gemini
print("\n1. Verificando configuración de Gemini...")
from django.conf import settings
print(f"   GEMINI_API_KEY configurada: {'Sí' if hasattr(settings, 'GEMINI_API_KEY') and settings.GEMINI_API_KEY else 'No'}")
if hasattr(settings, 'GEMINI_API_KEY'):
    key = settings.GEMINI_API_KEY
    print(f"   API Key: {key[:10]}...{key[-10:] if len(key) > 20 else key}")
print(f"   GEMINI_MODEL: {settings.GEMINI_MODEL if hasattr(settings, 'GEMINI_MODEL') else 'No configurado'}")

# Test 2: Importar calculator
print("\n2. Importando calculator...")
try:
    from api.cabalistic_engine import calculator
    print("   ✅ Calculator importado correctamente")
    print(f"   Tipo: {type(calculator)}")
except Exception as e:
    print(f"   ❌ Error: {e}")
    import traceback
    traceback.print_exc()

# Test 3: Importar gemini_interpreter
print("\n3. Importando gemini_interpreter...")
try:
    from api.ai_interpreter import gemini_interpreter
    print("   ✅ Gemini interpreter importado correctamente")
    print(f"   Tipo: {type(gemini_interpreter)}")
    print(f"   Habilitado: {gemini_interpreter.enabled}")
except Exception as e:
    print(f"   ❌ Error: {e}")
    import traceback
    traceback.print_exc()

# Test 4: Calcular perfil
print("\n4. Test de cálculo...")
try:
    perfil = calculator.calculate_full_profile("Luis Antonio Blanco Fontela", "1959-08-01")
    print("   ✅ Cálculo exitoso")
    print(f"   Resultado: {perfil}")
except Exception as e:
    print(f"   ❌ Error: {e}")
    import traceback
    traceback.print_exc()

# Test 5: Generar interpretación
print("\n5. Test de interpretación IA...")
try:
    interpretacion = gemini_interpreter.generate_basic_interpretation(
        "Luis Antonio Blanco Fontela",
        "1959-08-01",
        perfil
    )
    print("   ✅ Interpretación generada")
    print(f"   Longitud: {len(interpretacion)} caracteres")
    print(f"   Preview: {interpretacion[:200]}...")
except Exception as e:
    print(f"   ❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("VERIFICACIÓN COMPLETA")
print("=" * 60)
