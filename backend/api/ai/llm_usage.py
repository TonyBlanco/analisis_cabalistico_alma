"""Extracción de tokens de respuestas LLM (sin dependencias de modelos Django)."""
from __future__ import annotations

from typing import Any, Dict, Optional


def estimate_tokens_from_text(*parts: str) -> int:
    total_chars = sum(len(p or '') for p in parts)
    return max(1, total_chars // 4) if total_chars else 0


def normalize_token_usage(
    *,
    prompt_tokens: int = 0,
    completion_tokens: int = 0,
    total_tokens: int = 0,
    fallback_texts: Optional[tuple] = None,
) -> Dict[str, int]:
    pt = int(prompt_tokens or 0)
    ct = int(completion_tokens or 0)
    tt = int(total_tokens or 0)
    if tt == 0:
        tt = pt + ct
    if tt == 0 and fallback_texts:
        tt = estimate_tokens_from_text(*fallback_texts)
        ct = tt
    if pt == 0 and ct == 0 and tt > 0:
        ct = tt
    return {
        'prompt_tokens': pt,
        'completion_tokens': ct,
        'total_tokens': max(tt, pt + ct),
    }


def extract_gemini_usage(response: Any) -> Dict[str, int]:
    meta = getattr(response, 'usage_metadata', None)
    if not meta:
        return {'prompt_tokens': 0, 'completion_tokens': 0, 'total_tokens': 0}
    pt = int(getattr(meta, 'prompt_token_count', 0) or 0)
    ct = int(getattr(meta, 'candidates_token_count', 0) or 0)
    tt = int(getattr(meta, 'total_token_count', 0) or 0)
    return normalize_token_usage(prompt_tokens=pt, completion_tokens=ct, total_tokens=tt)


def extract_openai_style_usage(response: Any) -> Dict[str, int]:
    usage = getattr(response, 'usage', None)
    if not usage:
        return {'prompt_tokens': 0, 'completion_tokens': 0, 'total_tokens': 0}
    pt = int(getattr(usage, 'prompt_tokens', 0) or 0)
    ct = int(getattr(usage, 'completion_tokens', 0) or 0)
    tt = int(getattr(usage, 'total_tokens', 0) or 0)
    return normalize_token_usage(prompt_tokens=pt, completion_tokens=ct, total_tokens=tt)


def extract_ollama_usage(response_json: Dict[str, Any], prompt: str, output: str) -> Dict[str, int]:
    pt = int(response_json.get('prompt_eval_count', 0) or 0)
    ct = int(response_json.get('eval_count', 0) or 0)
    return normalize_token_usage(
        prompt_tokens=pt,
        completion_tokens=ct,
        fallback_texts=(prompt, output) if pt == 0 and ct == 0 else None,
    )