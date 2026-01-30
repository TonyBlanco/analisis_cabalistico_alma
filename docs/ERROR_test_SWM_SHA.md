# ERROR test SWM SHA — Incidente y acciones realizadas

Fecha: 2026-01-30
Autor: Ingeniero (registro automático)
Commit relacionado: 0c37a485 (WIP: SWM SHA module - tests failing, needs debug)

---

Resumen rápido
- Síntoma: Tests completados por el consultante no aparecían en el workspace del terapeuta.
- Evidencia: `TestResult` creado (ej. id=112) con `patient_id=None` y `details.audit.patient_id=None`; `Assignment` permanecía en `status='assigned'`.
- Impacto: Los terapeutas no veían resultados completados y el SWM no procesaba el flujo esperado.

Qué hice (acciones aplicadas)
1. Reproducción y diagnóstico
   - Inspeccioné la base de datos y objetos Django: `TestResult` con `patient_id=None`, `Assignment` con `status='assigned'`.
   - Verifiqué `profile.user_type` (era `patient`) y que existe exactamente 1 `Patient` vinculado (id=4) para ese usuario (user id=18).

2. Añadí logging temporal en `backend/api/test_views.py` alrededor de la creación de `TestResult` y la actualización de `Assignment` para capturar valores de `patient_for_result`, `execution_mode`, `test_module.code` y resultados del query `Patient.objects.filter(user=request.user, is_active=True)`.
   - Objetivo: mostrar en logs si la lookup del `Patient` ocurre y por qué `patient_for_result` resulta `None`.

3. Encontré e hice correcciones relacionadas con constraints de base de datos para el reset de assignments
   - Problema: `AssignmentResetView` intentaba poner `raw_responses=None` y `responses_hash=None` pero la tabla tiene constraints `NOT NULL`.
   - Arreglo: usar `assignment.raw_responses = {}` y `assignment.responses_hash = ''` antes de `save()`.

4. Reparaciones manuales en DB para restaurar estado de pruebas
   - Vinculé `TestResult` problemáticos al `Patient` correcto (ej. `tr.patient = patient`) y guardé.
   - Actualicé `Assignment` correspondientes a `status='completed'` y `results` con `TestResult.result_data`.
   - Limpié la cuenta de prueba (user id=18): borré `TestResult`, `Assignment` y `WorkspaceInstance` relacionados para dejar la cuenta limpia para repro.

5. Revisión y revert
   - Detecté que yo había creado un cuestionario AUDIT (SHA Harmony) de forma equivocada (no correspondía a tu SWM). Retiré esa implementación provisional y eliminé la carpeta creada.

6. Reinicié servicios para cargar cambios
   - Reinicié los procesos de backend/frontend (`start-all.ps1`) para asegurar que las modificaciones en código y logs se apliquen.

Archivos modificados/creados (resumen)
- Modificado: `backend/api/test_views.py` — añadido logging y lógica relacionada al `patient_for_result` y actualización de `Assignment`.
- Modificado: `backend/api/assignments.py` — `AssignmentResetView` corregido para respetar NOT NULL (usar `{}` y `''`).
- Creado temporalmente y luego revertido: `tonyblanco-app/app/(dashboard)/dashboard/patient/tests/sha-harmony/*` (cuestionario erroneamente creado) — fue eliminado.
- Creado: `docs/ERROR_test_SWM_SHA.md` (este documento).
- Commit registrado: `0c37a485` (WIP con cambios y logs).

Comandos ejecutados (resumen reproducible)
- Ejecuté scripts Django para inspección y reparación directa (ejemplos):

```bash
cd backend
..\.venv\Scripts\python.exe -c "from api.test_models import TestResult; tr = TestResult.objects.get(id=112); tr.patient = ...; tr.save()"
..\.venv\Scripts\python.exe -c "from api.test_models import Assignment; a = Assignment.objects.get(id=28); a.status='completed'; a.results = ...; a.save()"
```

- Limpié la cuenta de prueba (user id=18): borrado de `TestResult`, `Assignment` y `WorkspaceInstance` mediante script Django (ejecutado desde `backend`).
- Reinicié la app con: `.\start-all.ps1` (PowerShell)

