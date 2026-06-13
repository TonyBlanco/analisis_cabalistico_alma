from django.db import migrations


def activate_asrs_essence(apps, schema_editor):
    TestModule = apps.get_model('api', 'TestModule')
    TestModule.objects.filter(code='asrs_essence').update(
        is_active=True,
        available_for_personal=True,
    )


def deactivate_asrs_essence(apps, schema_editor):
    TestModule = apps.get_model('api', 'TestModule')
    TestModule.objects.filter(code='asrs_essence').update(
        is_active=False,
        available_for_personal=False,
    )


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0103_activate_holistic_tests'),
    ]

    operations = [
        migrations.RunPython(
            activate_asrs_essence,
            reverse_code=deactivate_asrs_essence,
        ),
    ]