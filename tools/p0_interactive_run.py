import requests
import os
import sys

BASE = 'http://127.0.0.1:8000/api/swm/mcmi4'
TOKEN = '143a5da02fbe1cc6e0340490e1caa256ba39e469'  # p0_executor token
HEADERS = {'Authorization': f'Token {TOKEN}', 'Content-Type': 'application/json'}

def post(path, json):
    r = requests.post(BASE + path, json=json, headers=HEADERS)
    try:
        return r.status_code, r.json()
    except Exception:
        return r.status_code, r.text

def get(path, params=None):
    r = requests.get(BASE + path, params=params, headers=HEADERS)
    try:
        return r.status_code, r.json()
    except Exception:
        return r.status_code, r.text

if __name__ == '__main__':
    # 1) Create workspace (creator = token user p0_executor)
    create_body = {'subject_user_id': 50, 'mcmi4_source_data_id': 'MCMI4_MYSTIC'}
    sc, create_resp = post('/create', create_body)
    print('\n--- CREATE RESPONSE ---')
    print(sc)
    print(create_resp)

    if sc not in (200,201):
        sys.exit(1)

    workspace_id = create_resp.get('workspace_id')

    # 2) Start session
    start_body = {'workspace_id': workspace_id}
    sc, start_resp = post('/start', start_body)
    print('\n--- START RESPONSE ---')
    print(sc)
    print(start_resp)

    if sc not in (200,201):
        sys.exit(1)

    session_id = start_resp.get('session_id')

    # 3) GET questionnaire
    sc, q_resp = get('/questionnaire', params={'workspace_id': workspace_id})
    print('\n--- QUESTIONNAIRE RESPONSE ---')
    print(sc)
    print({'total_questions': q_resp.get('questionnaire', {}).get('total_questions'),
           'first_question_id': None})

    # extract first question id
    try:
        worlds = q_resp.get('questionnaire', {}).get('worlds', {})
        first_q = None
        for world in ['atzilut','briah','yetzirah','assiah']:
            w = worlds.get(world, {})
            qs = w.get('questions', [])
            if qs:
                first_q = qs[0]
                break
        first_qid = first_q.get('id') if first_q else None
    except Exception:
        first_qid = None

    print('\n--- TOTAL+FIRST ---')
    print({'total_questions': q_resp.get('questionnaire', {}).get('total_questions'), 'first_question_id': first_qid})

    # 4) Save three responses (first three unanswered questions)
    print('\n--- SAVE 3 RESPONSES ---')
    answered = []
    # try to gather first 3 questions across worlds
    qs_list = []
    for world in ['atzilut','briah','yetzirah','assiah']:
        w = worlds.get(world, {})
        for q in w.get('questions', []):
            qs_list.append((q, world))
            if len(qs_list) >= 3:
                break
        if len(qs_list) >= 3:
            break

    for q, world in qs_list:
        payload = {'workspace_id': workspace_id, 'session_id': session_id, 'action': 'save_response',
                   'payload': {'question_id': q['id'], 'value': 3, 'world': world}}
        sc, resp = post('/progress', payload)
        print(sc, resp.get('action') if isinstance(resp, dict) else resp)
        answered.append({'question_id': q['id'], 'status_code': sc, 'resp': resp})

    print('\n--- ANSWERED 3 ---')
    print(answered)

    # 5) Attempt change_world to next world
    print('\n--- ATTEMPT CHANGE_WORLD ---')
    change_body = {'workspace_id': workspace_id, 'session_id': session_id, 'action': 'change_world', 'payload': {'target_world': 'briah'}}
    sc, change_resp = post('/progress', change_body)
    print(sc)
    print(change_resp)

    # 6) Attempt seal (expect error because incomplete)
    print('\n--- ATTEMPT SEAL ---')
    seal_body = {'workspace_id': workspace_id, 'session_id': session_id, 'final_synthesis': {'note': 'Test seal attempt'}}
    sc, seal_resp = post('/seal', seal_body)
    print(sc)
    print(seal_resp)


