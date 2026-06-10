"""
Persistencia de notas/resumen de sesión simbólica asistida (Modo Híbrido — Step 7).

El motor simbólico (generación de notas) vive en TypeScript
(packages/symbolic/session/notes-generator.ts). Django solo persiste el
artefacto final — ya revisado/editado por el terapeuta — asociado al consultante
(Patient) y al terapeuta autor. La validación role-aware + el rail anti-fraude se
aplican en el borde (BFF + symbolic_session_safety.py) como defensa en profundidad.

Se registra vía AppConfig.ready() (apps.py) para no tocar models.py.
"""
from django.conf import settings
from django.db import models


class SymbolicSessionNote(models.Model):
    """Nota/resumen de sesión simbólica asistida, asociada a un consultante."""

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

    workspace = models.CharField(
        max_length=32, choices=WORKSPACE_CHOICES, default='generic',
    )
    role = models.CharField(
        max_length=16, choices=ROLE_CHOICES, default='observational',
        help_text='Rol de seguridad resuelto por Django al guardar la nota.',
    )
    summary = models.TextField(blank=True, default='')
    full_text = models.TextField(blank=True, default='')
    sections = models.JSONField(
        blank=True, default=list,
        help_text='Secciones estructuradas (plantilla común + específicas por workspace).',
    )
    safety_warnings = models.JSONField(
        blank=True, default=list,
        help_text='Avisos del filtro de seguridad role-aware en el momento de guardar.',
    )
    clinical_vocabulary = models.BooleanField(
        default=False,
        help_text='True si la nota se guardó bajo rol clínico verificado.',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    patient = models.ForeignKey(
        'api.Patient',
        on_delete=models.CASCADE,
        related_name='symbolic_session_notes',
    )
    therapist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='authored_symbolic_session_notes',
    )

    class Meta:
        app_label = 'api'
        verbose_name = 'Symbolic Session Note'
        verbose_name_plural = 'Symbolic Session Notes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', 'created_at'], name='api_symbses_patient_idx'),
            models.Index(fields=['therapist', 'patient', 'created_at'], name='api_symbses_thera_pat_idx'),
        ]

    def __str__(self):
        return f'SymbolicSessionNote(patient={self.patient_id}, workspace={self.workspace})'
