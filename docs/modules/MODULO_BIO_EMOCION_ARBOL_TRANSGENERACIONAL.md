# Módulo "Bio-Emoción & Árbol Transgeneracional"

> **Rol objetivo**: `therapist`  
> **Contexto**: `therapist_clinical` (legacy/conceptual, no nuevo execution_mode)  
> **Visibilidad**: **solo terapeuta**, no disponible para usuarios  
> **Arquitectura**: **cerrada** (ver `PROJECT_STATE_CURRENT.md`) 

---

## 1. Propósito del módulo

Este módulo añade un espacio estructurado de trabajo para que el terapeuta pueda:

- Registrar información cualitativa sobre **bio-emoción** del consultante.
- Mapear y documentar el **árbol transgeneracional** (familia, vínculos, eventos clave).
- Mantener **trazabilidad y auditabilidad** sin introducir diagnósticos automáticos ni IA.
- Trabajar SIEMPRE dentro del contexto de un **consultante activo**, nunca en abstracto.

⚠️ **No es un test, no es un scoring automático**.  
⚠️ **No genera conclusiones diagnósticas**, solo estructura de datos y notas interpretativas controladas.

---

## 2. Reglas de arquitectura (resumen aplicado al módulo)

Basado en `PROJECT_STATE_CURRENT.md` y `PROMPT_MAESTRO_PLATAFORMA_CLINICA`:

- **Roles sellados**: `admin`, `therapist`, `personal`, `patient`.  
  → Este módulo es **exclusivo de `therapist`**.
- **Execution modes sellados**: `patient_self`, `therapist_clinical`.  
  → Este módulo trabaja **conceptualmente** en `therapist_clinical`, pero **no crea** execution modes nuevos.
- **Separación estricta de dashboards**:  
  → El módulo vive dentro del workspace del terapeuta y **no aparece** en dashboards de usuario/personal.
- **Backend no confía en frontend**:  
  → Todos los accesos se validan por backend (propiedad del paciente, rol terapeuta, etc.).
- **Legacy intocable**:  
  → No se modifica código legacy ni se refactoriza nada existente.

---

## 3. Modelo de datos (conceptual, sin romper nada existente)

### 3.1. Entidades clave

El módulo se apoya en las entidades ya existentes (`User`, `Patient`, `AnalysisRecord`) y añade **tablas auxiliares** para estructurar la información sin duplicar lógica clínica.

1. **BioEmocionCase** (caso de trabajo bio-emocional por consultante)
   - `id` (UUID)
   - `patient` (FK → `Patient`) (mapea al consultante/usuario)
   - `therapist` (FK → `User`, rol = therapist)
   - `title` (opcional, texto corto)
   - `description` (opcional, texto largo)
   - `created_at`
   - `updated_at`
   - `is_active` (bool)

2. **TransgenerationalNode** (nodo del árbol familiar)
   - `id` (UUID)
   - `case` (FK → `BioEmocionCase`)
   - `generation` (int, relativa al consultante: 0 = consultante, -1 = padres, -2 = abuelos, etc.)
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
  - Se registran **hechos y observaciones**, no juicios automáticos sobre diagnóstico.
- **Ligado a usuario activo**:  
  - Toda entrada requiere `patient` + `therapist` + `case` válidos.
- **Sin ruptura de AnalysisRecord**:  
  - El módulo NO modifica `AnalysisRecord`.  
  - Opcionalmente se podrían guardar referencias cruzadas (IDs de análisis relevantes) **solo como FK o UUID**, nunca embebiendo resultados con connotación diagnóstica.

---

## 4. Backend – Endpoints mínimos (solo terapeuta)

> Nota: Esta sección describe la **arquitectura esperada**, no obliga a implementarla en este commit.

Base: `/api/therapist/bio-emotion/`

1. `GET /api/therapist/bio-emotion/cases/`  
   Lista casos `BioEmocionCase` del terapeuta actual (opcionalmente filtrados por paciente activo).

