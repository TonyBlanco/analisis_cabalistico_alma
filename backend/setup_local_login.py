#!/usr/bin/env python
"""
Script rápido para configurar un usuario local para desarrollo
Permite crear un nuevo usuario o actualizar la contraseña de uno existente
"""
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

def main():
    print("=" * 70)
    print("CONFIGURAR USUARIO LOCAL PARA DESARROLLO")
    print("=" * 70)
    print()
    
    # Mostrar usuarios existentes
    print("Usuarios existentes:")
    users = User.objects.all().order_by('username')
    for i, user in enumerate(users, 1):
        print(f"  {i}. {user.username} ({user.email or 'sin email'}) - Superuser: {user.is_superuser}")
    print()
    
    # Opciones
    print("Opciones:")
    print("  1. Crear nuevo usuario")
    print("  2. Actualizar contraseña de usuario existente")
    print("  3. Crear usuario 'admin' con contraseña 'admin123' (rápido)")
    print()
    
    choice = input("Selecciona opción (1/2/3): ").strip()
    
    if choice == "1":
        # Crear nuevo usuario
        username = input("Username: ").strip()
        email = input("Email: ").strip()
        password = input("Password: ").strip()
        is_superuser = input("¿Es superusuario? (s/n): ").strip().lower() == 's'
        
        if User.objects.filter(username=username).exists():
            print(f"❌ El usuario '{username}' ya existe")
            return
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_superuser=is_superuser,
            is_staff=is_superuser
        )
        
        # Crear perfil
        UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'user_type': 'therapist' if is_superuser else 'personal',
                'full_name': username,
                'is_admin': is_superuser,
                'subscription_status': 'active',
            }
        )
        
        print(f"\n✅ Usuario '{username}' creado exitosamente")
        print(f"   Puedes iniciar sesión con:")
        print(f"   Username: {username}")
        print(f"   Password: {password}")
        
    elif choice == "2":
        # Actualizar contraseña
        username = input("Username del usuario a actualizar: ").strip()
        try:
            user = User.objects.get(username=username)
            password = input("Nueva contraseña: ").strip()
            user.set_password(password)
            user.save()
            print(f"\n✅ Contraseña actualizada para '{username}'")
            print(f"   Puedes iniciar sesión con:")
            print(f"   Username: {username}")
            print(f"   Password: {password}")
        except User.DoesNotExist:
            print(f"❌ Usuario '{username}' no encontrado")
            
    elif choice == "3":
        # Crear usuario admin rápido
        username = "admin"
        email = "admin@local.dev"
        password = "admin123"
        
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'is_superuser': True,
                'is_staff': True,
            }
        )
        
        if not created:
            user.is_superuser = True
            user.is_staff = True
            user.save()
        
        user.set_password(password)
        user.save()
        
        # Crear/actualizar perfil
        profile, _ = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'user_type': 'therapist',
                'full_name': 'Admin Local',
                'is_admin': True,
                'subscription_status': 'active',
            }
        )
        profile.is_admin = True
        profile.subscription_status = 'active'
        profile.save()
        
        print(f"\n✅ Usuario '{username}' configurado")
        print(f"   Puedes iniciar sesión con:")
        print(f"   Username: {username}")
        print(f"   Password: {password}")
    else:
        print("❌ Opción inválida")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Cancelado por el usuario")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()




