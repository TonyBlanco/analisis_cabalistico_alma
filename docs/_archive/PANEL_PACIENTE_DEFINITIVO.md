# Panel de Usuario - Implementación Definitiva

## Objetivo

El panel del usuario permite al usuario:
- Ver qué tiene asignado
- Ejecutar lo que le corresponde
- Consultar sus resultados
- Acceder a recursos
- Gestionar su perfil

**Sin exponerse a herramientas clínicas del terapeuta**

## Principio Rector

> El usuario solo ve lo que puede usar o consultar.  
> Nunca ve herramientas de control.  
> Nada de "gestionar", nada de "asignar", nada de "administrar".

---

## Estructura del Sidebar (Definitiva)

**Sidebar simple y estable - Máximo 6 entradas:**

1. **Inicio** (`/dashboard/patient`)
2. **Tests** (`/dashboard/patient/tests`)
3. **Resultados** (`/dashboard/patient/results`)
4. **Recursos** (`/dashboard/patient/resources`)
5. **Proceso** (`/dashboard/patient/process`)
6. **Cuenta** (`/dashboard/patient/account`)

Este sidebar **NO crece con el tiempo**.

---

## Secciones Implementadas

### 1. Inicio (Landing del usuario)

**Ruta:** `/dashboard/patient`

**Contenido:**
- Bienvenida personalizada
- Estado del proceso (ej. "En acompañamiento terapéutico")
- Avisos importantes:
  - Perfil incompleto
  - Tests pendientes
  - Nuevos resultados disponibles

**Nota:** En documentación y UI preferir la palabra "usuario" cuando se refiera al rol general de la persona usando el portal.
- Mensaje del terapeuta (si existe)

**Características:**
- Vista por defecto al entrar
- No hay acciones complejas
- Enlaces rápidos a secciones con avisos

---

### 2. Tests

**Ruta:** `/dashboard/patient/tests`

**Contenido:**
- Lista de tests asignados por el terapeuta
- Diferenciación visual entre:
  - **Pendientes:** Con botón "Comenzar"
  - **Completados:** Con botón "Ver resultado"

**Reglas:**
- ✅ Solo ve tests asignados por su terapeuta
- ❌ NO ve catálogo completo de tests
- ❌ NO puede auto-asignarse tests restringidos
- ✅ Al completar un test → pasa automáticamente a "Resultados"

**Estado vacío:** "No tienes tests asignados"

---

### 3. Resultados

**Ruta:** `/dashboard/patient/results`

**Contenido:**
- Lista cronológica de resultados propios
- Cada resultado muestra:
  - Nombre del análisis/test
  - Fecha de realización
  - Estado (nuevo/visto)
  - Botón "Ver resultado"

**Características:**
- Badge "Nuevo" en resultados no vistos
- Acceso directo a resultado individual
- Vista detallada con notas del terapeuta (si existen)

**Reglas:**
- ✅ Puede consultar todos sus resultados
- ❌ NO puede editar resultados
- ✅ Notas del terapeuta visibles claramente

**Estado vacío:** "No hay resultados disponibles"

---

### 4. Recursos

**Ruta:** `/dashboard/patient/resources`

**Contenido:**
- Categorías visuales (cards):
  - Audios
  - Videos
  - Meditaciones
  - Cursos

**Tipos de acceso:**
1. **Gratis** - Recursos de acceso libre
2. **Recomendado** - Asignados por terapeuta
3. **Adquirido** - Comprados por el usuario

**Integración con backend:**
- `GET /api/resources/my/` - Lista recursos del usuario
- `POST /api/resources/{id}/acquire/` - Simular auto-adquisición

**Características:**
- El terapeuta ve reflejado lo que el usuario compra
- El usuario puede explorar libremente (según su plan)
- Diseño visual atractivo (valor emocional y comercial)

**Estado vacío:** "No hay recursos disponibles"

---

### 5. Proceso

**Ruta:** `/dashboard/patient/process`

**Contenido:**
- Estado del proceso actual
- Historial de hitos (timeline visual):
  - Completados (✓ verde)
  - Pendientes (○ gris)
- Próximos pasos sugeridos

**Características:**
- Da sentido al acompañamiento
- NO es chat
- NO es clínica
- Es **narrativa del proceso personal**

**Nota informativa:**
> "Este espacio refleja el progreso de tu proceso personal. El sistema NO proporciona diagnósticos médicos ni psicológicos; las salidas son interpretativas y contextuales. Cualquier interpretación más profunda corresponde al terapeuta o profesional de confianza."

---

### 6. Cuenta

**Ruta:** `/dashboard/patient/account`

**Contenido:**

#### Información Personal
- Nombre legal completo (editable)
- Email
- Teléfono

#### Datos de Nacimiento
- Fecha de nacimiento
- Hora de nacimiento
- Ciudad/país (🔒 bloqueados por terapeuta)

#### Consentimiento
- Estado del consentimiento terapéutico
- Fecha de aceptación

#### Acciones
- Guardar cambios
- Cerrar sesión

**Versionado:**
> Los cambios en datos personales se versionan automáticamente.  
> Los análisis anteriores conservan los datos con los que fueron creados (snapshots).

---

## Cosas que el Usuario NO VE

Explícitamente prohibido:

