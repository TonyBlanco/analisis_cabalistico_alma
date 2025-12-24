"""Loader and basic accessors for Kabbalah mapping files (PoC).

This module provides file-backed mapping access for Phase 1 PoC, with simple
schema validation and version/provenance awareness. It prefers the
`docs/04_SYMBOLIC_SYSTEM/mappings/` folder and falls back to legacy markdown
files for compatibility.
"""
import os
from typing import Dict, Any, Optional
try:
    import yaml
except Exception:
    yaml = None

BASE_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'docs', '04_SYMBOLIC_SYSTEM')
MAPPINGS_DIR = os.path.join(BASE_DIR, 'mappings')

# Simple file cache: path -> (mtime, data)
_CACHE: Dict[str, Any] = {}



def _load_yaml_file(path: str) -> Dict[str, Any]:
    if not os.path.exists(path):
        return {}
    try:
        mtime = os.path.getmtime(path)
    except Exception:
        mtime = None

    # Return cached copy when available and unchanged
    if path in _CACHE and _CACHE[path][0] == mtime:
        return _CACHE[path][1]

    # If PyYAML is unavailable, provide a minimal safe fallback
    if yaml is None:
        text = ''
        with open(path, 'r', encoding='utf-8') as fh:
            text = fh.read()
        if 'names:' in text and 'id:' in text:
            data = _fallback_parse_72_names(text)
        elif 'mappings:' in text:
            data = _fallback_parse_mapping(text)
        elif 'sephirot:' in text:
            data = _fallback_parse_sephirot(text)
        else:
            data = _fallback_parse_meta(text)
        _CACHE[path] = (mtime, data)
        return data

    with open(path, 'r', encoding='utf-8') as fh:
        try:
            data = yaml.safe_load(fh) or {}
            _CACHE[path] = (mtime, data)
            return data
        except Exception:
            return {}



def _find_mapping_file(prefix: str) -> Optional[str]:
    # Prefer the mappings dir with versioned files
    if os.path.isdir(MAPPINGS_DIR):
        # Try multiple versioned candidates to be future-friendly
        for version in ('v1', 'v1.0', ''):
            for ext in ('.yml', '.yaml', '.json'):
                candidate_name = f"{prefix}_{version}{ext}" if version else f"{prefix}{ext}"
                candidate = os.path.join(MAPPINGS_DIR, candidate_name)
                if os.path.exists(candidate):
                    return candidate
        # Also check plain prefix.ext
        for ext in ('.yml', '.yaml', '.json'):
            candidate = os.path.join(MAPPINGS_DIR, f"{prefix}{ext}")
            if os.path.exists(candidate):
                return candidate
        # As a last resort, scan directory for any file that contains the prefix
        try:
            for fname in os.listdir(MAPPINGS_DIR):
                if fname.lower().startswith(prefix.lower()) and fname.lower().endswith(('.yml', '.yaml', '.json')):
                    return os.path.join(MAPPINGS_DIR, fname)
        except Exception:
            pass
    # Backward-compat: look for legacy md files in BASE_DIR
    legacy = os.path.join(BASE_DIR, f"{prefix}.md")
    if os.path.exists(legacy):
        return legacy
    return None


def _list_to_dict(entries: Any, id_field: str = 'id') -> Dict[str, Any]:
    d = {}
    if isinstance(entries, list):
        for e in entries:
            if not isinstance(e, dict):
                continue
            key = e.get(id_field) or e.get('key') or e.get('name')
            if not key:
                continue
            d[str(key)] = e
    elif isinstance(entries, dict):
        return entries
    return d


# Minimal fallback parsers used when PyYAML is not available in the environment
def _fallback_parse_meta(text: str) -> Dict[str, Any]:
    meta = {}
    for k in ('version', 'source', 'created_at', 'curator', 'license'):
        for line in text.splitlines():
            if line.strip().startswith(f"{k}:"):
                _, _, val = line.partition(":")
                meta[k] = val.strip().strip('"').strip("'")
                break
    return meta


