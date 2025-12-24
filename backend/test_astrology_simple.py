#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script simple de validación para el endpoint de Astrología
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Patient
from api.models_astrology import AstrologyNatalChart
from api.astrology_kerykeion.service import execute_kerykeion
from api.astrology_kerykeion.schemas import KerykeionInputSchema
from api.astrology_kerykeion.normalizer import normalize_kerykeion_output
from datetime import time
from decimal import Decimal

print("Test: Endpoint de Astrologia Kerykeion")
print("=" * 60)

# Get therapist and patient
therapist = User.objects.filter(profile__user_type='therapist').first()
if not therapist:
    print("ERROR: No therapist found")
    sys.exit(1)

patient = Patient.objects.filter(therapist=therapist).first()
if not patient:
    print("ERROR: No patient found")
    sys.exit(1)

print(f"Therapist: {therapist.username}")
print(f"Patient: {patient.full_name} (ID: {patient.id})")

# Complete patient data if needed
if not patient.birth_city:
    patient.birth_city = "New York"
    patient.birth_country = "United States"
    patient.birth_latitude = Decimal('40.7128')
    patient.birth_longitude = Decimal('-74.0060')
    patient.birth_timezone = "America/New_York"
    patient.save()
    print("Patient data completed with test data")

# Clear existing chart
AstrologyNatalChart.objects.filter(patient=patient).delete()
print("Existing chart cleared")

# Test POST: Calculate natal chart
print("\nTest POST: Calculate natal chart")
try:
    input_data_dict = {
        'birth_date': patient.birth_date.strftime('%Y-%m-%d'),
        'birth_time': patient.birth_time.strftime('%H:%M'),
        'location': {
            'city': patient.birth_city,
            'country': patient.birth_country,
            'lat': float(patient.birth_latitude),
            'lng': float(patient.birth_longitude),
            'timezone': patient.birth_timezone
        },
        'house_system': 'placidus',
        'zodiac_system': 'tropical',
        'engine': 'kerykeion',
        'engine_version': '1.0.0'
    }
    
    print("Input constructed from patient profile")
    
    # Execute Kerykeion
    input_schema = KerykeionInputSchema(**input_data_dict)
    kerykeion_result = execute_kerykeion(input_schema)
    kerykeion_result_dict = kerykeion_result.model_dump()
    
    print("Kerykeion executed successfully")
    
    # Normalize
    normalized_chart = normalize_kerykeion_output(
        kerykeion_result_dict,
        input_data_dict
    )
    
    print("Output normalized")
    
    # Persist
    natal_chart = AstrologyNatalChart.objects.create(
        patient=patient,
        created_by=therapist,
        house_system='placidus',
        source='kerykeion',
        status='ok',
        chart_payload=normalized_chart,
        input_snapshot=input_data_dict
    )
    
    print(f"Natal chart persisted (ID: {natal_chart.id})")
    
    # Verify structure
    print("\nVerifying normalized payload structure:")
    print(f"  - Planets: {len(normalized_chart.get('planetas', []))}")
    print(f"  - Houses: {len(normalized_chart.get('casas', []))}")
    print(f"  - Aspects: {len(normalized_chart.get('aspectos', []))}")
    print(f"  - Metadata: {'OK' if 'metadatos' in normalized_chart else 'MISSING'}")
    
    # Show sample planets
    if normalized_chart.get('planetas'):
        print("\nSample planets:")
        for planeta in normalized_chart['planetas'][:3]:
            print(f"  - {planeta['nombre']}: {planeta['grados']} deg {planeta['signo']} (Casa {planeta['casa']})")
    
    print("\nTest POST: SUCCESS")
    
except Exception as e:
    print(f"Test POST: FAILED - {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test GET: Retrieve natal chart
print("\nTest GET: Retrieve natal chart")
try:
    retrieved_chart = AstrologyNatalChart.objects.get(patient=patient)
    print(f"Chart retrieved successfully")
    print(f"  - Calculated: {retrieved_chart.calculated_at}")
    print(f"  - System: {retrieved_chart.house_system}")
    print(f"  - Source: {retrieved_chart.source}")
    print(f"  - Status: {retrieved_chart.status}")
    print("\nTest GET: SUCCESS")
except Exception as e:
    print(f"Test GET: FAILED - {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("ALL TESTS PASSED")
sys.exit(0)
