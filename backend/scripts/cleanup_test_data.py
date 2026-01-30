"""Utilities to clean TestResult and Assignment entries for a patient (dev only).

Run via:
  python backend/manage.py shell -c "from backend.scripts.cleanup_test_data import cleanup; cleanup(patient_user_id=18, dry_run=False)"

The script is defensive: it refuses to run destructive deletes unless Django `DEBUG` is True
or the environment variable `FORCE_CLEANUP` is set to "1".
"""
import os
import sys
import argparse
from typing import Optional

try:
    # When executed via `manage.py shell -c` Django is already configured.
    from django.conf import settings
except Exception:
    # Fall back: try to configure Django if necessary (rare when using manage.py)
    import django
    django.setup()
    from django.conf import settings


def cleanup(patient_user_id: Optional[int] = None, dry_run: bool = True):
    """Delete TestResult and Assignment records related to a patient user.

    - `patient_user_id`: id of the User that corresponds to the consultante (patient's user record).
    - `dry_run`: if True, just prints counts and does not delete.
    """
    if not patient_user_id:
        print("Must provide patient_user_id")
        return

    # Safety: avoid running destructive ops in production accidentally
    if not getattr(settings, 'DEBUG', False) and os.environ.get('FORCE_CLEANUP') != '1':
        print("Refusing to run destructive cleanup: DEBUG is False and FORCE_CLEANUP!=1")
        return

    from django.contrib.auth import get_user_model
    User = get_user_model()
    from api.models import Patient
    # TestResult and Assignment live in api.test_models
    from api.test_models import TestResult, Assignment

    try:
        user = User.objects.get(id=patient_user_id)
    except User.DoesNotExist:
        print(f"No user with id={patient_user_id}")
        return

    patients = list(Patient.objects.filter(user=user))
    print(f"Found {len(patients)} Patient record(s) associated to user id={patient_user_id}")

    # TestResults explicitly linked to patient records
    tr_linked_qs = TestResult.objects.filter(patient__in=patients)
    tr_linked_count = tr_linked_qs.count()

    # TestResults created by the user but missing patient association (self-executions with patient=None)
    tr_orphan_qs = TestResult.objects.filter(user=user, patient__isnull=True)
    tr_orphan_count = tr_orphan_qs.count()

    # Assignments tied to the clinical_profile or subject_user
    assign_qs = Assignment.objects.filter(clinical_profile__in=patients) | Assignment.objects.filter(subject_user=user)
    assign_count = assign_qs.count()

    print(f"TestResults linked to Patient objects: {tr_linked_count}")
    print(f"TestResults by user with no patient link: {tr_orphan_count}")
    print(f"Assignments related (clinical_profile or subject_user): {assign_count}")

    if dry_run:
        print("Dry-run mode: no records will be deleted. Re-run with dry_run=False to delete.")
        return

    # Perform deletions
    deleted_tr_orphan = tr_orphan_qs.delete()
    deleted_tr_linked = tr_linked_qs.delete()
    deleted_assign = assign_qs.delete()

    print("Deletion summary:")
    print("  Orphan TestResults deleted:", deleted_tr_orphan)
    print("  Linked TestResults deleted:", deleted_tr_linked)
    print("  Assignments deleted:", deleted_assign)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Cleanup test data for a patient (dev only)')
    parser.add_argument('--patient-user-id', type=int, required=True, help='User id of the consultante')
    parser.add_argument('--dry-run', action='store_true', default=False, help='Only print what would be deleted')
    args = parser.parse_args()
    cleanup(patient_user_id=args.patient_user_id, dry_run=args.dry_run)
