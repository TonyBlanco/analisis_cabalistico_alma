"""URLs for SHA SWM."""

from django.urls import path
from .views import (
    CreateWorkspaceView,
    ListWorkspacesView,
    WorkspaceStatusView,
    SaveArtifactView,
    ArtifactsView,
    SealWorkspaceView,
    ReviewWorkspaceView,
)

app_name = 'swm_sha'

urlpatterns = [
    path('create', CreateWorkspaceView.as_view(), name='create'),
    path('list', ListWorkspacesView.as_view(), name='list'),
    path('status', WorkspaceStatusView.as_view(), name='status'),
    path('save-artifact', SaveArtifactView.as_view(), name='save-artifact'),
    path('artifacts', ArtifactsView.as_view(), name='artifacts'),
    path('seal', SealWorkspaceView.as_view(), name='seal'),
    path('review', ReviewWorkspaceView.as_view(), name='review'),
]
