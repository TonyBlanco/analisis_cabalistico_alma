from __future__ import annotations

from typing import Any, Dict, Iterable, List, Optional, Tuple, Union

from cabala_py.arbol_vida import SEFIROTH, SENDEROS, obtener_sefira_por_numero, obtener_sendero_por_numero
from cabala_py.inclusion import calcular_inclusion_base
from cabala_py.numerology import calcular_camino_destino, calcular_valores_nombre
from api.astrology_kerykeion.mapper_cabala import build_cabalistic_mapping  # excepcion puntual autorizada

TarotCardInput = Union[str, Dict[str, Any]]


_SEFIROTH_INDEX_BY_ID: Dict[str, int] = {}
for sefira in SEFIROTH.values():
    sefira_id = sefira.get("id")
    sefira_index = sefira.get("index")
    if sefira_id and isinstance(sefira_index, int):
        _SEFIROTH_INDEX_BY_ID[sefira_id] = sefira_index


_SEFIROTH_ID_NORMALIZATION = {
    "keter": "kether",
    "chochmah": "chokmah",
    "chokhmah": "chokmah",
    "malchut": "malkuth",
}


def _normalize_sefira_id(sefira_id: Optional[str]) -> Optional[str]:
    if not sefira_id:
        return None
    key = str(sefira_id).strip().lower()
    return _SEFIROTH_ID_NORMALIZATION.get(key, key)


def _normalize_tarot_name(name: str) -> str:
    return " ".join(name.strip().lower().split())


def _extract_primary_number(value: str) -> Optional[int]:
    if not value:
        return None
    try:
        primary = str(value).split("/")[0].strip()
        return int(primary)
    except (ValueError, TypeError):
        return None


def _add_symbol_weight(
    weights: Dict[str, float],
    counts: Dict[str, int],
    symbol_id: str,
    increment: float = 1.0,
    count_increment: int = 1,
) -> None:
    weights[symbol_id] = weights.get(symbol_id, 0.0) + increment
    counts[symbol_id] = counts.get(symbol_id, 0) + count_increment


def _sendero_endpoints(sendero_id: str) -> Optional[Tuple[str, str]]:
    try:
        from_idx, to_idx = [int(part) for part in sendero_id.split("-")]
    except ValueError:
        return None
    from_sefira = None
    to_sefira = None
    for sefira_id, index in _SEFIROTH_INDEX_BY_ID.items():
        if index == from_idx:
            from_sefira = _normalize_sefira_id(sefira_id)
        if index == to_idx:
            to_sefira = _normalize_sefira_id(sefira_id)
    if not from_sefira or not to_sefira:
        return None
    return (from_sefira, to_sefira)


def _resolve_sendero_from_tarot(card: TarotCardInput) -> Optional[Dict[str, Any]]:
    if isinstance(card, dict):
        name = card.get("name") or card.get("spanishName") or ""
        number = card.get("number")
    else:
        name = str(card)
        number = None

    normalized_name = _normalize_tarot_name(name)
    if normalized_name:
        for sendero in SENDEROS.values():
            if _normalize_tarot_name(sendero.get("nombre", "")) == normalized_name:
                return sendero

    if isinstance(number, int):
        for sendero in SENDEROS.values():
            if sendero.get("tarot") == number:
                return sendero

    return None