Diagnóstico del root cause (hipótesis)
- El código en `test_views.py` tenía la lógica correcta para inferir `execution_mode` y para buscar `Patient` cuando `execution_mode == 'patient_self'`.
- En pruebas manuales el lookup `Patient.objects.filter(user=request.user, is_active=True)` funcionó y devolvió exactamente 1 paciente.
- Se determinó que en los requests reales el `TestResult` se creó con `patient=None` y el `details.audit.patient_id` quedó en `None`. Posibles causas detectadas:
  - El endpoint se estaba ejecutando en un proceso de servidor que no tenía los cambios más recientes (necesitaba restart).
  - Errores silenciosos/exception swallowing: se capturaron excepciones en bloques try/except que pudieron ocultar fallos puntuales.
  - Constraints NOT NULL en `Assignment` provocaron errores al hacer reset y generaron errores 500 si no se manejaban apropiadamente.

Acciones pendientes / pasos recomendados para mañana (debug completo)
1. Reproducir paso a paso desde ambiente limpio:
   - Crear assignment desde workspace terapeuta para `sha_harmony` (o el SWM real que corresponda).
   - Logear cronológicamente: request del terapeuta, assignment creado, request del paciente (POST a `/api/tests/execute/`), contenido del payload y headers.
   - Confirmar entrada en DB de `TestResult` y valores en `details.audit` inmediatamente tras la request.

2. Habilitar logging a DEBUG en Django temporalmente (si es posible) o capturar stdout de proceso que corre Django para el entorno donde ocurren los requests (asegurar que se capture el logger añadido en `test_views.py`).

3. Añadir pruebas de integración automatizadas que:
   - Simulen autenticación del paciente (user id=18), envíen el POST a `/api/tests/execute/` con `test_module_code='sha_harmony'` y `responses` y validen que `TestResult.patient` y `Assignment.status` se actualizan.

4. Revisar y limpiar excepciones que silencien errores críticos (evitar except: pass sin log detallado).

5. Validar en código que `patient_for_result` nunca sea `None` al crear `TestResult` si `profile.user_type == 'patient'` y existe exactamente 1 `Patient` activo vinculado.

6. Establecer un pequeño script de comprobación que corra tras cada ejecución de test (hook o job ligero) y envíe alertas si aparece `TestResult` sin `patient_id`.

Plantilla de prompt para la sesión de debug completa mañana (para usar con agente)

```
Prompt: Debug SWM SHA — fallos de sincronización patient→therapist
Context: repo local en d:/analisis_cabalistico_alma, servidor dev iniciado con start-all.ps1
Objetivo: identificar por qué algunos `TestResult` creados por usuarios con `user_type='patient'` quedan con `patient_id=None` y no actualizan `Assignment`.
Tareas a ejecutar:
 1. Reproducir en dev: crear assignment desde terapeuta, completar como paciente (capturar request y response). Guardar payload completo.
 2. Revisar logs de `backend/api/test_views.py` (mensajes `[SWM]`) para el request en cuestión.
 3. Verificar si el proceso Django que ejecutó la request corrió la versión de código con los logs (posible proceso antiguo sin reiniciar).
 4. Añadir test automatizado que simule flujo y falle si `TestResult.patient is None`.
 5. Documentar hallazgos en `docs/ERROR_test_SWM_SHA.md` y proponer PR con correcciones.

Adjunta: rutas a los archivos modificados y commit id `0c37a485`.
```

Notas finales
- Restauré y limpié datos de prueba para `user id=18` para dejar un estado reproducible.
- Evité dejar el cuestionario AUDIT (alcohol) en el repo; se eliminó la carpeta creada por error.
- El caso está documentado y el plan está en la lista TODO (ver tool de TODOs interno).

Si quieres, mañana empiezo por: 1) reproducir el fallo en vivo y capturar logs; 2) escribir el test de integración; 3) endurecer el manejo de errores y añadir alertas para TestResults sin `patient_id`.

---

Archivo: `docs/ERROR_test_SWM_SHA.md` creado en el repositorio con este contenido.
