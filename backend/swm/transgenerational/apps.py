from django.apps import AppConfig


class TransgenerationalConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'swm.transgenerational'
    label = 'swm_transgenerational'  # Must be unique and without dots
    verbose_name = 'Transgeneracional Profundo Workspace'
    
    def ready(self):
        """Import signals if needed."""
        pass
