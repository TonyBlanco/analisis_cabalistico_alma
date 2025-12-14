# Migration para forzar reset de passwords admin
import os
from django.db import migrations
from django.contrib.auth.hashers import make_password


def force_reset_passwords(apps, schema_editor):
    """
    Fuerza el reset de contraseñas de usuarios admin.
    Esta migración se ejecutará incluso si hubo migraciones previas.
    """
    User = apps.get_model('auth', 'User')
    
    # Password desde env o default
    password = os.environ.get('ADMIN_DEFAULT_PASSWORD', 'Admin2025!')
    hashed_password = make_password(password)
    
    # Lista de usuarios a crear/actualizar
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
    
    for user_data in admin_users:
        username = user_data.pop('username')
        
        try:
            # Intentar obtener el usuario existente
            user = User.objects.get(username=username)
            # Actualizar todos los campos
            for key, value in user_data.items():
                setattr(user, key, value)
            user.password = hashed_password
            user.save()
            print(f"[OK] Usuario actualizado: {username}")
        except User.DoesNotExist:
            # Crear nuevo usuario
            user = User.objects.create(
                username=username,
                password=hashed_password,
                **user_data
            )
            print(f"[OK] Usuario creado: {username}")


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_create_all_admin_users'),
    ]

    operations = [
        migrations.RunPython(force_reset_passwords, migrations.RunPython.noop),
    ]
