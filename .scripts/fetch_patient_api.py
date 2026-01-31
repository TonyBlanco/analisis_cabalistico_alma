import sqlite3, pathlib, json, urllib.request, urllib.error

db=pathlib.Path('D:/analisis_cabalistico_alma/backend/db.sqlite3')
con=sqlite3.connect(db)
cur=con.cursor()
cur.execute('select key from authtoken_token order by user_id asc limit 1')
token=cur.fetchone()[0]
url='http://127.0.0.1:8000/api/patients/4/'
req=urllib.request.Request(url, headers={'Authorization':f'Token {token}'})
try:
    with urllib.request.urlopen(req, timeout=15) as r:
        b=r.read().decode('utf-8',errors='replace')
        print('STATUS', r.status)
        print(b)
except urllib.error.HTTPError as e:
    print('STATUS', e.code)
    print(e.read().decode('utf-8', errors='replace'))
except Exception as e:
    print('ERR', e)
