# Migration Guide: Patient → Consultante

**Estado**: ACTIVO - Implementación inmediata  
**Autoridad**: Arquitectura / Backend  
**Compatibilidad**: `UNIFIED_CONSULTANTE_ARCHITECTURE.md`  
**Audiencia**: Desarrolladores, terapeutas creando consultantes nuevos

---

## Cambios Críticos para Desarrolladores

### ⚠️ Terminología Obligatoria

| ❌ **NO usar** | ✅ **Usar siempre** |
|---------------|-------------------|
| Patient | Consultante |
| `patient_id` | `consultante` (ForeignKey) o `consultante_uuid` |
| `/patients/` | `/consultantes/` |
| `getActivePatient()` | `getActiveConsultante()` |
| "paciente" (UI) | "consultante" (UI) |

### 🔄 APIs Actualizadas

```typescript
// ❌ LEGACY - Evitar en código nuevo
await fetch('/api/therapist/patients/4/')

// ✅ NUEVO - Usar en todo código nuevo  
await fetch('/api/consultantes/a1b2c3d4-e5f6-7890-abcd-ef1234567890/')

// ✅ COMPATIBILITY - OK durante migración
const consultante = await getPatientDetail(4) // Auto-redirects to UUID API
```

### 🆔 Identificadores

```typescript
// ❌ LEGACY - Integer IDs problemáticos
const patientId = 4

// ✅ NUEVO - UUID primary keys
const consultanteUuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

// ✅ ASSIGNMENTS - Usar user_id (no UUID)
const assignmentData = {
    patient_id: consultante.user_id,  // Integer para assignments
    assigned_to_user_id: consultante.user_id
}
```

### 📊 Modelos Django

```python
# ❌ LEGACY - Modelo Patient deprecado
class TestResult(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)

# ✅ NUEVO - Modelo Consultante
class TestResult(models.Model):
    consultante = models.ForeignKey(Consultante, on_delete=models.CASCADE)
```

---

## Flujos de Trabajo para Terapeutas

### Crear Consultante Nuevo

1. **Dashboard Terapeuta** → **"Agregar Consultante"**
2. **Completar datos básicos**:
   - Nombre completo (obligatorio)
   - Email (obligatorio, único)
   - Fecha/lugar de nacimiento (para análisis astrológicos)
   - Sexo biológico (para análisis energéticos)
3. **Sistema auto-crea** cuenta de usuario vinculada
4. **Consultante aparece** en lista con UUID único

### Asignar Tests/Exploraciones

1. **Seleccionar consultante** desde lista o workspace activo
2. **Botón "Asignar"** en cualquier workspace/exploración  
3. **Sistema usa** `consultante.user_id` automáticamente
4. **Consultante recibe** notificación por email

### Workspace Activo

```typescript
// El sistema mantiene contexto automáticamente
const activeConsultante = getActiveConsultante()
// → { uuid: 'abc-123', id: 18, name: 'Luis Blanco' }

// Todos los workspaces usan este contexto
// - Bio-Emotional → Usa consultante activo
// - SHA → Usa consultante activo  
// - Tarot → Usa consultante activo
```

---

## Resolución de Problemas

### "Consultante no tiene cuenta de usuario vinculada"

**Causa**: Consultante creado sin `user_account`  
**Solución**: El sistema auto-crea cuentas - reportar si persiste

### "404 en API de consultante"

**Causa**: Usando endpoints legacy con IDs incorrectos  
**Solución**: 
```bash
# Verificar consultante existe
curl -H "Authorization: Token <token>" \
  http://localhost:8000/api/consultantes/

# Usar UUID, no integer ID
curl -H "Authorization: Token <token>" \
  http://localhost:8000/api/consultantes/abc-def-123-456/
```

### "Assignment falla con UUID"

