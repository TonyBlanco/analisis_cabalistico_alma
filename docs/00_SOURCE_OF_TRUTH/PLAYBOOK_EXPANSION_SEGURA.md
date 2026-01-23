<!--
  PLAYBOOK_EXPANSION_SEGURA.md
  Estado: CANÓNICO / BLOQUEANTE / POST-NÚCLEO
  Fecha: 2026-01-23
  Propósito: Definir cómo expandir el proyecto sin tocar ni erosionar el núcleo MCMI-4 Místico.
-->

# PLAYBOOK DE EXPANSIÓN SEGURA — MCMI-4 MÍSTICO

**ESTADO:** CANÓNICO / BLOQUEANTE / POST-NÚCLEO

Este documento define las reglas inmutables para añadir nuevos módulos, workspaces, visualizaciones o herramientas simbólicas al proyecto **sin tocar ni erosionar el núcleo MCMI-4 Místico**. Su objetivo es permitir crecimiento controlado del sistema mientras se protege la estabilidad del núcleo sellado.

-----

## A. PRINCIPIO FUNDAMENTAL

1. El núcleo MCMI-4 Místico NO se toca. Toda expansión ocurre FUERA del núcleo.  
2. Ninguna expansión puede modificar, duplicar, reinterpretar ni sustituir el núcleo.  
3. Si una expansión requiere cambios en el núcleo para funcionar, debe rechazarse y rediseñarse como módulo completamente independiente.

-----

## B. ZONAS DEL SISTEMA (mapa de navegación)

### 1. NÚCLEO SELLADO (INTOCABLE)

Archivos y conceptos bajo protección absoluta:

- `backend/swm/mcmi4/services/questionnaire_service.py` (selección, rotación, constantes)  
- `backend/data/mcmi4_mystic_questions_*.json` (bancos de preguntas)  
- `backend/swm/mcmi4/views.py` (endpoints del cuestionario y workspace)  
- Flujo SIGNAL → CTA → MCMI-4 (195) → Workspace 4 fases  
- Artifacts: `questionnaire_config`, `questionnaire_progress`, `questionnaire_completion`, `phase:*`, `notes`

**Regla:** Ninguna expansión puede leer/escribir directamente en estos archivos ni alterar su comportamiento runtime.

### 2. PERIFERIA FUNCIONAL (EXPANDIBLE)

Módulos que pueden crecer sin afectar el núcleo:

- Nuevos SWM independientes (otros modelos simbólicos fuera del MCMI-4)  
- Integraciones con herramientas externas (calendarios, recordatorios, journaling)  
- Módulos de auditoría y reporting no invasivos  
- Dashboards de visualización (siempre en modo lectura)

**Regla:** Estos módulos pueden existir en paralelo pero no pueden modificar datos del núcleo.

### 3. UX COMPLEMENTARIA (EXPANDIBLE)

Elementos de interfaz que apoyan sin alterar:

- Nuevos componentes visuales (gráficos, diagramas del Árbol de la Vida)  
- Herramientas de navegación y filtrado de resultados históricos  
- Export/Import de datos en formatos estándar (JSON, CSV) solo-lectura  
- Modos de accesibilidad (alto contraste, lectores de pantalla)

**Regla:** La UX puede evolucionar siempre que no cambie el flujo canónico ni introduzca automatismos diagnósticos.

### 4. VISUALIZACIÓN / REPORTING SIMBÓLICO (EXPANDIBLE)

Herramientas de síntesis post-workspace:

- Generación de narrativas simbólicas (texto guiado, no automático)  
- Gráficos de tensiones entre mundos (visualización, no interpretación)  
- Informes para compartir con el consultante (revisión del terapeuta obligatoria)  
- Líneas de tiempo de múltiples workspaces (evolución simbólica)

**Regla:** Toda visualización debe ser claramente simbólica, no clínica. Incluir disclaimers explícitos.

### 5. INVESTIGACIÓN / LABORATORIO (EXPANDIBLE)

Espacio para prototipos y experimentos:

- Prototipos de nuevos módulos simbólicos (no basados en MCMI-4)  
- Análisis estadísticos agregados y anónimos (solo con consentimiento)  
- Herramientas de exploración de datos históricos (modo solo-lectura)  
- Workshops y experimentos terapéuticos (fuera de producción)

