from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional


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


_MEANINGS: dict[str, dict[str, str]] = {
    "golden-dawn": {
        "The Fool": "Energía primordial antes de la manifestación; umbral de posibilidad.",
        "The Magician": "Voluntad concentrada: dirección, herramienta y acto de conjunción.",
        "The High Priestess": "Velo y receptividad: conocimiento velado y silencio operativo.",
    },
    "rota": {
        "Wheel of Fortune": "Ciclo y giro: punto de inflexión dentro de una estructura mayor.",
        "Temperance": "Síntesis: combinación de opuestos para estabilizar una nueva medida.",
        "The Tower": "Ruptura estructural: caída de una forma para revelar lo esencial.",
    },
    "marsella": {
        "Le Bateleur": "Potencial sin forma: manos, herramientas y comienzo de la acción.",
        "La Papesse": "Gestación: libro interior, pausa y maduración silenciosa.",
        "Le Chariot": "Dirección: avance con control y voluntad de movimiento.",
        "XIII (Sans Nom)": "Transición: corte y renovación, cierre de una etapa.",
    },
    "rider-waite": {
        "The Fool": "Inicio del viaje: impulso, confianza y apertura a lo nuevo.",
        "The Hermit": "Retiro lúcido: búsqueda interna y guía por claridad.",
        "Three of Cups": "Vínculo: soporte, celebración y comunidad.",
        "Ten of Swords": "Cierre: finalización de un ciclo y descarga de tensión.",
    },
    "tarot-cabalistico": {
        "Crown (Keter)": "Kéter: potencial previo a la emanación; origen de posibilidad.",
        "Heart (Tiferet)": "Tiferet: centro integrador; balance y coherencia.",
        "Foundation (Yesod)": "Yesod: fundamento y patrón; canalización de forma.",
    },
    "oracle-symbolic": {
        "Threshold": "Umbral: transición y elección consciente ante un cambio.",
        "Mirror": "Espejo: reconocimiento de patrón y reflejo de sentido.",
        "Seed": "Semilla: inicio y crecimiento sostenido; latencia fértil.",
        "Thread": "Hilo: conexión y continuidad; tejido de significado.",
    },
    "thoth": {
        "The Fool": "Aleph como impulso de comienzo: apertura y potencia inicial.",
        "The Magus": "Dirección de la voluntad: foco, herramienta y acto de enlace.",
    },
}


def _core_meaning(system_id: str, card_name: str) -> str:
    system_map = _MEANINGS.get(system_id, {})
    meaning = system_map.get(card_name)
    if meaning:
        return meaning
    return "Este sistema no define aún una lectura específica para esta carta."


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
    return {
        "system": {"id": payload.system_id, "label": payload.system_label},
        "card": {"name": payload.card_name, "arcana": payload.arcana, "keywords": payload.keywords},
        "symbolic_reading": {
            "core_meaning": _core_meaning(payload.system_id, payload.card_name),
            "contextual_meaning": _contextual_meaning(payload.intention, payload.keywords),
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

