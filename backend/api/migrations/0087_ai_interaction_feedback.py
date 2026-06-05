import uuid

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0086_extend_interpretation_type_length"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="AIInteractionFeedback",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("feature", models.CharField(db_index=True, max_length=64)),
                ("provider", models.CharField(blank=True, max_length=32)),
                ("prompt_version", models.CharField(blank=True, max_length=64)),
                ("rating", models.PositiveSmallIntegerField()),
                ("correction_text", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "patient",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="ai_interaction_feedback",
                        to="api.patient",
                    ),
                ),
                (
                    "therapist",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="ai_interaction_feedback",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Feedback interacción IA",
                "verbose_name_plural": "Feedback interacciones IA",
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(
                        fields=["feature", "-created_at"],
                        name="api_aiif_feat_created_idx",
                    ),
                    models.Index(
                        fields=["therapist", "-created_at"],
                        name="api_aiif_ther_created_idx",
                    ),
                ],
            },
        ),
    ]