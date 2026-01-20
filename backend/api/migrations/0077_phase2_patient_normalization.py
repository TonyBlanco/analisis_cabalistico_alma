# Generated migration - PHASE 2: Normalize Patient as ClinicalProfile
# Makes api_patient.user_id NOT NULL (after validation)

from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    """
    PHASE 2: Patient Normalization
    
    Enforces that api_patient MUST have a linked auth_user.
    Patient stops being identity and becomes pure clinical profile.
    
    PREREQUISITES:
    - Phase 1 validation passed
    - All orphaned patients resolved manually
    
    CHANGES:
    - api_patient.user_id: nullable → NOT NULL
    - Add unique constraint (one patient per user max per therapist)
    
    ROLLBACK:
    - Remove NOT NULL constraint
    - Remove unique constraint
    """

    dependencies = [
        ('api', '0076_phase1_identity_declaration'),
    ]

    def validate_no_orphans(apps, schema_editor):
        """Final check before making user_id required"""
        Patient = apps.get_model('api', 'Patient')
        
        orphaned = Patient.objects.filter(user__isnull=True)
        if orphaned.exists():
            orphan_list = list(orphaned.values_list('id', 'full_name'))
            raise ValueError(
                f"Cannot proceed: {len(orphan_list)} patients without user_id\n"
                f"Orphans: {orphan_list}\n"
                "Resolve manually before migrating"
            )
        print("[OK] Pre-check: No orphaned patients")

    operations = [
        # Validation
        migrations.RunPython(
            validate_no_orphans,
            migrations.RunPython.noop
        ),
        
        # Make user_id required
        migrations.AlterField(
            model_name='patient',
            name='user',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='patient_profile',
                to='auth.user',
                help_text='Usuario asociado (OBLIGATORIO - Patient es perfil clínico)',
                null=False,  # ◄─ KEY CHANGE
                blank=False
            ),
        ),
        
        # Add unique constraint (one patient record per user)
        migrations.AddConstraint(
            model_name='patient',
            constraint=models.UniqueConstraint(
                fields=['user'],
                name='unique_patient_per_user',
                violation_error_message='Each user can only have one patient profile'
            ),
        ),
    ]
