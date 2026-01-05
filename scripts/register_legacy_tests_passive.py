"""Register inactive TestModule for selected legacy tests (A1).

Reads exclusively from `/tests/<code>/meta.json` and upserts `TestModule` rows.
This script does NOT activate tests or enable execution.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

TARGET_CODES = ["phq-9", "gad-7", "bai"]


def _repo_root() -> Path:
    if "__file__" in globals():
        return Path(__file__).resolve().parents[1]
    return Path.cwd()


REPO_ROOT = _repo_root()
TESTS_ROOT = REPO_ROOT / "tests"

BACKEND_ROOT = REPO_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

import django  # noqa: E402

django.setup()

from api.test_models import TestModule  # noqa: E402


def _concrete_field_names(model) -> set[str]:
    names: set[str] = set()
    for field in model._meta.get_fields():
        if getattr(field, "concrete", False) and getattr(field, "attname", None):
            names.add(field.name)
    return names


def main() -> None:
    available_fields = _concrete_field_names(TestModule)

    upserted = 0
    for code in TARGET_CODES:
        meta_path = TESTS_ROOT / code / "meta.json"
        if not meta_path.exists():
            raise RuntimeError(f"Missing meta.json for {code}: {meta_path}")

        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        if not isinstance(meta, dict):
            raise RuntimeError(f"Invalid meta.json for {code}: expected object")

        defaults: dict = {}
        if "name" in available_fields:
            defaults["name"] = meta.get("name") or code.upper()

        # Keep the module inactive (do not show in catalog, not executable).
        if "is_active" in available_fields:
            defaults["is_active"] = False
        elif "active" in available_fields:
            defaults["active"] = False

        # Optional fields (may not exist depending on model/schema).
        if "execution_mode" in available_fields:
            defaults["execution_mode"] = "legacy_migrated"
        if "legacy" in available_fields:
            defaults["legacy"] = True

        # Ensure required fields exist on older schemas.
        if "description" in available_fields:
            defaults["description"] = meta.get("notes") or "Legacy test migrado. Inactivo."
        if "test_type" in available_fields:
            defaults["test_type"] = "diagnostic"
        if "required_access_level" in available_fields:
            defaults["required_access_level"] = "personal"
        if "available_for_personal" in available_fields:
            defaults["available_for_personal"] = True
        if "available_for_therapists" in available_fields:
            defaults["available_for_therapists"] = True

        _, created = TestModule.objects.update_or_create(
            code=meta.get("code") or code,
            defaults=defaults,
        )
        upserted += 1
        print(f'{"CREATED" if created else "UPDATED"} TestModule code={code} inactive')

    print(f"Done. Upserted {upserted} TestModule rows.")


if __name__ == "__main__":
    main()
