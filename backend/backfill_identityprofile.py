# Backfill script - PHASE 3b: Migrate birth data from Patient to IdentityProfile
# Run AFTER Phase 3 migration

"""
PHASE 3b: Data Migration Script

Migrates symbolic/astrological data from api_patient to api_identityprofile.

SAFETY:
- Read-only on api_patient (does not delete source data)
- Idempotent (can run multiple times)
- Skips if IdentityProfile already exists for user
- Reports conflicts and skips

RUN:
    python manage.py shell < backfill_identityprofile.py

ROLLBACK:
    DELETE FROM api_identityprofile;
    (source data remains in api_patient)
"""

import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db.models import Q
from api.models import Patient

User = get_user_model()

# Import IdentityProfile after model is created
try:
    from api.models import IdentityProfile
except ImportError:
    print("❌ IdentityProfile model not found - run Phase 3 migration first")
    exit(1)

print("=" * 60)
print("PHASE 3b: Backfill IdentityProfile from Patient birth data")
print("=" * 60)

# Get all patients with ANY birth data (more robust than just birth_date)
patients = Patient.objects.filter(
    user__isnull=False
).filter(
    Q(birth_date__isnull=False) |
    Q(birth_time__isnull=False) |
    Q(birth_latitude__isnull=False) |
    Q(birth_longitude__isnull=False)
).select_related('user')

created_count = 0
skipped_count = 0
error_count = 0

for patient in patients:
    user = patient.user
    
    # Check if IdentityProfile already exists
    if IdentityProfile.objects.filter(user=user).exists():
        print(f"⏭️  Skip: IdentityProfile already exists for {user.username}")
        skipped_count += 1
        continue
    
    try:
        # Create IdentityProfile from Patient data
        identity = IdentityProfile.objects.create(
            user=user,
            birth_date=patient.birth_date,
            birth_time=patient.birth_time,
            birth_city=patient.birth_city or '',
            birth_country=patient.birth_country or '',
            birth_latitude=patient.birth_latitude,
            birth_longitude=patient.birth_longitude,
            birth_timezone=patient.birth_timezone or '',
            hebrew_name=patient.hebrew_name or ''
        )
        
        print(f"✅ Created IdentityProfile for {user.username} (from patient {patient.id})")
        created_count += 1
        
    except Exception as e:
        print(f"❌ Error creating IdentityProfile for {user.username}: {e}")
        error_count += 1

print("\n" + "=" * 60)
print("BACKFILL SUMMARY")
print("=" * 60)
print(f"Created: {created_count}")
print(f"Skipped: {skipped_count}")
print(f"Errors: {error_count}")
print(f"Total processed: {patients.count()}")

if error_count > 0:
    print("\n⚠️  Some records failed - review errors above")
else:
    print("\n✅ Backfill completed successfully")

print("\nNOTE: Source data remains in api_patient (not deleted)")
print("Patient.birth_* fields will be marked deprecated in Phase 5")
