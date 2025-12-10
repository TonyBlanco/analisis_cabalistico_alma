from django.db import migrations
from django.contrib.auth.hashers import make_password


def reset_admin_passwords(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    
    # Reset supportadmin password
    try:
        user = User.objects.get(username='supportadmin')
        user.password = make_password('Admin2025!')
        user.save()
    except User.DoesNotExist:
        pass
    
    # Reset supertony password
    try:
        user = User.objects.get(username='supertony')
        user.password = make_password('Admin2025!')
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
