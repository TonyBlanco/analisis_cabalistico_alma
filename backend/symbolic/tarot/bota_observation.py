"""B.O.T.A. style tarot observation snippets used in tests."""
from __future__ import annotations

from typing import Dict


_CARD_DATA: Dict[str, Dict[str, str]] = {
    'the_fool': {
        'titulo': 'El Loco',
        'letter': 'Aleph',
        'path': 'Sendero 11',
        'sefirot': 'Keter ↔ Chokmah',
        'element': 'Aire',
        'clave': 'Impulso creativo y apertura al misterio',
    },
    'the_high_priestess': {
        'titulo': 'La Sacerdotisa',
        'letter': 'Gimel',
        'path': 'Sendero 13',
        'sefirot': 'Keter ↔ Tiferet',
        'element': 'Agua',
        'clave': 'Intuición silenciosa y memoria lunar',
    },
}

_SYNONYMS = {
    '00': 'the_fool',
    'el loco': 'the_fool',
    '00_el_loco': 'the_fool',
    'the fool': 'the_fool',
    'the-fool': 'the_fool',
    '02_la_sacerdotisa': 'the_high_priestess',
    'la sacerdotisa': 'the_high_priestess',
    'the high priestess': 'the_high_priestess',
}


def _normalize(card_ref: str) -> str:
    cleaned = card_ref.lower().strip()
    cleaned = cleaned.split('.')[0]
    cleaned = cleaned.replace('-', ' ').replace('_', ' ')
    cleaned = ' '.join(cleaned.split())
    if cleaned in _SYNONYMS:
        return _SYNONYMS[cleaned]
    return cleaned.replace(' ', '_')


def build_bota_observation(card_ref: str, reversed_flag: bool = False) -> str:
    key = _normalize(card_ref)
    data = _CARD_DATA.get(key, _CARD_DATA['the_fool'])
    reversed_line = (
        "Aspecto invertido: integrar la lección con humildad.\n" if reversed_flag else ""
    )
    body = (
        f"Letra: {data['letter']}\n"
        f"Sendero: {data['path']}\n"
        f"Sefirot: {data['sefirot']}\n"
        f"Elemento: {data['element']}\n"
        f"Clave meditativa: {data['clave']}. {reversed_line}"
        "Esta observación está redactada en español para facilitar la inmersión simbólica."
    )
    return f"{data['titulo']} — Observación B.O.T.A.\n{body}"