def build_tree_structural_state_v0_1(
    *,
    full_name: Optional[str] = None,
    birth_date: Optional[str] = None,
    tarot_cards: Optional[Iterable[TarotCardInput]] = None,
    astrology_planets: Optional[Dict[str, Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    sefirot_weights: Dict[str, float] = {}
    sendero_weights: Dict[str, float] = {}
    symbol_counts: Dict[str, int] = {}

    if full_name and birth_date:
        try:
            year_str, month_str, day_str = birth_date.split("-")
            dia = int(day_str)
            mes = int(month_str)
            anio = int(year_str)
        except ValueError:
            dia = mes = anio = None

        if dia and mes and anio:
            valores_nombre = calcular_valores_nombre(full_name)
            valores_fecha = calcular_camino_destino(dia, mes, anio)
            inclusion = calcular_inclusion_base(full_name, dia, mes, anio)

            numeros = [
                _extract_primary_number(valores_nombre.get("esencia", "")),
                _extract_primary_number(valores_nombre.get("expresion", "")),
                _extract_primary_number(valores_nombre.get("herencia", "")),
                _extract_primary_number(valores_fecha.get("destino", "")),
            ]

            for numero in numeros:
                if not numero:
                    continue
                if numero <= 10:
                    sefira = obtener_sefira_por_numero(numero)
                    if sefira:
                        sefira_id = _normalize_sefira_id(sefira.get("id"))
                        if sefira_id:
                            _add_symbol_weight(sefirot_weights, symbol_counts, sefira_id)
                else:
                    sendero = obtener_sendero_por_numero(numero)
                    if sendero:
                        sendero_id = sendero.get("id")
                        if sendero_id:
                            _add_symbol_weight(sendero_weights, symbol_counts, sendero_id)

            for numero, count in inclusion.get("casas", {}).items():
                if count <= 0:
                    continue
                sefira = obtener_sefira_por_numero(int(numero))
                if sefira:
                    sefira_id = _normalize_sefira_id(sefira.get("id"))
                    if sefira_id:
                        _add_symbol_weight(
                            sefirot_weights,
                            symbol_counts,
                            sefira_id,
                            increment=float(count),
                            count_increment=int(count),
                        )

    if tarot_cards:
        for card in tarot_cards:
            sendero = _resolve_sendero_from_tarot(card)
            if sendero:
                sendero_id = sendero.get("id")
                if sendero_id:
                    _add_symbol_weight(sendero_weights, symbol_counts, sendero_id)

    if astrology_planets:
        mapping = build_cabalistic_mapping(astrology_planets)
        for data in mapping.values():
            sefira_name = data.get("sefira")
            if sefira_name:
                sefira_id = _normalize_sefira_id(sefira_name)
                if sefira_id:
                    _add_symbol_weight(sefirot_weights, symbol_counts, sefira_id)
            path_number = data.get("path")
            if isinstance(path_number, int):
                sendero = obtener_sendero_por_numero(path_number)
                if sendero:
                    sendero_id = sendero.get("id")
                    if sendero_id:
                        _add_symbol_weight(sendero_weights, symbol_counts, sendero_id)

    sefirot_activas = []
    for sefira_id, peso in sefirot_weights.items():
        legacy_id = sefira_id
        for legacy_key, canonical in _SEFIROTH_ID_NORMALIZATION.items():
            if canonical == sefira_id:
                legacy_id = legacy_key
                break
        indice = _SEFIROTH_INDEX_BY_ID.get(legacy_id)
        sefirot_activas.append(
            {
                "id_canonico": sefira_id,
                "indice": indice,
                "peso": peso,
            }
        )

    senderos_activos = []
    for sendero_id, peso in sendero_weights.items():
        sendero = SENDEROS.get(sendero_id)
        numero = sendero.get("numero") if sendero else None
        endpoints = _sendero_endpoints(sendero_id)
        senderos_activos.append(
            {
                "id_canonico": sendero_id,
                "numero": numero,
                "endpoints": {
                    "from_sefira": endpoints[0] if endpoints else None,
                    "to_sefira": endpoints[1] if endpoints else None,
                },
                "peso": peso,
            }
        )

    repeticiones = [
        {"simbolo_id": symbol_id, "conteo": count}
        for symbol_id, count in symbol_counts.items()
        if count > 1
    ]

    pesos: Dict[str, float] = {}
    for symbol_id, peso in sefirot_weights.items():
        pesos[symbol_id] = peso
    for symbol_id, peso in sendero_weights.items():
        pesos[symbol_id] = peso

    return {
        "sefirot_activas": sefirot_activas,
        "senderos_activos": senderos_activos,
        "repeticiones": repeticiones,
        "pesos": pesos,
        "ejes": None,
        "polaridades": None,
        "fuentes": None,
    }
