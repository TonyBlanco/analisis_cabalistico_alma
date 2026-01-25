# -*- coding: utf-8 -*-
"""
Persistence Model for AI Interpretations
Stores AI-generated astrological interpretations to avoid recalculation
"""
from django.db import models
from django.contrib.auth.models import User
from django.core.serializers.json import DjangoJSONEncoder
from .models import Patient


class AstrologyAIInterpretation(models.Model):
    """
    Store AI-generated astrological interpretations
    
    Allows saving, retrieving, and sharing interpretations
    without needing to recalculate them every time.
    """
    
    INTERPRETATION_TYPES = [
        ('natal', 'Carta Natal'),
        ('transits', 'Tránsitos'),
        ('progressions', 'Progresiones'),
        ('solar_return', 'Retorno Solar'),
        ('situation', 'Situación Actual'),
        ('psychological_archetypes', 'Psico: Arquetipos'),
        ('psychological_shadow', 'Psico: Sombra'),
        ('psychological_individuation', 'Psico: Individuación'),
        ('psychological_sins', 'Psico: Arquetipos Pecados'),
    ]
    
    # Relations
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='ai_interpretations',
        help_text='Patient for whom this interpretation was generated'
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='ai_interpretations_created',
        help_text='Therapist who generated this interpretation'
    )
    
    # Interpretation metadata
    interpretation_type = models.CharField(
        max_length=30,  # Increased for psychological types
        choices=INTERPRETATION_TYPES,
        help_text='Type of astrological interpretation'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text='When this interpretation was generated',
        db_index=True
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text='Last time this interpretation was updated'
    )
    
    # Content
    interpretation_text = models.TextField(
        help_text='AI-generated interpretation content'
    )
    
    # Input context (for regeneration/audit)
    input_context = models.JSONField(
        encoder=DjangoJSONEncoder,
        null=True,
        blank=True,
        help_text='Input data used to generate interpretation (chart data, dates, etc.)'
    )
    
    # AI metadata
    model_version = models.CharField(
        max_length=50,
        default='gemini-2.5-flash',
        help_text='AI model version used'
    )
    token_count = models.IntegerField(
        null=True,
        blank=True,
        help_text='Approximate token count of interpretation'
    )
    
    # Sharing and visibility
    is_shared_with_patient = models.BooleanField(
        default=False,
        help_text='Whether this interpretation is shared with the patient'
    )
    shared_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When this interpretation was shared with patient'
    )
    
    # Notes from therapist
    therapist_notes = models.TextField(
        blank=True,
        default='',
        help_text='Private notes from therapist about this interpretation'
    )
    
    # Status
    is_archived = models.BooleanField(
        default=False,
        help_text='Whether this interpretation is archived'
    )
    
    class Meta:
        db_table = 'astrology_ai_interpretation'
        verbose_name = 'AI Interpretation'
        verbose_name_plural = 'AI Interpretations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', 'interpretation_type', '-created_at']),
            models.Index(fields=['created_by', '-created_at']),
            models.Index(fields=['is_shared_with_patient']),
        ]
    
    def __str__(self):
        return f"{self.get_interpretation_type_display()} - {self.patient} ({self.created_at.strftime('%Y-%m-%d')})"
    
    @property
    def word_count(self):
        """Approximate word count of interpretation"""
        return len(self.interpretation_text.split())
    
    def share_with_patient(self):
        """Mark interpretation as shared with patient"""
        from django.utils import timezone
        self.is_shared_with_patient = True
        self.shared_at = timezone.now()
        self.save(update_fields=['is_shared_with_patient', 'shared_at'])
    
    def archive(self):
        """Archive this interpretation"""
        self.is_archived = True
        self.save(update_fields=['is_archived'])


class AstrologyAIInterpretationVersion(models.Model):
    """
    Version history for interpretations
    
    Tracks when interpretations are regenerated to maintain history
    """
    interpretation = models.ForeignKey(
        AstrologyAIInterpretation,
        on_delete=models.CASCADE,
        related_name='versions',
        help_text='Parent interpretation'
    )
    version_number = models.IntegerField(
        help_text='Version number (1, 2, 3...)'
    )
    interpretation_text = models.TextField(
        help_text='Interpretation content for this version'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text='When this version was created'
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='interpretation_versions_created',
        help_text='Who created this version'
    )
    
    class Meta:
        db_table = 'astrology_ai_interpretation_version'
        verbose_name = 'AI Interpretation Version'
        verbose_name_plural = 'AI Interpretation Versions'
        ordering = ['-version_number']
        unique_together = [['interpretation', 'version_number']]
    
    def __str__(self):
        return f"{self.interpretation} - v{self.version_number}"
