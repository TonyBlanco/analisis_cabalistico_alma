# 🏗️ Arquitectura de Flujos de Ejecución de Tests

## 📋 Principio Fundamental

**DOS FLUJOS SEPARADOS E INMUTABLES**

Existen DOS Y SOLO DOS flujos de ejecución de tests que NUNCA deben mezclarse:

### FLOW A — Patient Self-Administered Tests
- Asignados por terapeuta
- Ejecutados por el usuario en su portal
- Resultados revisados por el terapeuta

### FLOW B — Therapist-Led Clinical Evaluations
- Iniciados y ejecutados SOLO por el terapeuta
- NUNCA asignados al usuario
- NUNCA aparecen en el portal del usuario
- Guardados directamente como registros holísticos

---

## 🎯 Clasificación de Tests

### Sistema de Clasificación

Todos los tests están clasificados mediante `execution_mode`:

```typescript
type TestExecutionMode = 'patient_self' | 'therapist_clinical';
```

El mapeo está definido en `lib/test-execution-modes.ts`:

```typescript
TEST_EXECUTION_MODE_MAP: Record<string, TestExecutionMode>
```

### Tests Clasificados

#### FLOW A - Patient Self-Administered Tests

**Cuestionarios y Tests Auto-Administrados:**
- `phq-9` - PHQ-9 (Depresión)
- `gad-7` - GAD-7 (Ansiedad)
- `ptsd` - PTSD
- `scl-90` / `scl90` - SCL-90-R
- `stai` - STAI (Ansiedad Estado-Rasgo)
- `bdi-ii` / `bdi` - BDI-II (Depresión Beck)
- `bai` - BAI (Ansiedad Beck)
- `wellness` - Test de Bienestar Integral
- `professional-pai` - PAI (puede ser auto-administrado)
- `mcmi-iv` - MCMI-IV

**Tests Cabalísticos/Numerológicos:**
- `basic-analysis` - Análisis Cabalístico Básico
- `complete-numerology` - Numerología Completa
- `couple-compatibility` - Compatibilidad de Pareja
- `career-guidance` - Orientación Profesional
- `spiritual-path` - Camino Espiritual
- `health-wellness` - Salud y Bienestar
- `financial-abundance` - Abundancia Financiera
- `family-constellation` - Constelación Familiar
- `life-purpose` - Propósito de Vida
- `past-life-reading` - Lectura de Vidas Pasadas

#### FLOW B - Therapist-Led Clinical Evaluations

**Evaluaciones restringidas Estructuradas:**
- `scdf` - Structured Clinical Diagnostic Framework
- `scid5` - Entrevista Clínica Integrativa (no diagnóstica)

---

## 🛡️ Reglas de Comportamiento

### Para Patient Self-Administered Tests (FLOW A)

#### Asignación
- ✅ Pueden ser asignados via "Asignar Test"
- ✅ Aparecen en el modal de asignación
- ✅ Se generan links para compartir con el usuario

#### Estados
- `assigned` - Asignado por terapeuta
- `in_progress` - Usuario está completando
- `completed` - Usuario completó el test

#### Vinculación
- `patient_id` - Usuario que debe completar
- `therapist_id` - Terapeuta que asignó (implícito via sesión)

#### Visibilidad
- ✅ Aparecen en portal del usuario como tareas pendientes
- ✅ Terapeuta puede ver resultados pero NO ejecuta el test

### Para Therapist Clinical Evaluations (FLOW B)

#### Iniciación
- ❌ NO pueden ser asignados a pacientes
- ❌ NO aparecen en modal de asignación
- ✅ Solo se inician desde dashboard del terapeuta
- ✅ Requieren usuario activo seleccionado

#### Estados
- `draft` - Borrador en progreso
- `saved` - Guardado como registro holístico
- `reviewed` - Revisado por terapeuta

#### Vinculación
- `patient_id` - Usuario evaluado (OBLIGATORIO)
- `therapist_id` - Terapeuta que ejecuta (implícito via sesión)

#### Visibilidad
- ❌ NO aparecen en portal del usuario
- ❌ NO aparecen en listas de tareas del paciente
- ✅ Solo visibles para el terapeuta que las ejecutó

---

## 🎨 Separación en UI

### Caso especial: Auditoría de Armonía Sefirótica (SHA)

   - `assigned` → `in_progress` (paciente edita) → `submitted` (pendiente de revisión) → `sealed` (solo terapeuta) → `reviewed`.
   - Principal (obligatorio): balance Misericordia/Severidad + integración emocional + recomendación breve.
   - Notas del terapeuta (histórico de entradas).
   - Guía consultante (opcional, reducida) si `share_with_consultant=true`.
   - Por defecto solo terapeuta. El paciente ve la tarea y, tras enviar, el acuse “En revisión”.
   - La guía consultante solo se expone si el terapeuta la activa en el sellado.
   - Sellado requiere artefacto principal con contenido > 0.
   - Se excluyen `cancelled` de listados por defecto.

## 🆕 Flujo SWM SHA (Auditoría de Armonía Sefirótica)

- Workspace especializado (SWM) con estados: created → in_progress → sealed → reviewed → archived.
- Roles: terapeuta (crea/asigna, edita, sella), paciente (envía "patient_submission"), consultante solo ve guía si el terapeuta la comparte.
- Artefactos:
   - `balance_map` (principal, obligatorio para sellar)
   - `therapist_notes` (opcional, histórico)
   - `patient_submission` (entrada del paciente, no sella)
   - `consultant_guide` (versión reducida si `share_with_consultant`)
- Permisos mínimos:
   - Terapeuta: executor/reviewer. Paciente: solo enviar `patient_submission`.
   - Listados excluyen `CANCELLED` por defecto.
