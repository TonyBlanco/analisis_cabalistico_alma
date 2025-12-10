#!/usr/bin/env python
"""
Script para resetear password de supportadmin
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

# Reset password para supportadmin
try:
    user = User.objects.get(username='supportadmin')
    user.set_password('Admin2025!')
    user.save()
    print(f"✅ Password actualizada para {user.username}")
    print(f"   Username: supportadmin")
    print(f"   Password: Admin2025!")
except User.DoesNotExist:
    print("❌ Usuario supportadmin no existe")

# Reset password para supertony también
try:
    user = User.objects.get(username='supertony')
    user.set_password('Admin2025!')
    user.save()
    print(f"✅ Password actualizada para {user.username}")
    print(f"   Username: supertony")
    print(f"   Password: Admin2025!")
except User.DoesNotExist:
    print("❌ Usuario supertony no existe")
