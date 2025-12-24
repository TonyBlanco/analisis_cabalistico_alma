#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Quick ephemeris test script for Aug 01 1959
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

try:
    import django
    django.setup()
except Exception as e:
    print('Django setup failed (not required):', e)

from api.astrology_kerykeion.swisseph_adapter import execute_with_astrology_core, ASTROLOGY_CORE_AVAILABLE
from api.astrology_kerykeion.normalizer import normalize_kerykeion_output

print('ASTROLOGY_CORE_AVAILABLE =', ASTROLOGY_CORE_AVAILABLE)

input_data = {
    'birth_date': '1959-08-01',
    'birth_time': '12:00',
    'location': {
        'city': 'London',
        'country': 'United Kingdom',
        'lat': 51.5074,
        'lng': -0.1278,
        'timezone': 'Europe/London'
    },
    'house_system': 'placidus',
    'zodiac_system': 'tropical',
    'engine': 'swisseph',
    'engine_version': '2.10.3'
}

if not ASTROLOGY_CORE_AVAILABLE:
    print('Astrology core not available in this environment. Cannot run ephemeris test.')
    sys.exit(0)

try:
    result = execute_with_astrology_core(
        birth_date=input_data['birth_date'],
        birth_time=input_data['birth_time'],
        city=input_data['location']['city'],
        country=input_data['location']['country'],
        lat=input_data['location']['lat'],
        lng=input_data['location']['lng'],
        timezone=input_data['location']['timezone'],
        house_system=input_data['house_system']
    )
    print('RAW RESULT PLANETS:')
    for k, v in result['planets'].items():
        print(f"  {k}: {v['sign']} {v['degree']}°")

    normalized = normalize_kerykeion_output(result, input_data)
    print('\nNORMALIZED PLANETS:')
    for p in normalized['planetas']:
        print(f"  {p['nombre']}: {p['signo']} {p['grados']}° (lon: {p['longitud_ecliptica']}°, casa: {p['casa']})")

except Exception as e:
    print('Error running ephemeris test:', e)
    import traceback
    traceback.print_exc()