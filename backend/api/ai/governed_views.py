"""
Phase 2 — governed AI assistance (kabbalah + bioemotion draft + feedback).
Inference via llm_bridge only; no fine-tuning.
"""
from __future__ import annotations

import json

from django.conf import settings
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.ai.guardrails import check_output
from api.ai.llm_bridge import generate_text, is_llm_available, unavailable_message
from api.ai.usage_meter import UsageContext
from api.ai.prompts import bioemotion_synthesis_draft_prompt, kabbalah_interpret_prompt
from api.bioemotional.models import (
    BioEmotionalHypothesis,
    BioEmotionalObservation,
    BioEmotionalSynthesis,
)
from api.bioemotional.permissions import IsTherapistAndOwnsPatient
from api.models import AIInteractionFeedback, Patient
from api.permissions import IsTherapist
from api.utils.symbolic_interpreter_ai import symbolic_ai_service


def _feature_disabled(feature: str) -> Response:
    return Response(
        {"success": False, "error": f"{feature} deshabilitado", "code": "feature_disabled"},
        status=status.HTTP_403_FORBIDDEN,
    )


class KabbalahInterpretView(APIView):
    """POST /api/ai/kabbalah/interpret/ — lane symbolic, educational only."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not getattr(settings, "AI_KABBALAH_ENABLED", True):
            return _feature_disabled("AI_KABBALAH")

        tree_state = request.data.get("tree_structural_state") or request.data.get("treeState")
        if not tree_state:
            raise ValidationError({"tree_structural_state": "Campo obligatorio."})

        valid, error_msg = symbolic_ai_service.validate_tree_state_structure(tree_state)
        if not valid:
            return Response(
                {
                    "success": False,
                    "error": error_msg,
                    "code": "invalid_tree_state",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not is_llm_available():
            return Response(
                {"success": False, "error": unavailable_message(), "code": "llm_unavailable"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        rag_context = (request.data.get("rag_context") or "").strip()
        patient_history = (request.data.get("patient_history_summary") or "").strip()
        prompt, temperature, max_tokens, prompt_version = kabbalah_interpret_prompt(
            json.dumps(tree_state, ensure_ascii=False, indent=2),
            rag_context=rag_context,
            patient_history_summary=patient_history,
        )
        usage_context = UsageContext(
            therapist=request.user,
            task_type='ai.kabbalah_interpret',
            source_type='kabbalah_interpret',
        )
        result = generate_text(
            prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            usage_context=usage_context,
        )
        if not result.get("success"):
            return Response(
                {
                    "success": False,
                    "error": result.get("error") or "Error de inferencia",
                    "code": "inference_failed",
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        text = (result.get("text") or "").strip()
        ok, code, detail = check_output(text)
        if not ok:
            return Response(
                {
                    "success": False,
                    "code": code,
                    "error": detail,
                    "guardrail_violation": True,
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        return Response(
            {
                "success": True,
                "lane": "symbolic",
                "interpretation": text,
                "provider": result.get("provider"),
                "prompt_version": prompt_version,
            }
        )


class BioEmotionalSynthesisAssistDraftView(APIView):
    """POST /api/bioemotional/synthesis/<uuid>/assist-draft/ — does not close or publish."""

    permission_classes = [IsAuthenticated, IsTherapistAndOwnsPatient]

    def post(self, request, id):
        if not getattr(settings, "AI_BIOEMOTION_DRAFT_ENABLED", True):
            return _feature_disabled("AI_BIOEMOTION_DRAFT")

        try:
            synthesis = BioEmotionalSynthesis.objects.select_related("patient").get(
                pk=id, therapist=request.user
            )
        except BioEmotionalSynthesis.DoesNotExist:
            raise PermissionDenied("Síntesis no encontrada o sin acceso.")

        if synthesis.is_closed:
            raise ValidationError({"synthesis": "La síntesis ya está cerrada; no se puede asistir con IA."})

        patient = synthesis.patient
        obs = BioEmotionalObservation.objects.filter(patient=patient, therapist=request.user).order_by(
            "-created_at"
        )[:8]
        hyps = BioEmotionalHypothesis.objects.filter(patient=patient, therapist=request.user).order_by(
            "-created_at"
        )[:5]
        context_parts = []
        for o in obs:
            context_parts.append(f"Observación: {(o.note_text or '')[:400]}")
        for h in hyps:
            context_parts.append(f"Hipótesis: {(h.description or '')[:400]}")
        patient_context = "\n".join(context_parts) or "(sin notas previas)"

        if not is_llm_available():
            return Response(
                {"success": False, "error": unavailable_message(), "code": "llm_unavailable"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        rag_context = (request.data.get("rag_context") or "").strip()
        prompt, temperature, max_tokens, prompt_version = bioemotion_synthesis_draft_prompt(
            patient_context=patient_context,
            current_text=synthesis.text,
            rag_context=rag_context,
        )
        usage_context = UsageContext(
            therapist=request.user,
            task_type='bioemotional.assist_draft',
            patient_id=patient.id,
            source_type='bioemotional_synthesis',
            source_id=str(synthesis.pk),
        )
        result = generate_text(
            prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            usage_context=usage_context,
        )
        if not result.get("success"):
            return Response(
                {
                    "success": False,
                    "error": result.get("error") or "Error de inferencia",
                    "code": "inference_failed",
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        draft = (result.get("text") or "").strip()
        ok, code, detail = check_output(draft)
        if not ok:
            return Response(
                {
                    "success": False,
                    "code": code,
                    "error": detail,
                    "guardrail_violation": True,
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        return Response(
            {
                "success": True,
                "lane": "clinical_support",
                "synthesis_id": str(synthesis.id),
                "draft_text": draft,
                "provider": result.get("provider"),
                "prompt_version": prompt_version,
                "persisted": False,
            }
        )


class AIInteractionFeedbackView(APIView):
    """POST /api/ai/feedback/ — ratings for prompt/RAG improvement (no training)."""

    permission_classes = [IsAuthenticated, IsTherapist]

    def post(self, request):
        feature = (request.data.get("feature") or "").strip()
        rating = request.data.get("rating")
        if not feature:
            raise ValidationError({"feature": "Campo obligatorio."})
        try:
            rating_int = int(rating)
        except (TypeError, ValueError):
            raise ValidationError({"rating": "Debe ser un entero entre 1 y 5."})
        if rating_int < 1 or rating_int > 5:
            raise ValidationError({"rating": "Debe estar entre 1 y 5."})

        patient = None
        patient_id = request.data.get("patient_id")
        if patient_id is not None:
            try:
                patient = Patient.objects.get(pk=int(patient_id), therapist=request.user)
            except (Patient.DoesNotExist, TypeError, ValueError):
                raise PermissionDenied("Paciente no autorizado.")

        AIInteractionFeedback.objects.create(
            therapist=request.user,
            patient=patient,
            feature=feature,
            provider=(request.data.get("provider") or "")[:32],
            prompt_version=(request.data.get("prompt_version") or "")[:64],
            rating=rating_int,
            correction_text=(request.data.get("correction_text") or "")[:4000],
        )
        return Response({"success": True}, status=status.HTTP_201_CREATED)