# PROJECT STATE – LOCKED

## Arquitectura
- Frontend: Next.js App Router
- Backend: Django + DRF
- Auth: Token-based
- Roles: admin / therapist / personal / patient (SEALED)
- Execution modes: patient_self / therapist_clinical (SEALED)

## Núcleo de datos
- AnalysisRecord: IMPLEMENTADO
- Snapshots: birth_data_snapshot + algorithm_snapshot (inmutables)
- Adapters: clinical / kabbalah / astrology / legacy
- Service: create_and_execute_analysis
- Legacy: NO TOCADO

## Dashboards
- Admin: mínimo funcional
- Therapist: workspace clínico completo
- Personal: mínimo clínico
- Patient: pendiente de integración final


## Dashboard Terapéutico – Workspace Persistente (Estilo Orion)

Estado: IMPLEMENTADO (v1)

Se ha definido e implementado un dashboard terapéutico de tipo
**workspace persistente**, inspirado en portales clínicos Orion.

Características clave:
- El dashboard del terapeuta es el punto central del sistema
- No se navega entre páginas para trabajo clínico
- El cuerpo y la visualización simbólica son el ancla cognitiva
- El sidebar actúa como Panel de Control de Utilidades (no navegación)
- Las herramientas se abren como paneles superpuestos no destructivos

Este dashboard es considerado el **Master Point del terapeuta**.
Cualquier módulo futuro debe integrarse sin romper este workspace.

## Identidad del paciente - Separacion estricta

Estado: IMPLEMENTADO (v1)

Se incorpora separacion entre **sexo biologico** e **identidad de genero**.
Ambos campos son opcionales y su valor por defecto es `not_recorded`.

Reglas:
- Solo se muestran como contexto en el header del paciente
- Solo se editan desde "Editar perfil"
- No activan logica, filtros ni inferencias clinicas

## Contrato SWM (v1)

Estado: CONGELADO

El contrato tecnico de los Specialized Workspace Modules queda congelado como base SWM v1.
Documento vinculante:
`../03_SWM_CONTRACTS/CONTRATO_TECNICO_SWM.md`

### Auditoria — reintegracion post-T5

- Reintegracion del SWM Resonancia Ancestral por ruta propia, sin tocar core clinico ni legacy. Correccion post-T5.

## Reglas clave
- Admin no es actor clínico
- execution_mode nunca viene del request
- No autoevaluación
- Ownership terapeuta–paciente obligatorio

## Estado actual
- Build estable
- Zero regression
- Fase siguiente: consumidores de AnalysisRecord

## SWM v3 — Registro documental (2026-01-01)

- **Estado**: DOCUMENTATION-ENABLED (v3) — solamente documentación creada y aprobada para implementación futura por fases.
- **Propósito**: Registrar formalmente la habilitación documental de SWM v3 (Interpretación simbólica educativa asistida por IA) sin introducir cambios de código, endpoints ni rutas.
- **Documentos creados / añadidos**:
  - `docs/SWM_V3_INTERPRETACION_SIMBOLICA_GOBERNADA.md` (documento rector SWM v3)
  - `docs/SWM_V3_PHASE_CHECKLIST.md` (checklist técnico por fases, Phase 1→Phase 3)
  - `docs/SWM_V3_PR_TEMPLATE.md` (plantilla PR obligatoria para SWM v3)
  - `docs/SWM_V3_GOVERNANCE_ARTIFACTS.md` (artefactos de gobernanza: criterios, validaciones, stop conditions)
  - Actualizaciones: `docs/tarot-ai-plan.md`, `docs/00_SOURCE_OF_TRUTH/SOURCE_OF_TRUTH.md`, `docs/00_SOURCE_OF_TRUTH/AUDITORIA CABALA APP 12182025.md`, `docs/ARCHITECTURE_SYMBOLIC_SYSTEM.md`
