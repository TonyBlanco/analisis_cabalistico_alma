import uuid

from django.db import models
from django.contrib.auth.models import User

from api.models import Patient


class BioEmotionalDictionaryEntry(models.Model):
    """Entrada de diccionario bio-emocional de solo lectura / referencia.

    No está ligada a pacientes concretos. Sirve como catálogo de términos,
    patrones y descripciones que el terapeuta puede consultar durante el trabajo
    clínico, sin generar conclusiones automáticas.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(max_length=128, unique=True)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=128, blank=True)
    description = models.TextField(blank=True)
    tags = models.CharField(
        max_length=255,
        blank=True,
        help_text="Palabras clave separadas por comas",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Entrada de diccionario bio-emocional"
        verbose_name_plural = "Diccionario bio-emocional"
        ordering = ["category", "title"]

    def __str__(self) -> str:  # pragma: no cover - simple representation
        return f"{self.title} ({self.category})" if self.category else self.title


class GenealogyPerson(models.Model):
    """Persona dentro del árbol transgeneracional de un paciente.

    Está siempre ligada a un `Patient` y, de forma indirecta, a su terapeuta.
    No introduce conclusiones diagnósticas; solo estructura básica y notas.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="genealogy_people",
    )
    # 0 = paciente, -1 = padres, -2 = abuelos, etc.
    generation = models.IntegerField(help_text="0=paciente, -1=padres, -2=abuelos, etc.")
    relation = models.CharField(
        max_length=128,
        help_text="Relación con el paciente (madre, padre, abuelo materno, etc.)",
    )
    name = models.CharField(max_length=255, blank=True)
    birth_year = models.IntegerField(null=True, blank=True)
    death_year = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Persona del árbol transgeneracional"
        verbose_name_plural = "Personas del árbol transgeneracional"
        ordering = ["patient", "generation", "relation"]
        indexes = [
            models.Index(fields=["patient", "generation"]),
        ]

    def __str__(self) -> str:  # pragma: no cover - simple representation
        label = self.name or self.relation
        return f"{label} ({self.patient_id})"


class GenealogyEvent(models.Model):
    """Evento relevante en el sistema familiar de un paciente.

    Puede estar vinculado a una o varias personas del árbol, pero no almacena
    conclusiones ni interpretaciones automáticas.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="genealogy_events",
    )
    title = models.CharField(max_length=255)
    year = models.IntegerField(null=True, blank=True)
    description = models.TextField(blank=True)
    linked_people = models.ManyToManyField(
        GenealogyPerson,
        blank=True,
        related_name="linked_events",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Evento transgeneracional"
        verbose_name_plural = "Eventos transgeneracionales"
        ordering = ["patient", "-year", "title"]
        indexes = [
            models.Index(fields=["patient", "year"]),
        ]

    def __str__(self) -> str:  # pragma: no cover - simple representation
        return f"{self.title} ({self.year or 'año desconocido'})"


class BioTransgenerationalHypothesis(models.Model):
    """Hipótesis terapéutica estructurada sobre patrones transgeneracionales.

    Es un contenedor de trabajo clínico redactado por el terapeuta. No se
    genera automáticamente, no contiene diagnósticos automáticos ni puntuaciones.
    """

    STATUS_CHOICES = [
        ("open", "Abierta"),
        ("in_review", "En revisión"),
        ("discarded", "Descartada"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="bio_hypotheses",
    )
    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="bio_hypotheses",
        help_text="Terapeuta autor de la hipótesis",
    )

    # Campos de dominio exigidos por el contrato
    termino_bioemocional = models.CharField(max_length=255)
    hypothesis_type = models.CharField(max_length=128)
    description = models.TextField(help_text="Hipótesis terapéutica en exploración (no diagnóstico).")
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="open")

    # Referencias de origen (libro, páginas, etc.)
    # Ejemplo: {"book": "Diccionario Bio-Emocional 2016", "pages": [15]}
    source_refs = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Hipótesis bio-transgeneracional"
        verbose_name_plural = "Hipótesis bio-transgeneracionales"
        ordering = ["patient", "-created_at"]
        indexes = [
            models.Index(fields=["patient", "status"]),
        ]

    def __str__(self) -> str:  # pragma: no cover - simple representation
        return f"{self.termino_bioemocional} ({self.get_status_display()})"