"""
Permission guards for MCMI-4 Místico SWM.

Following SWM_MCMI4_PERMISSIONS.md specification.
NO dependencies on TestModule/UserTestAccess permissions.
"""

from rest_framework import permissions
from swm.mcmi4.models import WorkspaceInstance, WorkspacePermission


def has_workspace_permission(user, workspace_instance, required_permission_type):
    """
    Check if user has specific permission on workspace.
    
    Args:
        user: Django User instance
        workspace_instance: WorkspaceInstance instance
        required_permission_type: 'executor', 'observer', 'reviewer', 'admin'
    
    Returns:
        bool: True if user has permission
    
    Follows SWM_MCMI4_PERMISSIONS.md logic:
    - creator_user always has admin (implicit, not revocable)
    - Explicit permissions checked via WorkspacePermission
    - NO role-based or patient-based implicit permissions
    """
    if not user or not user.is_authenticated:
        return False
    
    # Creator has admin implicitly (covers admin, executor, observer, reviewer)
    if workspace_instance.creator_user == user:
        if required_permission_type in ['admin', 'executor', 'observer', 'reviewer']:
            return True
    
    # Check explicit permission
    has_perm = WorkspacePermission.objects.filter(
        workspace_instance=workspace_instance,
        user=user,
        permission_type=required_permission_type,
        is_active=True
    ).exists()
    
    return has_perm


def has_clinical_relationship(therapist_user, subject_user):
    """
    Check if therapist has clinical relationship with subject.
    
    For MVP: simplified check - can be extended to check actual TherapeuticRelationship model.
    Currently allows any therapist to create workspace for any subject (adjust as needed).
    
    Args:
        therapist_user: User creating workspace (must have therapist role)
        subject_user: User whose data is being analyzed
    
    Returns:
        bool: True if relationship exists
    """
    # TODO: Implement actual clinical relationship check
    # For MVP, check if therapist has appropriate role/profile
    
    # Simple check: user must be authenticated and ideally have therapist permissions
    if not therapist_user or not therapist_user.is_authenticated:
        return False
    
    # For MVP: allow if user is staff or superuser (can be refined)
    # In production, check actual TherapeuticRelationship model
    return therapist_user.is_staff or therapist_user.is_superuser


class IsWorkspaceOwnerOrAdmin(permissions.BasePermission):
    """
    Permission class: User must be workspace owner or have admin permission.
    """
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, WorkspaceInstance):
            workspace = obj
        else:
            workspace = getattr(obj, 'workspace_instance', None)
        
        if not workspace:
            return False
        
        return has_workspace_permission(request.user, workspace, 'admin')


class HasWorkspaceExecutorPermission(permissions.BasePermission):
    """
    Permission class: User must have executor permission.
    """
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, WorkspaceInstance):
            workspace = obj
        else:
            workspace = getattr(obj, 'workspace_instance', None)
        
        if not workspace:
            return False
        
        return has_workspace_permission(request.user, workspace, 'executor')


class HasWorkspaceObserverPermission(permissions.BasePermission):
    """
    Permission class: User must have observer permission (or higher).
    """
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, WorkspaceInstance):
            workspace = obj
        else:
            workspace = getattr(obj, 'workspace_instance', None)
        
        if not workspace:
            return False
        
        # Observer, reviewer, or admin can read
        return (
            has_workspace_permission(request.user, workspace, 'observer') or
            has_workspace_permission(request.user, workspace, 'reviewer') or
            has_workspace_permission(request.user, workspace, 'admin')
        )


class HasWorkspaceReviewerPermission(permissions.BasePermission):
    """
    Permission class: User must have reviewer permission.
    """
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, WorkspaceInstance):
            workspace = obj
        else:
            workspace = getattr(obj, 'workspace_instance', None)
        
        if not workspace:
            return False
        
        return has_workspace_permission(request.user, workspace, 'reviewer')
