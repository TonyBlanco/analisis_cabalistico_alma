"""Deterministic symbolic helpers for Kabbalah-focused tests.

The real production engine lives in Phoenix Bridge, but the tests only need
stable, explainable behaviour. These helpers implement a lightweight scoring
model that mirrors the documented rules in docs/PHOENIX_BRIDGE_IMPLEMENTATION.md.
"""
from __future__ import annotations

from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple

from . import kabbalah_mappings


LETTER_BONUS = 0.5
DOMINANT_MULTIPLIER = 1.3
DEFAULT_STRENGTH = 0.5
HOUSE_WEIGHTS: Dict[int, float] = {
    1: 0.5,
    2: 0.2,
    3: 0.1,
    4: 0.5,
    5: 0.2,
    6: 0.2,
    7: 0.5,
    8: 0.3,
    9: 0.2,
    10: 0.5,
    11: 0.3,
    12: 0.1,
}

SEFER_LETTERS: Dict[str, Dict[str, Any]] = {
    'ALEPH': {
        'letter': 'Aleph',
        'element': 'Aire',
        'path': 11,
        'sefirot': 'Keter ↔ Chokmah',
    },
    'BETH': {
        'letter': 'Beth',
        'element': 'Mercurio',
        'path': 12,
        'sefirot': 'Keter ↔ Binah',
    },
}


def _normalize_letters(payload: Any) -> Iterable[str]:
    if isinstance(payload, str):
        return [char for char in payload.upper() if char.isalpha()]
    if isinstance(payload, Sequence):
        return [str(char).upper() for char in payload]
    return []


def _planet_lookup(planets: Sequence[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    mapping: Dict[str, Dict[str, Any]] = {}
    for planet in planets:
        name = str(planet.get('name', '')).lower()
        if name:
            mapping[name] = planet
    return mapping


def map_sefer_letter(letter: str) -> Optional[Dict[str, Any]]:
    """Return metadata for a Hebrew letter used in the Tree of Life."""

    if not letter:
        return None
    return SEFER_LETTERS.get(letter.strip().upper())


def score_72_names(
    natal: Dict[str, Any],
    names_map: Optional[Dict[str, Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """Score curated 72 Names of God against a natal profile.

    The scoring is intentionally simple but mirrors Phoenix Bridge rules:
    - Each matching birth letter adds 0.5.
    - Associated planets inherit their recorded strength, boosted by house
      weight and dominant multipliers.
    - Results are returned as both score dict and ranking list.
    """

    if names_map is None:
        names_map = kabbalah_mappings.load_72_names()

    birth_letters = set(_normalize_letters(natal.get('birth_name_letters', '')))
    dominant_planets = {p.lower() for p in natal.get('dominant_planets', [])}
    planets = _planet_lookup(natal.get('planets', []))

    scores: Dict[str, float] = {}

    for name, payload in names_map.items():
        entry_letters = set(_normalize_letters(payload.get('letters', '')))
        letter_matches = birth_letters.intersection(entry_letters)
        letter_score = LETTER_BONUS * len(letter_matches)

        planet_score = 0.0
        planet_name = str(payload.get('associated_planet', '')).lower()
        if planet_name and planet_name in planets:
            planet = planets[planet_name]
            strength = float(planet.get('strength') or DEFAULT_STRENGTH)
            house = int(planet.get('house') or 0)
            house_bonus = HOUSE_WEIGHTS.get(house, 0.0)
            planet_score = strength * (1 + house_bonus)
            if planet_name in dominant_planets:
                planet_score *= DOMINANT_MULTIPLIER

        scores[name] = round(letter_score + planet_score, 4)

    ranking: List[Tuple[str, float]] = sorted(
        scores.items(), key=lambda item: item[1], reverse=True
    )

    return {
        'scores': scores,
        'ranking': ranking,
        'letters_used': sorted(birth_letters),
    }


def compute_tikun_signals(
    natal: Dict[str, Any],
    *,
    sephirot_mapping: Optional[Dict[str, Dict[str, Any]]] = None,
) -> List[Dict[str, Any]]:
    """Produce lightweight tikún remediation recommendations."""

    sephirot_mapping = sephirot_mapping or {}
    signals: List[Dict[str, Any]] = []

    missing_codes = natal.get('inclusion_base', {}).get('ausentes', [])
    for code in missing_codes:
        code_str = str(code)
        signals.append(
            {
                'type': 'sefirot_absence',
                'code': code_str,
                'label': sephirot_mapping.get(code_str, {}).get(
                    'name', f'Sefirá {code_str}'
                ),
            }
        )

    age = natal.get('dias_fuerza', {}).get('edad_transformacion')
    if age is not None:
        signals.append({'type': 'age_transform', 'age': age})

    return signals

