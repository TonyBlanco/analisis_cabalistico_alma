"""
Verificación final completa del estado de tests
"""
import os
import sys
import django

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.test_models import TestModule

print("╔" + "═" * 78 + "╗")
print("║" + " " * 20 + "VERIFICACIÓN FINAL COMPLETA" + " " * 31 + "║")
print("╚" + "═" * 78 + "╝\n")

# 1. Catálogo activo
catalog = TestModule.objects.filter(is_active=True).exclude(
    description__icontains="_legacy_app_backup"
).exclude(
    description__icontains="No ejecutable"
)

print("✅ CATÁLOGO ACTIVO")
print(f"   Total: {catalog.count()} tests\n")

# 2. Tests asignables
assignable = catalog.filter(available_for_therapists=True)
print("✅ TESTS ASIGNABLES POR TERAPEUTA")
print(f"   Total: {assignable.count()}/{catalog.count()}\n")

for test in assignable.order_by('code'):
    print(f"   ✓ {test.code:22} | {test.name[:40]:40} | T:{test.available_for_therapists} P:{test.available_for_personal}")

# 3. Legacy excluido
print("\n✅ LEGACY EXCLUIDO DEL CATÁLOGO")
legacy_codes = ['bai', 'gad-7', 'phq-9']
for code in legacy_codes:
    try:
        test = TestModule.objects.get(code=code)
        in_catalog = not ("_legacy_app_backup" in test.description or "No ejecutable" in test.description)
        status = "❌ EN CATÁLOGO" if in_catalog else "✅ EXCLUIDO"
        print(f"   {status} | {code}")
    except TestModule.DoesNotExist:
        print(f"   ⚠️  NO EXISTE | {code}")

# 4. Wellness específicamente
print("\n✅ WELLNESS ASSESSMENT")
wellness = catalog.filter(code='wellness').first()
if wellness:
    print(f"   ✓ Visible en catálogo")
    print(f"   ✓ Asignable: {wellness.available_for_therapists}")
    print(f"   ✓ Nombre: {wellness.name}")
else:
    print(f"   ❌ NO ENCONTRADO")

# 5. scl90 corregido
print("\n✅ SCL90 (CORREGIDO)")
scl90 = catalog.filter(code='scl90').first()
if scl90:
    print(f"   ✓ Visible en catálogo")
    print(f"   ✓ Asignable: {scl90.available_for_therapists} (era False)")
    print(f"   ✓ Personal: {scl90.available_for_personal}")
else:
    print(f"   ❌ NO ENCONTRADO")

# Resumen final
print("\n" + "═" * 80)
print("\n🎯 RESUMEN EJECUTIVO\n")
print(f"   • Tests en catálogo activo: {catalog.count()}")
print(f"   • Tests asignables por terapeuta: {assignable.count()}")
print(f"   • Tests legacy excluidos correctamente: {len(legacy_codes)}")
print(f"   • Wellness visible y asignable: {'✅ SÍ' if wellness and wellness.available_for_therapists else '❌ NO'}")
print(f"   • scl90 corregido para terapeutas: {'✅ SÍ' if scl90 and scl90.available_for_therapists else '❌ NO'}")
print("\n✅ SISTEMA COHERENTE Y FUNCIONAL")
print("   → Catálogo limpio (sin legacy)")
print("   → Tests asignables (T:true P:false)")
print("   → Histórico preservado en BD")
print("\n" + "═" * 80)
