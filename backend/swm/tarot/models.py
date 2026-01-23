"""
Django Models for SWM Tarot Evolutivo.

This module defines the data models for the Tarot workspace,
following the established SWM pattern from MCMI-4 Místico.

Models:
    - WorkspaceDefinition: Global template for workspace type
    - WorkspaceInstance: Concrete workspace instance per patient
    - WorkspaceSession: Active session tracking
    - WorkspaceArtifact: JSON content storage (spreads, notes, maps)
    - WorkspacePermission: Access control per instance
    - WorkspaceAuditLog: Immutable audit trail
"""

import uuid
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


# =============================================================================
# CHOICES
# =============================================================================

class SpreadType(models.TextChoices):
    """Types of Tarot spreads supported."""
    FREE = 'free', 'Tirada Libre'
    TREE_OF_LIFE = 'tree_of_life', 'Árbol de la Vida'
    CROSS = 'cross', 'Cruz Celta'
    THREE_CARDS = 'three_cards', 'Tres Cartas (PPF)'
    HORSESHOE = 'horseshoe', 'Herradura'
    SEPHIROTH_PATH = 'sephiroth_path', 'Sendero Sefirótico'


class TarotSystem(models.TextChoices):
    """Tarot deck systems supported."""
    RIDER_WAITE = 'rider-waite', 'Rider-Waite-Smith'
    THOTH = 'thoth', 'Thoth (Crowley)'
    MARSEILLE = 'marseille', 'Marsella'
    GOLDEN_DAWN = 'golden-dawn', 'Golden Dawn'
    BOTA = 'bota', 'B.O.T.A.'


class WorkspaceStatus(models.TextChoices):
    """Status states for workspace instances."""
    CREATED = 'created', 'Creado'
    IN_PROGRESS = 'in_progress', 'En Progreso'
    SEALED = 'sealed', 'Sellado'
    REVIEWED = 'reviewed', 'Revisado'
    ARCHIVED = 'archived', 'Archivado'
    CANCELLED = 'cancelled', 'Cancelado'


class ArtifactType(models.TextChoices):
    """Types of artifacts that can be stored."""
    SPREAD = 'spread', 'Tirada'
    THERAPIST_NOTES = 'therapist_notes', 'Notas del Terapeuta'
    SYMBOLIC_MAP = 'symbolic_map', 'Mapa Simbólico'
    SESSION_SUMMARY = 'session_summary', 'Resumen de Sesión'


class PermissionLevel(models.TextChoices):
    """Permission levels for workspace access."""
    EXECUTOR = 'executor', 'Ejecutor'
    OBSERVER = 'observer', 'Observador'
    REVIEWER = 'reviewer', 'Revisor'
    ADMIN = 'admin', 'Administrador'


class SessionPhase(models.TextChoices):
    """Phases within a workspace session."""
    SETUP = 'setup', 'Configuración'
    SELECTION = 'selection', 'Selección de Cartas'
    EXPLORATION = 'exploration', 'Exploración Simbólica'
    SYNTHESIS = 'synthesis', 'Síntesis'
    CLOSING = 'closing', 'Cierre'


# =============================================================================
# MODELS
# =============================================================================

