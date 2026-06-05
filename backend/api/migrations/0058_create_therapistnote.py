# PatientMessage — CreateModel portable (Postgres + SQLite)

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0057_update_anxiety_state_trait_wellness'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='PatientMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.CharField(help_text='Texto plano, neutro, no clínico', max_length=1000)),
                ('is_archived', models.BooleanField(default=False)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='patient_messages', to='api.patient')),
                ('therapist', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_patient_messages', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Patient Message',
                'verbose_name_plural': 'Patient Messages',
                'ordering': ['-created_at'],
                'indexes': [
                    models.Index(fields=['patient', 'created_at'], name='api_patient_patient_dc8265_idx'),
                    models.Index(fields=['therapist', 'patient', 'created_at'], name='api_patient_therapi_437f70_idx'),
                ],
            },
        ),
    ]