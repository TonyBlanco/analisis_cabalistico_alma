from __future__ import annotations

import time
from typing import Any

from symbolic.tarot.execution import SymbolicReadingPayload, TarotSystemAdapter, register_adapter

from .deck_mock import CARDS_MOCK


_CARD_SYMBOLS: dict[str, dict[str, Any]] = {
    "mars_01_bateleur": {
        "hebrew_letter": None,
        "letter_name": None,
        "gematria": None,
        "path": None,
        "sefirot": [],
    }
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
    seed = int(time.time() // 60) + 41
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
            "system": "marsella",
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
    payload_id = "swm-v3-mock-marsella-" + "-".join([c["id"] for c in payload_cards])

    return SymbolicReadingPayload(
        id=payload_id,
        summary="Lectura educativa (mock) — Tarot de Marsella (simbólico). Observacional, no clínica.",
        themes=unique_themes,
        correspondences=unique_corr,
        caution="Lectura educativa (mock) — no es diagnóstico, recomendación ni consejo clínico.",
        cards=payload_cards,
    )


register_adapter(
    TarotSystemAdapter(
        system_id="marsella",
        label="Tarot de Marsella (simbólico)",
        aliases={"tarot_de_marsella_symbolic"},
        build_payload=build_payload,
    )
)
