from django.core.management.base import BaseCommand
from api.test_models import TestModule

LEGACY_HOLISTIC_OVERRIDES = {
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

TECHNICAL_TEST_PREFIXES = ("dbg-test", "lock-test", "smoke-test")

TEST_MODULES = [
    # patient_self
    ("phq-9", "PHQ-9"),
    ("gad-7", "GAD-7"),
    ("bai", "BAI"),
    ("isi", "ISI"),
    ("stai", "STAI"),
    ("adhd", "ADHD Adultos"),
    ("ptsd", "PTSD"),
    ("toc", "TOC"),
    ("eating", "Conducta Alimentaria"),
    ("substances", "Consumo de Sustancias"),
    ("screening-general", "Screening Psicológico General"),
    ("wellness", "Wellness Assessment"),

    # clínicos (en desarrollo)
    ("mcmi-iv", "MCMI-IV"),
    ("scid-5-rv", "SCID-5-RV"),
    ("pai", "PAI"),
]


class Command(BaseCommand):
    help = "Seed TestModule entries (idempotent)"

    def handle(self, *args, **options):
        created = []
        updated = []

        for code, name in TEST_MODULES:
            override = LEGACY_HOLISTIC_OVERRIDES.get(code)
            sanitized_name = override[0] if override else name
            canonical_family = override[1] if override else None
            tm, was_created = TestModule.objects.get_or_create(
                code=code,
                defaults={
                    "name": sanitized_name,
                    "public_name": sanitized_name,
                    "domain": "holistic",
                    **({"canonical_family": canonical_family} if canonical_family else {}),
                    "is_active": True,
                    "available_for_personal": True,
                    "available_for_therapists": True,
                },
            )

            if was_created:
                created.append(code)
            else:
                changed = False
                if tm.name != sanitized_name:
                    tm.name = sanitized_name
                    changed = True
                if tm.public_name != sanitized_name:
                    tm.public_name = sanitized_name
                    changed = True
                if canonical_family and tm.canonical_family != canonical_family:
                    tm.canonical_family = canonical_family
                    changed = True
                if tm.domain != 'holistic':
                    tm.domain = 'holistic'
                    changed = True
                if not tm.is_active:
                    tm.is_active = True
                    changed = True
                if not tm.available_for_personal:
                    tm.available_for_personal = True
                    changed = True
            if not tm.available_for_therapists:
                tm.available_for_therapists = True
                changed = True
            if changed:
                tm.save()
                updated.append(code)

        for prefix in TECHNICAL_TEST_PREFIXES:
            TestModule.objects.filter(code__startswith=prefix).update(
                domain="technical",
                is_internal=True,
                is_assignable=False,
                canonical_family="technical_operations",
                public_name="Hidden Operational Probe",
            )

        self.stdout.write(self.style.SUCCESS("Seed completed"))
        self.stdout.write(f"Created: {created}")
        self.stdout.write(f"Updated: {updated}")
