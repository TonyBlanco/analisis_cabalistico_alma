import sqlite3

DB = 'backend/db.sqlite3'

def main():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()
    print('Latest workspace_instances:')
    cur.execute("select id,status,mcmi4_source_data_id,created_at,started_at,sealed_at from workspace_instances order by created_at desc limit 20")
    for row in cur.fetchall():
        print(row)
    print('\nLatest workspace_artifacts:')
    cur.execute("select id,workspace_instance_id,artifact_type,created_by_id,created_at,is_sealed from workspace_artifacts order by created_at desc limit 20")
    for row in cur.fetchall():
        print(row)
    conn.close()

if __name__ == '__main__':
    main()
