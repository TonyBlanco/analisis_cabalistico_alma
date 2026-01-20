#!/usr/bin/env python
"""
Reclasifica TestModule clínicos a holísticos sin perder historial.

Se ejecuta en DRY-RUN por defecto. Para aplicar cambios reales se requiere
`--apply`, lo cual ejecutará cada actualización dentro de una transacción.

Uso:
  python tools/migrate_clinical_to_holistic.py          # solo informa
  python tools/migrate_clinical_to_holistic.py --apply  # actualiza la BD
"""

from __future__ import annotations

import argparse
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional

PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_PATH = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_PATH))
sys.path.insert(0, str(PROJECT_ROOT))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

import django  # noqa: E402

django.setup()  # noqa: E402

from django.db import transaction  # noqa: E402
from api.test_models import TestModule  # noqa: E402

TARGET_CODES = [
    "audit",
    "asrs",
    "aq50",
    "eat26",
    "ybocs",
    "mcmi4",
    "dudit",
]

EXECUTION_MODE_OVERIDES = {
    "audit": "therapist_guided",
    "mcmi4": "therapist_guided",
}

DEFAULT_EXECUTION_MODE = "patient_self"


@dataclass
class PlannedChange:
    code: str
    current_is_clinical: Optional[bool]
    current_test_type: str
    current_execution_mode: Optional[str]
    desired_is_clinical: bool
    desired_test_type: str
    desired_execution_mode: str


def determine_execution_mode(code: str) -> str:
    return EXECUTION_MODE_OVERIDES.get(code, DEFAULT_EXECUTION_MODE)


def gather_changes() -> tuple[List[PlannedChange], List[str]]:
    changes: List[PlannedChange] = []
    reports: List[str] = []

    for code in TARGET_CODES:
        try:
            test_module = TestModule.objects.get(code=code)
        except TestModule.DoesNotExist:
            raise SystemExit(f"[ERROR] TestModule with code '{code}' not found.")

        if not hasattr(test_module, "is_clinical"):
            raise SystemExit(f"[ERROR] TestModule model lacks `is_clinical`. Abort.")

        current_is_clinical = getattr(test_module, "is_clinical", None)
        if current_is_clinical is None:
            raise SystemExit(f"[ERROR] TestModule '{code}' has no is_clinical value.")

        desired_mode = determine_execution_mode(code)

        if current_is_clinical is False:
            reports.append(f"[INFO] {code} already holistic (is_clinical=False)")
            continue

        if (
            test_module.test_type == "holistic"
            and current_is_clinical is False
            and getattr(test_module, "execution_mode", None) == desired_mode
        ):
            reports.append(f"[INFO] {code} already in target state")
            continue

        changes.append(
            PlannedChange(
                code=code,
                current_is_clinical=current_is_clinical,
                current_test_type=test_module.test_type,
                current_execution_mode=getattr(test_module, "execution_mode", None),
                desired_is_clinical=False,
                desired_test_type="holistic",
                desired_execution_mode=desired_mode,
            )
        )

    return changes, reports


def apply_changes(changes: Iterable[PlannedChange]) -> None:
    with transaction.atomic():
        for change in changes:
            TestModule.objects.filter(code=change.code).update(
                is_clinical=change.desired_is_clinical,
                test_type=change.desired_test_type,
                execution_mode=change.desired_execution_mode,
            )
            print(f"[APPLY] Updated {change.code}")
        print("[APPLY] Transaction committed")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Reclasifica tests clínicos a holísticos (DRY-RUN por defecto)"
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Aplica los cambios dentro de una transacción",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    dry_run = not args.apply

    changes, reports = gather_changes()

    prefix = "[DRY-RUN]" if dry_run else "[APPLY]"
    print(f"{prefix} Found {len(changes)} TestModule(s) to adjust.")

    for change in changes:
        print(
            f"{prefix} {change.code}: is_clinical {change.current_is_clinical} → {change.desired_is_clinical}, "
            f"test_type {change.current_test_type} → {change.desired_test_type}, "
            f"execution_mode {change.current_execution_mode} → {change.desired_execution_mode}"
        )

    for report in reports:
        print(f"{prefix} {report}")

    if dry_run:
        print("[DRY-RUN] No changes applied")
        return

    if not changes:
        print("[APPLY] No changes to persist")
        return

    apply_changes(changes)


if __name__ == "__main__":
    main()
