from django.db import migrations, models


def reclassify_testmodules(apps, schema_editor):
    TestModule = apps.get_model("api", "TestModule")

    legacy_map = {
        "phq-9": ("Pulse Resonance Mirror", "emotional_balance"),
        "bdi-ii": ("Dawn Reflection Index", "emotional_balance"),
        "gad-7": ("Calm Alignment Gauge", "anxiety_balance"),
        "bai": ("Stillness Resonance Inventory", "anxiety_balance"),
        "stai": ("Presence Balance Compass", "anxiety_balance"),
        "isi": ("Dreamflow Attunement", "sleep_harmony"),
        "insomnia-index": ("Restoration Rhythm Index", "sleep_harmony"),
        "ptsd-check": ("Soul Echo Release", "trauma_recovery"),
        "ptsd": ("Soul Echo Release", "trauma_recovery"),
        "ptsd-pcl5": ("Soul Story Harmonizer", "trauma_recovery"),
        "ocd-screen": ("Ritual Flow Snapshot", "ritual_balance"),
        "adhd-adult": ("Attention Flow Compass", "attention_clarity"),
        "adhd": ("Attention Flow Compass", "attention_clarity"),
        "substance-use": ("Sustenance Relationship Mirror", "substance_reconciliation"),
        "substance": ("Sustenance Relationship Mirror", "substance_reconciliation"),
        "eating-disorder": ("Abundance Relationship Mirror", "abundance_relations"),
        "eating": ("Abundance Relationship Mirror", "abundance_relations"),
        "scl90": ("Soul Symmetry Lens", "soul_alignment"),
        "scl-90": ("Soul Symmetry Lens", "soul_alignment"),
        "scl-90-r": ("Soul Symmetry Lens", "soul_alignment"),
        "mcmi-iv": ("Persona Pattern Atlas", "personality_mosaic"),
        "scid5": ("Structural Insight Dialogue", "personality_mosaic"),
        "scid-5-rv": ("Structural Insight Dialogue", "personality_mosaic"),
        "pai": ("Persona Alignment Compass", "persona_alignment"),
        "professional-pai": ("Persona Alignment Compass", "persona_alignment"),
    }

    for code, (public_name, family) in legacy_map.items():
        TestModule.objects.filter(code=code).update(
            public_name=public_name,
            canonical_family=family,
            domain="holistic",
        )

    TestModule.objects.filter(public_name="").update(public_name=models.F("name"))

    technical_prefixes = ("dbg-test", "lock-test", "smoke-test")
    technical_defaults = {
        "domain": "technical",
        "is_internal": True,
        "is_assignable": False,
        "canonical_family": "technical_operations",
        "public_name": "Hidden Operational Probe",
    }
    for prefix in technical_prefixes:
        TestModule.objects.filter(code__startswith=prefix).update(
            **technical_defaults
        )


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0061_mark_technical_tests_non_assignable"),
    ]

    operations = [
        migrations.AddField(
            model_name="testmodule",
            name="public_name",
            field=models.CharField(
                default="",
                max_length=255,
                blank=True,
                help_text="Nombre amigable visible en UI (sin nomenclatura clínica).",
            ),
        ),
        migrations.AddField(
            model_name="testmodule",
            name="canonical_family",
            field=models.CharField(
                max_length=100,
                null=True,
                blank=True,
                help_text="Familia canónica para agrupar instrumentos heredados.",
            ),
        ),
        migrations.AddField(
            model_name="testmodule",
            name="domain",
            field=models.CharField(
                choices=[("holistic", "Holistic"), ("technical", "Technical")],
                default="holistic",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="testmodule",
            name="is_internal",
            field=models.BooleanField(
                default=False,
                help_text="Indica si este módulo es de uso interno (no visible en el catálogo).",
            ),
        ),
        migrations.RunPython(reclassify_testmodules, migrations.RunPython.noop),
    ]
