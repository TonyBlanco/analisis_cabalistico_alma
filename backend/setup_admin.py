#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

# Buscar o crear a Tony
tony_user, created = User.objects.get_or_create(
    username='tony',
    defaults={
        'email': 'tony@admin.local',
        'first_name': 'Tony',
        'last_name': 'Blanco',
    }
)

# Obtener o crear su perfil
profile, created = UserProfile.objects.get_or_create(
    user=tony_user,
    defaults={
        'user_type': 'therapist',
        'full_name': 'Tony Blanco',
        'is_admin': True,
        'subscription_status': 'active',
        'profession': 'Terapeuta y Administrador',
        'max_patients': 0,  # Sin límite
    }
)

# Asegurar que es admin
profile.is_admin = True
profile.save()

print(f"✅ Usuario 'tony' configurado como admin")
print(f"   - Username: {tony_user.username}")
print(f"   - Email: {tony_user.email}")
print(f"   - Tipo: {profile.user_type}")
print(f"   - Admin: {profile.is_admin}")
