"""
Transgeneracional Profundo SWM Models.

Models for psychogenealogical exploration workspace.
Supports genograms, family members, patterns, and anniversary syndromes.
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid

User = get_user_model()


# ============================================================================
# CHOICES
# ============================================================================

RELATIONSHIP_CHOICES = [
    # Generación actual
    ('self', 'Consultante'),
    ('spouse', 'Cónyuge/Pareja'),
    ('sibling', 'Hermano/a'),
    ('half_sibling', 'Medio hermano/a'),
    ('twin', 'Gemelo/a'),
    
    # Generación anterior (padres)
    ('father', 'Padre'),
    ('mother', 'Madre'),
    ('stepfather', 'Padrastro'),
    ('stepmother', 'Madrastra'),
    
    # Generación siguiente (hijos)
    ('son', 'Hijo'),
    ('daughter', 'Hija'),
    ('stepson', 'Hijastro'),
    ('stepdaughter', 'Hijastra'),
    
    # Abuelos
    ('grandfather_paternal', 'Abuelo paterno'),
    ('grandmother_paternal', 'Abuela paterna'),
    ('grandfather_maternal', 'Abuelo materno'),
    ('grandmother_maternal', 'Abuela materna'),
    
    # Tíos
    ('uncle_paternal', 'Tío paterno'),
    ('aunt_paternal', 'Tía paterna'),
    ('uncle_maternal', 'Tío materno'),
    ('aunt_maternal', 'Tía materna'),
    
    # Primos
    ('cousin', 'Primo/a'),
    
    # Bisabuelos
    ('great_grandparent', 'Bisabuelo/a'),
    
    # Otros
    ('other', 'Otro familiar'),
]

PATTERN_TYPE_CHOICES = [
    ('loyalty', 'Lealtad invisible'),
    ('secret', 'Secreto familiar'),
    ('trauma', 'Trauma transgeneracional'),
    ('repetition', 'Repetición de patrones'),
    ('parentification', 'Parentificación'),
    ('exclusion', 'Exclusión familiar'),
    ('triangulation', 'Triangulación'),
    ('enmeshment', 'Fusión/Codependencia'),
    ('cutoff', 'Corte emocional'),
    ('projection', 'Proyección transgeneracional'),
    ('anniversary', 'Síndrome del aniversario'),
    ('replacement', 'Hijo de reemplazo'),
    ('ghost', 'Fantasma familiar'),
    ('debt', 'Deuda transgeneracional'),
    ('mission', 'Misión familiar'),
    ('sacrifice', 'Sacrificio sistémico'),
    ('other', 'Otro patrón'),
]

EVENT_TYPE_CHOICES = [
    ('birth', 'Nacimiento'),
    ('death', 'Muerte'),
    ('marriage', 'Matrimonio'),
    ('divorce', 'Divorcio/Separación'),
    ('illness', 'Enfermedad grave'),
    ('accident', 'Accidente'),
    ('migration', 'Migración'),
    ('war', 'Guerra/Conflicto'),
    ('loss', 'Pérdida significativa'),
    ('abuse', 'Abuso/Violencia'),
    ('abandonment', 'Abandono'),
    ('adoption', 'Adopción'),
    ('miscarriage', 'Aborto/Pérdida gestacional'),
    ('suicide', 'Suicidio'),
    ('imprisonment', 'Encarcelamiento'),
    ('bankruptcy', 'Quiebra/Ruina'),
    ('success', 'Éxito significativo'),
    ('inheritance', 'Herencia'),
    ('secret_revealed', 'Revelación de secreto'),
    ('reconciliation', 'Reconciliación'),
    ('other', 'Otro evento'),
]

MEMBER_STATUS_CHOICES = [
    ('alive', 'Vivo/a'),
    ('deceased', 'Fallecido/a'),
    ('unknown', 'Desconocido'),
]

GENDER_CHOICES = [
    ('male', 'Masculino'),
    ('female', 'Femenino'),
    ('other', 'Otro'),
    ('unknown', 'Desconocido'),
]


# ============================================================================
# TRANSGENERATIONAL SESSION MODEL
# ============================================================================

class TransgenerationalSession(models.Model):
    """
    A transgenerational/psychogenealogical workspace session.
    
    Contains the genogram structure and therapeutic observations.
    """
    STATUS_CHOICES = [
        ('created', 'Creada'),
        ('in_progress', 'En Progreso'),
        ('paused', 'Pausada'),
        ('closed', 'Cerrada'),
        ('archived', 'Archivada'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Patient being analyzed
    patient = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='transgenerational_sessions_as_patient',
        help_text='Usuario/paciente siendo explorado'
    )
    
    # Therapist conducting the session
    therapist = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='transgenerational_sessions_as_therapist',
        help_text='Terapeuta que conduce la sesión'
    )
    
    # Session metadata
    title = models.CharField(max_length=200, blank=True, default='')
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='created'
    )
    
    # Genogram visual data (for frontend rendering)
    genogram_data = models.JSONField(
        default=dict,
        blank=True,
        help_text='Estructura visual del genograma (posiciones, conexiones, etc.)'
    )
    
    # Session notes and observations
    session_notes = models.TextField(blank=True, default='')
    
    # Focus areas for this session
    focus_areas = models.JSONField(
        default=list,
        blank=True,
        help_text='Áreas de enfoque: ["lealtades", "secretos", "repeticiones"]'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    started_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'swm_transgenerational_sessions'
        verbose_name = 'Sesión Transgeneracional'
        verbose_name_plural = 'Sesiones Transgeneracionales'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', 'status']),
            models.Index(fields=['therapist', 'status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Transgenerational Session {self.id} - {self.patient.username} ({self.status})"
    
    def start(self):
        """Start the session."""
        if self.status == 'created':
            self.status = 'in_progress'
            self.started_at = timezone.now()
            self.save(update_fields=['status', 'started_at', 'updated_at'])
    
    def close(self):
        """Close the session."""
        if self.status in ('created', 'in_progress', 'paused'):
            self.status = 'closed'
            self.closed_at = timezone.now()
            self.save(update_fields=['status', 'closed_at', 'updated_at'])
    
    @property
    def is_closed(self):
        return self.status == 'closed'
    
    @property
    def member_count(self):
        return self.family_members.count()
    
    @property
    def pattern_count(self):
        return self.patterns.count()


# ============================================================================
# FAMILY MEMBER MODEL
# ============================================================================

class FamilyMember(models.Model):
    """
    A family member in the genogram.
    
    Uses aliases instead of real names for privacy.
    Tracks relationship to consultante, generation, and significant events.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    session = models.ForeignKey(
        TransgenerationalSession,
        on_delete=models.CASCADE,
        related_name='family_members'
    )
    
    # Identity (anonymized)
    alias = models.CharField(
        max_length=100,
        help_text='Alias o identificador (sin datos reales): "Abuelo P", "Tía M1"'
    )
    
    gender = models.CharField(
        max_length=20,
        choices=GENDER_CHOICES,
        default='unknown'
    )
    
    # Relationship to consultante
    relationship = models.CharField(
        max_length=50,
        choices=RELATIONSHIP_CHOICES,
        help_text='Relación con el consultante'
    )
    
    # Generational position
    generation = models.IntegerField(
        default=0,
        help_text='Generación relativa al consultante: 0=misma, -1=padres, -2=abuelos, +1=hijos'
    )
    
    birth_order = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text='Orden de nacimiento entre hermanos'
    )
    
    # Life status
    status = models.CharField(
        max_length=20,
        choices=MEMBER_STATUS_CHOICES,
        default='unknown'
    )
    
    # Approximate dates (year only for privacy)
    birth_year = models.IntegerField(null=True, blank=True)
    death_year = models.IntegerField(null=True, blank=True)
    
    # Significant events (stored as JSON)
    significant_events = models.JSONField(
        default=list,
        blank=True,
        help_text='Lista de eventos significativos [{type, year, description}]'
    )
    
    # Characteristics observed
    characteristics = models.JSONField(
        default=list,
        blank=True,
        help_text='Características observadas: ["trabajador", "conflictivo", etc.]'
    )
    
    # Therapist notes
    notes = models.TextField(blank=True, default='')
    
    # Visual position in genogram
    position_x = models.FloatField(default=0.0)
    position_y = models.FloatField(default=0.0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'swm_transgenerational_family_members'
        verbose_name = 'Miembro Familiar'
        verbose_name_plural = 'Miembros Familiares'
        ordering = ['generation', 'birth_order']
    
    def __str__(self):
        return f"{self.alias} ({self.get_relationship_display()}) - Session {self.session_id}"


# ============================================================================
# FAMILY RELATIONSHIP MODEL (Connections between members)
# ============================================================================

class FamilyRelationship(models.Model):
    """
    Relationship/connection between two family members.
    
    Represents marriages, parent-child, sibling bonds, etc.
    """
    RELATIONSHIP_TYPE_CHOICES = [
        ('marriage', 'Matrimonio'),
        ('partnership', 'Unión/Pareja'),
        ('divorce', 'Divorcio'),
        ('parent_child', 'Padre/Madre-Hijo'),
        ('sibling', 'Hermanos'),
        ('conflict', 'Conflicto'),
        ('cutoff', 'Corte relacional'),
        ('enmeshment', 'Fusión'),
        ('distant', 'Distancia emocional'),
        ('close', 'Cercanía'),
        ('abuse', 'Abuso'),
        ('caretaking', 'Cuidador'),
    ]
    
    QUALITY_CHOICES = [
        ('positive', 'Positiva'),
        ('negative', 'Negativa'),
        ('ambivalent', 'Ambivalente'),
        ('neutral', 'Neutral'),
        ('unknown', 'Desconocida'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    session = models.ForeignKey(
        TransgenerationalSession,
        on_delete=models.CASCADE,
        related_name='family_relationships'
    )
    
    member_from = models.ForeignKey(
        FamilyMember,
        on_delete=models.CASCADE,
        related_name='relationships_from'
    )
    
    member_to = models.ForeignKey(
        FamilyMember,
        on_delete=models.CASCADE,
        related_name='relationships_to'
    )
    
    relationship_type = models.CharField(
        max_length=30,
        choices=RELATIONSHIP_TYPE_CHOICES
    )
    
    quality = models.CharField(
        max_length=20,
        choices=QUALITY_CHOICES,
        default='neutral'
    )
    
    notes = models.TextField(blank=True, default='')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'swm_transgenerational_family_relationships'
        verbose_name = 'Relación Familiar'
        verbose_name_plural = 'Relaciones Familiares'
    
    def __str__(self):
        return f"{self.member_from.alias} → {self.member_to.alias} ({self.relationship_type})"


# ============================================================================
# TRANSGENERATIONAL PATTERN MODEL
# ============================================================================

class TransgenerationalPattern(models.Model):
    """
    An identified transgenerational pattern.
    
    Patterns can involve multiple family members across generations.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    session = models.ForeignKey(
        TransgenerationalSession,
        on_delete=models.CASCADE,
        related_name='patterns'
    )
    
    pattern_name = models.CharField(
        max_length=200,
        help_text='Nombre descriptivo del patrón'
    )
    
    pattern_type = models.CharField(
        max_length=30,
        choices=PATTERN_TYPE_CHOICES
    )
    
    # Members involved in this pattern
    members_involved = models.ManyToManyField(
        FamilyMember,
        related_name='patterns_involved',
        blank=True
    )
    
    # Generations affected
    generations_affected = models.JSONField(
        default=list,
        blank=True,
        help_text='Lista de generaciones afectadas: [-2, -1, 0]'
    )
    
    description = models.TextField(
        blank=True,
        default='',
        help_text='Descripción del patrón observado'
    )
    
    therapist_notes = models.TextField(
        blank=True,
        default='',
        help_text='Notas terapéuticas sobre el patrón'
    )
    
    # Therapeutic work
    is_acknowledged = models.BooleanField(
        default=False,
        help_text='El patrón ha sido reconocido por el consultante'
    )
    
    is_worked = models.BooleanField(
        default=False,
        help_text='Se ha trabajado terapéuticamente este patrón'
    )
    
    # Intensity/significance
    intensity = models.IntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text='Intensidad del patrón (1-10)'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'swm_transgenerational_patterns'
        verbose_name = 'Patrón Transgeneracional'
        verbose_name_plural = 'Patrones Transgeneracionales'
        ordering = ['-intensity', 'created_at']
    
    def __str__(self):
        return f"{self.pattern_name} ({self.get_pattern_type_display()}) - Session {self.session_id}"


# ============================================================================
# SYNDROME MARK MODEL (Anniversary Syndrome)
# ============================================================================

class SyndromeMark(models.Model):
    """
    Anniversary syndrome and temporal marks.
    
    Tracks dates that recur across generations (deaths, births, traumas).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    session = models.ForeignKey(
        TransgenerationalSession,
        on_delete=models.CASCADE,
        related_name='syndrome_marks'
    )
    
    event_type = models.CharField(
        max_length=30,
        choices=EVENT_TYPE_CHOICES
    )
    
    # Original event
    original_member = models.ForeignKey(
        FamilyMember,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='original_syndrome_marks',
        help_text='Miembro original donde ocurrió el evento'
    )
    
    original_date = models.DateField(
        null=True,
        blank=True,
        help_text='Fecha original del evento (puede ser aproximada)'
    )
    
    original_year = models.IntegerField(
        null=True,
        blank=True,
        help_text='Año del evento original (si no se conoce fecha exacta)'
    )
    
    # Recurring instances
    recurring_pattern = models.TextField(
        blank=True,
        default='',
        help_text='Descripción del patrón de recurrencia'
    )
    
    recurring_dates = models.JSONField(
        default=list,
        blank=True,
        help_text='Lista de fechas/años donde se repite: [{year, member_alias, event}]'
    )
    
    # Analysis
    significance = models.TextField(
        blank=True,
        default='',
        help_text='Significado terapéutico de esta marca temporal'
    )
    
    therapist_notes = models.TextField(blank=True, default='')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'swm_transgenerational_syndrome_marks'
        verbose_name = 'Marca de Síndrome'
        verbose_name_plural = 'Marcas de Síndrome'
        ordering = ['original_date', 'original_year']
    
    def __str__(self):
        date_str = str(self.original_date) if self.original_date else str(self.original_year or '?')
        return f"{self.get_event_type_display()} ({date_str}) - Session {self.session_id}"


# ============================================================================
# SESSION SNAPSHOT MODEL
# ============================================================================

class TransgenerationalSnapshot(models.Model):
    """
    Point-in-time snapshot of a transgenerational session.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    session = models.ForeignKey(
        TransgenerationalSession,
        on_delete=models.CASCADE,
        related_name='snapshots'
    )
    
    genogram_data = models.JSONField(
        default=dict,
        help_text='Estado del genograma en este momento'
    )
    
    notes = models.TextField(blank=True, default='')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'swm_transgenerational_snapshots'
        verbose_name = 'Snapshot Transgeneracional'
        verbose_name_plural = 'Snapshots Transgeneracionales'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Snapshot {self.created_at} - Session {self.session_id}"
