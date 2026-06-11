from __future__ import annotations

from typing import Dict, List

from .help_assistant_contract import HelpAssistantContext


SYSTEM_PROMPT = """Eres el asistente de ayuda de Studios33.
Respondes solo sobre cómo funciona la app: pantallas, guías, permisos, flujos y novedades.
No interpretas contenido clínico ni formativo del consultante.
No uses datos de pacientes, ni pidas PHI, ni inventes respuestas fuera de la documentación.
Si el contexto no alcanza, di "No lo sé con certeza" y apóyate en la guía más cercana."""


def _citation_block(citations: List[Dict[str, str]]) -> str:
    if not citations:
        return "(sin citas recuperadas)"
    return "\n".join(f"- {item['title']} [{item['path']}]: {item['excerpt']}" for item in citations)


def build_help_prompt(
    *,
    query: str,
    citations: List[Dict[str, str]],
    route: str = "",
    screen: str = "",
    locale: str = "",
) -> str:
    ctx = HelpAssistantContext(route=route, screen=screen, locale=locale)
    return (
        f"{SYSTEM_PROMPT}\n\n"
        "Contexto de la app:\n"
        f"{ctx.as_prompt_block() or '(sin contexto de pantalla)'}\n\n"
        "Consulta del usuario:\n"
        f"{query.strip()}\n\n"
        "Citas recuperadas desde /docs:\n"
        f"{_citation_block(citations)}\n\n"
        "Instrucciones de salida:\n"
        "- Responde en español.\n"
        "- Mantén la respuesta breve y práctica.\n"
        "- Si no hay grounding suficiente, usa una respuesta de fallback.\n"
        "- Incluye referencias por título y ruta cuando ayuden a navegar.\n"
        "- No conviertas la consulta en interpretación clínica o formativa.\n"
    )
