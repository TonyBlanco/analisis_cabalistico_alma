from __future__ import annotations

from typing import Any

from symbolic.tarot.execution import SymbolicReadingPayload, TarotSystemAdapter, register_adapter

from .deck_mock import CARDS_MOCK


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

        payload_cards.append(
            {
                "id": card["id"],
                "name": card["name"],
                "arcana": card["arcana"],
                "tags": tags,
                "symbols": {
                    "hebrew_letter": None,
                    "letter_name": None,
                    "gematria": None,
                    "path": None,
                    "sefirot": [],
                    "system": "oracle-symbolic",
                    "source": "mock",
                },
            }
        )

    unique_themes = list(dict.fromkeys(themes))[:5]
    unique_corr = list(dict.fromkeys(correspondences))[:8]
    payload_id = "swm-v3-mock-oracle-" + "-".join([c["id"] for c in payload_cards])

    return SymbolicReadingPayload(
        id=payload_id,
        summary="Lectura educativa (mock) — Oráculo simbólico genérico. Observacional, no clínica.",
        themes=unique_themes,
        correspondences=unique_corr,
        caution="Lectura educativa (mock) — no es diagnóstico, recomendación ni consejo clínico.",
        cards=payload_cards,
    )


register_adapter(
    TarotSystemAdapter(
        system_id="oracle-symbolic",
        label="Oráculo simbólico genérico",
        aliases={"oracle_generic", "generic_symbolic_oracle"},
        build_payload=build_payload,
    )
)

