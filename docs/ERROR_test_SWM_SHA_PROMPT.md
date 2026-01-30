PROMPT: Debug completo — ERROR test SWM SHA

Objetivo
--------
Actúa como agente técnico y sigue estas instrucciones para diagnosticar y resolver el fallo en el flujo SWM SHA donde los `TestResult` creados por consultantes quedan sin `patient_id` y los `Assignment` no se actualizan a `completed`.

Contexto (resumen)
-------------------
- Repo: d:/analisis_cabalistico_alma
- Entorno: Django (backend) + Next.js (frontend). Dev runner: `./start-all.ps1`.
- Usuario de prueba: `id=18` (username: pat_luisantonio_6090), Patient vinculado `id=4`.
- Síntoma: `TestResult` (ej. id=112) creado por el consultante con `patient_id=None`. `Assignment` asociado (ej. id=28) quedó en `status='assigned'`.
- Cambios previos: se añadieron logs temporales en `backend/api/test_views.py` y se corrigió `AssignmentResetView` para NOT NULL. Se realizaron arreglos manuales en BD y una limpieza del usuario de prueba.
- Documento base: `docs/ERROR_test_SWM_SHA.md` (resumen y acciones realizadas).

Restricciones
-------------
- No modifiques permanentemente contratos SWM sin consultar `docs/`.
- Evita cambios a producción; trabaja en entorno dev local.
- Preserva trazabilidad: cada cambio va con commit claro.

Resultado esperado
------------------
1. Reproducir en entorno dev el fallo: asignar test desde terapeuta, completar como paciente y observar si `TestResult.patient_id` queda NULL.
2. Identificar la causa raíz (código, race, proceso sin reiniciar, excepción oculta, payload faltante, etc.).
3. Proponer y aplicar la corrección mínima necesaria y segura, añadir tests automatizados que cubran el caso.
4. Documentar hallazgos y soluciones en `docs/ERROR_test_SWM_SHA.md` y crear/actualizar tests en `backend/tests/`.

Pasos (ejecución)
------------------
1. Preparación
   - Asegúrate de que los servicios estén corriendo: reinicia con:

```powershell
cd d:\analisis_cabalistico_alma
.\start-all.ps1
```

   - Abre una consola para ver logs de Django (o ejecuta `python manage.py runserver` en un terminal aparte para capturar stdout).

2. Reproducción manual guiada
   - En workspace terapeuta (UI): crea una asignación para `sha_harmony` al paciente (o usa API):

```python
# desde backend/python shell
from api.test_models import Assignment
from api.models import Patient
from django.contrib.auth import get_user_model
User = get_user_model()
patient = Patient.objects.get(id=4)
armando = User.objects.get(username='armando')
Assignment.objects.create(patient=patient, test_type='sha_harmony', assigned_by_user=armando, assigned_to_user=patient.user, questions=[], results={}, raw_responses={}, responses_hash='')
```

   - En el navegador, con sesión del paciente, abre `Tests Pendientes` y ejecuta el flujo (debe abrir la página de asignaciones y permitir enviar respuestas). Registra exactamente el payload enviado al endpoint `/api/tests/execute/`.

   - Observa los logs de Django mientras se ejecuta la request y captura las líneas añadidas (mensajes con prefijo `[SWM]`).

3. Inspección post-request
   - Inmediatamente después de la POST, examina en BD:

```python
from api.test_models import TestResult, Assignment
tr = TestResult.objects.latest('created_at')
print(tr.id, tr.patient_id, tr.details)
# y la assignment relacionada
a = Assignment.objects.filter(patient__user=tr.user, test_type__iexact='sha_harmony').order_by('-created_at').first()
print(a.id, a.status, a.results)
```

4. Evaluación de hipótesis
   - Si `tr.patient_id is None`:
     - Comprueba si el código llegó al bloque de lookup del Patient (logs `[SWM] Patient lookup for user ...`).
     - Si no hay log, puede indicar que la request fue servida por un proceso sin la versión de código con logging: reinicia servidores y repite.
     - Si está el log y `patient_qs.count()` es 1 pero `patient_for_result` sigue None al guardado, inspecciona si `patient_for_result` se sobrescribe después o si `TestResult.objects.create` usa otro valor por error.
   - Revisa excepciones silenciosas en `test_views.py` (try/except) y reemplaza `except Exception: pass` por logging explícito.

5. Corrige y prueba
   - Aplica la corrección mínima en `backend/api/test_views.py` (si aplica): asegurar que `patient_for_result` sea asignado cuando se detecte `profile.user_type=='patient'` y exista 1 `Patient`.
   - Añade/actualiza logs que muestren `patient_for_result.id` justo antes de crear `TestResult`.
   - Añade test de integración: nuevo archivo `backend/tests/test_execute_patient_self.py` que simule autenticación patient y verifique que `TestResult.patient` se guarda.

6. Commit y documentación
   - Commit con mensaje claro: `fix: ensure TestResult.patient set for patient_self executions; add integration test`.
   - Actualiza `docs/ERROR_test_SWM_SHA.md` con root cause y pasos de corrección realizados.

Archivos y rutas clave
----------------------
- `backend/api/test_views.py` (punto principal de ejecución)
- `backend/api/assignments.py` (reset endpoint y constraints)
- `backend/api/test_models.py` (models `TestResult`, `Assignment`)
- `docs/ERROR_test_SWM_SHA.md` (documentación del incidente)
- UI: `tonyblanco-app/components/SHAWorkspace/index.tsx` y `components/PendingAssignmentsSection.tsx`

Comandos útiles
---------------
- Django shell rápido:

```powershell
cd d:\analisis_cabalistico_alma\backend
..\.venv\Scripts\python.exe manage.py shell
```

- Ejecutar un script Python directo:

```powershell
..\.venv\Scripts\python.exe my_script.py
```

- Reiniciar servicios:

```powershell
cd d:\analisis_cabalistico_alma
.\start-all.ps1
```

Criterios de aceptación
-----------------------
- Flows reproducidos en dev que terminan con `TestResult.patient` no-NULL y `Assignment.status == 'completed'` sin intervención manual.
- Tests automáticos que fallan si el bug regresa.
- Documentación actualizada con root cause y pasos para evitar regresión.

Si quedas atascado
------------------
- Captura el `payload` HTTP completo (headers y body) y pega aquí.
- Adjunta las líneas de log `[SWM]` y el `traceback` si hay 500.

Acción final esperada
---------------------
- Genera un PR con correcciones y tests; deja el `TODO` actualizado.
- Actualiza `docs/ERROR_test_SWM_SHA.md` con hallazgos finales y cierra la issue.

---

Usa este prompt como entrada para un agente (puedes pegarlo entero en la conversación). El agente debe pedir permisos antes de hacer cambios destructivos (borrados masivos) y siempre crear commits claros con estado WIP o FIX.
