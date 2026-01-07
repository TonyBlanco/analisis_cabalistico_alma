from django.db import migrations


def disable_stai_module(apps, schema_editor):
    TestModule = apps.get_model("api", "TestModule")
    TestModule.objects.filter(code="stai").update(
        is_active=False,
        available_for_personal=False,
        available_for_therapists=False,
    )


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0054_add_anxiety_state_trait_testmodule"),
    ]

    operations = [
        migrations.RunPython(disable_stai_module, reverse_code=migrations.RunPython.noop),
    ]