class WorkspaceDefinition(models.Model):
    """
    Global template defining the Tarot workspace type.
    
    This is a singleton-like model that defines the configuration
    schema and metadata for all Tarot workspace instances.
    """
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    code = models.CharField(
        max_length=50,
        unique=True,
        help_text="Unique code identifier (e.g., 'TAROT_EVOLUTIVO')"
    )
    name = models.CharField(
        max_length=100,
        help_text="Human-readable name"
    )
    description = models.TextField(
        blank=True,
        help_text="Detailed description of this workspace type"
    )
    version = models.CharField(
        max_length=20,
        default='1.0.0',
        help_text="Semantic version"
    )
    config_schema = models.JSONField(
        default=dict,
        help_text="JSON Schema for workspace configuration"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this workspace type is available"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'swm_tarot_workspace_definition'
        verbose_name = 'Workspace Definition'
        verbose_name_plural = 'Workspace Definitions'
    
    def __str__(self):
        return f"{self.code} v{self.version}"


class WorkspaceInstance(models.Model):
    """
    Concrete workspace instance for a specific patient.
    
    Each instance represents a Tarot exploration session between
    a therapist (creator) and a patient (subject).
    """
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    definition = models.ForeignKey(
        WorkspaceDefinition,
        on_delete=models.PROTECT,
        related_name='instances'
    )
    subject_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='tarot_workspaces_as_subject',
        help_text="The patient this workspace belongs to"
    )
    creator_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='tarot_workspaces_created',
        help_text="The therapist who created this workspace"
    )
    
    # Tarot-specific fields
    spread_type = models.CharField(
        max_length=30,
        choices=SpreadType.choices,
        default=SpreadType.FREE,
        help_text="Type of Tarot spread"
    )
    tarot_system = models.CharField(
        max_length=30,
        choices=TarotSystem.choices,
        default=TarotSystem.RIDER_WAITE,
        help_text="Tarot deck system used"
    )
    total_cards = models.PositiveIntegerField(
        default=0,
        help_text="Total cards in the spread (0 = variable)"
    )
    has_reversed = models.BooleanField(
        default=True,
        help_text="Whether reversed cards are used"
    )
    
    # Status management
    status = models.CharField(
        max_length=20,
        choices=WorkspaceStatus.choices,
        default=WorkspaceStatus.CREATED
    )
    
    # Configuration
    config = models.JSONField(
        default=dict,
        help_text="Instance-specific configuration"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    started_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When work actually began"
    )
    sealed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the workspace was sealed"
    )
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the workspace was reviewed"
    )
    
    class Meta:
        db_table = 'swm_tarot_workspace_instance'
        verbose_name = 'Workspace Instance'
        verbose_name_plural = 'Workspace Instances'
        indexes = [
            models.Index(fields=['subject_user', 'status']),
            models.Index(fields=['creator_user', 'status']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"Tarot-{self.id.hex[:8]} ({self.subject_user})"
    
    def clean(self):
        """Validate that creator and subject are different."""
        if self.creator_user_id == self.subject_user_id:
            raise ValidationError({
                'subject_user': 'Creator and subject must be different users.'
            })


class WorkspaceSession(models.Model):
    """
    Tracks an active working session within a workspace instance.
    
    A workspace can have multiple sessions over time, but only
    one active session at a time.
    """
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    instance = models.ForeignKey(
        WorkspaceInstance,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        help_text="User who initiated this session"
    )
    
    # Session state
    phase = models.CharField(
        max_length=20,
        choices=SessionPhase.choices,
        default=SessionPhase.SETUP
    )
    is_active = models.BooleanField(default=True)
    
    # Progress tracking
    progress_data = models.JSONField(
        default=dict,
        help_text="Session progress and state data"
    )
    
    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(
        null=True,
        blank=True
    )
    last_activity_at = models.DateTimeField(auto_now=True)
    
    # Client info
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True
    )
    user_agent = models.TextField(
        blank=True,
        default=''
    )
    
    class Meta:
        db_table = 'swm_tarot_workspace_session'
        verbose_name = 'Workspace Session'
        verbose_name_plural = 'Workspace Sessions'
        indexes = [
            models.Index(fields=['instance', 'is_active']),
        ]
    
    def __str__(self):
        return f"Session-{self.id.hex[:8]} ({self.phase})"


class WorkspaceArtifact(models.Model):
    """
    Stores content artifacts produced within a workspace.
    
    Artifacts include spreads, notes, symbolic maps, and summaries.
    Once sealed, artifacts become immutable.
    """
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    instance = models.ForeignKey(
        WorkspaceInstance,
        on_delete=models.CASCADE,
        related_name='artifacts'
    )
    session = models.ForeignKey(
        WorkspaceSession,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='artifacts',
        help_text="Session that created this artifact (if any)"
    )
    
    # Content
    artifact_type = models.CharField(
        max_length=30,
        choices=ArtifactType.choices
    )
    content = models.JSONField(
        help_text="Artifact content as JSON"
    )
    
    # Metadata
    is_sealed = models.BooleanField(
        default=False,
        help_text="Sealed artifacts cannot be modified"
    )
    version = models.PositiveIntegerField(
        default=1,
        help_text="Artifact version (increments on update)"
    )
    
    # Authorship
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='tarot_artifacts_created'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    sealed_at = models.DateTimeField(
        null=True,
        blank=True
    )
    
    class Meta:
        db_table = 'swm_tarot_workspace_artifact'
        verbose_name = 'Workspace Artifact'
        verbose_name_plural = 'Workspace Artifacts'
        indexes = [
            models.Index(fields=['instance', 'artifact_type']),
        ]
    
    def __str__(self):
        return f"{self.artifact_type}-{self.id.hex[:8]}"
    
    def clean(self):
        """Prevent modification of sealed artifacts."""
        if self.pk:
            original = WorkspaceArtifact.objects.filter(pk=self.pk).first()
            if original and original.is_sealed:
                raise ValidationError('Cannot modify a sealed artifact.')


class WorkspacePermission(models.Model):
    """
    Controls user access to workspace instances.
    
    Permissions determine what actions a user can perform
    on a specific workspace instance.
    """
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    instance = models.ForeignKey(
        WorkspaceInstance,
        on_delete=models.CASCADE,
        related_name='permissions'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tarot_workspace_permissions'
    )
    
    # Permission level
    level = models.CharField(
        max_length=20,
        choices=PermissionLevel.choices
    )
    
    # Audit
    granted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='tarot_permissions_granted'
    )
    granted_at = models.DateTimeField(auto_now_add=True)
    
    # Revocation
    is_active = models.BooleanField(default=True)
    revoked_at = models.DateTimeField(
        null=True,
        blank=True
    )
    revoked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='tarot_permissions_revoked'
    )
    
    class Meta:
        db_table = 'swm_tarot_workspace_permission'
        verbose_name = 'Workspace Permission'
        verbose_name_plural = 'Workspace Permissions'
        unique_together = [['instance', 'user', 'level']]
        indexes = [
            models.Index(fields=['user', 'is_active']),
        ]
    
    def __str__(self):
        status = 'active' if self.is_active else 'revoked'
        return f"{self.user} - {self.level} ({status})"


