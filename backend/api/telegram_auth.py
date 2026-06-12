"""
Verificación del Telegram Login Widget y alta/sesión de usuario.
https://core.telegram.org/widgets/login#checking-authorization
"""
from __future__ import annotations

import hashlib
import hmac
import secrets
import time
from typing import Any

from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

from .models import UserProfile


def verify_telegram_login_payload(payload: dict[str, Any], *, max_age_seconds: int = 86400) -> tuple[bool, str]:
    bot_token = getattr(settings, 'TELEGRAM_BOT_TOKEN', '').strip()
    if not bot_token:
        return False, 'telegram_not_configured'

    data = {k: v for k, v in payload.items() if k != 'hash' and v is not None}
    received_hash = str(payload.get('hash') or '').strip()
    if not received_hash:
        return False, 'hash_missing'

    try:
        auth_date = int(data.get('auth_date', 0))
    except (TypeError, ValueError):
        return False, 'auth_date_invalid'

    if auth_date <= 0 or time.time() - auth_date > max_age_seconds:
        return False, 'auth_expired'

    check_lines = [f'{key}={data[key]}' for key in sorted(data.keys())]
    check_string = '\n'.join(check_lines)
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    calculated = hmac.new(secret_key, check_string.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(calculated, received_hash):
        return False, 'hash_invalid'

    if 'id' not in data:
        return False, 'id_missing'

    return True, 'ok'


def login_or_register_with_telegram(
    payload: dict[str, Any],
    *,
    registration_intent: str | None = None,
    allow_register: bool = False,
) -> tuple[User, UserProfile, bool]:
    """Devuelve (user, profile, created)."""
    tg_id = int(payload['id'])
    first_name = str(payload.get('first_name') or '').strip()
    last_name = str(payload.get('last_name') or '').strip()
    tg_username = str(payload.get('username') or '').strip()

    profile = UserProfile.objects.filter(telegram_chat_id=tg_id).select_related('user').first()
    if profile:
        user = profile.user
        if not user.is_active:
            raise ValueError('account_inactive')
        updated_fields: list[str] = []
        if first_name and user.first_name != first_name:
            user.first_name = first_name
            updated_fields.append('first_name')
        if last_name and user.last_name != last_name:
            user.last_name = last_name
            updated_fields.append('last_name')
        if updated_fields:
            user.save(update_fields=updated_fields)
        return user, profile, False

    if not allow_register and not registration_intent:
        raise ValueError('telegram_no_account')

    username_base = f'tg_{tg_username}' if tg_username else f'tg_{tg_id}'
    username = username_base[:150]
    suffix = 1
    while User.objects.filter(username=username).exists():
        username = f'{username_base}_{suffix}'[:150]
        suffix += 1

    display_name = f'{first_name} {last_name}'.strip() or (tg_username or f'Usuario {tg_id}')
    email = f'tg{tg_id}@telegram.studios33.app'

    user = User.objects.create_user(
        username=username,
        email=email,
        password=secrets.token_urlsafe(24),
        first_name=first_name,
        last_name=last_name,
    )
    profile = UserProfile.objects.get(user=user)
    profile.telegram_chat_id = tg_id
    profile.full_name = display_name
    profile.user_type = registration_intent if registration_intent in ('therapist', 'personal', 'patient') else 'personal'
    profile.subscription_status = 'trial'
    profile.save(update_fields=['telegram_chat_id', 'full_name', 'user_type', 'subscription_status'])
    return user, profile, True


def issue_auth_token(user: User) -> str:
    token, _ = Token.objects.get_or_create(user=user)
    return token.key