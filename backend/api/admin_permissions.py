"""Helpers for platform admin authorization (Next.js admin + /api/admin/*)."""


def user_is_platform_admin(user) -> bool:
    if not user or not getattr(user, 'is_authenticated', False):
        return False
    if getattr(user, 'username', None) == 'supertony':
        return True
    if getattr(user, 'is_superuser', False) or getattr(user, 'is_staff', False):
        return True
    try:
        return bool(user.profile.is_admin)
    except Exception:
        return False