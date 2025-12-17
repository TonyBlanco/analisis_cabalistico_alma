# Generated migration for profile tracking fields

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0029_add_therapist_annotations'),
    ]

    operations = [
        migrations.AddField(
            model_name='userbirthdata',
            name='profile_updated_by_therapist',
            field=models.BooleanField(
                default=False,
                help_text='Indica si el terapeuta actualizó el perfil para corregir datos'
            ),
        ),
        migrations.AddField(
            model_name='userbirthdata',
            name='last_therapist_update',
            field=models.DateTimeField(
                blank=True,
                null=True,
                help_text='Última vez que el terapeuta actualizó el perfil'
            ),
        ),
        migrations.AddField(
            model_name='userbirthdata',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='birth_data_updates',
                to=settings.AUTH_USER_MODEL,
                help_text='Terapeuta que actualizó el perfil'
            ),
        ),
    ]
