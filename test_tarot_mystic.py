#!/usr/bin/env python
"""
Test del Oráculo Místico de Tarot con Perfil SCL-90 Inventado

Simula una tirada de 3 cartas para un consultante con:
- Alta ansiedad
- Somatización moderada
- Fecha de nacimiento: 15 de mayo de 1990

Ejecutar: python test_tarot_mystic.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.chdir(os.path.join(os.path.dirname(__file__), 'backend'))
django.setup()

from datetime import date
from api.tarot_holistic_views import (
    ORACLE_SYSTEM_PROMPT,
    INTERPRET_SPREAD_MYSTIC_PROMPT,
    SCL90_CHAKRA_MAP,
    calculate_soul_number,
    get_card_number,
    calculate_karmic_number,
    get_numerology_message,
    format_profile_for_prompt,
)


def create_mock_profile():
    """Crea un perfil psicológico inventado con ansiedad alta y somatización."""
    elevated = [
        {
            "dimension": "ansiedad",
            "score": 2.8,
            "chakra": SCL90_CHAKRA_MAP["ansiedad"]["chakra"],
            "desequilibrio": SCL90_CHAKRA_MAP["ansiedad"]["desequilibrio"],
            "sanacion": SCL90_CHAKRA_MAP["ansiedad"]["sanacion"],
            "hierba": SCL90_CHAKRA_MAP["ansiedad"]["hierba"],
        },
        {
            "dimension": "somatizacion",
            "score": 1.9,
            "chakra": SCL90_CHAKRA_MAP["somatizacion"]["chakra"],
            "desequilibrio": SCL90_CHAKRA_MAP["somatizacion"]["desequilibrio"],
            "sanacion": SCL90_CHAKRA_MAP["somatizacion"]["sanacion"],
            "hierba": SCL90_CHAKRA_MAP["somatizacion"]["hierba"],
        },
    ]
    
    return {
        "available": True,
        "source": "SCL-90 (simulado)",
        "summary": "Áreas de atención: **Ansiedad** elevada → Manipura + Anahata | **Somatización** moderada → Muladhara",
        "elevated_dimensions": elevated,
        "chakras_affected": ["Manipura + Anahata", "Muladhara (Raíz)"],
        "birth_date": date(1990, 5, 15),
    }


def create_mock_spread():
    """Crea una tirada de 3 cartas: Pasado, Presente, Futuro."""
    return [
        {
            "arcanaId": "the_tower",
            "arcanaName": "La Torre",
            "position": "pasado",
            "reversed": False,
        },
        {
            "arcanaId": "the_hanged_man",
            "arcanaName": "El Colgado",
            "position": "presente",
            "reversed": False,
        },
        {
            "arcanaId": "the_star",
            "arcanaName": "La Estrella",
            "position": "futuro",
            "reversed": False,
        },
    ]


def test_numerology():
    """Prueba el sistema de numerología kármica."""
    print("\n" + "=" * 60)
    print("🔢 TEST DE NUMEROLOGÍA KÁRMICA")
    print("=" * 60)
    
    birth_date = date(1990, 5, 15)
    soul_number = calculate_soul_number(birth_date)
    print(f"\n📅 Fecha de nacimiento: {birth_date}")
    print(f"🌟 Número del Alma: {soul_number}")
    
    # Cartas: La Torre (16), El Colgado (12), La Estrella (17)
    cards = ["the_tower", "the_hanged_man", "the_star"]
    card_numbers = [get_card_number(c) for c in cards]
    print(f"\n🃏 Cartas: La Torre, El Colgado, La Estrella")
    print(f"🔢 Números: {card_numbers}")
    
    cards_sum = sum(card_numbers)
    karmic_number = calculate_karmic_number(soul_number, card_numbers)
    message = get_numerology_message(karmic_number)
    
    print(f"\n✨ Suma de cartas: {cards_sum}")
    print(f"⚡ Número Kármico: {karmic_number}")
    print(f"\n💫 Mensaje Kármico:")
    print(f"   {message}")


def test_profile_formatting():
    """Prueba el formateo del perfil para el prompt."""
    print("\n" + "=" * 60)
    print("👤 TEST DE PERFIL PSICOLÓGICO")
    print("=" * 60)
    
    profile = create_mock_profile()
    formatted = format_profile_for_prompt(profile)
    
    print("\n📋 Perfil formateado para el prompt:")
    print("-" * 40)
    print(formatted)
    print("-" * 40)


def build_full_prompt():
    """Construye el prompt completo que se enviaría a la IA."""
    print("\n" + "=" * 60)
    print("📜 PROMPT COMPLETO PARA LA IA")
    print("=" * 60)
    
    # Datos
    profile = create_mock_profile()
    cards = create_mock_spread()
    birth_date = profile["birth_date"]
    
    # Numerología
    soul_number = calculate_soul_number(birth_date)
    card_numbers = [get_card_number(c["arcanaId"]) for c in cards]
    cards_sum = sum(card_numbers)
    karmic_number = calculate_karmic_number(soul_number, card_numbers)
    numerology_message = get_numerology_message(karmic_number)
    
    # Descripción de cartas
    cards_description = []
    for i, card in enumerate(cards, 1):
        position = card["position"]
        reversed_text = "🔄 INVERTIDA" if card.get("reversed") else "⬆️ DERECHA"
        card_num = get_card_number(card["arcanaId"])
        cards_description.append(
            f"{i}. **{card['arcanaName']}** (Nº {card_num})\n"
            f"   Posición: {position} | {reversed_text}"
        )
    
    # Construir prompt
    prompt = INTERPRET_SPREAD_MYSTIC_PROMPT.format(
        spread_type="three_card",
        tarot_system="rider-waite",
        cards_description="\n".join(cards_description),
        psychological_profile=format_profile_for_prompt(profile),
        soul_number=soul_number,
        cards_sum=cards_sum,
        karmic_number=karmic_number,
        numerology_message=numerology_message,
    )
    
    prompt += "\n\n**Pregunta del consultante**: ¿Cómo puedo manejar mejor mi ansiedad?"
    
    print("\n🔮 SYSTEM PROMPT (primeras 500 chars):")
    print("-" * 40)
    print(ORACLE_SYSTEM_PROMPT[:500] + "...")
    print("-" * 40)
    
    print("\n📝 USER PROMPT COMPLETO:")
    print("-" * 40)
    print(prompt)
    print("-" * 40)
    
    return prompt


def test_with_ai():
    """Prueba real con el servicio AI (requiere API keys configuradas)."""
    print("\n" + "=" * 60)
    print("🤖 TEST CON IA REAL")
    print("=" * 60)
    
    try:
        from api.astrology_ai_service import AstrologyAIService
        from api.tarot_holistic_views import filter_clinical_terms
        
        ai_service = AstrologyAIService()
        
        if not ai_service.enabled:
            print(f"\n❌ Servicio AI no disponible: {ai_service.error_message}")
            print("   Configura GROQ_API_KEY, OLLAMA_API_BASE o GEMINI_API_KEY")
            return
        
        print(f"\n✅ Provider activo: {ai_service.provider}")
        print(f"   Modelo: {ai_service.model_name}")
        
        # Construir prompt
        profile = create_mock_profile()
        cards = create_mock_spread()
        birth_date = profile["birth_date"]
        soul_number = calculate_soul_number(birth_date)
        card_numbers = [get_card_number(c["arcanaId"]) for c in cards]
        karmic_number = calculate_karmic_number(soul_number, card_numbers)
        
        cards_description = "\n".join([
            f"{i}. **{c['arcanaName']}** (Nº {get_card_number(c['arcanaId'])})\n   Posición: {c['position']}"
            for i, c in enumerate(cards, 1)
        ])
        
        user_prompt = INTERPRET_SPREAD_MYSTIC_PROMPT.format(
            spread_type="three_card",
            tarot_system="rider-waite",
            cards_description=cards_description,
            psychological_profile=format_profile_for_prompt(profile),
            soul_number=soul_number,
            cards_sum=sum(card_numbers),
            karmic_number=karmic_number,
            numerology_message=get_numerology_message(karmic_number),
        )
        user_prompt += "\n\n**Pregunta**: ¿Cómo puedo manejar mejor mi ansiedad?"
        
        print("\n⏳ Generando interpretación mística...")
        
        interpretation = ai_service._generate_content(
            system_prompt=ORACLE_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            max_tokens=1500,
            temperature=0.85,
        )
        
        # Filtrar términos clínicos
        interpretation = filter_clinical_terms(interpretation)
        
        print("\n" + "=" * 60)
        print("🔮 INTERPRETACIÓN DEL ORÁCULO")
        print("=" * 60)
        print(interpretation)
        print("=" * 60)
        
        # Contar palabras
        word_count = len(interpretation.split())
        print(f"\n📊 Palabras: {word_count} (máximo recomendado: 300)")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("=" * 60)
    print("🌙 TEST DEL ORÁCULO MÍSTICO DE TAROT")
    print("   Con integración SCL-90 y Numerología Kármica")
    print("=" * 60)
    
    # Tests sin IA (siempre funcionan)
    test_numerology()
    test_profile_formatting()
    build_full_prompt()
    
    # Test con IA (requiere API keys)
    print("\n" + "=" * 60)
    input("Presiona ENTER para probar con IA real (o Ctrl+C para salir)...")
    test_with_ai()
