import requests
TOKEN='143a5da02fbe1cc6e0340490e1caa256ba39e469'
HEADERS={'Authorization':f'Token {TOKEN}','Content-Type':'application/json'}
BASE='http://127.0.0.1:8000/api/swm/mcmi4'
WID='5708ffe3-5bc3-448e-82fa-1ce23bf09e56'

# get session id
rstat = requests.get(BASE + '/status', params={'workspace_id': WID}, headers=HEADERS, timeout=10)
print('STATUS', rstat.status_code)
if rstat.status_code != 200:
    print(rstat.text)
    raise SystemExit(1)
session_id = rstat.json().get('active_session', {}).get('session_id')
print('SESSION_ID', session_id)

# change_world
change_payload = {'workspace_id': WID, 'session_id': session_id, 'action': 'change_world', 'payload': {'target_world': 'briah'}}
r = requests.post(BASE + '/questionnaire/action', json=change_payload, headers=HEADERS, timeout=10)
print('\nCHANGE_WORLD', r.status_code)
try:
    print(r.json())
except Exception:
    print(r.text)

# attempt seal
seal_payload = {'workspace_id': WID, 'session_id': session_id, 'final_synthesis': {'note': 'test'}}
r2 = requests.post(BASE + '/questionnaire/seal', json=seal_payload, headers=HEADERS, timeout=10)
print('\nQUESTIONNAIRE SEAL', r2.status_code)
try:
    print(r2.json())
except Exception:
    print(r2.text)
