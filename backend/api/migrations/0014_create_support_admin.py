from django.db import migrations
import os
from django.contrib.auth.hashers import make_password


def create_support_admin(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    password = os.environ.get('ADMIN_DEFAULT_PASSWORD') or os.environ.get('SUPPORT_ADMIN_PASSWORD') or 'TempAdmin123!'

    user, _ = User.objects.get_or_create(
        username='supportadmin',
        defaults={
            'email': 'support@analisis-cabalistico-alma.com',
            'first_name': 'Support',
            'last_name': 'Admin',
            'is_staff': True,
            'is_superuser': True,
            'password': make_password(password),
        }
    )

    # Ensure flags and password if user existed
    user.is_staff = True
    user.is_superuser = True
    user.password = make_password(password)
    user.save()


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0013_set_supertony_password'),
    ]

    operations = [
        migrations.RunPython(create_support_admin, noop),
    ]
