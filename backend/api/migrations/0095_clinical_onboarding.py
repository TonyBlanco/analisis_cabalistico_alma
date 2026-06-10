# ClinicalModeRequest + BetaFeedback — onboarding beta tester médica (Step 9).
# CreateModel portable (Postgres + SQLite). Migración escrita a mano siguiendo el patrón
# de 0093/0094; si `makemigrations --check` detecta diferencias, regenerar.
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0094_symbolicsessionevent'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ClinicalModeRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('license_number', models.CharField(max_length=120)),
                ('specialty', models.CharField(max_length=160)),
                ('professional_body', models.CharField(blank=True, default='', max_length=160)),
                ('notes', models.TextField(blank=True, default='')),
                ('responsible_use_accepted', models.BooleanField(default=False)),
                ('anti_fraud_rail_accepted', models.BooleanField(default=False)),
                ('status', models.CharField(choices=[('pending', 'Pendiente'), ('approved', 'Aprobada'), ('rejected', 'Rechazada')], default='pending', max_length=16)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('reviewed_at', models.DateTimeField(blank=True, null=True)),
                ('reviewed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='clinical_mode_requests_reviewed', to=settings.AUTH_USER_MODEL)),
                ('therapist', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='clinical_mode_requests', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Clinical Mode Request',
                'verbose_name_plural': 'Clinical Mode Requests',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='BetaFeedback',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(choices=[('ux', 'UX'), ('bug', 'Bug'), ('clinical-copy', 'Copy clínico'), ('false-positive', 'Falso positivo'), ('missing-feature', 'Funcionalidad faltante'), ('other', 'Otro')], default='other', max_length=24)),
                ('severity', models.CharField(choices=[('low', 'Baja'), ('medium', 'Media'), ('high', 'Alta'), ('critical', 'Crítica')], default='low', max_length=12)),
                ('message', models.TextField()),
                ('page_context', models.CharField(blank=True, default='', max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='beta_feedback', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Beta Feedback',
                'verbose_name_plural': 'Beta Feedback',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='clinicalmoderequest',
            index=models.Index(fields=['therapist', 'created_at'], name='api_clinreq_thera_idx'),
        ),
        migrations.AddIndex(
            model_name='clinicalmoderequest',
            index=models.Index(fields=['status', 'created_at'], name='api_clinreq_status_idx'),
        ),
        migrations.AddIndex(
            model_name='betafeedback',
            index=models.Index(fields=['category', 'created_at'], name='api_betafb_cat_idx'),
        ),
        migrations.AddIndex(
            model_name='betafeedback',
            index=models.Index(fields=['severity', 'created_at'], name='api_betafb_sev_idx'),
        ),
    ]
