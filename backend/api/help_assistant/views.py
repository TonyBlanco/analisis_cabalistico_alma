"""POST /api/help/ask — product usage assistant grounded on /docs."""

from __future__ import annotations

import logging

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.ai.llm_bridge import generate_text, is_llm_available, unavailable_message
from api.ai.usage_meter import UsageContext

from .index import best_fallback_guide, search_help_docs
from .prompts import build_help_prompt
from .safety import decline_reply, validate_help_output, validate_help_scope
from .serializers import HelpAssistantRequestSerializer

logger = logging.getLogger(__name__)

HELP_TASK_TYPE = "help.ask"
_REQUIRED_MIN_SCORE = 2.25


def _grounding_level(results: list) -> str:
    if not results:
        return "none"
    top = results[0].score
    if top >= 4.5:
        return "high"
    if top >= _REQUIRED_MIN_SCORE:
        return "partial"
    return "none"


def _serialize_citations(results: list) -> list:
    return [
        {"title": r.title, "path": r.path, "excerpt": r.excerpt}
        for r in results
    ]


def _fallback_dict(result) -> dict | None:
    if result is None:
        return None
    return {"title": result.title, "path": result.path}


class HelpAskView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = HelpAssistantRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        query: str = serializer.validated_data["query"]
        screen: str = serializer.validated_data.get("screen", "")
        route: str = serializer.validated_data.get("route", "")
        locale: str = serializer.validated_data.get("locale", "")

        scope = validate_help_scope(query)
        if not scope.passed:
            fallback = best_fallback_guide(query, route=route, screen=screen)
            return Response(
                {
                    "success": True,
                    "answer": decline_reply(),
                    "citations": [],
                    "grounding": "none",
                    **({"fallback_guide": _fallback_dict(fallback)} if fallback else {}),
                },
                status=status.HTTP_200_OK,
            )

        results = search_help_docs(query, route=route, screen=screen, limit=3)
        citations = _serialize_citations(results)
        grounding = _grounding_level(results)

        fallback = (
            best_fallback_guide(query, route=route, screen=screen)
            if grounding != "high"
            else None
        )

        if not is_llm_available():
            return Response(
                {
                    "success": False,
                    "answer": "",
                    "citations": citations,
                    "grounding": grounding,
                    "error": unavailable_message(),
                    **({"fallback_guide": _fallback_dict(fallback)} if fallback else {}),
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        prompt = build_help_prompt(
            query=query,
            citations=citations,
            route=route,
            screen=screen,
            locale=locale,
        )
        usage_context = UsageContext(
            therapist=request.user,
            task_type=HELP_TASK_TYPE,
            source_type="help_assistant",
            source_id=route or screen or "help-widget",
        )
        result = generate_text(
            prompt,
            temperature=0.2,
            max_tokens=768,
            preferred_provider="groq",
            usage_context=usage_context,
        )

        if not result.get("success"):
            return Response(
                {
                    "success": False,
                    "answer": "",
                    "citations": citations,
                    "grounding": grounding,
                    "error": result.get("error") or "Error de inferencia",
                    **({"fallback_guide": _fallback_dict(fallback)} if fallback else {}),
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        answer = (result.get("text") or "").strip()
        safety = validate_help_output(answer)
        if not safety.passed:
            logger.warning(
                "help.ask output failed safety guard: warnings=%s route=%s screen=%s",
                safety.warnings,
                route or "-",
                screen or "-",
            )
            return Response(
                {
                    "success": False,
                    "answer": "",
                    "citations": citations,
                    "grounding": grounding,
                    "code": "guardrail_violation",
                    "error": "Contenido bloqueado por el filtro de seguridad.",
                    "guardrail_violation": True,
                    **({"fallback_guide": _fallback_dict(fallback)} if fallback else {}),
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        return Response(
            {
                "success": True,
                "answer": answer,
                "citations": citations,
                "grounding": grounding,
                "provider": result.get("provider"),
                "usage": {
                    "prompt_tokens": int(result.get("prompt_tokens") or 0),
                    "completion_tokens": int(result.get("completion_tokens") or 0),
                    "total_tokens": int(result.get("total_tokens") or 0),
                },
                **({"fallback_guide": _fallback_dict(fallback)} if fallback else {}),
            },
            status=status.HTTP_200_OK,
        )
