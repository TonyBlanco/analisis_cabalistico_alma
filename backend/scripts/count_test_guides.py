import sqlite3
import os

db = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'db.sqlite3')
phrase = "Informacion pendiente para este instrumento"
phrase_l = phrase.lower()

con = sqlite3.connect(db)
cur = con.cursor()

# Inspect columns of api_testmodule
cur.execute("PRAGMA table_info('api_testmodule')")
cols = cur.fetchall()
text_cols = [c[1] for c in cols if c[2].upper() in ('TEXT','VARCHAR','CHAR')]
if not text_cols:
    # fallback common names
    text_cols = ['name', 'code', 'description', 'purpose', 'notes']

print('Searching DB:', db)
print('Text columns considered:', text_cols)

conds = []
for col in text_cols:
    conds.append(f"lower(ifnull({col}, '')) LIKE '%{phrase_l}%'")
where = ' OR '.join(conds)
query = f"SELECT id, code, name, description FROM api_testmodule WHERE {where} ORDER BY id DESC"

try:
    cur.execute(query)
    rows = cur.fetchall()
    print('Found', len(rows), 'matching TestModule(s)')
    for r in rows:
        print('-', r[0], r[1], '-', (r[2] or '')[:60].strip())
except Exception as e:
    print('Error executing query:', e)

con.close()
