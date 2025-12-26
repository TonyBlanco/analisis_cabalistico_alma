"""
SWM_72_ANGELS_ENGINE - Modelos de datos canónicos

Módulo autocontenido para gestión de Ángeles de la Cábala.
Solo modelos de datos, sin lógica ni cálculos.
"""

from django.db import models
from django.conf import settings


class Angel(models.Model):
    """
    Modelo canónico para Ángeles de la Cábala (72 Ángeles).

    Representa la información estática de cada ángel sin interpretaciones.
    """

    # ID fijo 1-72 según tradición cabalística
    id = models.PositiveSmallIntegerField(
        primary_key=True,
        choices=[(i, str(i)) for i in range(1, 73)],
        help_text="ID fijo del ángel (1-72) según tradición cabalística"
    )

    # Información básica
    nombre_hebreo = models.CharField(
        max_length=100,
        help_text="Nombre del ángel en hebreo"
    )

    transliteracion = models.CharField(
        max_length=100,
        help_text="Transliteración del nombre hebreo"
    )

    # Referencia bíblica
    versiculo = models.CharField(
        max_length=200,
        help_text="Referencia bíblica asociada al ángel"
    )

    # Ubicación en el Árbol de la Vida
    sefira = models.CharField(
        max_length=50,
        help_text="Sefirá del Árbol de la Vida asociada"
    )

    # Atributos simbólicos (almacenados como JSON para flexibilidad)
    cualidades = models.JSONField(
        default=list,
        help_text="Lista de cualidades simbólicas asociadas"
    )

    correccion = models.JSONField(
        default=list,
        help_text="Aspectos de corrección simbólica"
    )

    sombra = models.JSONField(
        default=list,
        help_text="Aspectos de sombra simbólica"
    )

    # Palabras clave para búsqueda
    keywords = models.JSONField(
        default=list,
        help_text="Palabras clave para consultas y búsquedas"
    )

    class Meta:
        ordering = ['id']
        verbose_name = "Ángel"
        verbose_name_plural = "Ángeles"

    def __str__(self):
        return f"{self.id}. {self.transliteracion} ({self.nombre_hebreo})"


class AngelPeriod(models.Model):
    """
    Modelo para periodos temporales asociados a ángeles.

    Gestiona asignaciones temporales: natal, diaria, semanal, mensual.
    """

    PERIOD_TYPES = [
        ('natal', 'Natal'),
        ('daily', 'Diaria'),
        ('weekly', 'Semanal'),
        ('monthly', 'Mensual'),
    ]

    angel = models.ForeignKey(
        Angel,
        on_delete=models.CASCADE,
        related_name='periods',
        help_text="Ángel asociado al periodo"
    )

    type = models.CharField(
        max_length=20,
        choices=PERIOD_TYPES,
        help_text="Tipo de periodo temporal"
    )

    start_date = models.DateField(
        help_text="Fecha de inicio del periodo"
    )

    end_date = models.DateField(
        help_text="Fecha de fin del periodo"
    )

    weight = models.FloatField(
        default=1.0,
        help_text="Peso o importancia del periodo (0.0-1.0)"
    )

    class Meta:
        ordering = ['start_date', 'type']
        verbose_name = "Periodo Angelical"
        verbose_name_plural = "Periodos Angelicales"
        unique_together = ['angel', 'type', 'start_date']

    def __str__(self):
        return f"{self.angel} - {self.type} ({self.start_date} a {self.end_date})"


class PersonAngelProfile(models.Model):
    """
    Perfil angelical de una persona.

    Vincula personas con sus ángeles asociados sin interpretaciones clínicas.
    """

    person = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='angel_profiles',
        help_text="Persona asociada al perfil angelical"
    )

    birth_date = models.DateField(
        help_text="Fecha de nacimiento para cálculo natal"
    )

    natal_angel = models.ForeignKey(
        Angel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='natal_profiles',
        help_text="Ángel natal calculado"
    )

    secondary_angels = models.ManyToManyField(
        Angel,
        blank=True,
        related_name='secondary_profiles',
        help_text="Ángeles secundarios asociados"
    )

    # Notas descriptivas (no clínicas)
    notes = models.TextField(
        blank=True,
        help_text="Notas descriptivas simbólicas (no clínicas)"
    )

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Perfil Angelical"
        verbose_name_plural = "Perfiles Angelicales"
        unique_together = ['person', 'birth_date']

    def __str__(self):
        return f"Perfil de {self.person} - Ángel natal: {self.natal_angel}"