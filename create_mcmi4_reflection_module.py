"""
Script para crear TestModule mcmi4-reflection en la DB.
Ejecutar: python backend/create_mcmi4_reflection_module.py
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.test_models import TestModule

QUESTIONS = [
    "¿Qué te motivó a buscar este proceso de autoconocimiento en este momento de tu vida?",
    "¿Cuáles son los patrones que reconoces en tus relaciones personales?",
    "¿Qué aspecto de ti mismo/a te gustaría comprender mejor?",
    "Describe una situación reciente donde sentiste que no actuaste como querías.",
    "¿Qué emociones te resultan más difíciles de reconocer o expresar?",
    "¿Cómo describirías tu relación con el cambio y la incertidumbre?",
    "¿Qué te gustaría que el proceso terapéutico te ayudara a descubrir?",
    "¿Hay algo de tu historia personal que sientas que influye en tu presente?",
]

def create_mcmi4_reflection_module():
    module, created = TestModule.objects.get_or_create(
        code='mcmi4-reflection',
        defaults={
            'name': 'Reflexión MCMI-4 (Pre-Workspace)',
            'public_name': 'Reflexión Personal',
            'description': 'Preguntas reflexivas previas al Workspace MCMI-4 Místico',
            'test_type': 'holistic_screening',
            'domain': 'holistic',
            'required_access_level': 'personal',
            'is_active': True,
            'available_for_therapists': False,
            'available_for_personal': True,
            'is_assignable': False,
            'is_internal': False,
            'estimated_duration': 15,
            'icon': 'message-square',
            'order': 102,
        }
    )
    
    if created:
        print(f"✅ TestModule 'mcmi4-reflection' creado con ID {module.id}")
    else:
        print(f"ℹ️  TestModule 'mcmi4-reflection' ya existía (ID {module.id})")
    
    return module

if __name__ == '__main__':
    module = create_mcmi4_reflection_module()
    print(f"\nMódulo configurado:")
    print(f"  Code: {module.code}")
    print(f"  Name: {module.name}")
    print(f"  Public Name: {module.public_name}")
    print(f"  Test Type: {module.test_type}")
    print(f"  Preguntas fijas: {len(QUESTIONS)} preguntas")
