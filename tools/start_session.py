import requests
TOKEN='143a5da02fbe1cc6e0340490e1caa256ba39e469'
HEADERS={'Authorization':f'Token {TOKEN}','Content-Type':'application/json'}
BASE='http://127.0.0.1:8000/api/swm/mcmi4'
wid='5708ffe3-5bc3-448e-82fa-1ce23bf09e56'

r=requests.post(BASE+'/start', json={'workspace_id': wid}, headers=HEADERS, timeout=10)
print(r.status_code)
print(r.text)
if r.status_code in (200,201):
    print('SID', r.json().get('session_id'))
else:
    raise SystemExit(1)
