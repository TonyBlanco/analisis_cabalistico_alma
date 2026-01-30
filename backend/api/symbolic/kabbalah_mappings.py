"""Filesystem-backed symbolic mappings used by the Phoenix PoC tests."""
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

import yaml


BACKEND_DIR = Path(__file__).resolve().parents[3]
REPO_ROOT = BACKEND_DIR.parent
MAPPINGS_DIR = REPO_ROOT / 'docs' / 'mappings'

_DEFAULT_72_NAMES: Dict[str, Dict[str, Any]] = {
    'name_1': {
        'name': 'Vehuiah',
        'letters': ['V', 'H', 'I'],
        'associated_planet': 'sun',
        'meaning': 'Voluntad y chispa iniciática',
    }
}


def _find_mapping_file(name: str) -> Path | None:
    candidate = MAPPINGS_DIR / f'{name}.yaml'
    if candidate.exists():
        return candidate
    fallback = BACKEND_DIR / 'docs' / 'mappings' / f'{name}.yaml'
    return fallback if fallback.exists() else None


def _load_yaml_file(path: Path) -> Dict[str, Any]:
    data = yaml.safe_load(path.read_text(encoding='utf-8'))
    return data or {}


def load_sefer_yetzirah() -> Dict[str, Any]:
    path = _find_mapping_file('sefer_yetzirah')
    if path:
        payload = _load_yaml_file(path)
        return payload.get('paths', payload)
    return {'paths': []}


def load_72_names() -> Dict[str, Any]:
    path = _find_mapping_file('72_names')
    if not path:
        return _DEFAULT_72_NAMES
    payload = _load_yaml_file(path)
    return payload.get('names', _DEFAULT_72_NAMES)


def load_sephirot() -> Dict[str, Any]:
    path = _find_mapping_file('sephirot')
    if path:
        payload = _load_yaml_file(path)
        return payload.get('sefirot', payload)
    return {
        '1': {'name': 'Keter', 'planet': 'Plutón'},
        '2': {'name': 'Chokmah', 'planet': 'Urano'},
    }


def summary() -> Dict[str, Any]:
    names_path = _find_mapping_file('72_names')
    names_payload = (
        _load_yaml_file(names_path) if names_path else {'names': _DEFAULT_72_NAMES}
    )
    names = names_payload.get('names', _DEFAULT_72_NAMES)
    sefer = load_sefer_yetzirah()
    sephirot = load_sephirot()
    return {
        'sefer_yetzirah': sefer,
        'names_72_count': len(names),
        'names_72_version': names_payload.get('version', 'embedded'),
        'sephirot': sephirot,
    }


__all__ = [
    'load_sefer_yetzirah',
    'load_72_names',
    'load_sephirot',
    'summary',
    '_find_mapping_file',
    '_load_yaml_file',
]

