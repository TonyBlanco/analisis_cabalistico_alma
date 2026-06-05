#!/usr/bin/env python
"""Asegura UserProfile admin para superusuarios en Studios33 (ejecutar en studio33_api)."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

ADMIN_USERNAMES = ('tony', 'supertony', 'supportadmin')


def main():
    updated = 0
    for user in User.objects.filter(is_superuser=True) | User.objects.filter(
        username__in=ADMIN_USERNAMES
    ):
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'user_type': 'therapist',
                'full_name': user.get_full_name() or user.username,
                'is_admin': True,
                'subscription_status': 'active',
            },
        )
        changed = created
        if not profile.is_admin:
            profile.is_admin = True
            changed = True
        if not user.is_staff:
            user.is_staff = True
            user.save(update_fields=['is_staff'])
            changed = True
        if not user.is_superuser and user.username in ADMIN_USERNAMES:
            user.is_superuser = True
            user.save(update_fields=['is_superuser'])
            changed = True
        if changed:
            profile.save()
            updated += 1
            print(f'OK {user.username} profile_type={profile.user_type} is_admin={profile.is_admin}')
    print(f'Done. Updated/created: {updated}')


if __name__ == '__main__':
    main()