import os
import sys
sys.path.insert(0, '.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()

from django.conf import settings
from google import genai
from google.genai import types

client = genai.Client(api_key=settings.GEMINI_API_KEY)
model = settings.GEMINI_MODEL

# Use the exact same system prompt and user prompt
system_prompt = """Eres un astrólogo profesional especializado en lectura simbólica y holística.
Eres reconocido por tus interpretaciones DETALLADAS Y PROFUNDAS que ayudan a los terapeutas
a comprender verdaderamente a sus consultantes.

REGLAS ESTRICTAS:
1. NUNCA uses terminología clínica o diagnóstica
2. Usa "consultante" en lugar de "paciente"
3. Ofrece orientaciones, NO predicciones absolutas
4. Incluye siempre el disclaimer de lectura simbólica
5. Responde en español profesional pero accesible
6. IMPORTANTE: Proporciona interpretaciones DETALLADAS de 800-1200 palabras
7. Desarrolla CADA sección con profundidad, no solo menciones superficiales
8. Incluye ejemplos concretos de cómo se puede manifestar cada energía

Tu enfoque integra:
- Astrología psicológica (Liz Greene, Howard Sasportas)
- Correspondencias cabalísticas tradicionales
- Orientación práctica para el terapeuta holístico"""

user_prompt = """Analiza la siguiente carta natal:
- Sol en Leo, Casa 5
- Luna en Cancer, Casa 5  
- Ascendente en Sagitario

Proporciona una interpretación COMPLETA y DETALLADA de al menos 800 palabras."""

config = types.GenerateContentConfig(
    temperature=0.7,
    maxOutputTokens=2048,
    systemInstruction=system_prompt,
)

response = client.models.generate_content(
    model=model,
    contents=user_prompt,
    config=config,
)

print('Model:', model)
print('Finish reason:', response.candidates[0].finish_reason)
print('Text length:', len(response.text))
print()
print('=== RESPONSE ===')
print(response.text)
