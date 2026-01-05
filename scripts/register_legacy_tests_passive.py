"""Passive legacy tests registration script.

Reads /tests/*/meta.json and prints what would be registered as TestModule.

IMPORTANT: This script is intentionally disabled.
Do not execute without explicit authorization.
"""

from __future__ import annotations

import json
from pathlib import Path


raise RuntimeError("Script de registro pasivo. No ejecutar sin autorización.")


REPO_ROOT = Path(__file__).resolve().parents[1]
TESTS_ROOT = REPO_ROOT / 'tests'


def iter_legacy_meta():
    for meta_path in sorted(TESTS_ROOT.glob('*/meta.json')):
        try:
            meta = json.loads(meta_path.read_text(encoding='utf-8'))
        except Exception:
            continue
        if not isinstance(meta, dict):
            continue
        if meta.get('origin') != 'legacy_migration':
            continue
        yield meta_path.parent.name, meta


def main():
    items = list(iter_legacy_meta())
    print(f'Found {len(items)} legacy meta.json files under {TESTS_ROOT}')

    for code, meta in items:
        payload = {
            'code': meta.get('code') or code,
            'name': meta.get('name') or code.upper(),
            'active': False,
            'execution_mode': 'legacy_migrated',
            'notes': meta.get('notes'),
        }
        print('WOULD_REGISTER_TESTMODULE:', json.dumps(payload, ensure_ascii=False))


if __name__ == '__main__':
    main()
