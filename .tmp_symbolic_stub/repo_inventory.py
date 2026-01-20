import os
import json
from pathlib import Path

ROOT = Path(r"d:/analisis_cabalistico_alma")
DOCS = ROOT / 'docs'
OUT = DOCS / '00_SOURCE_OF_TRUTH' / 'repo_modules_inventory.md'

# Tests
status_file = ROOT / 'tests_catalog_status.json'
if status_file.exists():
    with open(status_file, 'r', encoding='utf-8') as fh:
        tests_catalog = json.load(fh)
else:
    tests_catalog = []

schema_files = [p.name for p in ROOT.glob('*_schema.py')]
legacy_tests_dir = ROOT / '_legacy_app_backup' / 'tests'
legacy_tests = []
if legacy_tests_dir.exists():
    for p in legacy_tests_dir.glob('**/*'):
        if p.is_file():
            legacy_tests.append(str(p.relative_to(ROOT)))

# Symbolic modules
pkg_sym = ROOT / 'packages' / 'symbolic'
sym_dirs = []
if pkg_sym.exists():
    for p in pkg_sym.glob('dist/*'):
        sym_dirs.append(str(p.relative_to(ROOT)))

backend_symbolic = []
backend_api_sym = ROOT / 'backend' / 'api' / 'symbolic'
if backend_api_sym.exists():
    for p in backend_api_sym.glob('**/*.py'):
        backend_symbolic.append(str(p.relative_to(ROOT)))

# Docs classification
active_docs = []
hist_docs = []
draft_docs = []
for p in DOCS.glob('**/*.md'):
    if '/_rescued_md_' in str(p) or '/legacy/' in str(p):
        hist_docs.append(str(p.relative_to(ROOT)))
    elif '/_drafts/' in str(p):
        draft_docs.append(str(p.relative_to(ROOT)))
    else:
        active_docs.append(str(p.relative_to(ROOT)))

# Contradictions (from CSV)
contradictions_csv = DOCS / '00_SOURCE_OF_TRUTH' / 'symbolic_contradictions_matrix.csv'
contradictions = []
if contradictions_csv.exists():
    with open(contradictions_csv, 'r', encoding='utf-8') as fh:
        lines = fh.read().splitlines()
        headers = lines[0].split(',')
        for row in lines[1:]:
            parts = row.split(',')
            contradictions.append(row)

# Write markdown
with open(OUT, 'w', encoding='utf-8') as f:
    f.write('# Repo Modules Inventory\n\n')
    f.write('## Tests (repo snapshot)\n\n')
    f.write('### Tests catalog (tests_catalog_status.json)\n')
    f.write('\n')
    for t in tests_catalog:
        f.write(f"- {t.get('code')}: status={t.get('status')}, schema_valid={t.get('schema_valid')}\n")
    f.write('\n')
    f.write('### Schema files present\n')
    for s in schema_files:
        f.write(f'- {s}\n')
    f.write('\n')
    f.write('### Legacy test files (file list)\n')
    for l in legacy_tests[:200]:
        f.write(f'- {l}\n')
    f.write('\n')
    f.write('## Symbolic Modules (repo)\n\n')
    f.write('### packages/symbolic/dist contents (sample)\n')
    for d in sym_dirs:
        f.write(f'- {d}\n')
    f.write('\n')
    if backend_symbolic:
        f.write('### backend/api/symbolic (files)\n')
        for b in backend_symbolic[:200]:
            f.write(f'- {b}\n')
        f.write('\n')
    f.write('## Documentation classification\n\n')
    f.write('### Active docs\n')
    for p in active_docs[:200]:
        f.write(f'- {p}\n')
    f.write('\n### Draft docs\n')
    for p in draft_docs[:200]:
        f.write(f'- {p}\n')
    f.write('\n### Historical docs\n')
    for p in hist_docs[:200]:
        f.write(f'- {p}\n')
    f.write('\n## Contradictions (summary rows from CSV)\n')
    for c in contradictions[:200]:
        f.write(f'- {c}\n')

print('Repo inventory written to', OUT)
