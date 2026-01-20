from django.db import migrations


def ensure_anxiety_state_trait_wellness(apps, schema_editor):
    TestModule = apps.get_model("api", "TestModule")
    TestModule.objects.filter(code="anxiety-state-trait").update(
        is_active=True,
        available_for_personal=True,
        available_for_therapists=True,
        test_type="wellness",
    )


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0056_add_scl90_wellness_testmodule"),
    ]

    operations = [
        migrations.RunPython(
            ensure_anxiety_state_trait_wellness,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
