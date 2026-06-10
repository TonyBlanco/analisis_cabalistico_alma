# -*- coding: utf-8 -*-
"""
Modelo de persistencia para Astrología (carta natal)
Separado del modelo genérico CabalisticAnalysis para mayor claridad
"""
from django.db import models
from django.contrib.auth.models import User
from django.core.serializers.json import DjangoJSONEncoder
from .models import Patient


class AstrologyNatalChart(models.Model):
    """
    Almacenamiento de carta natal calculada (ruta canónica de escritura).

    KerykeionAnalysisView POST/GET persiste y lee exclusivamente este modelo.
    astrology.NatalChart es legado de lectura para motores core; no escribir en dual.

    Guarda un único cálculo por paciente (el más reciente).
    Estructura: contrato normalizado estable para consumo del frontend.
    """
    # Relaciones
    patient = models.OneToOneField(
        Patient,
        on_delete=models.CASCADE,
        related_name='natal_chart_kerykeion',
        help_text='Paciente al que pertenece esta carta natal'
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='astrology_charts_created',
        help_text='Terapeuta que generó este cálculo'
    )
    
    # Metadatos del cálculo
    calculated_at = models.DateTimeField(
        auto_now_add=True,
        help_text='Timestamp de cuándo se realizó el cálculo'
    )
    house_system = models.CharField(
        max_length=50,
        default='placidus',
        help_text='Sistema de casas usado (placidus, koch, etc.)'
    )
    source = models.CharField(
        max_length=50,
        default='kerykeion',
        help_text='Motor usado para el cálculo (kerykeion, swisseph, etc.)'
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('ok', 'Cálculo exitoso'),
            ('error', 'Error en cálculo')
        ],
        default='ok',
        help_text='Estado del cálculo'
    )
    
    # Payload normalizado (contrato estable)
    chart_payload = models.JSONField(
        encoder=DjangoJSONEncoder,
        help_text='Carta natal en formato normalizado estable'
    )
    
    # Input snapshot (para auditoría y recalculo)
    input_snapshot = models.JSONField(
        encoder=DjangoJSONEncoder,
        null=True,
        blank=True,
        help_text='Snapshot de los datos de entrada usados (fecha/hora/coords del perfil)'
    )
    
    # Error payload (si status = error)
    error_payload = models.JSONField(
        encoder=DjangoJSONEncoder,
        null=True,
        blank=True,
        help_text='Detalle del error si el cálculo falló'
    )
    
    class Meta:
        verbose_name = 'Carta Natal (Astrología)'
        verbose_name_plural = 'Cartas Natales (Astrología)'
        ordering = ['-calculated_at']
        
    def __str__(self):
        return f"Carta Natal de {self.patient.full_name} ({self.calculated_at.strftime('%Y-%m-%d')})"
