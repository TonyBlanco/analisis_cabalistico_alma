# Generated for SHA SWM
import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='WorkspaceDefinition',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(default='Auditoría de Armonía Sefirótica', max_length=200)),
                ('code', models.CharField(default='SHA_SEFIROTICA', max_length=50, unique=True)),
                ('version', models.CharField(default='1.0', max_length=20)),
                ('description', models.TextField(blank=True, default='')),
                ('config_schema', models.JSONField(blank=True, default=dict)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'SHA Workspace Definition',
                'verbose_name_plural': 'SHA Workspace Definitions',
                'db_table': 'swm_sha_workspace_definitions',
            },
        ),
        migrations.CreateModel(
            name='WorkspaceInstance',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('status', models.CharField(choices=[('created', 'Created'), ('in_progress', 'In Progress'), ('sealed', 'Sealed'), ('reviewed', 'Reviewed'), ('archived', 'Archived')], default='created', max_length=20)),
                ('config', models.JSONField(blank=True, default=dict)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('started_at', models.DateTimeField(blank=True, null=True)),
                ('sealed_at', models.DateTimeField(blank=True, null=True)),
                ('reviewed_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                ('creator_user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='sha_workspaces_created', to=settings.AUTH_USER_MODEL)),
                ('definition', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='instances', to='sha.workspacedefinition')),
                ('subject_user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='sha_workspaces_as_subject', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'SHA Workspace Instance',
                'verbose_name_plural': 'SHA Workspace Instances',
                'db_table': 'swm_sha_workspace_instances',
            },
        ),
        migrations.CreateModel(
            name='WorkspacePermission',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('permission_type', models.CharField(choices=[('admin', 'Admin'), ('executor', 'Executor'), ('observer', 'Observer'), ('reviewer', 'Reviewer')], max_length=20)),
                ('is_active', models.BooleanField(default=True)),
                ('granted_at', models.DateTimeField(auto_now_add=True)),
                ('granted_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sha_permissions_granted', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sha_workspace_permissions', to=settings.AUTH_USER_MODEL)),
                ('workspace_instance', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='permissions', to='sha.workspaceinstance')),
            ],
            options={
                'verbose_name': 'SHA Workspace Permission',
                'verbose_name_plural': 'SHA Workspace Permissions',
                'db_table': 'swm_sha_workspace_permissions',
            },
        ),
        migrations.CreateModel(
            name='WorkspaceArtifact',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('artifact_type', models.CharField(choices=[('balance_map', 'Mapa de balance sefirotico'), ('therapist_notes', 'Notas del terapeuta'), ('patient_submission', 'Entrada del paciente'), ('consultant_guide', 'Guia para consultante')], max_length=30)),
                ('content', models.JSONField(blank=True, default=dict)),
                ('is_sealed', models.BooleanField(default=False)),
                ('share_with_consultant', models.BooleanField(default=False)),
                ('is_patient_submission', models.BooleanField(default=False)),
                ('version', models.IntegerField(default=1)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('sealed_at', models.DateTimeField(blank=True, null=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='sha_artifacts_created', to=settings.AUTH_USER_MODEL)),
                ('workspace_instance', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='artifacts', to='sha.workspaceinstance')),
            ],
            options={
                'verbose_name': 'SHA Workspace Artifact',
                'verbose_name_plural': 'SHA Workspace Artifacts',
                'db_table': 'swm_sha_workspace_artifacts',
            },
        ),
        migrations.AddIndex(
            model_name='workspaceinstance',
            index=models.Index(fields=['definition', 'status'], name='swm_sha_wo_definit_7d7491_idx'),
        ),
        migrations.AddIndex(
            model_name='workspaceinstance',
            index=models.Index(fields=['subject_user', 'status'], name='swm_sha_wo_subject_4c1c0d_idx'),
        ),
        migrations.AddIndex(
            model_name='workspaceinstance',
            index=models.Index(fields=['creator_user', '-created_at'], name='swm_sha_wo_creator_19b22b_idx'),
        ),
        migrations.AddIndex(
            model_name='workspacepermission',
            index=models.Index(fields=['workspace_instance', 'permission_type'], name='swm_sha_wo_workspa_60cc29_idx'),
        ),
        migrations.AddIndex(
            model_name='workspaceartifact',
            index=models.Index(fields=['workspace_instance', 'artifact_type'], name='swm_sha_wo_workspa_b68541_idx'),
        ),
        migrations.AddIndex(
            model_name='workspaceartifact',
            index=models.Index(fields=['workspace_instance', 'is_patient_submission'], name='swm_sha_wo_workspa_07d45a_idx'),
        ),
    ]
