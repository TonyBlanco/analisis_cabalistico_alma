# Implementación Completa de Nueva Estructura de Rutas de Tests

## 📋 Resumen Ejecutivo

Se ha implementado una nueva estructura de rutas para tests organizados por dominio (Cábala, Psicología, Astrología) con diferentes niveles de acceso según el tipo de usuario (terapeuta/profesional, usuario/portal asignado, cliente casual/membresía).

**Fecha de implementación:** Diciembre 2024  
**Estado:** ✅ Base implementada, pendiente rutas de dashboard

---

## 🎯 Objetivos

1. Unificar rutas bajo `/tests/` con subcarpetas por dominio
2. Separar la experiencia de acceso según tipo de usuario
3. Crear estructura escalable y mantenible
4. Mantener compatibilidad con rutas existentes

---

## 📁 Estructura de Archivos Implementada

### Frontend (`tonyblanco-app`)

```
tonyblanco-app/
├── components/
│   └── TestExecution.tsx          # ✅ Componente genérico de ejecución
├── lib/
│   ├── test-domains.ts            # ✅ Mapeo de tests por dominio
│   ├── test-api.ts                # (existente) API calls
│   └── test-types.ts              # (existente) TypeScript types
└── app/
    └── tests/
        ├── page.tsx                # ✅ Catálogo principal
        ├── [domain]/
        │   └── [code]/
        │       └── page.tsx       # ✅ Detalle y ejecución
        ├── results/
        │   ├── page.tsx           # (existente) Lista de resultados
        │   └── [id]/
        │       └── page.tsx       # (existente) Detalle de resultado
        └── [code]/
            └── page.tsx           # (mantener) Compatibilidad
```

---

## 🔧 Componentes Implementados

### 1. Componente Genérico de Ejecución

**Archivo:** `components/TestExecution.tsx`

**Descripción:**  
Componente reutilizable para ejecutar cualquier test, independientemente del dominio.

**Props:**
```typescript
interface TestExecutionProps {
  testCode: string;                    // Código del test
  domain: 'cabala' | 'psicologia' | 'astrologia';
  onResult?: (result: ExecuteTestResponse) => void;
  onError?: (error: string) => void;
}
```

**Funcionalidades:**
- ✅ Carga automática de datos del perfil de usuario
- ✅ Manejo de campos bloqueados para usuarios personales
- ✅ Soporte para tests de compatibilidad (dos personas)
- ✅ Campo opcional para nombre de cliente (terapeutas)
- ✅ Opción de guardar resultado en historial
- ✅ Manejo de errores y estados de carga
- ✅ Redirección automática a resultados después de ejecutar

**Uso:**
```tsx
<TestExecution
  testCode="basic-analysis"
  domain="cabala"
  onResult={(result) => console.log('Test ejecutado:', result)}
  onError={(error) => console.error('Error:', error)}
/>
```

---

### 2. Mapeo de Tests por Dominio

**Archivo:** `lib/test-domains.ts`

**Descripción:**  
Define todos los tests organizados por dominio y proporciona funciones helper.

**Estructura:**
```typescript
export type TestDomain = 'cabala' | 'psicologia' | 'astrologia';

export interface TestDomainMapping {
  code: string;
  domain: TestDomain;
  name: string;
  description: string;
}
```

**Funciones Helper:**
- `getTestDomain(code: string)`: Obtiene el dominio de un test
- `getTestsByDomain(domain: TestDomain)`: Obtiene todos los tests de un dominio
- `getTestInfo(code: string)`: Obtiene información completa de un test

**Tests Mapeados:**

#### Cábala (11 tests)
- `basic-analysis` - Análisis Cabalístico Básico
- `complete-numerology` - Numerología Completa
- `couple-compatibility` - Compatibilidad de Pareja
- `career-guidance` - Orientación Profesional
- `spiritual-path` - Camino Espiritual
- `health-wellness` - Salud y Bienestar
- `financial-abundance` - Abundancia Financiera
- `family-relations` - Relaciones Familiares
- `life-purpose` - Propósito de Vida
- `past-lives` - Vidas Pasadas
- `cabalistic-astrology` - Astrología Cabalística

