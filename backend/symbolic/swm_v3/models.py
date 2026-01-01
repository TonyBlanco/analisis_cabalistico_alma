import uuid

from django.contrib.auth.models import User
from django.core.serializers.json import DjangoJSONEncoder
from django.db import models


class SymbolicReading(models.Model):
    class ConsentMode(models.TextChoices):
        NO_STORE = "no_store", "No store"
        STORE_ANONYMIZED = "store_anonymized", "Store anonymized"
        STORE_WITH_CONSENT = "store_with_consent", "Store with consent"

    class ReadingType(models.TextChoices):
        EDUCATIONAL = "educational", "Educational"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="symbolic_readings",
        help_text="Owner therapist (non-clinical symbolic artifact).",
    )
    consultant = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="symbolic_readings_as_consultant",
        help_text="Optional consultant user (nullable).",
    )

    system_id = models.CharField(max_length=50, help_text="Symbolic system id (e.g. thoth).")
    reading_type = models.CharField(
        max_length=32,
        choices=ReadingType.choices,
        default=ReadingType.EDUCATIONAL,
        help_text="Reading type (Phase 3: educational mock only).",
    )

    content = models.JSONField(encoder=DjangoJSONEncoder, help_text="Serialized reading payload (mock result).")
    consent_mode = models.CharField(max_length=32, choices=ConsentMode.choices)
    consent_version = models.CharField(max_length=64, null=True, blank=True)
    consent_accepted_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    audit_trace = models.JSONField(
        encoder=DjangoJSONEncoder,
        help_text="Audit metadata (swm version, phase, flags, source, disclaimer).",
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Symbolic Reading"
        verbose_name_plural = "Symbolic Readings"

