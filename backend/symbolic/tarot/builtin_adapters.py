from __future__ import annotations

from typing import Any

from .execution import SymbolicReadingPayload, TarotSystemAdapter, register_adapter


_DEFAULT_MAJOR_MOCK: list[dict[str, Any]] = [
    {"suffix": "00_fool", "name": "The Fool", "arcana": "major", "tags": ["beginning", "threshold"]},
    {"suffix": "01_magician", "name": "The Magician", "arcana": "major", "tags": ["will", "focus"]},
    {"suffix": "02_priestess", "name": "The High Priestess", "arcana": "major", "tags": ["veil", "silence"]},
    {"suffix": "09_hermit", "name": "The Hermit", "arcana": "major", "tags": ["retreat", "guidance"]},
    {"suffix": "16_tower", "name": "The Tower", "arcana": "major", "tags": ["rupture", "revelation"]},
]


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

def _build_minimal_payload(
    system_id: str,
    label: str,
    selected_cards: list[str],
    context: dict[str, Any],
) -> SymbolicReadingPayload:
    count = _desired_count(context)
    seed = int(__import__("time").time() // 60) + sum(ord(c) for c in system_id)

    if selected_cards:
        resolved_ids = [str(c) for c in selected_cards if isinstance(c, (str, int))][: max(0, count)]
        payload_cards = [
            {
                "id": str(card_id),
                "name": str(card_id),
                "arcana": "unknown",
                "tags": [],
                "symbols": {"system": system_id, "source": "mock"},
            }
            for card_id in resolved_ids
        ]
        payload_id = (
            f"swm-v3-mock-{system_id}-" + "-".join(resolved_ids) if resolved_ids else f"swm-v3-mock-{system_id}"
        )
    else:
        deck = [
            {
                "id": f"{system_id}_{item['suffix']}",
                "name": item["name"],
                "arcana": item["arcana"],
                "tags": list(item.get("tags") or []),
                "symbols": {"system": system_id, "source": "mock"},
            }
            for item in _DEFAULT_MAJOR_MOCK
        ]
        payload_cards = _rotate(deck, count=count, seed=seed)
        payload_id = "swm-v3-mock-" + system_id + "-" + "-".join([c["id"] for c in payload_cards])

    return SymbolicReadingPayload(
        id=payload_id,
        summary=f"Lectura educativa (mock) — {label}. Observacional, no clínica.",
        themes=[],
        correspondences=[],
        caution="Lectura educativa (mock) — no es diagnóstico, recomendación ni consejo clínico.",
        cards=payload_cards,
    )


def _register_minimal(system_id: str, label: str, aliases: set[str]) -> None:
    def build_payload(selected_cards: list[str], context: dict[str, Any]) -> SymbolicReadingPayload:
        return _build_minimal_payload(system_id=system_id, label=label, selected_cards=selected_cards, context=context)

    register_adapter(
        TarotSystemAdapter(
            system_id=system_id,
            label=label,
            aliases=aliases,
            build_payload=build_payload,
        )
    )


_register_minimal(system_id="thoth", label="Thoth Tarot (Crowley)", aliases=set())
_register_minimal(system_id="bota", label="B.O.T.A. Tarot", aliases=set())
_register_minimal(system_id="hermetic", label="Hermetic Tarot", aliases=set())
_register_minimal(system_id="sephiroth", label="Tarot of the Sephiroth", aliases=set())
