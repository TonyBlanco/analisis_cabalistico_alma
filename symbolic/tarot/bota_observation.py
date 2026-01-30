"""Minimal BOTA observation builder used by tests.

Provides a simple `build_bota_observation` function returning
an observation dict. Replace with real implementation when available.
"""
from typing import Any, Dict


def build_bota_observation(*args: Any, **kwargs: Any) -> Dict[str, Any]:
    return {'cards': [], 'notes': 'stub'}
