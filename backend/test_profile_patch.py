#!/usr/bin/env python
"""
Script para probar PATCH /api/profile/me/
"""
import requests
import json

token = "41323c4e1c88949ecc7b60f191c218aa222f51c4"
url = "http://127.0.0.1:8000/api/profile/me/"

headers = {
    "Authorization": f"Token {token}",
    "Content-Type": "application/json"
}

data = {
    "birth_city": "TestCity"
}

print(f"Probando PATCH {url}")
print(f"Token: {token[:20]}...")
print(f"Data: {json.dumps(data, indent=2)}")
print()

try:
    response = requests.patch(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False))
except Exception as e:
    print(f"Error: {e}")
