"""
Active Inquiry Engine - Models

This module implements the data models for the Active Inquiry Engine (AIE),
which allows SWM modules to request context-specific information from patients.
"""

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class InquiryDefinition(models.Model):
    """
    Defines a question that a module can request from a patient.
    
    Each inquiry has a unique code, belongs to a module, and specifies
    the type of response expected (scale, text, choices, etc.).
    """
    
    PRIORITY_CHOICES = [
        ('critical', 'Crítica - Sin esto el módulo no funciona bien'),
        ('important', 'Importante - Mejora significativa'),
        ('optional', 'Opcional - Enriquecimiento'),
    ]
    
    QUESTION_TYPE_CHOICES = [
        ('scale_1_10', 'Escala 1-10'),
        ('yes_no', 'Sí/No'),
        ('text_short', 'Texto corto (max 300 chars)'),
        ('text_long', 'Texto largo (max 2000 chars)'),
        ('choice_single', 'Selección única'),
        ('choice_multi', 'Selección múltiple'),
        ('body_map', 'Mapa corporal interactivo'),
    ]
    
    MODULE_CHOICES = [
        ('astrology', 'Astrología'),
        ('cabala', 'Cábala'),
        ('transgenerational', 'Transgeneracional'),
        ('bioemotional', 'BioEmocional'),
        ('mshe', 'MSHE (Síntesis Holística)'),
    ]
    
    # Core identification
    code = models.CharField(
        max_length=50,
        unique=True,
        help_text="Código único de la inquiry (ej: astro_current_life_events)"
    )
    source_module = models.CharField(
        max_length=50,
        choices=MODULE_CHOICES,
        db_index=True,
        help_text="Módulo que solicita esta información"
    )
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='important',
        db_index=True
    )
    category = models.CharField(
        max_length=50,
        blank=True,
        help_text="Categoría interna (ej: contexto_temporal, sintomas_somaticos)"
    )
    
    # Question content
    question_type = models.CharField(
        max_length=20,
        choices=QUESTION_TYPE_CHOICES
    )
    question_text = models.TextField(
        help_text="Texto completo de la pregunta"
    )
    question_text_short = models.CharField(
        max_length=100,
        blank=True,
        help_text="Versión corta para widgets y listas"
    )
    help_text = models.TextField(
        blank=True,
        help_text="Texto de ayuda para el paciente"
    )
    placeholder = models.CharField(
        max_length=200,
        blank=True,
        help_text="Placeholder para campos de texto"
    )
    
    # For choice-based questions
    choices = models.JSONField(
        null=True,
        blank=True,
        help_text="Lista de opciones para choice_single/choice_multi"
    )
    
    # For scale-based questions
    scale_labels = models.JSONField(
        null=True,
        blank=True,
        help_text="Labels para escalas (ej: {1: 'Muy bajo', 10: 'Muy alto'})"
    )
    
    # Validation rules
    validation = models.JSONField(
        null=True,
        blank=True,
        help_text="Reglas de validación (min_length, max_length, etc.)"
    )
    
    # Trigger conditions
    trigger_condition = models.JSONField(
        null=True,
        blank=True,
        help_text="Condiciones para activar esta inquiry"
    )
    valid_for_days = models.PositiveIntegerField(
        default=90,
        help_text="Días que una respuesta permanece válida"
    )
    
    # Follow-up logic
    follow_up = models.JSONField(
        null=True,
        blank=True,
        help_text="Lógica de preguntas de seguimiento"
    )
    
    # Dynamic inquiries (per-entity)
    dynamic = models.BooleanField(
        default=False,
        help_text="Si es dinámica, se aplica por cada entidad"
    )
    applies_per = models.CharField(
        max_length=50,
        blank=True,
        help_text="Modelo al que se aplica si es dinámica (ej: GenealogyPerson)"
    )
    
    # Sensitive data flag
    sensitive = models.BooleanField(
        default=False,
        help_text="Marca si contiene información sensible"
    )
    opt_out_visible = models.BooleanField(
        default=True,
        help_text="Si el paciente puede ver y usar la opción de omitir"
    )
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Definición de Inquiry'
        verbose_name_plural = 'Definiciones de Inquiries'
        ordering = ['source_module', 'priority', 'code']
        indexes = [
            models.Index(fields=['source_module', 'priority']),
            models.Index(fields=['is_active', 'source_module']),
        ]
    
    def __str__(self):
        return f"[{self.source_module}] {self.code} ({self.priority})"


