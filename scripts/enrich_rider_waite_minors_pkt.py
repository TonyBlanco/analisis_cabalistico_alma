#!/usr/bin/env python3
"""Enrich Rider-Waite minor arcana JSON with Waite Pictorial Key text from sacred-texts.com."""
from __future__ import annotations

import json
import re
import time
import urllib.error
import urllib.request
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PKG = ROOT / "backend/packages/symbolic/tarot/rider-waite"
MINORS_JSON = PKG / "rider_waite_minors.json"
BASE_URL = "https://www.sacred-texts.com/tarot/pkt/"

SUIT_PREFIX = {
    "cups": "cu",
    "wands": "wa",
    "swords": "sw",
    "pentacles": "pe",
}

RANK_SUFFIX = {
    1: "ac",
    2: "02",
    3: "03",
    4: "04",
    5: "05",
    6: "06",
    7: "07",
    8: "08",
    9: "09",
    10: "10",
}

COURT_SUFFIX = {
    "page": "pa",
    "knight": "kn",
    "queen": "qu",
    "king": "ki",
}


def pkt_filename(card: dict) -> str:
    suit = (card.get("suit") or "").lower()
    prefix = SUIT_PREFIX.get(suit)
    if not prefix:
        raise ValueError(f"Unknown suit for {card.get('name')}")

    court = card.get("court")
    if court:
        suffix = COURT_SUFFIX.get(str(court).lower())
        if not suffix:
            raise ValueError(f"Unknown court {court} for {card.get('name')}")
    else:
        number = int(card.get("number") or 0)
        suffix = RANK_SUFFIX.get(number)
        if not suffix:
            raise ValueError(f"Unknown number {number} for {card.get('name')}")

    return f"pkt{prefix}{suffix}.htm"


def fetch_html(url: str) -> str:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Studios33-tarot-enrichment/1.0 (+https://studios33.app)"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def strip_tags(html: str) -> str:
    text = re.sub(r"<br\s*/?>", " ", html, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    text = unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def parse_pkt_page(html: str) -> dict[str, str | None]:
    """Extract symbolism paragraph and divinatory upright/reversed from a PKT minor page."""
    body_match = re.search(r"<body[^>]*>(.*)</body>", html, flags=re.I | re.S)
    body = body_match.group(1) if body_match else html

    # Remove nav blocks and scripts
    body = re.sub(r"<script[^>]*>.*?</script>", "", body, flags=re.I | re.S)
    body = re.sub(r"<hr[^>]*>", "\n", body, flags=re.I)

    div_match = re.search(
        r"\*Divinatory Meanings\*:\s*(.*?)\s*\*Reversed\*:\s*(.*?)(?:\n|<|$)",
        body,
        flags=re.I | re.S,
    )
    upright = reversed_text = None
    if div_match:
        upright = strip_tags(div_match.group(1))
        reversed_text = strip_tags(div_match.group(2).split("<")[0])

    description = None
    if div_match:
        before = body[: div_match.start()]
    else:
        before = body

    # Last substantive paragraph before divinatory block (image description)
    paragraphs = re.findall(r"<p[^>]*>(.*?)</p>", before, flags=re.I | re.S)
    for raw in reversed(paragraphs):
        text = strip_tags(raw)
        if len(text) < 40:
            continue
        if "Click to enlarge" in text or "sacred-texts" in text.lower():
            continue
        if text.startswith("####"):
            continue
        description = text
        break

    return {
        "description": description,
        "upright": upright,
        "reversed": reversed_text,
    }


def enrich_card(card: dict, *, dry_run: bool = False) -> dict:
    filename = pkt_filename(card)
    url = BASE_URL + filename
    if dry_run:
        return {**card, "_pkt_url": url}

    html = fetch_html(url)
    parsed = parse_pkt_page(html)
    enriched = dict(card)
    if parsed["description"]:
        enriched["description"] = parsed["description"]
    divinatory: dict[str, str] = {}
    if parsed["upright"]:
        divinatory["upright"] = parsed["upright"]
    if parsed["reversed"]:
        divinatory["reversed"] = parsed["reversed"]
    if divinatory:
        enriched["divinatory"] = divinatory
    enriched["sourceText"] = {
        "title": "The Pictorial Key to the Tarot",
        "author": "Arthur Edward Waite",
        "url": url,
        "license": "Public domain (sacred-texts.com)",
    }
    return enriched


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Print URLs only")
    parser.add_argument("--delay", type=float, default=0.35, help="Seconds between requests")
    args = parser.parse_args()

    if not MINORS_JSON.exists():
        raise SystemExit(f"Missing {MINORS_JSON}")

    payload = json.loads(MINORS_JSON.read_text(encoding="utf-8"))
    minors = payload.get("minorArcana") or []
    enriched_cards: list[dict] = []
    failures: list[str] = []

    for i, card in enumerate(minors):
        name = card.get("name", card.get("id", "?"))
        try:
            enriched = enrich_card(card, dry_run=args.dry_run)
            if not args.dry_run:
                has_div = bool(enriched.get("divinatory"))
                has_desc = bool(enriched.get("description"))
                print(f"[{i + 1}/{len(minors)}] {name}: desc={has_desc} div={has_div}")
                if not has_div:
                    failures.append(name)
            else:
                print(f"{name} → {enriched.get('_pkt_url')}")
            enriched_cards.append(enriched)
        except (urllib.error.URLError, ValueError, KeyError) as exc:
            print(f"FAIL {name}: {exc}")
            failures.append(name)
            enriched_cards.append(card)
        if not args.dry_run and i < len(minors) - 1:
            time.sleep(args.delay)

    if args.dry_run:
        return

    payload["minorArcana"] = enriched_cards
    payload["source"] = "metabismuth/tarot-json + sacred-texts.com/tarot/pkt (Waite Pictorial Key)"
    payload["enrichedAt"] = time.strftime("%Y-%m-%d")
    MINORS_JSON.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"\nWrote {len(enriched_cards)} cards → {MINORS_JSON}")
    if failures:
        print(f"Warnings: {len(failures)} cards missing full text: {', '.join(failures[:8])}...")


if __name__ == "__main__":
    main()