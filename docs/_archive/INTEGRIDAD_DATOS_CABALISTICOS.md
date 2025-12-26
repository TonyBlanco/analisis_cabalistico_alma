# Integridad de Datos Cabalísticos - Diseño de Implementación

## 🎯 Objetivo

Prevenir análisis cabalísticos con datos incompletos o incorrectos mediante:
1. Validación estricta de perfil completo
2. Trazabilidad de actualizaciones (quién editó el perfil)
3. Notificación al paciente cuando su perfil fue corregido
4. Bloqueo preventivo de tests cabalísticos con datos incompletos

---

## 📊 Datos Esenciales (Mandatorios)

Un perfil se considera **COMPLETO** solo si tiene:

```python
✅ Nombre legal completo (≥2 palabras: nombre + apellidos)
✅ Fecha de nacimiento
✅ Lugar de nacimiento (birth_city Y birth_country)
```

Si falta **cualquiera** → perfil **INCOMPLETO**

---

## 🔧 Backend: Cambios Mínimos

### 1. Modelo `UserBirthData` (añadir campos)

```python
# Nuevo campo de trazabilidad
profile_updated_by_therapist = models.BooleanField(
    default=False,
    help_text="Indica si el terapeuta actualizó el perfil para corregir datos"
)
last_therapist_update = models.DateTimeField(
    null=True, 
    blank=True,
    help_text="Última vez que el terapeuta actualizó el perfil"
)
updated_by = models.ForeignKey(
    User,
    null=True,
    blank=True,
    on_delete=models.SET_NULL,
    related_name='birth_data_updates',
    help_text="Terapeuta que actualizó el perfil"
)
```

### 2. Función de Validación

```python
def is_profile_complete() -> dict:
    """
    Valida si el perfil tiene datos esenciales completos.
    
    Returns:
        {
            'is_complete': bool,
            'missing_fields': list,
            'warnings': list
        }
    """
    missing = []
    
    # 1. Nombre legal completo (≥2 palabras)
    if not self.full_name or len(self.full_name.strip().split()) < 2:
        missing.append('full_name')
    
    # 2. Fecha de nacimiento
    if not self.birth_date:
        missing.append('birth_date')
    
    # 3. Lugar de nacimiento (ciudad Y país)
    if not self.birth_city or not self.birth_country:
        missing.append('birth_place')
    
    return {
        'is_complete': len(missing) == 0,
        'missing_fields': missing,
        'warnings': []
    }
```

### 3. Endpoint: Therapist Update Patient Profile

```
PATCH /api/patients/<patient_id>/profile/
```

**Permisos:**
- Requester MUST be therapist
- Patient MUST be owned by therapist

**Payload:**
```json
{
  "full_name": "Juan Pérez García",
  "birth_date": "1985-06-15",
  "birth_city": "Madrid",
  "birth_country": "España"
}
```

**Response:**
```json
{
  "message": "Perfil del paciente actualizado correctamente",
  "profile_complete": true,
  "profile_updated_by_therapist": true,
  "last_therapist_update": "2025-12-15T20:30:00Z"
}
```

### 4. Endpoint: Profile Validation Status

```
GET /api/patients/<patient_id>/profile/validation/
```

**Response:**
```json
{
  "is_complete": false,
  "missing_fields": ["birth_place"],
  "warnings": [],
  "profile_updated_by_therapist": false
}
```

---

## 🎨 Frontend: Componentes

### 1. ProfileValidationIndicator (Therapist Workspace)

```typescript
// Componente visual en ActivePatientIndicator o dashboard

<ProfileValidationIndicator 
  isComplete={profile.is_complete}
  missingFields={profile.missing_fields}
/>

// Visual:
// 🟢 Perfil completo
// 🟡 Datos incompletos (click para ver qué falta)
```

### 2. PatientProfileEditor (Therapist Only)

```typescript
// Modal o sección expandible

<PatientProfileEditor
  patientId={activePatient.id}
  currentData={activePatient.birthData}
  onSave={(updated) => {
    // PATCH /api/patients/{id}/profile/
    // Marca profile_updated_by_therapist = true
    showSuccessToast("Datos del paciente actualizados");
  }}
/>
```