2. `POST /api/therapist/bio-emotion/cases/`  
   Crea un caso nuevo para un `patient_id` existente (usuario/consultante), propiedad del terapeuta.

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
   Añade notas interpretativas (auditables) al caso.

**Permisos:**
- `IsAuthenticated` + `IsTherapist` (o permiso equivalente ya existente).  
- Verificación de `ownership` del paciente en cada operación.

**No permitido:**
- No hay endpoints para `patient` o `personal`.  
- No hay endpoints públicos.

---

## 5. Frontend – Integración mínima en Workspace del Terapeuta

### 5.1. Ubicación en el dashboard

- Sección nueva dentro del workspace del terapeuta (no visible para usuarios).
- Integrada en el patrón: **overview → secciones → acciones contextuales**.

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

## 6. UX / UI (fase 0 – segura y conservadora)

- **Tono**: profesional, respetuoso, sin lenguaje diagnóstico automatizado.
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
- ❌ No se exponen vistas al usuario.
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
9. Actualización del módulo: qué se hace a partir de ahora (estado actual)

Esta sección consolida las acciones inmediatas, acciones habilitadas y acciones explícitamente fuera de alcance, tomando como referencia la auditoría técnica y el estado real del proyecto.

9.1 Estado real confirmado (según auditoría)

A día de hoy:

✅ El workspace del terapeuta está operativo y estable.

✅ Existe ya una ruta dedicada al módulo bioemocional:

/dashboard/therapist/bioemotional

✅ Existen endpoints activos relacionados con bio-emoción y genealogía:

/api/bioemotional/dictionary/

/api/bioemotional/hypotheses/