- **Decisión operativa**: SWM v3 queda **autorizado** documentalmente para implementación futura por fases; cualquier trabajo de código deberá:
  - registrarse previamente en este archivo `01_PROJECT_STATE/PROJECT_STATE_CURRENT.md` con ticket/branch y alcance,
  - obtener sign-off de Auditoría (docs/00_SOURCE_OF_TRUTH/AUDITORIA CABALA APP 12182025.md),
  - respetar feature flags (`AI_TAROT_ENABLED` por defecto `false`) y modos de persistencia (`no_store` | `store_anonymized` | `store_with_consent`).
- **Restricciones inmediatas**: No modificar `src/`, no crear endpoints, no cambiar rutas, no refactorizar ni preparar código sin aprobación explícita de Auditoría.
- **Registro**: entrada creada por agente documental el 2026-01-01. Referencias incluidas arriba.

- **Phase 2 Implementation (2026-01-01)**: CODE-LIMITED feature added to `tonyblanco-app` UI under feature-flag `NEXT_PUBLIC_SWM_V3_ENABLED`.
  - **Estado**: COMPLETED (UI gated + consent modal + deterministic mock engine; no persistence).
  - **Scope**: single secondary CTA button in Tarot sidebar, consent modal (opt-in), deterministic mock interpretation using Phase 1 example deck, read-only result panel. NO endpoints, NO storage, NO IA real.
  - **Commit**: feat(swm-v3): phase 2 ui gated consent and mock interpretation

---

## TreeStructuralState System — Unified Symbolic Visualization

### Phase 1: TreeStructuralState v0.1 Contract ✅
**Estado**: IMPLEMENTADO (commit eeb0f3f2)

**Alcance**: Contrato único e inmutable para todos los métodos simbólicos cabalísticos.

**Entregables**:
- `tree-structural-state.types.ts`: Interfaz TreeStructuralState (source, sefirot, flows, notes)
- `pitagoras-tree-adapter.ts`: Adaptador de Pitágoras → TreeStructuralState
- `TreeWithFlows.tsx`: Componente SVG con flechas dinámicas (verde=harmonic, naranja=integrative, rojo=tensional)
- Integración en `CabalAppliedVisualCore.tsx`

**Reglas**:
- TreeStructuralState v0.1 es **INMUTABLE** y **NO NEGOCIABLE**
- Todos los métodos DEBEN usar este contrato
- NO se crearán contratos alternativos
- Compatibilidad ES5 obligatoria (sin Map, Set, Object.entries)

### Phase 2: Standardization of All Methods ✅
**Estado**: IMPLEMENTADO (commit b0a37015)

**Alcance**: Aplicar TreeStructuralState v0.1 a los 10 métodos simbólicos existentes.

**Entregables**:
- `generic-method-adapter.ts`: Adaptador reutilizable para todos los métodos
- 10 adaptadores específicos:
  - gematria-standard-tree-adapter.ts
  - gematria-katan-tree-adapter.ts
  - mispar-gadol-tree-adapter.ts
  - mispar-siduri-tree-adapter.ts
  - milui-tree-adapter.ts
  - atbash-tree-adapter.ts
  - albam-tree-adapter.ts
  - avgad-tree-adapter.ts
  - temurah-tree-adapter.ts
  - notarikon-tree-adapter.ts
- Integración completa en Workspace con switch case

**Resultado**: Los 10 métodos ahora generan TreeStructuralState compatible con TreeWithFlows.

### Phase 3: AI-Assisted Symbolic Interpretation Layer ✅
**Estado**: IMPLEMENTADO (commit 356f92ce)

**Alcance**: Capa de interpretación simbólica asistida por IA (SAFE / NON-CLINICAL / SYMBOLIC ONLY).

