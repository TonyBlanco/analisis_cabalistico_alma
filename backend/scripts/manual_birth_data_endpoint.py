import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient
from datetime import date

username = 'test_personal'
user = User.objects.filter(username=username).first()
if not user:
    print('User not found')
else:
    token, _ = Token.objects.get_or_create(user=user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
    client.defaults['HTTP_HOST'] = '127.0.0.1'
    payload = {
        'full_name': 'Juan Perez',
        'birth_date': '1980-01-08',
        'birth_time': '08:30:00',
        'birth_city': 'Madrid',
        'birth_country': 'ES',
        'is_locked': True
    }
    resp = client.post('/api/me/birth-data/', data=payload, format='json')
    print('POST status:', resp.status_code)
    print('POST content:', getattr(resp, 'data', None))
    me = client.get('/api/me/')
    print('GET /api/me/', getattr(me, 'data', None))
    # Request unlock email
    resp_unlock = client.post('/api/me/birth-data/send-unlock-email/', data={}, format='json')
    print('send-unlock-email status', resp_unlock.status_code, getattr(resp_unlock, 'data', None))

    # Read from DB to get the token
    from api.birth_data_model import UserBirthData
    bd = UserBirthData.objects.get(user=user)
    token = bd.unlock_token
    print('DEBUG token (db):', token)

    # Confirm unlock using token
    resp_confirm = client.post('/api/me/birth-data/unlock/', data={'token': token}, format='json')
    print('Unlock confirm status', resp_confirm.status_code, getattr(resp_confirm, 'data', None))

    # Now test locking by user
    print('\n-- Locking birth data by setting is_locked True --')
    resp_lock = client.post('/api/me/birth-data/', data={'is_locked': True}, format='json')
    print('Lock status', resp_lock.status_code, getattr(resp_lock, 'data', None))

    # Attempt to edit while locked (should be 403)
    print('\n-- Attempt edit while locked (expect 403) --')
    resp_edit = client.post('/api/me/birth-data/', data={'birth_city': 'Barcelona'}, format='json')
    print('Edit while locked status', resp_edit.status_code, getattr(resp_edit, 'data', None))

