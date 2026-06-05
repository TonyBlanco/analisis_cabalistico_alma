"""Check or install the pgvector extension (Postgres only, dry-run by default)."""

from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = (
        "Verify pgvector on the configured database. Default is dry-run (no DDL). "
        "Use --apply to run CREATE EXTENSION IF NOT EXISTS vector on Postgres."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply",
            action="store_true",
            help="Install pgvector (Postgres only). Without this flag, only reports status.",
        )

    def handle(self, *args, **options):
        vendor = connection.vendor
        if vendor != "postgresql":
            self.stdout.write(
                self.style.WARNING(
                    f"Skipping pgvector check: database vendor is {vendor!r}, not postgresql."
                )
            )
            return

        apply = options["apply"]
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT 1 FROM pg_extension WHERE extname = %s",
                ["vector"],
            )
            installed = cursor.fetchone() is not None

        if installed:
            self.stdout.write(self.style.SUCCESS("pgvector extension is already installed."))
            return

        if not apply:
            self.stdout.write(
                self.style.WARNING(
                    "pgvector extension is NOT installed (dry-run). "
                    "Re-run with --apply after ops approval on studio33_db / voxtv_postgres."
                )
            )
            return

        with connection.cursor() as cursor:
            cursor.execute("CREATE EXTENSION IF NOT EXISTS vector")
        self.stdout.write(self.style.SUCCESS("pgvector extension installed (CREATE EXTENSION vector)."))