def _fallback_parse_72_names(text: str) -> Dict[str, Any]:
    # Very small parser to extract items under 'names:' with '- id:' anchors
    lines = text.splitlines()
    in_names = False
    current = None
    names = {}
    for raw in lines:
        line = raw.rstrip('\n')
        if line.strip().startswith('names:'):
            in_names = True
            continue
        if not in_names:
            continue
        if line.lstrip().startswith('- '):
            # New item
            if current:
                if 'id' in current:
                    key = str(current.get('id') or current.get('key') or current.get('name'))
                    names[key] = current
            current = {}
            # capture inline key if present
            if ': ' in line:
                # - id: "name_1"
                _, _, rest = line.partition(':')
                val = rest.strip().strip('"').strip("'")
                # line started with '- id' maybe
                if line.lstrip().startswith('- id'):
                    current['id'] = val
            continue
        # continued indented properties
        if current is None:
            continue
        # property line like '    letters: ["א", "ה"]' or '    name: "אהיה"'
        parts = line.strip().split(':', 1)
        if len(parts) != 2:
            continue
        k = parts[0].strip()
        v = parts[1].strip()
        # simple list handling of inline [..]
        if v.startswith('[') and v.endswith(']'):
            inner = v[1:-1].strip()
            items = [it.strip().strip('"').strip("'") for it in inner.split(',') if it.strip()]
            current[k] = items
        else:
            current[k] = v.strip('"').strip("'")
    # final flush
    if current and 'id' in current:
        key = str(current.get('id') or current.get('key') or current.get('name'))
        names[key] = current
    # also expose meta if present
    meta = _fallback_parse_meta(text)
    if meta:
        names.update({'__meta__': meta})
    return names


def _fallback_parse_mapping(text: str) -> Dict[str, Any]:
    # For sefer_yetzirah 'mappings:' block produce a dict keyed by letter
    lines = text.splitlines()
    in_map = False
    current_key = None
    mappings = {}
    for raw in lines:
        line = raw.rstrip('\n')
        if line.strip().startswith('mappings:'):
            in_map = True
            continue
        if not in_map:
            continue
        if line.strip() and not line.startswith(' '):
            # top-level key like '  א:' or 'א:'
            if ':' in line:
                left = line.split(':', 1)[0].strip()
                current_key = left
                mappings[current_key] = {}
            continue
        if current_key and ':' in line:
            parts = line.strip().split(':', 1)
            k = parts[0].strip()
            v = parts[1].strip().strip('"').strip("'")
            # try simple list parsing
            if v.startswith('[') and v.endswith(']'):
                inner = v[1:-1].strip()
                items = [it.strip().strip('"').strip("'") for it in inner.split(',') if it.strip()]
                mappings[current_key][k] = items
            else:
                mappings[current_key][k] = v
    return mappings


def _fallback_parse_sephirot(text: str) -> Dict[str, Any]:
    # For sephirot: top-level entries under 'sephirot:'
    lines = text.splitlines()
    in_map = False
    current_key = None
    mappings = {}
    for raw in lines:
        line = raw.rstrip('\n')
        if line.strip().startswith('sephirot:'):
            in_map = True
            continue
        if not in_map:
            continue
        if line.strip() and not line.startswith(' '):
            if ':' in line:
                left = line.split(':', 1)[0].strip()
                current_key = left
                mappings[current_key] = {}
            continue
        if current_key and ':' in line:
            parts = line.strip().split(':', 1)
            k = parts[0].strip()
            v = parts[1].strip().strip('"').strip("'")
            # list handling
            if v.startswith('[') and v.endswith(']'):
                inner = v[1:-1].strip()
                items = [it.strip().strip('"').strip("'") for it in inner.split(',') if it.strip()]
                mappings[current_key][k] = items
            else:
                mappings[current_key][k] = v
    return mappings


def load_72_names() -> Dict[str, Any]:
    path = _find_mapping_file('72_names')
    data = {}
    if not path:
        return {}
    if path.endswith(('.yml', '.yaml', '.json')):
        data = _load_yaml_file(path)
    else:
        # legacy: markdown that may include YAML frontmatter; try to parse whole file
        data = _load_yaml_file(path)

    names = _list_to_dict(data.get('names') or data.get('names_72') or [])
    return names


def load_sefer_yetzirah() -> Dict[str, Any]:
    path = _find_mapping_file('sefer_yetzirah')
    if not path:
        return {}
    data = _load_yaml_file(path)
    # expecting top-level 'mappings' dict
    return data.get('mappings') or {}


def load_sephirot() -> Dict[str, Any]:
    path = _find_mapping_file('sephirot')
    if not path:
        return {}
    data = _load_yaml_file(path)
    return data.get('sephirot') or {}


def _read_metadata_for(prefix: str) -> Dict[str, Any]:
    path = _find_mapping_file(prefix)
    if not path:
        return {}
    data = _load_yaml_file(path)
    # Fallback parsers may stash metadata under a special key
    if isinstance(data, dict) and '__meta__' in data:
        meta_source = data.get('__meta__', {})
        meta = {k: meta_source.get(k) for k in ('version', 'source', 'created_at', 'curator', 'license') if meta_source.get(k)}
        return meta
    meta = {k: data.get(k) for k in ('version', 'source', 'created_at', 'curator', 'license') if data.get(k)}
    return meta


def summary() -> Dict[str, Any]:
    meta = _read_metadata_for('72_names')
    return {
        'sefer_yetzirah': list(load_sefer_yetzirah().keys()),
        'names_72_count': len(load_72_names().keys()),
        'names_72_version': meta.get('version'),
        'sephirot': list(load_sephirot().keys()),
    }
