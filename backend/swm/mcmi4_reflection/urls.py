"""
URL patterns for MCMI-4 Reflection SWM.
"""

from django.urls import path
from swm.mcmi4_reflection.views import (
    CreateReflectionView,
    ReflectionWorkspaceView,
    SealReflectionView,
    ReflectionBySignalView,
    ReflectionByUserView
)

app_name = 'mcmi4_reflection'

urlpatterns = [
    path('create', CreateReflectionView.as_view(), name='create'),
    path('by-signal/<int:signal_id>', ReflectionBySignalView.as_view(), name='by-signal'),
    path('by-user/<int:user_id>', ReflectionByUserView.as_view(), name='by-user'),
    path('<uuid:workspace_id>', ReflectionWorkspaceView.as_view(), name='workspace'),
    path('<uuid:workspace_id>/seal', SealReflectionView.as_view(), name='seal'),
]
