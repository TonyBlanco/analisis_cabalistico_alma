import requests
TOKEN='143a5da02fbe1cc6e0340490e1caa256ba39e469'
HEADERS={'Authorization':f'Token {TOKEN}'}
WID='5708ffe3-5bc3-448e-82fa-1ce23bf09e56'
BASE='http://127.0.0.1:8000/api/swm/mcmi4'

r=requests.get(BASE+'/questionnaire', params={'workspace_id': WID}, headers=HEADERS, timeout=10)
print('STATUS', r.status_code)
try:
    print(r.json())
except Exception:
    print(r.text[:1000])
