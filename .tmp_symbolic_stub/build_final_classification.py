import csv
import json
from pathlib import Path
ROOT = Path(r"d:/analisis_cabalistico_alma")
RUNTIME_TESTS = ROOT / 'docs' / '00_SOURCE_OF_TRUTH' / 'runtime_testmodule_dump.csv'
TESTS_STATUS = ROOT / 'tests_catalog_status.json'
RUNTIME_KINDS = ROOT / 'docs' / '00_SOURCE_OF_TRUTH' / 'runtime_analysis_kinds.csv'
OUT = ROOT / 'docs' / '00_SOURCE_OF_TRUTH' / 'final_system_classification.md'

# Load tests status for schema_valid
status = {}
if TESTS_STATUS.exists():
    with open(TESTS_STATUS,'r',encoding='utf-8') as f:
        for t in json.load(f):
            status[t['code']] = t

# Read runtime tests
tests = []
with open(RUNTIME_TESTS, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        tests.append(row)

# read runtime kinds
kinds = {}
if RUNTIME_KINDS.exists():
    with open(RUNTIME_KINDS, newline='', encoding='utf-8') as f:
        r = csv.DictReader(f)
        for row in r:
            kinds[row['kind']] = int(row['count'])

# Symbolic modules list (from docs / known)
symbolic_modules = ['kabbalah','tarot','astrology','bioemotional','tree','symbolic_interpreter']

# Build classification
rows = []
for t in tests:
    code = t['code']
    is_active = t['is_active']
    is_assignable = t['is_assignable']
    test_type = t['test_type']
    analysis_count = int(t.get('analysis_record_count') or 0)
    schema_valid = status.get(code,{}).get('schema_valid') if code in status else None

    # Is symbolic if test_type in these
    is_symbolic = 'Yes' if test_type in ('holistic','holistic_screening','numerology','wellness') else 'No'
    generates_ar = 'Yes' if analysis_count>0 else 'No'
    # Should exist in catalog: if is_assignable True -> Yes
    should_exist = 'Yes' if is_assignable.lower()=='true' else 'No'
    # Action recommendation deterministic rules
    if schema_valid is False:
        action = 'REBUILD'
    elif test_type == 'diagnostic':
        action = 'REMOVE'
    elif is_symbolic=='Yes' and is_active.lower()=='true':
        action = 'FREEZE'
    else:
        action = 'REVIEW'
    rows.append({'identifier':code,'type_real':'Test','is_symbolic':is_symbolic,'generates_analysis_record':generates_ar,'should_exist_in_catalog':should_exist,'action_recommended':action,'evidence':f"runtime:{analysis_count};schema_valid:{schema_valid}"})

# Add symbolic modules entries
# Determine if they generate AnalysisRecord by checking kinds
for mod in symbolic_modules:
    generates = 'Yes' if kinds.get(mod,0)>0 else 'No'
    # Should exist in tests catalog? No
    rows.append({'identifier':mod,'type_real':'Workspace/Motor','is_symbolic':'Yes','generates_analysis_record':generates,'should_exist_in_catalog':'No','action_recommended':'KEEP' if generates=='Yes' else 'REVIEW','evidence':f'runtime_kind_count:{kinds.get(mod,0)}'})

# Write markdown
with open(OUT,'w',encoding='utf-8') as f:
    f.write('# Final System Classification\n\n')
    f.write('|Identifier|Type real|Is symbolic?|Generates AnalysisRecord?|Should exist in catalog?|Action recommended|Evidence|\n')
    f.write('|---|---|---|---|---|---|---|\n')
    for r in rows:
        f.write(f"|{r['identifier']}|{r['type_real']}|{r['is_symbolic']}|{r['generates_analysis_record']}|{r['should_exist_in_catalog']}|{r['action_recommended']}|{r['evidence']}|\n")

print('Final classification written to', OUT)