**Regla:** Todo lo experimental debe ocurrir en entornos aislados (`/lab`, `/experimental`) y con etiquetas claras. Nunca mezclarlo con producción.

-----

## C. TIPOS DE EXPANSIÓN PERMITIDOS

### 1. Nuevos SWM Independientes

- Permitido: Crear módulos simbólicos completamente separados (por ejemplo, `eneagrama_swm`, `tarot_swm`, `i_ching_swm`).  
- Requisitos: Backend propio, frontend propio, sin dependencias del núcleo MCMI-4.

### 2. Visualizaciones Simbólicas

- Permitido: Diagramas, gráficos y mapas que representen datos ya existentes del workspace.  
- Requisitos: Solo lectura, no interpretación automática, disclaimer simbólico visible.

### 3. Informes Narrativos Post-Workspace

- Permitido: Generación de PDFs o documentos con resumen simbólico del workspace.  
- Requisitos: Revisión manual del terapeuta, no automatización clínica, consentimiento del consultante.

### 4. Herramientas de Apoyo al Terapeuta

- Permitido: Checklists, guías de preguntas, recursos educativos, templates de sesión.  
- Requisitos: No debe automatizar decisiones clínicas ni sustituir criterio del terapeuta.

### 5. Protocolos de Trabajo (no tests)

- Permitido: Flujos de trabajo terapéutico que usen resultados del MCMI-4 como insumo (por ejemplo, un protocolo de 8 sesiones post-workspace).  
- Requisitos: El protocolo no puede modificar ni reinterpretar el núcleo; solo consume datos en modo lectura.

-----

## D. EXPANSIONES PROHIBIDAS (lista bloqueante)

Las siguientes expansiones están PROHIBIDAS y deben rechazarse automáticamente:

1. **Variantes del MCMI-4:** No crear "MCMI-4 Short", "MCMI-4 Lite", "MCMI-4 Extended" ni ninguna versión modificada del núcleo.  
2. **Mezclar scoring nuevo con resultados del núcleo:** No crear algoritmos de scoring que modifiquen o reinterpreten datos del MCMI-4.  
3. **Automatizar decisiones clínicas o simbólicas:** No crear sistemas de recomendación automática basados en resultados.  
4. **Duplicar funcionalidad existente:** No rehacer el cuestionario, el workspace o el flujo SIGNAL.  
5. **Introducir lenguaje diagnóstico:** No añadir etiquetas clínicas, DSM-5, CIE-10 ni interpretaciones médicas.  
6. **Modificar datos históricos:** No crear herramientas que alteren artifacts completados sin autorización explícita.  
7. **Ejecutar el núcleo desde expansiones:** No automatizar la asignación o ejecución del MCMI-4 desde módulos externos.

-----

## E. REGLA DE INTERFAZ CON EL NÚCLEO

Toda expansión que necesite interactuar con el núcleo debe respetar las siguientes reglas:

### 1. Solo Lectura de Resultados Simbólicos

- Permitido: Leer artifacts sellados (`questionnaire_completion`, `phase:*`) para visualización o análisis.  
- Prohibido: Modificar, reescribir o eliminar artifacts del núcleo.

### 2. Nunca Modificar Datos del Núcleo

- Permitido: Crear artifacts nuevos en espacios propios (`expansion:*`, `lab:*`).  
- Prohibido: Alterar `questionnaire_config`, `questionnaire_progress` o cualquier artifact del flujo canónico.

### 3. Nunca Ejecutar el Núcleo desde Fuera

- Permitido: Ofrecer links o CTAs que dirijan al flujo canónico (UI estándar).  
- Prohibido: Crear endpoints alternativos que disparen la ejecución del MCMI-4 sin pasar por el flujo autorizado.

-----

## F. CHECKLIST PARA NUEVA EXPANSIÓN

Antes de aprobar cualquier módulo nuevo, verificar:

