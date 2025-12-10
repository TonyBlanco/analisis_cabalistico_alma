#!/usr/bin/env python
"""
Script para dar acceso especial a todos los tests a un usuario específico.

Uso:
    python grant_all_access.py [username]

Si no se pasa username, se usa la variable de entorno TEST_ACCESS_USER o el
usuario por defecto 'supertony'.
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.test_models import TestModule, UserTestAccess

print("=" * 60)
username = os.environ.get('TEST_ACCESS_USER') or (sys.argv[1] if len(sys.argv) > 1 else 'supertony')

print("OTORGANDO ACCESO ESPECIAL A TODOS LOS TESTS")
print("=" * 60)

try:
    # Obtener usuario objetivo
    user = User.objects.get(username=username)
    print(f"\n✅ Usuario encontrado: {user.username}")
    
    # Obtener todos los tests
    all_tests = TestModule.objects.all()
    print(f"✅ Tests disponibles: {all_tests.count()}")
    
    granted = 0
    updated = 0
    
    for test in all_tests:
        # Crear o actualizar acceso especial
        access, created = UserTestAccess.objects.get_or_create(
            user=user,
            test_module=test
        )
        
        # Dar acceso especial ilimitado
        access.has_special_access = True
        access.save()
        
        if created:
            granted += 1
            print(f"  ✅ Acceso creado: {test.name}")
        else:
            updated += 1
            print(f"  🔄 Acceso actualizado: {test.name}")
    
    print(f"\n" + "=" * 60)
    print(f"✅ COMPLETADO")
    print(f"   Nuevos accesos: {granted}")
    print(f"   Actualizados: {updated}")
    print(f"   Total: {all_tests.count()}")
    print("=" * 60)
    
    # Verificar accesos
    print("\n📋 ACCESOS ESPECIALES DE SUPERTY:")
    special_accesses = UserTestAccess.objects.filter(
        user=user, 
        has_special_access=True
    )
    
    for access in special_accesses:
        print(f"  ✅ {access.test_module.name} - Usos: {access.current_month_uses}")

except User.DoesNotExist:
    print(f"❌ Usuario '{username}' no encontrado")
    print("   Primero ejecuta: python manage.py createsuperuser <username>")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
