"""
Seed script to create MCMI4_REFLECTION WorkspaceDefinition.
Run once: python manage.py shell < swm/mcmi4_reflection/seed_workspace_definition.py
"""

from swm.mcmi4_reflection.models import WorkspaceDefinition

# Get or create MCMI4_REFLECTION definition
definition, created = WorkspaceDefinition.objects.get_or_create(
    code='MCMI4_REFLECTION',
    defaults={
        'name': 'MCMI-4 Reflection',
        'version': '1.0',
        'description': 'Experiential reflection module for consultants based on mcmi4-signal',
        'config_schema': {
            'questions': [
                {'id': 'q1', 'text': '¿Cómo te sientes al revisar los resultados de tu evaluación?'},
                {'id': 'q2', 'text': '¿Qué aspectos de los resultados resuenan más contigo?'},
                {'id': 'q3', 'text': '¿Hay algún patrón que reconozcas en tu vida diaria?'},
                {'id': 'q4', 'text': '¿Qué te gustaría explorar más profundamente con tu terapeuta?'},
                {'id': 'q5', 'text': '¿Qué recursos o fortalezas internas reconoces en ti?'},
                {'id': 'q6', 'text': '¿Qué cambios o pasos te gustaría considerar?'}
            ]
        },
        'is_active': True
    }
)

if created:
    print(f'✓ Created WorkspaceDefinition: {definition.name} ({definition.code})')
else:
    print(f'✓ WorkspaceDefinition already exists: {definition.name} ({definition.code})')
