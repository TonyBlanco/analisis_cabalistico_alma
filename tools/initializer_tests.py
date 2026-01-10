#!/usr/bin/env python
"""
Idempotent initializer for the canonical holistic tests catalog.

Usage:
  python tools/initializer_tests.py           # dry-run (default)
  python tools/initializer_tests.py --apply  # apply changes under transaction

The script reads docs/00_SOURCE_OF_TRUTH/TESTS_HOLISTIC_CATALOG.md,
validates the table, and reconciles TestModule rows without destructive
operations. Dry-run is the default. Applying requires --apply.
"""

from __future__ import annotations

import argparse
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List

# Setup Django
PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_PATH = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_PATH))
sys.path.insert(0, str(PROJECT_ROOT))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

import django  # noqa: E402

django.setup()  # noqa: E402

from django.db import transaction  # noqa: E402
from api.test_models import TestModule  # noqa: E402


CATALOG_RELATIVE = Path("docs/00_SOURCE_OF_TRUTH/TESTS_HOLISTIC_CATALOG.md")
SOURCE_SEARCH_PATHS = [
    PROJECT_ROOT,
    PROJECT_ROOT / "backend",
    PROJECT_ROOT / "tests_holistic_py",
]

VALID_EXECUTION_MODES = {"patient_self", "therapist_guided", "therapist_clinical"}


@dataclass(frozen=True)
class CatalogEntry:
    code: str
    name: str
    test_type: str
    execution_mode: str
    assignable: bool
    source_files: str
    notes: str


def parse_bool(value: str) -> bool:
    normalized = value.strip().lower()
    if normalized in {"true", "1", "yes"}:
        return True
    if normalized in {"false", "0", "no"}:
        return False
    raise ValueError(f"Cannot convert '{value}' to boolean")


def resolve_source_file(name: str) -> Path:
    candidate = Path(name)
    if candidate.is_absolute():
        if candidate.exists():
            return candidate
        raise FileNotFoundError(f"Source file '{name}' not found (absolute path)")

    for base in SOURCE_SEARCH_PATHS:
        maybe = (base / candidate).resolve()
        if maybe.exists():
            return maybe

    raise FileNotFoundError(f"Source file '{name}' not found in canonical search paths")


def parse_catalog(path: Path) -> List[CatalogEntry]:
    if not path.exists():
        raise FileNotFoundError(f"Catalog file not found at {path}")

    lines = path.read_text(encoding="utf-8").splitlines()
    table_started = False
    header_skipped = False
    entries: List[CatalogEntry] = []
    seen_codes: set[str] = set()

    for line in lines:
        stripped = line.strip()

        if not table_started:
            if stripped.startswith("|") and "code" in stripped.lower() and "execution_mode" in stripped.lower():
                table_started = True
            continue

        if not header_skipped:
            if stripped.startswith("|") and stripped.replace(" ", "").startswith("|:---"):
                header_skipped = True
            continue

        if not stripped.startswith("|"):
            break

        segments = [segment.strip() for segment in stripped.split("|")[1:-1]]
        if len(segments) < 7:
            continue

        code = segments[0].strip("`").strip()
        name = segments[1]
        test_type = segments[2]
        execution_mode = segments[3]
        assignable = parse_bool(segments[4])
        source_files = segments[5].strip("`").strip()
        notes = segments[6]

        if not code:
            raise ValueError("Catalog row missing code")
        if code in seen_codes:
            raise ValueError(f"Duplicate code '{code}' in catalog")
        seen_codes.add(code)

        if execution_mode not in VALID_EXECUTION_MODES:
            raise ValueError(f"Unsupported execution_mode '{execution_mode}' for test '{code}'")

        source_path = resolve_source_file(source_files)
        try:
            relative_source = str(source_path.relative_to(PROJECT_ROOT))
        except ValueError:
            relative_source = str(source_path)

        entry = CatalogEntry(
            code=code,
            name=name,
            test_type=test_type,
            execution_mode=execution_mode,
            assignable=assignable,
            source_files=relative_source,
            notes=notes,
        )
        entries.append(entry)

    if not entries:
        raise ValueError("No catalog rows parsed from the canonical table")

    return entries


