from django.db import migrations


def align_test_catalog_wiring(apps, schema_editor):
    """
    Align TestModule catalog visibility with FE readiness.

    - scl90: compute_scl90_wellness exists but patient questionnaire is placeholder-only.
      Keep module active for future use; remove from assignable catalog (_safe_testmodule_queryset).
    - stress (legacy): remains inactive; canonical module is stress-regulation (migration 0051).
    """
    TestModule = apps.get_model("api", "TestModule")

    TestModule.objects.filter(code="scl90").update(
        is_assignable=False,
    )

    TestModule.objects.filter(code="stress").update(
        is_active=False,
        is_assignable=False,
    )

    TestModule.objects.filter(code="stress-regulation").update(
        is_active=True,
        is_assignable=True,
    )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0089_process_memory_phase1"),
    ]

    operations = [
        migrations.RunPython(align_test_catalog_wiring, reverse_code=noop_reverse),
    ]