"""Generate canonical test catalog status artifacts (Stage 1).

Outputs:
- tests_catalog_status.json
- tests_catalog_status.md

This is an audit-only tool: it does not modify test schemas, backend logic, or DB state.
"""

from __future__ import annotations

import json
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]
TESTS_ROOT = REPO_ROOT / "tests"

OUTPUT_JSON = REPO_ROOT / "tests_catalog_status.json"
OUTPUT_MD = REPO_ROOT / "tests_catalog_status.md"


OPTION_REQUIRED_TYPES = {
    "likert",
    "radio",
    "select",
    "single_choice",
    "multiple_choice",
}


@dataclass(frozen=True)
class SchemaValidation:
    valid: bool
    reason: str


def _load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def validate_schema(schema_path: Path) -> SchemaValidation:
    try:
        data = _load_json(schema_path)
    except Exception:
        return SchemaValidation(False, "invalid_json")

    if not isinstance(data, dict):
        return SchemaValidation(False, "not_object")

    questions = data.get("questions")
    if questions is None:
        return SchemaValidation(False, "missing_questions")
    if not isinstance(questions, list):
        return SchemaValidation(False, "questions_not_array")
    if len(questions) == 0:
        return SchemaValidation(False, "empty_questions")

    for index, question in enumerate(questions):
        if not isinstance(question, dict):
            return SchemaValidation(False, f"question_{index}_not_object")
        if "id" not in question:
            return SchemaValidation(False, f"question_{index}_missing_id")
        if "type" not in question:
            return SchemaValidation(False, f"question_{index}_missing_type")
        if "label" not in question and "text" not in question:
            return SchemaValidation(False, f"question_{index}_missing_label")

        question_type = str(question.get("type") or "").strip().lower()
        if question_type in OPTION_REQUIRED_TYPES:
            options = question.get("options")
            if not isinstance(options, list) or len(options) == 0:
                return SchemaValidation(False, f"question_{index}_invalid_options")

    return SchemaValidation(True, "ok")


def _status_from_files(
    code: str,
    has_meta: bool,
    has_schema: bool,
    schema_validation: SchemaValidation | None,
    has_scoring: bool,
) -> tuple[str, str]:
    if code == "adhd":
        return "blocked_schema", "Schema requires manual redesign. Explicitly blocked."

    if not has_meta:
        return "blocked_schema", "Missing meta.json"

    if not has_schema:
        return "inactive", "Missing schema.json"

    if schema_validation is None:
        return "blocked_schema", "Schema not validated"

    if schema_validation.reason in {"missing_questions", "empty_questions"}:
        return "inactive", f"Schema incomplete ({schema_validation.reason})"

    if not schema_validation.valid:
        return "blocked_schema", f"Schema not renderable ({schema_validation.reason})"

    if not has_scoring:
        return "inactive", "Missing scoring.py"

    return "active", "meta + renderable schema + scoring placeholder present"


def _try_load_db_testmodule_status(codes: list[str]) -> dict[str, dict[str, Any]]:
    backend_root = REPO_ROOT / "backend"
    if not backend_root.exists():
        return {}

    sys.path.insert(0, str(backend_root))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

    try:
        import django  # type: ignore

        django.setup()
        from api.test_models import TestModule  # type: ignore
    except Exception:
        return {}

    existing = {
        row["code"]: row
        for row in TestModule.objects.filter(code__in=codes).values("code", "is_active")
    }
    out: dict[str, dict[str, Any]] = {}
    for code in codes:
        row = existing.get(code)
        out[code] = {
            "testmodule_exists": row is not None,
            "testmodule_is_active": (row or {}).get("is_active"),
        }
    return out


def main() -> None:
    test_dirs = [
        p
        for p in sorted(TESTS_ROOT.iterdir(), key=lambda x: x.name.lower())
        if p.is_dir() and p.name not in {"fixtures", "schema"}
    ]

    codes = [p.name for p in test_dirs]
    db_status = _try_load_db_testmodule_status(codes)

    catalog: list[dict[str, Any]] = []
    md_rows: list[tuple[str, str, str]] = []

    for test_dir in test_dirs:
        code = test_dir.name
        meta_path = test_dir / "meta.json"
        schema_path = test_dir / "schema.json"
        scoring_path = test_dir / "scoring.py"
        readme_path = test_dir / "README.md"

        has_meta = meta_path.exists()
        has_schema = schema_path.exists()
        has_scoring = scoring_path.exists()
        has_readme = readme_path.exists()

        schema_validation: SchemaValidation | None = None
        if has_schema:
            schema_validation = validate_schema(schema_path)

        status, status_notes = _status_from_files(
            code=code,
            has_meta=has_meta,
            has_schema=has_schema,
            schema_validation=schema_validation,
            has_scoring=has_scoring,
        )

        entry: dict[str, Any] = {
            "code": code,
            "has_meta": has_meta,
            "has_schema": has_schema,
            "schema_valid": bool(schema_validation.valid) if schema_validation else False,
            "has_scoring": has_scoring,
            "has_readme": has_readme,
            "status": status,
            "notes": status_notes,
        }

        if schema_validation:
            entry["schema_reason"] = schema_validation.reason

        db_entry = db_status.get(code)
        if db_entry:
            entry.update(db_entry)

        catalog.append(entry)
        md_rows.append((code, status, status_notes))

    OUTPUT_JSON.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    md_lines = [
        "# Tests Catalog Status",
        "",
        "| Code | Status | Motivo |",
        "|---|---|---|",
    ]
    for code, status, reason in md_rows:
        md_lines.append(f"| {code} | {status} | {reason} |")
    md_lines.append("")

    OUTPUT_MD.write_text("\n".join(md_lines), encoding="utf-8")

    print(f"Wrote {OUTPUT_JSON}")
    print(f"Wrote {OUTPUT_MD}")


if __name__ == "__main__":
    main()

