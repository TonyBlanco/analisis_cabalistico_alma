import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE','core.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
try:
    u = User.objects.get(username='test_thera')
    p = u.profile
    p.user_type='therapist'
    p.is_admin=True
    p.save()
    print('Updated profile to therapist')
except Exception as e:
    print('Error:', e)
