"""
WorkspaceService - Business logic for workspace lifecycle.

Handles creation, state transitions, sealing following FSM rules.
"""

from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model
from swm.mcmi4.models import (
    WorkspaceDefinition,
    WorkspaceInstance,
    WorkspacePermission,
    WorkspaceArtifact
)
from swm.mcmi4.services.audit_service import AuditService
from typing import Dict, Any, Optional
import uuid

User = get_user_model()


class WorkspaceService:
    """Service for workspace operations."""
    
    @staticmethod
    @transaction.atomic
    def create_workspace(
        creator_user: User,
        subject_user: User,
        mcmi4_source_data_id: str,
        config: Optional[Dict] = None,
        metadata: Optional[Dict] = None,
        request_context: Optional[Dict] = None
    ) -> WorkspaceInstance:
        """
        Create new workspace instance.
        
        Validates:
        - creator_user != subject_user
        - MCMI4_MYSTIC definition exists
        - No duplicate active workspace for same subject+source_data
        
        Returns created WorkspaceInstance.
        """
        if creator_user.id == subject_user.id:
            raise ValueError("Creator and subject cannot be the same user")
        
        # Get MCMI4_MYSTIC definition
        try:
            workspace_def = WorkspaceDefinition.objects.get(
                code='MCMI4_MYSTIC',
                is_active=True
            )
        except WorkspaceDefinition.DoesNotExist:
            raise ValueError("MCMI4_MYSTIC definition not found or inactive")
        
        # Check for duplicate active workspace
        existing = WorkspaceInstance.objects.filter(
            workspace_definition=workspace_def,
            subject_user=subject_user,
            mcmi4_source_data_id=mcmi4_source_data_id,
            status__in=['created', 'in_progress']
        ).first()
        
        if existing:
            raise ValueError(
                f"Active workspace already exists for subject={subject_user.id} "
                f"and source_data={mcmi4_source_data_id}"
            )
        
        # Create workspace
        workspace = WorkspaceInstance.objects.create(
            workspace_definition=workspace_def,
            subject_user=subject_user,
            creator_user=creator_user,
            mcmi4_source_data_id=mcmi4_source_data_id,
            config=config or {},
            metadata=metadata or {}
        )
        
        # Audit
        AuditService.log_action(
            workspace_instance=workspace,
            user=creator_user,
            action='workspace_created',
            details={
                'workspace_id': str(workspace.id),
                'subject_user_id': str(subject_user.id),
                'mcmi4_source_data_id': mcmi4_source_data_id
            },
            request_context=request_context
        )
        
        return workspace
    
    @staticmethod
    @transaction.atomic
    def transition_to_in_progress(
        workspace: WorkspaceInstance,
        user: User,
        request_context: Optional[Dict] = None
    ) -> WorkspaceInstance:
        """Transition workspace to in_progress (when first session starts)."""
        if workspace.status != 'created':
            raise ValueError(
                f"Cannot transition from {workspace.status} to in_progress"
            )
        
        workspace.status = 'in_progress'
        workspace.started_at = timezone.now()
        workspace.save()
        
        AuditService.log_action(
            workspace_instance=workspace,
            user=user,
            action='workspace_started',
            details={'from_status': 'created', 'to_status': 'in_progress'},
            request_context=request_context
        )
        
        return workspace
    
    @staticmethod
    @transaction.atomic
    def seal_workspace(
        workspace: WorkspaceInstance,
        user: User,
        final_synthesis: Dict[str, Any],
        request_context: Optional[Dict] = None
    ) -> tuple[WorkspaceInstance, WorkspaceArtifact]:
        """
        Seal workspace - final state transition.
        
        Creates synthesis artifact, transitions to sealed, seals all artifacts.
        Returns (workspace, synthesis_artifact).
        """
        if workspace.status != 'in_progress':
            raise ValueError(
                f"Cannot seal workspace in status {workspace.status}"
            )
        
        # Create synthesis artifact
        synthesis = WorkspaceArtifact.objects.create(
            workspace_instance=workspace,
            session=None,  # Final synthesis not tied to session
            artifact_type='final_synthesis',
            content=final_synthesis,
            created_by=user,
            is_sealed=True,
            metadata={'sealed_at': timezone.now().isoformat()}
        )
        
        # Seal all artifacts
        WorkspaceArtifact.objects.filter(
            workspace_instance=workspace,
            is_sealed=False
        ).update(is_sealed=True)
        
        # Transition workspace
        workspace.status = 'sealed'
        workspace.sealed_at = timezone.now()
        workspace.save()
        
        AuditService.log_action(
            workspace_instance=workspace,
            user=user,
            action='workspace_sealed',
            details={
                'synthesis_artifact_id': str(synthesis.id),
                'sealed_at': workspace.sealed_at.isoformat()
            },
            request_context=request_context
        )
        
        return workspace, synthesis
    
    @staticmethod
    def get_workspace_status(workspace_id: uuid.UUID) -> Dict[str, Any]:
        """
        Get comprehensive workspace status.
        
        Returns dict with status, dates, active session, permissions, artifacts count.
        """
        try:
            workspace = WorkspaceInstance.objects.select_related(
                'subject_user', 'creator_user', 'workspace_definition'
            ).get(id=workspace_id)
        except WorkspaceInstance.DoesNotExist:
            raise ValueError(f"Workspace {workspace_id} not found")
        
        # Get active session
        active_session = workspace.sessions.filter(is_active=True).first()
        
        # Get permissions
        permissions = WorkspacePermission.objects.filter(
            workspace_instance=workspace,
            is_active=True
        ).values('user_id', 'permission_type')
        
        # Get artifacts count by type
        artifacts_count = {}
        for artifact_type in ['progress_snapshot', 'interpretation_note', 'decision_log', 'final_synthesis']:
            artifacts_count[artifact_type] = workspace.artifacts.filter(
                artifact_type=artifact_type
            ).count()
        
        return {
            'workspace_id': workspace.id,
            'status': workspace.status,
            'subject_user_id': workspace.subject_user.id,
            'creator_user_id': workspace.creator_user.id,
            'created_at': workspace.created_at,
            'started_at': workspace.started_at,
            'sealed_at': workspace.sealed_at,
            'reviewed_at': workspace.reviewed_at,
            'active_session': {
                'session_id': active_session.id,
                'executor_user_id': active_session.executor_user.id,
                'started_at': active_session.started_at,
                'current_phase': active_session.current_phase,
                'interactions_count': active_session.interactions_count
            } if active_session else None,
            'permissions': list(permissions),
            'artifacts_count': artifacts_count
        }
