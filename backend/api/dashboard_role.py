"""Rol efectivo del dashboard Next.js (distinto de is_staff para Django admin)."""
from __future__ import annotations

from django.contrib.auth.models import User

from api.models import USER_TYPE_CHOICES

_VALID = {choice[0] for choice in USER_TYPE_CHOICES}


def dashboard_role_for_user(user: User) -> str:
    """Ruta de inicio: personal | therapist | patient | visitor."""
    profile = getattr(user, 'profile', None)
    if not profile:
        return 'visitor'
    user_type = getattr(profile, 'user_type', None) or 'visitor'
    return user_type if user_type in _VALID else 'visitor'


def can_access_admin_workspace(user: User) -> bool:
    """Panel /dashboard/admin — no confundir con is_staff (Django /admin/)."""
    if user.username == 'supertony' or user.is_superuser:
        return True
    profile = getattr(user, 'profile', None)
    return bool(profile and getattr(profile, 'is_admin', False))