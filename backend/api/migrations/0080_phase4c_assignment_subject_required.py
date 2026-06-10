# Generated migration - PHASE 4c: Make subject_user_id required
# Run AFTER Phase 4b backfill completes successfully

from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    """
    PHASE 4c: Enforce Assignment.subject_user_id requirement
    
    Makes subject_user_id NOT NULL after successful backfill.
    
    PREREQUISITES:
    - Phase 4b backfill completed
    - All assignments have subject_user_id populated
    
    VALIDATION:
    - Checks no NULL values exist
    - Fails fast if data incomplete
    
    ROLLBACK:
    - Revert subject_user_id to nullable
    """

    dependencies = [
        ('api', '0079_phase4_assignment_restructure'),
    ]

    def validate_subject_user_populated(apps, schema_editor):
        """Ensure all assignments have subject_user_id before making it required"""
        Assignment = apps.get_model('api', 'Assignment')
        
        missing = Assignment.objects.filter(subject_user__isnull=True).count()
        
        if missing > 0:
            raise ValueError(
                f"Cannot proceed: {missing} assignments without subject_user_id\n"
                "Run backfill_assignment_subject.py first"
            )
        print("[OK] Pre-check: All assignments have subject_user_id")

    operations = [
        # Validation
        migrations.RunPython(
            validate_subject_user_populated,
            migrations.RunPython.noop
        ),
        
        # Make subject_user required
        migrations.AlterField(
            model_name='assignment',
            name='subject_user',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='assignments_as_subject',
                to='auth.user',
                help_text='Usuario sujeto del assignment (identidad universal)',
                null=False,  # ◄─ NOW REQUIRED
                blank=False
            ),
        ),
        
        # Add constraint to prevent NULL in database
        migrations.AddConstraint(
            model_name='assignment',
            constraint=models.CheckConstraint(
                condition=models.Q(subject_user__isnull=False),
                name='assignment_subject_user_required',
                violation_error_message='subject_user_id is required'
            ),
        ),
    ]
