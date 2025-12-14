# Migration to configure admin users with unlimited access
from django.db import migrations
from django.utils import timezone
from datetime import timedelta


def configure_admin_profiles(apps, schema_editor):
    """
    Configura perfiles de administradores con acceso ilimitado:
    - supportadmin: Admin con acceso completo (therapist)
    - supertony: Terapeuta profesional con acceso ilimitado
    - tony: Usuario personal para pruebas
    """
    User = apps.get_model('auth', 'User')
    UserProfile = apps.get_model('api', 'UserProfile')
    
    # Configuración para supportadmin (Admin general)
    try:
        support_user = User.objects.get(username='supportadmin')
        support_profile, created = UserProfile.objects.get_or_create(
            user=support_user,
            defaults={
                'full_name': 'Support Admin',
                'user_type': 'therapist',
                'is_admin': True,
            }
        )
        # Actualizar perfil existente
        support_profile.user_type = 'therapist'
        support_profile.is_admin = True
        support_profile.subscription_status = 'active'
        support_profile.subscription_plan = 'premium'
        support_profile.membership_active = True
        support_profile.membership_expires = None  # Sin expiración
        support_profile.subscription_end_date = None  # Sin expiración
        support_profile.max_patients = 0  # Ilimitado
        support_profile.max_fichas_per_month = 999999  # Ilimitado
        support_profile.save()
        print(f"[OK] Configurado: supportadmin (Admin/Therapist - acceso ilimitado)")
    except User.DoesNotExist:
        print(f"[WARN] Usuario supportadmin no encontrado")
    
    # Configuración para supertony (Terapeuta profesional)
    try:
        tony_super = User.objects.get(username='supertony')
        tony_profile, created = UserProfile.objects.get_or_create(
            user=tony_super,
            defaults={
                'full_name': 'Tony Super',
                'user_type': 'therapist',
                'is_admin': True,
            }
        )
        # Actualizar perfil existente
        tony_profile.user_type = 'therapist'
        tony_profile.is_admin = True
        tony_profile.subscription_status = 'active'
        tony_profile.subscription_plan = 'professional'
        tony_profile.membership_active = True
        tony_profile.membership_expires = None  # Sin expiración
        tony_profile.subscription_end_date = None  # Sin expiración
        tony_profile.max_patients = 0  # Ilimitado
        tony_profile.max_fichas_per_month = 999999  # Ilimitado
        tony_profile.profession = 'Terapeuta'
        tony_profile.specialization = 'Análisis Cabalístico'
        tony_profile.years_of_experience = 20
        tony_profile.save()
        print(f"[OK] Configurado: supertony (Therapist profesional - acceso ilimitado)")
    except User.DoesNotExist:
        print(f"[WARN] Usuario supertony no encontrado")
    
    # Configuración para tony (Usuario personal para pruebas)
    try:
        tony_personal = User.objects.get(username='tony')
        tony_personal_profile, created = UserProfile.objects.get_or_create(
            user=tony_personal,
            defaults={
                'full_name': 'Tony Blanco',
                'user_type': 'personal',
                'is_admin': False,
            }
        )
        # Actualizar perfil existente
        tony_personal_profile.user_type = 'personal'
        tony_personal_profile.is_admin = False
        tony_personal_profile.subscription_status = 'active'
        tony_personal_profile.subscription_plan = 'personal'
        tony_personal_profile.membership_active = True
        tony_personal_profile.membership_expires = timezone.now() + timedelta(days=365)
        tony_personal_profile.subscription_end_date = timezone.now() + timedelta(days=365)
        tony_personal_profile.max_fichas_per_month = 50  # Buen límite para pruebas
        tony_personal_profile.save()
        print(f"[OK] Configurado: tony (Personal - 1 año de acceso)")
    except User.DoesNotExist:
        print(f"[WARN] Usuario tony no encontrado")


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_force_reset_admin_passwords'),
    ]

    operations = [
        migrations.RunPython(configure_admin_profiles, migrations.RunPython.noop),
    ]
