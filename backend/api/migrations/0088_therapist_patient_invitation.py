from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0087_ai_interaction_feedback"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="TherapistPatientInvitation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("email", models.EmailField(help_text="Email usado en la búsqueda (auditoría)", max_length=254)),
                ("message", models.TextField(blank=True, help_text="Mensaje opcional del terapeuta")),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending", "Pendiente"),
                            ("accepted", "Aceptada"),
                            ("rejected", "Rechazada"),
                            ("cancelled", "Cancelada"),
                        ],
                        default="pending",
                        max_length=20,
                    ),
                ),
                (
                    "supplemental_birth_date",
                    models.DateField(
                        blank=True,
                        help_text="Fecha de nacimiento indicada por el terapeuta si el perfil del usuario no la tiene",
                        null=True,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("responded_at", models.DateTimeField(blank=True, null=True)),
                (
                    "patient",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="source_invitation",
                        to="api.patient",
                    ),
                ),
                (
                    "target_user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="therapist_invitations_received",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "therapist",
                    models.ForeignKey(
                        limit_choices_to={"profile__user_type": "therapist"},
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="patient_invitations_sent",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Invitación terapeuta–consultante",
                "verbose_name_plural": "Invitaciones terapeuta–consultante",
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="therapistpatientinvitation",
            index=models.Index(fields=["target_user", "status"], name="inv_target_status_idx"),
        ),
        migrations.AddIndex(
            model_name="therapistpatientinvitation",
            index=models.Index(fields=["therapist", "status"], name="inv_therapist_status_idx"),
        ),
        migrations.AddConstraint(
            model_name="therapistpatientinvitation",
            constraint=models.UniqueConstraint(
                condition=models.Q(("status", "pending")),
                fields=("therapist", "target_user"),
                name="unique_pending_invitation_per_therapist_user",
            ),
        ),
    ]