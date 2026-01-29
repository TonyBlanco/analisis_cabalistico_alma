"""
SHA (Auditoría de Armonía Sefirótica) SWM models.

Lightweight workspace + artifacts for therapist/patient workflow.
"""

import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class WorkspaceDefinition(models.Model):
    """Global template for SHA workspaces."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, default="Auditoría de Armonía Sefirótica")
    code = models.CharField(max_length=50, unique=True, default="SHA_SEFIROTICA")
    version = models.CharField(max_length=20, default="1.0")
    description = models.TextField(blank=True, default="")
    config_schema = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'swm_sha_workspace_definitions'
        verbose_name = 'SHA Workspace Definition'
        verbose_name_plural = 'SHA Workspace Definitions'

    def __str__(self):
        return f"{self.name} ({self.code})"


class WorkspaceInstance(models.Model):
    """Concrete SHA workspace for a subject."""

    STATUS_CHOICES = [
        ('created', 'Created'),
        ('in_progress', 'In Progress'),
        ('sealed', 'Sealed'),
        ('reviewed', 'Reviewed'),
        ('archived', 'Archived'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    definition = models.ForeignKey(
        WorkspaceDefinition,
        on_delete=models.PROTECT,
        related_name='instances'
    )
    subject_user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='sha_workspaces_as_subject'
    )
    creator_user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='sha_workspaces_created'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='created')
    config = models.JSONField(default=dict, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    started_at = models.DateTimeField(null=True, blank=True)
    sealed_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    archived_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'swm_sha_workspace_instances'
        verbose_name = 'SHA Workspace Instance'
        verbose_name_plural = 'SHA Workspace Instances'
        indexes = [
            models.Index(fields=['definition', 'status']),
            models.Index(fields=['subject_user', 'status']),
            models.Index(fields=['creator_user', '-created_at']),
        ]

    def __str__(self):
        return f"SHA Workspace {self.id} - {self.status}"

    def can_transition_to(self, new_status: str) -> bool:
        transitions = {
            'created': ['in_progress', 'archived'],
            'in_progress': ['sealed', 'archived'],
            'sealed': ['reviewed'],
            'reviewed': ['archived'],
            'archived': [],
        }
        return new_status in transitions.get(self.status, [])

    def mark_sealed(self):
        self.status = 'sealed'
        self.sealed_at = timezone.now()
        self.save(update_fields=['status', 'sealed_at', 'updated_at'])

    def mark_reviewed(self):
        self.status = 'reviewed'
        self.reviewed_at = timezone.now()
        self.save(update_fields=['status', 'reviewed_at', 'updated_at'])


class WorkspacePermission(models.Model):
    """Explicit permissions per user."""

    PERMISSION_CHOICES = [
        ('admin', 'Admin'),
        ('executor', 'Executor'),
        ('observer', 'Observer'),
        ('reviewer', 'Reviewer'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace_instance = models.ForeignKey(
        WorkspaceInstance,
        on_delete=models.CASCADE,
        related_name='permissions'
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sha_workspace_permissions')
    permission_type = models.CharField(max_length=20, choices=PERMISSION_CHOICES)
    is_active = models.BooleanField(default=True)
    granted_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sha_permissions_granted'
    )
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'swm_sha_workspace_permissions'
        verbose_name = 'SHA Workspace Permission'
        verbose_name_plural = 'SHA Workspace Permissions'
        indexes = [
            models.Index(fields=['workspace_instance', 'permission_type']),
        ]

    def __str__(self):
        return f"Permission {self.permission_type} for {self.user_id} on {self.workspace_instance_id}"


class WorkspaceArtifact(models.Model):
    """Artifacts captured during the SHA workflow."""

    ARTIFACT_CHOICES = [
        ('balance_map', 'Mapa de balance sefirotico'),
        ('therapist_notes', 'Notas del terapeuta'),
        ('patient_submission', 'Entrada del paciente'),
        ('consultant_guide', 'Guia para consultante'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace_instance = models.ForeignKey(
        WorkspaceInstance,
        on_delete=models.CASCADE,
        related_name='artifacts'
    )
    artifact_type = models.CharField(max_length=30, choices=ARTIFACT_CHOICES)
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='sha_artifacts_created'
    )
    content = models.JSONField(default=dict, blank=True)
    is_sealed = models.BooleanField(default=False)
    share_with_consultant = models.BooleanField(default=False)
    is_patient_submission = models.BooleanField(default=False)
    version = models.IntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    sealed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'swm_sha_workspace_artifacts'
        verbose_name = 'SHA Workspace Artifact'
        verbose_name_plural = 'SHA Workspace Artifacts'
        indexes = [
            models.Index(fields=['workspace_instance', 'artifact_type']),
            models.Index(fields=['workspace_instance', 'is_patient_submission']),
        ]

    def __str__(self):
        return f"Artifact {self.artifact_type} ({self.id})"

    def seal(self):
        if not self.is_sealed:
            self.is_sealed = True
            self.sealed_at = timezone.now()
            self.save(update_fields=['is_sealed', 'sealed_at', 'updated_at'])
