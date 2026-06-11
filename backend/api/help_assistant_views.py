from __future__ import annotations

import logging

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.ai.llm_bridge import generate_text, is_llm_available, unavailable_message
from api.ai.usage_meter import UsageContext

from .help_assistant_contract import HELP_TASK_TYPE
from .help_assistant_docs import choose_fallback_guide, retrieve_help_citations
from .help_assistant_prompts import build_help_prompt
from .help_assistant_safety import classify_help_scope, validateSafetyContent
from .help_assistant_serializers import HelpAssistantRequestSerializer

logger = logging.getLogger(__name__)


def _grounding_for(citations):
    if not citations:
        return "none"
    if len(citations) >= 2:
        return "high"
    return "partial"


class HelpAskView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = HelpAssistantRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        query = serializer.validated_data["query"]
        screen = serializer.validated_data.get("screen", "")
        route = serializer.validated_data.get("route", "")
        locale = serializer.validated_data.get("locale", "")

        scope = classify_help_scope(query)
        if scope.declined:
            fallback_guide = choose_fallback_guide(
                query=query,
                route=route,
                screen=screen,
            )
            return Response(
                {
                    "success": True,
                    "answer": scope.reply,
                    "citations": [],
                    "grounding": "none",
                    **({"fallback_guide": fallback_guide} if fallback_guide else {}),
                },
                status=status.HTTP_200_OK,
            )

        citations = retrieve_help_citations(
            query=query,
            screen=screen,
            route=route,
            locale=locale,
        )
        grounding = _grounding_for(citations)
        fallback_guide = (
            choose_fallback_guide(
                query=query,
                route=route,
                screen=screen,
                citations=citations,
            )
            if grounding != "high"
            else None
        )
        prompt = build_help_prompt(
            query=query,
            citations=citations,
            route=route,
            screen=screen,
            locale=locale,
        )

        if not is_llm_available():
            return Response(
                {
                    "success": False,
                    "answer": "",
                    "citations": [],
                    "grounding": grounding,
                    "error": unavailable_message(),
                    **({"fallback_guide": fallback_guide} if fallback_guide else {}),
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        usage_context = UsageContext(
            therapist=request.user,
            task_type=HELP_TASK_TYPE,
            source_type="help_assistant",
        )
        result = generate_text(
            prompt,
            temperature=0.2,
            max_tokens=512,
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
                    **({"fallback_guide": fallback_guide} if fallback_guide else {}),
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        answer = (result.get("text") or "").strip()
        safety = validateSafetyContent(answer)
        if not safety["passed"]:
            return Response(
                {
                    "success": False,
                    "answer": "",
                    "citations": citations,
                    "grounding": grounding,
                    "code": "guardrail_violation",
                    "error": "Contenido bloqueado por el filtro de seguridad.",
                    "guardrail_violation": True,
                    **({"fallback_guide": fallback_guide} if fallback_guide else {}),
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
                **({"fallback_guide": fallback_guide} if fallback_guide else {}),
            },
            status=status.HTTP_200_OK,
        )
