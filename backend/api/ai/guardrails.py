"""
Post-LLM guardrails for governed assistance (Phase 2).
No training — output validation only.
"""
from __future__ import annotations

import re
from typing import List, Optional, Tuple

PROHIBITED_DIAGNOSTIC = [
    "trastorno",
    "diagnóstico",
    "diagnostico",
    "dsm-",
    "dsm ",
    "f32",
    "f33",
    "esquizofrenia",
    "bipolar tipo",
    "tlp",
    "toc severo",
    "patología",
    "patologia",
    "necesita curar",
    "depresión endógena",
    "depresion endogena",
    "tiene depresión",
    "tiene depresion",
]

ABSOLUTE_IMPERATIVE = [
    re.compile(r"\bdebes\b", re.I),
    re.compile(r"\btienes que\b", re.I),
    re.compile(r"\bsiempre debes\b", re.I),
    re.compile(r"\bnunca debes\b", re.I),
    re.compile(r"\bsiempre (?:es|será|sera)\b", re.I),
    re.compile(r"\bnunca (?:es|será|sera)\b", re.I),
]


def check_output(text: str) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Returns (ok, violation_code, detail).
    """
    if not text or not str(text).strip():
        return False, "empty_output", "La respuesta está vacía."

    lower = text.lower()
    for term in PROHIBITED_DIAGNOSTIC:
        if term in lower:
            return False, "guardrail_violation", f"Término no permitido: {term}"

    for pattern in ABSOLUTE_IMPERATIVE:
        if pattern.search(text):
            return False, "guardrail_violation", "Imperativo absoluto no permitido."

    return True, None, None