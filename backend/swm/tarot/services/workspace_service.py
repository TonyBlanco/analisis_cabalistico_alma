"""
Workspace Service for SWM Tarot Evolutivo.

Handles workspace instance lifecycle: creation, status transitions,
sealing, and permissions.
"""

from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime

from django.db import transaction
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError, PermissionDenied
from django.utils import timezone

from swm.tarot.models import (
    WorkspaceDefinition,
    WorkspaceInstance,
    WorkspaceArtifact,
    WorkspacePermission,
    WorkspaceStatus,
    PermissionLevel,
    SpreadType,
    TarotSystem,
    ArtifactType,
)
from swm.tarot.services.audit_service import AuditService

User = get_user_model()

# Default workspace definition code
TAROT_EVOLUTIVO_CODE = 'TAROT_EVOLUTIVO'


class WorkspaceService:
    """Service for managing Tarot workspace instances."""
    
    @staticmethod
    def get_definition() -> WorkspaceDefinition:
        """
        Get the Tarot Evolutivo workspace definition.
        
        Returns:
            The WorkspaceDefinition for TAROT_EVOLUTIVO
            
        Raises:
            ValidationError: If definition doesn't exist
        """
        try:
            return WorkspaceDefinition.objects.get(
                code=TAROT_EVOLUTIVO_CODE,
                is_active=True
            )
        except WorkspaceDefinition.DoesNotExist:
            raise ValidationError(
                f"Workspace definition '{TAROT_EVOLUTIVO_CODE}' not found. "
                "Run the seed command to create it."
            )
    
    @staticmethod
    @transaction.atomic
    def create_workspace(
        creator_user: User,
        subject_user: User,
        spread_type: str = SpreadType.FREE,
        tarot_system: str = TarotSystem.RIDER_WAITE,
        has_reversed: bool = True,
        config: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: str = ''
    ) -> WorkspaceInstance:
        """
        Create a new Tarot workspace instance.
        
        Args:
            creator_user: The therapist creating the workspace
            subject_user: The patient the workspace is for
            spread_type: Type of Tarot spread
            tarot_system: Tarot deck system to use
            has_reversed: Whether to use reversed cards
            config: Additional configuration
            ip_address: Client IP for audit
            user_agent: Client user agent for audit
            
        Returns:
            The created WorkspaceInstance
            
        Raises:
            ValidationError: If validation fails
        """
        # Validation: creator != subject
        if creator_user.id == subject_user.id:
            raise ValidationError(
                "Creator and subject must be different users."
            )
        
        # Get definition
        definition = WorkspaceService.get_definition()
        
        # Check for existing in-progress workspace
        existing = WorkspaceInstance.objects.filter(
            definition=definition,
            subject_user=subject_user,
            status__in=[WorkspaceStatus.CREATED, WorkspaceStatus.IN_PROGRESS]
        ).exists()
        
        if existing:
            raise ValidationError(
                f"An active Tarot workspace already exists for this patient. "
                "Please complete or cancel it first."
            )
        
        # Create instance
        instance = WorkspaceInstance.objects.create(
            definition=definition,
            creator_user=creator_user,
            subject_user=subject_user,
            spread_type=spread_type,
            tarot_system=tarot_system,
            has_reversed=has_reversed,
            config=config or {},
            status=WorkspaceStatus.CREATED
        )
        
        # Grant executor permission to creator
        WorkspacePermission.objects.create(
            instance=instance,
            user=creator_user,
            level=PermissionLevel.EXECUTOR,
            granted_by=creator_user
        )
        
        # Audit log
        AuditService.log_action(
            instance=instance,
            action=AuditService.ACTION_WORKSPACE_CREATED,
            user=creator_user,
            details={
                'spread_type': spread_type,
                'tarot_system': tarot_system,
                'has_reversed': has_reversed,
                'subject_user_id': str(subject_user.id)
            },
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return instance
    
    @staticmethod
    def get_instance(instance_id: UUID) -> WorkspaceInstance:
        """
        Get a workspace instance by ID.
        
        Args:
            instance_id: UUID of the instance
            
        Returns:
            The WorkspaceInstance
            
        Raises:
            ValidationError: If not found
        """
        try:
            return WorkspaceInstance.objects.select_related(
                'definition', 'subject_user', 'creator_user'
            ).get(id=instance_id)
        except WorkspaceInstance.DoesNotExist:
            raise ValidationError(f"Workspace instance not found: {instance_id}")
    
    @staticmethod
    def check_permission(
        instance: WorkspaceInstance,
        user: User,
        required_level: str
    ) -> bool:
        """
        Check if user has required permission level.
        
        Args:
            instance: The workspace instance
            user: User to check
            required_level: Required permission level
            
        Returns:
            True if user has permission
        """
        # Admin always has access
        if user.is_staff or user.is_superuser:
            return True
        
        # Creator has executor access
        if instance.creator_user_id == user.id:
            if required_level in [PermissionLevel.EXECUTOR, PermissionLevel.OBSERVER]:
                return True
        
        # Check explicit permissions
        permission = WorkspacePermission.objects.filter(
            instance=instance,
            user=user,
            is_active=True
        ).first()
        
        if not permission:
            return False
        
        # Permission hierarchy
        hierarchy = {
            PermissionLevel.ADMIN: 4,
            PermissionLevel.REVIEWER: 3,
            PermissionLevel.EXECUTOR: 2,
            PermissionLevel.OBSERVER: 1
        }
        
        user_level = hierarchy.get(permission.level, 0)
        required = hierarchy.get(required_level, 0)
        
        return user_level >= required
    
    @staticmethod
    @transaction.atomic
    def transition_status(
        instance: WorkspaceInstance,
        new_status: str,
        user: User,
        ip_address: Optional[str] = None,
        user_agent: str = ''
    ) -> WorkspaceInstance:
        """
        Transition workspace to a new status.
        
        Args:
            instance: The workspace instance
            new_status: Target status
            user: User performing the transition
            ip_address: Client IP for audit
            user_agent: Client user agent for audit
            
        Returns:
            Updated WorkspaceInstance
            
        Raises:
            ValidationError: If transition is not allowed
        """
        # Valid transitions
        valid_transitions = {
            WorkspaceStatus.CREATED: [
                WorkspaceStatus.IN_PROGRESS,
                WorkspaceStatus.CANCELLED
            ],
            WorkspaceStatus.IN_PROGRESS: [
                WorkspaceStatus.SEALED,
                WorkspaceStatus.CANCELLED
            ],
            WorkspaceStatus.SEALED: [
                WorkspaceStatus.REVIEWED
            ],
            WorkspaceStatus.REVIEWED: [
                WorkspaceStatus.ARCHIVED
            ],
            WorkspaceStatus.CANCELLED: [],
            WorkspaceStatus.ARCHIVED: []
        }
        
        current = instance.status
        allowed = valid_transitions.get(current, [])
        
        if new_status not in allowed:
            raise ValidationError(
                f"Invalid status transition: {current} → {new_status}"
            )
        
        # Permission check based on target status
        if new_status == WorkspaceStatus.IN_PROGRESS:
            if not WorkspaceService.check_permission(
                instance, user, PermissionLevel.EXECUTOR
            ):
                raise PermissionDenied("Only executor can start workspace")
            instance.started_at = timezone.now()
            
        elif new_status == WorkspaceStatus.SEALED:
            if not WorkspaceService.check_permission(
                instance, user, PermissionLevel.EXECUTOR
            ):
                raise PermissionDenied("Only executor can seal workspace")
            instance.sealed_at = timezone.now()
            # Seal all artifacts
            instance.artifacts.filter(is_sealed=False).update(
                is_sealed=True,
                sealed_at=timezone.now()
            )
            
        elif new_status == WorkspaceStatus.REVIEWED:
            if not WorkspaceService.check_permission(
                instance, user, PermissionLevel.REVIEWER
            ):
                raise PermissionDenied("Only reviewer can review workspace")
            instance.reviewed_at = timezone.now()
            
        elif new_status == WorkspaceStatus.ARCHIVED:
            if not WorkspaceService.check_permission(
                instance, user, PermissionLevel.ADMIN
            ):
                raise PermissionDenied("Only admin can archive workspace")
            
        elif new_status == WorkspaceStatus.CANCELLED:
            if not WorkspaceService.check_permission(
                instance, user, PermissionLevel.EXECUTOR
            ):
                raise PermissionDenied("Only executor can cancel workspace")
        
        old_status = instance.status
        instance.status = new_status
        instance.save()
        
        # Audit log
        action_map = {
            WorkspaceStatus.IN_PROGRESS: AuditService.ACTION_STATUS_CHANGED,
            WorkspaceStatus.SEALED: AuditService.ACTION_WORKSPACE_SEALED,
            WorkspaceStatus.REVIEWED: AuditService.ACTION_WORKSPACE_REVIEWED,
            WorkspaceStatus.ARCHIVED: AuditService.ACTION_WORKSPACE_ARCHIVED,
            WorkspaceStatus.CANCELLED: AuditService.ACTION_WORKSPACE_CANCELLED,
        }
        
        AuditService.log_action(
            instance=instance,
            action=action_map.get(new_status, AuditService.ACTION_STATUS_CHANGED),
            user=user,
            details={
                'old_status': old_status,
                'new_status': new_status
            },
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return instance
    
    @staticmethod
    def list_workspaces(
        user: User,
        status_filter: Optional[str] = None,
        as_creator: bool = True,
        as_subject: bool = False
    ) -> List[WorkspaceInstance]:
        """
        List workspaces accessible to a user.
        
        Args:
            user: The user querying
            status_filter: Filter by status (optional)
            as_creator: Include workspaces created by user
            as_subject: Include workspaces where user is subject
            
        Returns:
            List of accessible WorkspaceInstance objects
        """
        from django.db.models import Q
        
        filters = Q()
        
        if as_creator:
            filters |= Q(creator_user=user)
        
        if as_subject:
            filters |= Q(subject_user=user)
        
        # Also include workspaces user has explicit permission for
        permission_instances = WorkspacePermission.objects.filter(
            user=user,
            is_active=True
        ).values_list('instance_id', flat=True)
        
        filters |= Q(id__in=permission_instances)
        
        queryset = WorkspaceInstance.objects.filter(filters).select_related(
            'definition', 'subject_user', 'creator_user'
        ).distinct()
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return list(queryset.order_by('-created_at'))
    
    @staticmethod
    @transaction.atomic
    def grant_permission(
        instance: WorkspaceInstance,
        user: User,
        level: str,
        granted_by: User,
        ip_address: Optional[str] = None,
        user_agent: str = ''
    ) -> WorkspacePermission:
        """
        Grant permission to a user for a workspace.
        
        Args:
            instance: The workspace instance
            user: User to grant permission to
            level: Permission level
            granted_by: User granting the permission
            ip_address: Client IP for audit
            user_agent: Client user agent for audit
            
        Returns:
            The created WorkspacePermission
        """
        # Check granter has admin or executor permission
        if not WorkspaceService.check_permission(
            instance, granted_by, PermissionLevel.EXECUTOR
        ):
            raise PermissionDenied("Insufficient permission to grant access")
        
        # Create or reactivate permission
        permission, created = WorkspacePermission.objects.get_or_create(
            instance=instance,
            user=user,
            level=level,
            defaults={
                'granted_by': granted_by,
                'is_active': True
            }
        )
        
        if not created and not permission.is_active:
            permission.is_active = True
            permission.granted_by = granted_by
            permission.revoked_at = None
            permission.revoked_by = None
            permission.save()
        
        # Audit log
        AuditService.log_action(
            instance=instance,
            action=AuditService.ACTION_PERMISSION_GRANTED,
            user=granted_by,
            details={
                'target_user_id': str(user.id),
                'level': level
            },
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return permission
    
    @staticmethod
    @transaction.atomic
    def revoke_permission(
        instance: WorkspaceInstance,
        user: User,
        level: str,
        revoked_by: User,
        ip_address: Optional[str] = None,
        user_agent: str = ''
    ) -> None:
        """
        Revoke a user's permission for a workspace.
        
        Args:
            instance: The workspace instance
            user: User to revoke permission from
            level: Permission level to revoke
            revoked_by: User revoking the permission
            ip_address: Client IP for audit
            user_agent: Client user agent for audit
        """
        # Check revoker has admin or executor permission
        if not WorkspaceService.check_permission(
            instance, revoked_by, PermissionLevel.EXECUTOR
        ):
            raise PermissionDenied("Insufficient permission to revoke access")
        
        try:
            permission = WorkspacePermission.objects.get(
                instance=instance,
                user=user,
                level=level,
                is_active=True
            )
        except WorkspacePermission.DoesNotExist:
            raise ValidationError("Permission not found or already revoked")
        
        permission.is_active = False
        permission.revoked_at = timezone.now()
        permission.revoked_by = revoked_by
        permission.save()
        
        # Audit log
        AuditService.log_action(
            instance=instance,
            action=AuditService.ACTION_PERMISSION_REVOKED,
            user=revoked_by,
            details={
                'target_user_id': str(user.id),
                'level': level
            },
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    @staticmethod
    @transaction.atomic
    def save_spread(
        instance: WorkspaceInstance,
        user: User,
        cards: List[Dict[str, Any]],
        spread_type: Optional[str] = None,
        tarot_system: Optional[str] = None,
        therapist_notes: str = '',
        session_context: str = '',
        ip_address: Optional[str] = None,
        user_agent: str = ''
    ) -> WorkspaceArtifact:
        """
        Save a Tarot spread to the workspace.
        
        Args:
            instance: The workspace instance
            user: User saving the spread
            cards: Array of card data
            spread_type: Type of spread (overrides instance default)
            tarot_system: Tarot system used (overrides instance default)
            therapist_notes: General notes
            session_context: Session context
            ip_address: Client IP for audit
            user_agent: Client user agent for audit
            
        Returns:
            The created WorkspaceArtifact
            
        Raises:
            ValidationError: If workspace is not in progress
            PermissionDenied: If user lacks permission
        """
        # Check status
        if instance.status != WorkspaceStatus.IN_PROGRESS:
            raise ValidationError(
                f"Cannot save spread: workspace status is '{instance.status}'"
            )
        
        # Check permission
        if not WorkspaceService.check_permission(
            instance, user, PermissionLevel.EXECUTOR
        ):
            raise PermissionDenied("Only executor can save spreads")
        
        # Update instance fields if provided
        if spread_type:
            instance.spread_type = spread_type
        if tarot_system:
            instance.tarot_system = tarot_system
        instance.total_cards = len(cards)
        instance.save()
        
        # Create artifact
        content = {
            'spread_type': spread_type or instance.spread_type,
            'tarot_system': tarot_system or instance.tarot_system,
            'cards': cards,
            'therapist_notes': therapist_notes,
            'session_context': session_context,
            'saved_at': datetime.now().isoformat()
        }
        
        # Get active session if any
        active_session = instance.sessions.filter(is_active=True).first()
        
        # Check for existing spread artifact
        existing = instance.artifacts.filter(
            artifact_type=ArtifactType.SPREAD,
            is_sealed=False
        ).first()
        
        if existing:
            # Update existing
            existing.content = content
            existing.version += 1
            existing.save()
            artifact = existing
            action = AuditService.ACTION_ARTIFACT_UPDATED
        else:
            # Create new
            artifact = WorkspaceArtifact.objects.create(
                instance=instance,
                session=active_session,
                artifact_type=ArtifactType.SPREAD,
                content=content,
                created_by=user
            )
            action = AuditService.ACTION_SPREAD_SAVED
        
        # Audit log
        AuditService.log_action(
            instance=instance,
            action=action,
            user=user,
            details={
                'artifact_id': str(artifact.id),
                'card_count': len(cards),
                'spread_type': content['spread_type']
            },
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return artifact
