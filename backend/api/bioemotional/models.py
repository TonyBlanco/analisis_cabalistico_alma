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

    # Resonance Map fields (Rab Armoni)
    SIDE_CHOICES = [
        ("paterno", "Paterno"),
        ("materno", "Materno"),
    ]
    birth_order_number = models.IntegerField(
        null=True, blank=True,
        help_text="Número de orden de nacimiento (cuenta abortos/fallecidos). 1-N.",
    )
    is_deceased = models.BooleanField(default=False, help_text="Persona fallecida.")
    is_abortion = models.BooleanField(
        default=False,
        help_text="Aborto o bebé fallecido. Ocupa su posición numérica en el sistema.",
    )
    side = models.CharField(
        max_length=16, choices=SIDE_CHOICES, null=True, blank=True,
        help_text="Rama paterna o materna (solo aplica a generaciones -1/-2).",
    )

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


class BioEmotionalObservation(models.Model):
    """Observaci¢n cl¡nica del terapeuta, ligada opcionalmente a regi¢n/termino."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="bio_observations",
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="bio_observations",
    )
    region_id = models.CharField(max_length=64, blank=True, null=True)
    dictionary_term_slug = models.CharField(max_length=128, blank=True, null=True)
    note_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Observaci¢n bio-emocional"
        verbose_name_plural = "Observaciones bio-emocionales"
        ordering = ["patient", "-created_at"]
        indexes = [
            models.Index(fields=["patient", "created_at"]),
        ]


class BioEmotionalHypothesis(models.Model):
    """Hip¢tesis bio-emocional redactada por el terapeuta (sin automatismos)."""

    STATUS_CHOICES = [
        ("open", "Abierta"),
        ("in_review", "En revisi¢n"),
        ("discarded", "Descartada"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="bio_emotional_hypotheses",
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="bio_emotional_hypotheses",
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    related_region_id = models.CharField(max_length=64, blank=True, null=True)
    related_dictionary_term = models.CharField(max_length=128, blank=True, null=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="open")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Hip¢tesis bio-emocional"
        verbose_name_plural = "Hip¢tesis bio-emocionales"
        ordering = ["patient", "-updated_at"]
        indexes = [
            models.Index(fields=["patient", "status"]),
        ]


class BioEmotionalSynthesis(models.Model):
    """Sintesis clinica redactada por el terapeuta (sin automatismos)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="bio_emotional_synthesis",
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="bio_emotional_synthesis",
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_closed = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Sintesis bio-emocional"
        verbose_name_plural = "Sintesis bio-emocionales"
        ordering = ["patient", "-created_at"]
        indexes = [
            models.Index(fields=["patient", "is_closed"]),
        ]


class BioEmotionalAssistedDiagnosis(models.Model):
    """Lectura orientativa asistida por IA, validada manualmente por terapeuta."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="bio_emotional_assisted_diagnoses",
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="bio_emotional_assisted_diagnoses",
    )
    content = models.TextField()
    based_on = models.JSONField(default=list, blank=True)
    prompt_version = models.CharField(max_length=64)
    is_validated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Lectura asistida bio-emocional"
        verbose_name_plural = "Lecturas asistidas bio-emocionales"
        ordering = ["patient", "-created_at"]
        indexes = [
            models.Index(fields=["patient", "is_validated"]),
        ]


class BioEmotionalPatientBrief(models.Model):
    """Resumen simplificado para el paciente, publicado por el terapeuta."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="bio_emotional_patient_briefs",
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="bio_emotional_patient_briefs",
    )
    title = models.CharField(max_length=255)
    content = models.TextField()
    sources = models.JSONField(default=list, blank=True)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Resumen bio-emocional para paciente"
        verbose_name_plural = "Resúmenes bio-emocionales para paciente"
        ordering = ["patient", "-updated_at"]
        indexes = [
            models.Index(fields=["patient", "is_published"]),
        ]


class BioEmotionalSession(models.Model):
    """Sesión BioEmotional que representa un encuentro terapeuta-consultante.

    Permite capturar síntomas del consultante antes/durante sesión y registra
    el estado emocional y datos del cuerpo trabajados. Esta es la entidad
    principal para el timeline de sesiones del workspace experiencial.
    """

    EMOTIONAL_STATE_CHOICES = [
        ("better", "Mejor"),
        ("same", "Igual"),
        ("worse", "Peor"),
        ("unknown", "Sin evaluar"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="bio_emotional_sessions",
    )
    therapist = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bio_emotional_sessions_as_therapist",
        help_text="Terapeuta asignado a la sesión",
    )
    date = models.DateTimeField(auto_now_add=True)
    emotional_state = models.CharField(
        max_length=16,
        choices=EMOTIONAL_STATE_CHOICES,
        default="unknown",
    )
    # Campos computados (se actualizan al agregar observaciones/hipótesis)
    observations_count = models.PositiveIntegerField(default=0)
    hypotheses_count = models.PositiveIntegerField(default=0)
    synthesis_completed = models.BooleanField(default=False)
    # Datos del cuerpo (regiones observadas y mapa de calor)
    regions_observed = models.JSONField(
        default=list,
        blank=True,
        help_text="Lista de IDs de regiones corporales observadas",
    )
    heatmap_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Datos de intensidad por región: {region_id: intensity 0-10}",
    )
    # Notas del consultante (capturadas antes/durante sesión)
    patient_notes = models.TextField(
        blank=True,
        help_text="Notas del consultante sobre síntomas y sensaciones",
    )
    patient_feeling_score = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text="Puntuación de cómo se siente el consultante (1-10)",
    )
    patient_discomfort_regions = models.JSONField(
        default=list,
        blank=True,
        help_text="Regiones donde el consultante reporta molestias",
    )
    # Estado de la sesión
    is_closed = models.BooleanField(
        default=False,
        help_text="Indica si la sesión ha sido cerrada",
    )
    closed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Sesión BioEmotional"
        verbose_name_plural = "Sesiones BioEmotionales"
        ordering = ["patient", "-date"]
        indexes = [
            models.Index(fields=["patient", "date"]),
            models.Index(fields=["patient", "is_closed"]),
            models.Index(fields=["therapist", "date"]),
        ]

    def __str__(self) -> str:
        return f"Sesión {self.date.strftime('%Y-%m-%d')} - {self.patient}"

    def update_counts(self) -> None:
        """Actualiza contadores de observaciones e hipótesis desde la BD."""
        from .models import BioEmotionalObservation, BioEmotionalHypothesis

        self.observations_count = BioEmotionalObservation.objects.filter(
            patient=self.patient,
            created_at__gte=self.date,
            created_at__lte=self.closed_at if self.is_closed else None,
        ).count() if self.is_closed else BioEmotionalObservation.objects.filter(
            patient=self.patient,
            created_at__gte=self.date,
        ).count()

        self.hypotheses_count = BioEmotionalHypothesis.objects.filter(
            patient=self.patient,
            created_at__gte=self.date,
        ).count()

        self.save(update_fields=["observations_count", "hypotheses_count", "updated_at"])
