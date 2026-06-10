# Generated manually for AstrologySessionReport

import uuid

import django.core.serializers.json
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0090_align_test_catalog_wiring'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AstrologySessionReport',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('title', models.CharField(max_length=200)),
                ('status', models.CharField(choices=[('draft', 'Borrador'), ('final', 'Final')], default='final', max_length=16)),
                ('visibility', models.CharField(choices=[('therapist', 'Solo terapeuta'), ('patient', 'Solo consultante'), ('both', 'Terapeuta y consultante')], default='therapist', max_length=16)),
                ('is_shared_with_patient', models.BooleanField(default=False)),
                ('shared_at', models.DateTimeField(blank=True, null=True)),
                ('report_payload', models.JSONField(encoder=django.core.serializers.json.DjangoJSONEncoder, help_text='Snapshot estructurado del informe (carta, capas, tablas, interpretaciones)')),
                ('interpretation_ids', models.JSONField(blank=True, default=list, help_text='IDs de AstrologyAIInterpretation incluidos en el informe')),
                ('therapist_notes', models.TextField(blank=True, default='')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='astrology_session_reports_created', to=settings.AUTH_USER_MODEL)),
                ('natal_chart', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='session_reports', to='api.astrologynatalchart')),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='astrology_session_reports', to='api.patient')),
            ],
            options={
                'verbose_name': 'Informe de sesión astrológica',
                'verbose_name_plural': 'Informes de sesión astrológica',
                'db_table': 'astrology_session_report',
                'ordering': ['-created_at'],
                'indexes': [
                    models.Index(fields=['patient', '-created_at'], name='astro_report_patient_idx'),
                    models.Index(fields=['is_shared_with_patient'], name='astro_report_shared_idx'),
                ],
            },
        ),
    ]