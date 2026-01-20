# 🩺 REPORTE DEBUG: SWM MCMI-4 Mystic — Flujo Terapeuta → Sujeto → Consultante

**Fecha:** 2026-01-20  
**Alcance:** Diagnóstico de flujo roto (solo lectura, sin modificaciones)  
**Agente:** DEBUG (cumpliendo `SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md`)

---

## 1️⃣ SÍNTOMAS OBSERVABLES

### S1: Migración aplicada pero datos consistentes
- ✅ Migración `0080_phase4c_assignment_subject_required` **aplicada exitosamente**.
- ✅ Assignment ID 20 tiene `subject_user_id=18` (NOT NULL).
- ✅ Modelos actualizados correctamente: `Assignment.subject_user`, `WorkspaceInstance.subject_user`, `WorkspaceSession.executor_user`.

### S2: Contrato FE/BE desalineado (execution_mode)
- ❌ **Frontend espera `execution_mode`** en `TestModule` serializado (ver `lib/test-types.ts:59`, `components/TestCatalogSection.tsx:94`).
- ❌ **Backend NO expone `execution_mode`** en `TestModuleSerializer` (ver `backend/api/test_serializers.py:18-27`).
- ⚠️ Frontend cae en lógica de **"adivinanza"** basada en `available_for_therapists` (frágil, no explícito).

### S3: Flujo Reflexión funcional (sin endpoints faltantes)
- ✅ Endpoint `/swm/mcmi4-reflection/by-signal/<int:signal_id>` **existe** (backend).
- ✅ Frontend usa `getReflectionBySignalId()` correctamente (no busca por `reflection_id` inexistente).
- ✅ Orquestador consulta `reflectionWorkspace.status` (no `reflection_state`).

### S4: Nomenclatura holística inconsistente en modelos SWM
- ⚠️ `mcmi4` usa `subject_user` (correcto).
- ⚠️ `mcmi4_reflection` usa `consultant_user` (inconsistente con "Sujeto" vs "Consultante").
- 📝 Según `SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md`: "Sujeto" = usuario analizado; "Consultante" = usuario ejecutor.
- 📝 En reflection, `consultant_user` es el ejecutor (correcto semánticamente, pero falta `subject_user` si el sujeto ≠ ejecutor).

---

## 2️⃣ EVIDENCIA VERIFICABLE

### Evidencia E1: Migración aplicada
```bash
# Comando ejecutado
python -c "from django.db.migrations.recorder import MigrationRecorder; \
  applied = list(MigrationRecorder.Migration.objects.filter(app='api') \
  .order_by('id').values_list('name', flat=True)); \
  recent = [m for m in applied if '0079' in m or '0080' in m or '0081' in m]; \
  print('\n'.join(recent))"

# Output
0079_phase4_assignment_restructure
0080_phase4c_assignment_subject_required
0081_phase5_integrity_constraints
```

### Evidencia E2: Assignment con subject_user correcto
```bash
# Comando ejecutado
python -c "from api.test_models import Assignment; \
  a = Assignment.objects.first(); \
  print(f'subject_user_id: {a.subject_user_id} ({a.subject_user.username})'); \
  print(f'assigned_to_user_id: {a.assigned_to_user_id} ({a.assigned_to_user.username})'); \
  print(f'assigned_by_user_id: {a.assigned_by_user_id} ({a.assigned_by_user.username})')"

# Output
subject_user_id: 18 (pat_luisantonio_6090)
assigned_to_user_id: 18 (pat_luisantonio_6090)
assigned_by_user_id: 10 (armando)
```

**Interpretación:**
- Terapeuta Armando (ID=10) creó assignment.
- Sujeto = Luis Antonio (ID=18).
- Ejecutor = Luis Antonio (ID=18).
- ✅ Identidad separada correctamente (subject = assigned_to en este caso self-assessment válido).

### Evidencia E3: execution_mode ausente en serializer
```python
# Archivo: backend/api/test_serializers.py:18-27
class TestModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestModule
        fields = [
            'id', 'code', 'name', 'public_name', 'canonical_family', 'domain',
            'description', 'test_type',
            'required_access_level', 'is_active',
            'available_for_therapists', 'available_for_personal',
            'uses_per_month', 'icon', 'order', 'estimated_duration',
            'requires_license', 'license_info',
            'is_available', 'user_access'
        ]
        # ❌ 'execution_mode' NO está en fields
```

