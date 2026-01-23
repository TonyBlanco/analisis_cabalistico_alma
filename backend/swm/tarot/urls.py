"""
URL Configuration for SWM Tarot Evolutivo.

All routes under /api/swm/tarot/
"""

from django.urls import path
from swm.tarot.views import (
    WorkspaceDefinitionView,
    CreateWorkspaceView,
    ListWorkspacesView,
    WorkspaceStatusView,
    StartSessionView,
    SaveSpreadView,
    SealWorkspaceView,
    ReviewWorkspaceView,
    ArtifactsView,
    AuditTrailView,
    GrantPermissionView,
    RevokePermissionView,
)

app_name = 'swm_tarot'

urlpatterns = [
    # Definition
    path('definition', WorkspaceDefinitionView.as_view(), name='definition'),
    
    # Workspace CRUD
    path('create', CreateWorkspaceView.as_view(), name='create'),
    path('list', ListWorkspacesView.as_view(), name='list'),
    path('status', WorkspaceStatusView.as_view(), name='status'),
    
    # Session management
    path('start', StartSessionView.as_view(), name='start'),
    
    # Spread management
    path('save-spread', SaveSpreadView.as_view(), name='save-spread'),
    
    # Lifecycle
    path('seal', SealWorkspaceView.as_view(), name='seal'),
    path('review', ReviewWorkspaceView.as_view(), name='review'),
    
    # Artifacts & Audit
    path('artifacts', ArtifactsView.as_view(), name='artifacts'),
    path('audit', AuditTrailView.as_view(), name='audit'),
    
    # Permissions
    path('grant-permission', GrantPermissionView.as_view(), name='grant-permission'),
    path('revoke-permission', RevokePermissionView.as_view(), name='revoke-permission'),
]
