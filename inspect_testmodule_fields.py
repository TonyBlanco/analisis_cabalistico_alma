"""
Listado de campos del modelo TestModule y verificación de patient_route en registros visibles
"""
import os
import sys
import django

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.test_models import TestModule

print('=== TestModule model fields ===\n')
for f in TestModule._meta.get_fields():
    print(f.name)

print('\n=== Visible tests (catalog) and patient_route presence ===\n')
visible_tests = TestModule.objects.filter(is_active=True).exclude(description__icontains='_legacy_app_backup').exclude(description__icontains='No ejecutable')
for t in visible_tests.order_by('code'):
    has_attr = hasattr(t, 'patient_route')
    val = getattr(t, 'patient_route', None) if has_attr else None
    print(f"{t.code:20} | patient_route_exists={has_attr} | value={val}")

print('\n=== Done ===')
