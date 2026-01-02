from __future__ import annotations

from typing import Any

from symbolic.tarot.loaders.bota_loader import get_bota_card


_ELEMENT_ES: dict[str, str] = {
    "air": "Aire",
    "water": "Agua",
    "fire": "Fuego",
    "earth": "Tierra",
}

_PLANET_ES: dict[str, str] = {
    "mercury": "Mercurio",
    "venus": "Venus",
    "mars": "Marte",
    "jupiter": "Júpiter",
    "saturn": "Saturno",
    "sun": "Sol",
    "moon": "Luna",
}

_SIGN_ES: dict[str, str] = {
    "aries": "Aries",
    "taurus": "Tauro",
    "gemini": "Géminis",
    "cancer": "Cáncer",
    "leo": "Leo",
    "virgo": "Virgo",
    "libra": "Libra",
    "scorpio": "Escorpio",
    "sagittarius": "Sagitario",
    "capricorn": "Capricornio",
    "aquarius": "Acuario",
    "pisces": "Piscis",
}


def _safe_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _safe_list(value: Any) -> list[Any]:
    return value if isinstance(value, list) else []


def _as_es_value(value: Any, mapping: dict[str, str]) -> str | None:
    if value is None:
        return None
    raw = str(value).strip()
    if not raw:
        return None
    key = raw.lower()
    return mapping.get(key) or raw


def build_bota_observation_from_symbols(symbols: dict[str, Any], *, reversed_flag: bool) -> str:
    kabbalistic = _safe_dict(symbols.get("kabbalistic"))

    hebrew_letter = kabbalistic.get("hebrewLetter")
    letter_value = kabbalistic.get("letterValue")
    path = kabbalistic.get("path")
    sefirot = _safe_list(kabbalistic.get("sefirot"))
    element = _as_es_value(kabbalistic.get("element"), _ELEMENT_ES)
    planet = _as_es_value(kabbalistic.get("planet"), _PLANET_ES)
    sign = _as_es_value(kabbalistic.get("sign"), _SIGN_ES)

    parts: list[str] = []
    if isinstance(hebrew_letter, str) and hebrew_letter.strip():
        if isinstance(letter_value, int):
            parts.append(f"Letra: {hebrew_letter.strip()} ({letter_value}).")
        else:
            parts.append(f"Letra: {hebrew_letter.strip()}.")
    else:
        return ""

    if isinstance(path, int):
        parts.append(f"Sendero: {path}.")
    elif isinstance(path, str) and path.strip():
        parts.append(f"Sendero: {path.strip()}.")
    # If missing, omit.

    sef = [str(s).strip() for s in sefirot if str(s).strip()]
    if sef:
        joined = f"{sef[0]}–{sef[1]}" if len(sef) >= 2 else sef[0]
        parts.append(f"Sefirot: {joined}.")
    # If missing, omit.

    if element:
        parts.append(f"Elemento: {element}.")

    if planet:
        parts.append(f"Planeta: {planet}.")

    if sign:
        parts.append(f"Signo: {sign}.")

    _ = reversed_flag

    return " ".join(parts).strip()


def build_bota_observation(card_id_or_code: Any, *, reversed_flag: bool) -> str:
    card = get_bota_card(card_id_or_code) or {}
    symbols = {"kabbalistic": _safe_dict(card.get("kabbalistic"))}
    return build_bota_observation_from_symbols(symbols, reversed_flag=reversed_flag)
