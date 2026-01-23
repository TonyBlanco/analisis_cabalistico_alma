<!--
  AGENT_GOVERNANCE_MCMI4.md
  Estado: CANÓNICO / BLOQUEANTE / LECTURA OBLIGATORIA
  Fecha: 2026-01-23
  Propósito: Reglas operativas y cognitivas para todos los agentes
           (humanos, scripts, IA) que interactúen con el núcleo MCMI-4 Místico.
-->

# AGENT GOVERNANCE — MCMI-4 MÍSTICO

**ESTADO:** CANÓNICO / BLOQUEANTE / LECTURA OBLIGATORIA

Este documento define las reglas inmutables que rigen el comportamiento de cualquier agente —humano o automatizado— que toque, proponga cambios o genere artefactos alrededor del núcleo MCMI-4 Místico (SWM). Su objetivo es evitar loops, rehacer módulos existentes, reinterpretaciones erráticas o daños al sistema.

-----

## A. PRINCIPIO FUNDAMENTAL

1. El núcleo MCMI-4 Místico está CERRADO.  
2. Bajo ninguna circunstancia un agente debe rediseñar, duplicar, reescribir ni optimizar el núcleo sin autorización explícita documentada y aprobada conforme al procedimiento de gobernanza definido en `CONTRATO_FUNCIONAL_MCMI4_MISTICO.md`.  
3. Cualquier propuesta que implique cambios al núcleo debe parar inmediatamente y escalarse a un `AGENTE_ARQ` humano.

-----

## B. ROLES DE AGENTE PERMITIDOS (y límites precisos)

- Arquitecto (humano): puede proponer cambios de alto nivel, gestionar aprobaciones y firmar excepciones. NO implementa cambios en el núcleo sin aprobación por escrito y registro del diff.
- Documentador: puede crear y editar documentos en `docs/00_SOURCE_OF_TRUTH/` (incluyendo este archivo y el contrato funcional). No modifica código ni datos.
- Auditor: puede leer artifacts, reportar anomalías, y crear issues; no aplica correcciones directas sobre el núcleo.
- Implementador periférico: puede cambiar componentes fuera del núcleo (por ejemplo, integraciones, visualizaciones que no alteren `backend/swm/mcmi4/*` ni `backend/data/mcmi4_mystic_questions_*.json`). Antes de cualquier cambio, debe verificar que el impacto no toque el núcleo.

Notas: los roles deben declarar su identidad y rol en cualquier prompt o cambio. Si un agente no puede identificarse claramente, debe detenerse.

-----

## C. ACCIONES PROHIBIDAS (lista bloqueante)

Los siguientes actos están PROHIBIDOS y deben hacer que el agente detenga su ejecución y aborte la operación:

1. Crear nuevos tests relacionados con MCMI-4.  
2. Cambiar scoring, pesos o reglas de reverse scoring.  
3. Editar o versionar los JSON de mundos `backend/data/mcmi4_mystic_questions_*.json`.  
4. Automatizar la ejecución SIGNAL → 195 (el SIGNAL sólo habilita, no debe ejecutar la batería 195 automáticamente).  
5. Introducir lenguaje clínico, diagnósticos o recomendaciones automatizadas en artifacts.  
6. Reutilizar resultados antiguos para generar selecciones automáticas sin autorización.  
7. Ejecutar migraciones o scripts que alteren la estructura de artifacts del SWM sin permiso explícito.

-----

## D. FLUJO CANÓNICO (resumen obligatorio)

Todos los agentes deben respetar el flujo canónico y no proponer caminos alternativos:

SIGNAL → CTA terapeuta → MCMI-4 (195 ítems) → Workspace (4 fases: Assiah → Yetzirah → Beriah → Atzilut)

-----

## E. REGLA DE PROMPTS (OBLIGATORIA)

ANTES de ejecutar cualquier acción o generar cambios, TODO prompt (humano o automático) que pretenda afectar al proyecto debe declarar explícitamente y por escrito:

1. Punto exacto del flujo que se tocará (archivo, endpoint, artifact).  
2. Qué NO se puede tocar (lista mínima, referenciando este contrato).  
3. Qué SÍ se espera cambiar (alcance precisa y minimalista).  
4. Criterios de aceptación mensurables (qué sirve como verificación objetiva).  