class WorkspaceAuditLog(models.Model):
    """
    Immutable audit trail for workspace actions.
    
    Every significant action is logged here for compliance
    and debugging purposes. Entries cannot be modified or deleted.
    """
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    instance = models.ForeignKey(
        WorkspaceInstance,
        on_delete=models.CASCADE,
        related_name='audit_logs'
    )
    
    # Action details
    action = models.CharField(
        max_length=50,
        help_text="Action identifier (e.g., 'spread_saved')"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='tarot_audit_logs',
        help_text="User who performed the action"
    )
    
    # Context
    details = models.JSONField(
        default=dict,
        help_text="Additional action details"
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True
    )
    user_agent = models.TextField(
        blank=True,
        default=''
    )
    
    # Timestamp
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'swm_tarot_workspace_audit_log'
        verbose_name = 'Audit Log Entry'
        verbose_name_plural = 'Audit Log Entries'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['instance', 'timestamp']),
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.action} by {self.user} at {self.timestamp}"
    
    def save(self, *args, **kwargs):
        """Prevent updates to existing audit log entries."""
        if self.pk:
            existing = WorkspaceAuditLog.objects.filter(pk=self.pk).exists()
            if existing:
                raise ValidationError('Audit log entries cannot be modified.')
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """Prevent deletion of audit log entries."""
        raise ValidationError('Audit log entries cannot be deleted.')
