"""
Seed WorkspaceDefinition with MCMI4_MYSTIC entry.
Run this once after migrating.
"""

import django
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from swm.mcmi4.models import WorkspaceDefinition


def seed_workspace_definition():
    """Create or update MCMI4_MYSTIC workspace definition."""
    definition, created = WorkspaceDefinition.objects.get_or_create(
        code='MCMI4_MYSTIC',
        defaults={
            'name': 'MCMI-4 Místico',
            'version': '1.0',
            'description': 'Specialized workspace for symbolic/hermeneutic interpretation of MCMI-4 clinical data.',
            'config_schema': {
                'include_symbolic_layers': {
                    'type': 'array',
                    'items': {'type': 'string'},
                    'default': ['archetypal', 'relational', 'transgenerational']
                },
                'focus_areas': {
                    'type': 'array',
                    'items': {'type': 'string'},
                    'default': []
                }
            },
            'is_active': True
        }
    )
    
    if created:
        print(f"✅ Created WorkspaceDefinition: {definition}")
    else:
        print(f"ℹ️  WorkspaceDefinition already exists: {definition}")
    
    return definition


if __name__ == '__main__':
    seed_workspace_definition()
