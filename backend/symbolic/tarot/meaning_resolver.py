from __future__ import annotations

from dataclasses import dataclass
import importlib
from typing import Any, Optional
import unicodedata


@dataclass(frozen=True)
class ResolveInput:
    system_id: str
    system_label: str
    card: dict[str, Any]
    position: dict[str, Any] | None = None
    reversed: bool = False
    context_focus: str = "general"


_SYSTEM_MEANINGS_MODULE: dict[str, str] = {
    "thoth": "thoth",
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
    # Minimal systems
    "hermetic": "thoth",
    "sephiroth": "thoth",
}


_SYSTEM_FRAME: dict[str, str] = {
    "marsella": "Marsella: lectura arquetípica y observacional (mock educativo).",
    "golden-dawn": "Golden Dawn: lectura hermética estructural (mock educativo).",
    "tarot-cabalistico": "Cabalístico: lectura simbólica del Árbol de la Vida (mock educativo).",
    "oracle-symbolic": "Oráculo: lectura simbólica libre y estructurada (mock educativo).",
    "rider-waite": "Rider–Waite: lectura simbólica narrativa (mock educativo).",
    "rota": "R.O.T.A.: lectura hermética sintética (mock educativo).",
    "thoth": "Thoth: lectura hermética/astrológica con correspondencias (mock educativo).",
    "bota": "B.O.T.A.: correspondencias cabalísticas (observacional).",
    "hermetic": "Hermetic: lectura esotérica estructural (mock educativo).",
    "sephiroth": "Sephiroth: lectura del Árbol de la Vida por correspondencias (mock educativo).",
}


_POSITION_TEMPLATES: dict[str, str] = {
    "origin": "En la posición Origen, {card} describe un punto de partida simbólico.",
    "present": "En la posición Presente, {card} refleja el estado actual observable.",
    "direction": "En la posición Dirección, {card} señala una tendencia simbólica posible.",
    "visible": "En la posición Lo visible, {card} muestra lo que está en primer plano.",
    "underlying": "En la posición Lo subyacente, {card} indica una estructura de fondo que sostiene.",
    "central": "En la posición central, {card} describe el estado actual.",
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
    "l'empereur": "El Emperador",
    "le pape": "El Hierofante",
    "l'amoureux": "Los Enamorados",
    "le chariot": "El Carro",
    "la justice": "La Justicia",
    "l'hermite": "El Ermitaño",
    "la roue de fortune": "La Rueda de la Fortuna",
    "la force": "La Fuerza",
    "le pendu": "El Colgado",
    "xiii (sans nom)": "La Muerte",
    "le diable": "El Diablo",
    "la maison dieu": "La Torre",
    "l'etoile": "La Estrella",
    "la lune": "La Luna",
    "le soleil": "El Sol",
    "le jugement": "El Juicio",
    "le monde": "El Mundo",
    # Spanish canonical direct
    **{_strip_accents(k).lower(): k for k in _MAJOR_ARCANA_CANONICAL_ES},
}


def _resolve_canonical_es(name: str) -> Optional[str]:
    key = _strip_accents(name or "").lower().strip()
    if not key:
        return None
    return _NAME_TO_CANONICAL_ES.get(key)


def _load_meanings(system_id: str) -> dict[str, dict[str, Any]]:
    module_key = _SYSTEM_MEANINGS_MODULE.get(system_id)
    if not module_key:
        return {}
    module = importlib.import_module(f"symbolic.tarot.meanings.{module_key}")
    return getattr(module, "SYMBOLIC_MEANINGS", {}) or {}


def _meaning_entry(system_id: str, card_name: str) -> Optional[dict[str, Any]]:
    meanings = _load_meanings(system_id)
    canonical_es = _resolve_canonical_es(card_name)
    if canonical_es and canonical_es in meanings:
        return meanings[canonical_es]
    return meanings.get(card_name)


def _card_label(card: dict[str, Any]) -> str:
    name_es = card.get("nameSpanish")
    if isinstance(name_es, str) and name_es.strip():
        return name_es.strip()
    name = card.get("name")
    if isinstance(name, str) and name.strip():
        canonical = _resolve_canonical_es(name)
        return canonical or name.strip()
    return str(card.get("id") or "Carta").strip() or "Carta"


