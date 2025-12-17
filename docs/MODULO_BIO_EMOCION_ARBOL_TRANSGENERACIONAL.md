# Módulo "Bio-Emoción & Árbol Transgeneracional"

> **Rol objetivo**: `therapist`  
> **Contexto**: `therapist_clinical` (conceptual, sin nuevo execution_mode)  
> **Visibilidad**: **solo terapeuta**, nunca paciente  
> **Arquitectura**: **cerrada** (ver `PROJECT_STATE_CURRENT.md`)

---

## 1. Propósito del módulo

Este módulo añade un espacio **clínico estructurado** para que el terapeuta pueda:

- Registrar información cualitativa sobre **bio-emoción** del paciente.
- Mapear y documentar el **árbol transgeneracional** (familia, vínculos, eventos clave).
- Mantener **trazabilidad y auditabilidad** sin introducir diagnósticos automáticos ni IA.
- Trabajar SIEMPRE dentro del contexto de un **paciente activo**, nunca en abstracto.

⚠️ **No es un test, no es un scoring automático**.  
⚠️ **No genera conclusiones diagnósticas**, solo estructura de datos + notas clínicas controladas.

---

## 2. Reglas de arquitectura (resumen aplicado al módulo)

Basado en `PROJECT_STATE_CURRENT.md` y `PROMPT_MAESTRO_PLATAFORMA_CLINICA`:

- **Roles sellados**: `admin`, `therapist`, `personal`, `patient`.  
  → Este módulo es **exclusivo de `therapist`**.
- **Execution modes sellados**: `patient_self`, `therapist_clinical`.  
  → Este módulo trabaja **conceptualmente** en `therapist_clinical`, pero **no crea** execution modes nuevos.
- **Separación estricta de dashboards**:  
  → El módulo vive **dentro del workspace clínico del terapeuta** y **no aparece** en dashboards de paciente/personal.
- **Backend no confía en frontend**:  
  → Todos los accesos se validan por backend (propiedad del paciente, rol terapeuta, etc.).
- **Legacy intocable**:  
  → No se modifica código legacy ni se refactoriza nada existente.

---

## 3. Modelo de datos (conceptual, sin romper nada existente)

### 3.1. Entidades clave

El módulo se apoya en las entidades ya existentes (`User`, `Patient`, `AnalysisRecord`) y añade **tablas auxiliares** para estructurar la información sin duplicar lógica clínica.

1. **BioEmocionCase** (caso de trabajo bio-emocional por paciente)
   - `id` (UUID)
   - `patient` (FK → `Patient`)
   - `therapist` (FK → `User`, rol = therapist)
   - `title` (opcional, texto corto)
   - `description` (opcional, texto largo)
   - `created_at`
   - `updated_at`
   - `is_active` (bool)

2. **TransgenerationalNode** (nodo del árbol familiar)
   - `id` (UUID)
   - `case` (FK → `BioEmocionCase`)
   - `generation` (int, relativa al paciente: 0 = paciente, -1 = padres, -2 = abuelos, etc.)
   - `relation` (texto corto: "madre", "padre", "abuelo materno", etc.)
   - `name` (texto, opcional)
   - `birth_year` (int, opcional)
   - `death_year` (int, opcional)
   - `notes` (texto, opcional)

3. **TransgenerationalEvent** (evento relevante en el sistema familiar)
   - `id` (UUID)
   - `case` (FK → `BioEmocionCase`)
   - `title` (texto corto)
   - `year` (int, opcional)
   - `description` (texto)
   - `linked_nodes` (M2M → `TransgenerationalNode`)

4. **BioEmocionNote** (nota clínica específica)
   - `id` (UUID)
   - `case` (FK → `BioEmocionCase`)
   - `author` (FK → `User`, rol = therapist)
   - `page_context` (texto corto: p.ej. "overview", "family-tree", "session-3")
   - `content` (texto)
   - `created_at`

### 3.2. Principios de diseño de datos

- **Auditabilidad por referencia**:  
  - Las tablas guardan **IDs, metadatos y páginas/contextos**, NO "conclusiones diagnósticas" cerradas.  
  - Se registran **hechos y observaciones**, no juicios clínicos automatizados.
- **Ligado a paciente activo**:  
  - Toda entrada requiere `patient` + `therapist` + `case` válidos.
- **Sin ruptura de AnalysisRecord**:  
  - El módulo NO modifica `AnalysisRecord`.  
  - Opcionalmente se podrían guardar referencias cruzadas (IDs de análisis relevantes) **solo como FK o UUID**, nunca embebiendo resultados clínicos.

---

## 4. Backend – Endpoints mínimos (solo terapeuta)

> Nota: Esta sección describe la **arquitectura esperada**, no obliga a implementarla en este commit.

Base: `/api/therapist/bio-emotion/`

1. `GET /api/therapist/bio-emotion/cases/`  
   Lista casos `BioEmocionCase` del terapeuta actual (opcionalmente filtrados por paciente activo).