**Entregables**:
- `symbolic-interpreter.types.ts`: Tipos para SymbolicInterpretation, SymbolicObservation, safety metadata
- `symbolic-interpreter.ts`: Lógica de interpretación con 5 capas de seguridad
- `backend/api/utils/symbolic_interpreter_ai.py`: Integración Gemini con validación
- `SymbolicInterpretationPanel.tsx`: Panel UI con disclaimers prominentes
- Integración en `CabalAppliedVisualCore.tsx`

**Arquitectura de Seguridad (5 capas)**:
1. **Frontend pre-request**: Validación de TreeState antes de envío
2. **Backend API**: Detección de datos personales, validación de estructura
3. **Prompt engineering**: Instrucciones STRICT LIMITS embebidas en prompt
4. **Response filtering**: Filtrado de 14 términos prohibidos post-generación
5. **UI warnings**: Advertencias visibles si contenido sospechoso detectado

**Reglas de Seguridad**:
- ❌ NO diagnosis clínico
- ❌ NO consejos personales
- ❌ NO etiquetas psicológicas
- ❌ NO determinismo ("siempre", "nunca", "debes")
- ✅ SOLO observaciones estructural-simbólicas
- ✅ Lenguaje educativo y formativo
- ✅ Acceso READ-ONLY a TreeStructuralState (sin datos personales)

**Términos Prohibidos** (14):
diagnóstico, diagnosis, trastorno, disorder, patología, pathology, enfermedad, disease, debes, must, tienes que, have to, definitivamente, definitely, siempre, always, nunca, never, etc.

**Fallback**: Sistema de interpretación algorítmica cuando IA no disponible.

### Phase 4: Professional Kabbalistic Analyst Prompt ✅
**Estado**: IMPLEMENTADO (2025-12-23, pendiente commit)

**Alcance**: Upgrade del prompt de IA de nivel educativo genérico a **analista profesional cabalístico**.

**Entregables**:
- Prompt profesional con rol definido: "Symbolic Structural Analyst (Kabbalistic)"
- 4 secciones obligatorias de output:
  1. **Structural Panorama** (structural-analysis): Densidad, énfasis vertical/horizontal, triadas
  2. **Sefirotic Dynamics** (pattern-recognition): Relaciones, polaridades, balances
  3. **Methodological Context** (educational-context): Qué enfatiza el método, qué NO captura
  4. **Professional Keys** (symbolic-comparison): Cues observacionales, preguntas exploratorias
- Fallback mejorado con cálculos profesionales:
  - Filtrado de sefirot dominantes vs presentes
  - Conteo de flujos por polaridad (harmonic/integrative/tensional)
  - Análisis de énfasis vertical (flujos que cruzan triadas)
  - Determinación de densidad estructural (complex/moderate/concentrated)
- Documentación actualizada: `SYMBOLIC_INTERPRETER_AI_IMPLEMENTATION.md`
- Documento técnico nuevo: `SYMBOLIC_INTERPRETER_PROFESSIONAL_PROMPT.md`

**Audiencia**:
- **Trainers de Cábala**: Profesionales que enseñan análisis cabalístico
- **Practitioners avanzados**: Analistas que trabajan con TreeStructuralState
- **Uso formativo**: Contexto educativo sin aplicación clínica directa

**Diferencias vs Phase 3**:
- Antes: Prompt genérico con 3-4 observaciones variables
- Ahora: Estructura fija de 4 secciones con tipos específicos
- Antes: Fallback básico ("Estructura básica identificada")
- Ahora: Fallback algorítmico profesional con análisis de triadas
- Antes: Lenguaje educativo genérico
- Ahora: Terminología cabalística profesional (triadas, polaridades, columnas)

**Reglas Mantenidas**:
- ✅ Todas las reglas de seguridad de Phase 3
- ✅ 5 capas de validación intactas
- ✅ 14 términos prohibidos mantenidos
- ✅ NO diagnosis, NO consejos, NO determinismo

**Modelo de IA**:
- Gemini 1.5-flash
- temperature=0.7, top_p=0.8, top_k=40, max_tokens=1024
- Modo: JSON-only response