def _keywords(card: dict[str, Any], entry: Optional[dict[str, Any]]) -> list[str]:
    kw = card.get("keywords")
    if isinstance(kw, list):
        cleaned = [str(k).strip() for k in kw if str(k).strip()]
        if cleaned:
            return cleaned[:10]

    tags = card.get("tags")
    if isinstance(tags, list):
        cleaned = [str(k).strip() for k in tags if str(k).strip()]
        if cleaned:
            return cleaned[:10]

    if isinstance(entry, dict):
        from_table = entry.get("keywords")
        if isinstance(from_table, list):
            cleaned = [str(k).strip() for k in from_table if str(k).strip()]
            if cleaned:
                return cleaned[:10]
    return []


def _core_meaning(
    *,
    reversed: bool,
    entry: Optional[dict[str, Any]],
    card_label: str,
    keywords: list[str],
) -> str:
    core = entry.get("core") if isinstance(entry, dict) else None
    core_text = core.strip() if isinstance(core, str) else ""
    if not core_text:
        if keywords:
            return f"{card_label}: {', '.join(keywords[:4])}."
        return f"{card_label}: símbolo estructural (mock educativo)."
    if reversed:
        return f"En inversión, {card_label} enfatiza tensión o bloqueo dentro del mismo símbolo: {core_text}"
    return core_text


def _position_meaning(position: dict[str, Any] | None, card_label: str) -> str:
    position_id = (position or {}).get("id") if isinstance(position, dict) else None
    pid = position_id.strip() if isinstance(position_id, str) else "central"
    tmpl = _POSITION_TEMPLATES.get(pid) or _POSITION_TEMPLATES["central"]
    return tmpl.format(card=card_label)


def _context_meaning(
    *,
    context_focus: str,
    upright: dict[str, str],
    reversed_ctx: dict[str, str],
    reversed: bool,
) -> str:
    focus = (context_focus or "general").strip().lower()
    if focus not in {"general", "love", "career", "spiritual"}:
        focus = "general"
    source = reversed_ctx if reversed else upright
    text = source.get(focus) or source.get("general") or ""
    return text.strip() if isinstance(text, str) else ""


def resolveSymbolicMeaning(payload: ResolveInput) -> dict[str, Any]:
    if payload.system_id == "bota":
        from symbolic.tarot.bota_observation import build_bota_observation_from_symbols

        card_label = _card_label(payload.card)
        symbols = payload.card.get("symbols") if isinstance(payload.card.get("symbols"), dict) else {}
        observation = build_bota_observation_from_symbols(symbols, reversed_flag=payload.reversed)
        return {
            "title": card_label,
            "core_meaning": observation,
            "position_meaning": "",
            "context_meaning": "",
            "contextual_meaning": "",
            "system_frame": _SYSTEM_FRAME.get("bota", "B.O.T.A.: correspondencias cabalísticas (observacional)."),
            "keywords": [],
            "upright": {},
            "reversed": {},
        }

    card_label = _card_label(payload.card)
    entry = _meaning_entry(payload.system_id, payload.card.get("name") or payload.card.get("id") or "")
    keywords = _keywords(payload.card, entry)

    # Build upright/reversed contexts deterministically from the meanings table (major arcana)
    general_upright = (entry.get("core") if isinstance(entry, dict) else None) or ""
    general_upright = general_upright.strip() if isinstance(general_upright, str) else ""
    if not general_upright:
        general_upright = _core_meaning(reversed=False, entry=entry, card_label=card_label, keywords=keywords)
    general_reversed = f"En inversión, {card_label} reformula el símbolo como tensión o bloqueo dentro de su estructura."

    upright = {"general": general_upright}
    reversed_ctx = {"general": general_reversed}

    core_meaning = _core_meaning(reversed=payload.reversed, entry=entry, card_label=card_label, keywords=keywords)
    position_meaning = _position_meaning(payload.position, card_label)
    context_meaning = _context_meaning(
        context_focus=payload.context_focus,
        upright=upright,
        reversed_ctx=reversed_ctx,
        reversed=payload.reversed,
    )

    # Avoid storing free text input: do NOT echo raw intention.
    contextual = (
        f"Contexto aplicado: {payload.context_focus or 'general'}. {context_meaning}"
        if context_meaning
        else f"Contexto aplicado: {payload.context_focus or 'general'}."
    )

    return {
        "title": card_label,
        "core_meaning": core_meaning,
        "position_meaning": position_meaning,
        "context_meaning": context_meaning or "",
        # Backward-compatible alias used elsewhere
        "contextual_meaning": contextual,
        "system_frame": _SYSTEM_FRAME.get(payload.system_id, "Lectura simbólica estructurada (mock educativo)."),
        "keywords": keywords,
        "upright": upright,
        "reversed": reversed_ctx,
    }
