"""
Utilities for normalizing responses coming from google.genai.
"""

import logging
from collections.abc import Mapping, Sequence
from typing import Any, Dict

MAX_DEBUG_LENGTH = 2048
logger = logging.getLogger(__name__)


def extract_text(resp: Any) -> str:
    """Return a best-effort text payload from a GenAI response."""
    if resp is None:
        return ""

    if isinstance(resp, str):
        return resp

    text_value = _get_text(resp)
    if text_value and text_value.strip():
        return text_value

    candidate_text = _extract_from_candidates(_attr_get(resp, "candidates"))
    if candidate_text:
        return candidate_text

    mapping = _to_mapping(resp)
    if mapping:
        candidate_text = _extract_from_candidates(mapping.get("candidates"))
        if candidate_text:
            return candidate_text

    logger.warning(
        "Unable to extract reliable text from GenAI response",
        extra={"response_debug": extract_debug(resp)},
    )
    return ""


def extract_debug(resp: Any) -> Dict[str, Any]:
    """Provide safe debug metadata about a GenAI response."""
    resp_type = f"{type(resp).__module__}.{type(resp).__name__}"
    debug: Dict[str, Any] = {
        "response_type": resp_type,
        "has_text_attr": _attr_exists(resp, "text"),
    }

    mapping = _to_mapping(resp)
    if mapping:
        debug["keys"] = list(mapping.keys())[:10]
        dump_source = mapping
    else:
        dump_source = _shallow_repr(resp)

    debug["model_dump"] = _truncate_repr(dump_source)
    return debug


def _get_text(obj: Any) -> str:
    """Try to read a text attribute from the response."""
    value = _attr_get(obj, "text")
    return _coerce_to_str(value)


def _extract_from_candidates(candidates: Any) -> str:
    """Iterate candidates -> content -> parts to build a text string."""
    pieces = []
    for candidate in _ensure_iterable(candidates):
        content = _attr_get(candidate, "content")
        if not content:
            continue

        for part in _ensure_iterable(_attr_get(content, "parts")):
            part_text = _get_text(part)
            if part_text and part_text.strip():
                pieces.append(part_text.strip())

    return " ".join(pieces).strip() if pieces else ""


def _attr_get(obj: Any, attr: str) -> Any:
    if isinstance(obj, Mapping):
        return obj.get(attr)
    return getattr(obj, attr, None)


def _attr_exists(obj: Any, attr: str) -> bool:
    if isinstance(obj, Mapping):
        return attr in obj
    return hasattr(obj, attr)


def _ensure_iterable(value: Any) -> list:
    if value is None:
        return []

    if isinstance(value, (str, bytes)):
        return []

    if isinstance(value, Sequence):
        return list(value)

    try:
        return list(value)
    except TypeError:
        return [value]


def _to_mapping(obj: Any) -> Mapping | None:
    if isinstance(obj, Mapping):
        return obj

    for attr in ("model_dump", "dict"):
        if hasattr(obj, attr):
            try:
                data = getattr(obj, attr)()
            except Exception:
                continue
            if isinstance(data, Mapping):
                return data

    return None


def _shallow_repr(obj: Any) -> Any:
    if isinstance(obj, Mapping):
        return {k: _coerce_to_str(v) for k, v in list(obj.items())[:5]}

    if hasattr(obj, "__dict__"):
        return {k: _coerce_to_str(v) for k, v in vars(obj).items()}

    return repr(obj)


def _truncate_repr(value: Any) -> str:
    try:
        text = repr(value)
    except Exception:
        text = "<unrepresentable>"

    if len(text) <= MAX_DEBUG_LENGTH:
        return text

    return text[: MAX_DEBUG_LENGTH - 3] + "..."


def _coerce_to_str(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, bytes):
        try:
            return value.decode()
        except Exception:
            return value.decode("utf-8", errors="ignore")
    try:
        return str(value)
    except Exception:
        return ""
