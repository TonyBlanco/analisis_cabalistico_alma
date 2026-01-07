from django.db import migrations


def update_stress_module(apps, schema_editor):
    TestModule = apps.get_model("api", "TestModule")

    # Update/ensure canonical Wellness stress module
    TestModule.objects.update_or_create(
        code="stress",
        defaults={
            "name": "Estrés — Carga y regulación",
            "description": "Wellness orientativo (no diagnóstico) para explorar carga de estrés, regulación y recursos.",
            "test_type": "wellness",
            "required_access_level": "free",
            "is_active": True,
            "available_for_therapists": True,
            "available_for_personal": True,
            "uses_per_month": None,
            "icon": "🧘",
            "order": 16,
            "estimated_duration": 8,
            "requires_license": False,
            "license_info": "",
        },
    )

    # If an alternative prototype exists, deactivate it to avoid catalog duplication
    TestModule.objects.filter(code="stress-regulation").update(is_active=False)


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0049_add_stress_regulation_testmodule"),
    ]

    operations = [
        migrations.RunPython(update_stress_module, reverse_code=noop_reverse),
    ]

