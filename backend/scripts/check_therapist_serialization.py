import os
import django
import json
import sys

# Initialize Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
# Ensure backend package directory is on sys.path so settings (core.settings) can be imported
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
django.setup()

from api.test_models import TestResult
from api.test_serializers import TestResultSerializer
from django.test.client import RequestFactory
from django.contrib.auth import get_user_model

User = get_user_model()
therapist = User.objects.filter(profile__user_type='therapist').first()
if not therapist:
    print('NO_THERAPIST_USER')
    sys.exit(0)

req = RequestFactory().get('/api/tests/results/')
req.user = therapist

tr = TestResult.objects.order_by('-created_at').first()
if not tr:
    print('NO_TESTRESULT')
    sys.exit(0)

try:
    s = TestResultSerializer(tr, context={'request': req})
    print(json.dumps(s.data, default=str))
except Exception as e:
    print('ERROR_SERIALIZING:', str(e))
    raise
