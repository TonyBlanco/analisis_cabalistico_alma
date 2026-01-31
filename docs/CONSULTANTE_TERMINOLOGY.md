# Consultante Terminology Quick Reference

**Estado**: ACTIVO - Uso obligatorio  
**Fecha**: 31 de enero de 2026  
**Ámbito**: Código, UI, documentación, comunicación

---

## Diccionario de Términos

### ✅ USAR SIEMPRE

| Término | Contexto | Ejemplo |
|---------|----------|---------|
| **Consultante** | Persona en terapia | "El consultante Luis tiene 3 tests asignados" |
| **Terapeuta** | Profesional a cargo | "El terapeuta Dr. Armando creó el workspace" |
| **Usuario** | Cuenta técnica | "El consultante tiene user_id=18" |
| **Consultante activo** | UI/UX | "Seleccionar consultante activo para el workspace" |
| **Lista de consultantes** | UI/UX | "Dashboard muestra lista de consultantes" |
| **Crear consultante** | Acciones | "Botón: Agregar Nuevo Consultante" |
| **Datos del consultante** | Información | "Edad, sexo biológico, lugar de nacimiento" |

### ❌ NO USAR (Legacy/Deprecado)

| Término Prohibido | Reemplazar por | Notas |
|------------------|----------------|--------|
| Paciente | Consultante | Legacy médico-clínico |
| Patient | Consultante | Código en inglés |
| `patient_id` | `consultante` | Schema de DB |
| `getActivePatient()` | `getActiveConsultante()` | Funciones JS/TS |
| `/patients/` | `/consultantes/` | URLs/endpoints |
| "el/la paciente" | "el/la consultante" | Copy de UI |

---

## Reglas de Nomenclatura

### Backend (Python/Django)

```python
# ✅ CORRECTO
class Consultante(models.Model):
    full_name = models.CharField(...)
    therapist = models.ForeignKey(User, ...)

class TestResult(models.Model):
    consultante = models.ForeignKey(Consultante, ...)

# ❌ PROHIBIDO
class Patient(models.Model):  # NO usar
class TestResult(models.Model):
    patient = models.ForeignKey(Patient, ...)  # NO usar
```

### Frontend (TypeScript/React)

```typescript
// ✅ CORRECTO
interface Consultante {
    uuid: string;
    full_name: string;
    therapist: number;
}

const getActiveConsultante = (): Consultante | null => {...}
const consultantePath = `/api/consultantes/${uuid}/`

// ❌ PROHIBIDO  
interface Patient {...}  // NO usar
const getActivePatient = () => {...}  // NO usar
const patientPath = `/api/patients/${id}/`  // NO usar
```

### API Endpoints

```bash
# ✅ CORRECTO
GET /api/consultantes/
POST /api/consultantes/
GET /api/consultantes/{uuid}/
POST /api/consultantes/{uuid}/assign/

# ❌ PROHIBIDO (solo compatibility)
GET /api/patients/  # Solo para legacy durante migración
GET /api/therapist/patients/  # Auto-redirect
```

### UI Copy (Español)

```html
<!-- ✅ CORRECTO -->
<h1>Lista de Consultantes</h1>
<button>Agregar Nuevo Consultante</button>
<span>Consultante: Luis Antonio Blanco</span>
<label>Seleccionar consultante activo</label>

<!-- ❌ PROHIBIDO -->
<h1>Lista de Pacientes</h1>
<button>Agregar Nuevo Paciente</button>
<span>Paciente: Luis Antonio Blanco</span>
```

### Variables y Funciones

```typescript
// ✅ CORRECTO
const consultante = await getConsultante(uuid)
const consultanteList = await listConsultantes()
const activeConsultante = getActiveConsultante()
const consultanteId = consultante.user_id  // Para assignments

// ❌ PROHIBIDO
const patient = await getPatient(id)
const patientList = await listPatients()
const activePatient = getActivePatient()
```

---

## Copy Guidelines (UI/UX)

### Botones y Acciones

