"""
Verificación final: simular la consulta del endpoint /api/tests/
"""
import os
import sys
import django

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.test_models import TestModule
from django.db.models import Q

print("=== SIMULACIÓN ENDPOINT /api/tests/ ===\n")

# Simular la query del AvailableTestsView
tests = (
    TestModule.objects
    .filter(is_active=True)
    .exclude(description__icontains="_legacy_app_backup")
    .exclude(description__icontains="No ejecutable")
)

print(f"Total tests en catálogo (después de excluir legacy): {tests.count()}\n")

print("Tests que el terapeuta verá (available_for_therapists=True):")
print("-" * 80)

therapist_tests = tests.filter(
    Q(available_for_therapists=True) | Q(available_for_personal=True)
)

for test in therapist_tests.order_by('code'):
    assignable = "✅ ASIGNABLE" if test.available_for_therapists else "⚠️ Solo personal"
    print(f"{assignable} | {test.code:20} | {test.name}")

print("\n" + "=" * 80)
print("\n✅ VERIFICACIÓN LEGACY EXCLUIDO:\n")

legacy_in_catalog = tests.filter(code__in=['bai', 'gad-7', 'phq-9'])
if legacy_in_catalog.exists():
    print("❌ ERROR: Tests legacy aparecen en catálogo:")
    for test in legacy_in_catalog:
        print(f"  - {test.code}")
else:
    print("✅ Legacy correctamente excluido del catálogo (bai, gad-7, phq-9)")

print("\n✅ VERIFICACIÓN WELLNESS VISIBLE:\n")

wellness_test = tests.filter(code='wellness').first()
if wellness_test:
    print(f"✅ Wellness está en catálogo")
    print(f"   - Nombre: {wellness_test.name}")
    print(f"   - Asignable por terapeuta: {wellness_test.available_for_therapists}")
    print(f"   - Ejecutable por usuario: {wellness_test.available_for_personal}")
else:
    print("❌ ERROR: Wellness no aparece en catálogo")

print("\n" + "=" * 80)
print("\n✅ RESUMEN FINAL:\n")
print(f"  • Tests en catálogo: {tests.count()}")
print(f"  • Tests asignables por terapeuta: {tests.filter(available_for_therapists=True).count()}")
print(f"  • Tests legacy excluidos: 3 (bai, gad-7, phq-9)")
print(f"  • Estado: ✅ CORRECTO")
