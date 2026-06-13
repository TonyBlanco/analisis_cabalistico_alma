from django.db import migrations


def activate_holistic_tests(apps, schema_editor):
    TestModule = apps.get_model('api', 'TestModule')
    # Activar available_for_personal para los holísticos patient_self
    TestModule.objects.filter(code__in=[
        'sha_harmony', 'eat26_spirit', 'dudit_spirit', 'ybocs_soul'
    ]).update(available_for_personal=True)
    # Activar aq_kabbalah que estaba is_active=False
    TestModule.objects.filter(code='aq_kabbalah').update(
        is_active=True, available_for_personal=True
    )


def deactivate_holistic_tests(apps, schema_editor):
    TestModule = apps.get_model('api', 'TestModule')
    TestModule.objects.filter(code__in=[
        'sha_harmony', 'eat26_spirit', 'dudit_spirit', 'ybocs_soul'
    ]).update(available_for_personal=False)
    TestModule.objects.filter(code='aq_kabbalah').update(
        is_active=False, available_for_personal=False
    )


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0102_auth_advanced'),
    ]

    operations = [
        migrations.RunPython(
            activate_holistic_tests,
            reverse_code=deactivate_holistic_tests,
        ),
    ]
