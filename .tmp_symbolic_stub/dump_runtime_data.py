import csv
import os
import django

# Expect DJANGO_SETTINGS_MODULE=temp_settings and PYTHONPATH set prior to running
django.setup()

from 
import TestModule
from api.models import AnalysisRecord
from django.db import models

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'docs', '00_SOURCE_OF_TRUTH')
os.makedirs(OUT_DIR, exist_ok=True)

# Dump TestModule runtime data
testmodules = TestModule.objects.all()
with open(os.path.join(OUT_DIR, 'runtime_testmodule_dump.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['code','is_active','is_assignable','test_type','execution_modes','analysis_record_count'])
    for tm in testmodules:
        code = tm.code
        is_active = tm.is_active
        is_assignable = tm.is_assignable
        test_type = tm.test_type
        # Find execution_mode values used in AnalysisRecord for this test code
        exec_modes = AnalysisRecord.objects.filter(module_code=code).values_list('execution_mode', flat=True).distinct()
        exec_modes_list = ';'.join([m for m in exec_modes if m])
        count_ar = AnalysisRecord.objects.filter(module_code=code).count()
        writer.writerow([code, is_active, is_assignable, test_type, exec_modes_list, count_ar])

# Dump AnalysisRecord kinds
kinds_qs = AnalysisRecord.objects.values('kind').annotate(count=models.Count('id')).order_by('-count')
with open(os.path.join(OUT_DIR, 'runtime_analysis_kinds.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['kind','count'])
    for row in kinds_qs:
        writer.writerow([row['kind'], row['count']])

# Modules not tests: AnalysisRecord kinds that are not equal to any TestModule.code
test_codes = set(TestModule.objects.values_list('code', flat=True))
analysis_kinds = set(AnalysisRecord.objects.values_list('kind', flat=True))
modules_not_tests = [k for k in analysis_kinds if k and k not in test_codes]

# For evidence, grep docs for mentions
import glob

EVIDENCE = {}
search_paths = glob.glob(os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'docs', '**', '*.md'), recursive=True)
for mod in modules_not_tests:
    EVIDENCE[mod] = []
    for p in search_paths:
        try:
            with open(p, 'r', encoding='utf-8') as fh:
                txt = fh.read()
                if mod.lower() in txt.lower():
                    EVIDENCE[mod].append(p)
        except Exception:
            pass

with open(os.path.join(OUT_DIR, 'runtime_modules_not_tests.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['module_kind','evidence_paths'])
    for mod in modules_not_tests:
        paths = ';'.join(EVIDENCE.get(mod, []))
        writer.writerow([mod, paths])

print('Runtime dumps written to', OUT_DIR)
