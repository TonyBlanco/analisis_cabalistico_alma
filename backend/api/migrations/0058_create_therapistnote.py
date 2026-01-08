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
                    created_at datetime NOT NULL
                );
                """
            ),
            reverse_sql="DROP TABLE IF EXISTS api_patientmessage;",
        ),
    ]
