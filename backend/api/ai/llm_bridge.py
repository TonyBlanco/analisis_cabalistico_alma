"""
Unified LLM bridge — all server-side inference should use this module.

No fine-tuning, LoRA, PEFT, or checkpoints. Delegates to multi_ai_service.generate_with_fallback.
"""
from __future__ import annotations

import time
from typing import Any, Dict, Optional, TYPE_CHECKING

from django.conf import settings

from api.utils.multi_ai_service import generate_with_fallback, multi_ai

if TYPE_CHECKING:
    from api.ai.usage_meter import UsageContext

_last_call: Dict[str, Any] = {
    "provider": None,
    "latency_ms": None,
    "success": None,
    "at": None,
}


def is_llm_available() -> bool:
    """True if at least one cloud provider key is configured (Ollama alone is optional)."""
    multi_ai._check_available_providers()
    cloud = [p for p in multi_ai.available_providers if p != "ollama"]
    return len(cloud) > 0


def unavailable_message() -> str:
    return (
        "Servicio de IA no disponible. Configura GROQ_API_KEY, GEMINI_API_KEY u OPENAI_API_KEY "
        "(o Ollama local)."
    )


def generate_text(
    prompt: str,
    *,
    temperature: float = 0.7,
    max_tokens: int = 1024,
    top_p: float = 0.8,
    preferred_provider: Optional[str] = None,
    usage_context: Optional["UsageContext"] = None,
) -> Dict[str, Any]:
    """
    Returns {success, text, provider, model, prompt_tokens, completion_tokens, total_tokens, error}
    and updates last-call metrics for /api/ai/status/.
    """
    global _last_call
    started = time.monotonic()
    if preferred_provider:
        from api.utils.multi_ai_service import MultiAIService

        svc = MultiAIService(preferred_provider=preferred_provider)
        result = svc.generate(
            prompt, temperature=temperature, max_tokens=max_tokens, top_p=top_p
        )
    else:
        result = generate_with_fallback(
            prompt, temperature=temperature, max_tokens=max_tokens, top_p=top_p
        )
    elapsed = int((time.monotonic() - started) * 1000)
    _last_call = {
        "provider": result.get("provider"),
        "latency_ms": elapsed,
        "success": result.get("success"),
        "at": time.time(),
    }
    if usage_context and result.get("success"):
        from api.ai.usage_meter import record_from_llm_result

        record_from_llm_result(usage_context, result)
    return result


def get_provider_status() -> Dict[str, Any]:
    multi_ai._check_available_providers()
    mode = getattr(settings, "AI_PROVIDER", "auto")
    return {
        "ai_provider_mode": mode,
        "available_providers": list(multi_ai.available_providers),
        "llm_available": is_llm_available(),
        "last_call": dict(_last_call),
        "models": {
            "groq": getattr(settings, "GROQ_MODEL", ""),
            "gemini": getattr(settings, "GEMINI_MODEL", ""),
            "openai": getattr(settings, "OPENAI_MODEL", ""),
            "ollama": getattr(settings, "OLLAMA_MODEL", ""),
        },
        "training": {
            "fine_tune": False,
            "lora": False,
            "checkpoints": False,
        },
    }