import os
import sys
import django

sys.path.insert(0, 'backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.test_models import TestModule

# Create/update mcmi4-signal
test_data = {
    'code': 'mcmi4-signal',
    'name': 'SWM MCMI-4 SIGNAL',
    'description': 'Señal mínima simbólica para habilitar el flujo SWM MCMI-4 Místico. Cuestionario corto de señal no clínica.',
    'test_type': 'holistic_screening',
    'required_access_level': 'free',
    'icon': '🧭',
    'order': 998,
    'estimated_duration': 5,
    'available_for_therapists': True,
    'available_for_personal': True,
    'uses_per_month': None,
    'is_assignable': True,
    'requires_license': False,
    'domain': 'holistic',
    'public_name': 'SWM MCMI-4 SIGNAL',
    'is_active': True,
}

test, created = TestModule.objects.update_or_create(
    code='mcmi4-signal',
    defaults=test_data
)

print(f"{'CREATED' if created else 'UPDATED'}: {test.name}")
print(f"Active: {test.is_active}")
print(f"Assignable: {test.is_assignable}")
print(f"Available for patients: {test.available_for_personal}")
