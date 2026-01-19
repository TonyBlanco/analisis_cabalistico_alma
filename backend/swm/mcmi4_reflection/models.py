"""
MCMI-4 Reflection SWM Models.

Experiential reflection module for consultants - human text input only.
NO scoring, NO inference, NO automatic interpretation.
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone
import uuid

User = get_user_model()


class WorkspaceDefinition(models.Model):
    """
    Global template for MCMI-4 Reflection workspace.
    Only 1 record with code='MCMI4_REFLECTION'.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, default="MCMI-4 Reflection")
    code = models.CharField(max_length=50, unique=True, default="MCMI4_REFLECTION")
    version = models.CharField(max_length=20, default="1.0")
    description = models.TextField(blank=True)
    config_schema = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'reflection_workspace_definitions'
        verbose_name = 'Reflection Workspace Definition'
        verbose_name_plural = 'Reflection Workspace Definitions'
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class WorkspaceInstance(models.Model):
    """
    Concrete reflection workspace for a consultant's mcmi4-signal.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sealed', 'Sealed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace_definition = models.ForeignKey(
        WorkspaceDefinition,
        on_delete=models.PROTECT,
        related_name='instances'
    )
    consultant_user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='reflection_workspaces',
        help_text="User completing the reflection (consultant)"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Reference to mcmi4-signal TestResult
    linked_test_result_id = models.CharField(
        max_length=100,
        help_text="Reference to mcmi4-signal TestResult ID"
    )
    
    config = models.JSONField(default=dict, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    sealed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'reflection_workspace_instances'
        verbose_name = 'Reflection Workspace Instance'
        verbose_name_plural = 'Reflection Workspace Instances'
        indexes = [
            models.Index(fields=['consultant_user', '-created_at']),
            models.Index(fields=['linked_test_result_id']),
        ]
        constraints = [
            # One reflection per consultant per signal
            models.UniqueConstraint(
                fields=['consultant_user', 'linked_test_result_id'],
                name='unique_reflection_per_consultant_signal'
            )
        ]
    
    def __str__(self):
        return f"Reflection {self.id} - {self.status}"
    
    def can_edit(self):
        """Check if workspace can be edited."""
        return self.status == 'draft'
    
    def seal(self):
        """Seal the workspace."""
        if self.status != 'draft':
            raise ValidationError("Can only seal draft workspaces")
        self.status = 'sealed'
        self.sealed_at = timezone.now()
        self.save()


class WorkspaceArtifact(models.Model):
    """
    Reflection content artifact.
    """
    ARTIFACT_TYPE_CHOICES = [
        ('reflection:v1', 'Reflection v1'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace_instance = models.ForeignKey(
        WorkspaceInstance,
        on_delete=models.CASCADE,
        related_name='artifacts'
    )
    
    artifact_type = models.CharField(max_length=50, choices=ARTIFACT_TYPE_CHOICES, default='reflection:v1')
    content = models.JSONField(help_text="Reflection answers and metadata")
    
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='reflection_artifacts_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_sealed = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'reflection_workspace_artifacts'
        verbose_name = 'Reflection Workspace Artifact'
        verbose_name_plural = 'Reflection Workspace Artifacts'
        indexes = [
            models.Index(fields=['workspace_instance', 'artifact_type']),
        ]
    
    def __str__(self):
        return f"{self.artifact_type} - {self.id}"


class WorkspaceAuditLog(models.Model):
    """
    Immutable audit log for reflection workspace actions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace_instance = models.ForeignKey(
        WorkspaceInstance,
        on_delete=models.PROTECT,
        related_name='audit_logs'
    )
    
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='reflection_audit_logs')
    action = models.CharField(max_length=100, help_text="Action: created, updated, sealed")
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        db_table = 'reflection_workspace_audit_logs'
        verbose_name = 'Reflection Workspace Audit Log'
        verbose_name_plural = 'Reflection Workspace Audit Logs'
        indexes = [
            models.Index(fields=['workspace_instance', '-timestamp']),
            models.Index(fields=['user', '-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.action} by {self.user} at {self.timestamp}"
    
    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ValidationError("Audit logs are immutable")
        super().save(*args, **kwargs)
