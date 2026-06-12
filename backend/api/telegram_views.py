"""
Webhook y utilidades del bot de Telegram.
"""
from __future__ import annotations

import json
import logging

from django.conf import settings
from django.contrib.auth.models import User
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .dashboard_role import can_access_admin_workspace, dashboard_role_for_user
from .telegram_auth import issue_auth_token, login_or_register_with_telegram, verify_telegram_login_payload

from .models import Patient, TelegramLinkToken, UserProfile
from .notifications.patient_access import build_patient_welcome_token, build_patient_welcome_url
from .notifications.telegram import (
    get_bot_username,
    is_telegram_configured,
    is_telegram_webhook_secured,
    send_telegram_message,
)
from .notifications.telegram_links import (
    create_user_link_token,
    resolve_start_payload,
    send_patient_account_telegram,
)

logger = logging.getLogger(__name__)


def _link_chat_to_user(chat_id: int, user: User) -> None:
    profile = UserProfile.objects.get(user=user)
    profile.telegram_chat_id = chat_id
    profile.save(update_fields=['telegram_chat_id'])


def _handle_start(chat_id: int, start_payload: str) -> None:
    if not start_payload:
        send_telegram_message(
            chat_id=chat_id,
            text=(
                '<b>Studios33</b>\n\n'
                'Puedes entrar con tu cuenta de Telegram en:\n'
                'https://studios33.app/login\n\n'
                'Si tu terapeuta te envió un enlace de activación, ábrelo desde aquí.'
            ),
        )
        return

    token = resolve_start_payload(start_payload)
    if not token:
        send_telegram_message(
            chat_id=chat_id,
            text='Enlace caducado o no válido. Pide a tu terapeuta que reenvíe la invitación.',
        )
        return

    try:
        user = User.objects.get(pk=token.user_id, is_active=True)
    except User.DoesNotExist:
        send_telegram_message(chat_id=chat_id, text='Cuenta no encontrada.')
        return

    _link_chat_to_user(chat_id, user)
    if not token.consumed_at:
        token.consumed_at = timezone.now()
        token.save(update_fields=['consumed_at'])

    if token.purpose == 'patient_welcome' and token.patient_id:
        try:
            patient = Patient.objects.select_related('therapist__profile', 'user').get(
                pk=token.patient_id,
                user_id=user.id,
            )
        except Patient.DoesNotExist:
            send_telegram_message(chat_id=chat_id, text='Ficha de consultante no encontrada.')
            return

        temp_password = (token.context or {}).get('temp_password')
        if not temp_password:
            from .notifications.patient_access import generate_temp_password

            temp_password = generate_temp_password()
            user.set_password(temp_password)
            user.save(update_fields=['password'])

        therapist_name = ''
        if patient.therapist_id:
            tp = getattr(patient.therapist, 'profile', None)
            therapist_name = (
                tp.full_name if tp and tp.full_name
                else patient.therapist.get_full_name() or patient.therapist.username
            )

        welcome_token = build_patient_welcome_token(patient_id=patient.id, user_id=user.id)
        welcome_url = build_patient_welcome_url(welcome_token)

        send_patient_account_telegram(
            chat_id=chat_id,
            patient_first_name=patient.first_name or user.first_name,
            therapist_name=therapist_name,
            username=user.username,
            temp_password=temp_password,
            welcome_url=welcome_url,
        )
        return

    if token.purpose == 'invitation':
        send_telegram_message(
            chat_id=chat_id,
            text=(
                '<b>Studios33</b> — Telegram vinculado.\n\n'
                'Entra en tu panel para aceptar la invitación de tu terapeuta:\n'
                'https://studios33.app/dashboard/personal'
            ),
        )
        return

    send_telegram_message(
        chat_id=chat_id,
        text=(
            '<b>Studios33</b> — Telegram vinculado correctamente.\n\n'
            'Recibirás aquí las notificaciones de tu cuenta.'
        ),
    )


