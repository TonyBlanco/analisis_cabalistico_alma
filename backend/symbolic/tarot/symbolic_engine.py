from __future__ import annotations

from dataclasses import dataclass
import importlib
from typing import Any, Optional
import unicodedata


@dataclass(frozen=True)
class SymbolicEngineInput:
    system_id: str
    system_label: str
    card_name: str
    arcana: str
    keywords: list[str]
    spread_type: str = "simple"
    position: str = "central"
    intention: str = ""


def _system_frame(system_id: str) -> str:
    frames: dict[str, str] = {
        "marsella": "Marsella: lectura arquetípica y observacional (mock educativo).",
        "golden-dawn": "Golden Dawn: lectura hermética estructural (mock educativo).",
        "tarot-cabalistico": "Cabalístico: lectura simbólica del Árbol de la Vida (mock educativo).",
        "oracle-symbolic": "Oráculo: lectura simbólica libre y estructurada (mock educativo).",
        "rider-waite": "Rider–Waite: lectura simbólica narrativa (mock educativo).",
        "rota": "R.O.T.A.: lectura hermética sintética (mock educativo).",
        "thoth": "Thoth: lectura hermética/astrológica con correspondencias (mock educativo).",
        "bota": "B.O.T.A.: lectura cabalística estructurada (mock educativo).",
        "hermetic": "Hermetic: lectura esotérica estructural (mock educativo).",
        "sephiroth": "Sephiroth: lectura del Árbol de la Vida por correspondencias (mock educativo).",
    }
    return frames.get(system_id, "Lectura simbólica estructurada (mock educativo).")

_SYSTEM_MEANINGS_MODULE: dict[str, str] = {
    "golden-dawn": "golden_dawn",
    "golden_dawn": "golden_dawn",
    "golden_dawn_tarot": "golden_dawn",
    "rota": "rota",
    "rota_tarot": "rota",
    "marsella": "marsella",
    "tarot_de_marsella_symbolic": "marsella",
    "rider-waite": "rider_waite",
    "rider_waite": "rider_waite",
    "rider_waite_symbolic": "rider_waite",
    "tarot-cabalistico": "tarot_cabalistico",
    "tarot_cabalistico": "tarot_cabalistico",
    "tarot_cabalistico_tree_of_life": "tarot_cabalistico",
    "cabalistic": "tarot_cabalistico",
    "oracle-symbolic": "oracle_symbolic",
    "oracle_symbolic": "oracle_symbolic",
    "oracle_generic": "oracle_symbolic",
    "generic_symbolic_oracle": "oracle_symbolic",
}


