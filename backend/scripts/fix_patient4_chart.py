#!/usr/bin/env python
"""
Script to recalculate natal chart for patient 4 with fixed normalizer
"""
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from api.models import Patient, User
from api.models_astrology import AstrologyNatalChart
from api.astrology_kerykeion.service import execute_kerykeion
from api.astrology_kerykeion.schemas import KerykeionInputSchema
from api.astrology_kerykeion.normalizer import normalize_kerykeion_output

def main():
    patient = Patient.objects.get(id=4)
    therapist = User.objects.get(username='armando')
    
    print(f"Patient: {patient.first_name} {patient.last_name}")
    print(f"Birth: {patient.birth_date} {patient.birth_time}")
    print(f"Location: {patient.birth_city}, {patient.birth_country}")
    
    # Delete existing chart
    deleted = AstrologyNatalChart.objects.filter(patient=patient).delete()
    print(f"Deleted existing charts: {deleted}")
    
    # Build input
    input_data_dict = {
        'birth_date': patient.birth_date.strftime('%Y-%m-%d'),
        'birth_time': patient.birth_time.strftime('%H:%M'),
        'location': {
            'city': patient.birth_city,
            'country': patient.birth_country,
            'lat': float(patient.birth_latitude),
            'lng': float(patient.birth_longitude),
            'timezone': patient.birth_timezone,
        },
        'house_system': 'placidus',
        'zodiac_system': 'tropical',
        'engine': 'kerykeion',
    }
    
    print("\nExecuting Kerykeion...")
    input_schema = KerykeionInputSchema(**input_data_dict)
    kerykeion_result = execute_kerykeion(input_schema)
    kerykeion_result_dict = kerykeion_result.model_dump()
    
    print("Normalizing output...")
    normalized_chart = normalize_kerykeion_output(kerykeion_result_dict, input_data_dict)
    
    # Show aspects sample
    aspects = normalized_chart.get('aspectos', [])
    print(f"\nAspects count: {len(aspects)}")
    print("First 3 aspects:")
    for a in aspects[:3]:
        print(f"  {a.get('planeta1')} - {a.get('planeta2')}: {a.get('tipo')} (orb: {a.get('orbe')})")
    
    # Persist
    natal_chart = AstrologyNatalChart.objects.create(
        patient=patient,
        created_by=therapist,
        house_system='placidus',
        source='kerykeion',
        status='ok',
        chart_payload=normalized_chart,
        input_snapshot=input_data_dict,
    )
    
    print(f"\nChart created. ID: {natal_chart.id}")
    print("SUCCESS!")

if __name__ == "__main__":
    main()