**Causa**: API de assignments necesita user_id, no UUID  
**Solución**:
```typescript
// ✅ Correcto
await createAssignment({
    patient_id: consultante.user_id,  // Integer ID
    assigned_to_user_id: consultante.user_id
})

// ❌ Incorrecto  
await createAssignment({
    patient_id: consultante.uuid  // UUID no funciona aquí
})
```

### Modal de asignación se queda "stuck"

**Causa**: Modal sin botón de cerrar en pantalla de éxito  
**Solución**: Presionar `ESC` o usar botón "Cerrar" verde

---

## Migración de Datos

### Datos de Test (Actuales)

```bash
# Todos los datos actuales son de prueba - se recrearán
python manage.py flush  # Limpia toda la DB
python manage.py migrate  # Aplica nueva estructura
python recreate_test_consultantes.py  # Crea consultantes de test
```

### Datos de Producción (Futuro)

```bash
# Migración preservando datos existentes
python manage.py migrate_patients_to_consultantes
# → Crea Consultante por cada Patient
# → Mantiene relaciones existentes
# → Preserva todos los TestResults/Assignments
```

---

## Validación Post-Migración

### Checklist Backend

```bash
# 1. Verificar modelos
python manage.py shell -c "
from api.models import Consultante
print(f'Consultantes: {Consultante.objects.count()}')
print(f'Sin user_account: {Consultante.objects.filter(user_account__isnull=True).count()}')
"

# 2. Test API endpoints
curl -H "Authorization: Token <token>" http://localhost:8000/api/consultantes/

# 3. Test legacy compatibility  
curl -H "Authorization: Token <token>" http://localhost:8000/api/therapist/patients/18/
```

### Checklist Frontend

1. **Dashboard carga** lista de consultantes
2. **Crear consultante** funciona sin errores
3. **Seleccionar consultante** actualiza contexto activo
4. **Workspaces cargan** datos del consultante correcto
5. **Assignments funcionan** sin errores de permisos
6. **Modales se cierran** correctamente con ESC

### Checklist SWM Workspaces

| Workspace | Status | Validación |
|-----------|--------|------------|
| Bio-Emotional | ✅ | Carga consultante activo, assignments funcionan |
| SHA | ✅ | Contexto de consultante correcto |
| Tarot | ✅ | Lectura vinculada a consultante |
| MCMI-4 | 🔄 | Revisar tras migración |
| Transgenerational | 🔄 | Revisar tras migración |

---

## Rollback (Emergencia)

```bash
# 1. Revertir migración
python manage.py migrate api <migration_before_consultante>

# 2. Revertir código
git revert <consultante_commit>

# 3. Restart servicios
./start-all.ps1
```

---

## Timeline de Implementación

### Día 1 (HOY)
- ✅ Crear modelo Consultante
- ✅ Implementar APIs básicas
- ✅ Recrear datos de test
- 🔄 Test asignaciones básicas

### Día 2
- 🔄 Validar todos los SWM workspaces
- 🔄 Test comprehensive con consultantes nuevos
- 🔄 Documentar edge cases

### Día 3  
- 🔄 Cleanup final
- 🔄 Performance testing
- 🔄 Deploy a staging

### Semana 2
- 🔄 Deploy a producción
- 🔄 Migración datos reales
- 🔄 Monitoreo post-migración

---

## Referencias

- **Arquitectura completa**: [`UNIFIED_CONSULTANTE_ARCHITECTURE.md`](UNIFIED_CONSULTANTE_ARCHITECTURE.md)
- **Políticas workspace**: [`WORKSPACE_ISOLATION_POLICY.md`](WORKSPACE_ISOLATION_POLICY.md)
- **Onboarding agentes**: [`AGENT_ONBOARDING_README.md`](AGENT_ONBOARDING_README.md)

---

**IMPORTANTE**: Este documento es la guía práctica para la transición. Para detalles técnicos completos, consultar `UNIFIED_CONSULTANTE_ARCHITECTURE.md`.