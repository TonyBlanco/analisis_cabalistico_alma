"""
URL patterns for MCMI-4 Reflection SWM.
"""

from django.urls import path
from swm.mcmi4_reflection.views import (
    CreateReflectionView,
    ReflectionWorkspaceView,
    SealReflectionView
)

app_name = 'mcmi4_reflection'

urlpatterns = [
    path('create', CreateReflectionView.as_view(), name='create'),
    path('<uuid:workspace_id>', ReflectionWorkspaceView.as_view(), name='workspace'),
    path('<uuid:workspace_id>/seal', SealReflectionView.as_view(), name='seal'),
]
