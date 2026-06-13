import json

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from webauthn import (
    generate_authentication_options,
    generate_registration_options,
    verify_authentication_response,
    verify_registration_response,
)
from webauthn.helpers import base64url_to_bytes, bytes_to_base64url
from webauthn.helpers.options_to_json import options_to_json
from webauthn.helpers.structs import (
    AuthenticatorSelectionCriteria,
    PublicKeyCredentialDescriptor,
    ResidentKeyRequirement,
    UserVerificationRequirement,
)

from api.models_auth_advanced import PasskeyCredential, WebAuthnChallenge
from api.services.auth_advanced import (
    list_passkeys_for_user,
    pop_webauthn_challenge,
    request_magic_link,
    request_otp,
    store_webauthn_challenge,
    verify_login_otp,
    verify_magic_link,
    verify_password_reset_otp,
    webauthn_settings,
)

UserModel = get_user_model()


def _error_response(payload: dict, http_status=status.HTTP_400_BAD_REQUEST):
    return Response(payload, status=http_status)


def _success_from_service(result: dict):
    if result.get('error'):
        code = result.get('error')
        http_status = status.HTTP_400_BAD_REQUEST
        if code == 'invalid_code':
            http_status = status.HTTP_401_UNAUTHORIZED
        return _error_response(result, http_status)
    return Response(result, status=status.HTTP_200_OK)


class MagicLinkRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip()
        if not email:
            return _error_response({'error': 'validation', 'message': 'Ingresa tu email.'})
        return _success_from_service(request_magic_link(email=email, request=request))


class MagicLinkVerifyView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = (request.data.get('token') or '').strip()
        if not token:
            return _error_response({'error': 'validation', 'message': 'Token requerido.'})
        return _success_from_service(verify_magic_link(token=token))


class OtpRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip()
        purpose = (request.data.get('purpose') or '').strip()
        if not email:
            return _error_response({'error': 'validation', 'message': 'Ingresa tu email.'})
        if not purpose:
            return _error_response({'error': 'validation', 'message': 'Propósito requerido.'})
        return _success_from_service(request_otp(email=email, purpose=purpose, request=request))


class OtpVerifyLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip()
        code = (request.data.get('code') or '').strip()
        if not email or not code:
            return _error_response({'error': 'validation', 'message': 'Email y código son requeridos.'})
        return _success_from_service(verify_login_otp(email=email, code=code))


class OtpVerifyPasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip()
        code = (request.data.get('code') or '').strip()
        password = request.data.get('password') or ''
        confirm_password = request.data.get('confirm_password')
        if not email or not code or not password:
            return _error_response({'error': 'validation', 'message': 'Email, código y contraseña son requeridos.'})
        return _success_from_service(
            verify_password_reset_otp(
                email=email,
                code=code,
                password=password,
                confirm_password=confirm_password,
            )
        )


class PasskeyRegisterOptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cfg = webauthn_settings()
        existing = list_passkeys_for_user(request.user)
        exclude = [
            PublicKeyCredentialDescriptor(id=base64url_to_bytes(item.credential_id))
            for item in existing
        ]
        options = generate_registration_options(
            rp_id=cfg['rp_id'],
            rp_name=cfg['rp_name'],
            user_id=str(request.user.pk).encode('utf-8'),
            user_name=request.user.email or request.user.username,
            user_display_name=getattr(getattr(request.user, 'profile', None), 'full_name', None)
            or request.user.username,
            exclude_credentials=exclude,
            authenticator_selection=AuthenticatorSelectionCriteria(
                resident_key=ResidentKeyRequirement.PREFERRED,
                user_verification=UserVerificationRequirement.PREFERRED,
            ),
        )
        challenge = bytes_to_base64url(options.challenge)
        options_json = json.loads(options_to_json(options))
        store_webauthn_challenge(
            challenge=challenge,
            purpose=WebAuthnChallenge.PURPOSE_REGISTRATION,
            options_json=options_json,
            user=request.user,
        )
        return Response({'options': options_json, 'challenge': challenge})


class PasskeyRegisterVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cfg = webauthn_settings()
        credential = request.data.get('credential')
        challenge = (request.data.get('challenge') or '').strip()
        device_name = (request.data.get('device_name') or 'Passkey').strip()[:120]
        if not credential or not challenge:
            return _error_response({'error': 'validation', 'message': 'Credencial y challenge requeridos.'})

        pending = pop_webauthn_challenge(challenge)
        if not pending or pending.purpose != WebAuthnChallenge.PURPOSE_REGISTRATION or pending.user_id != request.user.id:
            return _error_response({'error': 'invalid_challenge', 'message': 'Challenge inválido o expirado.'})

        try:
            verification = verify_registration_response(
                credential=credential,
                expected_challenge=base64url_to_bytes(challenge),
                expected_rp_id=cfg['rp_id'],
                expected_origin=cfg['origin'],
            )
        except Exception:
            return _error_response({'error': 'verification_failed', 'message': 'No se pudo registrar la passkey.'})

        PasskeyCredential.objects.create(
            user=request.user,
            credential_id=bytes_to_base64url(verification.credential_id),
            public_key=bytes_to_base64url(verification.credential_public_key),
            sign_count=verification.sign_count,
            transports=credential.get('response', {}).get('transports', []) if isinstance(credential, dict) else [],
            device_name=device_name,
        )
        return Response({'message': 'Passkey registrada correctamente.', 'device_name': device_name})


class PasskeyLoginOptionsView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        cfg = webauthn_settings()
        email = (request.data.get('email') or '').strip()
        allow_credentials = []
        user = None
        if email:
            user = UserModel.objects.filter(email__iexact=email).first()
            if user:
                allow_credentials = [
                    PublicKeyCredentialDescriptor(id=base64url_to_bytes(item.credential_id))
                    for item in list_passkeys_for_user(user)
                ]

        options = generate_authentication_options(
            rp_id=cfg['rp_id'],
            allow_credentials=allow_credentials or None,
            user_verification=UserVerificationRequirement.PREFERRED,
        )
        challenge = bytes_to_base64url(options.challenge)
        options_json = json.loads(options_to_json(options))
        store_webauthn_challenge(
            challenge=challenge,
            purpose=WebAuthnChallenge.PURPOSE_AUTHENTICATION,
            options_json=options_json,
            user=user,
        )
        return Response({'options': options_json, 'challenge': challenge})


class PasskeyLoginVerifyView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        cfg = webauthn_settings()
        credential = request.data.get('credential')
        challenge = (request.data.get('challenge') or '').strip()
        if not credential or not challenge:
            return _error_response({'error': 'validation', 'message': 'Credencial y challenge requeridos.'})

        pending = pop_webauthn_challenge(challenge)
        if not pending or pending.purpose != WebAuthnChallenge.PURPOSE_AUTHENTICATION:
            return _error_response({'error': 'invalid_challenge', 'message': 'Challenge inválido o expirado.'})

        cred_id = None
        if isinstance(credential, dict):
            cred_id = credential.get('id') or credential.get('rawId')
        if not cred_id:
            return _error_response({'error': 'validation', 'message': 'Credencial inválida.'})

        stored = PasskeyCredential.objects.select_related('user').filter(credential_id=cred_id).first()
        if not stored or not stored.user.is_active:
            return _error_response({'error': 'invalid_credential', 'message': 'Passkey no reconocida.'})

        try:
            verification = verify_authentication_response(
                credential=credential,
                expected_challenge=base64url_to_bytes(challenge),
                expected_rp_id=cfg['rp_id'],
                expected_origin=cfg['origin'],
                credential_public_key=base64url_to_bytes(stored.public_key),
                credential_current_sign_count=stored.sign_count,
            )
        except Exception:
            return _error_response({'error': 'verification_failed', 'message': 'No se pudo verificar la passkey.'})

        stored.sign_count = verification.new_sign_count
        stored.last_used_at = timezone.now()
        stored.save(update_fields=['sign_count', 'last_used_at'])

        from api.dashboard_role import dashboard_role_for_user

        token, _ = Token.objects.get_or_create(user=stored.user)
        return Response(
            {
                'token': token.key,
                'username': stored.user.username,
                'email': stored.user.email,
                'role': dashboard_role_for_user(stored.user),
            }
        )


class PasskeyListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = list_passkeys_for_user(request.user)
        return Response(
            [
                {
                    'id': item.id,
                    'device_name': item.device_name or 'Passkey',
                    'created_at': item.created_at.isoformat(),
                    'last_used_at': item.last_used_at.isoformat() if item.last_used_at else None,
                }
                for item in items
            ]
        )


class PasskeyDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk: int):
        deleted, _ = PasskeyCredential.objects.filter(user=request.user, pk=pk).delete()
        if not deleted:
            return _error_response({'error': 'not_found', 'message': 'Passkey no encontrada.'}, status.HTTP_404_NOT_FOUND)
        return Response({'message': 'Passkey eliminada.'})