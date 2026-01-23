"""
Audit Service for SWM Tarot Evolutivo.

Provides immutable logging of all workspace actions for
compliance and debugging purposes.
"""

from typing import Optional, Dict, Any, List
from uuid import UUID

from django.contrib.auth import get_user_model

from swm.tarot.models import WorkspaceInstance, WorkspaceAuditLog

User = get_user_model()


class AuditService:
    """Service for managing audit logs."""
    
    # Standard action names
    ACTION_WORKSPACE_CREATED = 'workspace_created'
    ACTION_SESSION_STARTED = 'session_started'
    ACTION_SESSION_ENDED = 'session_ended'
    ACTION_SPREAD_SAVED = 'spread_saved'
    ACTION_ARTIFACT_CREATED = 'artifact_created'
    ACTION_ARTIFACT_UPDATED = 'artifact_updated'
    ACTION_WORKSPACE_SEALED = 'workspace_sealed'
    ACTION_WORKSPACE_REVIEWED = 'workspace_reviewed'
    ACTION_WORKSPACE_ARCHIVED = 'workspace_archived'
    ACTION_WORKSPACE_CANCELLED = 'workspace_cancelled'
    ACTION_PERMISSION_GRANTED = 'permission_granted'
    ACTION_PERMISSION_REVOKED = 'permission_revoked'
    ACTION_STATUS_CHANGED = 'status_changed'
    
    @staticmethod
    def log_action(
        instance: WorkspaceInstance,
        action: str,
        user: User,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: str = ''
    ) -> WorkspaceAuditLog:
        """
        Create an immutable audit log entry.
        
        Args:
            instance: The workspace instance
            action: Action identifier
            user: User who performed the action
            details: Additional context (optional)
            ip_address: Client IP address (optional)
            user_agent: Client user agent string
            
        Returns:
            The created audit log entry
        """
        return WorkspaceAuditLog.objects.create(
            instance=instance,
            action=action,
            user=user,
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent or ''
        )
    
    @staticmethod
    def get_audit_trail(
        instance_id: UUID,
        action_filter: Optional[str] = None,
        limit: int = 100
    ) -> List[WorkspaceAuditLog]:
        """
        Retrieve the audit trail for a workspace instance.
        
        Args:
            instance_id: UUID of the workspace instance
            action_filter: Filter by action type (optional)
            limit: Maximum entries to return
            
        Returns:
            List of audit log entries, newest first
        """
        queryset = WorkspaceAuditLog.objects.filter(
            instance_id=instance_id
        ).select_related('user').order_by('-timestamp')
        
        if action_filter:
            queryset = queryset.filter(action=action_filter)
        
        return list(queryset[:limit])
    
    @staticmethod
    def get_user_actions(
        user: User,
        action_filter: Optional[str] = None,
        limit: int = 100
    ) -> List[WorkspaceAuditLog]:
        """
        Retrieve all actions performed by a user.
        
        Args:
            user: The user to query
            action_filter: Filter by action type (optional)
            limit: Maximum entries to return
            
        Returns:
            List of audit log entries, newest first
        """
        queryset = WorkspaceAuditLog.objects.filter(
            user=user
        ).select_related('instance').order_by('-timestamp')
        
        if action_filter:
            queryset = queryset.filter(action=action_filter)
        
        return list(queryset[:limit])
