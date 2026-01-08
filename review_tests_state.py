"""
Script para revisar el estado actual de los tests en BD
"""
import os
import sys
import django

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.test_models import TestModule

print("=== ESTADO ACTUAL DE TESTS EN CATÁLOGO ===\n")

# Tests que aparecen en el catálogo (excluye legacy)
catalog_tests = TestModule.objects.filter(
    is_active=True
).exclude(
    description__icontains="_legacy_app_backup"
).exclude(
    description__icontains="No ejecutable"
).order_by('code')

print(f"Total de tests en catálogo: {catalog_tests.count()}\n")

print("Código | Nombre | is_active | avail_therapist | avail_personal | test_type")
print("-" * 100)

for test in catalog_tests:
    print(f"{test.code:20} | {test.name:30} | {str(test.is_active):9} | {str(test.available_for_therapists):15} | {str(test.available_for_personal):14} | {test.test_type}")

print("\n" + "=" * 100)
print("\n=== TESTS LEGACY EXCLUIDOS (NO TOCAR) ===\n")

legacy_tests = TestModule.objects.filter(
    is_active=True
).filter(
    description__icontains="_legacy_app_backup"
)

for test in legacy_tests:
    print(f"  ❌ {test.code}: {test.name} (LEGACY - mantener excluido)")

print("\n" + "=" * 100)
print("\n📋 RESUMEN PARA ACTIVACIÓN:\n")
print("Tests que pueden necesitar ajuste de flags:")
print("(Formato: code | current_therapist | current_personal | sugerencia)\n")

for test in catalog_tests:
    # Sugerencia basada en el tipo
    if test.test_type in ['wellness', 'holistic_screening', 'diagnostic']:
        suggestion = "T:true P:false (asignable por terapeuta)"
    else:
        suggestion = f"Revisar caso por caso"
    
    current_state = f"T:{test.available_for_therapists} P:{test.available_for_personal}"
    print(f"  • {test.code:20} | {current_state:20} | → {suggestion}")
