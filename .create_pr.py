import os, json, sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError

def main():
    token = os.environ.get('GHTOKEN')
    if not token:
        print('NO_TOKEN', file=sys.stderr); sys.exit(1)
    url = 'https://api.github.com/repos/TonyBlanco/analisis_cabalistico_alma/pulls'
    body = {
        'title': 'feat(ui): add isolated send-note block for patient notes',
        'head': 'feat/isolated-send-note-block',
        'base': 'main',
        'body': (
            'Resumen de cambios:\n'
            '- Añade bloque aislado "Enviar nota al paciente" (solo terapeutas).\n'
            '- No se modifica la sección "Notas integrativas".\n'
            '- Añade listado de notas en vista paciente (solo lectura).\n'
            '- Backend: normalización y endurecimiento de `patient_id`; pruebas de backend en verde.\n'
            'Migrations aplicadas.\n\n'
            'Checklist:\n- [ ] Capturas: terapeuta enviando nota\n- [ ] Capturas: paciente viendo nota\n'
        )
    }
    data = json.dumps(body).encode('utf-8')
    headers = {
        'Authorization': 'token ' + token,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
    }
    req = Request(url, data=data, headers=headers, method='POST')
    try:
        with urlopen(req, timeout=30) as resp:
            obj = json.load(resp)
            print(obj.get('html_url'))
    except HTTPError as e:
        try:
            err = e.read().decode('utf-8')
            print('HTTP_ERROR', e.code, err, file=sys.stderr)
        except Exception:
            print('HTTP_ERROR', e.code, file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