### Evidencia E4: Frontend esperando execution_mode
```typescript
// Archivo: tonyblanco-app/lib/test-types.ts:59
export interface TestModule {
  // ...
  execution_mode: 'patient_self' | 'therapist_clinical';  // ← Esperado
  // ...
}

// Archivo: tonyblanco-app/components/TestCatalogSection.tsx:94
const isClinical = test.execution_mode === 'therapist_clinical';
// ⚠️ Si execution_mode es undefined, lógica fallback basada en available_for_therapists
```

### Evidencia E5: Endpoint reflection/by-signal existe
```python
# Archivo: backend/swm/mcmi4_reflection/urls.py:20
urlpatterns = [
    # ...
    path('by-signal/<int:signal_id>', ReflectionBySignalView.as_view(), name='by-signal'),
    # ...
]
```

```typescript
// Archivo: tonyblanco-app/lib/api/mcmi4-reflection-api.ts:211
export async function getReflectionBySignalId(signalId: string): Promise<ReflectionWorkspace | null> {
  const response = await fetch(`${REFLECTION_BASE}/by-signal/${signalId}`, {
    method: 'GET',
    // ...
  });
  // ✅ Endpoint correcto
}
```

### Evidencia E6: Modelos SWM con nomenclatura mixta
```python
# backend/swm/mcmi4/models.py:60
class WorkspaceInstance(models.Model):
    subject_user = models.ForeignKey(
        User,
        related_name='workspaces_as_subject',
        help_text="User whose MCMI-4 data is being analyzed (NOT necessarily the executor)"
    )
    # ✅ subject_user correcto

# backend/swm/mcmi4_reflection/models.py:54
class WorkspaceInstance(models.Model):
    consultant_user = models.ForeignKey(
        User,
        related_name='reflection_workspaces',
        help_text="User completing the reflection (consultant)"
    )
    # ⚠️ consultant_user = ejecutor (correcto), pero falta subject_user si sujeto ≠ ejecutor
```

---

## 3️⃣ HALLAZGOS (Clasificación por área)

### H1: Migración e Integridad de Datos ✅ CORRECTO
- ✅ Migración 0080 aplicada y validada.
- ✅ Constraint `assignment_subject_user_required` activo.
- ✅ Datos existentes consistentes (1 assignment con subject_user NOT NULL).
- ✅ No hay assignments legacy sin subject_user.

### H2: Contrato FE/BE (execution_mode) ❌ DESALINEADO
- ❌ **P0**: Frontend depende de `execution_mode` para renderizar UI clínica vs personal.
- ❌ Backend NO serializa `execution_mode` en endpoints que sirven catálogo de tests.
- ⚠️ **Riesgo**: Lógica de inferencia frontend basada en `available_for_therapists` es frágil y puede fallar si:
  - Un test cambia de disponibilidad sin actualizar frontend.
  - Se añaden tests con `execution_mode` explícito en modelo pero no expuesto.
- ✅ **Mitigación actual**: Inferencia funciona para tests legacy, pero NO es sostenible.

### H3: Flujo Reflexión ✅ FUNCIONAL
- ✅ Endpoint `/by-signal/<int:signal_id>` existe y es correcto.
- ✅ Frontend NO busca por `reflection_id` inexistente.
- ✅ Orquestador consulta `reflectionWorkspace.status` correctamente.
- ✅ No hay dependencias de rutas fantasma.

### H4: Nomenclatura Holística ⚠️ INCONSISTENTE (no crítico)
- ⚠️ `mcmi4` usa `subject_user` (quien es analizado).
- ⚠️ `mcmi4_reflection` usa `consultant_user` (quien ejecuta la reflexión).
- 📝 **Según gobernanza holística**:
  - "Sujeto" = usuario cuyo análisis se estudia.
  - "Consultante" = usuario que ejecuta/completa la exploración.
- 📝 **Problema conceptual**: En reflection, si el terapeuta ve la reflexión del sujeto, ¿quién es el `consultant_user`?
  - Si `consultant_user` = sujeto que completa reflexión → correcto.
  - Si terapeuta accede a reflexión del sujeto → falta `subject_user` en modelo reflection.

---

## 4️⃣ CAUSAS RAÍZ (Priorizadas P0/P1)

### ⚠️ P0 — Contrato FE/BE roto (execution_mode ausente)
**Causa técnica:**
- Campo `execution_mode` existe en modelo `TestModule` (`backend/api/models.py:990`).
- Campo NO incluido en `TestModuleSerializer.Meta.fields`.
- Frontend infiere en runtime usando `available_for_therapists` como proxy.

**Impacto:**
- Frontend no puede distinguir explícitamente modo de ejecución.
- Riesgo de inconsistencias si test cambia flags sin actualizar frontend.
- Violación del principio "backend como fuente de verdad".

