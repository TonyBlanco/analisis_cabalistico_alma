# -*- coding: utf-8 -*-
"""Ledger de consumo IA por terapeuta (AI Usage Metering — Fase 1)."""
from decimal import Decimal

from django.contrib.auth.models import User
from django.db import models

from .models import Patient


class AIUsageEvent(models.Model):
    """Una fila por llamada LLM exitosa (append-only)."""

    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='ai_usage_events',
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ai_usage_events',
    )
    task_type = models.CharField(max_length=64, db_index=True)
    provider = models.CharField(max_length=32)
    model = models.CharField(max_length=64)
    prompt_tokens = models.PositiveIntegerField(default=0)
    completion_tokens = models.PositiveIntegerField(default=0)
    total_tokens = models.PositiveIntegerField(default=0)
    estimated_cost_eur = models.DecimalField(max_digits=10, decimal_places=4, default=Decimal('0'))
    billing_period = models.CharField(max_length=7, db_index=True)  # YYYY-MM
    source_type = models.CharField(max_length=64, blank=True, default='')
    source_id = models.CharField(max_length=64, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'ai_usage_event'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['therapist', 'billing_period']),
            models.Index(fields=['task_type', 'created_at']),
        ]

    def __str__(self):
        return f'{self.task_type} · {self.therapist_id} · {self.total_tokens} tok'