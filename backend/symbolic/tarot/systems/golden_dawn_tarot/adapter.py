from __future__ import annotations

import time
from typing import Any

from symbolic.tarot.execution import SymbolicReadingPayload, TarotSystemAdapter, register_adapter

from .deck_mock import CARDS_MOCK


_CARD_SYMBOLS: dict[str, dict[str, Any]] = {
    "gd_00_the_fool": {
        "hebrew_letter": "א",
        "letter_name": "Aleph",
        "gematria": 1,
        "path": "11",
        "sefirot": ["Keter", "Chokmah"],
    },
    "gd_01_the_magician": {
        "hebrew_letter": "ב",
        "letter_name": "Bet",
        "gematria": 2,
        "path": "12",
        "sefirot": ["Keter", "Binah"],
    },
    "gd_02_the_high_priestess": {
        "hebrew_letter": "ג",
        "letter_name": "Gimel",
        "gematria": 3,
        "path": "13",
        "sefirot": ["Keter", "Tiferet"],
    },
}


def _desired_count(context: dict[str, Any]) -> int:
    spread_type = context.get("spread_type") if isinstance(context, dict) else None
    if spread_type == "simple":
        return 1
    if spread_type == "observation":
        return 2
    if spread_type == "three_cards":
        return 3
    return 3


def _rotate(cards: list[dict[str, Any]], *, count: int, seed: int) -> list[dict[str, Any]]:
    if not cards or count <= 0:
        return []
    if len(cards) <= count:
        return cards[:]
    start = seed % len(cards)
    return [cards[(start + i) % len(cards)] for i in range(count)]


def _select_cards(selected_cards: list[str], *, count: int, seed: int) -> list[dict[str, Any]]:
    if selected_cards:
        by_id = {card["id"]: card for card in CARDS_MOCK}
        resolved = [by_id[cid] for cid in selected_cards if cid in by_id]
        if resolved:
            return resolved
    return _rotate(CARDS_MOCK, count=count, seed=seed)


def build_payload(selected_cards: list[str], context: dict[str, Any]) -> SymbolicReadingPayload:
    count = _desired_count(context)
    seed = int(time.time() // 60) + 17
    cards = _select_cards(selected_cards, count=count, seed=seed)
    themes: list[str] = []
    correspondences: list[str] = []
    payload_cards: list[dict[str, Any]] = []

    for card in cards:
        tags = list(card.get("tags") or [])
        themes.extend(tags)
        correspondences.extend(tags)

        symbols = {
            "hebrew_letter": None,
            "letter_name": None,
            "gematria": None,
            "path": None,
            "sefirot": [],
            "system": "golden-dawn",
            "source": "mock",
            **_CARD_SYMBOLS.get(card["id"], {}),
        }

        payload_cards.append(
            {
                "id": card["id"],
                "name": card["name"],
                "arcana": card["arcana"],
                "tags": tags,
                "symbols": symbols,
            }
        )

    unique_themes = list(dict.fromkeys(themes))[:5]
    unique_corr = list(dict.fromkeys(correspondences))[:8]
    payload_id = "swm-v3-mock-golden-dawn-" + "-".join([c["id"] for c in payload_cards])

    return SymbolicReadingPayload(
        id=payload_id,
        summary="Lectura educativa (mock) — Golden Dawn Tarot. Observacional, no clínica.",
        themes=unique_themes,
        correspondences=unique_corr,
        caution="Lectura educativa (mock) — no es diagnóstico, recomendación ni consejo clínico.",
        cards=payload_cards,
    )


register_adapter(
    TarotSystemAdapter(
        system_id="golden-dawn",
        label="Golden Dawn Tarot",
        aliases={"golden_dawn", "golden_dawn_tarot"},
        build_payload=build_payload,
    )
)
