from django.db import migrations
import os


def set_supertony_password(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    password = os.environ.get('ADMIN_DEFAULT_PASSWORD') or 'SuperTonyTemp123!'
    try:
        user = User.objects.get(username='supertony')
    except User.DoesNotExist:
        return
    user.set_password(password)
    user.save()


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0012_testresult_patient'),
    ]

    operations = [
        migrations.RunPython(set_supertony_password, noop),
    ]
