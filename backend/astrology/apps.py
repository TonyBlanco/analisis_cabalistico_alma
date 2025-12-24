# Astrology Django App Configuration

from django.apps import AppConfig


class AstrologyConfig(AppConfig):
    """Django app configuration for astrology module"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'astrology'
    verbose_name = 'Astrology Core'