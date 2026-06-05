# Generated migration - PHASE 5: Integrity Constraints
# Adds database-level constraints to enforce architectural rules

from django.db import migrations, models


def _add_assignment_subject_trigger(apps, schema_editor):
    vendor = schema_editor.connection.vendor
    if vendor == "sqlite":
        schema_editor.execute(
            """
            CREATE TRIGGER prevent_assignment_without_subject
            BEFORE INSERT ON api_assignment
            FOR EACH ROW
            BEGIN
                SELECT RAISE(ABORT, 'New assignments must have subject_user_id')
                WHERE NEW.subject_user_id IS NULL;
            END;
            """
        )
    elif vendor == "postgresql":
        schema_editor.execute(
            """
            CREATE OR REPLACE FUNCTION prevent_assignment_without_subject()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.subject_user_id IS NULL THEN
                    RAISE EXCEPTION 'New assignments must have subject_user_id';
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
            """
        )
        schema_editor.execute(
            """
            DROP TRIGGER IF EXISTS prevent_assignment_without_subject ON api_assignment;
            CREATE TRIGGER prevent_assignment_without_subject
            BEFORE INSERT ON api_assignment
            FOR EACH ROW EXECUTE FUNCTION prevent_assignment_without_subject();
            """
        )


def _drop_assignment_subject_trigger(apps, schema_editor):
    vendor = schema_editor.connection.vendor
    if vendor == "sqlite":
        schema_editor.execute(
            "DROP TRIGGER IF EXISTS prevent_assignment_without_subject;"
        )
    elif vendor == "postgresql":
        schema_editor.execute(
            "DROP TRIGGER IF EXISTS prevent_assignment_without_subject ON api_assignment;"
        )
        schema_editor.execute(
            "DROP FUNCTION IF EXISTS prevent_assignment_without_subject();"
        )


class Migration(migrations.Migration):
    """
    PHASE 5: Database Integrity Constraints
    
    Adds constraints to prevent architectural violations at DB level.
    
    CONSTRAINTS:
    1. Patient MUST have user_id (already enforced in Phase 2)
    2. Assignment MUST have subject_user_id (already enforced in Phase 4c)
    3. IdentityProfile MUST be unique per user (1-1 relationship)
    4. Deprecated fields marked in metadata (no code enforcement yet)
    
    DEPRECATION MARKERS:
    - Patient.birth_* fields → use IdentityProfile instead
    - Assignment.patient_id → use subject_user_id + clinical_profile_id
    
    NO DATA DELETION:
    - Deprecated fields remain in schema
    - Code can still read them (but should not write)
    - Future phase will add migration to drop columns
    
    ROLLBACK:
    - Remove constraints
    - Remove deprecation markers
    """

    dependencies = [
        ('api', '0080_phase4c_assignment_subject_required'),
    ]

    operations = [
        # Mark Patient.birth_date as deprecated (metadata only)
        migrations.AlterField(
            model_name='patient',
            name='birth_date',
            field=models.DateField(
                help_text='DEPRECATED: Use user.identity_profile.birth_date instead'
            ),
        ),
        
        migrations.AlterField(
            model_name='patient',
            name='birth_time',
            field=models.TimeField(
                null=True,
                blank=True,
                help_text='DEPRECATED: Use user.identity_profile.birth_time instead'
            ),
        ),
        
        migrations.AlterField(
            model_name='patient',
            name='birth_latitude',
            field=models.DecimalField(
                max_digits=9,
                decimal_places=6,
                null=True,
                blank=True,
                help_text='DEPRECATED: Use user.identity_profile.birth_latitude instead'
            ),
        ),
        
        migrations.AlterField(
            model_name='patient',
            name='birth_longitude',
            field=models.DecimalField(
                max_digits=9,
                decimal_places=6,
                null=True,
                blank=True,
                help_text='DEPRECATED: Use user.identity_profile.birth_longitude instead'
            ),
        ),
        
        migrations.AlterField(
            model_name='patient',
            name='birth_timezone',
            field=models.CharField(
                max_length=100,
                blank=True,
                help_text='DEPRECATED: Use user.identity_profile.birth_timezone instead'
            ),
        ),
        
        migrations.AlterField(
            model_name='patient',
            name='hebrew_name',
            field=models.CharField(
                max_length=255,
                blank=True,
                help_text='DEPRECATED: Use user.identity_profile.hebrew_name instead'
            ),
        ),
        
        migrations.RunPython(
            code=_add_assignment_subject_trigger,
            reverse_code=_drop_assignment_subject_trigger,
        ),
    ]
