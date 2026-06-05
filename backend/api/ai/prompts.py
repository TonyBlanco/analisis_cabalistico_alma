"""Versioned prompt templates for governed AI lanes (inference only)."""

PROMPT_VERSION_KABBALAH = "kabbalah_educational_v1"
PROMPT_VERSION_BIOEMOTION_DRAFT = "bioemotion_draft_v1"


def kabbalah_interpret_prompt(tree_state_json: str) -> str:
    return f"""Eres un asistente educativo de Cábala hermética. Redacta una interpretación exploratoria
a partir del estado estructural del Árbol (JSON). No diagnostiques, no des consejos médicos ni psicológicos clínicos.
Usa lenguaje tentativo ("podría sugerir", "desde una lectura simbólica").
Máximo 6 párrafos cortos en español.

Estado del árbol (JSON):
{tree_state_json}
"""


def bioemotion_synthesis_draft_prompt(*, patient_context: str, current_text: str) -> str:
    return f"""Eres un asistente de redacción para terapeutas en bioemoción.
Genera un BORRADOR de síntesis integradora (no es diagnóstico ni tratamiento).
No uses etiquetas DSM, no imperatives absolutos ("debes", "nunca", "siempre").
El terapeuta revisará y editará todo antes de cerrar el caso.

Contexto clínico-resumido (notas del terapeuta):
{patient_context}

Borrador previo del terapeuta (puede estar vacío):
{current_text or "(vacío)"}

Devuelve solo el texto del borrador sugerido en español.
"""