### Documentación de Referencia:
- `../04_SYMBOLIC_SYSTEM/TREE_STRUCTURAL_STATE_PHASE_2_STANDARDIZATION.md` (Phase 2 completion)
- `../04_SYMBOLIC_SYSTEM/SYMBOLIC_INTERPRETER_AI_IMPLEMENTATION.md` (Phase 3+4 implementation)
- `../04_SYMBOLIC_SYSTEM/SYMBOLIC_INTERPRETER_PROFESSIONAL_PROMPT.md` (Phase 4 technical spec)

---

## Sección Vinculante — UX Clínico
## Principios de Representación Simbólica (VINCULANTE)

### Regla del sistema (NO NEGOCIABLE)

🧩 **Todo símbolo clínico profundo se expresa como SVG semántico desacoplado.**

Definición:
- Los símbolos clínicos profundos (Sefirot, Árbol de la Vida, cuerpo simbólico, cartas arquetípicas, mapas transgeneracionales, etc.)
  **NO contienen lógica React, estado ni inferencias clínicas**.
- Su representación se define como **SVG puro, semántico y reutilizable**.
- Los símbolos clínicos profundos (Sefirot, Árbol de la Vida, cuerpo simbólico, cartas arquetípicas, mapas transgeneracionales, etc.)
  **NO contienen lógica React, estado ni inferencias clínicas**.
- Su representación se define como **SVG puro, semántico y reutilizable**.

Motivos:
- Permite reutilización del símbolo:
  - En múltiples SWM
  - En modo standalone
  - En exportaciones futuras (PDF / imagen)
- Evita acoplamiento entre:
  - Visualización simbólica
  - Lógica clínica
  - Motor de inferencia
- Preserva el valor cognitivo y pedagógico del símbolo.

Integración permitida:
- El SVG puede emitir eventos semánticos (`click`, `hover`) desacoplados
- La lógica React escucha esos eventos **desde fuera**
- El SVG nunca conoce el contexto clínico ni al paciente

Prohibiciones:
❌ No lógica React dentro del SVG  
❌ No estado clínico embebido  
❌ No inferencias automáticas  
❌ No dependencias de hooks o stores  

Este patrón es obligatorio para:
- Body–Soul Visualization
- Árbol de las Sefirot
- Cabalá aplicada
- Bio-Emoción
- Transgeneracional
- Tarot / Astrología simbólica

🔒 **Estado: BLOQUEADO**


### Catálogo Clínico vs Workspace (Estado Cerrado)

**Estado: CERRADO / NO INTERPRETABLE**

Esta sección define de forma definitiva y no negociable la relación entre:
- Workspace Clínico del Terapeuta
- Catálogo Clínico de Tests

Cualquier cambio futuro en UX/UI debe respetar estrictamente este modelo conceptual.

### Principio Arquitectónico Central

🚨 **El Catálogo Clínico es una ENTIDAD GLOBAL**

El Catálogo Clínico:
- Existe a nivel de plataforma
- Es compartido entre:
  - Terapeutas
  - Pacientes
  - Flujos futuros (marketplace, monetización, licencias)
- Centraliza:
  - Descubrimiento de tests
  - Información educativa de tests
  - Modales explicativos ("¿Qué es este test?")
  - Asignación de tests
  - Evolución futura del sistema

❌ **El Catálogo NO pertenece a ningún Workspace**  
❌ **El Catálogo NO vive dentro del contexto de un paciente**  
❌ **El Catálogo NO es un componente embebido**

### Definición Formal de Capas

#### 🧠 Workspace Clínico del Terapeuta

**Rol: Contexto + Acción**

El Workspace es estrictamente paciente-céntrico.

**Contiene:**
- Paciente activo
- Estado clínico actual
- Tests asignados
- Resultados
- Progreso
- Acciones clínicas inmediatas

