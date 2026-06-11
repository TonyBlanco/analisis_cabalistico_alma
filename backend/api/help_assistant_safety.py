from __future__ import annotations

import unicodedata
from dataclasses import dataclass
from typing import Dict, List

from api.symbolic_session_safety import validate_safety_for_role


@dataclass(frozen=True)
class ScopeDecision:
    declined: bool
    reason: str = ""
    reply: str = ""


def validateSafetyContent(content: str) -> Dict[str, List[str] | bool]:
    safety = validate_safety_for_role(content or "", role="observational")
    return {
        "passed": bool(safety.get("passed")),
        "warnings": list(safety.get("warnings") or []),
    }


def _normalize_scope_text(query: str) -> str:
    normalized = unicodedata.normalize("NFKD", query or "")
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    return " ".join(ascii_text.strip().lower().split())


def classify_help_scope(query: str) -> ScopeDecision:
    normalized = _normalize_scope_text(query)
    clinical_markers = (
        "diagnost",
        "trastorn",
        "patolog",
        "síntom",
        "sintom",
        "paciente",
        "consultante",
        "terapia",
        "tratamient",
        "psicolog",
        "psiquiat",
        "medicaci",
        "salud mental",
        "historia clínica",
        "historia clinica",
    )
    formative_markers = ("formativa", "formativo")
    interpret_markers = ("interpret", "lectur", "significa", "analiz")
    subject_markers = (
        "resultado",
        "perfil",
        "carta",
        "sesión",
        "sesion",
        "observación",
        "observacion",
        "reporte",
        "informe",
    )

    clinical_hit = any(marker in normalized for marker in clinical_markers)
    formative_hit = any(marker in normalized for marker in formative_markers)
    interpret_hit = any(marker in normalized for marker in interpret_markers)
    subject_hit = any(marker in normalized for marker in subject_markers)

    if clinical_hit or formative_hit or (interpret_hit and subject_hit):
        return ScopeDecision(
            declined=True,
            reason="out_of_scope_clinical_or_formative",
            reply=(
                "No puedo ayudar con interpretación clínica o formativa. "
                "Si necesitas usar la app, pregunta por pantallas, guías, permisos o flujos."
            ),
        )

    return ScopeDecision(declined=False)
