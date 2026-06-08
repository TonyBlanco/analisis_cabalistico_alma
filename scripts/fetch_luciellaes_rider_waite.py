#!/usr/bin/env python3
"""Download luciellaes CC0 Rider-Waite pack from itch.io and sync into Studios33 paths."""
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from http.cookiejar import CookieJar
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = ROOT / "tonyblanco-app/public/tarot/rider-waite"
PKG_DIR = ROOT / "backend/packages/symbolic/tarot/rider-waite"
META_JSON = PKG_DIR / "tarot-images.json"
MANIFEST_JSON = PKG_DIR / "luciellaes_manifest.json"
LICENSE_FILE = PKG_DIR / "IMAGES_LICENSE.txt"

ITCH_GAME = "https://luciellaes.itch.io/rider-waite-smith-tarot-cards-cc0"
UPLOAD_JPG_ZIP = 2635318
UPLOAD_CARD_BORDER = 2635926

SUIT_TO_PREFIX = {
    "Cups": "c",
    "Swords": "s",
    "Wands": "w",
    "Pentacles": "p",
}


def itch_opener() -> urllib.request.OpenerDirector:
    jar = CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
    opener.open(ITCH_GAME, timeout=30).read()
    return opener


def itch_download_file(opener: urllib.request.OpenerDirector, upload_id: int, dest: Path) -> None:
    data = urllib.parse.urlencode({"upload_id": upload_id}).encode()
    req = urllib.request.Request(f"{ITCH_GAME}/file/{upload_id}", data=data, method="POST")
    with opener.open(req, timeout=60) as response:
        payload = json.load(response)
    url = payload["url"].replace("\\/", "/")
    with opener.open(url, timeout=180) as response:
        dest.write_bytes(response.read())


def luciellaes_minor_name(suit: str, number: str | int) -> str:
    return f"{suit}{int(number):02d}.jpg"


def luciellaes_major_name(number: str | int, english_name: str) -> str:
    slug = re.sub(r"[^A-Za-z0-9]", "", english_name.replace("The ", "The"))
    if english_name == "Wheel of Fortune":
        slug = "WheelOfFortune"
    elif english_name == "The Hanged Man":
        slug = "TheHangedMan"
    elif english_name == "The High Priestess":
        slug = "TheHighPriestess"
    elif english_name == "Judgement":
        slug = "Judgement"
    elif english_name.startswith("The "):
        slug = "The" + english_name[4:].replace(" ", "")
    else:
        slug = english_name.replace(" ", "")
    return f"{int(number):02d}-{slug}.jpg"


def build_manifest(cards_meta: list[dict]) -> dict:
    entries: list[dict] = []
    for card in cards_meta:
        name = card["name"]
        img = card.get("img")
        arcana = card.get("arcana")
        suit = card.get("suit")
        number = card.get("number")

        if name == "Card Back":
            luc_name = "CardBacks.jpg"
            target = "card-back.jpg"
        elif arcana == "Major Arcana":
            luc_name = luciellaes_major_name(number, name)
            target = img
        else:
            luc_name = luciellaes_minor_name(suit, number)
            target = img

        entries.append(
            {
                "id": img.replace(".jpg", "").replace(".png", "") if img else None,
                "name": name,
                "luciellaesFile": luc_name,
                "projectFile": target,
                "imageUrl": f"/tarot/rider-waite/{target}" if target else None,
            }
        )

    entries.extend(
        [
            {
                "id": "card-back",
                "name": "Card back (CC0)",
                "luciellaesFile": "CardBacks.jpg",
                "projectFile": "card-back.jpg",
                "imageUrl": "/tarot/rider-waite/card-back.jpg",
            },
            {
                "id": "card-border",
                "name": "Card border overlay",
                "luciellaesFile": "cardBorder.png",
                "projectFile": "card-border.png",
                "imageUrl": "/tarot/rider-waite/card-border.png",
            },
        ]
    )
    return {
        "source": "luciellaes.itch.io/rider-waite-smith-tarot-cards-cc0",
        "author": "Luciella Elisabeth Scarlett (LuciellaES)",
        "license": "CC0 (card back design); RWS illustrations public domain",
        "fetchedAt": time.strftime("%Y-%m-%d"),
        "cards": entries,
    }


