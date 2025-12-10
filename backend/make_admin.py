"""
Script para hacer admin al usuario superty
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

# Actualizar superty para que sea admin
try:
    user = User.objects.get(username='superty')
    user.is_staff = True
    user.is_superuser = True
    user.save()
    
    # Actualizar el perfil
    profile = user.profile
    profile.is_admin = True
    profile.save()
    
    print(f"✓ Usuario '{user.username}' configurado como administrador")
    print(f"  - is_staff: {user.is_staff}")
    print(f"  - is_superuser: {user.is_superuser}")
    print(f"  - profile.is_admin: {profile.is_admin}")
    print("\n✅ Ahora puedes acceder a /admin en el navegador")
    
except User.DoesNotExist:
    print("❌ Usuario 'superty' no encontrado")
