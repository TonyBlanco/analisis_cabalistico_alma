import requests
TOKEN = '143a5da02fbe1cc6e0340490e1caa256ba39e469'
HEADERS = {'Authorization': f'Token {TOKEN}', 'Content-Type': 'application/json'}
BASE = 'http://127.0.0.1:8000/api/swm/mcmi4'
WID = '5708ffe3-5bc3-448e-82fa-1ce23bf09e56'

# GET questionnaire
r = requests.get(BASE + '/questionnaire', params={'workspace_id': WID}, headers=HEADERS, timeout=10)
print('\n--- QUESTIONNAIRE GET ---')
print(r.status_code)
try:
    q = r.json()
except Exception:
    q = r.text
print(q)

if r.status_code != 200:
    raise SystemExit(1)

# find first three questions
worlds = q['questionnaire']['worlds']
qs = []
for world in ['atzilut','briah','yetzirah','assiah']:
    for question in worlds[world]['questions']:
        qs.append((question, world))
        if len(qs) >= 3:
            break
    if len(qs) >= 3:
        break

# POST three save_response
print('\n--- POST 3 save_response ---')
answers = []
# need session id - fetch active session from status endpoint
rstat = requests.get(BASE + '/status', params={'workspace_id': WID}, headers=HEADERS, timeout=10)
session_id = None
if rstat.status_code == 200:
    st = rstat.json()
    asess = st.get('active_session')
    if asess:
        session_id = asess.get('session_id')

if not session_id:
    print('No active session found')
    raise SystemExit(1)

for qobj, world in qs:
    payload = {
        'workspace_id': WID,
        'session_id': session_id,
        'action': 'save_response',
        'payload': {'question_id': qobj['id'], 'value': 3, 'world': world}
    }
    r = requests.post(BASE + '/questionnaire/action', json=payload, headers=HEADERS, timeout=10)
    try:
        resp = r.json()
    except Exception:
        resp = r.text
    print(r.status_code, resp)
    answers.append({'question_id': qobj['id'], 'status': r.status_code, 'resp': resp})

print('\n--- ANSWERS SUMMARY ---')
print(answers)

# Attempt change_world
print('\n--- ATTEMPT change_world to briah ---')
change_payload = {'workspace_id': WID, 'session_id': session_id, 'action': 'change_world', 'payload': {'target_world': 'briah'}}
r = requests.post(BASE + '/questionnaire/action', json=change_payload, headers=HEADERS, timeout=10)
try:
    print(r.status_code, r.json())
except Exception:
    print(r.status_code, r.text)

# Attempt seal
print('\n--- ATTEMPT questionnaire seal ---')
seal_payload = {'workspace_id': WID, 'session_id': session_id, 'final_synthesis': {'note': 'test seal attempt'}}
r = requests.post(BASE + '/questionnaire/seal', json=seal_payload, headers=HEADERS, timeout=10)
try:
    print(r.status_code, r.json())
except Exception:
    print(r.status_code, r.text)
