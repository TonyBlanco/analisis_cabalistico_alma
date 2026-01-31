#!/usr/bin/env python
"""
Seed script for BioEmotional Intake TestModule.

Creates or updates the bioemotional_intake test module for patient assignment.
Run with: python manage.py shell < scripts/seed_bioemotional_intake.py
Or: cd backend && python -c "exec(open('scripts/seed_bioemotional_intake.py').read())"
"""
import os
import sys
import json
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.test_models import TestModule

SCHEMA_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'resources',
    'bioemotional_intake_schema.json'
)

def seed_bioemotional_intake():
    """Create or update the bioemotional_intake TestModule."""
    
    # Load schema
    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        schema = json.load(f)
    
    # Extract questions for storage
    questions = schema.get('questions', [])
    
    module_data = {
        'name': 'Cuestionario Bio-Emocional Inicial',
        'public_name': 'Exploración Bio-Emocional',
        'description': schema.get('description', 'Evaluación holística del estado físico-emocional'),
        'test_type': 'holistic_screening',
        'domain': 'holistic',
        'required_access_level': 'personal',
        'is_active': True,
        'available_for_personal': True,
        'available_for_therapists': True,
        'is_assignable': True,
        'is_internal': False,
        'canonical_family': 'bioemotional',
        'schema': schema,
        'questions': questions,
    }
    
    module, created = TestModule.objects.update_or_create(
        code='bioemotional_intake',
        defaults=module_data
    )
    
    action = 'Created' if created else 'Updated'
    print(f"✅ {action} TestModule: {module.code}")
    print(f"   - Name: {module.name}")
    print(f"   - Public Name: {module.public_name}")
    print(f"   - Questions: {len(questions)}")
    print(f"   - is_assignable: {module.is_assignable}")
    print(f"   - domain: {module.domain}")
    
    return module

if __name__ == '__main__':
    seed_bioemotional_intake()
