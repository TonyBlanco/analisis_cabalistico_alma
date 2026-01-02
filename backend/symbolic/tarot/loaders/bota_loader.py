from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Optional

_DATASET_PATH = (
    Path(__file__).resolve().parent.parent / "data" / "bota" / "bota-tarot-complete.json"
)


def _safe_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _safe_list(value: Any) -> list[Any]:
    return value if isinstance(value, list) else []


def _normalize_key(raw: Any) -> str:
    if raw is None:
        return ""
    return str(raw).strip().lower()


def _extract_code(card_id: str) -> Optional[str]:
    if not card_id:
        return None
    raw = card_id.strip()
    if raw.isdigit():
        return str(int(raw))
    lower = raw.lower()
    if lower.startswith("bota_"):
        raw = raw[len("bota_") :]
    if "_" in raw:
        prefix = raw.split("_", 1)[0]
        if prefix.isdigit():
            return str(int(prefix))
    # Allow minor arcana codes like W01, C10, etc.
    if len(raw) >= 2 and raw[0].isalpha() and any(ch.isdigit() for ch in raw[1:]):
        return raw.upper()
    return None


@lru_cache(maxsize=1)
def _load_bota_dataset() -> dict[str, Any]:
    with _DATASET_PATH.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    return data if isinstance(data, dict) else {}


@lru_cache(maxsize=1)
def _bota_indexes() -> tuple[dict[str, dict[str, Any]], dict[str, dict[str, Any]]]:
    data = _load_bota_dataset()
    major = _safe_list(data.get("majorArcana"))
    minor = _safe_dict(data.get("minorArcana"))

    all_cards: list[dict[str, Any]] = []
    all_cards.extend([_safe_dict(c) for c in major])
    for _, suit_cards in minor.items():
        if isinstance(suit_cards, list):
            all_cards.extend([_safe_dict(c) for c in suit_cards])

    by_id: dict[str, dict[str, Any]] = {}
    by_code: dict[str, dict[str, Any]] = {}
    for card in all_cards:
        card_id = _normalize_key(card.get("id"))
        if card_id:
            by_id[card_id] = card

        code_raw = card.get("code")
        if code_raw is not None:
            code_key = _normalize_key(code_raw)
            if code_key:
                by_code[code_key] = card

    return by_id, by_code


def get_bota_card(card_id: Any) -> Optional[dict[str, Any]]:
    if card_id is None:
        return None
    key = _normalize_key(card_id)
    if not key:
        return None

    by_id, by_code = _bota_indexes()
    if key in by_id:
        return by_id[key]

    code = _extract_code(key)
    if code:
        return by_code.get(_normalize_key(code))
    return None


def get_bota_spread(spread_id: Any) -> Optional[dict[str, Any]]:
    # Dataset currently ships only cards; no spreads defined.
    return None


def bota_card_count() -> int:
    data = _load_bota_dataset()
    deck = _safe_dict(data.get("deck"))
    total = deck.get("totalCards")
    if isinstance(total, int):
        return total
    by_id, _ = _bota_indexes()
    return len(by_id)

