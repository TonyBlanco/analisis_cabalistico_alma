from django.db import migrations


def make_stress_regulation_primary(apps, schema_editor):
    TestModule = apps.get_model("api", "TestModule")

    # The canonical wellness test requested by product is stress-regulation.
    # Keep it active to match the patient route /dashboard/patient/tests/stress-regulation.
    TestModule.objects.filter(code="stress-regulation").update(is_active=True)

    # Avoid catalog duplication: keep the older stress module inactive (it was used by a different contract).
    TestModule.objects.filter(code="stress").update(is_active=False)


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0050_update_stress_to_wellness"),
    ]

    operations = [
        migrations.RunPython(make_stress_regulation_primary, reverse_code=noop_reverse),
    ]

