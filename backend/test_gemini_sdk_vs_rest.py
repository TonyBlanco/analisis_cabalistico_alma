#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script de prueba para comparar SDK de google-generativeai vs API REST
Compara: velocidad, facilidad de uso, errores, y resultados
"""
import os
import sys
import time
import json
from typing import Dict, Any

# Forzar flush de salida
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

print("🚀 Iniciando script de prueba...", flush=True)

try:
    import django
    # Setup Django
    sys.path.insert(0, os.path.dirname(__file__))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()
    
    from django.conf import settings
    
    print("=" * 80, flush=True)
    print("TEST DE COMPARACIÓN: SDK vs API REST", flush=True)
    print("=" * 80, flush=True)
except Exception as e:
    print(f"❌ ERROR al configurar Django: {e}", flush=True)
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Configuración
api_key = getattr(settings, 'GEMINI_API_KEY', None)
model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-1.5-flash')

if not api_key:
    print("❌ ERROR: GEMINI_API_KEY no está configurada")
    sys.exit(1)

print(f"\n📋 Configuración:")
print(f"   Modelo: {model_name}")
print(f"   API Key: {api_key[:10]}...{api_key[-10:]}")

# Prompt de prueba
test_prompt = """Eres un experto en numerología cabalística. 
Responde en formato JSON con esta estructura:
{
  "numero": 7,
  "significado": "Breve explicación del número 7 en cábala",
  "mensaje": "Mensaje espiritual"
}

