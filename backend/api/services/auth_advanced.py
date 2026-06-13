from __future__ import annotations

import hashlib
import secrets
import string
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework.authtoken.models import Token

from api.emails import send_magic_link_email, send_otp_email, send_password_changed_email
from api.models_auth_advanced import AuthOneTimeCode, PasskeyCredential, WebAuthnChallenge

UserModel = get_user_model()

OTP_TTL_MINUTES = 10
MAGIC_LINK_TTL_MINUTES = 15
WEBAUTHN_CHALLENGE_TTL_MINUTES = 5
OTP_RATE_LIMIT = 3
OTP_RATE_WINDOW_MINUTES = 15

GENERIC_EMAIL_MESSAGE = (
    'Si el email existe en nuestra base de datos, recibirás un mensaje en unos minutos.'
)


def _hash_secret(value: str) -> str:
    return hashlib.sha256(value.encode('utf-8')).hexdigest()


def _generate_otp_code() -> str:
    return ''.join(secrets.choice(string.digits) for _ in range(6))


def _generate_magic_token() -> str:
    return secrets.token_urlsafe(32)


def _client_ip(request) -> str | None:
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def _find_user_by_email(email: str):
    return UserModel.objects.filter(email__iexact=email.strip()).first()


def _otp_rate_limited(user) -> bool:
    window_start = timezone.now() - timedelta(minutes=OTP_RATE_WINDOW_MINUTES)
    recent = AuthOneTimeCode.objects.filter(
        user=user,
        created_at__gte=window_start,
    ).count()
    return recent >= OTP_RATE_LIMIT


def _invalidate_active_codes(user, purpose: str) -> None:
    AuthOneTimeCode.objects.filter(
        user=user,
        purpose=purpose,
        consumed_at__isnull=True,
        expires_at__gt=timezone.now(),
    ).update(consumed_at=timezone.now())


def _store_code(*, user, purpose: str, secret: str, request) -> AuthOneTimeCode:
    _invalidate_active_codes(user, purpose)
    return AuthOneTimeCode.objects.create(
        user=user,
        purpose=purpose,
        code_hash=_hash_secret(secret),
        expires_at=timezone.now() + timedelta(minutes=OTP_TTL_MINUTES),
        request_ip=_client_ip(request),
    )


def _verify_code(*, user, purpose: str, secret: str) -> AuthOneTimeCode | None:
    code_hash = _hash_secret(secret)
    record = (
        AuthOneTimeCode.objects.filter(
            user=user,
            purpose=purpose,
            code_hash=code_hash,
            consumed_at__isnull=True,
            expires_at__gt=timezone.now(),
        )
        .order_by('-created_at')
        .first()
    )
    if not record:
        return None
    record.consumed_at = timezone.now()
    record.save(update_fields=['consumed_at'])
    return record


def issue_auth_token(user):
    from api.dashboard_role import dashboard_role_for_user

    token, _ = Token.objects.get_or_create(user=user)
    return {
        'token': token.key,
        'username': user.username,
        'email': user.email,
        'role': dashboard_role_for_user(user),
    }


def request_magic_link(*, email: str, request) -> dict:
    user = _find_user_by_email(email)
    if user and user.is_active and user.email and not _otp_rate_limited(user):
        token = _generate_magic_token()
        _store_code(user=user, purpose=AuthOneTimeCode.PURPOSE_MAGIC_LOGIN, secret=token, request=request)
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        magic_url = f'{frontend_url}/auth/magic?token={token}'
        send_magic_link_email(user, magic_url)
    return {'message': GENERIC_EMAIL_MESSAGE}


def verify_magic_link(*, token: str) -> dict:
    code_hash = _hash_secret(token.strip())
    record = (
        AuthOneTimeCode.objects.select_related('user')
        .filter(
            purpose=AuthOneTimeCode.PURPOSE_MAGIC_LOGIN,
            code_hash=code_hash,
            consumed_at__isnull=True,
            expires_at__gt=timezone.now(),
        )
        .order_by('-created_at')
        .first()
    )
    if not record or not record.user.is_active:
        return {'error': 'invalid_link', 'message': 'El enlace no es válido o ha expirado.'}
    record.consumed_at = timezone.now()
    record.save(update_fields=['consumed_at'])
    return issue_auth_token(record.user)


