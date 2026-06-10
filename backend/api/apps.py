from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):  # pragma: no cover - import side effects only
        # Registrar modelos del dominio bio-emocional sin tocar models.py
        try:
            from . import bioemotional  # noqa: F401
            from .process_memory import signals  # noqa: F401
            # Modo Híbrido (Step 7): registrar modelo de notas de sesión simbólica
            from . import symbolic_session_notes_models  # noqa: F401
        except Exception:
            # En entornos donde el submódulo no exista aún (p.ej. migraciones antiguas),
            # ignoramos el error para no romper el arranque.
            pass