### 3. ProfileUpdateNotice (Patient Login)

```typescript
// En patient dashboard mount o login flow

useEffect(() => {
  const checkProfileUpdate = async () => {
    const profile = await getUserProfile();
    
    if (profile.profile_updated_by_therapist) {
      setShowNotice(true);
    }
  };
  
  checkProfileUpdate();
}, []);

// Modal:
<ProfileUpdateNotice
  isOpen={showNotice}
  onAcknowledge={async () => {
    // POST /api/profile/me/acknowledge-update/
    // Resetea flag profile_updated_by_therapist
    setShowNotice(false);
  }}
/>
```

### 4. CabalisticTestGuard (Pre-Execution)

```typescript
// Antes de ejecutar test cabalístico

const executeCabalisticTest = async (testId) => {
  // Validar perfil
  const validation = await validateProfile();
  
  if (!validation.is_complete) {
    showBlockingError(
      "Faltan datos esenciales para un análisis cabalístico preciso",
      validation.missing_fields
    );
    return;
  }
  
  // Continuar con ejecución
  // ...
};
```

---

## 🔄 Flujo Completo

### Caso 1: Therapist Corrige Datos

```
1. Therapist ve indicador 🟡 "Datos incompletos"
2. Click → abre PatientProfileEditor
3. Completa: nombre legal, fecha, ciudad, país
4. Save → PATCH /api/patients/{id}/profile/
5. Backend:
   - Valida datos
   - Marca profile_updated_by_therapist = true
   - Guarda last_therapist_update = now()
   - Guarda updated_by = therapist
6. Frontend: Indicador cambia a 🟢 "Perfil completo"
```

### Caso 2: Patient Login Después de Corrección

```
1. Patient login → /dashboard/patient
2. useEffect fetch GET /api/profile/me/
3. Si profile_updated_by_therapist === true:
   → Mostrar ProfileUpdateNotice modal
4. Patient lee aviso:
   "Tu perfil ha sido actualizado por tu terapeuta
    para garantizar la precisión de los análisis cabalísticos."
5. Patient click "Entendido"
6. POST /api/profile/me/acknowledge-update/
7. Backend resetea profile_updated_by_therapist = false
8. Modal cierra
```

### Caso 3: Intento de Test Cabalístico con Datos Incompletos

```
1. Patient click "Ejecutar Análisis Cabalístico"
2. Frontend: validateProfile() antes de ejecutar
3. Si is_complete === false:
   → Mostrar mensaje:
     "Faltan datos esenciales: [ciudad de nacimiento]"
     "Contacta a tu terapeuta para completar tu perfil."
   → NO ejecutar test
4. Test NO se marca como verde
5. Test NO se guarda como válido
```

---

## ✅ Criterios de Éxito

| Criterio | Implementación |
|----------|----------------|
| Validación estricta pre-ejecución | ✅ CabalisticTestGuard |
| Indicador visual en workspace | ✅ ProfileValidationIndicator |
| Editor para therapist | ✅ PatientProfileEditor |
| Trazabilidad de quién editó | ✅ profile_updated_by_therapist + updated_by |
| Notificación al paciente | ✅ ProfileUpdateNotice modal |
| NO ejecutar tests incompletos | ✅ Validación pre-ejecución |
| Mensajes claros y específicos | ✅ Lista de campos faltantes |

---

## 🚫 Lo que NO se toca

- ❌ AnalysisRecord (no se modifica)
- ❌ Flujos de ejecución de tests existentes
- ❌ Lógica clínica SCDF/SCID
- ❌ Sistema de permisos base
- ❌ Roles o autenticación

---

## 🔐 Seguridad

- ✅ Solo therapist puede editar perfil de su paciente
- ✅ Ownership check: patient MUST belong to therapist
- ✅ Patient NO puede editar datos bloqueados por therapist
- ✅ Trazabilidad completa (quién, cuándo, qué)

---

**Arquitectura cerrada respetada. Integridad de datos garantizada.**