- Validación de sellado: requiere al menos un artefacto principal (`balance_map` o `patient_submission`) con contenido.

**Sidebar Separado:**

```
📋 Tests Asignables al Usuario
  └─ Catálogo de Tests

🏥 Evaluaciones restringidas del Terapeuta
  └─ SCDF - Framework Holístico
  └─ Entrevista Clínica Integrativa
```

**Secciones en Página de Usuario:**

1. **Tests Asignados al Paciente**
   - Lista de tests asignados
   - Estados: pendiente, en progreso, completado
   - Botón "Asignar Test" (solo muestra `patient_self`)

2. **Evaluaciones restringidas del Terapeuta**
   - Accesos directos a SCDF y Entrevista Integrativa
   - Requieren paciente activo
   - NO aparecen como asignables

### Portal del Usuario

**Solo muestra:**
- Tests `patient_self` asignados por su terapeuta
- Estados de tests pendientes/completados
- Enlaces para completar tests asignados

**NUNCA muestra:**
- Evaluaciones restringidas (`therapist_clinical`)
- SCDF
- Entrevista Integrativa

### Catálogo de Tests (`/tests`)

**Para Terapeutas:**
- Muestra todos los tests
- Badge "Evaluación Clínica" para `therapist_clinical`
- Badge "Asignable" para `patient_self`
- Advertencia en evaluaciones restringidas: "Solo para terapeutas. Requiere usuario activo."

**Para Usuarios Personales:**
- Solo muestra tests `patient_self`
- NO muestra evaluaciones clínicas
- Evaluaciones clínicas aparecen deshabilitadas si se cargan

---

## 🔒 Validaciones Implementadas

### Frontend

1. **Modal de Asignación:**
   - Filtra solo tests `patient_self`
   - Muestra advertencia sobre evaluaciones clínicas
   - Previene asignación de evaluaciones clínicas

2. **Catálogo de Tests:**
   - Usuarios personales solo ven `patient_self`
   - Terapeutas ven todos con badges distintivos
   - Evaluaciones clínicas bloqueadas para no-terapeutas

3. **Guardado de Evaluaciones Clínicas:**
   - SCDF valida `patientId` antes de guardar
   - Entrevista Integrativa valida `patientId` antes de guardar
   - Mensajes de error claros si falta usuario

4. **Portal del Paciente:**
   - Filtrado automático de tests `patient_self`
   - Evaluaciones clínicas nunca aparecen

### Backend (Recomendado)

1. **Validar `execution_mode` en asignación:**
   ```python
   if test.execution_mode == 'therapist_clinical':
       return Response({'error': 'Esta evaluación no puede ser asignada'}, 
                      status=400)
   ```

2. **Validar paciente en evaluaciones clínicas:**
   ```python
   if test.execution_mode == 'therapist_clinical' and not patient_id:
       return Response({'error': 'Evaluaciones clínicas requieren paciente'}, 
                      status=400)
   ```

3. **Filtrar tests en portal del paciente:**
   ```python
   # Solo retornar tests patient_self para usuarios
   tests = TestModule.objects.filter(execution_mode='patient_self')
   ```

---

## 📊 Matriz de Comportamiento

| Acción | Patient Self | Therapist Clinical |
|--------|--------------|-------------------|
| Asignar a usuario | ✅ Permitido | ❌ Bloqueado |
| Aparece en portal del usuario | ✅ Sí | ❌ No |
| Ejecutar desde dashboard terapeuta | ✅ Sí | ✅ Sí |
| Requiere usuario activo | ⚠️ Opcional | ✅ Obligatorio |
| Estados (assigned/in_progress/completed) | ✅ Sí | ❌ No |
| Estados (draft/saved/reviewed) | ❌ No | ✅ Sí |
| Guardar sin usuario | ✅ Permitido | ❌ Bloqueado |

---

## 🚨 Reglas Críticas

1. **NUNCA** asignar evaluaciones clínicas a usuarios
2. **SIEMPRE** validar usuario antes de guardar evaluación restringida
3. **NUNCA** mostrar evaluaciones clínicas en portal del usuario
4. **SIEMPRE** filtrar tests por `execution_mode` en UI
5. **NUNCA** permitir que terapeuta se evalúe a sí mismo

---

## 🔄 Compatibilidad Futura

La arquitectura permite futuras expansiones:

### Tests de Auto-Acceso Limitado
- Tests que pacientes pueden iniciar sin asignación
- Requieren configuración adicional
- No implementado aún

### Acceso Pago a Análisis Simbólicos
- Tests cabalísticos premium
- Monetización independiente
- No implementado aún

### Flujos de Recomendación Post-Test
- Terapeuta recomienda análisis después de test
- Flujo de seguimiento
- No implementado aún

---

## 📚 Archivos Clave

- `lib/test-execution-modes.ts` - Sistema de clasificación
- `lib/test-types.ts` - Interface TestModule con execution_mode
- `app/therapist/patients/[id]/page.tsx` - Modal de asignación (filtrado)
- `app/tests/page.tsx` - Catálogo (filtrado por rol)
- `app/dashboard/tools/scdf/page.tsx` - SCDF (validación paciente)
- `app/tests/psicologia/scid5/components/IntegrativeInterview.tsx` - Entrevista (validación paciente)

---

## ✅ Checklist de Implementación

- [x] Sistema de clasificación `execution_mode`
- [x] Mapeo de tests existentes
- [x] Filtrado en modal de asignación
- [x] Filtrado en catálogo de tests
- [x] Validación de paciente en SCDF
- [x] Validación de paciente en Entrevista Integrativa
- [x] Separación visual en sidebar del terapeuta
- [x] Badges distintivos en catálogo
- [x] Documentación completa
- [ ] Validaciones backend (recomendado)

---

**Última actualización:** 2024
**Versión:** 1.0
