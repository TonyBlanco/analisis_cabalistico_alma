"""
Onboarding de beta tester médica (Modo Híbrido — Step 9).

Dos modelos aislados (registrados vía apps.py, sin tocar models.py):

- ClinicalModeRequest: solicitud de un terapeuta para activar el vocabulario
  clínico. La verificación/activación real la realiza un administrador
  (ClinicalCredentialVerificationView -> UserProfile.clinical_mode_enabled).
  Aquí solo se registra la solicitud y se marca clinical_mode_requested=True.
- BetaFeedback: feedback estructurado de beta testers, sin PII obligatoria.
"""
from django.conf import settings
from django.db import models


class ClinicalModeRequest(models.Model):
    """Solicitud de activación del vocabulario clínico por un terapeuta."""

    STATUS_PENDING = 'pending'
    STATUS_APPROVED = 'approved'
    STATUS_REJECTED = 'rejected'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pendiente'),
        (STATUS_APPROVED, 'Aprobada'),
        (STATUS_REJECTED, 'Rechazada'),
    ]

    therapist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='clinical_mode_requests',
    )
    license_number = models.CharField(max_length=120)
    specialty = models.CharField(max_length=160)
    professional_body = models.CharField(max_length=160, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    responsible_use_accepted = models.BooleanField(default=False)
    anti_fraud_rail_accepted = models.BooleanField(default=False)
    status = models.CharField(
        max_length=16, choices=STATUS_CHOICES, default=STATUS_PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='clinical_mode_requests_reviewed',
    )

    class Meta:
        app_label = 'api'
        verbose_name = 'Clinical Mode Request'
        verbose_name_plural = 'Clinical Mode Requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['therapist', 'created_at'], name='api_clinreq_thera_idx'),
            models.Index(fields=['status', 'created_at'], name='api_clinreq_status_idx'),
        ]

    def __str__(self):
        return f'ClinicalModeRequest(therapist={self.therapist_id}, status={self.status})'


class BetaFeedback(models.Model):
    """Feedback estructurado de beta testers (sin PII obligatoria)."""

    CATEGORY_CHOICES = [
        ('ux', 'UX'),
        ('bug', 'Bug'),
        ('clinical-copy', 'Copy clínico'),
        ('false-positive', 'Falso positivo'),
        ('missing-feature', 'Funcionalidad faltante'),
        ('other', 'Otro'),
    ]
    SEVERITY_CHOICES = [
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
        ('critical', 'Crítica'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='beta_feedback',
    )
    category = models.CharField(max_length=24, choices=CATEGORY_CHOICES, default='other')
    severity = models.CharField(max_length=12, choices=SEVERITY_CHOICES, default='low')
    message = models.TextField()
    page_context = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'api'
        verbose_name = 'Beta Feedback'
        verbose_name_plural = 'Beta Feedback'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'created_at'], name='api_betafb_cat_idx'),
            models.Index(fields=['severity', 'created_at'], name='api_betafb_sev_idx'),
        ]

    def __str__(self):
        return f'BetaFeedback(user={self.user_id}, category={self.category})'
