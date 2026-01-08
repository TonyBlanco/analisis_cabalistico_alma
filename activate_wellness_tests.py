"""
Script para activar correctamente los tests wellness/screening para asignación por terapeuta
"""
import os
import sys
import django

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.test_models import TestModule

print("=== ACTIVACIÓN DE TESTS WELLNESS/SCREENING ===\n")

# Tests a actualizar
tests_to_update = [
    'anxiety-state-trait',
    'bdi-ii',
    'insomnia',
    'nutrition',
    'past-lives',
    'scl90',
    'screening-general',
    'stress-regulation',
    'wellness'
]

print("Tests que se actualizarán a T:true P:false (asignables por terapeuta):\n")

updated_count = 0
errors = []

for code in tests_to_update:
    try:
        test = TestModule.objects.get(code=code)
        
        # Guardar estado anterior
        old_therapist = test.available_for_therapists
        old_personal = test.available_for_personal
        
        # Actualizar flags
        test.available_for_therapists = True
        test.available_for_personal = False
        test.save()
        
        updated_count += 1
        
        status = "✅ ACTUALIZADO" if (old_therapist != True or old_personal != False) else "✓ Ya estaba correcto"
        print(f"{status} | {code:20} | {old_therapist}→True | {old_personal}→False")
        
    except TestModule.DoesNotExist:
        error_msg = f"❌ ERROR: Test '{code}' no existe en BD"
        errors.append(error_msg)
        print(error_msg)
    except Exception as e:
        error_msg = f"❌ ERROR actualizando '{code}': {str(e)}"
        errors.append(error_msg)
        print(error_msg)

print("\n" + "=" * 80)
print(f"\n✅ Tests actualizados: {updated_count}/{len(tests_to_update)}")

if errors:
    print(f"❌ Errores: {len(errors)}")
    for error in errors:
        print(f"  {error}")
else:
    print("✅ Sin errores")

print("\n=== VERIFICACIÓN FINAL ===\n")

# Verificar estado final
for code in tests_to_update:
    try:
        test = TestModule.objects.get(code=code)
        status = "✅" if (test.available_for_therapists and not test.available_for_personal) else "⚠️"
        print(f"{status} {code:20} | T:{test.available_for_therapists} P:{test.available_for_personal}")
    except TestModule.DoesNotExist:
        print(f"❌ {code:20} | NO EXISTE")

print("\n✅ ACTIVACIÓN COMPLETADA")
print("Los tests ahora pueden ser asignados por terapeutas a consultantes.")
