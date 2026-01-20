from django.apps import AppConfig


class Mcmi4ReflectionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'swm.mcmi4_reflection'
    label = 'swm_mcmi4_reflection'
    verbose_name = 'MCMI-4 Reflection Workspace'
    
    def ready(self):
        """Import signals if needed."""
        pass
