"""
Orquestación de notificaciones multi-canal para consultantes.
Telegram es el canal móvil principal; WhatsApp queda opcional (WHATSAPP_ENABLED).
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

from api.emails import send_patient_account_credentials_email
from api.models import UserProfile

from .patient_access import (
    build_patient_welcome_token,
    build_patient_welcome_url,
    send_patient_account_whatsapp,
)
from .telegram import is_telegram_configured
from .telegram_links import (
    create_patient_welcome_telegram_link,
    send_patient_account_telegram,
)
from .whatsapp import is_whatsapp_configured

logger = logging.getLogger(__name__)

DEFAULT_SEND_VIA = ('email',)


@dataclass
class PatientAccessNotificationResult:
    welcome_url: str
    telegram_link: str
    email_sent: bool
    telegram_sent: bool
    whatsapp_sent: bool


def _normalize_send_via(send_via: list[str] | None) -> list[str]:
    if not send_via:
        return list(DEFAULT_SEND_VIA)
    normalized: list[str] = []
    for channel in send_via:
        key = str(channel).strip().lower()
        if key and key not in normalized:
            normalized.append(key)
    return normalized or list(DEFAULT_SEND_VIA)


def notify_patient_account_access(
    *,
    patient_id: int,
    user_id: int,
    patient_email: str,
    patient_phone: str,
    patient_first_name: str,
    username: str,
    temp_password: str,
    therapist_name: str,
    send_via: list[str] | None = None,
) -> PatientAccessNotificationResult:
    channels = _normalize_send_via(send_via)
    welcome_token = build_patient_welcome_token(patient_id=patient_id, user_id=user_id)
    welcome_url = build_patient_welcome_url(welcome_token)

    telegram_link = ''
    if 'telegram' in channels and is_telegram_configured():
        try:
            _start_payload, telegram_link = create_patient_welcome_telegram_link(
                user_id=user_id,
                patient_id=patient_id,
                context={'temp_password': temp_password, 'username': username},
            )
        except Exception:
            logger.exception('No se pudo generar enlace Telegram para patient_id=%s', patient_id)

    email_sent = False
    if 'email' in channels:
        try:
            email_sent = send_patient_account_credentials_email(
                patient_email=patient_email,
                patient_first_name=patient_first_name,
                username=username,
                temp_password=temp_password,
                therapist_name=therapist_name,
                welcome_url=welcome_url,
                telegram_link=telegram_link,
            )
        except Exception:
            logger.exception('Fallo envío email credenciales patient_id=%s', patient_id)
            email_sent = False

    telegram_sent = False
    if 'telegram' in channels and is_telegram_configured():
        try:
            profile = UserProfile.objects.get(user_id=user_id)
            if profile.telegram_chat_id:
                telegram_sent = send_patient_account_telegram(
                    chat_id=profile.telegram_chat_id,
                    patient_first_name=patient_first_name,
                    therapist_name=therapist_name,
                    username=username,
                    temp_password=temp_password,
                    welcome_url=welcome_url,
                    telegram_link=telegram_link,
                )
        except UserProfile.DoesNotExist:
            pass
        except Exception:
            logger.exception('Fallo envío Telegram patient_id=%s', patient_id)

    whatsapp_sent = False
    if 'whatsapp' in channels and patient_phone and is_whatsapp_configured():
        try:
            whatsapp_sent = send_patient_account_whatsapp(
                phone=patient_phone,
                patient_first_name=patient_first_name,
                therapist_name=therapist_name,
                username=username,
                temp_password=temp_password,
                welcome_token=welcome_token,
            )
        except Exception:
            logger.exception('Fallo envío WhatsApp patient_id=%s', patient_id)

    return PatientAccessNotificationResult(
        welcome_url=welcome_url,
        telegram_link=telegram_link,
        email_sent=email_sent,
        telegram_sent=telegram_sent,
        whatsapp_sent=whatsapp_sent,
    )