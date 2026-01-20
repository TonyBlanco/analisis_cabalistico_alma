import sqlite3, json
db='d:/analisis_cabalistico_alma/backend/db.sqlite3'
conn=sqlite3.connect(db)
cur=conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
rows=cur.fetchall()
print(json.dumps([r[0] for r in rows], indent=2))
candidates=[r[0] for r in rows if 'result' in r[0].lower() or 'test' in r[0].lower()]
print('candidates:', candidates)
for name in candidates[:50]:
    try:
        cur.execute(f"SELECT * FROM {name} LIMIT 5")
        cols=[d[0] for d in cur.description] if cur.description else []
        rows=cur.fetchall()
        print('\nTABLE',name,'COLUMNS:',cols)
        for row in rows:
            print(row)
    except Exception as e:
        print('error reading',name,e)
conn.close()
