#!/usr/bin/env python
"""
Script para crear el usuario supertony en producción
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

def create_production_admin():
    print("🔧 Creando usuario administrador 'supertony' en producción...")

    # Crear o actualizar usuario supertony
    user, created = User.objects.get_or_create(
        username='supertony',
        defaults={
            'email': 'admin@analisis-cabalistico-alma.com',
            'first_name': 'Super',
            'last_name': 'Tony',
            'is_staff': True,
            'is_superuser': True,
        }
    )

    if created:
        print("✅ Usuario 'supertony' creado")
    else:
        print("✅ Usuario 'supertony' ya existía, actualizando permisos...")

    # Asegurar permisos de admin
    user.is_staff = True
    user.is_superuser = True
    user.save()

    # Crear o actualizar perfil
    profile, profile_created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'user_type': 'therapist',
            'full_name': 'Super Tony Admin',
            'is_admin': True,
            'subscription_status': 'active',
            'profession': 'Administrador del Sistema',
            'max_patients': 0,  # Sin límite
        }
    )

    if profile_created:
        print("✅ Perfil de usuario creado")
    else:
        print("✅ Perfil de usuario actualizado")

    profile.is_admin = True
    profile.save()

    print("\n🎉 ¡Usuario administrador configurado exitosamente!")
    print(f"   📧 Email: {user.email}")
    print("   🔑 Username: supertony"
    print("   👑 Superuser: True"
    print("   🛡️  Staff: True"
    print("   ⚡ Admin: True"
    print("\n💡 Ahora puedes acceder a /admin en producción con el usuario 'supertony'")

if __name__ == '__main__':
    create_production_admin()