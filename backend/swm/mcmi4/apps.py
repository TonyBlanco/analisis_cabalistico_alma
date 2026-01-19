from django.apps import AppConfig


class Mcmi4Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'swm.mcmi4'
    label = 'swm_mcmi4'  # Must be unique and without dots
    verbose_name = 'MCMI-4 Místico Workspace'
    
    def ready(self):
        """Import signals if needed."""
        pass
