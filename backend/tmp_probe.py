import sqlite3

conn = sqlite3.connect('db.sqlite3')
c = conn.cursor()
print('TABLES:')
for r in c.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"):
    print(r[0])

print('\nTOKENS:')
try:
    for row in c.execute('select user_id, key from authtoken_token'):
        print(row)
except Exception as e:
    print('No authtoken_token table or error:', e)

print('\nINSTANCES (matching %%tarot%%):')
try:
    for row in c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%tarot%'"):
        print('TABLE:', row[0])
    # try common variants
    for q in [
        "select id, status, created_at, creator_user_id, subject_user_id from swm_tarot_workspace_instance order by created_at desc limit 10",
        "select id, status, created_at from taro_workspaceinstance order by created_at desc limit 10",
        "select id, status, created_at from swm_tarot_instance order by created_at desc limit 10",
    ]:
        try:
            for row in c.execute(q):
                print(row)
        except Exception:
            pass
except Exception as e:
    print('Error querying instances:', e)

conn.close()
print('\nTOKEN_FOR_USER_8:')
try:
    conn = sqlite3.connect('db.sqlite3')
    cur = conn.cursor()
    cur.execute('select key from authtoken_token where user_id=?', (8,))
    r = cur.fetchone()
    print(r[0] if r else 'NO_TOKEN')
    conn.close()
except Exception as e:
    print('error reading token for user 8', e)
