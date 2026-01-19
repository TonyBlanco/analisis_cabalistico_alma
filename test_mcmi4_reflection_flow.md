# PRUEBA END-TO-END: MCMI-4 REFLECTION

## Objetivo
Validar el flujo completo: Asignación → SIGNAL → REFLEXIÓN → Workspace

## Pasos

### 1. TERAPEUTA: Asignar SIGNAL
- [ ] Login como terapeuta (Armando)
- [ ] Ir a `/dashboard/therapist/swm/mcmi4`
- [ ] Ver orquestador con "Luis Antonio Blanco Fontela" (ID: 4)
- [ ] Estado esperado:
  - Assignment: ⏳ Asignado (o ✅ si ya existe)
  - Señal: ✅ Completado (ID: 95)
  - Reflexión: ⭕ Pendiente
  - Workspace: ⛔ No creado
  - Acciones: "Esperando reflexión"

### 2. CONSULTANTE: Completar SIGNAL (ya hecho)
- [x] TestResult ID 95 existe
- [x] Schema: mcmi4-signal:v1
- [x] User ID: 18

### 3. CONSULTANTE: Completar REFLEXIÓN
- [ ] Login como consultante (Luis Antonio)
- [ ] Navegar a `/dashboard/patient/tests/mcmi4-reflection`
- [ ] Verificar:
  - [ ] Muestra 8 preguntas
  - [ ] Permite escribir en textareas
- [ ] Completar las 8 respuestas:
  - q1: "Quiero explorar mis patrones de relación con autoridad"
  - q2: "Noto que repito dinámicas de control vs vulnerabilidad"
  - q3: "Valoro la autenticidad y el respeto mutuo"
  - q4: "Mi relación conmigo es ambivalente, busco integración"
  - q5: "Fortaleza: capacidad analítica. Recursos: curiosidad genuina"
  - q6: "Experiencias de infancia con figuras parentales inconsistentes"
  - q7: "Espero comprensión profunda y herramientas para integración"
  - q8: "Necesito saber si mi autoexigencia es protectora o saboteadora"
- [ ] Click "Enviar Reflexión"
- [ ] Verificar:
  - [ ] Redirect a `/dashboard/patient?reflection_completed=true`
  - [ ] Si vuelves a `/dashboard/patient/tests/mcmi4-reflection`, debe mostrar "Ya completada"

### 4. VERIFICAR DB
```python
# Ejecutar verify_patient_4_results.py
# Debe mostrar:
# ✅ mcmi4-signal: 1 resultado(s)
# ✅ mcmi4-reflection: 1 resultado(s)
```

### 5. TERAPEUTA: Verificar orquestador actualizado
- [ ] Recargar `/dashboard/therapist/swm/mcmi4`
- [ ] Ver logs en consola (F12):
  ```
  [Orchestrator] Fetching signal for patient 4, user 18: ...
  [Orchestrator] Signal response for patient 4: Array(1)
  [Orchestrator] Found signal result ID 95 for patient 4
  ```
- [ ] Estado esperado en tabla:
  - Assignment: ✅ Completado
  - Señal: ✅ Completado (ID: 95)
  - Reflexión: ✅ Completado (ID: 96 o similar)
  - Workspace: ⛔ No creado
  - Acciones: **"Crear Workspace"** (botón HABILITADO, color púrpura)

### 6. TERAPEUTA: Crear Workspace
- [ ] Click "Crear Workspace"
- [ ] Verificar:
  - [ ] Spinner "Creando..."
  - [ ] Redirect a `/dashboard/therapist/swm/mcmi4/{workspace_id}`
- [ ] En workspace detail page:
  - [ ] Bloque "Señal MCMI-4" muestra resumen normalizado
  - [ ] Bloque "Reflexión del Consultante" muestra 8 preguntas/respuestas

### 7. TERAPEUTA: Volver a orquestador
- [ ] Ir a `/dashboard/therapist/swm/mcmi4`
- [ ] Estado final:
  - Assignment: ✅ Completado
  - Señal: ✅ Completado
  - Reflexión: ✅ Completado
  - Workspace: ✅ Creado (ID visible)
  - Acciones: "Abrir" (botón verde)

## Criterios de Éxito
- ✅ Consultante puede completar reflexión UNA VEZ
- ✅ Terapeuta ve ambos checkmarks (Señal + Reflexión)
- ✅ Botón "Crear Workspace" solo se habilita con ambos
- ✅ Workspace muestra ambas secciones (Señal + Reflexión)
- ✅ No hay errores en consola del navegador
- ✅ Build OK (sin errores de TypeScript/Django)

## Rollback (si falla)
```powershell
# Limpiar paciente 4
D:/analisis_cabalistico_alma/.venv/Scripts/python.exe clean_patient_4_data.py

# Revisar logs
# Backend: terminal Django (errores 500?)
# Frontend: consola navegador (errores fetch?)
```
