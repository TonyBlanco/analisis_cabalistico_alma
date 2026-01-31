#!/usr/bin/env python
"""
Script para recrear consultantes de test.

IMPORTANTE: Este script elimina consultantes de test existentes y crea nuevos.
Solo ejecutar en entornos de desarrollo/testing.

Ver: docs/UNIFIED_CONSULTANTE_ARCHITECTURE.md sección "Phase 4: Test Data Recreation"

Uso:
    cd backend
    python scripts/recreate_test_consultantes.py
"""

import os
import sys
import django

# Configurar Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Consultante, UserProfile


def recreate_test_data():
    """Recrear consultantes de test limpios."""
    
    print("=" * 60)
    print("RECREANDO CONSULTANTES DE TEST")
    print("=" * 60)
    
    # Buscar terapeuta existente o crear uno de test
    therapist = None
    
    # Primero buscar terapeutas reales existentes
    therapist_profiles = UserProfile.objects.filter(user_type='therapist')
    if therapist_profiles.exists():
        therapist = therapist_profiles.first().user
        print(f"[OK] Usando terapeuta existente: {therapist.username}")
    else:
        # Crear terapeuta de test
        therapist, created = User.objects.get_or_create(
            username='test_therapist',
            defaults={
                'email': 'therapist@test.com',
                'first_name': 'Dr. Armando',
                'last_name': 'Ledezma'
            }
        )
        if created:
            therapist.set_password('test123')
            therapist.save()
            # Actualizar perfil a terapeuta
            profile = therapist.profile
            profile.user_type = 'therapist'
            profile.full_name = 'Dr. Armando Ledezma'
            profile.save()
            print(f"[+] Creado terapeuta de test: {therapist.username}")
        else:
            print(f"[OK] Terapeuta de test existente: {therapist.username}")
    
    # Datos de consultantes de test
    consultantes_data = [
        {
            'name': 'Luis Antonio Blanco Fontela',
            'email': 'luis.consultante@test.com',
            'birth_date': '1985-03-15',
            'biological_sex': 'male',
            'main_complaint': 'Ansiedad y desconexión espiritual',
            'birth_city': 'Madrid',
            'birth_country': 'España',
        },
        {
            'name': 'María García Rodríguez',
            'email': 'maria.consultante@test.com',
            'birth_date': '1990-07-22',
            'biological_sex': 'female',
            'main_complaint': 'Depresión y búsqueda de propósito',
            'birth_city': 'Barcelona',
            'birth_country': 'España',
        },
        {
            'name': 'Carlos Mendoza Silva',
            'email': 'carlos.consultante@test.com',
            'birth_date': '1978-11-05',
            'biological_sex': 'male',
            'main_complaint': 'Estrés laboral y relaciones familiares',
            'birth_city': 'Valencia',
            'birth_country': 'España',
        }
    ]
    
    created_count = 0
    
    for i, data in enumerate(consultantes_data):
        email = data['email']
        
        # Verificar si ya existe
        existing = Consultante.objects.filter(email=email).first()
        if existing:
            print(f"[SKIP] Consultante ya existe: {existing.full_name}")
            continue
        
        # Generar username único
        base_username = f"consultante_{i+1}"
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1
        
        # Crear User account
        user = User.objects.create_user(
            username=username,
            email=email,
            password='test123',
            first_name=data['name'].split()[0],
            last_name=' '.join(data['name'].split()[1:])
        )
        
        # Actualizar perfil a 'patient'
        if hasattr(user, 'profile'):
            user.profile.user_type = 'patient'
            user.profile.full_name = data['name']
            user.profile.save()
        
        # Crear Consultante
        from datetime import datetime
        birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
        
        consultante = Consultante.objects.create(
            full_name=data['name'],
            email=email,
            birth_date=birth_date,
            biological_sex=data['biological_sex'],
            main_complaint=data['main_complaint'],
            birth_city=data.get('birth_city'),
            birth_country=data.get('birth_country'),
            therapist=therapist,
            user_account=user,
            therapy_status='active',
            therapy_level='therapeutic'
        )
        
        created_count += 1
        print(f"[+] Creado consultante: {consultante.full_name}")
        print(f"    UUID: {consultante.uuid}")
        print(f"    User ID: {consultante.user_id}")
        print(f"    Email: {consultante.email}")
    
    print()
    print("=" * 60)
    print(f"RESUMEN: {created_count} consultantes creados")
    print("=" * 60)
    
    # Verificación de integridad
    total = Consultante.objects.count()
    without_user = Consultante.objects.filter(user_account__isnull=True).count()
    
    print()
    print("VERIFICACIÓN DE INTEGRIDAD:")
    print(f"  Total consultantes: {total}")
    print(f"  Sin user_account: {without_user}")
    
    if without_user > 0:
        print("  ⚠️ ADVERTENCIA: Hay consultantes sin user_account!")
    else:
        print("  ✅ Todos los consultantes tienen user_account")
    
    print()
    print("Consultantes del terapeuta actual:")
    for c in Consultante.objects.filter(therapist=therapist):
        print(f"  - {c.full_name} (UUID: {str(c.uuid)[:8]}, user_id: {c.user_id})")


if __name__ == '__main__':
    recreate_test_data()
