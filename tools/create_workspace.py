import requests
TOKEN='143a5da02fbe1cc6e0340490e1caa256ba39e469'
HEADERS={'Authorization':f'Token {TOKEN}','Content-Type':'application/json'}
BASE='http://127.0.0.1:8000/api/swm/mcmi4'

try:
    r=requests.post(BASE+'/create', json={'subject_user_id':50,'mcmi4_source_data_id':'MCMI4_MYSTIC_RUN2'}, headers=HEADERS, timeout=10)
except Exception as e:
    print('ERROR', e)
    raise SystemExit(1)
print(r.status_code)
print(r.text)
if r.status_code in (200,201):
    print('ID', r.json().get('workspace_id'))
else:
    raise SystemExit(1)
