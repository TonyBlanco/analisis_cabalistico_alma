from django.conf import settings
from django.db import migrations
from django.utils import timezone

# Cuenta del admin / terapeuta médico creador de la app.
# Se activa como beta tester con vocabulario clínico verificado.
CREATOR_EMAIL = "luisbl@msn.com"


def activate_clinical_mode_for_creator(apps, schema_editor):
    """Activa el modo clínico para la cuenta del creador.

    Idempotente y seguro: si la cuenta aún no existe en este entorno, no hace
    nada. El rail anti-fraude permanece activo igualmente (es independiente del
    modo clínico).
    """
    UserProfile = apps.get_model('api', 'UserProfile')
    profile = (
        UserProfile.objects
        .select_related('user')
        .filter(user__email__iexact=CREATOR_EMAIL)
        .first()
    )
    if profile is None:
        # La cuenta no existe en este entorno todavía: no-op.
        return

    profile.clinical_mode_requested = True
    profile.clinical_mode_enabled = True
    profile.clinical_credential_verified_at = timezone.now()
    # Auto-verificación: el creador es el admin que valida su propia credencial.
    profile.clinical_credential_verified_by_id = profile.user_id
    # El creador es terapeuta médico; garantizar que el léxico clínico se
    # desbloquee (can_use_clinical_lexicon() exige user_type == 'therapist').
    if profile.user_type != 'therapist':
        profile.user_type = 'therapist'
    profile.save(update_fields=[
        'clinical_mode_requested',
        'clinical_mode_enabled',
        'clinical_credential_verified_at',
        'clinical_credential_verified_by',
        'user_type',
    ])


def revoke_clinical_mode_for_creator(apps, schema_editor):
    """Reverso: revoca el modo clínico de la cuenta del creador.

    No restaura user_type previo (no se conserva el valor anterior).
    """
    UserProfile = apps.get_model('api', 'UserProfile')
    profile = (
        UserProfile.objects
        .select_related('user')
        .filter(user__email__iexact=CREATOR_EMAIL)
        .first()
    )
    if profile is None:
        return
    profile.clinical_mode_enabled = False
    profile.clinical_credential_verified_at = None
    profile.clinical_credential_verified_by = None
    profile.save(update_fields=[
        'clinical_mode_enabled',
        'clinical_credential_verified_at',
        'clinical_credential_verified_by',
    ])


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0091_userprofile_clinical_mode'),
    ]

    operations = [
        migrations.RunPython(
            activate_clinical_mode_for_creator,
            revoke_clinical_mode_for_creator,
        ),
    ]
