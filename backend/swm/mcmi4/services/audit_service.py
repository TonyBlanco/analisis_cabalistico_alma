"""
AuditService - Immutable audit logging.

All workspace actions are logged for compliance and traceability.
"""

from django.contrib.auth import get_user_model
from swm.mcmi4.models import (
    WorkspaceInstance,
    WorkspaceSession,
    WorkspaceAuditLog
)
from typing import Dict, Any, Optional

User = get_user_model()


class AuditService:
    """Service for audit logging."""
    
    @staticmethod
    def log_action(
        workspace_instance: WorkspaceInstance,
        user: User,
        action: str,
        details: Dict[str, Any],
        session: Optional[WorkspaceSession] = None,
        request_context: Optional[Dict] = None
    ) -> WorkspaceAuditLog:
        """
        Log an action in the workspace.
        
        Args:
            workspace_instance: The workspace
            user: User performing the action
            action: Action name (e.g., 'workspace_created', 'session_started')
            details: JSON dict with action details
            session: Optional session if action is session-scoped
            request_context: Optional dict with ip_address, user_agent, etc.
        
        Returns:
            Created WorkspaceAuditLog entry (immutable).
        """
        ip_address = None
        if request_context and 'ip_address' in request_context:
            ip_address = request_context['ip_address']
        
        audit_log = WorkspaceAuditLog.objects.create(
            workspace_instance=workspace_instance,
            session=session,
            user=user,
            action=action,
            details=details,
            ip_address=ip_address
        )
        
        return audit_log
    
    @staticmethod
    def get_workspace_audit_trail(
        workspace_instance: WorkspaceInstance,
        limit: Optional[int] = None
    ) -> list:
        """
        Get audit trail for workspace.
        
        Returns list of audit logs ordered by timestamp DESC.
        """
        qs = WorkspaceAuditLog.objects.filter(
            workspace_instance=workspace_instance
        ).order_by('-timestamp')
        
        if limit:
            qs = qs[:limit]
        
        return list(qs.values(
            'id', 'action', 'timestamp', 'user_id', 'session_id', 'details'
        ))
    
    @staticmethod
    def get_session_audit_trail(
        session: WorkspaceSession,
        limit: Optional[int] = None
    ) -> list:
        """Get audit trail for specific session."""
        qs = WorkspaceAuditLog.objects.filter(
            session=session
        ).order_by('-timestamp')
        
        if limit:
            qs = qs[:limit]
        
        return list(qs.values(
            'id', 'action', 'timestamp', 'user_id', 'details'
        ))
