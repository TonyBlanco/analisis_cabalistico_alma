from django.db import migrations


def create_stress_testmodule(apps, schema_editor):
    TestModule = apps.get_model("api", "TestModule")

    TestModule.objects.get_or_create(
        code="stress",
        defaults={
            "name": "Estrés — Carga y regulación",
            "description": "Screening orientativo (no diagnóstico) para explorar carga de estrés y recursos de regulación.",
            "test_type": "holistic_screening",
            "required_access_level": "free",
            "is_active": True,
            "available_for_therapists": True,
            "available_for_personal": True,
            "uses_per_month": None,
            "icon": "🧩",
            "order": 16,
            "estimated_duration": 8,
            "requires_license": False,
            "license_info": "",
        },
    )


def noop_reverse(apps, schema_editor):
    # No-op: we don't delete records on rollback.
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0046_resonanciarelation"),
    ]

    operations = [
        migrations.RunPython(create_stress_testmodule, reverse_code=noop_reverse),
    ]

