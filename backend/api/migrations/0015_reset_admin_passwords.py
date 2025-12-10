from django.db import migrations
from django.contrib.auth.hashers import make_password
import os


def reset_admin_passwords(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    
    # Usar la password de la variable de entorno o el fallback
    password = os.environ.get('ADMIN_DEFAULT_PASSWORD') or os.environ.get('SUPPORT_ADMIN_PASSWORD') or 'Admin2025!'
    
    # Reset supportadmin password
    try:
        user = User.objects.get(username='supportadmin')
        user.password = make_password(password)
        user.save()
    except User.DoesNotExist:
        pass
    
    # Reset supertony password
    try:
        user = User.objects.get(username='supertony')
        user.password = make_password(password)
        user.save()
    except User.DoesNotExist:
        pass


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0014_create_support_admin'),
    ]

    operations = [
        migrations.RunPython(reset_admin_passwords, noop),
    ]
