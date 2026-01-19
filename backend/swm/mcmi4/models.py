"""
MCMI-4 Místico SWM Models.

Following SWM_MCMI4_DOMAIN_MODEL.md specification.
These models are completely independent of TestModule/UserTestAccess.
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone
import uuid

User = get_user_model()


class WorkspaceDefinition(models.Model):
    """
    Global template defining what MCMI-4 Místico workspace is.
    Only 1 record should exist with code='MCMI4_MYSTIC'.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, default="MCMI-4 Místico")
    code = models.CharField(max_length=50, unique=True, default="MCMI4_MYSTIC")
    version = models.CharField(max_length=20, default="1.0")
    description = models.TextField(blank=True)
    config_schema = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'workspace_definitions'
        verbose_name = 'Workspace Definition'
        verbose_name_plural = 'Workspace Definitions'
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class WorkspaceInstance(models.Model):
    """
    Concrete instance of MCMI-4 Místico workspace for a specific subject.
    """
    STATUS_CHOICES = [
        ('created', 'Created'),
        ('in_progress', 'In Progress'),
        ('sealed', 'Sealed'),
        ('reviewed', 'Reviewed'),
        ('archived', 'Archived'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace_definition = models.ForeignKey(
        WorkspaceDefinition,
        on_delete=models.PROTECT,
        related_name='instances'
    )
    subject_user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='workspaces_as_subject',
        help_text="User whose MCMI-4 data is being analyzed (NOT necessarily the executor)"
    )
    creator_user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='workspaces_created',
        help_text="User who created this workspace (typically therapist)"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='created')
    
    # MCMI-4 source data reference (adjust FK target as needed)
    # For now, storing as char field - can be FK to actual MCMI4 result model
    mcmi4_source_data_id = models.CharField(max_length=100, help_text="Reference to MCMI-4 data")
    
    config = models.JSONField(default=dict, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    sealed_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    archived_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'workspace_instances'
        verbose_name = 'Workspace Instance'
        verbose_name_plural = 'Workspace Instances'
        indexes = [
            models.Index(fields=['workspace_definition', 'status']),
            models.Index(fields=['subject_user', 'status']),
            models.Index(fields=['creator_user', '-created_at']),
        ]
    
    def __str__(self):
        return f"MCMI4 Workspace {self.id} - {self.status}"
    
    def can_transition_to(self, new_status):
        """Validate FSM transitions."""
        valid_transitions = {
            'created': ['in_progress', 'archived'],
            'in_progress': ['sealed'],
            'sealed': ['reviewed'],
            'reviewed': ['archived'],
            'archived': [],
        }
        return new_status in valid_transitions.get(self.status, [])
    
    def get_active_session(self):
        """Return active session or None."""
        return self.sessions.filter(is_active=True).first()
    
    def has_permission(self, user, permission_type):
        """Check if user has specific permission on this workspace."""
        # Creator always has admin permission
        if self.creator_user == user and permission_type in ['admin', 'executor', 'observer', 'reviewer']:
            return True
        
        # Check explicit permissions
        return self.permissions.filter(
            user=user,
            permission_type=permission_type,
            is_active=True
        ).exists()


class WorkspaceSession(models.Model):
    """
    Active or historical session within a workspace.
    """
    PHASE_CHOICES = [
        ('discovery', 'Discovery'),
        ('mapping', 'Mapping'),
        ('interpretation', 'Interpretation'),
        ('synthesis', 'Synthesis'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace_instance = models.ForeignKey(
        WorkspaceInstance,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    executor_user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='workspace_sessions_executed'
    )
    
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    session_state = models.JSONField(default=dict, blank=True, help_text="Progress, decisions, context")
    interactions_count = models.IntegerField(default=0)
    current_phase = models.CharField(max_length=20, choices=PHASE_CHOICES, default='discovery')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'workspace_sessions'
        verbose_name = 'Workspace Session'
        verbose_name_plural = 'Workspace Sessions'
        indexes = [
            models.Index(fields=['workspace_instance', 'is_active']),
            models.Index(fields=['executor_user', '-started_at']),
        ]
        constraints = [
            # Only 1 active session per workspace
            models.UniqueConstraint(
                fields=['workspace_instance'],
                condition=models.Q(is_active=True),
                name='unique_active_session_per_workspace'
            )
        ]
    
    def __str__(self):
        return f"Session {self.id} - {self.current_phase}"
    
    def clean(self):
        """Validate session constraints."""
        if self.ended_at and self.ended_at < self.started_at:
            raise ValidationError("ended_at cannot be before started_at")
        if self.is_active and self.ended_at:
            raise ValidationError("Active session cannot have ended_at")
    
    @property
    def status(self):
        """Compatibility property: returns 'active' if is_active, else 'ended'."""
        return 'active' if self.is_active else 'ended'


class WorkspaceArtifact(models.Model):
    """
    Artifacts generated during/after session (maps, narratives, hypotheses).
    """
    ARTIFACT_TYPE_CHOICES = [
        ('symbolic_map', 'Symbolic Map'),
        ('narrative', 'Narrative'),
        ('hypothesis', 'Hypothesis'),
        ('synthesis_report', 'Synthesis Report'),
        ('archetype_profile', 'Archetype Profile'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace_instance = models.ForeignKey(
        WorkspaceInstance,
        on_delete=models.CASCADE,
        related_name='artifacts'
    )
    session = models.ForeignKey(
        WorkspaceSession,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='artifacts'
    )
    
    artifact_type = models.CharField(max_length=50, choices=ARTIFACT_TYPE_CHOICES)
    content = models.JSONField(help_text="Artifact content (immutable post-seal)")
    
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    is_sealed = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'workspace_artifacts'
        verbose_name = 'Workspace Artifact'
        verbose_name_plural = 'Workspace Artifacts'
        indexes = [
            models.Index(fields=['workspace_instance', 'artifact_type']),
            models.Index(fields=['session']),
        ]
    
    def __str__(self):
        return f"{self.artifact_type} - {self.id}"


class WorkspacePermission(models.Model):
    """
    Explicit permission grants for workspace access.
    """
    PERMISSION_TYPE_CHOICES = [
        ('executor', 'Executor'),
        ('observer', 'Observer'),
        ('reviewer', 'Reviewer'),
        ('admin', 'Admin'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace_instance = models.ForeignKey(
        WorkspaceInstance,
        on_delete=models.CASCADE,
        related_name='permissions'
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workspace_permissions')
    permission_type = models.CharField(max_length=20, choices=PERMISSION_TYPE_CHOICES)
    
    granted_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='permissions_granted'
    )
    granted_at = models.DateTimeField(auto_now_add=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'workspace_permissions'
        verbose_name = 'Workspace Permission'
        verbose_name_plural = 'Workspace Permissions'
        indexes = [
            models.Index(fields=['workspace_instance', 'user', 'is_active']),
            models.Index(fields=['user', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.user} - {self.permission_type} on {self.workspace_instance.id}"


class WorkspaceAuditLog(models.Model):
    """
    Immutable audit log of all workspace actions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace_instance = models.ForeignKey(
        WorkspaceInstance,
        on_delete=models.PROTECT,
        related_name='audit_logs'
    )
    session = models.ForeignKey(
        WorkspaceSession,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    action = models.CharField(max_length=100, help_text="Action type: created, started, sealed, etc.")
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict, blank=True, help_text="Contextual details")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        db_table = 'workspace_audit_logs'
        verbose_name = 'Workspace Audit Log'
        verbose_name_plural = 'Workspace Audit Logs'
        indexes = [
            models.Index(fields=['workspace_instance', '-timestamp']),
            models.Index(fields=['user', '-timestamp']),
        ]
        # Audit logs are immutable
        permissions = [
            ("view_audit_log", "Can view audit logs"),
        ]
    
    def __str__(self):
        return f"{self.action} by {self.user} at {self.timestamp}"
    
    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ValidationError("Audit logs are immutable and cannot be updated.")
        super().save(*args, **kwargs)
