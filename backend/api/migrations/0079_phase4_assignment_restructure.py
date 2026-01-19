# Generated migration - PHASE 4: Restructure Assignment
# Changes Assignment to use auth_user as subject instead of Patient

from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    """
    PHASE 4: Assignment Restructuring
    
    Changes Assignment to be identity-based (auth_user) instead of clinical-based (Patient).
    
    CONCEPTUAL CHANGE:
    - OLD: Assignment belongs to Patient (clinical context required)
    - NEW: Assignment belongs to User (universal identity)
    
    FIELDS:
    - subject_user_id: The person taking the test (REQUIRED)
    - clinical_profile_id: Optional link to clinical context
    - patient_id: DEPRECATED (backfilled to subject_user_id)
    
    COMPATIBILITY:
    - Existing assignments preserved
    - patient_id nullable for backward compatibility
    - New assignments use subject_user_id
    
    ROLLBACK:
    - Remove subject_user_id
    - Remove clinical_profile_id
    - Restore patient_id as required
    """

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('api', '0078_phase3_create_identityprofile'),
    ]

    operations = [
        # Add subject_user_id (the universal subject)
        migrations.AddField(
            model_name='assignment',
            name='subject_user',
            field=models.ForeignKey(
                null=True,  # Temporary - will be NOT NULL after backfill
                blank=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='assignments_as_subject',
                to='auth.user',
                help_text='Usuario sujeto del assignment (identidad universal)'
            ),
        ),
        
        # Add clinical_profile_id (optional clinical context)
        migrations.AddField(
            model_name='assignment',
            name='clinical_profile',
            field=models.ForeignKey(
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='assignments_as_clinical_context',
                to='api.patient',
                help_text='Perfil clínico asociado (opcional)'
            ),
        ),
        
        # Make patient_id nullable (preparing for deprecation)
        migrations.AlterField(
            model_name='assignment',
            name='patient',
            field=models.ForeignKey(
                null=True,  # Now optional
                blank=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='assignments',
                to='api.patient',
                help_text='DEPRECATED: Use subject_user instead'
            ),
        ),
        
        # Add index for subject_user lookups
        migrations.AddIndex(
            model_name='assignment',
            index=models.Index(fields=['subject_user', '-created_at'], name='assignment_subject_idx'),
        ),
    ]
