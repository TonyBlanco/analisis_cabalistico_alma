from __future__ import annotations

from typing import Any

from .execution import SymbolicReadingPayload, TarotSystemAdapter, register_adapter


def _build_minimal_payload(
    system_id: str,
    label: str,
    selected_cards: list[str],
) -> SymbolicReadingPayload:
    resolved_ids = selected_cards[:3] if selected_cards else []
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
    payload_id = f"swm-v3-mock-{system_id}-" + "-".join(resolved_ids) if resolved_ids else f"swm-v3-mock-{system_id}"

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
        return _build_minimal_payload(system_id=system_id, label=label, selected_cards=selected_cards)

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