#### Psicología (18 tests)
- `bdi-ii` - Inventario de Depresión de Beck
- `bai` - Inventario de Ansiedad de Beck
- `phq-9` - Cuestionario de Salud del Paciente
- `gad-7` - Escala de Ansiedad Generalizada
- `ptsd` - Evaluación de Trastorno de Estrés Postraumático
- `ocd` - Evaluación de Trastorno Obsesivo Compulsivo
- `insomnia` - Evaluación de Insomnio
- `adhd` - Evaluación de TDAH en Adultos
- `substance` - Evaluación de Uso de Sustancias
- `eating` - Evaluación de Trastornos Alimentarios
- `scl-90` - Lista de Verificación de Síntomas
- `scl-90-r` - Lista de Verificación de Síntomas Revisada
- `stai` - Inventario de Ansiedad Estado-Rasgo
- `mcmi-iv` - Inventario Clínico Multiaxial de Millon
- `scid5` - Entrevista Clínica Estructurada
- `scid-5-rv` - Entrevista Clínica Estructurada Revisada
- `pai` - Inventario de Evaluación de Personalidad
- `professional-pai` - PAI Profesional

#### Astrología (1 test)
- `cabalistic-astrology` - Astrología Cabalística
- (Futuros: cartas natales, sinastría, tránsitos)

---

### 3. Página de Catálogo Principal

**Ruta:** `/tests`  
**Archivo:** `app/tests/page.tsx`

**Funcionalidades:**
- ✅ Lista todos los tests disponibles para el usuario
- ✅ Filtros por dominio (Todos, Cábala, Psicología, Astrología)
- ✅ Búsqueda por nombre o descripción
- ✅ Muestra información de cada test:
  - Nombre y descripción
  - Dominio (badge de color)
  - Duración estimada
  - Límite de usos mensuales
  - Nivel de acceso requerido
  - Disponibilidad (terapeutas/usuarios)
- ✅ Navegación a páginas de detalle
- ✅ Diseño responsive y moderno

**Características de UI:**
- Cards con colores según dominio
- Iconos distintivos por dominio
- Badges de nivel de acceso
- Filtros visuales con iconos
- Búsqueda en tiempo real

---

### 4. Página de Detalle y Ejecución

**Ruta:** `/tests/[domain]/[code]`  
**Archivo:** `app/tests/[domain]/[code]/page.tsx`

**Funcionalidades:**
- ✅ Muestra información detallada del test
- ✅ Header con colores según dominio
- ✅ Iconos y badges informativos
- ✅ Integra el componente `TestExecution`
- ✅ Navegación de regreso al catálogo
- ✅ Manejo de estados (loading, error, success)
- ✅ Diseño adaptado al dominio

**Ejemplos de rutas:**
- `/tests/cabala/basic-analysis`
- `/tests/psicologia/phq-9`
- `/tests/astrologia/cabalistic-astrology`

---

## 🗺️ Mapa de Rutas

### Rutas Públicas/Casuales

```
/tests                                    # Catálogo principal ✅
/tests/[domain]/[code]                    # Detalle y ejecución ✅
  - /tests/cabala/basic-analysis
  - /tests/psicologia/phq-9
  - /tests/astrologia/cabalistic-astrology
```

### Rutas de Paciente (Portal Asignado)

```
/dashboard/patient/tests                  # ⏳ Pendiente
/dashboard/patient/tests/[code]           # ⏳ Pendiente
/dashboard/patient/results                # ⏳ Pendiente
/dashboard/patient/results/[id]           # ⏳ Pendiente
```

### Rutas de Terapeuta/Profesional

```
/dashboard/therapist/tests                # ⏳ Pendiente
/dashboard/therapist/patients/[id]/tests  # ⏳ Pendiente
/dashboard/therapist/patients/[id]/results # ⏳ Pendiente
```

