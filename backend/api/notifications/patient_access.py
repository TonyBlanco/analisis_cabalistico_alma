"""
Enlaces firmados y mensajes de bienvenida para consultantes.
"""
from __future__ import annotations

import secrets
from datetime import datetime as dt

from django.conf import settings
from django.core.signing import BadSignature, SignatureExpired, TimestampSigner

from .whatsapp import send_whatsapp_text


def generate_temp_password() -> str:
    words = ['Alma', 'Salud', 'Bienestar', 'Crecimiento', 'Armonia', 'Luz', 'Vida']
    symbols = ['!', '@', '#', '$', '%']
    return f'{secrets.choice(words)}{dt.now().year}{secrets.choice(symbols)}'

WELCOME_TOKEN_SALT = 'studios33-patient-welcome'
WELCOME_TOKEN_MAX_AGE = 7 * 24 * 3600  # 7 días


def _signer() -> TimestampSigner:
    return TimestampSigner(salt=WELCOME_TOKEN_SALT)


def build_patient_welcome_token(*, patient_id: int, user_id: int) -> str:
    return _signer().sign(f'{patient_id}:{user_id}')


def parse_patient_welcome_token(token: str) -> tuple[int, int]:
    raw = _signer().unsign(token, max_age=WELCOME_TOKEN_MAX_AGE)
    patient_id_str, user_id_str = raw.split(':', 1)
    return int(patient_id_str), int(user_id_str)


def validate_patient_welcome_token(token: str) -> tuple[int, int] | None:
    try:
        return parse_patient_welcome_token(token)
    except (BadSignature, SignatureExpired, ValueError):
        return None


def build_patient_welcome_url(token: str) -> str:
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://studios33.app').rstrip('/')
    return f'{frontend_url}/welcome/patient?token={token}'


def build_patient_credentials_whatsapp_message(
    *,
    patient_first_name: str,
    therapist_name: str,
    username: str,
    temp_password: str,
    welcome_url: str,
) -> str:
    display_name = (patient_first_name or '').strip() or 'Hola'
    therapist_label = (therapist_name or '').strip() or 'Tu terapeuta'
    return (
        f'Hola {display_name},\n\n'
        f'{therapist_label} te ha dado acceso a Studios33.\n\n'
        f'Usuario: {username}\n'
        f'Contraseña temporal: {temp_password}\n\n'
        f'Entra directamente aquí:\n{welcome_url}\n\n'
        f'Cambia tu contraseña después del primer acceso.'
    )


def send_patient_account_whatsapp(
    *,
    phone: str,
    patient_first_name: str,
    therapist_name: str,
    username: str,
    temp_password: str,
    welcome_token: str,
) -> bool:
    welcome_url = build_patient_welcome_url(welcome_token)
    body = build_patient_credentials_whatsapp_message(
        patient_first_name=patient_first_name,
        therapist_name=therapist_name,
        username=username,
        temp_password=temp_password,
        welcome_url=welcome_url,
    )
    return send_whatsapp_text(to_phone=phone, body=body)


def build_invitation_whatsapp_message(
    *,
    therapist_name: str,
    profession: str,
    welcome_url: str,
    message: str = '',
) -> str:
    therapist_label = (therapist_name or '').strip() or 'Un terapeuta'
    profession_label = (profession or '').strip() or 'Terapeuta'
    extra = f'\n\nMensaje: "{message}"' if message else ''
    return (
        f'Hola,\n\n'
        f'{therapist_label} ({profession_label}) quiere vincularte como consultante en Studios33.{extra}\n\n'
        f'Revisa y acepta la invitación aquí:\n{welcome_url}'
    )


def send_therapist_invitation_whatsapp(
    *,
    phone: str,
    therapist_name: str,
    profession: str,
    dashboard_url: str,
    message: str = '',
) -> bool:
    body = build_invitation_whatsapp_message(
        therapist_name=therapist_name,
        profession=profession,
        welcome_url=dashboard_url,
        message=message,
    )
    return send_whatsapp_text(to_phone=phone, body=body)