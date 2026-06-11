"""Localización al español para lecturas SWM v3 (tarot educativo)."""
from __future__ import annotations

from typing import Any, Dict, List, Optional

# Sistemas que usan mazo B.O.T.A. (keywords/consciousness en inglés en JSON)
BOTA_LIKE_SYSTEMS = frozenset({"bota", "thoth", "tarot-cabalistico"})

# Tirada del Árbol (10 Sefirot) — ids alineados con SefiraId / SEFIRA_TO_NUMBER (FE).
TREE_OF_LIFE_POSITIONS_ES: List[Dict[str, str]] = [
    {
        "id": "keter",
        "name": "Keter",
        "nameSpanish": "Keter",
        "meaning": "Corona — voluntad superior y origen del impulso.",
    },
    {
        "id": "chokmah",
        "name": "Chokmah",
        "nameSpanish": "Jojmá",
        "meaning": "Sabiduría — impulso expansivo y fuerza iniciadora.",
    },
    {
        "id": "binah",
        "name": "Binah",
        "nameSpanish": "Biná",
        "meaning": "Comprensión — forma, límite y estructuración.",
    },
    {
        "id": "chesed",
        "name": "Chesed",
        "nameSpanish": "Jesed",
        "meaning": "Misericordia — amor, generosidad y cohesión.",
    },
    {
        "id": "gevurah",
        "name": "Gevurah",
        "nameSpanish": "Geburá",
        "meaning": "Fuerza — discernimiento, límite y contención.",
    },
    {
        "id": "tiferet",
        "name": "Tiferet",
        "nameSpanish": "Tiferet",
        "meaning": "Belleza — equilibrio, corazón y síntesis.",
    },
    {
        "id": "netzach",
        "name": "Netzach",
        "nameSpanish": "Netsaj",
        "meaning": "Victoria — deseo, vitalidad y persistencia.",
    },
    {
        "id": "hod",
        "name": "Hod",
        "nameSpanish": "Hod",
        "meaning": "Esplendor — mente, comunicación y análisis.",
    },
    {
        "id": "yesod",
        "name": "Yesod",
        "nameSpanish": "Jesod",
        "meaning": "Fundamento — imaginación, puente y memoria.",
    },
    {
        "id": "malchut",
        "name": "Malchut",
        "nameSpanish": "Malkut",
        "meaning": "Reino — manifestación, cuerpo y presencia.",
    },
]

SPREAD_POSITIONS_ES: List[Dict[str, str]] = [
    {
        "id": "significator",
        "name": "Significador",
        "nameSpanish": "Significador",
        "meaning": "Representa al consultante o la situación central.",
    },
    {
        "id": "crossing",
        "name": "Cruce",
        "nameSpanish": "Cruce",
        "meaning": "Lo que cruza, tensiona o desafía la situación.",
    },
    {
        "id": "foundation",
        "name": "Fundamento",
        "nameSpanish": "Fundamento",
        "meaning": "Raíz, base o soporte de lo que se observa.",
    },
    {
        "id": "past",
        "name": "Pasado",
        "nameSpanish": "Pasado",
        "meaning": "Influencias recientes o antecedentes simbólicos.",
    },
    {
        "id": "crown",
        "name": "Corona",
        "nameSpanish": "Corona",
        "meaning": "Aspiración, posible desenlace o horizonte superior.",
    },
    {
        "id": "future",
        "name": "Futuro",
        "nameSpanish": "Futuro",
        "meaning": "Tendencia próxima o campo de lo que se gesta.",
    },
    {
        "id": "self",
        "name": "El Yo",
        "nameSpanish": "El Yo",
        "meaning": "Postura actual del consultante en la situación.",
    },
    {
        "id": "environment",
        "name": "Entorno",
        "nameSpanish": "Entorno",
        "meaning": "Contexto externo, vínculos y circunstancias.",
    },
    {
        "id": "hopes_fears",
        "name": "Esperanzas y temores",
        "nameSpanish": "Esperanzas y temores",
        "meaning": "Expectativas, anhelos y resistencias internas.",
    },
    {
        "id": "outcome",
        "name": "Resultado",
        "nameSpanish": "Resultado",
        "meaning": "Síntesis orientativa del proceso observado.",
    },
]


def spread_positions_for(spread_type: str) -> List[Dict[str, str]]:
    """Posiciones por tipo de tirada (tree_of_life → Sefirot; resto → cruz genérica)."""
    if spread_type == "tree_of_life":
        return TREE_OF_LIFE_POSITIONS_ES
    return SPREAD_POSITIONS_ES


