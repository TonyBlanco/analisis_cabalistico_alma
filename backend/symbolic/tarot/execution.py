from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Optional


@dataclass(frozen=True)
class SymbolicCard:
    id: str
    name: str
    arcana: str
    tags: list[str]
    symbols: dict[str, Any]


@dataclass(frozen=True)
class SymbolicReadingPayload:
    id: str
    summary: str
    themes: list[str]
    correspondences: list[str]
    caution: str
    cards: list[dict[str, Any]]

    def to_content_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "summary": self.summary,
            "themes": self.themes,
            "correspondences": self.correspondences,
            "caution": self.caution,
            "cards": self.cards,
        }


@dataclass(frozen=True)
class TarotSystemAdapter:
    system_id: str
    label: str
    aliases: set[str]
    build_payload: Callable[[list[str], dict[str, Any]], SymbolicReadingPayload]

    def matches(self, system_id: str) -> bool:
        return system_id == self.system_id or system_id in self.aliases


_ADAPTERS: list[TarotSystemAdapter] = []


def register_adapter(adapter: TarotSystemAdapter) -> None:
    _ADAPTERS.append(adapter)


def resolve_adapter(system_id: str) -> Optional[TarotSystemAdapter]:
    for adapter in _ADAPTERS:
        if adapter.matches(system_id):
            return adapter
    return None

