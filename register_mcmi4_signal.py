import os
import sys
import django

sys.path.insert(0, 'backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.test_models import TestModule
from api.mcmi4_signal_public_name import (
    MCMI4_SIGNAL_PUBLIC_DESCRIPTION,
    MCMI4_SIGNAL_PUBLIC_NAME,
)

# Create/update mcmi4-signal
test_data = {
    'code': 'mcmi4-signal',
    'name': MCMI4_SIGNAL_PUBLIC_NAME,
    'description': MCMI4_SIGNAL_PUBLIC_DESCRIPTION,
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
    'public_name': MCMI4_SIGNAL_PUBLIC_NAME,
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
