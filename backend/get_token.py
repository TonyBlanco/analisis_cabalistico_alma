#!/usr/bin/env python
"""
Script para obtener token de autenticación para un usuario
"""
import os
import django
import sys
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

if len(sys.argv) < 2:
    print("Uso: python get_token.py <username> [password]")
    print("Ejemplo: python get_token.py tonypaciente@dev.local dev123")
    sys.exit(1)

username = sys.argv[1]
password = sys.argv[2] if len(sys.argv) > 2 else "dev123"

# Verificar que el usuario existe
try:
    user = User.objects.get(username=username)
    print(f"Usuario encontrado: {user.username} ({user.email})")
except User.DoesNotExist:
    try:
        user = User.objects.get(email=username)
        print(f"Usuario encontrado por email: {user.username} ({user.email})")
        username = user.username
    except User.DoesNotExist:
        print(f"Usuario '{username}' no encontrado")
        sys.exit(1)

# Intentar login
url = "http://127.0.0.1:8000/api/login/"
data = {
    "username": username,
    "password": password
}

try:
    response = requests.post(url, json=data)
    if response.status_code == 200:
        token_data = response.json()
        token = token_data.get('token')
        if token:
            print(f"\nToken obtenido:")
            print(token)
            print(f"\nPara usar en curl:")
            print(f'curl -X PATCH -H "Authorization: Token {token}" -H "Content-Type: application/json" -d \'{{"birth_city":"TestCity"}}\' http://127.0.0.1:8000/api/profile/me/')
        else:
            print("Error: No se recibió token en la respuesta")
            print(f"Respuesta: {token_data}")
    else:
        print(f"Error en login: {response.status_code}")
        print(f"Respuesta: {response.text}")
except Exception as e:
    print(f"Error al conectar: {e}")
