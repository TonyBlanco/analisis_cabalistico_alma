#!/usr/bin/env python
"""
Seed Ghost Tests Schemas - Reactivate and populate question banks for symbolic tests.

This script:
1. Reactivates ghost tests (asrs_essence, aq_kabbalah, sha_harmony)
2. Injects seed questions into the TestModule or Assignment schema
3. Sets proper domain and visibility flags

Usage:
    cd backend
    python scripts/seed_ghost_tests_schemas.py
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.test_models import TestModule

# ============================================================================
# QUESTION SCHEMAS FOR GHOST TESTS
# ============================================================================

ASRS_ESSENCE_QUESTIONS = [
    {
        "id": "asrs_1",
        "text": "¿Sientes que tu voluntad interna fluye sin fricción hacia la acción concreta?",
        "type": "likert_5",
        "category": "ritmo",
        "options": [
            {"value": 1, "label": "Nunca"},
            {"value": 2, "label": "Raramente"},
            {"value": 3, "label": "A veces"},
            {"value": 4, "label": "Frecuentemente"},
            {"value": 5, "label": "Siempre"}
        ]
    },
    {
        "id": "asrs_2",
        "text": "¿Experimentas periodos de gran inspiración seguidos de parálisis total?",
        "type": "likert_5",
        "category": "fragmentacion",
        "options": [
            {"value": 1, "label": "Nunca"},
            {"value": 2, "label": "Raramente"},
            {"value": 3, "label": "A veces"},
            {"value": 4, "label": "Frecuentemente"},
            {"value": 5, "label": "Siempre"}
        ]
    },
    {
        "id": "asrs_3",
        "text": "¿Tu energía vital se siente unificada o dispersa en múltiples direcciones?",
        "type": "likert_5",
        "category": "coherencia",
        "options": [
            {"value": 1, "label": "Muy dispersa"},
            {"value": 2, "label": "Algo dispersa"},
            {"value": 3, "label": "Neutral"},
            {"value": 4, "label": "Bastante unificada"},
            {"value": 5, "label": "Totalmente unificada"}
        ]
    },
    {
        "id": "asrs_4",
        "text": "¿Con qué frecuencia sientes que tu mente se adelanta a tu cuerpo?",
        "type": "likert_5",
        "category": "desincronizacion",
        "options": [
            {"value": 1, "label": "Nunca"},
            {"value": 2, "label": "Raramente"},
            {"value": 3, "label": "A veces"},
            {"value": 4, "label": "Frecuentemente"},
            {"value": 5, "label": "Siempre"}
        ]
    },
    {
        "id": "asrs_5",
        "text": "¿Puedes mantener la atención en una tarea sagrada o significativa sin distraerte?",
        "type": "likert_5",
        "category": "concentracion_espiritual",
        "options": [
            {"value": 1, "label": "Muy difícil"},
            {"value": 2, "label": "Difícil"},
            {"value": 3, "label": "Regular"},
            {"value": 4, "label": "Fácil"},
            {"value": 5, "label": "Muy fácil"}
        ]
    },
    {
        "id": "asrs_6",
        "text": "¿Sientes que tu alma tiene un ritmo propio que a veces no sigue tu voluntad consciente?",
        "type": "likert_5",
        "category": "autonomia_animica",
        "options": [
            {"value": 1, "label": "Nunca"},
            {"value": 2, "label": "Raramente"},
            {"value": 3, "label": "A veces"},
            {"value": 4, "label": "Frecuentemente"},
            {"value": 5, "label": "Siempre"}
        ]
    }
]

AQ_KABBALAH_QUESTIONS = [
    {
        "id": "aq_keter",
        "text": "¿Sientes una conexión clara con un propósito trascendente o espiritual?",
        "type": "likert_10",
        "target_sefira": "keter",
        "options": [{"value": i, "label": str(i)} for i in range(1, 11)]
    },
    {
        "id": "aq_chokhmah",
        "text": "¿Recibes chispazos de intuición o sabiduría que llegan sin esfuerzo consciente?",
        "type": "likert_10",
        "target_sefira": "chokhmah",
        "options": [{"value": i, "label": str(i)} for i in range(1, 11)]
    },
    {
        "id": "aq_binah",
        "text": "¿Tienes facilidad para estructurar tus ideas y darles forma concreta?",
        "type": "likert_10",
        "target_sefira": "binah",
        "options": [{"value": i, "label": str(i)} for i in range(1, 11)]
    },
    {
        "id": "aq_chesed",
        "text": "¿Te permites expandirte y dar sin miedo a perder?",
        "type": "likert_10",
        "target_sefira": "chesed",
        "options": [{"value": i, "label": str(i)} for i in range(1, 11)]
    },
    {
        "id": "aq_gevurah",
        "text": "¿Eres capaz de poner límites claros cuando es necesario?",
        "type": "likert_10",
        "target_sefira": "gevurah",
        "options": [{"value": i, "label": str(i)} for i in range(1, 11)]
    },
    {
        "id": "aq_tiferet",
        "text": "¿Encuentras armonía entre dar y recibir, entre expandir y contener?",
        "type": "likert_10",
        "target_sefira": "tiferet",
        "options": [{"value": i, "label": str(i)} for i in range(1, 11)]
    },
    {
        "id": "aq_netzach",
        "text": "¿Perseveras en tus proyectos hasta verlos manifestados?",
        "type": "likert_10",
        "target_sefira": "netzach",
        "options": [{"value": i, "label": str(i)} for i in range(1, 11)]
    },
    {
        "id": "aq_hod",
        "text": "¿Puedes analizar y comunicar tus experiencias internas con claridad?",
        "type": "likert_10",
        "target_sefira": "hod",
        "options": [{"value": i, "label": str(i)} for i in range(1, 11)]
    },
    {
        "id": "aq_yesod",
        "text": "¿Sientes que tus emociones y pensamientos están conectados y fluyen hacia la acción?",
        "type": "likert_10",
        "target_sefira": "yesod",
        "options": [{"value": i, "label": str(i)} for i in range(1, 11)]
    },
    {
        "id": "aq_malkhut",
        "text": "¿Experimentas tu cuerpo y vida cotidiana como expresión de algo sagrado?",
        "type": "likert_10",
        "target_sefira": "malkhut",
        "options": [{"value": i, "label": str(i)} for i in range(1, 11)]
    }
]

SHA_HARMONY_QUESTIONS = [
    {
        "id": "sha_1",
        "text": "¿Con qué frecuencia sientes que tus emociones están en equilibrio durante el día?",
        "type": "likert_5",
        "category": "equilibrio_emocional",
        "target_sefira": "tiferet",
        "options": [
            {"value": 1, "label": "Nunca"},
            {"value": 2, "label": "Raramente"},
            {"value": 3, "label": "A veces"},
            {"value": 4, "label": "Frecuentemente"},
            {"value": 5, "label": "Siempre"}
        ]
    },
    {
        "id": "sha_2",
        "text": "¿Tiendes a actuar impulsivamente ante estímulos externos (pasiones desbordadas)?",
        "type": "likert_5",
        "category": "control_impulsivo",
        "target_sefira": "gevurah",
        "options": [
            {"value": 5, "label": "Nunca"},
            {"value": 4, "label": "Raramente"},
            {"value": 3, "label": "A veces"},
            {"value": 2, "label": "Frecuentemente"},
            {"value": 1, "label": "Siempre"}
        ]
    },
    {
        "id": "sha_3",
        "text": "¿Puedes contener la gratificación inmediata en pos de un objetivo mayor?",
        "type": "likert_5",
        "category": "contencion",
        "target_sefira": "binah",
        "options": [
            {"value": 1, "label": "Muy difícil"},
            {"value": 2, "label": "Difícil"},
            {"value": 3, "label": "Regular"},
            {"value": 4, "label": "Fácil"},
            {"value": 5, "label": "Muy fácil"}
        ]
    },
    {
        "id": "sha_4",
        "text": "¿Experimentas culpa o vergüenza que te paraliza?",
        "type": "likert_5",
        "category": "sombra_emocional",
        "target_sefira": "hod",
        "options": [
            {"value": 5, "label": "Nunca"},
            {"value": 4, "label": "Raramente"},
            {"value": 3, "label": "A veces"},
            {"value": 2, "label": "Frecuentemente"},
            {"value": 1, "label": "Siempre"}
        ]
    },
    {
        "id": "sha_5",
        "text": "¿Sientes que tu energía vital está disponible cuando la necesitas?",
        "type": "likert_5",
        "category": "vitalidad",
        "target_sefira": "yesod",
        "options": [
            {"value": 1, "label": "Nunca"},
            {"value": 2, "label": "Raramente"},
            {"value": 3, "label": "A veces"},
            {"value": 4, "label": "Frecuentemente"},
            {"value": 5, "label": "Siempre"}
        ]
    },
    {
        "id": "sha_6",
        "text": "¿Tus relaciones interpersonales reflejan reciprocidad y respeto mutuo?",
        "type": "likert_5",
        "category": "relaciones",
        "target_sefira": "netzach",
        "options": [
            {"value": 1, "label": "Nunca"},
            {"value": 2, "label": "Raramente"},
            {"value": 3, "label": "A veces"},
            {"value": 4, "label": "Frecuentemente"},
            {"value": 5, "label": "Siempre"}
        ]
    },
    {
        "id": "sha_7",
        "text": "¿Sientes armonía entre tus deseos personales y las necesidades de los demás?",
        "type": "likert_5",
        "category": "armonia_interpersonal",
        "target_sefira": "chesed",
        "options": [
            {"value": 1, "label": "Nunca"},
            {"value": 2, "label": "Raramente"},
            {"value": 3, "label": "A veces"},
            {"value": 4, "label": "Frecuentemente"},
            {"value": 5, "label": "Siempre"}
        ]
    },
    {
        "id": "sha_8",
        "text": "¿Tu vida emocional se siente conectada a un sentido de propósito mayor?",
        "type": "likert_5",
        "category": "proposito",
        "target_sefira": "keter",
        "options": [
            {"value": 1, "label": "Nunca"},
            {"value": 2, "label": "Raramente"},
            {"value": 3, "label": "A veces"},
            {"value": 4, "label": "Frecuentemente"},
            {"value": 5, "label": "Siempre"}
        ]
    }
]

# Test metadata configurations
GHOST_TEST_CONFIGS = {
    'asrs_essence': {
        'name': 'Archetypal Soul Rhythm Scale (ASRS-Essence)',
        'public_name': 'Escala Arquetipal de Ritmo del Alma (ASRS-Essence)',
        'description': 'Evaluación del ritmo interno del alma para determinar el "Mundo" de inicio (Atzilut/Beria/Yetzirah/Assiah). Mide la coherencia entre intención y acción.',
        'test_type': 'holistic_screening',
        'questions': ASRS_ESSENCE_QUESTIONS,
        'required_access_level': 'personal',
        'icon': '🌊',
        'estimated_duration': 5,
        'order': 100,
    },
    'aq_kabbalah': {
        'name': 'AQ-Kabbalah (Sefirotic Alignment Questionnaire)',
        'public_name': 'Cuestionario de Alineación Sefirótica (AQ-Kabbalah)',
        'description': 'Cuestionario para iluminar las Sefirot en el dashboard de Cábala. Mapea la resonancia personal con cada una de las 10 Sefirot del Árbol de la Vida.',
        'test_type': 'holistic_screening',
        'questions': AQ_KABBALAH_QUESTIONS,
        'required_access_level': 'personal',
        'icon': '🕯️',
        'estimated_duration': 8,
        'order': 101,
    },
    'sha_harmony': {
        'name': 'Sephirotic Harmony Audit (SHA)',
        'public_name': 'Auditoría de Armonía Sefirótica (SHA)',
        'description': (
            'Auditoría de equilibrio de pasiones y armonía energética (lectura simbólica de '
            'Netzach). Screening orientativo, no diagnóstico. Útil para abrir conversación '
            'sobre hábitos, consumo y regulación del deseo; el detalle técnico (puntaje/banda) '
            'es solo para el terapeuta.'
        ),
        'test_type': 'holistic_screening',
        'questions': SHA_HARMONY_QUESTIONS,
        'required_access_level': 'personal',
        'icon': '⚖️',
        'estimated_duration': 6,
        'order': 102,
    }
}


def reactivate_tests():
    """
    Reactivate ghost tests and inject question schemas.
    """
    codes = ['asrs_essence', 'aq_kabbalah', 'sha_harmony']
    
    print("=" * 60)
    print("GHOST TESTS REACTIVATION & SEEDING")
    print("=" * 60)
    
    for code in codes:
        config = GHOST_TEST_CONFIGS.get(code)
        if not config:
            print(f"⚠️  No config for: {code}")
            continue
        
        try:
            tm = TestModule.objects.get(code=code)
            print(f"\n📦 Found existing TestModule: {tm.name}")
            
            # Update fields
            tm.name = config['name']
            tm.public_name = config['public_name']
            tm.description = config['description']
            tm.test_type = config['test_type']
            tm.is_active = True
            tm.is_assignable = True
            tm.domain = 'holistic'
            tm.available_for_therapists = True
            tm.available_for_personal = True
            tm.is_internal = False
            tm.required_access_level = config['required_access_level']
            tm.icon = config['icon']
            tm.estimated_duration = config['estimated_duration']
            tm.order = config['order']
            tm.save()
            
            print(f"   ✅ Reactivated: {tm.public_name}")
            print(f"      - is_active: {tm.is_active}")
            print(f"      - is_assignable: {tm.is_assignable}")
            print(f"      - domain: {tm.domain}")
            print(f"      - questions: {len(config['questions'])} items")
            
        except TestModule.DoesNotExist:
            # Create new TestModule
            print(f"\n🆕 Creating new TestModule: {code}")
            tm = TestModule.objects.create(
                code=code,
                name=config['name'],
                public_name=config['public_name'],
                description=config['description'],
                test_type=config['test_type'],
                is_active=True,
                is_assignable=True,
                domain='holistic',
                available_for_therapists=True,
                available_for_personal=True,
                is_internal=False,
                required_access_level=config['required_access_level'],
                icon=config['icon'],
                estimated_duration=config['estimated_duration'],
                order=config['order'],
            )
            print(f"   ✅ Created: {tm.public_name}")
    
    print("\n" + "=" * 60)
    print("QUESTION SCHEMAS (for reference in Assignment.questions)")
    print("=" * 60)
    
    for code, config in GHOST_TEST_CONFIGS.items():
        print(f"\n📋 {code}: {len(config['questions'])} questions")
        for q in config['questions'][:2]:  # Show first 2 as sample
            print(f"   • {q['id']}: {q['text'][:50]}...")
    
    print("\n" + "=" * 60)
    print("✅ SEEDING COMPLETE")
    print("=" * 60)
    print("\nNote: Questions are stored in GHOST_TEST_CONFIGS dict.")
    print("When creating an Assignment, use get_questions_for_test(code) to retrieve them.")


def get_questions_for_test(code: str) -> list:
    """
    Retrieve question schema for a given test code.
    Use this when creating Assignments.
    
    Returns:
        List of question dicts for the test.
    """
    config = GHOST_TEST_CONFIGS.get(code)
    if not config:
        return []
    return config.get('questions', [])


def verify_tests():
    """
    Verify the status of ghost tests.
    """
    codes = ['asrs_essence', 'aq_kabbalah', 'sha_harmony']
    
    print("\n" + "=" * 60)
    print("VERIFICATION - Ghost Tests Status")
    print("=" * 60)
    
    for code in codes:
        try:
            tm = TestModule.objects.get(code=code)
            status_icon = "✅" if tm.is_active else "❌"
            assignable_icon = "✅" if tm.is_assignable else "❌"
            print(f"\n{code}:")
            print(f"   Name: {tm.public_name or tm.name}")
            print(f"   Active: {status_icon} {tm.is_active}")
            print(f"   Assignable: {assignable_icon} {tm.is_assignable}")
            print(f"   Domain: {tm.domain}")
            print(f"   Type: {tm.test_type}")
        except TestModule.DoesNotExist:
            print(f"\n{code}: ❌ NOT FOUND")


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Seed Ghost Tests Schemas')
    parser.add_argument('--verify', action='store_true', help='Only verify test status')
    parser.add_argument('--questions', type=str, help='Print questions for a specific test code')
    
    args = parser.parse_args()
    
    if args.verify:
        verify_tests()
    elif args.questions:
        questions = get_questions_for_test(args.questions)
        if questions:
            import json
            print(json.dumps(questions, indent=2, ensure_ascii=False))
        else:
            print(f"No questions found for: {args.questions}")
    else:
        reactivate_tests()
        verify_tests()
