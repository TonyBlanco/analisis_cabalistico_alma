"""
Tokens cortos y mensajes para vincular usuarios al bot de Telegram.
"""
from __future__ import annotations

import secrets
from datetime import timedelta

from django.utils import timezone

from api.models import TelegramLinkToken

from .telegram import build_telegram_deep_link, get_bot_username, send_telegram_message

LINK_TTL_DAYS = 7


def _new_code() -> str:
    return secrets.token_hex(8)


def create_patient_welcome_telegram_link(
    *,
    user_id: int,
    patient_id: int,
    context: dict | None = None,
) -> tuple[str, str]:
    """Devuelve (start_payload, deep_link_url)."""
    code = _new_code()
    TelegramLinkToken.objects.create(
        code=code,
        purpose='patient_welcome',
        user_id=user_id,
        patient_id=patient_id,
        context=context or {},
        expires_at=timezone.now() + timedelta(days=LINK_TTL_DAYS),
    )
    payload = f'p{code}'
    return payload, build_telegram_deep_link(payload)


def create_user_link_token(*, user_id: int) -> tuple[str, str]:
    code = _new_code()
    TelegramLinkToken.objects.create(
        code=code,
        purpose='user_link',
        user_id=user_id,
        expires_at=timezone.now() + timedelta(days=LINK_TTL_DAYS),
    )
    payload = f'u{code}'
    return payload, build_telegram_deep_link(payload)


def create_invitation_telegram_link(*, user_id: int, invitation_id: int) -> tuple[str, str]:
    code = _new_code()
    TelegramLinkToken.objects.create(
        code=code,
        purpose='invitation',
        user_id=user_id,
        invitation_id=invitation_id,
        expires_at=timezone.now() + timedelta(days=LINK_TTL_DAYS),
    )
    payload = f'i{code}'
    return payload, build_telegram_deep_link(payload)


def resolve_start_payload(start_payload: str) -> TelegramLinkToken | None:
    if not start_payload or len(start_payload) < 2:
        return None
    prefix, code = start_payload[0], start_payload[1:]
    purpose_map = {'p': 'patient_welcome', 'u': 'user_link', 'i': 'invitation'}
    purpose = purpose_map.get(prefix)
    if not purpose or not code:
        return None
    try:
        token = TelegramLinkToken.objects.get(code=code, purpose=purpose)
    except TelegramLinkToken.DoesNotExist:
        return None
    if token.expires_at < timezone.now():
        return None
    return token


def build_patient_welcome_telegram_text(
    *,
    patient_first_name: str,
    therapist_name: str,
    username: str,
    temp_password: str,
    welcome_url: str,
    telegram_link: str,
) -> str:
    name = (patient_first_name or '').strip() or 'Hola'
    therapist = (therapist_name or '').strip() or 'Tu terapeuta'
    lines = [
        f'<b>Studios33</b> — acceso de consultante',
        '',
        f'Hola {name}, {therapist} te ha dado acceso.',
        '',
        f'<b>Usuario:</b> <code>{username}</code>',
        f'<b>Contraseña temporal:</b> <code>{temp_password}</code>',
        '',
        f'<a href="{welcome_url}">Entrar a mi cuenta</a>',
    ]
    if telegram_link and get_bot_username():
        lines.append('')
        lines.append('Guarda este chat para recibir avisos de tu terapeuta.')
    return '\n'.join(lines)


def send_patient_account_telegram(
    *,
    chat_id: int,
    patient_first_name: str,
    therapist_name: str,
    username: str,
    temp_password: str,
    welcome_url: str,
    telegram_link: str = '',
) -> bool:
    text = build_patient_welcome_telegram_text(
        patient_first_name=patient_first_name,
        therapist_name=therapist_name,
        username=username,
        temp_password=temp_password,
        welcome_url=welcome_url,
        telegram_link=telegram_link,
    )
    return send_telegram_message(chat_id=chat_id, text=text)