from django.db import migrations


def create_anxiety_state_trait(apps, schema_editor):
    TestModule = apps.get_model("api", "TestModule")
    TestModule.objects.get_or_create(
        code="anxiety-state-trait",
        defaults={
            "name": "Ansiedad — Estado y rasgo",
            "description": "Wellness orientativo para mapear la ansiedad del presente y las tendencias personales.",
            "test_type": "wellness",
            "required_access_level": "free",
            "is_active": True,
            "available_for_therapists": True,
            "available_for_personal": True,
            "uses_per_month": None,
            "icon": "⚖️",
            "order": 17,
            "estimated_duration": 8,
            "requires_license": False,
            "license_info": "",
        },
    )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0053_remove_scdf_testmodule"),
    ]

    operations = [
        migrations.RunPython(create_anxiety_state_trait, reverse_code=noop_reverse),
    ]