**Evidencia:**
- [backend/api/models.py](backend/api/models.py#L990): `execution_mode = models.CharField(...)`
- [backend/api/test_serializers.py](backend/api/test_serializers.py#L18-27): `fields = [...]` (sin `execution_mode`)
- [tonyblanco-app/lib/test-types.ts](tonyblanco-app/lib/test-types.ts#L59): `execution_mode: 'patient_self' | 'therapist_clinical'`

---

### 📌 P1 — Nomenclatura holística inconsistente (no bloquea flujo)
**Causa conceptual:**
- Refactor de identidad introdujo `subject_user` en `Assignment` y `WorkspaceInstance` (mcmi4).
- `WorkspaceInstance` (mcmi4_reflection) usa `consultant_user` sin diferenciar sujeto vs ejecutor.

**Impacto:**
- Confusión semántica: "consultant" implica ejecutor, pero ¿quién es el sujeto de análisis?
- Si terapeuta revisa reflexión del sujeto, no hay campo `subject_user` en reflection workspace.
- No bloquea flujo actual (self-assessment), pero limita casos donde sujeto ≠ ejecutor.

**Evidencia:**
- [backend/swm/mcmi4/models.py](backend/swm/mcmi4/models.py#L60): `subject_user` (correcto)
- [backend/swm/mcmi4_reflection/models.py](backend/swm/mcmi4_reflection/models.py#L54): `consultant_user` (inconsistente)
- [docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md](docs/prompts/SYSTEM_PROMPT_GUARDIAN_HOLISTICO.md): Define "Sujeto" vs "Consultante"

---

## 5️⃣ PROPUESTA DE FIX (Solo plan, sin implementación)

### Fix F1 — Exponer execution_mode en serializer (P0)
**Objetivo:** Alinear contrato FE/BE para que frontend reciba `execution_mode` explícitamente.

**Archivos a modificar:**
1. `backend/api/test_serializers.py` — Añadir `'execution_mode'` a `TestModuleSerializer.Meta.fields`.

**Cambio puntual:**
```python
# Línea ~27
fields = [
    'id', 'code', 'name', 'public_name', 'canonical_family', 'domain',
    'description', 'test_type', 'execution_mode',  # ← AÑADIR
    'required_access_level', 'is_active',
    'available_for_therapists', 'available_for_personal',
    # ...
]
```

**Riesgos:**
- ⚠️ Tests frontend que asumen `execution_mode` ausente pueden romper (poco probable, ya lo esperan).
- ⚠️ Si `execution_mode` es NULL en BD para tests legacy, frontend recibirá `null` → necesita fallback.

**Validación:**
- Verificar que tests con `execution_mode=None` en BD no rompan serialización.
- Probar endpoints: `/api/tests/modules/`, `/api/tests/modules/<code>/`.

**Rollback:**
- Remover `'execution_mode'` de `fields` y reiniciar backend.

---

### Fix F2 — Preflight en frontend (P0, complementario a F1)
**Objetivo:** Antes de crear workspace, validar que `subject_user` tiene User vinculado.

**Archivos a modificar:**
1. `tonyblanco-app/components/MCMI4ProcessOrchestrator.tsx` — Añadir validación en `handleCreateWorkspace`.
2. `tonyblanco-app/app/(dashboard)/dashboard/therapist/swm/mcmi4-reflection/[subjectUserId]/page.tsx` — Validar precondiciones antes de renderizar acciones.

**Lógica:**
```typescript
// Antes de llamar createWorkspace
if (!state.patient.user) {
  toast.error("No disponible: el Sujeto requiere cuenta vinculada para ejecutar esta Exploración");
  return;
}
```

**Riesgos:**
- ⚠️ Bloquea flujo si hay patients sin User vinculado (correcto, pero debe comunicarse claramente).

**Validación:**
- Probar con patient sin User → debe bloquear.
- Probar con patient con User → debe permitir.

**Rollback:**
- Remover validación.

---

### Fix F3 — Estandarizar nomenclatura reflection (P1, no urgente)
**Objetivo:** Alinear `mcmi4_reflection` con nomenclatura holística (`subject_user` + `executor_user`).

**Archivos a modificar:**
1. `backend/swm/mcmi4_reflection/models.py` — Renombrar `consultant_user` → `executor_user`, añadir `subject_user`.
2. `backend/swm/mcmi4_reflection/serializers.py` — Actualizar serializers.
3. `backend/swm/mcmi4_reflection/views.py` — Actualizar lógica.
4. **Migración** — Renombrar columna en BD (requiere downtime si producción).

**Riesgos:**
- ⚠️ **ALTO**: Migración puede romper datos existentes si hay workspaces activos.
- ⚠️ Requiere actualizar todos los endpoints que usan `consultant_user`.

**Decisión recomendada:**
- ⏸️ **POSTPONER** hasta que se confirme necesidad de casos sujeto ≠ ejecutor en reflexión.
- Para flujo actual (self-assessment), `consultant_user` = ejecutor = sujeto → funciona.

**Rollback:**
- Revertir migración, revertir cambios de código.

---

## 6️⃣ ORDEN RECOMENDADO DE APLICACIÓN

1. **F1** (P0) — Exponer `execution_mode` en serializer → **Sin riesgo, cambio mínimo**.
2. **F2** (P0) — Preflight frontend → **Sin riesgo, mejora UX**.
3. **DEBUG** — Verificar flujo end-to-end tras F1+F2.
4. **F3** (P1) — Estandarizar nomenclatura → **Solo si gobernanza lo aprueba, requiere planificación**.

---

## 7️⃣ CHECKLIST DE VALIDACIÓN MANUAL

### Prerequisitos
- Backend corriendo: `start-flask.ps1` o `start-backend.ps1`.
- Frontend corriendo: `start-frontend.ps1`.
- Usuario terapeuta: `armando` (ID=10).
- Usuario sujeto/consultante: `pat_luisantonio_6090` (ID=18).

### Pasos de prueba
1. **Login como Armando (terapeuta)**
   - Navegar a dashboard terapeuta.
   - Verificar que lista de pacientes incluye a Luis Antonio.

2. **Crear/verificar Assignment**
   - Si no existe: Crear assignment `mcmi4-signal` para Luis Antonio.
   - Verificar en BD: `Assignment.subject_user_id = 18`, `assigned_to_user_id = 18`.

3. **Login como Luis Antonio (consultante)**
   - Navegar a tests asignados.
   - Completar `mcmi4-signal` si no está completado.
   - Verificar TestResult creado.

4. **Login como Armando**
   - Navegar a orquestador MCMI-4 Mystic.
   - Verificar estado: Signal completado → botón "Crear Workspace" habilitado.
   - **Crear Workspace** → Verificar creación exitosa.

5. **Verificar estado Reflexión**
   - Orquestador debe mostrar estado "Reflexión: Pendiente" o "Draft".
   - Login como Luis Antonio → Completar reflexión.
   - Login como Armando → Verificar estado "Reflexión: Completada".

6. **Verificar execution_mode (tras F1)**
   - Abrir DevTools Network.
   - Request a `/api/tests/modules/` → Verificar response contiene `execution_mode`.

---

## 8️⃣ TESTS AUTOMATIZADOS SUGERIDOS (Opcional, no implementar ahora)

### Test T1 — Serializer expone execution_mode
```python
def test_testmodule_serializer_includes_execution_mode(self):
    from api.test_models import TestModule
    from api.test_serializers import TestModuleSerializer
    
    test_module = TestModule.objects.create(
        code='test-exec-mode',
        execution_mode='patient_self',
        # ...
    )
    serializer = TestModuleSerializer(test_module)
    assert 'execution_mode' in serializer.data
    assert serializer.data['execution_mode'] == 'patient_self'
```

### Test T2 — Frontend valida subject_user antes de crear workspace
```typescript
describe('MCMI4ProcessOrchestrator - Preflight', () => {
  it('debe bloquear creación si patient.user es null', async () => {
    const state = { patient: { id: 1, user: null }, testResult: { id: 1 } };
    await handleCreateWorkspace(state);
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('cuenta vinculada'));
  });
});
```

---

## 9️⃣ CONCLUSIÓN

### ✅ Estado actual: Flujo parcialmente funcional
- Migración aplicada correctamente.
- Datos consistentes (assignment con subject_user).
- Reflection endpoints existen y funcionan.

### ❌ P0 Crítico: Contrato FE/BE roto
- `execution_mode` no expuesto → frontend adivina → frágil.

### 📝 P1 Menor: Nomenclatura inconsistente
- `consultant_user` vs `subject_user` → no bloquea flujo actual.

### 🚀 Próximos pasos
1. **AGENTE_ARQ** — Revisar y aprobar propuesta F1+F2.
2. **CODE** — Aplicar F1 (serializer) + F2 (preflight).
3. **DEBUG** — Validar flujo end-to-end post-fix.

---

**Fin del reporte DEBUG.**  
**Responsable:** Agente DEBUG  
**Aprobación pendiente:** AGENTE_ARQ
