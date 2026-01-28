#!/usr/bin/env python
"""Test rápido del oráculo místico."""
import os, sys
os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'
sys.path.insert(0, 'backend')
os.chdir('backend')
import django; django.setup()

from datetime import date
from api.tarot_holistic_views import (
    ORACLE_SYSTEM_PROMPT, INTERPRET_SPREAD_MYSTIC_PROMPT,
    calculate_soul_number, get_card_number, calculate_karmic_number,
    get_numerology_message, format_profile_for_prompt, filter_clinical_terms
)
from api.astrology_ai_service import AstrologyAIService

# Crear perfil mock con alta ansiedad
profile = {
    'available': True,
    'elevated_dimensions': [
        {'dimension': 'ansiedad', 'score': 2.8, 'chakra': 'Manipura + Anahata', 
         'desequilibrio': 'sistema nervioso hiperalerta, falta de seguridad interna',
         'sanacion': 'respiración 4-7-8, grounding, journaling',
         'hierba': 'manzanilla, kava, melisa'},
    ],
    'summary': 'Áreas de atención: **Ansiedad** elevada → Manipura + Anahata',
    'chakras_affected': ['Manipura + Anahata'],
}

# Cartas de la tirada
cards = [
    {'name': 'La Torre', 'id': 'the_tower', 'pos': 'pasado'},
    {'name': 'El Colgado', 'id': 'the_hanged_man', 'pos': 'presente'},
    {'name': 'La Estrella', 'id': 'the_star', 'pos': 'futuro'},
]

# Numerología
birth_date = date(1990, 5, 15)
soul = calculate_soul_number(birth_date)
card_nums = [get_card_number(c['id']) for c in cards]
karmic = calculate_karmic_number(soul, card_nums)

print(f"🌟 Número del Alma: {soul}")
print(f"🃏 Cartas: La Torre(16), El Colgado(12), La Estrella(17)")
print(f"⚡ Número Kármico: {karmic}")
print(f"💫 Mensaje: {get_numerology_message(karmic)[:80]}...")

# Construir descripción de cartas
cards_desc = []
for i, c in enumerate(cards, 1):
    num = get_card_number(c['id'])
    cards_desc.append(f"{i}. **{c['name']}** (Arcano {num})\n   Posición: {c['pos']} | Derecha")

# Construir prompt
prompt = INTERPRET_SPREAD_MYSTIC_PROMPT.format(
    spread_type='three_card (Pasado/Presente/Futuro)',
    tarot_system='rider-waite',
    cards_description='\n'.join(cards_desc),
    psychological_profile=format_profile_for_prompt(profile),
    soul_number=soul,
    cards_sum=sum(card_nums),
    karmic_number=karmic,
    numerology_message=get_numerology_message(karmic),
)
prompt += '\n\n**Pregunta del consultante**: ¿Cómo puedo manejar mejor mi ansiedad?'

# Generar con IA
ai = AstrologyAIService()
print(f'\n🤖 Provider: {ai.provider} | Modelo: {ai.model_name}')
print('⏳ Generando interpretación mística...\n')

result = ai._generate_content(
    system_prompt=ORACLE_SYSTEM_PROMPT,
    user_prompt=prompt,
    max_tokens=1200,
    temperature=0.85,
)

result = filter_clinical_terms(result)
print('=' * 60)
print('🔮 INTERPRETACIÓN DEL ORÁCULO')
print('=' * 60)
print(result)
print('=' * 60)
print(f'📊 Palabras: {len(result.split())}')
