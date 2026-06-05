"""Task builders — domain YAML templates (inference only)."""

from __future__ import annotations

from api.ai.prompt_registry import (
    PROMPT_BIOEMOTION_NAME,
    PROMPT_KABBALAH_NAME,
    PROMPT_VERSION_BIOEMOTION_DRAFT,
    PROMPT_VERSION_KABBALAH,
    render_prompt,
)

__all__ = [
    "PROMPT_VERSION_KABBALAH",
    "PROMPT_VERSION_BIOEMOTION_DRAFT",
    "kabbalah_interpret_prompt",
    "bioemotion_synthesis_draft_prompt",
]


def kabbalah_interpret_prompt(
    tree_state_json: str,
    *,
    rag_context: str = "",
    patient_history_summary: str = "",
) -> tuple[str, float, int, str]:
    """Returns (prompt, temperature, max_tokens, prompt_version)."""
    prompt, version, temperature, max_tokens = render_prompt(
        template_name=PROMPT_KABBALAH_NAME,
        lane="symbolic",
        user_task=tree_state_json,
        rag_context=rag_context,
        patient_history_summary=patient_history_summary
        or "(Sin historial adicional — solo estado estructural del Árbol.)",
        consent_scope="kabbalah_interpret",
    )
    return prompt, temperature, max_tokens, version


def bioemotion_synthesis_draft_prompt(
    *,
    patient_context: str,
    current_text: str,
    rag_context: str = "",
) -> tuple[str, float, int, str]:
    """Returns (prompt, temperature, max_tokens, prompt_version)."""
    user_task = current_text.strip() or "(vacío — generar borrador inicial)"
    prompt, version, temperature, max_tokens = render_prompt(
        template_name=PROMPT_BIOEMOTION_NAME,
        lane="clinical_support",
        user_task=user_task,
        rag_context=rag_context,
        patient_history_summary=patient_context
        or "(sin observaciones ni hipótesis previas)",
        consent_scope="bioemotion_draft_assist",
    )
    return prompt, temperature, max_tokens, version