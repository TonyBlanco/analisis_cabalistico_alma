from django.db import migrations


def create_nutrition_testmodule(apps, schema_editor):
    TestModule = apps.get_model("api", "TestModule")

    TestModule.objects.get_or_create(
        code="nutrition",
        defaults={
            "name": "Alimentación — Relación y hábitos",
            "description": "Evaluación wellness (no diagnóstico) sobre hábitos y relación con la alimentación.",
            "test_type": "holistic_screening",
            "required_access_level": "free",
            "is_active": True,
            "available_for_therapists": True,
            "available_for_personal": True,
            "uses_per_month": None,
            "icon": "🥗",
            "order": 18,
            "estimated_duration": 7,
            "requires_license": False,
            "license_info": "",
        },
    )


def noop_reverse(apps, schema_editor):
    # No-op: we don't delete records on rollback.
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0047_add_stress_testmodule"),
    ]

    operations = [
        migrations.RunPython(create_nutrition_testmodule, reverse_code=noop_reverse),
    ]

