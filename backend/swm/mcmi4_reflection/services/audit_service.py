"""
AuditService - Immutable audit logging for reflection workspaces.
"""

from django.contrib.auth import get_user_model
from swm.mcmi4_reflection.models import (
    WorkspaceInstance,
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
        request_context: Optional[Dict] = None
    ) -> WorkspaceAuditLog:
        """
        Log an action in the reflection workspace.
        
        Args:
            workspace_instance: The workspace
            user: User performing the action
            action: Action name (e.g., 'created', 'updated', 'sealed')
            details: JSON dict with action details
            request_context: Optional dict with ip_address, etc.
        
        Returns:
            Created WorkspaceAuditLog entry (immutable).
        """
        ip_address = None
        if request_context and 'ip_address' in request_context:
            ip_address = request_context['ip_address']
        
        audit_log = WorkspaceAuditLog.objects.create(
            workspace_instance=workspace_instance,
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
            'id', 'action', 'timestamp', 'user_id', 'details'
        ))
