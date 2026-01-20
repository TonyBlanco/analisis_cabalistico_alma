# Generated manually for Federation MVP Phase-1

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0081_phase5_integrity_constraints'),
    ]

    operations = [
        # Add federation consent fields to Patient
        migrations.AddField(
            model_name='patient',
            name='consent_federation',
            field=models.BooleanField(
                default=False,
                help_text='Consentimiento explícito del sujeto para federación de lectura cross-workspace (hubs MSHE/SCDF/SCID-5)'
            ),
        ),
        migrations.AddField(
            model_name='patient',
            name='consent_federation_date',
            field=models.DateTimeField(
                blank=True,
                null=True,
                help_text='Fecha en que se otorgó el consentimiento de federación'
            ),
        ),
        
        # Create FederationAuditLog model
        migrations.CreateModel(
            name='FederationAuditLog',
            fields=[
                ('id', models.UUIDField(
                    default=uuid.uuid4,
                    editable=False,
                    help_text='Identificador único del registro de auditoría',
                    primary_key=True,
                    serialize=False
                )),
                ('timestamp', models.DateTimeField(
                    auto_now_add=True,
                    db_index=True,
                    help_text='Momento exacto de la solicitud de lectura federada'
                )),
                ('federation_hub', models.CharField(
                    choices=[
                        ('MSHE', 'Motor de Síntesis Holística Evaluativa'),
                        ('SCDF', 'Structured Clinical Data Formulation'),
                        ('SCID5', 'SCID-5 Holístico')
                    ],
                    help_text='Hub federado que consumió los datos (MSHE/SCDF/SCID5)',
                    max_length=16
                )),
                ('scope', models.JSONField(
                    help_text='Alcance de la solicitud: {date_range: {start, end}, included_domains: [...]}'
                )),
                ('status', models.CharField(
                    choices=[
                        ('allowed', 'Permitido'),
                        ('denied', 'Denegado')
                    ],
                    default='allowed',
                    help_text='Si la lectura fue permitida o denegada',
                    max_length=16
                )),
                ('records_accessed_count', models.IntegerField(
                    default=0,
                    help_text='Número de AnalysisRecords incluidos en el feed (0 si denegado)'
                )),
                ('denial_reason', models.CharField(
                    blank=True,
                    help_text='Razón de denegación (ej: "no_consent", "no_ownership")',
                    max_length=255
                )),
                ('output_snapshot_id', models.UUIDField(
                    blank=True,
                    help_text='ID del output generado por el hub (si aplica)',
                    null=True
                )),
                ('requested_by_user', models.ForeignKey(
                    help_text='Usuario (terapeuta) que solicitó la lectura federada',
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='federation_audit_requests',
                    to=settings.AUTH_USER_MODEL
                )),
                ('subject_patient', models.ForeignKey(
                    db_index=True,
                    help_text='Paciente/sujeto cuya información fue consultada',
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='federation_audit_logs',
                    to='api.patient'
                )),
            ],
            options={
                'verbose_name': 'Auditoría de Federación',
                'verbose_name_plural': 'Auditorías de Federación',
                'ordering': ['-timestamp'],
            },
        ),
        
        # Add indexes for FederationAuditLog
        migrations.AddIndex(
            model_name='federationauditlog',
            index=models.Index(
                fields=['subject_patient', 'timestamp'],
                name='api_federat_subject_idx'
            ),
        ),
        migrations.AddIndex(
            model_name='federationauditlog',
            index=models.Index(
                fields=['requested_by_user', 'timestamp'],
                name='api_federat_request_idx'
            ),
        ),
        migrations.AddIndex(
            model_name='federationauditlog',
            index=models.Index(
                fields=['federation_hub', 'timestamp'],
                name='api_federat_hub_idx'
            ),
        ),
    ]
