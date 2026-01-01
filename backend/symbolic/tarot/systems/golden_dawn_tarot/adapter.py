from __future__ import annotations

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


def _select_cards(selected_cards: list[str]) -> list[dict[str, Any]]:
    if selected_cards:
        by_id = {card["id"]: card for card in CARDS_MOCK}
        resolved = [by_id[cid] for cid in selected_cards if cid in by_id]
        if resolved:
            return resolved
    return CARDS_MOCK[:3]


def build_payload(selected_cards: list[str], context: dict[str, Any]) -> SymbolicReadingPayload:
    cards = _select_cards(selected_cards)
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

