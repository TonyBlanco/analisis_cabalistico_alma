"""
AI Usage Metering — registro de tokens y coste por terapeuta.

Ver docs/01_PROJECT_STATE/AI_USAGE_METERING_IMPLEMENTATION.md
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, Optional

from django.conf import settings
from django.db import models
from django.db.models import Sum
from django.utils import timezone

from api.ai.llm_usage import normalize_token_usage

logger = logging.getLogger(__name__)

# USD per 1M tokens (paid tier reference — snapshot; override via settings if needed)
_DEFAULT_RATES_USD: Dict[str, Dict[str, Decimal]] = {
    'gemini': {
        'gemini-2.5-flash': Decimal('0.15'),
        'gemini-1.5-flash': Decimal('0.15'),
        'default_input': Decimal('0.15'),
        'default_output': Decimal('0.60'),
    },
    'openai': {
        'gpt-4o-mini': Decimal('0.15'),
        'default_input': Decimal('0.15'),
        'default_output': Decimal('0.60'),
    },
    'groq': {
        'default_input': Decimal('0'),
        'default_output': Decimal('0'),
    },
    'ollama': {
        'default_input': Decimal('0'),
        'default_output': Decimal('0'),
    },
}


@dataclass
class UsageContext:
    """Contexto de facturación para una llamada LLM."""

    therapist: Any  # django.contrib.auth.models.User
    task_type: str
    patient_id: Optional[int] = None
    source_type: str = ''
    source_id: str = ''


@dataclass
class UsageRecordInput:
    therapist: Any
    task_type: str
    provider: str
    model: str
    prompt_tokens: int
    completion_tokens: int
    patient_id: Optional[int] = None
    source_type: str = ''
    source_id: str = ''


@dataclass
class QuotaStatus:
    billing_period: str
    included_credit_eur: Decimal
    consumed_eur: Decimal
    remaining_eur: Decimal
    overage_eur: Decimal
    total_tokens: int
    metering_enforced: bool


def is_metering_enabled() -> bool:
    return bool(getattr(settings, 'AI_METERING_ENABLED', True))


def is_metering_enforced() -> bool:
    return bool(getattr(settings, 'AI_METERING_ENFORCED', False))


def get_billing_period(dt: Optional[datetime] = None) -> str:
    dt = dt or timezone.now()
    return dt.strftime('%Y-%m')


def _rate_for(provider: str, model: str, direction: str) -> Decimal:
    provider_rates = _DEFAULT_RATES_USD.get(provider, {})
    if model in provider_rates and direction == 'input':
        return provider_rates[model]
    key = f'default_{direction}'
    return provider_rates.get(key, Decimal('0'))


def estimate_cost_eur(
    provider: str,
    model: str,
    prompt_tokens: int,
    completion_tokens: int,
) -> Decimal:
    eur_usd = Decimal(str(getattr(settings, 'AI_EUR_USD_RATE', '0.92')))
    input_rate = _rate_for(provider, model, 'input')
    output_rate = _rate_for(provider, model, 'output')
    usd = (
        Decimal(prompt_tokens) * input_rate + Decimal(completion_tokens) * output_rate
    ) / Decimal('1000000')
    return (usd * eur_usd).quantize(Decimal('0.0001'))


def record_usage(data: UsageRecordInput):
    """Persiste un evento de uso. Retorna None si metering desactivado."""
    if not is_metering_enabled():
        return None

    from api.models_ai_usage import AIUsageEvent
    from api.models import Patient

    patient = None
    if data.patient_id:
        patient = Patient.objects.filter(id=data.patient_id).first()

    tokens = normalize_token_usage(
        prompt_tokens=data.prompt_tokens,
        completion_tokens=data.completion_tokens,
    )
    cost = estimate_cost_eur(
        data.provider,
        data.model,
        tokens['prompt_tokens'],
        tokens['completion_tokens'],
    )

    try:
        event = AIUsageEvent.objects.create(
            therapist=data.therapist,
            patient=patient,
            task_type=data.task_type,
            provider=data.provider,
            model=data.model,
            prompt_tokens=tokens['prompt_tokens'],
            completion_tokens=tokens['completion_tokens'],
            total_tokens=tokens['total_tokens'],
            estimated_cost_eur=cost,
            billing_period=get_billing_period(),
            source_type=data.source_type or '',
            source_id=str(data.source_id) if data.source_id else '',
        )
        logger.info(
            '[AIUsage] %s therapist=%s tokens=%s cost=%s€',
            data.task_type,
            data.therapist.pk,
            tokens['total_tokens'],
            cost,
        )
        return event
    except Exception as exc:
        logger.error('[AIUsage] failed to record: %s', exc, exc_info=True)
        return None


def record_from_llm_result(
    context: UsageContext,
    result: Dict[str, Any],
    *,
    provider: Optional[str] = None,
    model: Optional[str] = None,
) -> Optional[Any]:
    if not result.get('success'):
        return None
    return record_usage(
        UsageRecordInput(
            therapist=context.therapist,
            task_type=context.task_type,
            provider=provider or result.get('provider') or 'unknown',
            model=model or result.get('model') or '',
            prompt_tokens=int(result.get('prompt_tokens') or 0),
            completion_tokens=int(result.get('completion_tokens') or 0),
            patient_id=context.patient_id,
            source_type=context.source_type,
            source_id=context.source_id,
        )
    )


def get_included_credit_eur() -> Decimal:
    return Decimal(str(getattr(settings, 'AI_DEFAULT_INCLUDED_CREDIT_EUR', '8.00')))


def get_therapist_usage_summary(therapist, billing_period: Optional[str] = None) -> Dict[str, Any]:
    from api.models_ai_usage import AIUsageEvent

    period = billing_period or get_billing_period()
    qs = AIUsageEvent.objects.filter(therapist=therapist, billing_period=period)
    agg = qs.aggregate(
        total_tokens=Sum('total_tokens'),
        consumed_eur=Sum('estimated_cost_eur'),
    )
    total_tokens = int(agg['total_tokens'] or 0)
    consumed = Decimal(str(agg['consumed_eur'] or '0')).quantize(Decimal('0.0001'))
    included = get_included_credit_eur()
    remaining = max(Decimal('0'), included - consumed).quantize(Decimal('0.0001'))
    overage = max(Decimal('0'), consumed - included).quantize(Decimal('0.0001'))

    by_task: Dict[str, Dict[str, Any]] = {}
    for row in qs.values('task_type').annotate(
        count=models.Count('id'),
        cost=Sum('estimated_cost_eur'),
        tokens=Sum('total_tokens'),
    ):
        task = row['task_type']
        by_task[task] = {
            'count': row['count'],
            'cost_eur': str(Decimal(str(row['cost'] or '0')).quantize(Decimal('0.0001'))),
            'tokens': int(row['tokens'] or 0),
        }

    return {
        'billing_period': period,
        'included_credit_eur': str(included),
        'consumed_eur': str(consumed),
        'remaining_eur': str(remaining),
        'overage_eur': str(overage),
        'total_tokens': total_tokens,
        'by_task_type': by_task,
        'metering_enforced': is_metering_enforced(),
        'event_count': qs.count(),
    }