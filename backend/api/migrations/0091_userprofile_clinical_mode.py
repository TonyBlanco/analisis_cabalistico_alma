from django.conf import settings
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0090_align_test_catalog_wiring'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='clinical_mode_requested',
            field=models.BooleanField(default=False, help_text='El terapeuta marcó el check de modo clínico en el alta. No habilita nada por sí solo; requiere verificación de credencial por un administrador.'),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='clinical_mode_enabled',
            field=models.BooleanField(default=False, help_text='Modo clínico activo: levanta el bloqueo del léxico clínico (diagnóstico, trastorno, patología…). Solo lo activa un administrador tras verificar la credencial.'),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='clinical_credential_verified_at',
            field=models.DateTimeField(blank=True, null=True, help_text='Fecha de verificación de la credencial profesional que habilita el modo clínico.'),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='clinical_credential_verified_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='clinical_verifications_done', to=settings.AUTH_USER_MODEL, help_text='Administrador que verificó la credencial y activó el modo clínico.'),
        ),
    ]
