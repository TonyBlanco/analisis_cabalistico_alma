"""
Management command to seed the Tarot Evolutivo workspace definition.

Usage:
    python manage.py seed_tarot_workspace_definition
"""

from django.core.management.base import BaseCommand, CommandError
from swm.tarot.models import WorkspaceDefinition


class Command(BaseCommand):
    """Creates the TAROT_EVOLUTIVO workspace definition."""
    
    help = 'Seed the Tarot Evolutivo workspace definition'
    
    def handle(self, *args, **options):
        """Execute the command."""
        code = 'TAROT_EVOLUTIVO'
        
        # Check if already exists
        existing = WorkspaceDefinition.objects.filter(code=code).first()
        
        if existing:
            self.stdout.write(
                self.style.WARNING(
                    f'Definition "{code}" already exists (id: {existing.id})'
                )
            )
            return
        
        # Create definition
        config_schema = {
            "type": "object",
            "properties": {
                "spread_types": {
                    "type": "array",
                    "items": {"type": "string"},
                    "default": ["free", "tree_of_life", "cross", "three_cards", "horseshoe"]
                },
                "tarot_systems": {
                    "type": "array",
                    "items": {"type": "string"},
                    "default": ["rider-waite", "thoth", "marseille", "golden-dawn", "bota"]
                },
                "allow_reversed": {
                    "type": "boolean",
                    "default": True
                },
                "max_cards_per_spread": {
                    "type": "integer",
                    "default": 78
                },
                "phases": {
                    "type": "array",
                    "items": {"type": "string"},
                    "default": ["setup", "selection", "exploration", "synthesis", "closing"]
                }
            }
        }
        
        definition = WorkspaceDefinition.objects.create(
            code=code,
            name='Tarot Evolutivo',
            description=(
                'Workspace for Tarot-based symbolic exploration in therapeutic contexts. '
                'Provides structured spreads, Tree of Life correspondences, and session tracking '
                'for professional therapeutic use. Does NOT provide predictions or automatic interpretations.'
            ),
            version='1.0.0',
            config_schema=config_schema,
            is_active=True
        )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created workspace definition: {code} (id: {definition.id})'
            )
        )
