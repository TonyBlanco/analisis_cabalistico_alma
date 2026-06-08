"""
Injector — recupera memorias, las rankea y las inyecta en el prompt del agente.

Fórmula de ranking:
  final_score = semantic_score * 0.60
              + recency_score  * 0.30   (decae a 0 en 30 días)
              + tag_boost      * 0.10   (tags de alta prioridad)
"""

import re
from datetime import datetime, timezone
from typing import Optional

_PRIORITY_TAGS = ["[BUG]", "[SECURITY]", "[DECISION]", "[ARCH]"]
_HIGH_TAGS = ["[ENDPOINT]", "[DEPLOY]", "[DEPENDENCY]", "[FEATURE]"]

_RECENCY_HALF_LIFE_DAYS = 30


def rank_memories(memories: list[dict]) -> list[dict]:
    now = datetime.now(timezone.utc)

    for mem in memories:
        semantic = float(mem.get("score", 0.5))

        ts_str = mem.get("timestamp", "")
        try:
            ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            age_days = max(0, (now - ts).total_seconds() / 86400)
            recency = max(0.0, 1.0 - age_days / _RECENCY_HALF_LIFE_DAYS)
        except (ValueError, TypeError, AttributeError):
            recency = 0.5

        text = mem.get("text", "")
        if any(tag in text for tag in _PRIORITY_TAGS):
            tag_boost = 1.0
        elif any(tag in text for tag in _HIGH_TAGS):
            tag_boost = 0.5
        else:
            tag_boost = 0.0

        mem["final_score"] = semantic * 0.60 + recency * 0.30 + tag_boost * 0.10

    return sorted(memories, key=lambda m: m["final_score"], reverse=True)


def _relative_time(ts_str: str) -> str:
    try:
        ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        days = (datetime.now(timezone.utc) - ts).days
        if days == 0:
            return "hoy"
        if days == 1:
            return "ayer"
        return f"hace {days}d"
    except Exception:
        return ""


def build_memory_context(memories: list[dict], top_n: int = 5) -> str:
    if not memories:
        return ""

    ranked = rank_memories(memories)[:top_n]

    lines = [
        "┌─ VOXTV PROJECT MEMORY (auto-injected, ranked by relevance) ──────────────────",
    ]
    for i, mem in enumerate(ranked, 1):
        score = mem["final_score"]
        agent = mem.get("agent", "?")
        when = _relative_time(mem.get("timestamp", ""))
        text = mem.get("text", "").strip()
        lines.append(f"│ {i}. [{agent}] {text}")
        lines.append(f"│    relevance={score:.2f}  {when}")
    lines.append("└──────────────────────────────────────────────────────────────────────────────")

    return "\n".join(lines)
