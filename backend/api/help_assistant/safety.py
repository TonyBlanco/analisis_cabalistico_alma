"""Safety helpers for the help assistant.

The assistant must stay in product-usage scope and never lift the clinical
lexicon gate.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Sequence

from api.symbolic_session_safety import validate_safety_for_role


@dataclass(frozen=True)
class SafetyOutcome:
    passed: bool
    warnings: List[str]


HELP_SCOPE_HINTS: Sequence[str] = (
    'diagnostico',
    'diagnóstico',
    'trastorno',
    'patologia',
    'patología',
    'enfermedad',
    'sintoma',
    'síntoma',
    'consultante',
    'paciente',
    'terapia',
    'tratamiento',
    'interpretacion',
    'interpretación',
    'leerme',
    'leer mi',
    'que tengo',
    'qué tengo',
)


def validate_help_scope(query: str) -> SafetyOutcome:
    """Return whether the query is in product-usage scope."""
    text = (query or '').strip()
    if not text:
        return SafetyOutcome(False, ['empty_query'])

    validation = validate_safety_for_role(text, role='observational')
    warnings = list(validation.get('warnings') or [])
    return SafetyOutcome(bool(validation.get('passed')), warnings)


def validate_help_output(text: str) -> SafetyOutcome:
    """Defense-in-depth output guard for generated answers."""
    validation = validate_safety_for_role(text or '', role='observational')
    return SafetyOutcome(bool(validation.get('passed')), list(validation.get('warnings') or []))


def is_help_request_likely_out_of_scope(query: str) -> bool:
    lowered = (query or '').lower()
    return any(term in lowered for term in HELP_SCOPE_HINTS)
