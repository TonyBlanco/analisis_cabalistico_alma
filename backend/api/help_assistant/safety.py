"""Safety helpers for the help assistant.

The assistant must stay in product-usage scope and never lift the clinical
lexicon gate.
"""

from __future__ import annotations

import unicodedata
from dataclasses import dataclass
from typing import List

from api.symbolic_session_safety import validate_safety_for_role


@dataclass(frozen=True)
class SafetyOutcome:
    passed: bool
    warnings: List[str]
    reason: str = ""


def _normalize_ascii(text: str) -> str:
    """Normalize to ASCII so accented variants still match markers."""
    normalized = unicodedata.normalize("NFKD", text or "")
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    return " ".join(ascii_text.strip().lower().split())


_CLINICAL_MARKERS = (
    "diagnost",
    "trastorn",
    "patolog",
    "sintom",
    "paciente",
    "consultante",
    "terapia",
    "tratamient",
    "psicolog",
    "psiquiat",
    "medicaci",
    "salud mental",
    "historia clinica",
)

_FORMATIVE_MARKERS = ("formativa", "formativo")

_INTERPRET_MARKERS = ("interpret", "lectur", "significa", "analiz")

_SUBJECT_MARKERS = (
    "resultado",
    "perfil",
    "carta",
    "sesion",
    "observacion",
    "reporte",
    "informe",
)

_DECLINE_REPLY = (
    "No puedo ayudar con interpretación clínica o formativa. "
    "Si necesitas usar la app, pregunta por pantallas, guías, permisos o flujos."
)


def validate_help_scope(query: str) -> SafetyOutcome:
    """Return whether the query is in product-usage scope.

    Uses ASCII normalization so accented variants of clinical/formative terms
    are caught even when the user types without accents (or vice-versa).
    """
    text = (query or "").strip()
    if not text:
        return SafetyOutcome(passed=False, warnings=["empty_query"], reason="empty")

    normalized = _normalize_ascii(text)

    clinical_hit = any(m in normalized for m in _CLINICAL_MARKERS)
    formative_hit = any(m in normalized for m in _FORMATIVE_MARKERS)
    interpret_hit = any(m in normalized for m in _INTERPRET_MARKERS)
    subject_hit = any(m in normalized for m in _SUBJECT_MARKERS)

    if clinical_hit or formative_hit or (interpret_hit and subject_hit):
        return SafetyOutcome(
            passed=False,
            warnings=["out_of_scope_clinical_or_formative"],
            reason="out_of_scope",
        )

    return SafetyOutcome(passed=True, warnings=[])


def validate_help_output(text: str) -> SafetyOutcome:
    """Defense-in-depth output guard — role stays observational, never clinical."""
    validation = validate_safety_for_role(text or "", role="observational")
    return SafetyOutcome(
        passed=bool(validation.get("passed")),
        warnings=list(validation.get("warnings") or []),
    )


def decline_reply() -> str:
    return _DECLINE_REPLY