Si cualquiera de esos cuatro elementos no está presente, el agente debe detenerse y solicitar clarificación.

-----

## F. CUÁNDO UN AGENTE DEBE PARAR (condiciones explícitas)

Un agente debe interrumpir su ejecución inmediatamente si se cumple cualquiera de estas condiciones:

1. La acción propuesta viola alguna cláusula del `CONTRATO_FUNCIONAL_MCMI4_MISTICO.md`.  
2. El agente no puede identificar con precisión los archivos o artifacts afectados.  
3. La propuesta implica rediseño, duplicación, o introducción de scoring/diagnóstico.  
4. El agente detecta ambigüedad en requerimientos o falta de criterios de aceptación.  
5. El agente detecta que la acción puede afectar datos históricos sin plan de rollback claro.

Cuando un agente para por cualquiera de estas razones, debe:  
- Registrar la razón en un issue o artifact de auditoría;  
- Notificar a un responsable humano `AGENTE_ARQ`;  
- No intentar reanudar sin aprobación y registro explícito.

-----

## G. FRASES BLOQUEANTES (para incluir literalmente en prompts)

Agentes y humanos deben poder insertar al menos una de las siguientes frases en su comunicación para indicar bloqueo inmediato:

- “Esto ya existe”  
- “El núcleo está sellado”  
- “Esto rompe contrato”  
- “Fuera de alcance del núcleo”

Si una operación contiene cualquiera de estas frases, el flujo debe detenerse y escalarse.

-----

## H. METADATOS OBLIGATORIOS EN ARTEFACTOS CREADOS

Todo artifact nuevo generado en contextos relacionados debe incluir metadatos minimos:

- `author`: identidad del agente (humano/ID).  
- `role`: rol declarado (ver sección B).  
- `intent`: breve descripción del propósito.  
- `referencia_contrato`: `docs/00_SOURCE_OF_TRUTH/CONTRATO_FUNCIONAL_MCMI4_MISTICO.md`.  

Falta de estos metadatos debe invalidar el artifact como fuente de verdad para cualquier flujo crítico.

-----

## I. ESCALADO Y GOBERNANZA

Para cualquier excepción propuesta, el agente debe preparar un paquete de cambios con:

1. Archivos afectados y diff propuesto.  
2. Impacto en datos históricos y plan de rollback.  
3. Pruebas y criterios de aceptación.  
4. Firma de un `AGENTE_ARQ` humano.

Sin este paquete la excepción no será aprobada.

-----

## J. LECTURA OBLIGATORIA Y FIRMA

Antes de ejecutar cambios adjuntos al núcleo, todos los agentes automatizados deben incluir en su prompt una declaración exacta de lectura:  
“He leído y comprendo `AGENT_GOVERNANCE_MCMI4.md` y `CONTRATO_FUNCIONAL_MCMI4_MISTICO.md`. No ejecutaré acciones prohibidas.”  

Nota: Esta lectura obligatoria sirve de registro y debe aparecer en metadatos cuando se generen artifacts.

-----

## K. ESTADO Y ALCANCE

Este documento aplica estrictamente a todo lo que toque los siguientes paths y conceptos:

- `backend/swm/mcmi4/*`  
- `backend/data/mcmi4_mystic_questions_*.json`  
- Frontend components declarados consumidores del SWM: `tonyblanco-app/components/swm/*`, `tonyblanco-app/components/SwmMcmi4/*`  
- Artefacts: `questionnaire_config`, `questionnaire_progress`, `questionnaire_completion`, `phase:*`, `notes`.

-----

## L. REGISTRO DE CREACIÓN

- Creado: 2026-01-23  
- Autor: Agente ARQ (documento generado y añadido al repositorio)  
- Estado: CANÓNICO / BLOQUEANTE / LECTURA OBLIGATORIA

-----

### NOTA FINAL

Si un agente no está seguro de su rol, alcance o efecto de una acción, debe detenerse. No improvisar. No ejecutar cambios fuera de este marco.
