#!/usr/bin/env python
"""
Lista todos los usuarios en la base de datos local
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

print("=" * 70)
print("USUARIOS EN BASE DE DATOS LOCAL")
print("=" * 70)
print()

users = User.objects.all().order_by('username')

if not users.exists():
    print("❌ No hay usuarios en la base de datos local")
    print()
    print("Para crear un usuario, ejecuta:")
    print("  python manage.py createsuperuser")
    print()
    print("O usa el script:")
    print("  python create_local_user.py")
else:
    print(f"Total de usuarios: {users.count()}\n")
    
    for user in users:
        try:
            profile = user.profile
            user_type = profile.user_type
            is_admin = profile.is_admin
        except:
            user_type = "N/A"
            is_admin = False
        
        print(f"👤 {user.username}")
        print(f"   Email: {user.email or '(sin email)'}")
        print(f"   Superuser: {'✅' if user.is_superuser else '❌'}")
        print(f"   Staff: {'✅' if user.is_staff else '❌'}")
        print(f"   Tipo: {user_type}")
        print(f"   Admin (perfil): {'✅' if is_admin else '❌'}")
        print()

print("=" * 70)
print("Para crear un nuevo usuario:")
print("  python create_local_user.py")
print("  O: python manage.py createsuperuser")
print("=" * 70)














