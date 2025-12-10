"""
Script de pruebas: verificar que un usuario personal pueda ejecutar un test sin enviar nombre/fecha si tiene perfil
"""
import os
import django
import json
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
from api.test_models import TestModule
print('Available compatibility test modules:', list(TestModule.objects.filter(test_type='compatibility').values('code','name')))
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient
from datetime import date

# Setup
username = 'test_personal'
password = 'testpass123'
email = 'personal@example.com'

user, created = User.objects.get_or_create(username=username, defaults={'email': email})
if created:
    user.set_password(password)
    user.save()

# Ensure profile
profile = getattr(user, 'profile', None)
if not profile:
    from api.models import UserProfile
    profile = UserProfile.objects.create(user=user, full_name='Juan Perez', user_type='personal')

profile.full_name = 'Juan Perez'
profile.birth_date = date(1980, 1, 8)
profile.user_type = 'personal'
profile.save()

# Token
token, _ = Token.objects.get_or_create(user=user)
client = APIClient()
client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
client.defaults['HTTP_HOST'] = '127.0.0.1'

# Post to execute test with minimal payload (no nombre / fecha)
payload = {
    'test_module_code': 'basic-analysis',
    'input_data': {},
    'save_result': True
}

resp = client.post('/api/tests/execute/', data=json.dumps(payload), content_type='application/json')
print('Status code:', resp.status_code)
try:
    print('Response:', resp.json())
except Exception:
    print('Cannot parse JSON response')

# Check that result saved with client_name / birth_date=profile
if resp.status_code == 200 and resp.json().get('result_id'):
    from api.test_models import TestResult
    tr = TestResult.objects.get(pk=resp.json()['result_id'])
    print('Saved test result client:', tr.client_name, tr.client_birth_date)
else:
    print('Not saved or failed')

    # Test birth-data endpoint
    print('\n--- Testing birth-data endpoint ---')
    bd_payload = {
        'full_name': 'Juan Perez',
        'birth_date': '1980-01-08',
        'birth_time': '08:30:00',
        'birth_city': 'Madrid',
        'birth_country': 'ES'
    }
    resp_bd = client.post('/api/me/birth-data/', data=json.dumps(bd_payload), content_type='application/json')
    print('Birth-data status:', resp_bd.status_code)
    try:
        print('Birth-data response:', resp_bd.json())
    except Exception:
        print('No JSON in birth-data response')

    # Attempt to change birth date if locked
    resp_bd_change = client.post('/api/me/birth-data/', data=json.dumps({'birth_date': '1979-01-01'}), content_type='application/json')
    print('Attempt change birth-date status:', resp_bd_change.status_code)
    try:
        print('Attempt change response:', resp_bd_change.json())
    except Exception:
        print('No JSON in change response')
# Now test compatibility: send only persona2 data and expect persona1 to be the user
payload2 = {
    'test_module_code': 'couple-compatibility',
    'input_data': {
        'persona2_nombre': 'María López',
        'persona2_fecha_nacimiento': '1990-05-20'
    },
    'save_result': True
}

resp2 = client.post('/api/tests/execute/', data=json.dumps(payload2), content_type='application/json')
print('Compat status code:', resp2.status_code)
try:
    print('Compat response:', resp2.json())
except Exception:
    print('Cannot parse compat JSON response')

if resp2.status_code == 200 and resp2.json().get('result_id'):
    from api.test_models import TestResult
    tr2 = TestResult.objects.get(pk=resp2.json()['result_id'])
    print('Compat saved client:', tr2.client_name, tr2.client_birth_date)
else:
    print('Compat not saved or failed')