2. `POST /api/therapist/bio-emotion/cases/`  
   Crea un caso nuevo para un `patient_id` existente, propiedad del terapeuta.

3. `GET /api/therapist/bio-emotion/cases/{id}/`  
   Devuelve:
   - Datos básicos del caso
   - Nodos del árbol (`TransgenerationalNode`)
   - Eventos (`TransgenerationalEvent`)
   - Notas (`BioEmocionNote`)

4. `POST /api/therapist/bio-emotion/cases/{id}/nodes/`  
   Crea/actualiza nodos del árbol.

5. `POST /api/therapist/bio-emotion/cases/{id}/events/`  
   Crea eventos y los vincula a nodos.

6. `POST /api/therapist/bio-emotion/cases/{id}/notes/`  
   Añade notas clínicas (auditables) al caso.

**Permisos:**
- `IsAuthenticated` + `IsTherapist` (o permiso equivalente ya existente).  
- Verificación de `ownership` del paciente en cada operación.

**No permitido:**
- No hay endpoints para `patient` o `personal`.  
- No hay endpoints públicos.

---

## 5. Frontend – Integración mínima en Workspace del Terapeuta

### 5.1. Ubicación en el dashboard

- Sección nueva dentro del workspace clínico del terapeuta.
- Integrada en el patrón: **overview → secciones clínicas → acciones contextuales**.

Posible estructura (conceptual):

- `/dashboard/therapist`  
  - Panel general + Paciente activo
  - Sección lateral o pestaña interna: **"Bio-Emoción & Árbol Transgeneracional"**

### 5.2. Componentes mínimos

1. **BioEmotionCaseList** (lista de casos por paciente)
   - Muestra casos existentes para el paciente activo.
   - Botón "Crear caso" (si no existe ninguno) o "Abrir caso".

2. **BioEmotionCaseView** (vista de caso activo)
   - Sub-secciones:
     - **Resumen**: datos básicos + metadatos.
     - **Árbol transgeneracional**: tabla/lista de `TransgenerationalNode` (sin visualización gráfica compleja en la fase 0).
     - **Eventos familiares**: lista de `TransgenerationalEvent`.
     - **Notas clínicas**: lista + formulario de `BioEmocionNote`.

3. **Integración con paciente activo**
   - Solo visible si hay **paciente activo** en el contexto de terapeuta.
   - Si no hay paciente activo: mostrar un mensaje claro:  
     "Selecciona un paciente para trabajar en el módulo Bio-Emoción & Árbol Transgeneracional".

### 5.3. Guards y acceso

- El módulo se renderiza **solo** dentro del dashboard terapeuta.
- Se reutilizan los guards existentes (`useRoleGuard`, contexto de sesión) para:
  - Verificar `role === 'therapist'`.
  - Asegurar que el paciente activo pertenece al terapeuta.

---

## 6. UX / UI (fase 0 – clínica segura)

- **Tono**: clínico, respetuoso, sin lenguaje diagnóstico automatizado.
- **Estados claros**:
  - Sin paciente activo → mensaje explicativo.
  - Sin casos creados → CTA "Crear primer caso".
  - Con casos → lista con fechas y breve descripción.
- **Sin IA, sin scoring**:
  - Todo lo que se muestra es **texto introducido por el terapeuta**.

---

## 7. Límites explícitos de esta fase

- ❌ No se modifica `AnalysisRecord` ni sus flujos.
- ❌ No se añaden nuevos roles.
- ❌ No se añaden nuevos execution modes.
- ❌ No se exponen vistas al paciente.
- ❌ No se implementa herramienta gráfica compleja de árbol (solo estructura tabular/lista).

- ✅ Se define una **estructura de datos clara y extensible** para el módulo.
- ✅ Se documenta la integración mínima esperada en backend y frontend.
- ✅ Se mantiene la arquitectura **cerrada** y coherente con el estado actual de la plataforma.

---

## 8. Próximos pasos recomendados (no implementados todavía)

1. Implementar modelos Django (`BioEmocionCase`, `TransgenerationalNode`, `TransgenerationalEvent`, `BioEmocionNote`) en `backend/api/models.py` con migraciones.
2. Crear serializers y views DRF bajo un `bio_emotion_views.py` separado para mantener el aislamiento.
3. Registrar URLs bajo `/api/therapist/bio-emotion/` sin romper rutas existentes.
4. Añadir componentes React mínimos en el dashboard terapeuta para listar y editar casos.
5. Escribir tests básicos (backend) que validen:
   - Solo terapeutas autenticados pueden acceder.
   - Solo el terapeuta dueño del paciente puede ver/editar casos.
   - Los datos se guardan sin conclusiones diagnósticas automáticas.

**Estado del módulo**: Documentado y diseñado. Implementación pendiente, respetando arquitectura sellada y reglas clínicas.
