#!/usr/bin/env python3
"""
Script: cleanup_duplicate_assigned_tests.py

Usage:
  python backend/scripts/cleanup_duplicate_assigned_tests.py --patient-id 1 [--apply]

This script looks for multiple TestResult rows for the same patient and test_module
and archives all but the most recent one. It defaults to a dry-run and prints a report.

Safe by design: it sets `is_archived=True` on duplicates (reversible) instead of deleting.
"""
import os
import sys
import argparse

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Archive duplicate TestResult entries for a patient')
    parser.add_argument('--patient-id', type=int, required=True, help='Patient id to clean')
    parser.add_argument('--apply', action='store_true', help='Apply changes (archive duplicates). Default: dry-run')
    args = parser.parse_args()

    # Setup Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    import django
    django.setup()

    from api.test_models import TestResult
    from django.db import transaction

    patient_id = args.patient_id
    apply_changes = args.apply

    print(f"Scanning TestResult entries for patient_id={patient_id} (apply={apply_changes})")

    # Group test results by test_module (only those with a test_module linked)
    qs = TestResult.objects.filter(patient_id=patient_id, test_module__isnull=False).order_by('test_module_id', '-created_at')

    # Build map: test_module_id -> list of TestResult ids (ordered by newest first)
    from collections import defaultdict
    groups = defaultdict(list)
    for tr in qs:
        groups[tr.test_module_id].append(tr)

    total_groups = len(groups)
    total_duplicates = 0
    to_archive = []

    for tm_id, items in groups.items():
        if len(items) <= 1:
            continue
        # keep the first (most recent because ordered -created_at), archive the rest
        keep = items[0]
        duplicates = items[1:]
        total_duplicates += len(duplicates)
        to_archive.extend(duplicates)
        print(f"Found {len(duplicates)} duplicate(s) for test_module_id={tm_id}. Keeping id={keep.id}, archiving: {[d.id for d in duplicates]}")

    print(f"Groups scanned: {total_groups}. Duplicate TestResult rows found: {total_duplicates}")

    if total_duplicates == 0:
        print('Nothing to do.')
        sys.exit(0)

    if not apply_changes:
        print('Dry-run mode. No changes applied. Re-run with --apply to archive duplicates.')
        sys.exit(0)

    # Apply archival
    archived_count = 0
    with transaction.atomic():
        for tr in to_archive:
            if not tr.is_archived:
                tr.is_archived = True
                tr.save(update_fields=['is_archived', 'updated_at'])
                archived_count += 1

    print(f'Archived {archived_count} duplicate TestResult rows. Done.')
