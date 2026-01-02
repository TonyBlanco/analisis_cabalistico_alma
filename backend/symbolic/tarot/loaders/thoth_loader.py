from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Optional

_DATASET_PATH = (
    Path(__file__).resolve().parent.parent / "data" / "thoth" / "THOTH_TAROT_78.json"
)


def _safe_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _safe_list(value: Any) -> list[Any]:
    return value if isinstance(value, list) else []


def _normalize_card_key(raw: Any) -> str:
    if raw is None:
        return ""
    key = str(raw).strip()
    return key.lower()


def _extract_code(card_id: str) -> Optional[str]:
    if not card_id:
        return None
    raw = card_id.strip()
    if raw.isdigit():
        return str(int(raw))
    if raw.startswith("thoth_"):
        raw = raw[len("thoth_") :]
    if "_" in raw:
        prefix = raw.split("_", 1)[0]
        if prefix.isdigit():
            return str(int(prefix))
    return None


@lru_cache(maxsize=1)
def _load_thoth_dataset() -> dict[str, Any]:
    with _DATASET_PATH.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    return data if isinstance(data, dict) else {}


@lru_cache(maxsize=1)
def _thoth_indexes() -> tuple[dict[str, dict[str, Any]], dict[str, dict[str, Any]], dict[str, dict[str, Any]]]:
    data = _load_thoth_dataset()
    cards = _safe_list(data.get("cards"))
    spreads = _safe_list(data.get("spreads"))

    by_id: dict[str, dict[str, Any]] = {}
    by_code: dict[str, dict[str, Any]] = {}
    by_spread_id: dict[str, dict[str, Any]] = {}

    for raw_card in cards:
        card = _safe_dict(raw_card)
        card_id = _normalize_card_key(card.get("id"))
        if card_id:
            by_id[card_id] = card

        code_raw = card.get("code")
        if code_raw is not None:
            code_key = _normalize_card_key(code_raw)
            if code_key:
                by_code[code_key] = card

    for raw_spread in spreads:
        spread = _safe_dict(raw_spread)
        spread_id = _normalize_card_key(spread.get("id"))
        if spread_id:
            by_spread_id[spread_id] = spread

    return by_id, by_code, by_spread_id


def get_thoth_card(card_id: Any) -> Optional[dict[str, Any]]:
    if card_id is None:
        return None
    card_key = _normalize_card_key(card_id)
    if not card_key:
        return None

    by_id, by_code, _ = _thoth_indexes()

    card = by_id.get(card_key)
    if card is not None:
        return card

    code = _extract_code(card_key)
    if code:
        return by_code.get(_normalize_card_key(code))

    return None


def get_thoth_spread(spread_id: Any) -> Optional[dict[str, Any]]:
    if spread_id is None:
        return None
    key = _normalize_card_key(spread_id)
    if not key:
        return None

    _, _, by_spread_id = _thoth_indexes()
    return by_spread_id.get(key)


def thoth_card_count() -> int:
    data = _load_thoth_dataset()
    return len(_safe_list(data.get("cards")))

