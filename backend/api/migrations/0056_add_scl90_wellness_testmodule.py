from django.db import migrations


def create_scl90_wellness_testmodule(apps, schema_editor):
    TestModule = apps.get_model("api", "TestModule")
    TestModule.objects.get_or_create(
        code="scl90",
        defaults={
            "name": "SCL-90 — Screening Holístico",
            "description": "Versión holística tipo Wellness del SCL-90 para evaluar síntomas generales sin diagnóstico.",
            "test_type": "wellness",
            "required_access_level": "free",
            "is_active": True,
            "available_for_personal": True,
            "available_for_therapists": False,
            "uses_per_month": None,
            "icon": "🌿",
            "order": 25,
            "estimated_duration": 12,
            "requires_license": False,
            "license_info": "",
        },
    )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0055_disable_stai_module"),
    ]

    operations = [
        migrations.RunPython(create_scl90_wellness_testmodule, reverse_code=noop_reverse),
    ]