| Acción | Texto Correcto |
|--------|---------------|
| Crear | "Agregar Nuevo Consultante" |
| Seleccionar | "Seleccionar Consultante" |
| Editar | "Editar Datos del Consultante" |
| Eliminar | "Archivar Consultante" |
| Buscar | "Buscar Consultantes" |
| Asignar | "Asignar a Consultante" |

### Labels y Headers

| Sección | Texto Correcto |
|---------|---------------|
| Lista principal | "Mis Consultantes" |
| Detalle | "Perfil del Consultante" |
| Selector | "Consultante Activo" |
| Estadísticas | "Total de Consultantes" |
| Filtros | "Filtrar por Consultante" |

### Mensajes del Sistema

```typescript
// ✅ CORRECTO
"Consultante creado exitosamente"
"Selecciona un consultante para continuar"
"El consultante no tiene tests asignados"
"Datos del consultante actualizados"
"Test asignado al consultante Luis"

// ❌ PROHIBIDO
"Paciente creado exitosamente"
"Selecciona un paciente para continuar"
"El paciente no tiene tests asignados"
```

---

## Contextos Especiales

### Legales/Formales

- **Consentimientos**: "El consultante autoriza..."
- **Contratos**: "Servicios terapéuticos para el consultante..."
- **Reportes**: "Análisis del consultante..." 

### Técnicos/Logs

```bash
# ✅ CORRECTO
[INFO] Consultante a1b2c3d4 created by therapist 1
[ERROR] Failed to assign test to consultante uuid=...
[DEBUG] Active consultante context updated

# ❌ EVITAR
[INFO] Patient 4 created by therapist 1
[ERROR] Failed to assign test to patient 4
```

### Astrológicos/Espirituales

- **Cartas natales**: "Carta natal del consultante"
- **Análisis**: "El consultante muestra tendencias..."
- **Interpretación**: "Para este consultante, Júpiter indica..."

---

## Excepciones Técnicas

### Compatibility Layer (Temporal)

```typescript
// ✅ PERMITIDO durante migración
export const getPatientDetail = async (legacyId: number) => {
    // Internally converts to getConsultante() 
    return await getConsultanteByLegacyId(legacyId)
}

// URL redirects OK durante migración
app.get('/api/patients/:id', redirectToConsultante)
```

### Database Legacy Fields

```python
# ✅ PERMITIDO para migración
class Consultante(models.Model):
    legacy_patient_id = models.IntegerField(null=True)  # Temporary
```

### Assignments API (User IDs)

```typescript
// ✅ CORRECTO - Assignments usan user_id, no UUID
const assignmentData = {
    patient_id: consultante.user_id,  // Campo legacy pero valor correcto
    assigned_to_user_id: consultante.user_id
}
```

---

## Enforcement

### Code Review Checklist

- [ ] ❌ No usa "Patient" en nuevos modelos/interfaces
- [ ] ❌ No usa "patient_id" en nuevos campos  
- [ ] ❌ No usa "paciente" en copy de UI
- [ ] ✅ Usa "Consultante" consistentemente
- [ ] ✅ APIs usan `/consultantes/` endpoints
- [ ] ✅ Variables usan nomenclatura consultante

### Automated Checks

```bash
# Buscar términos prohibidos en código nuevo
grep -r "class Patient" . --exclude-dir=docs/legacy
grep -r "patient_id.*models\." . --exclude-dir=docs/legacy  
grep -r "getActivePatient" . --exclude-dir=docs/legacy

# Debe retornar 0 matches en código nuevo
```

---

## Referencias

- **Arquitectura completa**: [UNIFIED_CONSULTANTE_ARCHITECTURE.md](UNIFIED_CONSULTANTE_ARCHITECTURE.md)
- **Guía de migración**: [CONSULTANTE_MIGRATION_GUIDE.md](CONSULTANTE_MIGRATION_GUIDE.md)  
- **Políticas generales**: [WORKSPACE_ISOLATION_POLICY.md](WORKSPACE_ISOLATION_POLICY.md)

**REMEMBER**: Consultante = persona que consulta. Patient = persona enferma. Usamos el primer paradigma.