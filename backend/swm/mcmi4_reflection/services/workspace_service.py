"""
WorkspaceService - Business logic for reflection workspace lifecycle.
"""

from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model
from swm.mcmi4_reflection.models import (
    WorkspaceDefinition,
    WorkspaceInstance,
    WorkspaceArtifact
)
from swm.mcmi4_reflection.services.audit_service import AuditService
from typing import Dict, Any, Optional
from api.test_models import TestResult

User = get_user_model()


class WorkspaceService:
    """Service for reflection workspace operations."""
    
    @staticmethod
    @transaction.atomic
    def create_workspace(
        consultant_user: User,
        linked_test_result_id: str,
        initial_answers: Optional[Dict] = None,
        request_context: Optional[Dict] = None
    ) -> tuple[WorkspaceInstance, WorkspaceArtifact]:
        """
        Create new reflection workspace.
        
        Validates:
        - MCMI4_REFLECTION definition exists
        - linked TestResult exists and belongs to consultant_user
        - No duplicate reflection for same consultant+signal
        
        Returns (WorkspaceInstance, WorkspaceArtifact).
        """
        # Get definition
        try:
            workspace_def = WorkspaceDefinition.objects.get(
                code='MCMI4_REFLECTION',
                is_active=True
            )
        except WorkspaceDefinition.DoesNotExist:
            raise ValueError("MCMI4_REFLECTION definition not found or inactive")
        
        # Validate TestResult exists and belongs to consultant
        try:
            test_result = TestResult.objects.get(id=int(linked_test_result_id))
        except (TestResult.DoesNotExist, ValueError):
            raise ValueError(f"TestResult {linked_test_result_id} not found")
        
        if test_result.user != consultant_user:
            raise ValueError("TestResult does not belong to consultant_user")
        
        if test_result.test_module.code != 'mcmi4-signal':
            raise ValueError("TestResult must be mcmi4-signal type")
        
        # Check for duplicate
        existing = WorkspaceInstance.objects.filter(
            consultant_user=consultant_user,
            linked_test_result_id=linked_test_result_id
        ).first()
        
        if existing:
            raise ValueError("Reflection already exists for this consultant and signal")
        
        # Create workspace
        workspace = WorkspaceInstance.objects.create(
            workspace_definition=workspace_def,
            consultant_user=consultant_user,
            linked_test_result_id=linked_test_result_id,
            status='draft'
        )
        
        # Create initial artifact
        artifact = WorkspaceArtifact.objects.create(
            workspace_instance=workspace,
            artifact_type='reflection:v1',
            content={
                'schema_version': 'mcmi4-reflection:v1',
                'linked_test_result_id': linked_test_result_id,
                'answers': initial_answers or {},
                'status': 'draft',
                'completed_at': None
            },
            created_by=consultant_user,
            is_sealed=False
        )
        
        # Audit
        AuditService.log_action(
            workspace_instance=workspace,
            user=consultant_user,
            action='created',
            details={
                'workspace_id': str(workspace.id),
                'artifact_id': str(artifact.id),
                'linked_test_result_id': linked_test_result_id
            },
            request_context=request_context
        )
        
        return workspace, artifact
    
    @staticmethod
    @transaction.atomic
    def update_reflection(
        workspace: WorkspaceInstance,
        user: User,
        answers: Dict[str, str],
        request_context: Optional[Dict] = None
    ) -> WorkspaceArtifact:
        """
        Update reflection answers.
        
        Only allowed if:
        - workspace status is 'draft'
        - user is the consultant
        """
        if workspace.status != 'draft':
            raise ValueError("Cannot update sealed reflection")
        
        if workspace.consultant_user != user:
            raise ValueError("Only consultant can update reflection")
        
        # Get or create artifact
        artifact = workspace.artifacts.filter(
            artifact_type='reflection:v1'
        ).first()
        
        if not artifact:
            raise ValueError("Reflection artifact not found")
        
        # Update content
        artifact.content['answers'] = answers
        artifact.save()
        
        # Audit
        AuditService.log_action(
            workspace_instance=workspace,
            user=user,
            action='updated',
            details={
                'artifact_id': str(artifact.id),
                'answers_count': len(answers)
            },
            request_context=request_context
        )
        
        return artifact
    
    @staticmethod
    @transaction.atomic
    def seal_reflection(
        workspace: WorkspaceInstance,
        user: User,
        request_context: Optional[Dict] = None
    ) -> WorkspaceInstance:
        """
        Seal reflection workspace.
        
        Only allowed if:
        - workspace status is 'draft'
        - user is the consultant
        """
        if workspace.status != 'draft':
            raise ValueError("Reflection already sealed")
        
        if workspace.consultant_user != user:
            raise ValueError("Only consultant can seal reflection")
        
        # Get artifact
        artifact = workspace.artifacts.filter(
            artifact_type='reflection:v1'
        ).first()
        
        if not artifact:
            raise ValueError("Reflection artifact not found")
        
        # Update artifact
        artifact.content['status'] = 'sealed'
        artifact.content['completed_at'] = timezone.now().isoformat()
        artifact.is_sealed = True
        artifact.save()
        
        # Update workspace
        workspace.status = 'sealed'
        workspace.sealed_at = timezone.now()
        workspace.save()
        
        # Audit
        AuditService.log_action(
            workspace_instance=workspace,
            user=user,
            action='sealed',
            details={
                'workspace_id': str(workspace.id),
                'sealed_at': workspace.sealed_at.isoformat()
            },
            request_context=request_context
        )
        
        return workspace
    
    @staticmethod
    def get_workspace_status(workspace_id: str) -> Dict[str, Any]:
        """Get comprehensive workspace status."""
        try:
            workspace = WorkspaceInstance.objects.select_related(
                'consultant_user', 'workspace_definition'
            ).get(id=workspace_id)
        except WorkspaceInstance.DoesNotExist:
            raise ValueError(f"Workspace {workspace_id} not found")
        
        # Get artifact
        artifact = workspace.artifacts.filter(
            artifact_type='reflection:v1'
        ).first()
        
        return {
            'workspace_id': str(workspace.id),
            'status': workspace.status,
            'consultant_user_id': workspace.consultant_user.id,
            'linked_test_result_id': workspace.linked_test_result_id,
            'created_at': workspace.created_at,
            'sealed_at': workspace.sealed_at,
            'can_edit': workspace.can_edit(),
            'artifact': {
                'id': str(artifact.id),
                'content': artifact.content,
                'is_sealed': artifact.is_sealed,
                'updated_at': artifact.updated_at
            } if artifact else None
        }
