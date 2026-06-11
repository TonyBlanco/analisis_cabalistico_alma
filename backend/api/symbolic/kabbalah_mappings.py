"""
Kabbalah mappings module - provides access to Kabbalistic reference data.
Supports loading 72 Names, Sephirot, Sefer Yetzirah, and related mappings.
"""
import os
from pathlib import Path


def _find_mapping_file(name: str):
    """
    Find a mapping file by name in the mappings directory.
    
    Args:
        name: Name of the mapping (e.g., '72_names')
    
    Returns:
        Path to the mapping file if found, None otherwise
    """
    base_path = Path(__file__).parent
    possible_paths = [
        base_path / 'mappings' / f'{name}.yaml',
        base_path / 'mappings' / f'{name}.yml',
        base_path / f'{name}.yaml',
        base_path / f'{name}.yml',
    ]
    
    for path in possible_paths:
        if path.exists():
            return str(path)
    return None


def _load_yaml_file(path: str):
    """
    Load a YAML file and return its contents.
    
    Args:
        path: Path to the YAML file
    
    Returns:
        Parsed YAML data as dict, or None if file doesn't exist
    """
    try:
        import yaml
        with open(path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f) or {}
    except Exception:
        return None


def load_72_names():
    """
    Load the 72 Names of God (Shemot) mapping.
    
    Returns:
        Dictionary mapping name keys to name data
    """
    path = _find_mapping_file('72_names')
    if not path:
        return {}
    
    data = _load_yaml_file(path)
    if isinstance(data, dict) and 'names' in data:
        return data['names']
    return data if isinstance(data, dict) else {}


def load_sephirot():
    """
    Load the Sephirot (10 Spheres) mapping.
    
    Returns:
        Dictionary mapping Sephira keys to Sephira data
    """
    path = _find_mapping_file('sephirot')
    if not path:
        return {}
    
    data = _load_yaml_file(path)
    if isinstance(data, dict) and 'sephirot' in data:
        return data['sephirot']
    return data if isinstance(data, dict) else {}


def load_sefer_yetzirah():
    """
    Load the Sefer Yetzirah (Book of Formation) mapping.
    
    Returns:
        Dictionary containing Sefer Yetzirah data
    """
    path = _find_mapping_file('sefer_yetzirah')
    if not path:
        return {}
    
    data = _load_yaml_file(path)
    return data if isinstance(data, dict) else {}


def summary():
    """
    Get a summary of available mappings and their metadata.
    
    Returns:
        Dictionary with mapping metadata and version info
    """
    return {
        'names_72_version': '1.0',
        'sephirot_version': '1.0',
        'sefer_yetzirah_version': '1.0',
        'timestamp': None,
        'mappings_available': {
            '72_names': _find_mapping_file('72_names') is not None,
            'sephirot': _find_mapping_file('sephirot') is not None,
            'sefer_yetzirah': _find_mapping_file('sefer_yetzirah') is not None,
        }
    }
