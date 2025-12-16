#!/usr/bin/env python
"""
Script para crear o actualizar un usuario local en Django
Útil cuando las credenciales de Render no funcionan localmente
"""
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

def create_or_update_user(username, email, password, is_superuser=False, is_staff=False):
    """Crea o actualiza un usuario local"""
    
    # Buscar o crear usuario
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'is_superuser': is_superuser,
            'is_staff': is_staff,
        }
    )
    
    # Si el usuario ya existe, actualizar
    if not created:
        user.email = email
        user.is_superuser = is_superuser
        user.is_staff = is_staff
        user.save()
        print(f"✅ Usuario '{username}' actualizado")
    else:
        print(f"✅ Usuario '{username}' creado")
    
    # Establecer contraseña
    user.set_password(password)
    user.save()
    
    # Crear o actualizar perfil
    profile, profile_created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'user_type': 'therapist' if is_superuser else 'personal',
            'full_name': user.get_full_name() or username,
            'is_admin': is_superuser,
            'subscription_status': 'active',
        }
    )
    
    if not profile_created:
        profile.is_admin = is_superuser
        profile.subscription_status = 'active'
        profile.save()
    
    print(f"   - Username: {user.username}")
    print(f"   - Email: {user.email}")
    print(f"   - Superuser: {user.is_superuser}")
    print(f"   - Staff: {user.is_staff}")
    print(f"   - Password: {'[ESTABLECIDA]'}")
    print(f"   - Perfil: {profile.user_type} (Admin: {profile.is_admin})")
    print()
    
    return user

if __name__ == '__main__':
    print("=" * 60)
    print("CREAR/ACTUALIZAR USUARIO LOCAL")
    print("=" * 60)
    print()
    
    # Si se pasan argumentos, usarlos
    if len(sys.argv) >= 4:
        username = sys.argv[1]
        email = sys.argv[2]
        password = sys.argv[3]
        is_superuser = len(sys.argv) > 4 and sys.argv[4].lower() == 'true'
    else:
        # Modo interactivo
        print("Ingresa los datos del usuario:")
        username = input("Username: ").strip()
        email = input("Email: ").strip()
        password = input("Password: ").strip()
        superuser_input = input("¿Es superusuario? (s/n): ").strip().lower()
        is_superuser = superuser_input == 's'
    
    if not username or not email or not password:
        print("❌ Error: Username, email y password son requeridos")
        sys.exit(1)
    
    create_or_update_user(username, email, password, is_superuser, is_superuser)
    
    print("=" * 60)
    print("✅ Usuario listo para usar localmente")
    print("=" * 60)












