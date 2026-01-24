"""
Cábala Aplicada SWM Models.

Models for Tree of Life (Etz Chaim) symbolic workspace.
Supports sefirah observations, path mappings, and therapeutic sessions.
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid

User = get_user_model()


# ============================================================================
# SEFIROT CHOICES
# ============================================================================

SEFIRAH_CHOICES = [
    ('keter', 'Keter (Corona)'),
    ('chokhmah', 'Chokhmah (Sabiduría)'),
    ('binah', 'Binah (Entendimiento)'),
    ('chesed', 'Chesed (Misericordia)'),
    ('gevurah', 'Gevurah (Severidad)'),
    ('tiferet', 'Tiferet (Belleza)'),
    ('netzach', 'Netzach (Victoria)'),
    ('hod', 'Hod (Esplendor)'),
    ('yesod', 'Yesod (Fundamento)'),
    ('malkhut', 'Malkhut (Reino)'),
    # Da'at is sometimes included as an 11th sefirah
    ('daat', "Da'at (Conocimiento)"),
]

SEFIRAH_NAMES = [choice[0] for choice in SEFIRAH_CHOICES]


# ============================================================================
# PATH CHOICES (22 Paths of the Tree)
# ============================================================================

PATH_CHOICES = [
    (0, 'Aleph - Keter↔Chokhmah'),
    (1, 'Beth - Keter↔Binah'),
    (2, 'Gimel - Keter↔Tiferet'),
    (3, 'Daleth - Chokhmah↔Binah'),
    (4, 'Heh - Chokhmah↔Tiferet'),
    (5, 'Vav - Chokhmah↔Chesed'),
    (6, 'Zayin - Binah↔Tiferet'),
    (7, 'Cheth - Binah↔Gevurah'),
    (8, 'Teth - Chesed↔Gevurah'),
    (9, 'Yod - Chesed↔Tiferet'),
    (10, 'Kaph - Chesed↔Netzach'),
    (11, 'Lamed - Gevurah↔Tiferet'),
    (12, 'Mem - Gevurah↔Hod'),
    (13, 'Nun - Tiferet↔Netzach'),
    (14, 'Samekh - Tiferet↔Yesod'),
    (15, 'Ayin - Tiferet↔Hod'),
    (16, 'Peh - Netzach↔Hod'),
    (17, 'Tzaddi - Netzach↔Yesod'),
    (18, 'Qoph - Netzach↔Malkhut'),
    (19, 'Resh - Hod↔Yesod'),
    (20, 'Shin - Hod↔Malkhut'),
    (21, 'Tav - Yesod↔Malkhut'),
]


FLOW_DIRECTION_CHOICES = [
    ('ascending', 'Ascendente (hacia Keter)'),
    ('descending', 'Descendente (hacia Malkhut)'),
    ('balanced', 'Equilibrado'),
]


EMOTION_TYPE_CHOICES = [
    ('joy', 'Alegría'),
    ('sadness', 'Tristeza'),
    ('anger', 'Ira'),
    ('fear', 'Miedo'),
    ('love', 'Amor'),
    ('guilt', 'Culpa'),
    ('shame', 'Vergüenza'),
    ('peace', 'Paz'),
    ('anxiety', 'Ansiedad'),
    ('grief', 'Duelo'),
    ('hope', 'Esperanza'),
    ('despair', 'Desesperanza'),
    ('other', 'Otro'),
]


METHOD_CHOICES = [
    ('numerologia', 'Numerología Cabalística'),
    ('tarot', 'Correspondencias Tarot'),
    ('astrologia', 'Correspondencias Astrológicas'),
    ('gematria', 'Gematría'),
    ('meditacion', 'Meditación Guiada'),
    ('bioemotional', 'Biodescodificación'),
    ('libre', 'Exploración Libre'),
]


# ============================================================================
# CABALA SESSION MODEL
# ============================================================================

class CabalaSession(models.Model):
    """
    A Cábala workspace session for a specific patient.
    
    Each session captures the state of the Tree of Life exploration,
    including sefirah observations and path mappings.
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
        related_name='cabala_sessions_as_patient',
        help_text='Usuario/paciente siendo explorado'
    )
    
    # Therapist conducting the session
    therapist = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='cabala_sessions_as_therapist',
        help_text='Terapeuta que conduce la sesión'
    )
    
    # Session metadata
    title = models.CharField(max_length=200, blank=True, default='')
    method_id = models.CharField(
        max_length=50,
        choices=METHOD_CHOICES,
        default='libre',
        help_text='Método de exploración utilizado'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='created'
    )
    
    # Tree state as JSON (for frontend visualization)
    tree_state = models.JSONField(
        default=dict,
        blank=True,
        help_text='Estado estructural del Árbol de la Vida (TreeStructuralState)'
    )
    
    # Session notes and observations
    session_notes = models.TextField(blank=True, default='')
    
    # Clinical context (optional linkage)
    clinical_context = models.JSONField(
        default=dict,
        blank=True,
        help_text='Contexto clínico opcional (bioemotional, tests, etc.)'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    started_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'swm_cabala_sessions'
        verbose_name = 'Sesión de Cábala'
        verbose_name_plural = 'Sesiones de Cábala'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', 'status']),
            models.Index(fields=['therapist', 'status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Cábala Session {self.id} - {self.patient.username} ({self.status})"
    
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
    def duration_minutes(self):
        """Calculate session duration in minutes."""
        if self.started_at:
            end_time = self.closed_at or timezone.now()
            delta = end_time - self.started_at
            return int(delta.total_seconds() / 60)
        return 0


# ============================================================================
# SEFIRAH OBSERVATION MODEL
# ============================================================================

class SefirahObservation(models.Model):
    """
    An observation recorded for a specific sefirah during a Cábala session.
    
    Each observation captures the therapist's insights about the patient's
    relationship with that particular sefirah.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    session = models.ForeignKey(
        CabalaSession,
        on_delete=models.CASCADE,
        related_name='sefirah_observations'
    )
    
    sefirah_name = models.CharField(
        max_length=20,
        choices=SEFIRAH_CHOICES,
        help_text='Sefirah being observed'
    )
    
    observation = models.TextField(
        help_text='Observación terapéutica sobre esta sefirah'
    )
    
    # Intensity of the observation (1-10)
    intensity = models.IntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text='Intensidad de la observación (1=leve, 10=muy significativo)'
    )
    
    # Emotional quality
    emotion_type = models.CharField(
        max_length=20,
        choices=EMOTION_TYPE_CHOICES,
        default='other',
        help_text='Tipo de emoción asociada'
    )
    
    # Whether this is a "blocked" or "activated" sefirah
    is_blocked = models.BooleanField(
        default=False,
        help_text='Indica si la sefirah está bloqueada'
    )
    
    is_activated = models.BooleanField(
        default=False,
        help_text='Indica si la sefirah está activada/iluminada'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'swm_cabala_sefirah_observations'
        verbose_name = 'Observación de Sefirah'
        verbose_name_plural = 'Observaciones de Sefirot'
        ordering = ['created_at']
        # One observation per sefirah per session (can be updated)
        unique_together = [['session', 'sefirah_name']]
    
    def __str__(self):
        return f"{self.sefirah_name} - {self.session_id}"


# ============================================================================
# PATH OBSERVATION MODEL
# ============================================================================

class PathObservation(models.Model):
    """
    An observation recorded for a specific path (netiv) during a Cábala session.
    
    Paths connect sefirot and represent the flow of energy/consciousness.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    session = models.ForeignKey(
        CabalaSession,
        on_delete=models.CASCADE,
        related_name='path_observations'
    )
    
    path_index = models.IntegerField(
        choices=PATH_CHOICES,
        validators=[MinValueValidator(0), MaxValueValidator(21)],
        help_text='Índice del sendero (0-21, correspondiente a letras hebreas)'
    )
    
    flow_direction = models.CharField(
        max_length=20,
        choices=FLOW_DIRECTION_CHOICES,
        default='balanced',
        help_text='Dirección del flujo energético'
    )
    
    observation = models.TextField(
        blank=True,
        default='',
        help_text='Observación sobre este sendero'
    )
    
    # Path state
    is_blocked = models.BooleanField(
        default=False,
        help_text='Indica si el sendero está bloqueado'
    )
    
    is_active = models.BooleanField(
        default=False,
        help_text='Indica si el sendero está activamente trabajándose'
    )
    
    # Tarot correspondence (optional)
    tarot_card = models.CharField(
        max_length=50,
        blank=True,
        default='',
        help_text='Carta de Tarot correspondiente (si aplica)'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'swm_cabala_path_observations'
        verbose_name = 'Observación de Sendero'
        verbose_name_plural = 'Observaciones de Senderos'
        ordering = ['path_index']
        unique_together = [['session', 'path_index']]
    
    def __str__(self):
        return f"Path {self.path_index} - {self.session_id}"


# ============================================================================
# SESSION SNAPSHOT MODEL (Optional - for history tracking)
# ============================================================================

class CabalaSessionSnapshot(models.Model):
    """
    A point-in-time snapshot of a Cábala session's tree state.
    
    Useful for tracking the evolution of the exploration over time.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    session = models.ForeignKey(
        CabalaSession,
        on_delete=models.CASCADE,
        related_name='snapshots'
    )
    
    tree_state = models.JSONField(
        default=dict,
        help_text='Estado del árbol en este momento'
    )
    
    notes = models.TextField(
        blank=True,
        default='',
        help_text='Notas del terapeuta en este momento'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'swm_cabala_session_snapshots'
        verbose_name = 'Snapshot de Sesión Cábala'
        verbose_name_plural = 'Snapshots de Sesiones Cábala'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Snapshot {self.created_at} - Session {self.session_id}"
