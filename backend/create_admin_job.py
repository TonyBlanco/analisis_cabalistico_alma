#!/usr/bin/env python
"""
One-off job script for Render to create admin user
Run this as a one-off job in Render dashboard
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

def main():
    print("🔧 Creating supertony admin user for production...")

    # Create or get the user
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
        print("✅ Created user: supertony")
    else:
        print("✅ User supertony already exists, updating permissions...")

    # Ensure admin permissions
    user.is_staff = True
    user.is_superuser = True
    user.save()

    # Create or update profile
    profile, profile_created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'user_type': 'therapist',
            'full_name': 'Super Tony Admin',
            'is_admin': True,
            'subscription_status': 'active',
            'profession': 'Administrador del Sistema',
            'max_patients': 0,
        }
    )

    if profile_created:
        print("✅ Created user profile")
    else:
        print("✅ User profile exists, updating...")

    profile.is_admin = True
    profile.save()

    print("\n🎉 Admin user setup complete!")
    print(f"   Username: {user.username}")
    print(f"   Email: {user.email}")
    print(f"   Superuser: {user.is_superuser}")
    print(f"   Staff: {user.is_staff}")
    print(f"   Admin: {profile.is_admin}")
    print("\n💡 You can now access /admin with username 'supertony'")

if __name__ == '__main__':
    main()