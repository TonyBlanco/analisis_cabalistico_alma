# Generated migration - PHASE 3: Create IdentityProfile
# Separates symbolic/astrological data from clinical data

from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    """
    PHASE 3: Identity Profile (Symbolic/Astrological)
    
    Creates api_identityprofile to hold non-clinical identity data.
    This table is for ALL users (not just patients).
    
    PURPOSE:
    - Astrological calculations
    - Kabbalistic analysis
    - SWM symbolic tests
    - Any identity-based computation
    
    DATA FLOW:
    - Initially empty (populated in Phase 3b backfill)
    - Will receive data from api_patient.birth_* fields
    - Independent of clinical context
    
    ROLLBACK:
    - Drop table api_identityprofile
    - No data loss (source data still in api_patient)
    """

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('api', '0077_phase2_patient_normalization'),
    ]

    operations = [
        migrations.CreateModel(
            name='IdentityProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                
                # Identity link (1-1 with auth_user)
                ('user', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='identity_profile',
                    to='auth.user',
                    help_text='Usuario al que pertenece esta identidad simbólica'
                )),
                
                # Birth data (astrological/symbolic)
                ('birth_date', models.DateField(
                    help_text='Fecha de nacimiento (para astrología y cálculos cabalísticos)'
                )),
                ('birth_time', models.TimeField(
                    null=True,
                    blank=True,
                    help_text='Hora exacta de nacimiento (opcional, mejora precisión astrológica)'
                )),
                
                # Location data (required for astrological calculations)
                ('birth_city', models.CharField(
                    max_length=200,
                    blank=True,
                    help_text='Ciudad de nacimiento'
                )),
                ('birth_country', models.CharField(
                    max_length=100,
                    blank=True,
                    help_text='País de nacimiento'
                )),
                ('birth_latitude', models.DecimalField(
                    max_digits=9,
                    decimal_places=6,
                    null=True,
                    blank=True,
                    help_text='Latitud del lugar de nacimiento (requerido para astrología)'
                )),
                ('birth_longitude', models.DecimalField(
                    max_digits=9,
                    decimal_places=6,
                    null=True,
                    blank=True,
                    help_text='Longitud del lugar de nacimiento (requerido para astrología)'
                )),
                ('birth_timezone', models.CharField(
                    max_length=100,
                    blank=True,
                    help_text='Zona horaria del lugar de nacimiento'
                )),
                
                # Symbolic identity
                ('hebrew_name', models.CharField(
                    max_length=255,
                    blank=True,
                    help_text='Nombre en hebreo (opcional, para análisis cabalístico)'
                )),
                
                # Metadata
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Identity Profile',
                'verbose_name_plural': 'Identity Profiles',
                'db_table': 'api_identityprofile',
            },
        ),
        
        # Index for fast lookups
        migrations.AddIndex(
            model_name='identityprofile',
            index=models.Index(fields=['user'], name='identity_user_idx'),
        ),
    ]
