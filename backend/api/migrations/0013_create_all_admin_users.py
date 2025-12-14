# Generated migration to create all admin users
# This migration ensures users persist across Render database resets
import os
from django.db import migrations
from django.contrib.auth.hashers import make_password


def create_all_admins(apps, schema_editor):
    """
    Create or update all administrative users.
    Uses ADMIN_DEFAULT_PASSWORD env var or 'Admin2025!' as fallback.
    """
    User = apps.get_model('auth', 'User')
    
    # Get password from environment
    password = os.environ.get('ADMIN_DEFAULT_PASSWORD', 'Admin2025!')
    
    # Define all admin users
    admin_users = [
        {
            'username': 'supertony',
            'email': 'luisbl@msn.com',
            'first_name': 'Tony',
            'last_name': 'Super',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
        },
        {
            'username': 'supportadmin',
            'email': 'support@analisis-cabalistico-alma.com',
            'first_name': 'Support',
            'last_name': 'Admin',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
        },
        {
            'username': 'tony',
            'email': 'luisbl@msn.com',
            'first_name': 'Tony',
            'last_name': 'Blanco',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
        },
    ]
    
    # Create or update each user
    for user_data in admin_users:
        username = user_data.pop('username')
        
        # Check if user exists
        try:
            user = User.objects.get(username=username)
            # Update existing user
            for key, value in user_data.items():
                setattr(user, key, value)
            user.password = make_password(password)
            user.save()
            print(f"[OK] Updated existing user: {username}")
        except User.DoesNotExist:
            # Create new user
            user = User.objects.create(
                username=username,
                password=make_password(password),
                **user_data
            )
            print(f"[OK] Created new user: {username}")


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_testresult_patient'),
    ]

    operations = [
        migrations.RunPython(create_all_admins, migrations.RunPython.noop),
    ]
