# SymbolicSessionEvent — eventos de observabilidad del Modo Híbrido (Step 9 / D6).
# CreateModel portable (Postgres + SQLite). Migración escrita a mano siguiendo el patrón
# de 0093_symbolicsessionnote.py; si `makemigrations --check` detecta diferencias, regenerar.
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0093_symbolicsessionnote'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='SymbolicSessionEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_type', models.CharField(choices=[('session_started', 'Sesión iniciada'), ('interpretation_generated', 'Interpretación generada'), ('interpretation_accepted', 'Interpretación aceptada'), ('exercise_completed', 'Ejercicio completado'), ('anti_fraud_block', 'Bloqueo del rail anti-fraude')], max_length=32)),
                ('workspace', models.CharField(choices=[('astrology-tarot', 'Astrología · Tarot'), ('cabala-applied', 'Cábala Aplicada'), ('transgenerational', 'Transgeneracional'), ('generic', 'Sesión simbólica')], default='generic', max_length=32)),
                ('role', models.CharField(choices=[('observational', 'Observacional'), ('clinical', 'Clínico verificado')], default='observational', help_text='Rol de seguridad resuelto por Django al registrar el evento.', max_length=16)),
                ('metadata', models.JSONField(blank=True, default=dict, help_text='Metadatos agregables y NO PII (p.ej. categoría de término bloqueado).')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('therapist', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='symbolic_session_events', to=settings.AUTH_USER_MODEL)),
                ('patient', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='symbolic_session_events', to='api.patient')),
            ],
            options={
                'verbose_name': 'Symbolic Session Event',
                'verbose_name_plural': 'Symbolic Session Events',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='symbolicsessionevent',
            index=models.Index(fields=['therapist', 'created_at'], name='api_symbevt_thera_idx'),
        ),
        migrations.AddIndex(
            model_name='symbolicsessionevent',
            index=models.Index(fields=['therapist', 'event_type', 'created_at'], name='api_symbevt_thera_type_idx'),
        ),
    ]
