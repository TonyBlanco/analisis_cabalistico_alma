# Generated manually — AI Usage Metering Fase 1

from decimal import Decimal

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0095_rename_astro_report_patient_idx_astrology_s_patient_bdb3b5_idx_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='AIUsageEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('task_type', models.CharField(db_index=True, max_length=64)),
                ('provider', models.CharField(max_length=32)),
                ('model', models.CharField(max_length=64)),
                ('prompt_tokens', models.PositiveIntegerField(default=0)),
                ('completion_tokens', models.PositiveIntegerField(default=0)),
                ('total_tokens', models.PositiveIntegerField(default=0)),
                ('estimated_cost_eur', models.DecimalField(decimal_places=4, default=Decimal('0'), max_digits=10)),
                ('billing_period', models.CharField(db_index=True, max_length=7)),
                ('source_type', models.CharField(blank=True, default='', max_length=64)),
                ('source_id', models.CharField(blank=True, default='', max_length=64)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                (
                    'patient',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='ai_usage_events',
                        to='api.patient',
                    ),
                ),
                (
                    'therapist',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='ai_usage_events',
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                'db_table': 'ai_usage_event',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='aiusageevent',
            index=models.Index(fields=['therapist', 'billing_period'], name='ai_usage_th_period_idx'),
        ),
        migrations.AddIndex(
            model_name='aiusageevent',
            index=models.Index(fields=['task_type', 'created_at'], name='ai_usage_task_created_idx'),
        ),
    ]