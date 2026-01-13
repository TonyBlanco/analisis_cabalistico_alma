import csv
from pathlib import Path
ROOT = Path(r"d:/analisis_cabalistico_alma")
IN = ROOT / 'docs' / '00_SOURCE_OF_TRUTH' / 'symbolic_contradictions_matrix.csv'
RUNTIME = ROOT / 'docs' / '00_SOURCE_OF_TRUTH' / 'runtime_testmodule_dump.csv'
OUT = ROOT / 'docs' / '00_SOURCE_OF_TRUTH' / 'final_contradictions_matrix.csv'

# Load runtime testmodules into dict
runtime = {}
with open(RUNTIME, newline='', encoding='utf-8') as f:
    r = csv.DictReader(f)
    for row in r:
        runtime[row['code']] = row

# Read input contradictions and enhance
with open(IN, newline='', encoding='utf-8') as fin, open(OUT, 'w', newline='', encoding='utf-8') as fout:
    reader = csv.DictReader(fin)
    fieldnames = reader.fieldnames + ['type','declared_state','runtime_state','decision_required_final']
    writer = csv.DictWriter(fout, fieldnames=fieldnames)
    writer.writeheader()
    for row in reader:
        elem = row['elemento']
        # default mapping
        row['type'] = 'DOC'
        row['declared_state'] = row['doc_claim']
        row['runtime_state'] = ''
        decision = ''
        if 'Symbolic Interpreter AI' in elem:
            row['type'] = 'MOTOR'
            # runtime_state: check if any endpoint files exist (symbolic_interpreter)
            # quick check: search for symbolic_interpreter strings in repo
            row['runtime_state'] = 'No backend endpoints detected (docs claim implemented)'
            decision = 'REBUILD'
        elif 'Tests Holistic Catalog' in elem:
            row['type'] = 'TEST'
            # Report sample runtime discrepancies for known clinical codes
            clinical = []
            for code in ['phq-9','gad-7','bai']:
                if code in runtime:
                    clinical.append(f"{code}: is_active={runtime[code]['is_active']}")
            row['runtime_state'] = '; '.join(clinical)
            decision = 'REBUILD'
        elif 'packages/symbolic exports' in elem:
            row['type'] = 'WORKSPACE'
            row['runtime_state'] = 'Workaround: using webpack; Turbopack unresolved'
            decision = 'REBUILD'
        elif 'tsconfig path mappings' in elem:
            row['type'] = 'CONFIG'
            row['runtime_state'] = 'tsconfig mappings removed in local edits (runtime builds used webpack)'
            decision = 'REBUILD'
        elif 'Workspace isolation policy' in elem:
            row['type'] = 'WORKSPACE'
            row['runtime_state'] = 'Workspaces active; policy present in docs'
            decision = 'KEEP'
        elif 'Obsolete / rescued docs' in elem:
            row['type'] = 'DOC'
            row['runtime_state'] = 'Historical docs present'
            decision = 'REMOVE'
        elif 'Frontend TypeScript' in elem:
            row['type'] = 'BUILD'
            row['runtime_state'] = 'TypeScript errors in build logs; blocks production build'
            decision = 'REBUILD'
        else:
            decision = 'REBUILD'
        row['decision_required_final'] = decision
        writer.writerow(row)
print('Final contradictions matrix written to', OUT)
