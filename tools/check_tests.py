import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.core.settings')
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, PROJECT_ROOT)
BACKEND_PATH = os.path.join(PROJECT_ROOT, 'backend')
sys.path.insert(0, BACKEND_PATH)

import django
django.setup()

from api.test_models import TestModule

print('Listing all TestModule codes (code, is_active, available_for_personal, available_for_therapists, execution_mode, slug)')
all_tms = TestModule.objects.all().order_by('code')
count = all_tms.count()
print(f'Total TestModule records: {count}')
for tm in all_tms:
    print(
        f"{tm.code} | active={tm.is_active} | personal={getattr(tm, 'available_for_personal', False)} | therapists={getattr(tm, 'available_for_therapists', False)} | exec_mode={getattr(tm,'execution_mode', None)!r} | slug={getattr(tm,'slug', None)!r}"
    )

# Also print likely variants for common tests
variants = [('phq-9', ['phq9', 'phq-9', 'phq_9', 'phq9-v1']), ('gad-7', ['gad7', 'gad-7', 'gad_7']), ('bai', ['bai', 'bai-1','bai1','bai-ii','bai-ii'])]
print('\nChecking common variants for PHQ/GAD/BAI:')
for canonical, vets in variants:
    found = []
    for v in vets:
        qs = TestModule.objects.filter(code__iexact=v)
        if qs.exists():
            for tm in qs:
                found.append((v, tm.code, getattr(tm,'slug',None)))
    if found:
        print(f"{canonical} -> variants found:")
        for f in found:
            print(f"  variant={f[0]} -> db_code={f[1]} slug={f[2]}")
    else:
        print(f"{canonical} -> no exact variant matches found")
