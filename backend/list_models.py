#!/usr/bin/env python
"""Script para listar modelos disponibles de Gemini"""
import google.generativeai as genai
import os
from decouple import config

# Configurar API key
api_key = config('GEMINI_API_KEY')
genai.configure(api_key=api_key)

print("=" * 60)
print("MODELOS DISPONIBLES EN GEMINI")
print("=" * 60)

try:
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"\n✅ {model.name}")
            print(f"   Display name: {model.display_name}")
            print(f"   Description: {model.description}")
            print(f"   Métodos: {', '.join(model.supported_generation_methods)}")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
