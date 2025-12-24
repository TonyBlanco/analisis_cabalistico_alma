"""Validation script for Kabbalah mapping files used in CI.

Usage: python backend/scripts/validate_mappings.py
Exits with non-zero status if expectations are not met.
"""
import sys
from api.symbolic import kabbalah_mappings as km


def fail(msg: str):
    print('ERROR:', msg)
    sys.exit(2)


def main():
    print('Discovering mapping files...')
    path = km._find_mapping_file('72_names')
    if not path:
        fail('72_names mapping file not found')
    print('72_names file:', path)

    data = km._load_yaml_file(path)
    if not data:
        fail('Failed to load 72_names mapping (empty)')

    names = km.load_72_names()
    if not isinstance(names, dict) or len(names) < 1:
        fail('72_names mapping parsed but contains no entries')

    summary = km.summary()
    print('Mapping summary:', summary)

    if not summary.get('names_72_version'):
        fail('72_names mapping metadata missing version')

    # sefer & sephirot presence
    sefer = km.load_sefer_yetzirah()
    seph = km.load_sephirot()
    if not isinstance(sefer, dict) or not sefer:
        fail('Sefer Yetzirah mapping missing or empty')
    if not isinstance(seph, dict) or not seph:
        fail('Sephirot mapping missing or empty')

    print('All checks OK — mappings present and have required metadata.')


if __name__ == '__main__':
    main()
