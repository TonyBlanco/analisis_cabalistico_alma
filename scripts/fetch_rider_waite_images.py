#!/usr/bin/env python3
"""Download Rider-Waite-Smith scans from metabismuth/tarot-json (MIT License)."""
from __future__ import annotations

import json
import urllib.request
from pathlib import Path

BASE = "https://raw.githubusercontent.com/metabismuth/tarot-json/master"
ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = ROOT / "tonyblanco-app/public/tarot/rider-waite"
PKG_DIR = ROOT / "backend/packages/symbolic/tarot/rider-waite"
DECK_JSON = PKG_DIR / "rider_waite_complete.json"


def fetch(url: str) -> bytes:
    with urllib.request.urlopen(url, timeout=120) as response:
        return response.read()


def main() -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    PKG_DIR.mkdir(parents=True, exist_ok=True)

    images_payload = json.loads(fetch(f"{BASE}/tarot-images.json"))
    (PKG_DIR / "tarot-images.json").write_text(
        json.dumps(images_payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    license_text = fetch(f"{BASE}/LICENSE").decode("utf-8")
    (PKG_DIR / "IMAGES_LICENSE.txt").write_text(
        "Rider-Waite card scans sourced from:\n"
        "https://github.com/metabismuth/tarot-json\n\n"
        + license_text,
        encoding="utf-8",
    )

    downloaded = 0
    skipped = 0
    for entry in images_payload.get("cards", []):
        img = entry.get("img")
        if not img:
            continue
        dest = PUBLIC_DIR / img
        if dest.exists() and dest.stat().st_size > 0:
            skipped += 1
            continue
        dest.write_bytes(fetch(f"{BASE}/cards/{img}"))
        downloaded += 1
        print(f"  + {img}")

    major_by_number: dict[int, str] = {}
    for entry in images_payload.get("cards", []):
        if entry.get("arcana") != "Major Arcana":
            continue
        try:
            num = int(entry.get("number", -1))
        except (TypeError, ValueError):
            continue
        if entry.get("img"):
            major_by_number[num] = entry["img"]

    if DECK_JSON.exists():
        deck = json.loads(DECK_JSON.read_text(encoding="utf-8"))
        for card in deck.get("majorArcana", []):
            key_num = card.get("keyNumber")
            if key_num is None:
                continue
            img = major_by_number.get(int(key_num))
            if img:
                card["image"] = img
                card["imageUrl"] = f"/tarot/rider-waite/{img}"
        DECK_JSON.write_text(
            json.dumps(deck, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )

    print(f"Done: {downloaded} downloaded, {skipped} skipped → {PUBLIC_DIR}")


if __name__ == "__main__":
    main()