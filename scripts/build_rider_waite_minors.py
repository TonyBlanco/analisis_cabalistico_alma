#!/usr/bin/env python3
"""Build Rider-Waite minor arcana JSON from metabismuth/tarot-json metadata."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PKG = ROOT / "backend/packages/symbolic/tarot/rider-waite"
IMAGES_JSON = PKG / "tarot-images.json"
OUT_JSON = PKG / "rider_waite_minors.json"

SUIT_ES = {
    "Cups": "Copas",
    "Swords": "Espadas",
    "Wands": "Bastos",
    "Pentacles": "Oros",
}

RANK_ES = {
    "Ace": "As",
    "Two": "Dos",
    "Three": "Tres",
    "Four": "Cuatro",
    "Five": "Cinco",
    "Six": "Seis",
    "Seven": "Siete",
    "Eight": "Ocho",
    "Nine": "Nueve",
    "Ten": "Diez",
    "Page": "Sota",
    "Knight": "Caballo",
    "Queen": "Reina",
    "King": "Rey",
}

SUIT_KEYWORDS_ES: dict[str, list[str]] = {
    "Cups": ["emoción", "vínculo", "intuición", "corazón"],
    "Swords": ["mente", "verdad", "conflicto", "claridad"],
    "Wands": ["impulso", "creatividad", "acción", "voluntad"],
    "Pentacles": ["cuerpo", "recursos", "trabajo", "materialidad"],
}


def slugify(name: str) -> str:
    slug = name.lower().strip()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


def spanish_name(english: str, suit: str) -> str:
    parts = english.split(" of ")
    if len(parts) != 2:
        return english
    rank, suit_en = parts[0], parts[1]
    rank_es = RANK_ES.get(rank, rank)
    suit_es = SUIT_ES.get(suit_en, suit_en)
    return f"{rank_es} de {suit_es}"


def main() -> None:
    if not IMAGES_JSON.exists():
        raise SystemExit(f"Missing {IMAGES_JSON} — run fetch_rider_waite_images.py first")

    images_payload = json.loads(IMAGES_JSON.read_text(encoding="utf-8"))
    by_name = {c["name"]: c for c in images_payload.get("cards", []) if c.get("name")}

    minors: list[dict] = []
    for entry in images_payload.get("cards", []):
        if entry.get("arcana") != "Minor Arcana":
            continue
        name = entry["name"]
        suit = entry.get("suit") or ""
        img = entry.get("img")
        try:
            number = int(entry.get("number", 0))
        except (TypeError, ValueError):
            number = 0

        rank = name.split(" of ")[0] if " of " in name else name
        court = rank if rank in ("Page", "Knight", "Queen", "King") else None

        card = {
            "id": slugify(name),
            "name": name,
            "nameSpanish": spanish_name(name, suit),
            "arcana": "minor",
            "suit": suit.lower(),
            "number": number,
            "court": court.lower() if court else None,
            "keywords": SUIT_KEYWORDS_ES.get(suit, []),
            "keywordsSpanish": SUIT_KEYWORDS_ES.get(suit, []),
        }
        if img:
            card["image"] = img
            card["imageUrl"] = f"/tarot/rider-waite/{img}"
        minors.append(card)

    payload = {
        "source": "metabismuth/tarot-json",
        "minorArcana": minors,
        "total": len(minors),
    }
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(minors)} minor arcana → {OUT_JSON}")


if __name__ == "__main__":
    main()