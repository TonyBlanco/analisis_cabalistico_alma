"""
Envío de mensajes WhatsApp vía Meta Cloud API (WhatsApp Business Platform).
"""
from __future__ import annotations

import logging
import re
from typing import Optional

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def normalize_whatsapp_phone(raw: str, default_country_code: str | None = None) -> Optional[str]:
    if default_country_code is None:
        default_country_code = getattr(settings, 'WHATSAPP_DEFAULT_COUNTRY_CODE', '34')
    """Normaliza a dígitos E.164 sin '+' (ej. 34600111222)."""
    if not raw:
        return None
    digits = re.sub(r'\D', '', raw.strip())
    if not digits:
        return None
    if digits.startswith('00'):
        digits = digits[2:]
    if len(digits) == 9 and default_country_code:
        digits = f'{default_country_code}{digits}'
    if len(digits) < 10 or len(digits) > 15:
        return None
    return digits


def is_whatsapp_configured() -> bool:
    return bool(
        getattr(settings, 'WHATSAPP_ENABLED', False)
        and getattr(settings, 'WHATSAPP_ACCESS_TOKEN', '')
        and getattr(settings, 'WHATSAPP_PHONE_NUMBER_ID', '')
    )


def send_whatsapp_text(*, to_phone: str, body: str) -> bool:
    """
    Envía un mensaje de texto por WhatsApp Cloud API.
    Devuelve False si no está configurado o si falla el envío (no lanza excepción).
    """
    normalized = normalize_whatsapp_phone(to_phone)
    if not normalized:
        logger.warning('WhatsApp: teléfono inválido (%r)', to_phone)
        return False

    if not is_whatsapp_configured():
        logger.info('WhatsApp no configurado; omitiendo envío a %s', normalized[-4:].rjust(len(normalized), '*'))
        return False

    api_version = getattr(settings, 'WHATSAPP_API_VERSION', 'v21.0')
    phone_number_id = settings.WHATSAPP_PHONE_NUMBER_ID
    url = f'https://graph.facebook.com/{api_version}/{phone_number_id}/messages'
    payload = {
        'messaging_product': 'whatsapp',
        'recipient_type': 'individual',
        'to': normalized,
        'type': 'text',
        'text': {'preview_url': True, 'body': body[:4096]},
    }
    headers = {
        'Authorization': f'Bearer {settings.WHATSAPP_ACCESS_TOKEN}',
        'Content-Type': 'application/json',
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        if response.status_code >= 400:
            logger.error(
                'WhatsApp API error %s: %s',
                response.status_code,
                response.text[:500],
            )
            return False
        return True
    except requests.RequestException as exc:
        logger.error('WhatsApp request failed: %s', exc)
        return False