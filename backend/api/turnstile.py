"""Cloudflare Turnstile — config y verificación server-side."""

from __future__ import annotations

import logging

import requests
from decouple import config

logger = logging.getLogger(__name__)

SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'


def _secret_key() -> str:
    return (config('TURNSTILE_SECRET_KEY', default='') or config('TURNSTILE_SECRET', default='')).strip()


def _site_key() -> str:
    return config('TURNSTILE_SITE_KEY', default='').strip()


def turnstile_public_config() -> dict:
    site_key = _site_key()
    secret = _secret_key()
    enabled = bool(site_key and secret)
    enforced = False
    if enabled:
        enforced = config('TURNSTILE_ENFORCED', default='true', cast=bool)
    return {
        'enabled': enabled,
        'enforced': bool(enabled and enforced),
        'site_key': site_key if enabled else None,
    }


def verify_turnstile_token(token: str | None, remote_ip: str | None = None) -> tuple[bool, str]:
    """
    Valida el token del widget. Devuelve (ok, error_code).
    error_code vacío si ok; si no: turnstile_required | turnstile_invalid | turnstile_verify_failed
    """
    cfg = turnstile_public_config()
    if not cfg['enabled']:
        return True, ''
    if not cfg['enforced']:
        return True, ''

    if not token or not str(token).strip():
        return False, 'turnstile_required'

    secret = _secret_key()
    payload = {'secret': secret, 'response': token.strip()}
    if remote_ip:
        payload['remoteip'] = remote_ip

    try:
        resp = requests.post(SITEVERIFY_URL, data=payload, timeout=10)
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as exc:
        logger.warning('Turnstile siteverify request failed: %s', exc)
        return False, 'turnstile_verify_failed'

    if not data.get('success'):
        logger.info('Turnstile rejected token: %s', data.get('error-codes'))
        return False, 'turnstile_invalid'

    return True, ''


TURNSTILE_USER_MESSAGES = {
    'turnstile_required': 'Completa la verificación de seguridad antes de continuar.',
    'turnstile_invalid': 'La verificación de seguridad no es válida. Inténtalo de nuevo.',
    'turnstile_verify_failed': 'No se pudo validar la verificación. Reintenta en unos segundos.',
}


def turnstile_client_ip(request) -> str | None:
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR', '')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def turnstile_check_request(request) -> tuple[bool, str]:
    return verify_turnstile_token(
        request.data.get('turnstile_token'),
        turnstile_client_ip(request),
    )