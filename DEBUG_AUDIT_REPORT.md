# 🩺 Auditoría Debug: Frontend <-> Backend

He analizado la integración entre `TestCatalogSection.tsx` (Frontend) y el backend (`test_views.py`, `test_api.ts`), encontrando los siguientes puntos críticos, desde errores funcionales potenciales hasta "code smells".

## 🔴 1. Error Funcional: Asignación a Pacientes sin Usuario
El backend (`AssignTestToPatientView`) **bloquea la asignación** si el paciente no tiene una cuenta de usuario (`User`) vinculada.

- **Código Backend:**
  ```python
  if not getattr(patient, 'user', None):
      return Response({ ... 'error': 'Paciente sin cuenta de usuario' ... }, status=400)
  ```
- **Impacto:** Si creas un paciente manualmente en el dashboard sin email/invitación, intentar asignarle un test fallará.
- **Frontend:** El error se captura y muestra en un `toast`, pero no hay validación previa en la UI (el botón "Asignar" está habilitado aunque el paciente no tenga usuario).

## 🟠 2. Contaminación de Logs (Logging Pollution)
El endpoint `AssignTestToPatientView` está configurado para loguear **cada paso normal** como un `ERROR`. Esto dificulta la monitorización real de errores.

- **Ubicación:** `backend/api/test_views.py`
- **Evidencia:**
  ```python
  logger.error("ASSIGN_TEST: step 1 - request received")
  logger.error(f"ASSIGN_TEST: step 3 - payload received ...")
  logger.error("ASSIGN_TEST: step 9 - success")
  ```
- **Recomendación:** Cambiar `logger.error` por `logger.info` o `logger.debug`.

## 🟡 3. Ineficiencia en Búsqueda de Tests (Loop en Python)
Para encontrar el test a asignar, el backend descarga **toda la tabla** `TestModule` y filtra en memoria usando Python, en lugar de usar una consulta SQL eficiente.

- **Ubicación:** `AssignTestToPatientView` (step 6)
- **Código Ineficiente:**
  ```python
  for t in TestModule.objects.all():  # ⚠️ Descarga TODO a memoria
      if _normalize(getattr(t, 'code', '')) == norm:
          candidates.append(t)
  ```
- **Riesgo:** Aunque hoy hay pocos tests, esto es una mala práctica que escala mal. Debería usar `TestModule.objects.filter(code__iexact=...)`.

## 🟡 4. Discrepancia en Serialización (`execution_mode`)
El frontend espera o intenta inferir `execution_mode`, pero el backend no lo envía en el `TestModuleSerializer`.

- **Frontend (`TestCatalogSection.tsx`):**
  ```typescript
  type CatalogTest = TestModule & { execution_mode?: string; ... };
  // ...
  const isClinical = test.execution_mode === 'therapist_clinical' ...
  ```
- **Backend (`test_serializers.py`):**
  `fields = ['id', 'code', ...]` (Falta `execution_mode`).
- **Consecuencia:** El frontend siempre cae en la lógica de inferencia basada en `available_for_therapists`. Funciona por ahora, pero es frágil si la lógica de negocio cambia.

## 🟢 5. Estado "Asignado" Desaparece al Completar
Cuando un paciente completa un test, este deja de aparecer como "Asignado" en el catálogo (porque `getPatientPreviousTests` separa asignaciones pendientes de resultados).
- **Comportamiento:** El botón vuelve a mostrarse como "Asignar".
- **Nota:** Esto puede ser intencional (permitir re-asignar), pero pierde el histórico visual de "Este test ya fue asignado y completado".

---

## 🛠️ Acciones Recomendadas

1.  **Limpiar Logs:** Corregir `AssignTestToPatientView` para no usar `logger.error` en flujo exitoso.
2.  **Optimizar Query:** Reemplazar el loop `TestModule.objects.all()` por filtros `iexact` o `__in`.
3.  **UI Feedback:** Si el paciente activo no tiene usuario vinculado, deshabilitar el botón "Asignar" o mostrar advertencia.
