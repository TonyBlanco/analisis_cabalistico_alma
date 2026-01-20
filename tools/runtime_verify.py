#!/usr/bin/env python
"""Runtime verification helper (read-only).

Prints:
- DB connection settings
- Table columns for api_testmodule (tries information_schema, falls back to sqlite PRAGMA)
- ORM query: TestModule.objects.filter(is_assignable=True)
- API response: GET /api/tests/ via Django test Client

No changes are made to the database.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

# Setup Django environment (match other tools)
PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_PATH = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_PATH))
sys.path.insert(0, str(PROJECT_ROOT))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

import django

django.setup()

from django.conf import settings
from django.db import connection


def print_db_settings():
    default = settings.DATABASES.get("default")
    print("DB settings:")
    print(json.dumps({
        "ENGINE": default.get("ENGINE"),
        "NAME": str(default.get("NAME")),
        "HOST": default.get("HOST"),
        "PORT": default.get("PORT"),
    }, indent=2))


def inspect_columns():
    cur = connection.cursor()
    print("DB vendor:", connection.vendor)
    # Try information_schema (Postgres/MySQL); if not available, use sqlite PRAGMA
    try:
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'api_testmodule';")
        cols = [r[0] for r in cur.fetchall()]
        print("information_schema columns:", cols)
        return cols
    except Exception as e:
        print("information_schema query error:", repr(e))

    try:
        cur.execute("PRAGMA table_info('api_testmodule')")
        rows = cur.fetchall()
        cols = [r[1] for r in rows]
        print("pragma table_info columns:", cols)
        return cols
    except Exception as e2:
        print("pragma query error:", repr(e2))
        return []


def orm_is_assignable():
    try:
        from api.test_models import TestModule
        codes = list(TestModule.objects.filter(is_assignable=True).values_list("code", flat=True))
        print("ORM is_assignable=True codes:", codes)
        return codes
    except Exception as e:
        print("ORM query error:", repr(e))
        return []


def api_fetch_tests():
    try:
        from django.test import Client
        c = Client()
        res = c.get('/api/tests/')
        print("API /api/tests/ status:", res.status_code)
        try:
            data = res.json()
            codes = [t.get('code') for t in data if isinstance(t, dict) and 'code' in t]
            print(f"API codes (count {len(codes)}):", codes[:200])
            return codes
        except Exception as e:
            print("Failed to parse API response JSON:", repr(e))
            return []
    except Exception as e:
        print("API request error:", repr(e))
        return []


def main():
    print_db_settings()
    cols = inspect_columns()
    orm_codes = orm_is_assignable()
    api_codes = api_fetch_tests()

    # Summary
    print("\n=== SUMMARY ===")
    print("DB name:", settings.DATABASES.get('default').get('NAME'))
    print("is_assignable column present:", 'is_assignable' in cols)
    # Migration check left to external showmigrations command
    print("ORM filter returned N codes:", len(orm_codes))
    print("API returned N codes:", len(api_codes))


if __name__ == '__main__':
    main()
