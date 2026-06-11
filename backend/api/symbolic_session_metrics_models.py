"""
Eventos de observabilidad del Modo Interactivo Asistido (Híbrido) — Step 9 / D6.

Registra SOLO eventos agregables, sin PII ni contenido textual: tipo de evento,
workspace, rol de seguridad y referencias por id (terapeuta y, opcionalmente,
consultante). Alimenta /api/therapist/hybrid-metrics/ para cerrar la
observabilidad D6 (sesiones iniciadas, interpretaciones generadas/aceptadas,
ejercicios completados y bloqueos del rail anti-fraude). Las notas creadas se
derivan de SymbolicSessionNote (no se duplican aquí).

Se registra vía AppConfig.ready() (apps.py) para no tocar models.py.
"""
from django.conf import settings
from django.db import models


class SymbolicSessionEvent(models.Model):
    """Evento agregable de una sesión simbólica asistida (sin PII)."""

    EVENT_SESSION_STARTED = 'session_started'
    EVENT_INTERPRETATION_GENERATED = 'interpretation_generated'
    EVENT_INTERPRETATION_ACCEPTED = 'interpretation_accepted'
    EVENT_EXERCISE_COMPLETED = 'exercise_completed'
    EVENT_ANTI_FRAUD_BLOCK = 'anti_fraud_block'

    EVENT_TYPE_CHOICES = [
        (EVENT_SESSION_STARTED, 'Sesión iniciada'),
        (EVENT_INTERPRETATION_GENERATED, 'Interpretación generada'),
        (EVENT_INTERPRETATION_ACCEPTED, 'Interpretación aceptada'),
        (EVENT_EXERCISE_COMPLETED, 'Ejercicio completado'),
        (EVENT_ANTI_FRAUD_BLOCK, 'Bloqueo del rail anti-fraude'),
    ]

    WORKSPACE_CHOICES = [
        ('astrology-tarot', 'Astrología · Tarot'),
        ('cabala-applied', 'Cábala Aplicada'),
        ('transgenerational', 'Transgeneracional'),
        ('generic', 'Sesión simbólica'),
    ]

    ROLE_CHOICES = [
        ('observational', 'Observacional'),
        ('clinical', 'Clínico verificado'),
    ]

    event_type = models.CharField(max_length=32, choices=EVENT_TYPE_CHOICES)
    workspace = models.CharField(
        max_length=32, choices=WORKSPACE_CHOICES, default='generic',
    )
    role = models.CharField(
        max_length=16, choices=ROLE_CHOICES, default='observational',
        help_text='Rol de seguridad resuelto por Django al registrar el evento.',
    )
    metadata = models.JSONField(
        blank=True, default=dict,
        help_text='Metadatos agregables y NO PII (p.ej. categoría de término bloqueado).',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    therapist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='symbolic_session_events',
    )
    patient = models.ForeignKey(
        'api.Patient',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='symbolic_session_events',
    )

    class Meta:
        app_label = 'api'
        verbose_name = 'Symbolic Session Event'
        verbose_name_plural = 'Symbolic Session Events'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['therapist', 'created_at'], name='api_symbevt_thera_idx'),
            models.Index(fields=['therapist', 'event_type', 'created_at'], name='api_symbevt_thera_type_idx'),
        ]

    def __str__(self):
        return f'SymbolicSessionEvent(therapist={self.therapist_id}, type={self.event_type})'