---

## 🔐 Lógica de Acceso

### Niveles de Acceso

1. **Free (Gratuito)**
   - Acceso básico limitado
   - Tests gratuitos ilimitados

2. **Personal (€29 único)**
   - Tests personales con límites mensuales
   - Acceso a tests básicos y numerología

3. **Professional (€49/mes)**
   - Solo para terapeutas
   - Acceso a tests clínicos
   - Tests ilimitados según plan

4. **Premium (€99/mes)**
   - Todos los tests
   - Sin límites mensuales
   - Acceso a tests avanzados

### Filtrado por Tipo de Usuario

**Backend (`test_views.py`):**
```python
if profile.user_type == 'therapist':
    tests = tests.filter(available_for_therapists=True)
else:
    tests = tests.filter(available_for_personal=True)
```

**Frontend (pendiente):**
- Mostrar/ocultar tests según tipo de usuario
- Filtrar por nivel de membresía
- Mostrar solo tests asignados (para pacientes)
- Respetar acceso especial

---

## 📊 Estado de Implementación

### ✅ Completado

- [x] Componente genérico de ejecución (`TestExecution.tsx`)
- [x] Mapeo de tests por dominio (`test-domains.ts`)
- [x] Página de catálogo principal (`/tests`)
- [x] Página de detalle y ejecución (`/tests/[domain]/[code]`)
- [x] Estructura de carpetas base
- [x] Documentación de implementación

### ⏳ Pendiente

- [ ] Rutas de dashboard para terapeutas
  - [ ] `/dashboard/therapist/tests` - Catálogo completo
  - [ ] `/dashboard/therapist/patients/[id]/tests` - Asignar tests
  - [ ] `/dashboard/therapist/patients/[id]/results` - Ver resultados

- [ ] Rutas de dashboard para pacientes
  - [ ] `/dashboard/patient/tests` - Tests asignados
  - [ ] `/dashboard/patient/tests/[code]` - Ejecución
  - [ ] `/dashboard/patient/results` - Historial
  - [ ] `/dashboard/patient/results/[id]` - Detalle

- [ ] Funcionalidades adicionales
  - [ ] Componente de asignación de tests
  - [ ] Filtrado avanzado según asignaciones
  - [ ] Redirects 301 para rutas antiguas
  - [ ] Migración de páginas existentes
  - [ ] Alineación de códigos (ptsd vs ptsd-check)

---

## 🔄 Compatibilidad y Migración

### Rutas Antiguas (Mantener)

Se mantienen las rutas antiguas para no romper enlaces existentes:

```
/tests/[code]                    # Página antigua (mantener)
  - /tests/basic-analysis
  - /tests/phq-9
  - /tests/cabalistic-astrology
```

**Recomendación:** Crear redirects 301 desde rutas antiguas a nuevas:

```typescript
// middleware.ts o redirects en next.config.js
{
  source: '/tests/:code',
  destination: '/tests/:domain/:code',
  permanent: true
}
```

### Alineación de Códigos

**Problema:** El backend usa `ptsd` pero el documento sugiere `ptsd-check`

**Solución propuesta:**
1. Mantener `ptsd` en backend (ya implementado)
2. Usar `ptsd` en frontend también
3. Actualizar documentación para reflejar `ptsd`

---

## 🎨 Diseño y UX

### Colores por Dominio

- **Cábala:** Púrpura (`purple-500` a `purple-700`)
- **Psicología:** Azul (`blue-500` a `blue-700`)
- **Astrología:** Amarillo (`yellow-500` a `yellow-700`)

### Iconos

- **Cábala:** `Sparkles` (✨)
- **Psicología:** `Brain` (🧠)
- **Astrología:** `Star` (⭐)

### Componentes Reutilizables

- Cards de test con diseño consistente
- Badges de nivel de acceso
- Filtros visuales
- Formularios de ejecución

---

## 📝 Ejemplos de Uso

### Navegación desde Catálogo

