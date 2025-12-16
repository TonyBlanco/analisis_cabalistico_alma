# Dashboard Personal - Integración Frontend

## Fase: PERSONAL DASHBOARD ACTIVATION

**Fecha de implementación:** Diciembre 2025

**Objetivo:** Activar el dashboard PERSONAL como espacio de exploración no clínica, con tests ligeros, recursos educativos y un camino de upsell suave (sin pagos aún).

---

## Contexto

- El rol "personal" ya existe y autentica correctamente.
- El Panel Personal se renderizaba pero no tenía contenido funcional.
- El área del sidebar izquierdo estaba visualmente vacía.
- AnalysisRecord ya soporta análisis no clínicos.

---

## Reglas Funcionales (No Negociables)

### PERSONAL users NO DEBEN ver:
- Tests clínicos
- Lenguaje de diagnóstico
- Scoring médico o psicológico

### Todas las interpretaciones deben ser:
- Cabalísticas
- Simbólicas
- Comportamentales-ligeras
- Educativas

---

## Implementación Realizada

### 1. Sidebar Izquierdo para PERSONAL

**Archivo:** `tonyblanco-app/app/(dashboard)/dashboard/personal/page.tsx`

**Cambios:**
- Reorganizado el layout en **grid de dos columnas** (solo en pantallas grandes):
  - **Sidebar izquierdo (~260px)** con navegación:
    - **Exploraciones** (seleccionada por defecto)
    - **Tests personales**
    - **Recursos**
    - **Audios**
    - **Videos**
    - **Cursos**: Bloqueado (🔒, gris, `cursor-not-allowed`, tooltip "Próximamente disponible")
    - **Premium**: Deshabilitado, texto "Próximamente"
  - **Contenido principal (derecha)** con header, tests personales, recursos y CTA de upgrade.

**Protección:**
- El sidebar **solo aparece para `role === 'personal'`** (y `admin` en modo simulación).
- Protegido por `useRoleGuard` con `allowedRoles: ['personal', 'admin']`.

---

### 2. Catálogo de Tests Personales

**Archivo:** `tonyblanco-app/components/PersonalTestsSection.tsx`

**Mejoras de lenguaje:**
- Título cambiado a: **"Exploraciones personales"**
- Subtítulo: "Tests simbólicos y cabalísticos orientados al autoconocimiento y al crecimiento personal."

**Características de cada test:**
- **Tag visual**: "Exploración personal" (chip azul)
- Botón **"Explorar"** que navega a `/dashboard/personal/{test.code}`
- Sección de completados renombrada a: **"Mis exploraciones recientes"**

**Filtrado:**
- Solo muestra tests con `available_for_personal === true`
- Excluye tests marcados solo para terapeutas (`available_for_therapists === true && available_for_personal === false`)
- No hay lenguaje de "evaluación clínica", "diagnóstico", etc.

---

### 3. Ejecución de Tests y Resultados

**Archivo:** `tonyblanco-app/app/(dashboard)/dashboard/personal/[...slug]/page.tsx`

**Funcionalidad:**
- Convertido de catch-all redirect a **página de ejecución de exploraciones personales**

**Protección de rol:**
- Usa `getUserRole()` + `useRoleGuard` para permitir solo `personal` o `admin`
- Otros roles son redirigidos a `/dashboard`

**Carga de datos:**
- Deriva `testCode` del primer segmento de `slug`
- Usa `getTestDetail(testCode)` para cargar metadatos del test
- Llama a `getTestResults({ test_code: testCode })` y toma el **último resultado** (ordenado por `created_at`)

**Ejecución inmediata:**
- Botón **"Iniciar nueva exploración"** ejecuta:
  ```typescript
  executeTest({
    test_module_code: test.code,
    input_data: {},
    save_result: true,
  })
  ```
- Si el backend devuelve `result_id`, recarga con `getTestResult(result_id)`
- Actualiza `latestResult` en memoria

**Vista de resultados:**
- Bloque "Mis exploraciones con este test":
  - Si no hay resultado: mensaje suave
  - Si hay resultado: muestra fecha y `result_data` formateado con `JSON.stringify`
  - Mensaje: "Interpretación simbólica (contenido generado automáticamente, no clínico)"

**Filtro de tests clínicos (seguridad extra):**
- Tabla `CLINICAL_TYPES` con códigos: `pai`, `scl90`, `stai`, `mcmi-iv`, `scid5`, `bdi`, `bai`
- Si `test.test_type` está en ese set:
  - No muestra botón de ejecutar
  - Muestra aviso: "Esta herramienta está reservada para contextos profesionales y no se puede ejecutar desde el Panel Personal"

**Lenguaje y UX:**
- Copy enfatiza: "Exploración personal", "interpretación simbólica", "autoconocimiento"
- Mensaje explícito: **"No es un diagnóstico ni una evaluación clínica"**
- Botón "Volver" regresa a `/dashboard/personal`

---

### 4. Sección de Recursos

**Archivo:** `tonyblanco-app/components/PersonalResourcesSection.tsx` (nuevo)

**Características:**
- **Datos estáticos** (no requiere endpoints nuevos):
  - Videos, audios, PDFs y mini-cursos
  - Ejemplos:
    - "Introducción a la Cábala para el día a día" (video, libre)
    - "Audio guía: Respiración consciente y nombre propio" (audio, libre)
    - "Cuaderno de auto-reflexión cabalística" (PDF, libre)
    - "Mini-curso: Tu historia en el Árbol de la Vida" (mini-curso, bloqueado)
    - "Meditación guiada: Camino de autoconocimiento" (audio, bloqueado)

