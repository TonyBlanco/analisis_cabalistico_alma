from django.apps import AppConfig


class CabalaConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'swm.cabala'
    label = 'swm_cabala'  # Must be unique and without dots
    verbose_name = 'Cábala Aplicada Workspace'
    
    def ready(self):
        """Import signals if needed."""
        pass
