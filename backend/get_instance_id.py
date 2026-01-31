import sqlite3
conn=sqlite3.connect('db.sqlite3')
cur=conn.cursor()
row=cur.execute("select id from swm_tarot_workspace_instance where status='in_progress' order by created_at desc limit 1").fetchone()
iid = row[0] if row else 'NONE'
print(repr(iid))
print('LENGTH:', len(iid) if iid!='NONE' else 0)
conn.close()
