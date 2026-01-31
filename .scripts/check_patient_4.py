import sqlite3, pathlib, sys

db=pathlib.Path('D:/analisis_cabalistico_alma/backend/db.sqlite3')
if not db.exists():
    print("DB not found:", db)
    sys.exit(1)
con=sqlite3.connect(db)
cur=con.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%patient%';")
tables=[r[0] for r in cur.fetchall()]
print('tables=', tables)
found=False
for t in tables:
    try:
        cur.execute(f"PRAGMA table_info({t})")
        cols=[r[1] for r in cur.fetchall()]
        print('table:', t, 'cols:', cols)
        if 'user_id' in cols:
            cur.execute(f"SELECT id, user_id FROM {t} WHERE id=4")
            rows=cur.fetchall()
            print('rows for id=4 ->', rows)
            if rows:
                found=True
    except Exception as e:
        print('error reading', t, e)
if not found:
    print('no patient row with id=4 found in patient-like tables')
