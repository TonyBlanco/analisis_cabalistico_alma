# Therapist Dashboard Workspace - Documentación Completa

**Fecha de creación:** 2025-01-14  
**Versión:** 1.0  
**Estado:** Funcional y completo

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Flujo End-to-End](#flujo-end-to-end)
3. [Variables y Keys](#variables-y-keys)
4. [Endpoints Consumidos](#endpoints-consumidos)
5. [Reglas de Seguridad](#reglas-de-seguridad)
6. [Testing Manual (3 minutos)](#testing-manual-3-minutos)
7. [Guardrails Anti-Regresión](#guardrails-anti-regresión)

---

## 📊 Resumen Ejecutivo

El **Therapist Dashboard Workspace** es un workspace profesional funcional que permite a los terapeutas:

- **Seleccionar usuarios activos** (contexto persistente en localStorage)
- **Asignar tests `patient_self`** a usuarios
- **Ejecutar evaluaciones restringidas `therapist_clinical`** para usuarios activos
- **Visualizar resultados** de tests asignados y evaluaciones ejecutadas

**Arquitectura:**
- Frontend: Next.js App Router (TypeScript, React)
- Backend: Django REST Framework
- Estado: localStorage + in-memory fallback para active patient
- Seguridad: Validación backend + UI guards

---

## 🔄 Flujo End-to-End

### 1. Selección de Paciente Activo

```
Usuario (therapist) → Click "Seleccionar usuario"
                   ↓
PatientPicker modal abre → Fetch GET /api/therapist/patients/
                   ↓
Usuario busca/selecciona usuario
                   ↓
setActivePatientId(patientId, patientName) → localStorage
                   ↓
Evento 'activePatientChanged' disparado
                   ↓
Todos los componentes se actualizan:
  - ActivePatientIndicator muestra usuario activo
  - PatientResultsSection filtra resultados del usuario
  - TestCatalogSection habilita botones
  - ClinicalEvaluationsSection habilita ejecución
```

**Componentes involucrados:**
- `ActivePatientIndicator.tsx` - Muestra paciente activo
- `PatientPicker.tsx` - Modal de selección
- `lib/active-patient.ts` - Gestión de estado

---

### 2. Asignación de Tests (patient_self)

```
Usuario → Tab "Asignables al paciente" en TestCatalogSection
        ↓
Click "Asignar" en un test patient_self
        ↓
Validación UI: ¿`activePatientId` existe? (usuario activo)
        ↓
Modal de confirmación muestra test + usuario
        ↓
Usuario confirma
        ↓
GET /api/therapist/patients/{id}/ → Obtener patient.user.id (usuario)
        ↓
POST /api/tests/grant-access/ → Asignar test
  Body: { user_id, test_code }
        ↓
Success → Evento 'assignedTestsChanged'
        ↓
PatientResultsSection se refresca automáticamente
```

**Componentes involucrados:**
- `TestCatalogSection.tsx` - Catálogo con botón "Asignar"
- `lib/assignment-api.ts` - API client para asignación
- `PatientResultsSection.tsx` - Lista que se actualiza

**Reglas:**
- Solo tests con `available_for_personal === true` tienen botón "Asignar"
- Requiere `activePatientId` seleccionado
- Requiere que el usuario tenga `user` vinculado (User account)

---

### 3. Ejecución de Evaluaciones Clínicas (therapist_clinical)

```
Usuario → Sección "Evaluaciones Clínicas"
        ↓
Click "Ejecutar" en un test therapist_clinical
        ↓
Validación UI: ¿activePatientId existe?
        ↓
Modal carga datos del paciente (GET /api/therapist/patients/{id}/)
        ↓
Usuario confirma ejecución
        ↓
POST /api/tests/execute/
  Body: {
    test_module_code,
    input_data: { nombre, fecha_nacimiento, fecha, terapeuta, responses },
    patient_id: activePatientId,
    client_name,
    client_birth_date,
    save_result: true
  }
        ↓
Backend valida:
  - Execution mode: therapist_clinical
  - Role: therapist (no admin)
  - Patient ownership
  - No self-evaluation
        ↓
Test procesado → Resultado guardado
        ↓
Evento 'assignedTestsChanged' disparado
        ↓
PatientResultsSection muestra nuevo resultado
```

**Componentes involucrados:**
- `ClinicalEvaluationsSection.tsx` - Lista de evaluaciones clínicas
- `lib/test-api.ts` - API client para ejecución
- `PatientResultsSection.tsx` - Muestra resultados

**Reglas:**
- Solo tests con `available_for_therapists === true && available_for_personal === false`
- Requiere `activePatientId`
- Backend valida permisos y ownership

---

### 4. Visualización de Resultados

```
Usuario → PatientResultsSection (siempre visible si hay activePatientId)
        ↓
Componente carga: GET /api/tests/patient-previous/?patient_id={id}
        ↓
Lista muestra todos los resultados:
  - Tests asignados (patient_self) completados
  - Evaluaciones clínicas (therapist_clinical) ejecutadas
        ↓
Orden: Más recientes primero (created_at DESC)
        ↓
Usuario click "Ver detalles" en un resultado
        ↓
GET /api/tests/results/{id}/ → Obtener resultado completo
        ↓
Modal muestra:
  - Información del test
  - result_data (JSON formateado)
  - input_data (si disponible)
  - notes (si existe)
```

**Componentes involucrados:**
- `PatientResultsSection.tsx` - Panel principal de resultados
- `lib/test-api.ts` - API clients

**Auto-refresh:**
- Escucha evento `assignedTestsChanged`
- Se refresca cuando se asigna un test o se ejecuta una evaluación

---

## 🔑 Variables y Keys

### localStorage Keys

**Active Patient Context:**
```typescript
// Clave exacta usada en localStorage
const ACTIVE_PATIENT_ID_KEY = 'therapist_active_patient_id';
const ACTIVE_PATIENT_NAME_KEY = 'therapist_active_patient_name';
```

**Ubicación:** `tonyblanco-app/lib/active-patient.ts`

**Valores almacenados:**
- `therapist_active_patient_id`: `string` (number como string, ej: `"123"`)
- `therapist_active_patient_name`: `string` (nombre completo del paciente, ej: `"Juan Pérez"`)

**Funciones de acceso:**
```typescript
// Obtener
getActivePatientId(): number | null
getActivePatientName(): string | null
getActivePatient(): { id: number; name: string | null } | null

// Establecer
setActivePatientId(patientId: number, patientName?: string | null): void

// Limpiar
clearActivePatientId(): void
```

**Eventos personalizados:**
```typescript
// Disparado cuando cambia el paciente activo
window.dispatchEvent(new Event('activePatientChanged'));

// Disparado cuando se asigna un test o ejecuta evaluación
window.dispatchEvent(new Event('assignedTestsChanged'));
```

### In-Memory Fallback

Para SSR/initial render:
```typescript
let inMemoryPatientId: number | null = null;
let inMemoryPatientName: string | null = null;
```

---

## 🌐 Endpoints Consumidos

### Backend Base URL

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api';
```

### Lista Completa de Endpoints

#### 1. Obtener Pacientes del Terapeuta

```typescript
GET /api/therapist/patients/
```

**Headers:**
- `Authorization: Token {token}`

**Respuesta:**
```typescript
Patient[] = [{
  id: number;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  user?: number; // User ID si tiene cuenta vinculada
  // ... otros campos
}]
```

**Ubicación en código:**
- `tonyblanco-app/lib/patient-api.ts` → `getTherapistPatients()`

---

#### 2. Obtener Detalle de Paciente

```typescript
GET /api/therapist/patients/{id}/
```

**Headers:**
- `Authorization: Token {token}`

**Respuesta:**
```typescript
Patient = {
  id: number;
  full_name: string;
  birth_date: string;
  user?: number; // User ID necesario para asignar tests
  // ... otros campos
}
```

**Ubicación en código:**
- `tonyblanco-app/lib/assignment-api.ts` → `getPatientDetail()`

---

#### 3. Obtener Catálogo de Tests Disponibles

```typescript
GET /api/tests/
```

**Headers:**
- `Authorization: Token {token}`

**Respuesta:**
```typescript
{
  tests: TestModule[];
  user_type: string;
  subscription_plan: string;
  membership_active: boolean;
}
```

**Filtrado en frontend:**
- `patient_self`: `test.available_for_personal === true`
- `therapist_clinical`: `test.available_for_therapists === true && test.available_for_personal === false`

**Ubicación en código:**
- `tonyblanco-app/lib/test-api.ts` → `getAvailableTests()`

---

#### 4. Asignar Test a Paciente

```typescript
POST /api/tests/grant-access/
```

**Headers:**
- `Authorization: Token {token}`
- `Content-Type: application/json`

**Body:**
```json
{
  "user_id": 123,  // Patient.user (User ID vinculado)
  "test_code": "bdi-ii"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Acceso especial otorgado a usuario para Test"
}
```

**Nota:** Actualmente es endpoint admin-only. Frontend maneja errores apropiadamente.

**Ubicación en código:**
- `tonyblanco-app/lib/assignment-api.ts` → `assignTestToPatient()`

---

#### 5. Ejecutar Test (Evaluación Clínica)

```typescript
POST /api/tests/execute/
```

**Headers:**
- `Authorization: Token {token}`
- `Content-Type: application/json`

**Body:**
```json
{
  "test_module_code": "bdi-ii",
  "input_data": {
    "nombre": "Juan Pérez",
    "fecha_nacimiento": "1990-01-01",
    "fecha": "2025-01-14",
    "terapeuta": "Terapeuta",
    "responses": {}
  },
  "patient_id": 123,  // REQUERIDO para therapist_clinical
  "client_name": "Juan Pérez",
  "client_birth_date": "1990-01-01",
  "save_result": true
}
```

**Respuesta:**
```json
{
  "success": true,
  "result": { /* resultado del test */ },
  "uses_remaining": null,
  "result_id": 456
}
```

**Ubicación en código:**
- `tonyblanco-app/lib/test-api.ts` → `executeTest()`

---

#### 6. Obtener Resultados de Paciente

```typescript
GET /api/tests/patient-previous/?patient_id={id}
```

**Headers:**
- `Authorization: Token {token}`

**Query Params:**
- `patient_id`: `number` (requerido)

**Respuesta:**
```typescript
{
  count: number;
  results: TestResult[];
}
```

**TestResult:**
```typescript
{
  id: number;
  test_module: {
    id: number;
    code: string;
    name: string;
    test_type: string;
  };
  input_data: Record<string, any>;
  result_data: Record<string, any>;
  client_name?: string;
  client_birth_date?: string;
  notes?: string;
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}
```

**Ubicación en código:**
- `tonyblanco-app/lib/test-api.ts` → `getPatientPreviousTests()`

---

#### 7. Obtener Detalle de Resultado

```typescript
GET /api/tests/results/{id}/
```

**Headers:**
- `Authorization: Token {token}`

**Respuesta:**
```typescript
TestResult // Mismo formato que arriba, completo
```

**Ubicación en código:**
- `tonyblanco-app/lib/test-api.ts` → `getTestResult()`

---

## 🔒 Reglas de Seguridad

### Frontend Guards (UI)

1. **Botón "Asignar" solo para patient_self tests:**
   ```typescript
   // TestCatalogSection.tsx
   const assignableTests = tests.filter(
     test => test.available_for_personal === true
   );
   ```

2. **Botón "Ejecutar" solo para therapist_clinical tests:**
   ```typescript
   // ClinicalEvaluationsSection.tsx
   const clinicalTests = tests.filter(
     test => test.available_for_therapists === true && 
             test.available_for_personal === false
   );
   ```

3. **Validación de activePatientId antes de acciones:**
   ```typescript
   // En ambos componentes
   if (!activePatientId) {
     // Botón disabled + mensaje apropiado
   }
   ```

### Backend Validators

Ubicación: `backend/api/validators/test_execution.py`

#### 1. validate_execution_mode()

**Reglas:**
- Solo dos modos permitidos: `patient_self`, `therapist_clinical`
- `therapist_clinical` requiere `test_module.available_for_therapists === true`
- `patient_self` requiere `test_module.available_for_personal === true`

#### 2. validate_role_for_execution()

**Reglas:**
- `therapist_clinical`: **SOLO** therapist (admin bloqueado explícitamente)
- `patient_self`: Solo `patient` o `personal` (therapist y admin bloqueados)

#### 3. validate_clinical_context()

**Reglas:**
- `patient_id` es **OBLIGATORIO** para `therapist_clinical`
- `patient_id` debe ser un número entero válido

#### 4. validate_patient_ownership()

**Reglas:**
- Paciente debe existir
- Paciente debe pertenecer al therapist (`Patient.therapist == therapist_user`)
- Therapist **NO PUEDE** evaluarse a sí mismo (`patient.user != therapist_user`)

#### 5. validate_patient_self_context()

**Reglas:**
- `patient_id` **NO debe** estar presente en modo `patient_self`

### Resumen de Permisos por Rol

| Rol | Asignar patient_self | Ejecutar therapist_clinical | Ver resultados |
|-----|---------------------|----------------------------|----------------|
| **therapist** | ❌ No | ✅ Sí (solo sus pacientes) | ✅ Sí (solo sus pacientes) |
| **patient** | ✅ Sí (auto) | ❌ No | ✅ Sí (solo propios) |
| **personal** | ✅ Sí (auto) | ❌ No | ✅ Sí (solo propios) |
| **admin** | ⚠️ Solo si modifica backend | ❌ No (bloqueado) | ✅ Sí (read-only, todos) |

---

## 🧪 Testing Manual (3 minutos)

### Setup Rápido

1. **Asegurar backend corriendo:**
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Asegurar frontend corriendo:**
   ```bash
   cd tonyblanco-app
   npm run dev
   ```

3. **Login como therapist:**
   - Usar cuenta con `user_type = 'therapist'`
   - O usar bypass dev (si está habilitado)

### Test 1: Selección de Paciente (30 segundos)

```
1. Ir a /dashboard/therapist
2. Click "Seleccionar paciente"
3. Modal debe abrir con lista de pacientes
4. Seleccionar un paciente
5. ✅ Verificar: ActivePatientIndicator muestra el paciente seleccionado
6. ✅ Verificar: localStorage tiene 'therapist_active_patient_id'
```

### Test 2: Asignación de Test (1 minuto)

```
1. Con paciente activo seleccionado
2. Ir a sección "Catálogo de Tests"
3. Tab "Asignables al paciente"
4. ✅ Verificar: Solo tests con badge "Asignable" tienen botón "Asignar"
5. ✅ Verificar: Tab "Evaluaciones clínicas" NO muestra botón "Asignar"
6. Click "Asignar" en un test
7. Modal de confirmación aparece
8. Confirmar
9. ✅ Verificar: Mensaje de éxito
10. ✅ Verificar: Sección "Resultados del Paciente" se actualiza (si hay resultados previos)
```

### Test 3: Ejecución Clínica (1 minuto)

```
1. Con paciente activo seleccionado
2. Ir a sección "Evaluaciones Clínicas"
3. ✅ Verificar: Solo tests therapist_clinical están listados
4. Click "Ejecutar" en un test
5. Modal muestra datos del paciente
6. Confirmar ejecución
7. ✅ Verificar: Mensaje de éxito
8. ✅ Verificar: Resultado aparece en "Resultados del Paciente"
9. Click "Ver detalles" en el resultado
10. ✅ Verificar: Modal muestra result_data completo
```

### Test 4: Validaciones de Seguridad (30 segundos)

```
1. Sin paciente activo:
   - ✅ Botón "Asignar" debe estar disabled
   - ✅ Botón "Ejecutar" debe estar disabled
   
2. Con paciente activo pero sin user vinculado:
   - ✅ Asignación falla con mensaje apropiado
   
3. Backend retorna 403:
   - ✅ Frontend muestra mensaje de error
   - ✅ No hay crash
```

---

## 🛡️ Guardrails Anti-Regresión

### 1. Validación de Execution Mode en UI

**Ubicación:** `tonyblanco-app/components/TestCatalogSection.tsx`

```typescript
// GUARD: Solo patient_self tests muestran botón "Asignar"
const assignableTests = tests.filter(
  (test) => test.available_for_personal === true
);

// En el render:
{assignableTests.map((test) => (
  <AssignTestButton test={test} /> // ✅ Solo aquí hay botón "Asignar"
))}
```

**Assert recomendado:**
```typescript
// En tests (si tienes test runner):
test('therapist_clinical tests never show Assign button', () => {
  const clinicalTest = { available_for_personal: false, available_for_therapists: true };
  expect(renderComponent(clinicalTest).queryByText('Asignar')).toBeNull();
});
```

---

### 2. Validación de Active Patient en Botones

**Ubicación:** `tonyblanco-app/components/TestCatalogSection.tsx` (AssignTestButton)

```typescript
// GUARD: Botón disabled si no hay activePatientId
const AssignTestButton = ({ test, onAssign, disabled }) => {
  const activePatientId = getActivePatientId(); // ⚠️ Runtime check
  
  if (!activePatientId) {
    return (
      <button disabled title="Selecciona un paciente activo">
        Asignar
      </button>
    );
  }
  // ...
};
```

**Assert recomendado:**
```typescript
// Runtime assert (agregar en desarrollo):
if (process.env.NODE_ENV === 'development') {
  if (execution_mode === 'therapist_clinical' && hasAssignButton) {
    console.error('❌ GUARD VIOLATION: therapist_clinical test has Assign button');
  }
  
  if (!activePatientId && !isButtonDisabled) {
    console.error('❌ GUARD VIOLATION: Run button enabled without activePatientId');
  }
}
```

**Ubicación:** `tonyblanco-app/components/ClinicalEvaluationsSection.tsx` (ExecuteTestButton)

```typescript
// Mismo patrón para botón "Ejecutar"
if (!getActivePatientId()) {
  return <button disabled>Ejecutar</button>;
}
```

---

### 3. Manejo de Errores 403

**Ubicación:** `tonyblanco-app/lib/assignment-api.ts` y `tonyblanco-app/lib/test-api.ts`

```typescript
// GUARD: Manejo de 403 sin crash
if (response.status === 403) {
  const errorData = await response.json().catch(() => ({}));
  const errorMessage = errorData.message || 'No tienes permisos';
  throw new Error(errorMessage); // ✅ Error manejado, no crash
}
```

**Assert recomendado:**
```typescript
// Test manual rápido:
// 1. Intentar asignar test sin permisos
// 2. ✅ Verificar: Toast/mensaje de error aparece
// 3. ✅ Verificar: No hay error en consola
// 4. ✅ Verificar: UI no se rompe
```

**Runtime guard recomendado:**
```typescript
// En catch blocks:
catch (error) {
  if (error.status === 403) {
    // ✅ Mostrar toast/mensaje apropiado
    showErrorToast(error.message);
  } else {
    // ❌ NO hacer crash silencioso
    console.error('Unexpected error:', error);
    showErrorToast('Error inesperado');
  }
}
```

---

### 4. Validación de Filtrado de Tests

**Ubicación:** `tonyblanco-app/components/TestCatalogSection.tsx`

```typescript
// GUARD: Separación estricta de tipos
const assignableTests = tests.filter(
  test => test.available_for_personal === true
);

const clinicalTests = tests.filter(
  test => test.available_for_therapists === true && 
          test.available_for_personal === false
);

// ✅ Estos arrays son mutuamente excluyentes
```

**Assert recomendado:**
```typescript
// En desarrollo:
if (process.env.NODE_ENV === 'development') {
  const assignableCodes = assignableTests.map(t => t.code);
  const clinicalCodes = clinicalTests.map(t => t.code);
  const intersection = assignableCodes.filter(c => clinicalCodes.includes(c));
  
  if (intersection.length > 0) {
    console.warn('⚠️ OVERLAP: Some tests appear in both lists:', intersection);
  }
}
```

---

### 5. Validación de Refresh Automático

**Ubicación:** `tonyblanco-app/components/PatientResultsSection.tsx`

```typescript
// GUARD: Escucha eventos de cambio
useEffect(() => {
  const handleResultsChanged = () => {
    if (activePatientId) {
      fetchResults(); // ✅ Auto-refresh
    }
  };
  
  window.addEventListener('assignedTestsChanged', handleResultsChanged);
  return () => window.removeEventListener('assignedTestsChanged', handleResultsChanged);
}, [activePatientId]);
```

**Test manual:**
```
1. Abrir "Resultados del Paciente"
2. Asignar un test
3. ✅ Verificar: Lista se actualiza sin necesidad de refresh manual
```

---

## 📝 Notas Importantes

### Limitaciones Actuales

1. **Asignación de tests:**
   - Usa endpoint `grant-access` que es admin-only
   - Requiere que el paciente tenga `user` vinculado
   - Frontend maneja errores apropiadamente

2. **Estado del paciente activo:**
   - Persistencia solo en localStorage
   - No se sincroniza entre tabs (usar `storage` event listener si es necesario)

3. **Modal de detalles:**
   - Muestra JSON crudo (futuro: formateo específico por tipo de test)

### Mejoras Futuras

- [ ] Formateo específico de `result_data` por tipo de test
- [ ] Endpoint específico para therapists para asignar tests
- [ ] Sincronización de active patient entre tabs
- [ ] Tests automatizados con Jest/React Testing Library
- [ ] Toast notifications en lugar de alerts

---

## 🔗 Referencias Rápidas

- **Active Patient Context:** `tonyblanco-app/lib/active-patient.ts`
- **Test API Client:** `tonyblanco-app/lib/test-api.ts`
- **Patient API Client:** `tonyblanco-app/lib/patient-api.ts`
- **Assignment API:** `tonyblanco-app/lib/assignment-api.ts`
- **Backend Validators:** `backend/api/validators/test_execution.py`
- **Therapist Dashboard:** `tonyblanco-app/app/(dashboard)/dashboard/therapist/page.tsx`

---

**Última actualización:** 2025-01-14  
**Mantenido por:** Equipo de desarrollo  
**Contacto:** Ver README principal