def request_otp(*, email: str, purpose: str, request) -> dict:
    if purpose not in {
        AuthOneTimeCode.PURPOSE_LOGIN_OTP,
        AuthOneTimeCode.PURPOSE_PASSWORD_RESET,
    }:
        return {'error': 'validation', 'message': 'Propósito OTP no válido.'}

    user = _find_user_by_email(email)
    if user and user.is_active and user.email and not _otp_rate_limited(user):
        code = _generate_otp_code()
        _store_code(user=user, purpose=purpose, secret=code, request=request)
        label = 'inicio de sesión' if purpose == AuthOneTimeCode.PURPOSE_LOGIN_OTP else 'restablecer tu contraseña'
        send_otp_email(user, code, label, OTP_TTL_MINUTES)
    return {'message': GENERIC_EMAIL_MESSAGE}


def verify_login_otp(*, email: str, code: str) -> dict:
    user = _find_user_by_email(email)
    if not user or not user.is_active:
        return {'error': 'invalid_code', 'message': 'Código inválido o expirado.'}
    if not _verify_code(user=user, purpose=AuthOneTimeCode.PURPOSE_LOGIN_OTP, secret=code.strip()):
        return {'error': 'invalid_code', 'message': 'Código inválido o expirado.'}
    return issue_auth_token(user)


def verify_password_reset_otp(*, email: str, code: str, password: str, confirm_password: str | None = None) -> dict:
    confirm = confirm_password or password
    if password != confirm:
        return {'error': 'validation', 'message': 'Las contraseñas no coinciden.'}

    user = _find_user_by_email(email)
    if not user or not user.is_active:
        return {'error': 'invalid_code', 'message': 'Código inválido o expirado.'}
    if not _verify_code(user=user, purpose=AuthOneTimeCode.PURPOSE_PASSWORD_RESET, secret=code.strip()):
        return {'error': 'invalid_code', 'message': 'Código inválido o expirado.'}

    try:
        validate_password(password, user)
    except DjangoValidationError as exc:
        return {'error': 'validation', 'message': ' '.join(exc.messages)}

    user.set_password(password)
    user.save(update_fields=['password'])
    Token.objects.filter(user=user).delete()
    send_password_changed_email(user)
    return {'message': 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.'}


def webauthn_settings() -> dict:
    return {
        'rp_id': getattr(settings, 'WEBAUTHN_RP_ID', 'studios33.app'),
        'rp_name': getattr(settings, 'WEBAUTHN_RP_NAME', 'Studios33'),
        'origin': getattr(settings, 'WEBAUTHN_ORIGIN', getattr(settings, 'FRONTEND_URL', 'https://studios33.app')),
    }


def store_webauthn_challenge(*, challenge: str, purpose: str, options_json: dict, user=None) -> WebAuthnChallenge:
    WebAuthnChallenge.objects.filter(expires_at__lt=timezone.now()).delete()
    return WebAuthnChallenge.objects.create(
        challenge=challenge,
        user=user,
        purpose=purpose,
        options_json=options_json,
        expires_at=timezone.now() + timedelta(minutes=WEBAUTHN_CHALLENGE_TTL_MINUTES),
    )


def pop_webauthn_challenge(challenge: str) -> WebAuthnChallenge | None:
    record = (
        WebAuthnChallenge.objects.select_related('user')
        .filter(challenge=challenge, expires_at__gt=timezone.now())
        .order_by('-created_at')
        .first()
    )
    if not record:
        return None
    record.delete()
    return record


def list_passkeys_for_user(user) -> list[PasskeyCredential]:
    return list(PasskeyCredential.objects.filter(user=user).order_by('-created_at'))