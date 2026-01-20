from django.db import migrations, models
from django.conf import settings
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0068_remove_mcmi4mystictestinstance_mcmi4_mysti_patient_1abe3f_idx'),
    ]

    operations = [
        migrations.CreateModel(
            name='Assignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('test_type', models.CharField(max_length=64)),
                ('questions', models.JSONField(blank=True, default=list)),
                ('questions_hash', models.CharField(blank=True, max_length=128)),
                ('raw_responses', models.JSONField(blank=True, null=True)),
                ('responses_hash', models.CharField(blank=True, max_length=128)),
                ('times_assigned', models.IntegerField(default=1)),
                ('max_reassign', models.IntegerField(default=4)),
                ('status', models.CharField(choices=[('assigned', 'Assigned'), ('in_progress', 'In Progress'), ('pending_compute', 'Pending Compute'), ('completed', 'Completed')], default='assigned', max_length=32)),
                ('locked', models.BooleanField(default=False)),
                ('audit_log', models.JSONField(blank=True, default=list)),
                ('results', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('assigned_by_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assignments_created', to=settings.AUTH_USER_MODEL)),
                ('assigned_to_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assignments_received', to=settings.AUTH_USER_MODEL)),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assignments', to='api.patient')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='assignment',
            index=models.Index(fields=['patient', 'test_type', '-created_at'], name='api_assign_patient_test_created_idx'),
        ),
        migrations.AddIndex(
            model_name='assignment',
            index=models.Index(fields=['assigned_to_user', '-created_at'], name='api_assign_assigned_to_created_idx'),
        ),
    ]