Responde SOLO con el JSON, sin texto adicional."""

print(f"\n📝 Prompt de prueba ({len(test_prompt)} caracteres):")
print(f"   {test_prompt[:100]}...")

# ==================== TEST 1: SDK ====================
print("\n" + "=" * 80)
print("TEST 1: SDK (google-generativeai)")
print("=" * 80)

sdk_available = False
sdk_result = None
sdk_time = None
sdk_error = None

try:
    import google.generativeai as genai
    sdk_available = True
    print("✅ SDK disponible")
    
    # Configurar
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name)
    
    # Test de velocidad
    print("\n⏱️  Midiendo velocidad...")
    start_time = time.time()
    
    response = model.generate_content(
        test_prompt,
        generation_config={
            "temperature": 0.8,
            "top_p": 0.9,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
    )
    
    sdk_time = time.time() - start_time
    sdk_result = response.text.strip()
    
    print(f"✅ Éxito en {sdk_time:.2f} segundos")
    print(f"   Longitud respuesta: {len(sdk_result)} caracteres")
    print(f"   Preview: {sdk_result[:150]}...")
    
except ImportError:
    sdk_error = "SDK no instalado (pip install google-generativeai)"
    print(f"❌ {sdk_error}")
except Exception as e:
    sdk_error = str(e)
    print(f"❌ Error: {sdk_error}")
    import traceback
    traceback.print_exc()

# ==================== TEST 2: REST API ====================
print("\n" + "=" * 80)
print("TEST 2: API REST (requests)")
print("=" * 80)

rest_result = None
rest_time = None
rest_error = None

try:
    import requests
    
    print("✅ requests disponible")
    
    # URL de la API REST
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
    
    payload = {
        "contents": [{
            "parts": [{
                "text": test_prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.8,
            "topP": 0.9,
            "topK": 40,
            "maxOutputTokens": 2048
        }
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    # Test de velocidad
    print("\n⏱️  Midiendo velocidad...")
    start_time = time.time()
    
    response = requests.post(url, json=payload, headers=headers, timeout=60)
    response.raise_for_status()
    
    data = response.json()
    
    # Extraer texto
    if 'candidates' in data and len(data['candidates']) > 0:
        candidate = data['candidates'][0]
        if 'content' in candidate and 'parts' in candidate['content']:
            parts = candidate['content']['parts']
            if len(parts) > 0 and 'text' in parts[0]:
                rest_result = parts[0]['text'].strip()
    
    rest_time = time.time() - start_time
    
    if rest_result:
        print(f"✅ Éxito en {rest_time:.2f} segundos")
        print(f"   Longitud respuesta: {len(rest_result)} caracteres")
        print(f"   Preview: {rest_result[:150]}...")
    else:
        rest_error = "No se pudo extraer texto de la respuesta"
        print(f"❌ {rest_error}")
        print(f"   Respuesta: {json.dumps(data, indent=2)[:500]}")
    
except ImportError:
    rest_error = "requests no instalado"
    print(f"❌ {rest_error}")
except Exception as e:
    rest_error = str(e)
    print(f"❌ Error: {rest_error}")
    import traceback
    traceback.print_exc()

# ==================== COMPARACIÓN ====================
print("\n" + "=" * 80)
print("COMPARACIÓN DE RESULTADOS")
print("=" * 80)

print("\n📊 Velocidad:")
if sdk_time and rest_time:
    if sdk_time < rest_time:
        diff = ((rest_time - sdk_time) / rest_time) * 100
        print(f"   🏆 SDK es {diff:.1f}% más rápido ({sdk_time:.2f}s vs {rest_time:.2f}s)")
    else:
        diff = ((sdk_time - rest_time) / sdk_time) * 100
        print(f"   🏆 REST es {diff:.1f}% más rápido ({rest_time:.2f}s vs {sdk_time:.2f}s)")
elif sdk_time:
    print(f"   SDK: {sdk_time:.2f}s | REST: ❌ Error")
elif rest_time:
    print(f"   SDK: ❌ Error | REST: {rest_time:.2f}s")
else:
    print("   ❌ Ambos métodos fallaron")

print("\n📦 Dependencias:")
print(f"   SDK: {'✅ Instalado' if sdk_available else '❌ No instalado (requiere: pip install google-generativeai)'}")
print(f"   REST: ✅ requests ya está instalado")

print("\n💡 Facilidad de uso:")
print("   SDK: ✅ Más fácil (API simple, manejo automático de errores)")
print("   REST: ⚠️  Más verboso (necesitas construir payload manualmente)")

print("\n🔧 Mantenimiento:")
print("   SDK: ⚠️  Dependencia adicional (google-generativeai)")
print("   REST: ✅ Solo usa requests (ya instalado)")

print("\n📝 Calidad de respuestas:")
if sdk_result and rest_result:
    # Comparar si son similares
    sdk_clean = sdk_result.replace(' ', '').replace('\n', '').lower()
    rest_clean = rest_result.replace(' ', '').replace('\n', '').lower()
    
    if sdk_clean == rest_clean:
        print("   ✅ Respuestas idénticas")
    else:
        similarity = len(set(sdk_clean) & set(rest_clean)) / len(set(sdk_clean) | set(rest_clean)) * 100
        print(f"   ⚠️  Respuestas diferentes (similitud: {similarity:.1f}%)")
        print(f"   SDK: {sdk_result[:100]}...")
        print(f"   REST: {rest_result[:100]}...")
elif sdk_result:
    print("   SDK: ✅ Funcionó | REST: ❌ Error")
elif rest_result:
    print("   SDK: ❌ Error | REST: ✅ Funcionó")
else:
    print("   ❌ Ambos métodos fallaron")

print("\n🎯 RECOMENDACIÓN:")
if sdk_available and sdk_result and rest_result:
    if sdk_time and rest_time:
        if abs(sdk_time - rest_time) < 0.5:  # Diferencia menor a 0.5s
            print("   💡 Ambos métodos son similares en velocidad.")
            print("   💡 Usa REST API si quieres evitar dependencias adicionales.")
            print("   💡 Usa SDK si prefieres una API más simple y fácil de usar.")
        elif sdk_time < rest_time:
            print("   💡 SDK es más rápido. Recomendado si la velocidad es crítica.")
        else:
            print("   💡 REST API es más rápido. Recomendado para mejor rendimiento.")
elif sdk_available and sdk_result:
    print("   💡 SDK funciona bien. Úsalo si está instalado.")
elif rest_result:
    print("   💡 REST API funciona sin dependencias adicionales. Recomendado.")
else:
    print("   ⚠️  Revisa la configuración de GEMINI_API_KEY")

print("\n" + "=" * 80)
print("TEST COMPLETADO")
print("=" * 80)