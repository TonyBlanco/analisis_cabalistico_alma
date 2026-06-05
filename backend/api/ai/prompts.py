"""Task builders on top of PlanAI core template (YAML registry)."""

from __future__ import annotations

from api.ai.prompt_registry import (
    PROMPT_VERSION_BIOEMOTION_DRAFT,
    PROMPT_VERSION_KABBALAH,
    render_planai_prompt,
)

__all__ = [
    "PROMPT_VERSION_KABBALAH",
    "PROMPT_VERSION_BIOEMOTION_DRAFT",
    "kabbalah_interpret_prompt",
    "bioemotion_synthesis_draft_prompt",
]


def kabbalah_interpret_prompt(tree_state_json: str, *, rag_context: str = "") -> tuple[str, float, int]:
    user_task = f"""Lane: symbolic (Cábala educativa).

Redacta una interpretación exploratoria del Árbol de la Vida a partir del TreeStructuralState (JSON).
No diagnostiques. Máximo 6 párrafos en español.

TreeStructuralState:
{tree_state_json}
"""
    prompt, _version, temperature, max_tokens = render_planai_prompt(
        lane="symbolic",
        user_task=user_task,
        rag_context=rag_context,
        patient_history_summary="(Lane symbolic: sin historial clínico en este endpoint.)",
        consent_scope="symbolic_interpretation",
    )
    return prompt, temperature, max_tokens


def bioemotion_synthesis_draft_prompt(
    *,
    patient_context: str,
    current_text: str,
    rag_context: str = "",
) -> tuple[str, float, int]:
    user_task = f"""Lane: clinical_support (bioemoción — borrador no publicado).

Genera un BORRADOR de síntesis integradora para que el terapeuta revise y edite.
No cierres el caso ni publiques. Devuelve solo el texto del borrador en español.

Borrador previo del terapeuta:
{current_text or "(vacío)"}
"""
    prompt, _version, temperature, max_tokens = render_planai_prompt(
        lane="clinical_support",
        user_task=user_task,
        rag_context=rag_context,
        patient_history_summary=patient_context,
        consent_scope="bioemotion_draft_assist",
    )
    return prompt, temperature, max_tokens