def copy_asset(src_dir: Path, luc_name: str, dest: Path, *, force: bool) -> str:
    src = src_dir / luc_name
    if not src.exists():
        return "missing_source"
    if dest.exists() and not force:
        return "skipped_exists"
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)
    return "copied"


def update_license_note() -> None:
    note = (
        "\n\n---\n"
        "Card back + border + optional face scans:\n"
        "https://luciellaes.itch.io/rider-waite-smith-tarot-cards-cc0\n"
        "Luciella Elisabeth Scarlett — CC0 card back; RWS art public domain.\n"
        "Refresh: python3 scripts/fetch_luciellaes_rider_waite.py\n"
    )
    current = LICENSE_FILE.read_text(encoding="utf-8") if LICENSE_FILE.exists() else ""
    if "luciellaes.itch.io" not in current:
        LICENSE_FILE.write_text(current.rstrip() + note, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--replace-faces",
        action="store_true",
        help="Replace existing 78 face JPGs with luciellaes cleaned scans (300x527)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Report missing assets without downloading",
    )
    args = parser.parse_args()

    if not META_JSON.exists():
        raise SystemExit(f"Missing {META_JSON} — run fetch_rider_waite_images.py first")

    cards_meta = json.loads(META_JSON.read_text(encoding="utf-8")).get("cards", [])
    manifest = build_manifest(cards_meta)

    existing = {p.name for p in PUBLIC_DIR.glob("*") if p.is_file()}
    planned = {e["projectFile"] for e in manifest["cards"] if e.get("projectFile")}
    missing = sorted(planned - existing)

    print(f"Project images: {len(existing)} files in {PUBLIC_DIR}")
    print(f"Luciellaes pack maps to {len(planned)} project files")
    print(f"Missing in project: {len(missing)}")
    for name in missing:
        luc = next(e["luciellaesFile"] for e in manifest["cards"] if e["projectFile"] == name)
        print(f"  - {name}  ←  {luc}")

    if args.dry_run:
        return

    with tempfile.TemporaryDirectory(prefix="luciellaes-rws-") as tmp:
        tmp_path = Path(tmp)
        zip_path = tmp_path / "Cards-jpg.zip"
        border_path = tmp_path / "cardBorder.png"

        opener = itch_opener()
        print("Downloading Cards-jpg.zip from itch.io...")
        itch_download_file(opener, UPLOAD_JPG_ZIP, zip_path)
        print("Downloading cardBorder.png from itch.io...")
        itch_download_file(opener, UPLOAD_CARD_BORDER, border_path)

        extract_dir = tmp_path / "extracted"
        with zipfile.ZipFile(zip_path) as zf:
            zf.extractall(extract_dir)

        jpg_dirs = list(extract_dir.rglob("Cards-jpg"))
        if not jpg_dirs:
            raise SystemExit("Could not find Cards-jpg folder inside zip")
        src_dir = jpg_dirs[0]

        stats = {"copied": 0, "skipped_exists": 0, "missing_source": 0}

        # Always import back + border if missing (or force for border)
        for luc_name, project_name in [
            ("CardBacks.jpg", "card-back.jpg"),
        ]:
            status = copy_asset(
                src_dir,
                luc_name,
                PUBLIC_DIR / project_name,
                force=True,
            )
            stats[status] = stats.get(status, 0) + 1
            print(f"{project_name}: {status}")

        border_dest = PUBLIC_DIR / "card-border.png"
        border_dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(border_path, border_dest)
        stats["copied"] += 1
        print("card-border.png: copied")

        if args.replace_faces:
            for entry in manifest["cards"]:
                target = entry.get("projectFile")
                luc = entry.get("luciellaesFile")
                if not target or not luc or target in ("card-back.jpg", "card-border.png"):
                    continue
                status = copy_asset(src_dir, luc, PUBLIC_DIR / target, force=True)
                stats[status] = stats.get(status, 0) + 1
            print(f"Face cards: replaced from luciellaes ({stats['copied']} copied)")

        MANIFEST_JSON.write_text(
            json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        update_license_note()
        print(f"Wrote manifest → {MANIFEST_JSON}")
        print(f"Done. copied={stats.get('copied',0)} skipped={stats.get('skipped_exists',0)} missing_source={stats.get('missing_source',0)}")


if __name__ == "__main__":
    main()