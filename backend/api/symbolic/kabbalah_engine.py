"""Deterministic Kabbalah rule engine (Phase 1 PoC).

Functions implemented:
- map_sefer_letter(letter, mappings=None)
- score_72_names(natal_summary, names_mapping=None)
- compute_tikun_signals(natal_summary, sephirot_mapping=None)

PoC design: functions accept mapping dicts for testability; when not provided they use loader fallbacks.
"""
from typing import Dict, Any, List, Optional
from .kabbalah_mappings import load_sefer_yetzirah, load_72_names, load_sephirot

# Tunable PoC constants
HOUSE_WEIGHT_ANGULAR = 0.5
HOUSE_WEIGHT_SUCCEDENT = 0.2
HOUSE_WEIGHT_CADENT = 0.0
DOMINANT_MULTIPLIER = 1.3
LETTER_BONUS = 0.5


def _derive_strengths_from_houses(planets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """If planets don't include explicit 'strength', derive a baseline from house.

    - Angular houses (1,4,7,10) -> 0.8
    - Succedent (2,5,8,11) -> 0.6
    - Cadent (3,6,9,12) -> 0.4

    This is a simple heuristic used for PoC tuning.
    """
    derived = []
    for p in planets:
        newp = dict(p)
        if newp.get('strength') is None:
            h = newp.get('house')
            if h in (1, 4, 7, 10):
                newp['strength'] = 0.8
            elif h in (2, 5, 8, 11):
                newp['strength'] = 0.6
            else:
                newp['strength'] = 0.4
        derived.append(newp)
    return derived


def map_sefer_letter(letter: str, mappings: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    """Map a Hebrew letter (or translit) to the Sefer Yetzirah mapping.

    Returns the mapping entry or None if not found.
    """
    if not mappings:
        mappings = load_sefer_yetzirah() or {}

    if not letter:
        return None

    key = letter.strip().lower()
    return mappings.get(key) or None


def score_72_names(natal_summary: Dict[str, Any], names_mapping: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Score the 72 Names against a natal summary.

    PoC scoring algorithm (weighted):
    - For each name, compute a planet match score based on:
      * planet_strength (from natal_summary['planets']) if available (0..1)
      * house importance multiplier: angular houses (1,4,7,10) +0.5, succedent (2,5,8,11) +0.2, cadent (3,6,9,12) +0
      * dominant planets get a bonus multiplier (x1.3)
    - Letter match bonus: +0.5 for any shared letter between name and birth_name_letters

    Returns a dict {name_key: score} and a ranking list.
    """
    if not names_mapping:
        names_mapping = load_72_names() or {}

    dominant = set((natal_summary.get('dominant_planets', []) or []))
    birth_letters = natal_summary.get('birth_name_letters', '') or ''

    # Build planet lookup: name -> {strength, house}
    planets_list = natal_summary.get('planets', []) or []
    # If strengths not provided, derive them heuristically from house positions
    if planets_list and all(p.get('strength') is None for p in planets_list):
        planets_list = _derive_strengths_from_houses(planets_list)

    planet_info = {}
    for p in planets_list:
        pname = p.get('name')
        if not pname:
            continue
        planet_info[pname] = {
            'strength': float(p.get('strength') or 0.0),
            'house': int(p.get('house')) if p.get('house') is not None else None,
        }

    def house_weight(house: Optional[int]) -> float:
        if house in (1, 4, 7, 10):
            return 0.5
        if house in (2, 5, 8, 11):
            return 0.2
        return 0.0

    scores: Dict[str, float] = {}

    for key, entry in (names_mapping.items() if isinstance(names_mapping, dict) else []):
        score = 0.0
        assoc_planet = entry.get('associated_planet')
        if assoc_planet:
            info = planet_info.get(assoc_planet, {})
            base_strength = float(info.get('strength', 0.0))
            hw = house_weight(info.get('house'))
            planet_score = base_strength * (1.0 + hw)
            if assoc_planet in dominant:
                planet_score *= 1.3
            score += planet_score

        # letter bonus (smaller than planet weight)
        name_letters = entry.get('letters', '')
        if name_letters and any(ch in birth_letters for ch in name_letters):
            score += 0.5

        scores[key] = round(score, 4)

    # ranking (highest first)
    ranking = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
    return {'scores': scores, 'ranking': ranking}


def compute_tikun_signals(natal_summary: Dict[str, Any], sephirot_mapping: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """Compute simple Tikún signals from natal summary.

    PoC heuristic examples:
    - If certain sefirot have zero presence (e.g., 'absent' in natal_summary['inclusion_base']['ausentes']) produce suggestions.
    - If 'dias_fuerza' shows an age with turbulence, flag a Tikún of that age.
    """
    if not sephirot_mapping:
        sephirot_mapping = load_sephirot() or {}

    signals = []
    inclusion = natal_summary.get('inclusion_base', {}) or {}

    ausentes = inclusion.get('ausentes', []) or []
    if ausentes:
        signals.append({'type': 'sefirot_absence', 'details': {'absent_sephirot_ids': ausentes}, 'recommendation': 'Work with the missing sefirot through targeted practices.'})

    dias = natal_summary.get('dias_fuerza') or {}
    if dias and isinstance(dias, dict) and dias.get('edad_transformacion'):
        signals.append({'type': 'age_transform', 'details': {'age': dias.get('edad_transformacion')}, 'recommendation': 'Attention to life cycle at this age; recommend reflection work.'})

    return signals