def _strip_accents(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    return "".join(char for char in normalized if not unicodedata.combining(char))


_MAJOR_ARCANA_CANONICAL_ES: list[str] = [
    "El Loco",
    "El Mago",
    "La Sacerdotisa",
    "La Emperatriz",
    "El Emperador",
    "El Hierofante",
    "Los Enamorados",
    "El Carro",
    "La Justicia",
    "El Ermitaño",
    "La Rueda de la Fortuna",
    "La Fuerza",
    "El Colgado",
    "La Muerte",
    "La Templanza",
    "El Diablo",
    "La Torre",
    "La Estrella",
    "La Luna",
    "El Sol",
    "El Juicio",
    "El Mundo",
]


_NAME_TO_CANONICAL_ES: dict[str, str] = {
    # English
    "the fool": "El Loco",
    "the magician": "El Mago",
    "the high priestess": "La Sacerdotisa",
    "the empress": "La Emperatriz",
    "the emperor": "El Emperador",
    "the hierophant": "El Hierofante",
    "the lovers": "Los Enamorados",
    "the chariot": "El Carro",
    "justice": "La Justicia",
    "the hermit": "El Ermitaño",
    "wheel of fortune": "La Rueda de la Fortuna",
    "strength": "La Fuerza",
    "the hanged man": "El Colgado",
    "death": "La Muerte",
    "temperance": "La Templanza",
    "the devil": "El Diablo",
    "the tower": "La Torre",
    "the star": "La Estrella",
    "the moon": "La Luna",
    "the sun": "El Sol",
    "judgement": "El Juicio",
    "judgment": "El Juicio",
    "the world": "El Mundo",
    # French (Marsella common labels)
    "le bateleur": "El Mago",
    "la papesse": "La Sacerdotisa",
    "l imperatrice": "La Emperatriz",
    "l'imperatrice": "La Emperatriz",
    "l empereur": "El Emperador",
    "l'empereur": "El Emperador",
    "le pape": "El Hierofante",
    "l amoureux": "Los Enamorados",
    "l'amoureux": "Los Enamorados",
    "le chariot": "El Carro",
    "la justice": "La Justicia",
    "l hermite": "El Ermitaño",
    "l'hermite": "El Ermitaño",
    "la roue de fortune": "La Rueda de la Fortuna",
    "la force": "La Fuerza",
    "le pendu": "El Colgado",
    "xiii (sans nom)": "La Muerte",
    "temperance (fr)": "La Templanza",
    "temperance": "La Templanza",
    "le diable": "El Diablo",
    "la maison dieu": "La Torre",
    "l etoile": "La Estrella",
    "l'etoile": "La Estrella",
    "la lune": "La Luna",
    "le soleil": "El Sol",
    "le jugement": "El Juicio",
    "le monde": "El Mundo",
    # Spanish canonical (allow direct)
    **{_strip_accents(k).lower(): k for k in _MAJOR_ARCANA_CANONICAL_ES},
}


def _resolve_canonical_arcana_es(card_name: str) -> Optional[str]:
    key = _strip_accents(card_name or "").lower().strip()
    if not key:
        return None
    return _NAME_TO_CANONICAL_ES.get(key)


def _load_symbolic_meanings(system_id: str) -> dict[str, dict[str, Any]]:
    module_key = _SYSTEM_MEANINGS_MODULE.get(system_id)
    if not module_key:
        return {}
    module = importlib.import_module(f"symbolic.tarot.meanings.{module_key}")
    return getattr(module, "SYMBOLIC_MEANINGS", {}) or {}


def _meaning_entry(system_id: str, card_name: str) -> Optional[dict[str, Any]]:
    meanings = _load_symbolic_meanings(system_id)
    canonical_es = _resolve_canonical_arcana_es(card_name)
    if canonical_es and canonical_es in meanings:
        return meanings[canonical_es]
    return meanings.get(card_name)


def _core_meaning(system_id: str, card_name: str) -> str:
    entry = _meaning_entry(system_id, card_name)
    if entry and isinstance(entry.get("core"), str) and entry["core"].strip():
        return entry["core"].strip()
    return "Este sistema no define aún una lectura específica para esta carta."


def _keywords(system_id: str, card_name: str, fallback: list[str]) -> list[str]:
    entry = _meaning_entry(system_id, card_name)
    keywords = entry.get("keywords") if isinstance(entry, dict) else None
    if isinstance(keywords, list):
        cleaned = [str(k) for k in keywords if isinstance(k, (str, int)) and str(k).strip()]
        if cleaned:
            return cleaned[:10]
    return fallback[:10]


def _position_meaning(position: str, spread_type: str) -> str:
    if position == "central":
        return "Posición central: estado actual (lectura estructural, no azar narrativo)."
    return f"Posición {position}: lectura estructural dentro de '{spread_type}'."


def _contextual_meaning(intention: str, keywords: list[str]) -> str:
    focus = ", ".join(keywords[:3]) if keywords else "un patrón central"
    if intention.strip():
        return f"En relación con la intención proporcionada, esta carta señala {focus}."
    return f"En relación con el contexto actual, esta carta señala {focus}."


def build_minimal_symbolic_reading(payload: SymbolicEngineInput) -> dict[str, Any]:
    resolved_keywords = _keywords(payload.system_id, payload.card_name, payload.keywords)
    return {
        "system": {"id": payload.system_id, "label": payload.system_label},
        "card": {"name": payload.card_name, "arcana": payload.arcana, "keywords": resolved_keywords},
        "symbolic_reading": {
            "core_meaning": _core_meaning(payload.system_id, payload.card_name),
            "contextual_meaning": _contextual_meaning(payload.intention, resolved_keywords),
            "position_meaning": _position_meaning(payload.position, payload.spread_type),
            "system_frame": _system_frame(payload.system_id),
        },
        "notes": "Lectura simbólica estructurada. No diagnóstica.",
    }


def build_symbolic_reading_for_payload(
    *,
    system_id: str,
    system_label: str,
    card: dict[str, Any],
    spread_type: str = "simple",
    position: str = "central",
    intention: str = "",
) -> dict[str, Any]:
    card_name = str(card.get("name") or card.get("id") or "Unknown")
    arcana = str(card.get("arcana") or "unknown")
    tags = card.get("tags") or []
    keywords = [str(k) for k in tags] if isinstance(tags, list) else []
    return build_minimal_symbolic_reading(
        SymbolicEngineInput(
            system_id=system_id,
            system_label=system_label,
            card_name=card_name,
            arcana=arcana,
            keywords=keywords,
            spread_type=spread_type,
            position=position,
            intention=intention,
        )
    )
