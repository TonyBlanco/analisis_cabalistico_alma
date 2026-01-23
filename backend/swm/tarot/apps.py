"""
Django App Configuration for SWM Tarot Evolutivo.

This module provides the specialized workspace for Tarot-based
symbolic exploration in therapeutic contexts.
"""

from django.apps import AppConfig


class TarotConfig(AppConfig):
    """Configuration for the Tarot Evolutivo SWM app."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'swm.tarot'
    label = 'swm_tarot'  # Avoid dots in app label
    verbose_name = 'SWM Tarot Evolutivo'
    
    def ready(self):
        """Called when Django starts."""
        pass  # Signal handlers would go here if needed