**No contiene:**
- Catálogos globales
- Sistemas de exploración
- Descubrimiento de tests
- Lógicas de marketplace

👉 **El Workspace solo enlaza al Catálogo.**

#### 📚 Catálogo Clínico

**Rol: Sistema global de descubrimiento y asignación**

El Catálogo:
- Vive fuera de cualquier Workspace
- Es agnóstico al paciente por defecto
- Puede contextualizarse mediante `patient_id` (solo vía URL)

**Ubicación canónica:**
```
/dashboard/therapist/tests
/dashboard/therapist/tests?patient_id={id}
```

### Flujo Funcional Canónico (CERRADO)

Este flujo YA EXISTE y NO puede romperse:

1. Terapeuta selecciona paciente activo en Workspace
2. Terapeuta pulsa "Asignar tests"
3. Navegación explícita a:
   ```
   /dashboard/therapist/tests?patient_id={id}
   ```
4. Se muestra el Catálogo completo
5. Terapeuta asigna tests desde el Catálogo
6. Los tests asignados aparecen automáticamente en el Workspace

⚠️ **Este flujo no se reimplementa, no se replica y no se simplifica.**

### Reglas Absolutas (Bloqueantes)

❌ NO mover el Catálogo dentro del Workspace  
❌ NO duplicar el Catálogo  
❌ NO embeber el Catálogo en paneles colapsables  
❌ NO anidar el Catálogo bajo contexto de paciente  
❌ NO eliminar modales informativos de tests  
❌ NO modificar rutas, lógica de asignación ni backend  
❌ NO alterar execution_mode ni flujos clínicos

**Cualquier cambio que viole estas reglas se considera inválido.**

### Permisos UX (ÚNICOS permitidos)

✔ Mejorar jerarquía visual del Workspace  
✔ Reducir ruido y scroll innecesario  
✔ Clarificar visualmente "dónde vive" cada cosa  
✔ Añadir CTAs claros hacia el Catálogo  
✔ Uso de cards, espaciado, tipografía e iconografía  
✔ Mejorar affordances de navegación

⚠️ **Siempre sin alterar lógica ni arquitectura.**

### Modelo Mental Obligatorio (Referencia)

```
Workspace = acción clínica contextual
Catálogo = sistema global de descubrimiento
```

La UI debe hacer sentir:
- El Workspace como **foco**
- El Catálogo como **espacio amplio y global**

La transición entre ambos debe ser **intencional y explícita**, nunca implícita.

### Checklist de Validación (Obligatorio antes de merge)

- [ ] El Catálogo NO se renderiza en JSX del Workspace
- [ ] El Workspace solo contiene links/CTAs al Catálogo
- [ ] La ruta `/dashboard/therapist/tests` permanece intacta
- [ ] La asignación de tests funciona como antes
- [ ] Los modales informativos siguen activos
- [ ] No se tocó backend ni contratos
- [ ] No hay duplicación visual del Catálogo

**Si cualquier punto falla → NO SE MERGEA**

### Nota Final de Gobernanza

Este proyecto es una **plataforma clínica**, no una app experimental.

El objetivo del UX es:
- Clarificar
- Respetar capas
- Reforzar el modelo mental

**No** reinterpretar arquitectura.  
**No** colapsar conceptos.  
**No** "mejorar" rompiendo límites.

🔒 **Estado: BLOQUEADO**

Cualquier modificación futura requiere actualización explícita de este documento.

## Documentation Governance
- **Status:** RESOLVED (Chaos eliminated)
- **Rule:** All documentation centralized in `/docs` with canonical structure.
- **Reference:** See `../00_SOURCE_OF_TRUTH/SOURCE_OF_TRUTH.md`.
- **Date:** 2025-12-24

“Any documentation generated by humans or AI MUST be placed under /docs following the canonical structure.
Documentation created outside this structure is considered invalid and must be relocated before further development.”
