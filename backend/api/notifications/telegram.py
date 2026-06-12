"""
Notificaciones vía Telegram Bot API (canal móvil principal).
"""
from __future__ import annotations

import logging
from typing import Optional

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def is_telegram_configured() -> bool:
    return bool(
        getattr(settings, 'TELEGRAM_ENABLED', False)
        and getattr(settings, 'TELEGRAM_BOT_TOKEN', '')
    )


def get_bot_username() -> str:
    return getattr(settings, 'TELEGRAM_BOT_USERNAME', '').strip().lstrip('@')


def build_telegram_deep_link(start_payload: str) -> str:
    username = get_bot_username()
    if not username:
        return ''
    return f'https://t.me/{username}?start={start_payload}'


def send_telegram_message(*, chat_id: int, text: str, parse_mode: str = 'HTML') -> bool:
    if not is_telegram_configured():
        logger.info('Telegram no configurado; omitiendo envío')
        return False

    url = f'https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage'
    payload = {
        'chat_id': chat_id,
        'text': text[:4096],
        'parse_mode': parse_mode,
        'disable_web_page_preview': False,
    }
    try:
        response = requests.post(url, json=payload, timeout=15)
        if response.status_code >= 400:
            logger.error('Telegram API error status=%s chat_id=%s', response.status_code, chat_id)
            return False
        body = response.json()
        return bool(body.get('ok'))
    except requests.RequestException as exc:
        logger.error('Telegram request failed: %s', exc)
        return False


def register_telegram_webhook() -> tuple[bool, str]:
    """Registra webhook en Telegram (llamar tras deploy con token)."""
    if not is_telegram_configured():
        return False, 'Telegram no configurado'
    webhook_url = getattr(settings, 'TELEGRAM_WEBHOOK_URL', '').strip()
    if not webhook_url:
        return False, 'TELEGRAM_WEBHOOK_URL vacío'

    url = f'https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/setWebhook'
    payload = {'url': webhook_url, 'drop_pending_updates': True}
    secret = getattr(settings, 'TELEGRAM_WEBHOOK_SECRET', '')
    if secret:
        payload['secret_token'] = secret
    try:
        response = requests.post(url, json=payload, timeout=15)
        data = response.json()
        return bool(data.get('ok')), str(data)
    except requests.RequestException as exc:
        return False, str(exc)