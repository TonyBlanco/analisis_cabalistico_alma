# SymbolicSessionNote — persistencia de notas/resumen de sesión asistida (Modo Híbrido, Step 7).
# CreateModel portable (Postgres + SQLite). Migración escrita a mano siguiendo el patrón
# de 0058_create_therapistnote.py; si `makemigrations --check` detecta diferencias, regenerar.
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0092_activate_creator_clinical_mode'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='SymbolicSessionNote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('workspace', models.CharField(choices=[('astrology-tarot', 'Astrología · Tarot'), ('cabala-applied', 'Cábala Aplicada'), ('transgenerational', 'Transgeneracional'), ('generic', 'Sesión simbólica')], default='generic', max_length=32)),
                ('role', models.CharField(choices=[('observational', 'Observacional'), ('clinical', 'Clínico verificado')], default='observational', help_text='Rol de seguridad resuelto por Django al guardar la nota.', max_length=16)),
                ('summary', models.TextField(blank=True, default='')),
                ('full_text', models.TextField(blank=True, default='')),
                ('sections', models.JSONField(blank=True, default=list, help_text='Secciones estructuradas (plantilla común + específicas por workspace).')),
                ('safety_warnings', models.JSONField(blank=True, default=list, help_text='Avisos del filtro de seguridad role-aware en el momento de guardar.')),
                ('clinical_vocabulary', models.BooleanField(default=False, help_text='True si la nota se guardó bajo rol clínico verificado.')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='symbolic_session_notes', to='api.patient')),
                ('therapist', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='authored_symbolic_session_notes', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Symbolic Session Note',
                'verbose_name_plural': 'Symbolic Session Notes',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='symbolicsessionnote',
            index=models.Index(fields=['patient', 'created_at'], name='api_symbses_patient_idx'),
        ),
        migrations.AddIndex(
            model_name='symbolicsessionnote',
            index=models.Index(fields=['therapist', 'patient', 'created_at'], name='api_symbses_thera_pat_idx'),
        ),
    ]