❌ Gestión de usuarios
❌ Evaluaciones con alcance profesional
❌ SCDF u otras herramientas internas
❌ Catálogo completo de tests
❌ Datos de otros usuarios
❌ Configuración del sistema

---

## Diseño Visual

### Paleta de Colores (Usuario)
- **Color principal:** Violeta suave (`#7c3aed`)
- **Acentos:** Violeta 100-600
- **Estados:**
  - Verde: Completado
  - Azul: Información/Proceso
  - Ámbar: Advertencia/Pendiente
  - Rojo: Error (si aplica)

### Iconos (Lucide React)
- **Inicio:** `Home`
- **Tests:** `ClipboardList`
- **Resultados:** `FileText`
- **Recursos:** `Folder`
- **Proceso:** `TrendingUp`
- **Cuenta:** `User`

### Responsive
| Dispositivo | Sidebar | Navegación |
|-------------|---------|------------|
| Desktop | Fijo | Central |
| Tablet | Colapsable | Central |
| Móvil | Hamburger | Full screen |

---

## Relación Usuario–Terapeuta

### Autonomía del Usuario
✅ Puede editar su perfil  
✅ Puede adquirir recursos  
✅ Puede consultar sus resultados  
✅ Puede gestionar su cuenta

### Control del Terapeuta
✅ Asigna tests  
✅ Asigna recursos  
✅ Ve lo que el paciente adquiere  
✅ Mantiene control sobre datos sensibles (coordenadas)

**Dinámica sana:**
- Lo que compra el paciente NO rompe el proceso
- Se refleja en el terapeuta como "adquirido por el paciente"
- El paciente nunca pierde autonomía
- El terapeuta nunca pierde control clínico

---

## Archivos Implementados

### Backend
- `backend/api/models.py` - Models: `Resource`, `UserResourceAccess`
- `backend/api/serializers.py` - Serializers para recursos
- `backend/api/views.py` - Views: `MyResourcesView`, `AssignResourceToPatientView`, `AcquireResourceView`
- `backend/api/urls.py` - Endpoints de recursos

### Frontend - Sidebar
- `tonyblanco-app/app/(dashboard)/dashboard/patient/components/PatientSidebar.tsx`
- `tonyblanco-app/app/(dashboard)/dashboard/patient/layout.tsx`

### Frontend - Páginas
- `tonyblanco-app/app/(dashboard)/dashboard/patient/page.tsx` (Inicio)
- `tonyblanco-app/app/(dashboard)/dashboard/patient/tests/page.tsx`
- `tonyblanco-app/app/(dashboard)/dashboard/patient/results/page.tsx`
- `tonyblanco-app/app/(dashboard)/dashboard/patient/resources/page.tsx`
- `tonyblanco-app/app/(dashboard)/dashboard/patient/process/page.tsx`
- `tonyblanco-app/app/(dashboard)/dashboard/patient/account/page.tsx`

---

## Pendientes de Integración Backend

### Tests
- [ ] `GET /api/tests/assigned/` - Lista de tests asignados al paciente
- [ ] `POST /api/tests/execute/` - Ejecutar test asignado
- [ ] Integrar con página de tests

### Resultados
- [ ] `GET /api/analysis-records/?role_context=patient_clinical` - Resultados del paciente
- [ ] `GET /api/analysis-records/{id}/` - Detalle de resultado individual
- [ ] Integrar con página de resultados

### Recursos
- [x] `GET /api/resources/my/` - Recursos accesibles
- [x] `POST /api/resources/{id}/acquire/` - Auto-adquisición
- [ ] Integrar con página de recursos

### Proceso
- [ ] Definir modelo de "Proceso" o usar datos existentes
- [ ] Crear endpoints si es necesario
- [ ] Integrar timeline con datos reales

### Cuenta
- [ ] `GET /api/profile/me/` - Perfil del paciente
- [ ] `PATCH /api/profile/me/` - Actualizar perfil
- [ ] Integrar formulario con backend

---

## Estado de Implementación

### ✅ Completado
- [x] Diseño y estructura del sidebar definitivo
- [x] Página "Inicio" con avisos y estado
- [x] Página "Tests" con lista y ejecución placeholder
- [x] Página "Resultados" con lista cronológica
- [x] Página "Recursos" con categorías visuales
- [x] Página "Proceso" con timeline de hitos
- [x] Página "Cuenta" con gestión de perfil
- [x] Backend Resource Access Core (modelos, serializers, views, URLs)

### ⏳ Pendiente
- [ ] Integración completa con backend (fetch real)
- [ ] Flujo de ejecución de tests
- [ ] Vista detallada de resultados individuales
- [ ] Flujo de adquisición/reproducción de recursos
- [ ] Implementación de logout
- [ ] Tests unitarios/integración

---

## Notas Finales

**Arquitectura:**
- Cerrada y respetada
- Sin modificaciones a `AnalysisRecord` core
- Sin cambios en dashboards existentes (therapist, personal, admin)
- Componentes aislados y reutilizables

**UX:**
- Simple y clara
- No abruma al paciente
- Enfocada en lo esencial
- Respeta el principio: "solo ve lo que puede usar"

**Seguridad:**
- Role guards aplicados
- Ownership checks en backend
- Sin exposición de datos de otros pacientes
- Sin acceso a herramientas clínicas avanzadas
