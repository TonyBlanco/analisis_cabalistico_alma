"""
Configuración de la aplicación SWM_72_ANGELS_ENGINE
"""

from django.apps import AppConfig


class AngelsEngineConfig(AppConfig):
    """
    Configuración de la aplicación Ángeles Engine
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'symbolic.72_angels'
    label = 'angels_engine'
    verbose_name = 'SWM 72 Ángeles Engine'