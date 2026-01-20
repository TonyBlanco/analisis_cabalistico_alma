# Backfill script - PHASE 4b: Populate Assignment.subject_user_id
# Run AFTER Phase 4 migration

"""
PHASE 4b: Assignment Subject Backfill

Populates subject_user_id based on existing assignment structure.

LOGIC:
1. subject_user_id = assigned_to_user_id (the executor)
2. clinical_profile_id = patient_id (preserve clinical context)
3. patient_id remains for compatibility (deprecated)

SAFETY:
- Idempotent (can run multiple times)
- Does not modify existing correct data
- Reports conflicts

RUN:
    python manage.py shell < backfill_assignment_subject.py

VERIFICATION:
    SELECT COUNT(*) FROM api_assignment WHERE subject_user_id IS NULL;
    -- Should be 0 after backfill
"""

import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.test_models import Assignment

print("=" * 60)
print("PHASE 4b: Backfill Assignment.subject_user_id")
print("=" * 60)

# Get assignments without subject_user_id
assignments = Assignment.objects.filter(subject_user__isnull=True)
total = assignments.count()

print(f"Assignments to backfill: {total}")

if total == 0:
    print("✅ All assignments already have subject_user_id")
    exit(0)

updated_count = 0
error_count = 0

for assignment in assignments:
    try:
        # LOGIC CORRECTA (SEMÁNTICA DE IDENTIDAD):
        # 1) Si hay patient con user → sujeto = patient.user (identidad canónica del análisis)
        # 2) Si no → sujeto = assigned_to_user (fallback para tests no clínicos)
        
        if assignment.patient and assignment.patient.user:
            # Caso clínico: el sujeto es el paciente (no el ejecutor)
            assignment.subject_user = assignment.patient.user
            assignment.clinical_profile = assignment.patient
            context = "clinical"
        else:
            # Caso no clínico: el sujeto es el ejecutor
            assignment.subject_user = assignment.assigned_to_user
            assignment.clinical_profile = None
            context = "non-clinical"
        
        assignment.save(update_fields=['subject_user', 'clinical_profile'])
        
        print(f"✅ Assignment {assignment.id} ({context}): subject_user={assignment.subject_user.username}")
        updated_count += 1
        
    except Exception as e:
        print(f"❌ Error updating assignment {assignment.id}: {e}")
        error_count += 1

print("\n" + "=" * 60)
print("BACKFILL SUMMARY")
print("=" * 60)
print(f"Updated: {updated_count}")
print(f"Errors: {error_count}")
print(f"Total: {total}")

if error_count > 0:
    print("\n⚠️  Some assignments failed - review errors above")
else:
    print("\n✅ Backfill completed successfully")

# Validation
remaining = Assignment.objects.filter(subject_user__isnull=True).count()
if remaining > 0:
    print(f"\n⚠️  WARNING: {remaining} assignments still without subject_user_id")
    print("   Manual intervention required")
else:
    print("\n✅ VALIDATION: All assignments have subject_user_id")
    print("   Ready for Phase 4c (make subject_user_id NOT NULL)")
