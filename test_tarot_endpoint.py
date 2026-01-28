"""
Test script para verificar el endpoint de tarot SWM
"""
import django
import os
import sys
import json

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model
from swm.tarot.views import WorkspaceDefinitionView

User = get_user_model()

# Get a test user
user = User.objects.filter(is_staff=True).first()
if not user:
    print("❌ No staff user found")
    exit(1)

# Create test request
factory = RequestFactory()
request = factory.get('/api/swm/tarot/definition')
request.user = user

# Test view
view = WorkspaceDefinitionView.as_view()
response = view(request)

print(f"Status Code: {response.status_code}")
if hasattr(response, 'data'):
    print(f"Response Data:")
    print(json.dumps(response.data, indent=2, default=str))
else:
    print(f"Content: {response.content[:500]}")

if response.status_code == 200:
    print("\n✅ Endpoint funciona correctamente")
else:
    print(f"\n❌ Error: status {response.status_code}")
