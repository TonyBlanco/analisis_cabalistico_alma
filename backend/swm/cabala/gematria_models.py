"""
Gematria Reading Models for Cábala Aplicada SWM.

Stores individual method readings for later synthesis and cross-SWM analysis.
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class GematriaReading(models.Model):
    """
    Individual Gematria reading/calculation for later synthesis.
    
    Each reading captures a single method calculation (Pitagoras, Gematria Katan, 
    Atbash, etc.) with all its results, interpretations, and therapist notes.
    """
    
    METHOD_CHOICES = [
        ('pitagoras', 'Pitágoras'),
        ('gematria-standard', 'Gematría Estándar'),
        ('gematria-katan', 'Gematría Katan'),
        ('mispar-gadol', 'Mispar Gadol'),
        ('mispar-siduri', 'Mispar Siduri'),
        ('milui', 'Milui'),
        ('atbash', 'Atbash'),
        ('albam', 'Albam'),
        ('avgad', 'Avgad'),
        ('temurah', 'Temurah'),
        ('notarikon', 'Notarikón'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('saved', 'Guardado'),
        ('reviewed', 'Revisado'),
        ('synthesized', 'Sintetizado'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    patient = models.ForeignKey(
        'api.Patient',
        on_delete=models.CASCADE,
        related_name='gematria_readings',
        help_text='Paciente/consultante analizado',
    )
    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_gematria_readings',
        help_text='Terapeuta que ejecutó la lectura',
    )
    
    # Reading metadata
    method = models.CharField(
        max_length=30,
        choices=METHOD_CHOICES,
        help_text='Método gematrico utilizado',
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='saved',
        help_text='Estado de la lectura',
    )
    
    # Input data (what was analyzed)
    input_name = models.CharField(
        max_length=200,
        help_text='Nombre completo analizado',
    )
    input_birth_date = models.DateField(
        null=True,
        blank=True,
        help_text='Fecha de nacimiento utilizada',
    )
    hebrew_transliteration = models.CharField(
        max_length=200,
        blank=True,
        help_text='Transliteración hebrea del nombre',
    )
    
    # Calculated results (JSONField for flexibility)
    calculated_numbers = models.JSONField(
        default=dict,
        help_text='Números calculados: esencia, expresion, herencia, caminoVida, etc.',
    )
    calculation_details = models.JSONField(
        default=dict,
        help_text='Detalles del cálculo: palabras, valores, transformaciones',
    )
    sefirotic_correspondence = models.JSONField(
        default=dict,
        help_text='Correspondencia sefirótica derivada',
    )
    
    # Interpretations
    number_interpretations = models.JSONField(
        default=dict,
        help_text='Interpretaciones por número: arquetipo, luz, sombra, etc.',
    )
    method_interpretation = models.TextField(
        blank=True,
        help_text='Interpretación general del método para esta lectura',
    )
    
    # Therapist input
    therapist_notes = models.TextField(
        blank=True,
        help_text='Notas del terapeuta sobre esta lectura',
    )
    therapist_interpretation = models.TextField(
        blank=True,
        help_text='Interpretación personalizada del terapeuta',
    )
    highlights = models.JSONField(
        default=list,
        help_text='Puntos destacados marcados por el terapeuta',
    )
    
    # AI-generated content (optional)
    ai_interpretation = models.TextField(
        blank=True,
        help_text='Interpretación generada por IA (si disponible)',
    )
    ai_generated_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Cuándo se generó la interpretación IA',
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Lectura Gematrica'
        verbose_name_plural = 'Lecturas Gematricas'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', 'method', '-created_at']),
            models.Index(fields=['therapist', '-created_at']),
            models.Index(fields=['status', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_method_display()} - {self.input_name} ({self.created_at.strftime('%Y-%m-%d')})"


class GematriaSynthesis(models.Model):
    """
    AI-generated synthesis combining multiple GematriaReadings.
    
    Integrates all readings for a patient into a comprehensive symbolic analysis.
    Can also incorporate cross-SWM data (MCMI4, Tarot, SHA, etc.)
    """
    
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('generated', 'Generado'),
        ('reviewed', 'Revisado por Terapeuta'),
        ('validated', 'Validado'),
        ('exported', 'Exportado a Síntesis'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    patient = models.ForeignKey(
        'api.Patient',
        on_delete=models.CASCADE,
        related_name='gematria_syntheses',
        help_text='Paciente/consultante',
    )
    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_gematria_syntheses',
        help_text='Terapeuta que solicitó la síntesis',
    )
    readings = models.ManyToManyField(
        GematriaReading,
        related_name='syntheses',
        help_text='Lecturas incluidas en esta síntesis',
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
    )
    
    # Synthesis content
    title = models.CharField(
        max_length=200,
        default='Síntesis Gematrica',
        help_text='Título descriptivo de la síntesis',
    )
    
    # AI-generated analysis
    ai_synthesis = models.JSONField(
        default=dict,
        help_text='Síntesis estructurada generada por IA',
    )
    ai_narrative = models.TextField(
        blank=True,
        help_text='Narrativa humanizada de la síntesis',
    )
    
    # Cross-SWM integration
    cross_swm_sources = models.JSONField(
        default=list,
        help_text='Lista de fuentes SWM consultadas: [{swm: "mcmi4", workspace_id: "...", key_findings: [...]}]',
    )
    cross_swm_synthesis = models.JSONField(
        default=dict,
        help_text='Síntesis cruzada con otros SWM',
    )
    
    # Key insights extracted
    dominant_numbers = models.JSONField(
        default=list,
        help_text='Números dominantes a través de todos los métodos',
    )
    recurring_sefirot = models.JSONField(
        default=list,
        help_text='Sefirot recurrentes en los análisis',
    )
    archetypal_patterns = models.JSONField(
        default=list,
        help_text='Patrones arquetípicos identificados',
    )
    shadow_themes = models.JSONField(
        default=list,
        help_text='Temas de sombra recurrentes',
    )
    light_themes = models.JSONField(
        default=list,
        help_text='Fortalezas y luces identificadas',
    )
    tikun_suggestions = models.JSONField(
        default=list,
        help_text='Sugerencias de Tikún (rectificación)',
    )
    
    # Therapist validation
    therapist_validation = models.BooleanField(
        default=False,
        help_text='Si el terapeuta ha validado esta síntesis',
    )
    therapist_notes = models.TextField(
        blank=True,
        help_text='Notas del terapeuta sobre la síntesis',
    )
    therapist_edits = models.JSONField(
        default=dict,
        help_text='Ediciones/correcciones del terapeuta a la síntesis IA',
    )
    
    # Export tracking
    exported_to_holistic = models.BooleanField(
        default=False,
        help_text='Si se exportó a síntesis holística global',
    )
    exported_at = models.DateTimeField(
        null=True,
        blank=True,
    )
    holistic_record_id = models.CharField(
        max_length=100,
        blank=True,
        help_text='ID del AnalysisRecord si se exportó',
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Síntesis Gematrica'
        verbose_name_plural = 'Síntesis Gematricas'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', '-created_at']),
            models.Index(fields=['status', '-created_at']),
        ]
    
    def __str__(self):
        return f"Síntesis: {self.patient.full_name} ({self.created_at.strftime('%Y-%m-%d')})"
    
    @property
    def readings_count(self):
        return self.readings.count()
    
    @property
    def methods_covered(self):
        return list(self.readings.values_list('method', flat=True).distinct())
