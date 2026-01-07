from django.db import migrations


def noop(apps, schema_editor):
    # SCDF was temporarily added as a TestModule, but it must be a therapist-only
    # workspace tool and not part of the tests execution/catalog system.
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0051_make_stress_regulation_primary"),
    ]

    operations = [
        migrations.RunPython(noop, reverse_code=noop),
    ]
