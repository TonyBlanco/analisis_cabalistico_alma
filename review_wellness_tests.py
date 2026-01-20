"""
Script para revisar tests wellness activos y su configuración actual
"""
import os
import sys
import django

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.test_models import TestModule

print("=== TESTS WELLNESS ACTIVOS EN CATÁLOGO ===\n")

# Tests wellness en catálogo (excluye legacy)
wellness_tests = TestModule.objects.filter(
    is_active=True,
    test_type='wellness'
).exclude(
    description__icontains="_legacy_app_backup"
).exclude(
    description__icontains="No ejecutable"
).order_by('code')

print(f"Total de tests con test_type='wellness': {wellness_tests.count()}\n")

if wellness_tests.count() == 0:
    print("⚠️ No se encontraron tests con test_type='wellness' en el catálogo")
    print("\nRevisando otros test_type relacionados con wellness/holistic:")
    
    other_types = ['holistic_screening', 'health', 'diagnostic']
    for test_type in other_types:
        related = TestModule.objects.filter(
            is_active=True,
            test_type=test_type
        ).exclude(
            description__icontains="_legacy_app_backup"
        ).exclude(
            description__icontains="No ejecutable"
        )
        if related.exists():
            print(f"\n  test_type='{test_type}': {related.count()} tests")
            for t in related:
                print(f"    - {t.code}")
else:
    print("Código | Nombre | avail_therapist | avail_personal | Descripción")
    print("-" * 100)
    
    for test in wellness_tests:
        desc_preview = test.description[:60] + "..." if len(test.description) > 60 else test.description
        print(f"{test.code:20} | {test.name:30} | {str(test.available_for_therapists):15} | {str(test.available_for_personal):14}")
        print(f"  └─ {desc_preview}")
        print()

print("\n" + "=" * 100)
print("\n📋 TODOS LOS TESTS ACTIVOS (para contexto):\n")

all_catalog = TestModule.objects.filter(
    is_active=True
).exclude(
    description__icontains="_legacy_app_backup"
).exclude(
    description__icontains="No ejecutable"
).order_by('test_type', 'code')

current_type = None
for test in all_catalog:
    if test.test_type != current_type:
        current_type = test.test_type
        print(f"\n▶ test_type = '{current_type}':")
    
    assignable = "✅ ASIGNABLE" if test.available_for_therapists else "⚠️ Solo personal"
    print(f"  {assignable} | {test.code:22} | {test.name[:40]}")

print("\n" + "=" * 100)
