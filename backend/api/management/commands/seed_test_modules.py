from django.core.management.base import BaseCommand
from api.test_models import TestModule

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
            tm, was_created = TestModule.objects.get_or_create(
                code=code,
                defaults={
                    "name": name,
                    "is_active": True,
                    "available_for_personal": True,
                    "available_for_therapists": True,
                },
            )

            if was_created:
                created.append(code)
            else:
                changed = False
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

        self.stdout.write(self.style.SUCCESS("Seed completed"))
        self.stdout.write(f"Created: {created}")
        self.stdout.write(f"Updated: {updated}")