class PatientInquiryResponse(models.Model):
    """
    Stores a patient's response to an inquiry.
    
    Responses are associated with a patient, an inquiry definition,
    and optionally a therapy session.
    """
    
    COLLECTED_BY_CHOICES = [
        ('patient_self', 'Auto-completado por paciente'),
        ('therapist_session', 'Recolectado en sesión por terapeuta'),
        ('intake_form', 'Formulario de intake'),
        ('questionnaire', 'Cuestionario pre-sesión'),
    ]
    
    # Relationships
    patient = models.ForeignKey(
        'api.Patient',
        on_delete=models.CASCADE,
        related_name='inquiry_responses'
    )
    inquiry = models.ForeignKey(
        InquiryDefinition,
        on_delete=models.CASCADE,
        related_name='responses'
    )
    session = models.ForeignKey(
        'api.Session',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inquiry_responses',
        help_text="Sesión en la que se recolectó (si aplica)"
    )
    
    # For dynamic inquiries (per-entity)
    related_entity_type = models.CharField(
        max_length=50,
        blank=True,
        help_text="Tipo de entidad relacionada (ej: GenealogyPerson)"
    )
    related_entity_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="ID de la entidad relacionada"
    )
    
    # Response data
    response_value = models.JSONField(
        help_text="Valor de la respuesta (estructura depende del question_type)"
    )
    
    # Collection metadata
    collected_by = models.CharField(
        max_length=20,
        choices=COLLECTED_BY_CHOICES,
        default='therapist_session'
    )
    collected_by_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='collected_inquiry_responses',
        help_text="Usuario que registró la respuesta (terapeuta si fue en sesión)"
    )
    
    # Timestamps
    collected_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha de expiración calculada"
    )
    
    # Status
    is_valid = models.BooleanField(
        default=True,
        help_text="Si la respuesta sigue siendo válida"
    )
    superseded_by = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supersedes',
        help_text="Nueva respuesta que reemplaza esta"
    )
    
    class Meta:
        verbose_name = 'Respuesta de Inquiry'
        verbose_name_plural = 'Respuestas de Inquiries'
        ordering = ['-collected_at']
        indexes = [
            models.Index(fields=['patient', 'inquiry', '-collected_at']),
            models.Index(fields=['patient', 'is_valid']),
            models.Index(fields=['inquiry', 'is_valid']),
        ]
        # Unique constraint for non-dynamic inquiries
        constraints = [
            models.UniqueConstraint(
                fields=['patient', 'inquiry'],
                condition=models.Q(is_valid=True, related_entity_id__isnull=True),
                name='unique_valid_response_per_patient_inquiry'
            ),
        ]
    
    def __str__(self):
        return f"{self.patient} → {self.inquiry.code} ({self.collected_at.date()})"
    
    def save(self, *args, **kwargs):
        # Calculate expiration date based on inquiry's valid_for_days
        if not self.expires_at and self.inquiry:
            from datetime import timedelta
            self.expires_at = self.collected_at + timedelta(days=self.inquiry.valid_for_days)
        
        # If creating a new response, invalidate previous ones
        if not self.pk and self.is_valid:
            PatientInquiryResponse.objects.filter(
                patient=self.patient,
                inquiry=self.inquiry,
                is_valid=True,
                related_entity_id=self.related_entity_id
            ).update(is_valid=False, superseded_by=self)
        
        super().save(*args, **kwargs)
