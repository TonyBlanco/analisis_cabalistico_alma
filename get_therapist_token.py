#!/usr/bin/env python
"""Get therapist auth token for testing."""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from api.models import UserProfile

User = get_user_model()

# Get therapist "armando" or first therapist
try:
    therapist = User.objects.get(username='armando')
except User.DoesNotExist:
    therapists = User.objects.filter(profile__user_type='therapist')
    if not therapists.exists():
        print("\n❌ No hay therapists en la base de datos")
        print("   Crear uno con: python manage.py createsuperuser")
        sys.exit(1)
    therapist = therapists.first()

token, created = Token.objects.get_or_create(user=therapist)

print("\n" + "="*60)
print(f"Therapist: {therapist.username}")
print(f"Token: {token.key}")
print("="*60 + "\n")

print("Test curl command:")
print(f"curl -X POST http://127.0.0.1:8000/api/ai-engine/interpret/116/ \\")
print(f'  -H "Authorization: Token {token.key}" \\')
print(f'  -H "Content-Type: application/json" \\')
print(f'  -d \'{{"force_refresh": false}}\'')
print()
