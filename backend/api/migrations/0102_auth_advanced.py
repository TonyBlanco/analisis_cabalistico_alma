from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0101_telegram_notifications'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AuthOneTimeCode',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('purpose', models.CharField(choices=[('magic_login', 'Magic link login'), ('password_reset', 'Password reset OTP'), ('login_otp', 'Login OTP')], max_length=32)),
                ('code_hash', models.CharField(db_index=True, max_length=128)),
                ('expires_at', models.DateTimeField()),
                ('consumed_at', models.DateTimeField(blank=True, null=True)),
                ('request_ip', models.GenericIPAddressField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='auth_codes', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'indexes': [models.Index(fields=['user', 'purpose', '-created_at'], name='api_authoti_user_id_6f0f0a_idx')],
            },
        ),
        migrations.CreateModel(
            name='PasskeyCredential',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('credential_id', models.TextField(unique=True)),
                ('public_key', models.TextField()),
                ('sign_count', models.PositiveIntegerField(default=0)),
                ('transports', models.JSONField(blank=True, default=list)),
                ('device_name', models.CharField(blank=True, max_length=120)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_used_at', models.DateTimeField(blank=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='passkeys', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'indexes': [models.Index(fields=['user', '-created_at'], name='api_passkey_user_id_2f2f8d_idx')],
            },
        ),
        migrations.CreateModel(
            name='WebAuthnChallenge',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('challenge', models.CharField(max_length=128, unique=True)),
                ('purpose', models.CharField(choices=[('registration', 'Registration'), ('authentication', 'Authentication')], max_length=32)),
                ('options_json', models.JSONField()),
                ('expires_at', models.DateTimeField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='webauthn_challenges', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]