SYSTEM_META_ES: Dict[str, Dict[str, str]] = {
    "thoth": {
        "description": "Tarot Thoth de Crowley con correspondencias astrológicas y cabalísticas.",
        "source": "Aleister Crowley y Lady Frieda Harris",
    },
    "golden-dawn": {
        "description": "Tradición de la Golden Dawn y correspondencias herméticas (Book T).",
        "source": "Orden Hermética de la Golden Dawn",
    },
    "bota": {
        "description": "Estudio cabalístico estructurado de Paul Foster Case (B.O.T.A.).",
        "source": "Paul Foster Case",
    },
    "rider-waite": {
        "description": "Iconografía clásica Rider–Waite–Smith y arquetipos occidentales.",
        "source": "Arthur Edward Waite y Pamela Colman Smith",
    },
    "marsella": {
        "description": "Tradición francesa del Tarot de Marsella e iconografía histórica.",
        "source": "Tradición francesa",
    },
    "rota": {
        "description": "Tarot hermético rosacruz con correspondencias de la Golden Dawn.",
        "source": "Tradición R.O.T.A.",
    },
    "oracle-symbolic": {
        "description": "Oráculo arquetípico universal sin sistema hermético fijo.",
        "source": "Capa simbólica Studios33",
    },
    "tarot-cabalistico": {
        "description": "Correspondencias del Árbol de la Vida y path working sefirótico.",
        "source": "Qabalah hermética",
    },
    "sephiroth": {
        "description": "Path working sefirótico y recorrido por el Árbol de la Vida.",
        "source": "Tradición cabalística",
    },
    "hermetic": {
        "description": "Simbolismo hermético de Godfrey Dowson (línea Golden Dawn).",
        "source": "Godfrey Dowson",
    },
}

CONTEXT_FOCUS_ES = {
    "general": "observación general",
    "love": "vínculo y relación",
    "career": "trabajo y vocación",
    "spiritual": "dimensión espiritual",
}

GLOSSARY_ES: Dict[str, str] = {
    "abundance": "abundancia",
    "action": "acción",
    "administration": "administración",
    "attention": "atención",
    "authority": "autoridad",
    "awakening": "despertar",
    "balance": "equilibrio",
    "beginning": "comienzo",
    "bondage": "atadura",
    "breakthrough": "ruptura",
    "breath": "aliento",
    "choice": "elección",
    "collective": "colectivo",
    "completion": "completitud",
    "concentration": "concentración",
    "consciousness": "consciencia",
    "constitution": "constitución",
    "container": "contenedor",
    "corporeal": "corpóreo",
    "creativity": "creatividad",
    "cycles": "ciclos",
    "death": "muerte",
    "digestion": "digestión",
    "discrimination": "discriminación",
    "disposition": "disposición",
    "dissolution": "disolución",
    "distillation": "destilación",
    "dominion": "dominio",
    "earth": "tierra",
    "elimination": "eliminación",
    "equilibrium": "equilibrio",
    "eternal": "eterno",
    "excitement": "excitación",
    "faithful": "fidelidad",
    "fertility": "fertilidad",
    "fire": "fuego",
    "focus": "foco",
    "fortune": "fortuna",
    "grace": "gracia",
    "hearing": "escucha",
    "hope": "esperanza",
    "illusion": "ilusión",
    "imagination": "imaginación",
    "influence": "influencia",
    "innocence": "inocencia",
    "intuition": "intuición",
    "judgment": "juicio",
    "justice": "justicia",
    "law": "ley",
    "logic": "lógica",
    "luminosity": "luminosidad",
    "manifestation": "manifestación",
    "materiality": "materialidad",
    "meditation": "meditación",
    "memory": "memoria",
    "mirth": "júbilo",
    "motion": "movimiento",
    "mystery": "misterio",
    "natural": "natural",
    "nature": "naturaleza",
    "organization": "organización",
    "perpetual": "perpetuo",
    "potential": "potencial",
    "probation": "prueba",
    "realization": "realización",
    "reason": "razón",
    "rebirth": "renacimiento",
    "receptivity": "receptividad",
    "regeneration": "regeneración",
    "renewal": "renovación",
    "response": "respuesta",
    "revelation": "revelación",
    "reversal": "reversión",
    "reward": "recompensa",
    "rotation": "rotación",
    "serpent": "serpiente",
    "sight": "vista",
    "sleep": "sueño",
    "smell": "olfato",
    "solitude": "soledad",
    "speech": "palabra",
    "spirit": "espíritu",
    "stability": "estabilidad",
    "star": "estrella",
    "strength": "fuerza",
    "structure": "estructura",
    "subconscious": "subconsciente",
    "suggestion": "sugestión",
    "sun": "sol",
    "support": "soporte",
    "surrender": "entrega",
    "suspension": "suspensión",
    "teaching": "enseñanza",
    "temperance": "templanza",
    "touch": "tacto",
    "tradition": "tradición",
    "transformation": "transformación",
    "transparency": "transparencia",
    "trial": "prueba",
    "triumph": "triunfo",
    "union": "unión",
    "unity": "unidad",
    "verification": "verificación",
    "victory": "victoria",
    "vitality": "vitalidad",
    "water": "agua",
    "wealth": "riqueza",
    "will": "voluntad",
    "world": "mundo",
    "Memory": "Memoria",
    "Intuition": "Intuición",
    "Creative Imagination": "Imaginación creativa",
    "Reason": "Razón",
    "Discrimination": "Discriminación",
    "Subjective Mind": "Mente subjetiva",
    "Subconsciousness": "Subconsciente",
    "Self-consciousness": "Autoconsciencia",
    "Super-consciousness": "Supraconsciencia",
    "Subjective consciousness": "Consciencia subjetiva",
    "Peace & Strife": "Paz y conflicto",
    "Wisdom & Folly": "Sabiduría y locura",
    "Wealth & Poverty": "Riqueza y pobreza",
    "Grace & Sin": "Gracia y pecado",
    "Life & Death": "Vida y muerte",
    "Fertility & Sterility": "Fertilidad y esterilidad",
    "Action; Work / Balance through Elimination": "Acción, obra y equilibrio mediante eliminación",
    "The Uniting Intelligence": "La Inteligencia Unificadora",
    "The Luminous Intelligence": "La Inteligencia Luminosa",
    "The Constituting Intelligence": "La Inteligencia Constituyente",
    "The Illuminating Intelligence": "La Inteligencia Iluminadora",
    "The Intelligence of Probation": "La Inteligencia de la Prueba",
    "The Intelligence of Transparency": "La Inteligencia de la Transparencia",
    "The Stable Intelligence": "La Inteligencia Estable",
    "The Spiritual Intelligence": "La Inteligencia Espiritual",
    "The Imaginative Intelligence": "La Inteligencia Imaginativa",
    "The Rewarding Intelligence": "La Inteligencia Retributiva",
    "The Exciting Intelligence": "La Inteligencia Excitante",
    "The Natural Intelligence": "La Inteligencia Natural",
    "The Intelligence of the Secret": "La Inteligencia del Secreto",
    "The Intelligence of Will": "La Inteligencia de la Voluntad",
    "The Collecting Intelligence": "La Inteligencia Colectiva",
    "The Perpetual Intelligence": "La Inteligencia Perpetua",
    "The Corporeal Intelligence": "La Inteligencia Corpórea",
    "The Administrative Intelligence": "La Inteligencia Administrativa",
    "The Intelligence of Mediation": "La Inteligencia de la Mediación",
    "The Faithful Intelligence": "La Inteligencia Fiel",
    "The Occult Intelligence": "La Inteligencia Oculta",
    "Camel": "Camello",
    "Door": "Puerta",
    "Window": "Ventana",
    "Nail": "Clavo",
    "Sword": "Espada",
    "Fence": "Cerca",
    "Closed Hand": "Mano cerrada",
    "Serpent": "Serpiente",
    "Closed Hand / Palm": "Mano cerrada / palma",
}


