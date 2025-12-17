# Generated migration for therapy status fields

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0032_add_profile_tracking_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='patient',
            name='therapy_status',
            field=models.CharField(
                choices=[
                    ('active', 'Activo'),
                    ('paused', 'Pausado'),
                    ('inactive', 'Inactivo'),
                    ('archived', 'Archivado')
                ],
                default='active',
                help_text='Estado actual de la terapia del paciente',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='patient',
            name='pause_reason',
            field=models.TextField(
                blank=True,
                help_text='Motivo de pausa (si therapy_status es paused)'
            ),
        ),
        migrations.AddField(
            model_name='patient',
            name='status_changed_at',
            field=models.DateTimeField(
                blank=True,
                help_text='Última vez que cambió el therapy_status',
                null=True
            ),
        ),
        migrations.AddField(
            model_name='patient',
            name='status_changed_by',
            field=models.ForeignKey(
                blank=True,
                help_text='Terapeuta que cambió el estado',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='patient_status_changes',
                to=settings.AUTH_USER_MODEL
            ),
        ),
    ]
