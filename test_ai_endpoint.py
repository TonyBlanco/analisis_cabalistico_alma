#!/usr/bin/env python
"""Test AI Engine endpoint with proper authentication."""
import requests
import json

API_URL = "http://127.0.0.1:8000/api/ai-engine/interpret/116/"
TOKEN = "bb4d6b53a0a33b73d464e77ca5bb0dc3a545fa3e"  # therapist armando

headers = {
    "Authorization": f"Token {TOKEN}",
    "Content-Type": "application/json"
}

data = {"force_refresh": False}

print("\n" + "="*60)
print("Testing AI Engine Endpoint")
print("="*60)
print(f"URL: {API_URL}")
print(f"Headers: {headers}")
print(f"Data: {data}")
print("="*60 + "\n")

try:
    response = requests.post(API_URL, headers=headers, json=data, timeout=60)
    
    print(f"Status Code: {response.status_code}")
    print(f"\nResponse:")
    print("="*60)
    
    if response.headers.get('content-type', '').startswith('application/json'):
        result = response.json()
        print(json.dumps(result, indent=2))
    else:
        print(response.text)
    
    print("="*60 + "\n")
    
except requests.exceptions.ConnectionError as e:
    print(f"❌ Connection error: {e}")
    print("   ¿Está corriendo el servidor Django?")
except requests.exceptions.Timeout:
    print("❌ Request timed out (>60s)")
    print("   La generación AI puede tomar tiempo...")
except Exception as e:
    print(f"❌ Error: {type(e).__name__}: {e}")
