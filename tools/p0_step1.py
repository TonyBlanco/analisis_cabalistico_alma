import requests
TOKEN = '143a5da02fbe1cc6e0340490e1caa256ba39e469'
HEADERS = {'Authorization': f'Token {TOKEN}', 'Content-Type': 'application/json'}
BASE = 'http://127.0.0.1:8000/api/swm/mcmi4'

# Create workspace
create_body = {'subject_user_id': 50, 'mcmi4_source_data_id': 'MCMI4_MYSTIC'}
r = requests.post(BASE + '/create', json=create_body, headers=HEADERS)
print('CREATE', r.status_code, r.text)
if r.status_code not in (200,201):
    raise SystemExit(1)
wid = r.json().get('workspace_id')

# Start session
r2 = requests.post(BASE + '/start', json={'workspace_id': wid}, headers=HEADERS)
print('START', r2.status_code, r2.text)
if r2.status_code not in (200,201):
    raise SystemExit(1)
sid = r2.json().get('session_id')

print(wid, sid)