/api/bioemotional/genealogy/*

✅ El hardening de roles y ownership está aplicado en backend.

❌ No existe aún persistencia estructurada de casos bio-emocionales como entidad unificada.

❌ No existe integración explícita con el Árbol de la Vida (solo implícita en otros módulos).

Conclusión:
El módulo ya existe funcionalmente, pero no está todavía elevado a módulo de primer nivel con alcance de intervención profesional.

9.2 Qué se implementa ahora (prioridad P1)
9.2.1 Unificación conceptual del módulo

A partir de ahora, el módulo se considera formalmente:

Un módulo de indagación estructural, exclusivo del terapeuta, que integra:

Bio-emoción

Transgeneracional

Lectura cabalística estructural (Árbol de la Vida, capa consultiva)

Esto no crea nuevos flujos, solo ordena y eleva lo ya existente.

9.2.2 Incorporación de la capa “Árbol de la Vida” (consultiva, no persistente)

Se habilita explícitamente lo siguiente:

Correlación síntoma → sefirá usando:

diccionario_bioemocional_2016.json

arbol_vida.py

Correlación transgeneracional → ejes del Árbol (Biná / Jojmá / Yesod / Maljut).

Lectura de Proyecto Sentido → Yesod como hipótesis estructural.

⚠️ Esta capa:

NO genera diagnósticos.

NO se guarda como dato estructurado de intervención clínica.

NO se muestra al usuario.

Puede ser generada por IA solo como apoyo privado al terapeuta.

(Ver Documento puente “Integración del Árbol de la Vida en el Módulo Bio-Emoción (v1)”).

9.2.3 Normalización del “caso bio-emocional”

Se establece como siguiente paso técnico crear una entidad unificadora (aunque inicialmente sea mínima):

Un caso activo por usuario (o varios, si el terapeuta lo decide).

Que agrupe:

hipótesis bioemocionales

genealogía

eventos

notas clínicas

Sin tocar AnalysisRecord.

Esto responde a una carencia detectada en la auditoría:
actualmente los datos están dispersos, no estructurados como caso clínico coherente.

9.3 Qué NO se hace ahora (explícitamente fuera de alcance)

Para evitar desviaciones, queda explícitamente fuera de este módulo:

❌ Meditaciones guiadas para pacientes.

❌ Actos simbólicos automáticos.

❌ Uso directo de los 72 Nombres de Dios con pacientes.

❌ Diario emocional del usuario.

❌ Escritura terapéutica asistida por IA para pacientes.

❌ Visualizaciones espirituales o rituales.

Todo lo anterior pertenece a una capa personal/experiencial, no al módulo clínico del terapeuta.

9.4 Relación con otros módulos (según auditoría)
Módulo	Relación con Bio-Emoción
Instrumentos externos (PHQ-9, BDI-II, etc.)	Bio-Emoción lee resultados, no los genera
AnalysisRecord	Puede referenciarse por ID, no modificarse
Tarot / Astrología / Gematría	Complementarios, no dependientes
SCDF	Bio-Emoción aporta comprensión, no scoring
Recursos paciente	No conectado
9.5 Orden de implementación recomendado (sin romper nada)

Basado en el roadmap y el estado actual:

Paso 1 (inmediato)

Formalizar el módulo como caso estructurado y auditado.

Mantener UI simple (lista + notas + genealogía).

Paso 2

Añadir la capa consultiva del Árbol de la Vida (no persistente).

IA solo como redacción privada para el terapeuta.

Paso 3

Documentar claramente la separación:

Bio-Emoción = comprensión

Prescripción simbólica = módulo aparte (futuro)

9.6 Estado final del módulo tras esta actualización

El módulo queda:

✔ alineado con la auditoría

✔ coherente con la arquitectura cerrada

✔ preparado para evolución sin deuda técnica

No se introduce riesgo legal ni operativo.

Se consolida como núcleo diferenciador profesional de la plataforma.

Nota final

Esta actualización no reescribe el módulo, lo actualiza al estado real del proyecto y fija con claridad:

qué se hace ahora

qué no se hace

dónde encaja cada cosa

---


## Integración UX

El módulo Bio-Emoción se integra como herramienta contextual

Dentro del Dashboard Terapéutico persistente.

- No rompe los flujos existentes
- No navega fuera del workspace
- Puede abrirse como panel auxiliar
- Comparte contexto con la Visualización Cuerpo–Alma
- Los campos de sexo biologico e identidad de genero son solo contexto y no activan logica transgeneracional

Esta integración refuerza su carácter consultivo y no diagnóstico.

## Documentos vinculantes adicionales (desde 18/12/2025)

Los siguientes documentos forman parte del **marco normativo activo del proyecto** y deben ser respetados en cualquier implementación presente o futura:

1. **Checklist Técnico P1 – Bio-Emoción & Árbol de la Vida**  
   Archivo:  
   `docs/CHECKLIST_TECNICO_P1_BIOEMOCION_Y_ARBOL_DE_LA_VIDA.md`  

   Define las tareas técnicas autorizadas para la fase P1 del módulo Bio-Emoción, incluyendo backend y frontend, sin romper la arquitectura cerrada ni mezclar capas de intervención profesional y experienciales.

2. **Módulo Personal / Experiencial – Conciencia y Reprogramación (Documento Espejo)**  
   Archivo:  
   `docs/MODULO_PERSONAL_EXPERIENCIAL_CONCIENCIA_Y_REPROGRAMACION.md`  

   Define explícitamente la capa **no clínica** del ecosistema.  
   Todo contenido experiencial, meditativo, simbólico o espiritual **debe vivir exclusivamente bajo este marco** y **no puede integrarse en módulos clínicos**.

3. ### Principio de Experiencia Corporal Vivida

Las preguntas relacionadas con gestación, parto, aborto o pérdida intrauterina
solo se formulan cuando existe experiencia corporal vivida relevante.

En ausencia de dicha experiencia:
- Las preguntas se reformulan en clave ancestral o sistémica
- Nunca se atribuyen experiencias biográficas inexistentes
- Se protege la coherencia terapéutica y simbólica

Este principio es terapéutico-profesional, no ideológico.
Nota:
Los campos de sexo biológico e identidad de género
no determinan ni activan preguntas transgeneracionales.

Las preguntas de gestación, parto o aborto
se rigen por el principio de experiencia corporal vivida,
no por identidad declarada.

Estos documentos actúan como **frontera arquitectónica y conceptual** y su incumplimiento se considera una desviación del estado sellado del proyecto.






