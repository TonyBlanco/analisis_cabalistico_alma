"""Parameter normalization helpers for astrology-kerykeion.

Goal: accept frontend-friendly codes (e.g. 'P') and canonical names (e.g. 'placidus')
without breaking backward compatibility.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


HOUSE_SYSTEM_CODE_TO_NAME = {
    "P": "placidus",
    "K": "koch",
    "R": "regiomontanus",
    "C": "campanus",
    "A": "equal",  # Swiss Ephemeris: 'A' = Equal
    "E": "equal",  # accepted alias from some UIs
    "W": "whole_sign",
}

HOUSE_SYSTEM_NAME_TO_CODE = {
    "placidus": "P",
    "koch": "K",
    "regiomontanus": "R",
    "campanus": "C",
    "equal": "A",
    "whole_sign": "W",
}


def normalize_house_system(value: Optional[str]) -> str:
    """Return canonical house system name (e.g. 'placidus')."""
    if not value:
        return "placidus"

    raw = str(value).strip()
    if not raw:
        return "placidus"

    upper = raw.upper()
    if len(upper) == 1 and upper in HOUSE_SYSTEM_CODE_TO_NAME:
        return HOUSE_SYSTEM_CODE_TO_NAME[upper]

    lowered = raw.strip().lower()
    # Allow a few common variants
    aliases = {
        "whole": "whole_sign",
        "whole-sign": "whole_sign",
        "whole sign": "whole_sign",
        "regio": "regiomontanus",
        "camp": "campanus",
    }
    lowered = aliases.get(lowered, lowered)

    if lowered in HOUSE_SYSTEM_NAME_TO_CODE:
        return lowered

    raise ValueError(
        "house_system debe ser uno de: placidus, koch, equal, whole_sign, regiomontanus, campanus "
        "o códigos: P, K, A/E, W, R, C"
    )


def house_system_to_engine_code(value: Optional[str]) -> str:
    """Return engine/SWE house system code (e.g. 'P', 'A', 'W')."""
    name = normalize_house_system(value)
    return HOUSE_SYSTEM_NAME_TO_CODE[name]


def normalize_zodiac_type(value: Optional[str], fallback: Optional[str] = None) -> str:
    """Return canonical zodiac type: 'tropical' | 'sidereal' | 'draconic'."""
    raw = (value or fallback or "tropical")
    raw = str(raw).strip()
    if not raw:
        return "tropical"

    upper = raw.upper()
    if upper in ("T", "TROPICAL"):
        return "tropical"
    if upper in ("S", "SIDEREAL"):
        return "sidereal"
    if upper in ("D", "DRACONIC"):
        return "draconic"

    lowered = raw.lower()
    if lowered in ("tropical", "sidereal", "draconic"):
        return lowered

    raise ValueError("zodiac_type debe ser uno de: tropical, sidereal, draconic")


def zodiac_type_to_engine_code(zodiac_type: str) -> str:
    """Map canonical zodiac type to engine code.

    - Tropical -> 'T'
    - Sidereal -> 'S'
    - Draconic -> computed from Tropical then transformed, so we mark base as 'T'
    """
    z = normalize_zodiac_type(zodiac_type)
    if z == "sidereal":
        return "S"
    # tropical + draconic base on tropical
    return "T"


@dataclass(frozen=True)
class NormalizedKerykeionParams:
    house_system_name: str
    house_system_code: str
    zodiac_type: str
    zodiac_type_code: str
    ayanamsha: Optional[str]


def normalize_params(
    *,
    house_system: Optional[str] = None,
    zodiac_type: Optional[str] = None,
    zodiac_system: Optional[str] = None,
    ayanamsha: Optional[str] = None,
) -> NormalizedKerykeionParams:
    hs_name = normalize_house_system(house_system)
    hs_code = house_system_to_engine_code(house_system)

    z_type = normalize_zodiac_type(zodiac_type, fallback=zodiac_system)
    z_code = zodiac_type_to_engine_code(z_type)

    ay = (ayanamsha.strip().lower() if isinstance(ayanamsha, str) and ayanamsha.strip() else None)

    return NormalizedKerykeionParams(
        house_system_name=hs_name,
        house_system_code=hs_code,
        zodiac_type=z_type,
        zodiac_type_code=z_code,
        ayanamsha=ay,
    )
