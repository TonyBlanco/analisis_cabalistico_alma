from django.contrib.auth.models import User
from django.db import models


class AuthOneTimeCode(models.Model):
    PURPOSE_MAGIC_LOGIN = 'magic_login'
    PURPOSE_PASSWORD_RESET = 'password_reset'
    PURPOSE_LOGIN_OTP = 'login_otp'

    PURPOSE_CHOICES = [
        (PURPOSE_MAGIC_LOGIN, 'Magic link login'),
        (PURPOSE_PASSWORD_RESET, 'Password reset OTP'),
        (PURPOSE_LOGIN_OTP, 'Login OTP'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='auth_codes')
    purpose = models.CharField(max_length=32, choices=PURPOSE_CHOICES)
    code_hash = models.CharField(max_length=128, db_index=True)
    expires_at = models.DateTimeField()
    consumed_at = models.DateTimeField(null=True, blank=True)
    request_ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'purpose', '-created_at']),
        ]

    def __str__(self) -> str:
        return f'{self.purpose} for {self.user_id}'


class PasskeyCredential(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='passkeys')
    credential_id = models.TextField(unique=True)
    public_key = models.TextField()
    sign_count = models.PositiveIntegerField(default=0)
    transports = models.JSONField(default=list, blank=True)
    device_name = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self) -> str:
        label = self.device_name or 'Passkey'
        return f'{label} ({self.user_id})'


class WebAuthnChallenge(models.Model):
    PURPOSE_REGISTRATION = 'registration'
    PURPOSE_AUTHENTICATION = 'authentication'

    PURPOSE_CHOICES = [
        (PURPOSE_REGISTRATION, 'Registration'),
        (PURPOSE_AUTHENTICATION, 'Authentication'),
    ]

    challenge = models.CharField(max_length=128, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='webauthn_challenges')
    purpose = models.CharField(max_length=32, choices=PURPOSE_CHOICES)
    options_json = models.JSONField()
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f'{self.purpose} challenge'