```tsx
// Usuario hace clic en un test
router.push(`/tests/${domain}/${test.code}`);
```

### Ejecución de Test

```tsx
<TestExecution
  testCode="basic-analysis"
  domain="cabala"
  onResult={(result) => {
    // Redirigir a resultados
    router.push(`/tests/results/${result.result_id}`);
  }}
  onError={(error) => {
    // Mostrar error al usuario
    setError(error);
  }}
/>
```

### Filtrado por Dominio

```tsx
const filteredTests = tests.filter(test => {
  const domain = getTestDomain(test.code);
  return selectedDomain === 'all' || domain === selectedDomain;
});
```

---

## 🚀 Próximos Pasos

### Fase 1: Dashboard de Terapeutas (Prioridad Alta)

1. **Crear `/dashboard/therapist/tests`**
   - Catálogo completo de tests disponibles
   - Filtros por dominio
   - Búsqueda avanzada
   - Información de límites y acceso

2. **Crear `/dashboard/therapist/patients/[id]/tests`**
   - Lista de tests asignados al paciente
   - Asignar nuevos tests
   - Desasignar tests
   - Ver historial de asignaciones

3. **Crear `/dashboard/therapist/patients/[id]/results`**
   - Ver todos los resultados del paciente
   - Marcar favoritos
   - Generar reportes
   - Agregar notas y recomendaciones

### Fase 2: Dashboard de Pacientes (Prioridad Media)

1. **Crear `/dashboard/patient/tests`**
   - Solo tests asignados por el terapeuta
   - Filtros y búsqueda
   - Estado de cada test (completado/pendiente)

2. **Crear `/dashboard/patient/tests/[code]`**
   - Ejecución limitada a tests asignados
   - Validación de acceso antes de ejecutar

3. **Crear `/dashboard/patient/results`**
   - Historial propio de resultados
   - Reportes del terapeuta
   - Notas y recomendaciones recibidas

### Fase 3: Mejoras y Optimizaciones (Prioridad Baja)

1. **Migración completa**
   - Mover todas las páginas existentes a nueva estructura
   - Crear redirects 301
   - Actualizar todos los enlaces internos

2. **Alineación de códigos**
   - Revisar y alinear todos los códigos backend/frontend
   - Actualizar documentación

3. **Optimizaciones**
   - Caché de tests disponibles
   - Lazy loading de componentes
   - Mejoras de rendimiento

---

## 🐛 Problemas Conocidos

1. **Alineación de códigos:** `ptsd` vs `ptsd-check` necesita decisión
2. **Rutas antiguas:** Necesitan redirects para compatibilidad
3. **Lógica de acceso:** Pendiente implementar en frontend completo
4. **Asignación de tests:** Backend pendiente de verificar

---

## 📚 Referencias

- **Documento original:** `tests_rutas_map.md`
- **Backend API:** `backend/api/test_views.py`
- **Modelos:** `backend/api/test_models.py`
- **Tipos TypeScript:** `tonyblanco-app/lib/test-types.ts`
- **API Client:** `tonyblanco-app/lib/test-api.ts`

---

## ✅ Checklist de Implementación

### Base (Completado)
- [x] Componente `TestExecution`
- [x] Mapeo `test-domains.ts`
- [x] Página catálogo `/tests`
- [x] Página detalle `/tests/[domain]/[code]`
- [x] Estructura de carpetas

### Dashboard Terapeutas (Pendiente)
- [ ] Página catálogo terapeuta
- [ ] Página asignación de tests
- [ ] Página resultados de paciente
- [ ] Componente de asignación

### Dashboard Pacientes (Pendiente)
- [ ] Página tests asignados
- [ ] Página ejecución limitada
- [ ] Página historial de resultados
- [ ] Integración con reportes terapeuta

### Migración (Pendiente)
- [ ] Redirects 301
- [ ] Migración de páginas existentes
- [ ] Actualización de enlaces
- [ ] Alineación de códigos

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0.0
