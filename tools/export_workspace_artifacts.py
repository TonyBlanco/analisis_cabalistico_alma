import sqlite3
import json
from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[1] / 'backend' / 'db.sqlite3'

WORKSPACE_ID = '5708ffe3-5bc3-448e-82fa-1ce23bf09e56'
ARTIFACT_IDS = [
    'fefc5de4-e3e6-490d-b349-96272884a32a',
    '737b1cd5-10ba-4b17-8c9f-8fa3184de89b'
]

def fetch_workspace(conn, wid):
    cur = conn.cursor()
    cur.execute(
        'SELECT id, workspace_definition_id, subject_user_id, creator_user_id, status, mcmi4_source_data_id, config, metadata, created_at, started_at, sealed_at FROM workspace_instances WHERE id = ?',
        (wid,)
    )
    row = cur.fetchone()
    if not row:
        return None
    cols = ['id','workspace_definition_id','subject_user_id','creator_user_id','status','mcmi4_source_data_id','config','metadata','created_at','started_at','sealed_at']
    # config/metadata are stored as JSON strings in sqlite; try to parse
    out = dict(zip(cols, row))
    for k in ('config','metadata'):
        try:
            out[k] = json.loads(out[k]) if out[k] else {}
        except Exception:
            out[k] = out[k]
    return out

def fetch_artifact(conn, aid):
    cur = conn.cursor()
    cur.execute('SELECT id, workspace_instance_id, session_id, artifact_type, content, created_by_id, created_at, is_sealed, metadata FROM workspace_artifacts WHERE id = ?', (aid,))
    row = cur.fetchone()
    if not row:
        return None
    cols = ['id','workspace_instance_id','session_id','artifact_type','content','created_by_id','created_at','is_sealed','metadata']
    out = dict(zip(cols, row))
    try:
        out['content'] = json.loads(out['content']) if out['content'] else out['content']
    except Exception:
        pass
    try:
        out['metadata'] = json.loads(out['metadata']) if out['metadata'] else {}
    except Exception:
        pass
    return out

def main():
    if not DB_PATH.exists():
        print(json.dumps({'error':'db not found', 'db_path': str(DB_PATH)}))
        return
    conn = sqlite3.connect(str(DB_PATH))
    result = {}
    result['workspace'] = fetch_workspace(conn, WORKSPACE_ID)
    result['artifacts'] = []
    for aid in ARTIFACT_IDS:
        result['artifacts'].append(fetch_artifact(conn, aid))
    print(json.dumps(result, default=str, indent=2, ensure_ascii=False))

if __name__ == '__main__':
    main()
