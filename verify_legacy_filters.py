"""
Script para verificar que los filtros legacy están funcionando correctamente
"""
import os
import sys
import django

# Agregar el directorio backend al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import models
from api.test_models import TestModule

print("=== VERIFICACIÓN DE FILTROS LEGACY ===\n")

# Total de tests activos
total_active = TestModule.objects.filter(is_active=True).count()
print(f"Total de tests activos: {total_active}")

# Tests con marcador _legacy_app_backup
legacy_backup = TestModule.objects.filter(
    is_active=True,
    description__icontains="_legacy_app_backup"
).count()
print(f"Tests con '_legacy_app_backup' en descripción: {legacy_backup}")

# Tests con marcador "No ejecutable"
no_executable = TestModule.objects.filter(
    is_active=True,
    description__icontains="No ejecutable"
).count()
print(f"Tests con 'No ejecutable' en descripción: {no_executable}")

# Tests que serían excluidos (legacy)
legacy_total = TestModule.objects.filter(
    is_active=True
).filter(
    models.Q(description__icontains="_legacy_app_backup") |
    models.Q(description__icontains="No ejecutable")
).count()
print(f"Total de tests legacy excluidos: {legacy_total}")

# Tests que aparecerían en el catálogo (después del filtro)
catalog_tests = TestModule.objects.filter(
    is_active=True
).exclude(
    description__icontains="_legacy_app_backup"
).exclude(
    description__icontains="No ejecutable"
).count()
print(f"Tests que aparecen en catálogo: {catalog_tests}")

print("\n=== DETALLE DE TESTS EN CATÁLOGO ===")
active_tests = TestModule.objects.filter(
    is_active=True
).exclude(
    description__icontains="_legacy_app_backup"
).exclude(
    description__icontains="No ejecutable"
).order_by('code')

for test in active_tests:
    print(f"  - {test.code}: {test.name}")

print("\n=== DETALLE DE TESTS LEGACY EXCLUIDOS ===")
legacy_tests = TestModule.objects.filter(
    is_active=True
).filter(
    models.Q(description__icontains="_legacy_app_backup") |
    models.Q(description__icontains="No ejecutable")
).order_by('code')

for test in legacy_tests:
    print(f"  - {test.code}: {test.name}")
    if "_legacy_app_backup" in test.description:
        print(f"    → Marcador: _legacy_app_backup")
    if "No ejecutable" in test.description:
        print(f"    → Marcador: No ejecutable")

print("\n=== VERIFICAR WELLNESS ===")
wellness_tests = TestModule.objects.filter(code__icontains='wellness')
if wellness_tests.exists():
    for test in wellness_tests:
        print(f"  - {test.code}: {test.name}")
        print(f"    is_active: {test.is_active}")
        print(f"    Legacy?: {'SÍ' if ('_legacy_app_backup' in test.description or 'No ejecutable' in test.description) else 'NO'}")
else:
    print("  No se encontraron tests Wellness")
