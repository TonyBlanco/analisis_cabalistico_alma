"""
URLs for MCMI-4 Místico SWM.

All routes under /api/swm/mcmi4/
"""

from django.urls import path
from swm.mcmi4.views import (
    CreateWorkspaceView,
    ListWorkspacesView,
    WorkspaceStatusView,
    StartSessionView,
    ProgressView,
    SealWorkspaceView,
    ResultsView,
    GrantPermissionView,
    RevokePermissionView,
    AuditTrailView,
    ArtifactsView,
    ReviewWorkspaceView,
    QuestionnaireView,
    QuestionnaireProgressView,
    ProgressActionView,
    SealQuestionnaireView,
    ComputeSymbolicAxesView
)

app_name = 'swm_mcmi4'

urlpatterns = [
    path('create', CreateWorkspaceView.as_view(), name='create'),
    path('list', ListWorkspacesView.as_view(), name='list'),
    path('status', WorkspaceStatusView.as_view(), name='status'),
    path('start', StartSessionView.as_view(), name='start'),
    path('progress', ProgressView.as_view(), name='progress'),  # Legacy endpoint
    path('seal', SealWorkspaceView.as_view(), name='seal'),  # Legacy endpoint
    path('results', ResultsView.as_view(), name='results'),
    path('grant-permission', GrantPermissionView.as_view(), name='grant-permission'),
    path('revoke-permission', RevokePermissionView.as_view(), name='revoke-permission'),
    path('audit', AuditTrailView.as_view(), name='audit'),
    path('artifacts', ArtifactsView.as_view(), name='artifacts'),
    path('review', ReviewWorkspaceView.as_view(), name='review'),
    
    # Questionnaire API (Fase 2)
    path('questionnaire', QuestionnaireView.as_view(), name='questionnaire'),
    path('questionnaire/progress', QuestionnaireProgressView.as_view(), name='questionnaire-progress-get'),
    path('questionnaire/action', ProgressActionView.as_view(), name='questionnaire-action'),
    path('questionnaire/seal', SealQuestionnaireView.as_view(), name='questionnaire-seal'),
    
    # Symbolic Axes
    path('compute-symbolic-axes', ComputeSymbolicAxesView.as_view(), name='compute-symbolic-axes'),
]