- [ ] ¿Toca archivos del núcleo? → **RECHAZAR**  
- [ ] ¿Duplica funcionalidad existente? → **RECHAZAR**  
- [ ] ¿Introduce lenguaje clínico o diagnóstico? → **RECHAZAR**  
- [ ] ¿Automatiza decisiones clínicas? → **RECHAZAR**  
- [ ] ¿Modifica artifacts sellados? → **RECHAZAR**  
- [ ] ¿Opera en modo solo-lectura? → **OK**  
- [ ] ¿Respeta el contrato funcional? → **OK**  
- [ ] ¿Tiene disclaimer simbólico visible? → **OK**  
- [ ] ¿Está documentado en zona expandible? → **OK**

Si la respuesta a cualquiera de las primeras 5 preguntas es "Sí", la expansión debe ser **RECHAZADA** inmediatamente.

-----

## G. EJEMPLOS CLAROS

### EXPANSIONES VÁLIDAS ✅

1. **Dashboard de Evolución Simbólica**  
   - Descripción: Visualización gráfica que muestra cómo cambian los mundos dominantes a lo largo de múltiples workspaces.  
   - Por qué es válida: Solo lectura, no modifica datos, disclaimer simbólico presente.

2. **Generador de Informes PDF**  
   - Descripción: Exporta el contenido del workspace a PDF con formato narrativo.  
   - Por qué es válida: Revisión manual del terapeuta, no automático, consentimiento del consultante.

3. **Módulo de I-Ching Simbólico**  
   - Descripción: Nuevo SWM independiente que explora hexagramas del I-Ching.  
   - Por qué es válida: Backend y frontend propios, sin dependencias del MCMI-4.

4. **Checklist de Sesiones Post-Workspace**  
   - Descripción: Guía estructurada para terapeutas con preguntas sugeridas por fase.  
   - Por qué es válida: Herramienta de apoyo, no automatiza decisiones.

### EXPANSIONES INVÁLIDAS ❌

1. **MCMI-4 Express (40 ítems)**  
   - Por qué es inválida: Variante del núcleo, duplica funcionalidad, requiere cambios en el scoring.

2. **Auto-Recomendador de Intervenciones**  
   - Por qué es inválida: Automatiza decisiones clínicas basándose en resultados simbólicos.

3. **Editor de Resultados Históricos**  
   - Por qué es inválida: Modifica artifacts sellados del núcleo sin autorización.

4. **Integración Diagnóstica con DSM-5**  
   - Por qué es inválida: Introduce lenguaje clínico y patologiza resultados simbólicos.

5. **API Externa para Ejecutar MCMI-4**  
   - Por qué es inválida: Ejecuta el núcleo desde fuera del flujo canónico, bypass de gobernanza.

-----

## H. PROCESO DE APROBACIÓN PARA EXPANSIONES

1. Propuesta escrita: descripción, zona del sistema, tipo de expansión, checklist completado.  
2. Revisión de `AGENTE_ARQ`: verificar cumplimiento del playbook.  
3. Prototipo aislado: desarrollar en `/lab` o `/experimental` sin tocar producción.  
4. Prueba piloto: validar con grupo reducido de terapeutas.  
5. Documentación: crear `README.md` con uso, límites y disclaimers.  
6. Aprobación final: registro en `docs/00_SOURCE_OF_TRUTH/RELEASES.md` bajo sección "Expansiones Aprobadas".

Sin completar estos pasos, la expansión no debe integrarse en producción.

-----

## I. ESTADO Y ALCANCE

Este playbook aplica a cualquier desarrollo que pretenda añadir funcionalidad al proyecto `analisis_cabalistico_alma`. Es complementario (no sustitutivo) de:

- `CONTRATO_FUNCIONAL_MCMI4_MISTICO.md` (define el núcleo)  
- `AGENT_GOVERNANCE_MCMI4.md` (define roles y prohibiciones)  
- `ONBOARDING_TERAPEUTAS_MCMI4_MISTICO.md` (define uso correcto)

-----

## J. REGISTRO DE CREACIÓN

- Creado: 2026-01-23  
- Autor: Agente ARQ (documento generado y añadido al repositorio)  
- Estado: CANÓNICO / BLOQUEANTE / POST-NÚCLEO

-----

### NOTA FINAL

Si una expansión no encaja en este playbook, debe considerarse automáticamente **RECHAZADA**. En caso de duda, priorizar la protección del núcleo sobre la innovación.
