from django.core.management.base import BaseCommand
from django.db import transaction

from api.test_models import HolisticExploration, TestModule


LEGACY_MAPPING = {
    "phq-9": {
        "code": "exploracion_equilibrio_emocional",
        "public_name": "Exploración de Equilibrio Emocional",
        "category": "emocional",
        "primary_sefirah": "Tiferet",
        "secondary_sefirot": ["Chesed", "Gevurah"],
        "description": (
            "Explora el equilibrio emocional y la armonía interna desde una mirada holística."
        ),
    },
    "gad-7": {
        "code": "exploracion_tension_interna",
        "public_name": "Exploración de Tensión Interna",
        "category": "mental",
        "primary_sefirah": "Gevurah",
        "secondary_sefirot": ["Hod"],
        "description": (
            "Explora los estados de tensión interna y su impacto en la claridad mental."
        ),
    },
    "bai": {
        "code": "exploracion_respuesta_somatica",
        "public_name": "Exploración de Respuesta Somática",
        "category": "corporal",
        "primary_sefirah": "Yesod",
        "secondary_sefirot": ["Netzach"],
        "description": (
            "Explora la respuesta corporal y su relación con el equilibrio energético."
        ),
    },
    "bdi-ii": {
        "code": "exploracion_vitalidad_interna",
        "public_name": "Exploración de Vitalidad Interna",
        "category": "energia",
        "primary_sefirah": "Netzach",
        "secondary_sefirot": ["Tiferet"],
        "description": (
            "Explora la vitalidad interna y la conexión con la energía personal."
        ),
    },
}


class Command(BaseCommand):
    help = "Map legacy TestModule entries to HolisticExploration (dry-run by default)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply",
            action="store_true",
            help="Apply changes (default is dry-run).",
        )
        parser.add_argument(
            "--yes",
            action="store_true",
            help="Confirm applying changes without prompt.",
        )

    def handle(self, *args, **options):
        apply_changes = options.get("apply", False)
        assume_yes = options.get("yes", False)

        if apply_changes and not assume_yes:
            self.stdout.write(
                self.style.WARNING("Dry-run only. Use --apply --yes to apply changes.")
            )
            return

        self.stdout.write("Legacy -> HolisticExploration mapping preview:")
        for legacy_code, payload in LEGACY_MAPPING.items():
            self.stdout.write(
                f"- {legacy_code} -> {payload['code']} ({payload['public_name']})"
            )

        created = []
        skipped_existing = []
        missing_tests = []
        conflicts = []

        def process_mapping():
            for legacy_code, payload in LEGACY_MAPPING.items():
                try:
                    source_test = TestModule.objects.get(code=legacy_code)
                except TestModule.DoesNotExist:
                    missing_tests.append(legacy_code)
                    continue

                existing = HolisticExploration.objects.filter(code=payload["code"]).first()
                if existing:
                    if existing.source_test_id != source_test.id:
                        conflicts.append(payload["code"])
                        continue
                    skipped_existing.append(payload["code"])
                    continue

                if apply_changes:
                    HolisticExploration.objects.create(
                        code=payload["code"],
                        public_name=payload["public_name"],
                        category=payload["category"],
                        primary_sefirah=payload["primary_sefirah"],
                        secondary_sefirot=payload["secondary_sefirot"],
                        source_test=source_test,
                        therapist_only_results=True,
                        ai_interpretation_enabled=True,
                        description=payload["description"],
                    )
                created.append(payload["code"])

        if apply_changes:
            with transaction.atomic():
                process_mapping()
        else:
            process_mapping()

        if missing_tests:
            self.stdout.write(
                self.style.WARNING(f"Missing TestModule codes: {missing_tests}")
            )
        if conflicts:
            self.stdout.write(
                self.style.ERROR(
                    "Conflicts (existing code with different source_test): "
                    f"{conflicts}"
                )
            )

        if apply_changes:
            self.stdout.write(self.style.SUCCESS("HolisticExploration mapping applied."))
        else:
            self.stdout.write(self.style.WARNING("Dry-run complete. No changes applied."))

        self.stdout.write(f"To create: {created}")
        self.stdout.write(f"Skipped existing: {skipped_existing}")
