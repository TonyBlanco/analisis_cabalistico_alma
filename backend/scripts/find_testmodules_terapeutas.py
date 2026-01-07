import sqlite3
import os

db = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'db.sqlite3')
phrases = ['terapeutas', 'Solo visible para terapeutas', 'solo visible para terapeutas']

con = sqlite3.connect(db)
cur = con.cursor()

# Get text-like columns
cur.execute("PRAGMA table_info('api_testmodule')")
cols = cur.fetchall()
text_cols = [c[1] for c in cols if c[2].upper() in ('TEXT','VARCHAR','CHAR')]
if not text_cols:
    text_cols = ['name', 'code', 'description', 'purpose', 'notes']

print('DB:', db)
print('Columns checked:', text_cols)

matches = []
for p in phrases:
    conds = [f"lower(ifnull({col},'')) LIKE '%{p.lower()}%'" for col in text_cols]
    where = ' OR '.join(conds)
    q = f"SELECT id, code, name, description FROM api_testmodule WHERE {where} ORDER BY id DESC"
    try:
        cur.execute(q)
        rows = cur.fetchall()
        for r in rows:
            matches.append((p, r))
    except Exception as e:
        print('Query error for phrase', p, e)

# Print results
if not matches:
    print('No TestModule rows matched the phrases')
else:
    print('Matches:')
    for p, r in matches:
        print(f"Phrase: {p} -> id={r[0]} code={r[1]} name={(r[2] or '')[:80]}")

con.close()