@csrf_exempt
@require_POST
def telegram_webhook(request):
    if not is_telegram_configured():
        return HttpResponse(status=503)

    secret = getattr(settings, 'TELEGRAM_WEBHOOK_SECRET', '').strip()
    if not secret:
        logger.warning('Telegram webhook rechazado: TELEGRAM_WEBHOOK_SECRET no configurado')
        return HttpResponse(status=503)

    header = request.headers.get('X-Telegram-Bot-Api-Secret-Token', '')
    if not header or header != secret:
        return HttpResponse(status=403)

    try:
        payload = json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return HttpResponse(status=400)

    message = payload.get('message') or payload.get('edited_message') or {}
    text = (message.get('text') or '').strip()
    chat = message.get('chat') or {}
    chat_id = chat.get('id')
    if not chat_id or not text:
        return JsonResponse({'ok': True})

    if text.startswith('/start'):
        start_payload = text.split(' ', 1)[1].strip() if ' ' in text else ''
        try:
            _handle_start(int(chat_id), start_payload)
        except Exception:
            logger.exception('Telegram /start handler failed')
    elif text in ('/help', '/ayuda'):
        send_telegram_message(
            chat_id=int(chat_id),
            text='Studios33 — soporte: https://studios33.app',
        )

    return JsonResponse({'ok': True})


class TelegramOAuthConfigView(APIView):
    """GET /api/telegram/config/ — bot username para Telegram Login Widget."""
    permission_classes = [AllowAny]

    def get(self, request):
        username = get_bot_username()
        return Response({
            'enabled': is_telegram_configured() and bool(username),
            'bot_username': username or None,
        })


class TelegramOAuthView(APIView):
    """
    POST /api/login/telegram/ — login/registro con Telegram Login Widget.
    Body: datos devueltos por el widget (id, first_name, hash, auth_date, …).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        if not is_telegram_configured():
            return Response(
                {'error': 'telegram_auth_disabled', 'message': 'Inicio con Telegram no configurado'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        payload = dict(request.data)
        ok, reason = verify_telegram_login_payload(payload)
        if not ok:
            messages = {
                'hash_invalid': 'Datos de Telegram no válidos',
                'auth_expired': 'Sesión de Telegram caducada. Vuelve a intentarlo.',
            }
            return Response(
                {'error': reason, 'message': messages.get(reason, 'No se pudo verificar Telegram')},
                status=status.HTTP_400_BAD_REQUEST,
            )

        intent = (request.data.get('registration_intent') or '').strip().lower() or None
        allow_register = bool(intent)
        try:
            user, profile, created = login_or_register_with_telegram(
                payload,
                registration_intent=intent,
                allow_register=allow_register,
            )
        except ValueError as exc:
            code = str(exc)
            if code == 'account_inactive':
                return Response(
                    {'error': 'account_inactive', 'message': 'Esta cuenta está desactivada'},
                    status=status.HTTP_403_FORBIDDEN,
                )
            if code == 'telegram_no_account':
                return Response(
                    {
                        'error': 'telegram_no_account',
                        'message': (
                            'No hay cuenta vinculada a este Telegram. '
                            'Usa email/contraseña o el enlace de activación de tu terapeuta.'
                        ),
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )
            raise

        token_key = issue_auth_token(user)
        role = dashboard_role_for_user(user)
        return Response({
            'token': token_key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'full_name': profile.full_name,
                'user_type': role,
                'role': role,
                'is_admin': can_access_admin_workspace(user),
                'can_access_admin_workspace': can_access_admin_workspace(user),
            },
            'role': role,
            'created': created,
            'message': 'Login exitoso con Telegram',
        }, status=status.HTTP_200_OK)


class TelegramLinkView(APIView):
    """GET /api/telegram/link/ — enlace para que el usuario autenticado vincule Telegram."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_telegram_configured():
            return Response(
                {'error': 'telegram_not_configured', 'message': 'Telegram no está configurado en el servidor.'},
                status=503,
            )
        _payload, deep_link = create_user_link_token(user_id=request.user.id)
        profile = request.user.profile
        return Response({
            'bot_username': get_bot_username(),
            'deep_link': deep_link,
            'telegram_linked': bool(profile.telegram_chat_id),
        })