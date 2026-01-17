# Generated migration - PHASE 1: Identity Declaration
# NO CODE CHANGES - Only documentation and validation

from django.db import migrations

class Migration(migrations.Migration):
    """
    PHASE 1: Identity Declaration
    
    This migration establishes auth_user as the canonical identity root.
    No schema changes - only sets architectural foundation.
    
    PRINCIPLE:
    - auth_user = Identity (universal, non-clinical)
    - api_patient = ClinicalProfile (dependent on Identity)
    - All relationships MUST trace back to auth_user
    
    VALIDATION:
    - Checks that no orphaned patients exist (patient.user_id IS NULL)
    - Reports but does not fix - manual resolution required
    """

    dependencies = [
        ('api', '0070_rename_api_assign_patient_test_created_idx_api_assignm_patient_5cb12b_idx_and_more'),
    ]

    def validate_identity_integrity(apps, schema_editor):
        """Validate that all entities trace back to auth_user"""
        Patient = apps.get_model('api', 'Patient')
        
        orphaned = Patient.objects.filter(user__isnull=True).count()
        
        if orphaned > 0:
            print(f"[WARNING] {orphaned} Patient records without user_id")
            print("   These must be resolved before Phase 2")
            print("   Run: python manage.py shell")
            print("   >>> from api.models import Patient")
            print("   >>> Patient.objects.filter(user__isnull=True)")
            # Do NOT raise - just report
        else:
            print("[OK] Identity integrity: All Patients have user_id")

    def reverse_validation(apps, schema_editor):
        """No-op: validation is read-only"""
        pass

    operations = [
        migrations.RunPython(
            validate_identity_integrity,
            reverse_validation
        ),
    ]
