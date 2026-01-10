#!/usr/bin/env python
"""Normalize selected legacy TestModule flags (DRY-RUN by default).

Usage:
  python tools/normalize_legacy_tests.py          # dry-run (default)
  python tools/normalize_legacy_tests.py --apply  # apply changes under transaction (requires explicit flag)

This script is non-destructive by default and will only update the allowed
fields for the authorized TARGET_CODES. It will abort on missing codes or
unexpected errors. APPLY uses a DB transaction.
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

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


# Authorized target codes to normalize
TARGET_CODES = [
    "phq-9",
    "gad-7",
    "bai",
    "insomnia",
    "anxiety-state-trait",
]

# Desired canonical values (only fields allowed to change)
# NOTE: `required_access_level` uses a patient-level value 'personal'.
# `test_type` set to 'holistic' as per governance (may not be present in model choices but
# this is the agreed canonical string in the catalog).
DESIRED = {
    "available_for_personal": True,
    "available_for_therapists": True,
    "requires_license": False,
    "required_access_level": "personal",
    "test_type": "holistic",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Normalize legacy TestModule flags (dry-run default)")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Execute the planned updates inside a database transaction",
    )
    return parser.parse_args()


def gather_tasks() -> list[dict]:
    tasks: list[dict] = []

    for code in TARGET_CODES:
        try:
            tm = TestModule.objects.get(code=code)
        except TestModule.DoesNotExist:
            raise RuntimeError(f"Required TestModule with code '{code}' not found - aborting")

        # Compute minimal changes only for allowed fields
        changes = {}
        for field, desired in DESIRED.items():
            # Only consider attributes that actually exist on the model
            if not hasattr(tm, field):
                # Skip silently fields that don't exist on the model (e.g. execution_mode not present)
                continue
            current = getattr(tm, field)
            if current != desired:
                changes[field] = {"from": current, "to": desired}

        blocked = bool(changes)

        tasks.append({
            "code": code,
            "exists": True,
            "blocked": blocked,
            "changes": changes,
        })

    return tasks


def log_dry_run(tasks: list[dict]) -> None:
    print("\n=== Normalization run (DRY-RUN) ===")
    for t in tasks:
        code = t["code"]
        if not t.get("exists"):
            print(f"[DRY-RUN] {code}: MISSING (would abort)")
            continue

        if not t["blocked"]:
            print(f"[DRY-RUN] {code}: not blocked — no changes required")
            continue

        for field, diff in t["changes"].items():
            print(f"[DRY-RUN] {code}: {field} {diff['from']} -> {diff['to']}")

    print("\n[DRY-RUN] No database changes applied")


def apply_changes(tasks: list[dict]) -> None:
    if not any(t["blocked"] for t in tasks):
        print("No changes required for any target tests.")
        return

    with transaction.atomic():
        for t in tasks:
            code = t["code"]
            if not t["blocked"]:
                print(f"[APPLY] {code}: no changes required")
                continue

            # Build update payload with only allowed DB fields
            payload = {}
            for field, diff in t["changes"].items():
                # Defensive: ensure field exists on model
                if hasattr(TestModule, field) or hasattr(TestModule(), field):
                    payload[field] = diff["to"]

            if not payload:
                print(f"[APPLY] {code}: nothing to update (payload empty) — skipping")
                continue

            # Perform the update
            updated = TestModule.objects.filter(code=code).update(**payload)
            if updated:
                print(f"[APPLY] Updated {code}")
            else:
                # Unexpected: record existed earlier but now not found
                raise RuntimeError(f"Failed to update {code} — record not found during apply")

    print("[APPLY] Transaction committed successfully")


def main() -> None:
    args = parse_args()
    dry_run = not args.apply

    try:
        tasks = gather_tasks()
    except Exception as exc:  # fatal validation
        print(f"Validation failed: {exc}")
        sys.exit(1)

    # Log dry-run output
    log_dry_run(tasks)

    if args.apply:
        # Confirm explicitly via CLI flag only (no interactive prompt)
        try:
            apply_changes(tasks)
        except Exception as exc:  # pragma: no cover - transaction guard
            print(f"Failed to apply changes: {exc}")
            sys.exit(1)
    else:
        # Dry-run: do not write to DB
        pass


if __name__ == "__main__":
    main()
