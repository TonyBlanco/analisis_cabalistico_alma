from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0045_resonanciaobservation'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ResonanciaRelation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('context', models.CharField(choices=[('familiar', 'Familiar'), ('relacional', 'Relacional'), ('sistemico', 'Sistémico')], max_length=16)),
                ('from_ref', models.CharField(default='consultante', max_length=64)),
                ('to_label', models.CharField(max_length=160)),
                ('position', models.PositiveSmallIntegerField()),
                ('note', models.CharField(blank=True, default='', max_length=280)),
                ('tags', models.JSONField(blank=True, default=list)),
                ('author', models.ForeignKey(limit_choices_to={'profile__user_type': 'therapist'}, on_delete=django.db.models.deletion.CASCADE, related_name='resonancia_relations', to=settings.AUTH_USER_MODEL)),
                ('subject', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='resonancia_relations', to='api.patient')),
            ],
            options={
                'verbose_name': 'Relación (Resonancia)',
                'verbose_name_plural': 'Relaciones (Resonancia)',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='resonanciarelation',
            index=models.Index(fields=['subject', '-created_at'], name='resrel_subj_created_idx'),
        ),
        migrations.AddIndex(
            model_name='resonanciarelation',
            index=models.Index(fields=['author', '-created_at'], name='resrel_auth_created_idx'),
        ),
        migrations.AddIndex(
            model_name='resonanciarelation',
            index=models.Index(fields=['subject', 'context'], name='resrel_subj_ctx_idx'),
        ),
    ]