def summarize_legacy(existing_codes: Iterable[str], canonical_codes: Iterable[str]) -> List[str]:
    canonical_set = set(canonical_codes)
    return sorted([code for code in existing_codes if code not in canonical_set])


def plan_actions(entries: List[CatalogEntry]) -> tuple[list[dict], list[dict]]:
    codes = [entry.code for entry in entries]
    existing_tests = list(TestModule.objects.filter(code__in=codes))
    existing_map = {test.code: test for test in existing_tests}

    to_create: List[dict] = []
    to_update: List[dict] = []

    for entry in entries:
        target_payload = {
            "name": entry.name,
            "test_type": entry.test_type,
            "available_for_therapists": entry.assignable,
        }

        if entry.code in existing_map:
            test = existing_map[entry.code]
            changes = {}
            for field, desired in target_payload.items():
                current = getattr(test, field)
                if current != desired:
                    changes[field] = desired

            if changes:
                to_update.append(
                    {
                        "code": entry.code,
                        "changes": changes,
                        "execution_mode": entry.execution_mode,
                        "source_files": entry.source_files,
                        "notes": entry.notes,
                    }
                )
        else:
            create_payload = {
                "code": entry.code,
                **target_payload,
                "is_active": False,
            }

            to_create.append(
                {
                    "payload": create_payload,
                    "execution_mode": entry.execution_mode,
                    "source_files": entry.source_files,
                    "notes": entry.notes,
                }
            )

    return to_create, to_update


def log_actions(
    catalog_count: int,
    create_actions: List[dict],
    update_actions: List[dict],
    legacy_codes: List[str],
    dry_run: bool,
) -> None:
    header = "DRY-RUN" if dry_run else "APPLY"
    print(f"\n=== Initializer run ({header}) ===")
    print(f"Catalog entries detected: {catalog_count}")
    print(f"Legacy tests ignored: {len(legacy_codes)} (sample: {legacy_codes[:5]})")

    if create_actions:
        print("\nTests to create:")
        for action in create_actions:
            print(
                f"  - {action['payload']['code']} | "
                f"name={action['payload']['name']} | "
                f"exec_mode={action['execution_mode']} | "
                f"source={action['source_files']}"
            )

    if update_actions:
        print("\nTests to update:")
        for action in update_actions:
            changed_fields = ", ".join(sorted(action["changes"].keys()))
            print(
                f"  - {action['code']} | "
                f"fields={changed_fields} | "
                f"exec_mode={action['execution_mode']} | "
                f"source={action['source_files']}"
            )

    if not create_actions and not update_actions:
        print("\nNo catalog changes required (idempotent).")

    print(f"\nDry-run mode: {dry_run}")


def apply_changes(create_actions: List[dict], update_actions: List[dict]) -> None:
    if not create_actions and not update_actions:
        return

    with transaction.atomic():
        for action in create_actions:
            TestModule.objects.create(**action["payload"])
        for action in update_actions:
            TestModule.objects.filter(code=action["code"]).update(**action["changes"])


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Idempotent initializer against the holistic tests catalog"
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Execute the planned changes inside a database transaction",
    )
    parser.add_argument(
        "--catalog",
        type=Path,
        default=CATALOG_RELATIVE,
        help="Path to the canonical catalog markdown",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    dry_run = not args.apply
    catalog_path = args.catalog if args.catalog.is_absolute() else (PROJECT_ROOT / args.catalog)

    try:
        entries = parse_catalog(catalog_path.resolve())
    except Exception as exc:  # pragma: no cover - fatal path
        print(f"Catalog validation failed: {exc}")
        sys.exit(1)

    existing_codes = list(TestModule.objects.values_list("code", flat=True))
    legacy_codes = summarize_legacy(existing_codes, [entry.code for entry in entries])
    create_actions, update_actions = plan_actions(entries)

    log_actions(len(entries), create_actions, update_actions, legacy_codes, dry_run)

    if args.apply:
        try:
            apply_changes(create_actions, update_actions)
            print("\nChanges applied successfully.")
        except Exception as exc:  # pragma: no cover - transaction guard
            print(f"\nFailed to apply changes: {exc}")
            sys.exit(1)
    else:
        print("\nDry-run complete. No database writes were performed.")


if __name__ == "__main__":
    main()
