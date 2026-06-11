"""Docs-grounded product help endpoint."""

from __future__ import annotations

import logging
from typing import Any, Dict, List

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.ai.llm_bridge import generate_text, is_llm_available, unavailable_message
from api.ai.usage_meter import UsageContext

from .index import best_fallback_guide, search_help_docs
from .safety import validate_help_output, validate_help_scope

logger = logging.getLogger(__name__)

MAX_QUERY_LENGTH = 2000
REQUIRED_MIN_GROUNDING_SCORE = 2.25


def _serialize_citation(item) -> Dict[str, Any]:
    return {
        'title': item.title,
        'path': item.path,
        'excerpt': item.excerpt,
    }


def _grounding_level(results: List[Any]) -> str:
    if not results:
        return 'none'
    top = results[0].score
    if top >= 4.5:
        return 'high'
    if top >= REQUIRED_MIN_GROUNDING_SCORE:
        return 'partial'
    return 'none'


def _decline_message(fallback) -> str:
    guide_line = ''
    if fallback:
        guide_line = f" Revisa la guia mas cercana: {fallback.title} ({fallback.path})."
    return (
        "No puedo ayudar con interpretacion clinica o formativa. "
        "Puedo orientar sobre como funciona la app, donde encontrar guias y como usar sus herramientas."
        f"{guide_line}"
    )


class HelpAskView(APIView):
    """POST /api/help/ask/ — product usage assistant grounded on /docs."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        body = request.data if isinstance(request.data, dict) else {}
        query = str(body.get('query') or '').strip()
        route = str(body.get('route') or '').strip()
        screen = str(body.get('screen') or '').strip()
        locale = str(body.get('locale') or '').strip() or 'es'

        if not query:
            return Response({'error': 'query is required'}, status=status.HTTP_400_BAD_REQUEST)
        if len(query) > MAX_QUERY_LENGTH:
            return Response({'error': 'query too long'}, status=status.HTTP_400_BAD_REQUEST)

        scope = validate_help_scope(query)
        citations = search_help_docs(query, route=route, screen=screen, limit=3)
        grounding = _grounding_level(citations)
        fallback = best_fallback_guide(query, route=route, screen=screen)

        if not scope.passed:
            return Response(
                {
                    'success': True,
                    'answer': _decline_message(fallback),
                    'citations': [_serialize_citation(item) for item in citations],
                    'fallback_guide': (
                        {'title': fallback.title, 'path': fallback.path} if fallback else None
                    ),
                    'grounding': 'none',
                    'provider': None,
                    'usage': None,
                }
            )

        if grounding == 'none' or not is_llm_available():
            answer = _decline_message(fallback)
            if not is_llm_available():
                answer = f"{answer} {unavailable_message()}"
            return Response(
                {
                    'success': True,
                    'answer': answer,
                    'citations': [_serialize_citation(item) for item in citations],
                    'fallback_guide': (
                        {'title': fallback.title, 'path': fallback.path} if fallback else None
                    ),
                    'grounding': grounding,
                    'provider': None,
                    'usage': None,
                }
            )

        context_snippets = '\n\n'.join(
            f"[{idx + 1}] {item.title} — {item.path}\n{item.excerpt}"
            for idx, item in enumerate(citations)
        )
        prompt = f"""
Eres un asistente de ayuda de producto para terapeutas.
Tu trabajo es responder SOLO sobre como funciona la app.

Reglas:
- No des interpretacion clinica, consejo personal ni etiquetas sobre consultantes.
- Usa solo la documentacion provista en el contexto.
- Si el grounding es insuficiente, responde exactamente que no lo sabes con certeza y enlaza la guia mas cercana.
- Mantente en espanol.
- No menciones PHI.

Contexto de uso:
- Ruta: {route or '(no disponible)'}
- Pantalla: {screen or '(no disponible)'}
- Idioma: {locale}

Documentacion relevante:
{context_snippets or '(sin citas)'}

Pregunta:
{query}

Devuelve una respuesta breve y util, con tono claro de soporte.
""".strip()

        usage_context = UsageContext(
            therapist=request.user,
            task_type='help.ask',
            source_type='help_assistant',
            source_id=route or screen or 'help-widget',
        )
        result = generate_text(
            prompt,
            temperature=0.2,
            max_tokens=768,
            usage_context=usage_context,
        )
        if not result.get('success'):
            return Response(
                {
                    'error': result.get('error') or 'AI providers unavailable',
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        answer = str(result.get('text') or '').strip()
        safety = validate_help_output(answer)
        if not safety.passed:
            logger.warning(
                'Help assistant output failed safety guard: warnings=%s route=%s screen=%s',
                len(safety.warnings),
                route or '-',
                screen or '-',
            )
            answer = _decline_message(fallback)

        return Response(
            {
                'success': True,
                'answer': answer,
                'citations': [_serialize_citation(item) for item in citations],
                'fallback_guide': (
                    {'title': fallback.title, 'path': fallback.path} if fallback else None
                ),
                'grounding': grounding,
                'provider': result.get('provider'),
                'usage': {
                    'prompt_tokens': int(result.get('prompt_tokens') or 0),
                    'completion_tokens': int(result.get('completion_tokens') or 0),
                    'total_tokens': int(result.get('total_tokens') or 0),
                },
            }
        )

