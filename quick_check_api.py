import requests

print('Testing http://127.0.0.1:8000/api/me/')
try:
    r = requests.get('http://127.0.0.1:8000/api/me/', timeout=5)
    print('Status:', r.status_code)
    print('Content-Type:', r.headers.get('content-type'))
    print('Body snippet:', r.text[:200])
except Exception as e:
    print('Request failed:', type(e).__name__, e)
