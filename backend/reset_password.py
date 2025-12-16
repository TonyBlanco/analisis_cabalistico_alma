#!/usr/bin/env python
"""
Script para resetear la contraseña de un usuario
"""
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

if len(sys.argv) < 2:
    print("Uso: python reset_password.py <username_or_email> [new_password]")
    print("Ejemplo: python reset_password.py tonypaciente@dev.local dev123")
    sys.exit(1)

username_or_email = sys.argv[1]
new_password = sys.argv[2] if len(sys.argv) > 2 else "dev123"

# Buscar usuario por username o email
try:
    user = User.objects.get(username=username_or_email)
except User.DoesNotExist:
    try:
        user = User.objects.get(email=username_or_email)
    except User.DoesNotExist:
        print(f"Usuario '{username_or_email}' no encontrado")
        sys.exit(1)

# Actualizar contraseña
user.set_password(new_password)
user.save()

print(f"Contraseña actualizada para usuario: {user.username} ({user.email})")
print(f"Nueva contraseña: {new_password}")