**Cada tarjeta muestra:**
- Ícono según tipo (🎥, 🎧, 📄, 📚)
- Descripción breve desde enfoque educativo/simbólico
- Chip de acceso: **"Libre"** (verde) o **"Bloqueado"** (gris)
- Label: "Video / Audio / PDF / Mini-curso · Exploración personal"

**Interacción de locked:**
- Click en recurso bloqueado muestra mensaje:
  - **"Disponible con acompañamiento profesional."**
- No hay pagos, checkout ni suscripciones

**Integración:**
- Añadido en `personal/page.tsx` como sección propia debajo de los tests

---

### 5. Persistencia de Resultados

**Persistencia real:**
- `executeTest` se llama con `save_result: true`
- Usa endpoint existente `/tests/execute/`
- `getTestResults` y `getTestResult` leen de `/tests/results/`

**Visibilidad en "Mis exploraciones":**
- En `PersonalTestsSection`, la sección "Mis exploraciones recientes" usa `getTestResults()` para marcar tests completados
- En la página de detalle (`[...slug]/page.tsx`), el bloque "Mis exploraciones con este test" muestra el último resultado
- Si el usuario cambia de rol a paciente, estos resultados siguen asociados a su usuario (mismos endpoints globales)

---

### 6. Lenguaje y Separación Clínica

**En todo el flujo PERSONAL:**
- **NO se usan palabras como:**
  - "diagnóstico"
  - "trastorno"
  - "evaluación clínica"
- **Tono enfocado en:**
  - Autoconocimiento
  - Exploración
  - Crecimiento personal
- **Tests clínicos bloqueados explícitamente** en el runner personal

**No se ha modificado:**
- Dashboard de terapeuta/paciente
- Flujos clínicos existentes
- Solo se reutilizan APIs de tests de manera segura

---

## Archivos Modificados/Creados

### Modificados:
1. `tonyblanco-app/app/(dashboard)/dashboard/personal/page.tsx`
   - Layout con sidebar izquierdo
   - Integración de `PersonalResourcesSection`

2. `tonyblanco-app/components/PersonalTestsSection.tsx`
   - Cambios de lenguaje (no clínico)
   - Tag "Exploración personal" en cada test
   - Sección "Mis exploraciones recientes"

3. `tonyblanco-app/app/(dashboard)/dashboard/personal/[...slug]/page.tsx`
   - Convertido de catch-all a página de ejecución
   - Protección contra tests clínicos
   - Vista de resultados

### Creados:
1. `tonyblanco-app/components/PersonalResourcesSection.tsx`
   - Componente nuevo con recursos estáticos
   - Manejo de recursos bloqueados/libres

---

## Endpoints Utilizados (Existentes)

- `GET /api/tests/` - Obtener tests disponibles
- `GET /api/tests/{code}/` - Detalle de un test
- `POST /api/tests/execute/` - Ejecutar test (con `save_result: true`)
- `GET /api/tests/results/` - Obtener resultados del usuario
- `GET /api/tests/results/{id}/` - Detalle de un resultado

**No se crearon nuevos endpoints.** Todo usa APIs existentes.

---

## Protecciones Implementadas

1. **Filtrado por rol:**
   - `useRoleGuard` en todas las páginas PERSONAL
   - Solo `personal` y `admin` pueden acceder

2. **Filtrado de tests clínicos:**
   - Frontend filtra por `available_for_personal === true`
   - Tabla `CLINICAL_TYPES` bloquea tests clínicos conocidos en el runner

3. **Lenguaje no clínico:**
   - Copy revisado para evitar términos médicos/psicológicos
   - Mensajes explícitos: "No es un diagnóstico ni una evaluación clínica"

---

## Estado Final

✅ **Dashboard PERSONAL funcional:**
- Sidebar izquierdo con navegación
- Catálogo de tests personales con tags
- Ejecución inmediata de tests
- Persistencia de resultados
- Sección de recursos (estática)
- Lenguaje no clínico en todo el flujo
- Protección contra tests clínicos

✅ **Sin regresiones:**
- No se modificó backend
- No se tocó AnalysisRecord
- No se cambió lógica de ejecución
- Dashboards de terapeuta/paciente intactos

---

## Notas Técnicas

- El sidebar solo aparece en pantallas grandes (`lg:grid-cols-[260px,1fr]`)
- En móviles, el layout se apila verticalmente
- Los recursos son estáticos (no requieren backend)
- Los resultados se muestran como JSON formateado (puede mejorarse con componentes especializados en el futuro)
- El filtro de tests clínicos es una capa de seguridad extra en el frontend

---

## Próximos Pasos Opcionales

1. **Mejoras visuales:**
   - Resaltar sección activa en el sidebar
   - Añadir iconos por item del sidebar
   - Mejorar rendering de `result_data` con componentes especializados

2. **Funcionalidad adicional:**
   - Implementar navegación real en el sidebar (routing a secciones)
   - Conectar botones "Abrir" de recursos libres con contenido real
   - Añadir búsqueda/filtrado en el catálogo de tests

3. **UX:**
   - Añadir animaciones suaves
   - Mejorar feedback visual durante ejecución
   - Añadir tooltips informativos

---

**Implementado por:** Auto (AI Assistant)  
**Revisado:** Pendiente  
**Estado:** ✅ Completado