def translate_term(value: Optional[str]) -> Optional[str]:
    if not value or not isinstance(value, str):
        return value
    stripped = value.strip()
    if not stripped:
        return value
    if stripped in GLOSSARY_ES:
        return GLOSSARY_ES[stripped]
    lowered = stripped.lower()
    if lowered in GLOSSARY_ES:
        return GLOSSARY_ES[lowered]
    return stripped


def resolve_spanish_keywords(card_data: Dict[str, Any]) -> List[str]:
    raw_es = card_data.get("keywordsSpanish")
    if isinstance(raw_es, list) and raw_es:
        return [str(k).strip() for k in raw_es if str(k).strip()]
    raw = card_data.get("keywords") or []
    if not isinstance(raw, list):
        return []
    return [translate_term(str(k)) or str(k) for k in raw if str(k).strip()]


def apply_system_meta_es(system_id: str, meta: Dict[str, Any]) -> Dict[str, Any]:
    overlay = SYSTEM_META_ES.get(system_id)
    if not overlay:
        return meta
    merged = dict(meta)
    merged.update(overlay)
    return merged


def build_bota_core_spanish(card_data: Dict[str, Any]) -> Optional[str]:
    name = card_data.get("nameSpanish") or card_data.get("name") or "Carta"
    consciousness = card_data.get("consciousness") or {}
    kabbalistic = card_data.get("kabbalistic") or {}
    keywords_es = resolve_spanish_keywords(card_data)

    parts: List[str] = []
    power = translate_term(consciousness.get("power"))
    aspect = translate_term(consciousness.get("aspect"))
    faculty = translate_term(consciousness.get("humanFaculty"))

    if power and aspect:
        parts.append(f"{name} activa el poder de {power} en el ámbito de {aspect}")
    elif power:
        parts.append(f"{name} expresa el poder de {power}")
    elif aspect:
        parts.append(f"{name} trabaja el aspecto de {aspect}")

    if faculty:
        parts.append(f"con resonancia en {faculty}")

    intelligence = translate_term(kabbalistic.get("intelligence"))
    if intelligence:
        parts.append(f"Inteligencia cabalística: {intelligence}")

    if keywords_es:
        parts.append(f"Palabras clave: {', '.join(keywords_es[:5])}")

    if not parts:
        return None
    return ". ".join(parts) + "."


def format_position_meaning_es(position: Dict[str, Any]) -> str:
    pos_name = (
        position.get("nameSpanish")
        or position.get("name")
        or position.get("id")
        or "Posición"
    )
    pos_hint = position.get("meaning") or ""
    text = f"En la posición «{pos_name}»"
    if pos_hint:
        text += f": {pos_hint}"
    return text + "."