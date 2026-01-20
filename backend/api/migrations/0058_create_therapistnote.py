# Generated migration for TherapistNote model
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0057_update_anxiety_state_trait_wellness'),
    ]

    operations = [
        migrations.RunSQL(
            sql=(
                """
                CREATE TABLE IF NOT EXISTS api_patientmessage (
                    id integer PRIMARY KEY AUTOINCREMENT,
                    therapist_id integer NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
                    patient_id integer NOT NULL REFERENCES api_patient(id) ON DELETE CASCADE,
                    content varchar(1000) NOT NULL,
                    is_archived bool NOT NULL DEFAULT 0,
                    archived_at datetime NULL,
                    created_at datetime NOT NULL
                );
                CREATE INDEX IF NOT EXISTS api_patientmessage_patient_created_at_idx ON api_patientmessage(patient_id, created_at);
                CREATE INDEX IF NOT EXISTS api_patientmessage_therapist_patient_created_at_idx ON api_patientmessage(therapist_id, patient_id, created_at);
                """
            ),
            reverse_sql=(
                "DROP INDEX IF EXISTS api_patientmessage_patient_created_at_idx;"
                " DROP INDEX IF EXISTS api_patientmessage_therapist_patient_created_at_idx;"
                " DROP TABLE IF EXISTS api_patientmessage;"
            ),
        ),
    ]
