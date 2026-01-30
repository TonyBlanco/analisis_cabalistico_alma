"""Simplified EAT-26 scoring helpers for wellness tests."""
from __future__ import annotations

from typing import Dict


EAT26_ITEMS: Dict[str, Dict[str, int]] = {
    'q1': {'weight': 3},
    'q2': {'weight': 2},
    'q3': {'weight': 1},
}


def _score_item(value: int, weight: int) -> int:
    adjusted = max(value - 1, 0)
    return adjusted * weight


def score_eat26(responses: Dict[str, int]) -> Dict[str, object]:
    total = 0
    breakdown: Dict[str, int] = {}
    for item, meta in EAT26_ITEMS.items():
        raw_value = int(responses.get(item, 0))
        score = _score_item(raw_value, meta['weight'])
        breakdown[item] = score
        total += score
    risk_level = 'alto' if total >= 20 else 'moderado' if total >= 10 else 'bajo'
    return {
        'total': total,
        'breakdown': breakdown,
        'risk_level': risk_level,
    }


__all__ = ['score_eat26', 'EAT26_ITEMS']
