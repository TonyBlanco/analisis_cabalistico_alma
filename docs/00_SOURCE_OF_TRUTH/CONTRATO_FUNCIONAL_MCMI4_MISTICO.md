<!--
  CONTRATO_FUNCIONAL_MCMI4_MISTICO.md
  Estado: CANÓNICO / BLOQUEANTE
  Fecha: 2026-01-23
  Propósito: Documentar y congelar el núcleo funcional MCMI-4 Místico (SWM).
-->

# CONTRATO FUNCIONAL — MCMI-4 MÍSTICO (SWM)

**ESTADO:** CANÓNICO / BLOQUEANTE

**SUMARIO EJECUTIVO**

Este documento define de forma inequívoca el comportamiento, límites y garantías del núcleo "MCMI-4 Místico" (abreviado: MCMI-4 Místico, o SWM). Su contenido es vinculante: cualquier cambio a la implementación o interpretación del núcleo requiere autorización explícita documentada y debe referenciar este contrato. El objetivo es evitar regresiones, rediseños o reinterpretaciones erráticas.

-----

## 1. Definición: Qué ES y Qué NO ES

- Qué ES:
  - Un módulo de evaluación simbólica ya implementado que entrega ejecuciones de 195 ítems por instancia (test_type: `mcmi4-mystic`).
  - Consta de un pool mayor (~270 ítems) con estrategia anti-repetición para seleccionar 195 distintos por ejecución.
  - Organizado en 4 Mundos: `atzilut` (49), `briah` (49), `yetzirah` (49), `assiah` (48).
  - Mantiene separación clara entre la capa de cribado `mcmi4-signal` (16 ítems) y la ejecución 195.

- Qué NO ES:
  - No es diagnóstico clínico, ni produce recomendaciones clínicas automáticas.
  - No es un sistema de scoring experimentable — el scoring existente es INALTERABLE por este contrato.
  - No es una plataforma para crear nuevos tests ni para reingresar bancos duplicados.

-----

## 2. Artefactos y Archivos de Referencia (Sistema de Registro)

Los puntos de verdad (single source of truth) del núcleo son los siguientes archivos y ubicaciones (referencia técnica):

- Preguntas por mundo: `backend/data/mcmi4_mystic_questions_atzilut.json`, `..._briah.json`, `..._yetzirah.json`, `..._assiah.json`.
- Lógica de selección/rotación: `backend/swm/mcmi4/services/questionnaire_service.py` (constantes `WORLDS_ORDER`, `QUESTIONS_PER_WORLD`, `TOTAL_QUESTIONS`, y métodos de selección/next_question).
- Endpoints y vistas SWM: `backend/swm/mcmi4/views.py` y `backend/swm/mcmi4/serializers.py`.
- Frontend consumidor principal: `tonyblanco-app/components/swm/*` y `tonyblanco-app/components/SwmMcmi4/*` (incluye `QuestionnaireViewer.tsx`, `PhaseGuidedPanel.tsx`, `Mcmi4MysticVisualCore.tsx`).

Estos son los artefactos que definen el comportamiento observado y deben ser respetados.

-----

## 3. Relación SIGNAL ↔ MCMI-4

- `mcmi4-signal` (16 ítems) es un cribado/umbral que **habilita** una acción del terapeuta — mostrar una CTA para asignar el `mcmi4-mystic` de 195 ítems.
- El SIGNAL **no** ejecuta automáticamente la batería de 195 ítems. La decisión de asignar/ejecutar la batería 195 es exclusivamente del terapeuta (o su UI autorizada).
- Cada ejecución del SIGNAL crea contexto propio (artifacts de test result, input_data, result_data). Estos contextos son independientes y solo sirven como información simbólica para el terapeuta.

-----

## 4. Flujo Funcional Canónico

1. Ejecutar SIGNAL (`mcmi4-signal`, 16 ítems) sobre un paciente → genera un TestResult (artefacto separado).
2. Tras SIGNAL completado, la UI muestra una CTA **manual**: "Asignar MCMI-4 Místico (195)" (component: `AssignMCMI4MysticModal`).
3. Si el terapeuta confirma, se crea un Workspace de tipo SWM que contiene la configuración `questionnaire_config` con 195 preguntas seleccionadas por `QuestionnaireService.select_questions()` en el orden canónico.
4. El usuario responde las preguntas en el orden secuencial entregado por el servicio: primero las preguntas agrupadas por mundo en el orden descendente del cuestionario (Atzilut → Briah → Yetzirah → Assiah).
5. Al completar el cuestionario, se generan los artifacts `questionnaire_progress` y `questionnaire_completion` y el Workspace queda disponible para la fase interpretativa del terapeuta.
6. Separadamente, el Workspace terapéutico consta de las 4 fases para el terapeuta en orden ascendente (Assiah → Yetzirah → Beriah → Atzilut), representadas como `phase:discovery|mapping|interpretation|synthesis`.

-----

## 5. Orden y Secuencia (explicación explícita)

- Orden en que se presentan las preguntas al paciente (Cuestionario 195):
  - DESCENDENTE (espiritual → material): `atzilut` → `briah` → `yetzirah` → `assiah`.
- Orden en que el terapeuta trabaja/vela el material (Workspace de 4 fases):
  - ASCENDENTE (acción → emanación): `discovery`/Assiah → `mapping`/Yetzirah → `interpretation`/Beriah → `synthesis`/Atzilut.

Razonamiento: ambos órdenes son canónicos y coexistentes; el primero es la lógica de configuración y administración del cuestionario, el segundo es la lógica interpretativa del terapeuta. Este dualismo es deliberado y debe preservarse.

-----

## 6. Qué ve el terapeuta / Qué NO ve

- Qué ve el terapeuta:
  - Resultado del SIGNAL (TestResult metadata y resumen simbólico sin interpretación clínica automática).
  - CTA para asignar el `mcmi4-mystic` si el SIGNAL está completado.
  - Paneles de Workspace con guías de fase (`PhaseGuidedPanel`) y artifacts persistidos (notas, phase artifacts, notes).
  - Progreso por mundo (indicadores de answered/total) y estado del workspace.

- Qué NO ve el terapeuta:
  - No se provee interpretación clínica automatizada ni diagnosis generada por el backend.
  - No se muestra ni se modifica el scoring interno ni las reglas de reverse scoring/weights; estas permanecen ocultas como implementación técnica.
  - No se exponen al terapeuta los mecanismos internos de selección/rotación (por ejemplo, IDs del pool usados en previos workspaces) salvo metadatos no clínicos necesarios para auditoría.

-----

## 7. Persistencia: Qué se persiste y Qué NO se persiste

- Qué se persiste (artefactos establecidos):
  - `questionnaire_config`: lista `questions_full` con el orden canónico usado en la ejecución.
  - `questionnaire_progress`: estado incremental (current_question_index, answered_count, worlds_progress, progress_percentage).
  - `questionnaire_completion`: artifact final con `responses` (map question_id → value) y metadata de finalización.
  - Workspace artifacts para cada fase (`phase:discovery`, `phase:mapping`, `phase:interpretation`, `phase:synthesis`) y `notes`.
  - TestResult del SIGNAL (input_data/result_data de la ejecución de 16 ítems).

- Qué NO se persiste:
  - Interpretaciones clínicas automatizadas (no existen).
  - Cualquier inferencia diagnóstica derivada de la ejecución (prohibido explícitamente).
  - Datos temporales de UI que no formen parte de artifacts (por ejemplo, estados locales no guardados por `record_progress`).

-----

## 8. Simbólico vs Clínico

- Declaración: Toda información producida por el núcleo MCMI-4 Místico es de naturaleza **simbólica** — destinada a la reflexión del terapeuta y a la construcción manual de interpretaciones clínicas por parte del profesional.
- Ningún campo generado por el núcleo debe ser usado como evidencia exclusiva para decisiones clínicas automatizadas.

-----

## 9. Reglas de No-Regresión y Gobernanza

- Cambios que requieren aprobación explícita y documentación vinculante a este contrato antes de ser aplicados:
  - Cualquier modificación a `backend/swm/mcmi4/services/questionnaire_service.py` (incluyendo `WORLDS_ORDER`, `QUESTIONS_PER_WORLD`, `TOTAL_QUESTIONS`, algoritmo de selección).
  - Cualquier cambio a los JSON de preguntas ubicados en `backend/data/`.
  - Cualquier cambio al scoring o a la forma de calcular resultados.
  - Cualquier change que automatice la ejecución del `mcmi4-mystic` a partir del SIGNAL.

- Procedimiento mínimo para cambios autorizados: Propuesta formal con justificación, revisión de `AGENTE_ARQ` y registro en control de cambios. Mientras no exista esa aprobación, cualquier modificación es una violación de este contrato.

-----

## 10. PROHIBICIONES EXPLÍCITAS (lista bloqueante)

1. No crear nuevos tests relacionados con MCMI-4 desde este repositorio (NO crear `test_module` nuevos).
2. No duplicar ni versionar bancos de preguntas paralelos (no crear copias funcionales de `mcmi4_mystic_questions_*.json`).
3. No cambiar scoring, pesos ni reglas de reverse scoring.
4. No automatizar ejecuciones (el SIGNAL no dispara ejecuciones del 195 de forma automática).
5. No introducir diagnóstico, lenguaje clínico o recomendaciones automatizadas en ningún artifact generado por el núcleo.
6. No reutilizar resultados antiguos para generar automáticamente nuevas selecciones (anti-reutilización automática prohibida).
7. No ejecutar migraciones de base de datos que alteren la estructura de artifacts del SWM sin autorización.

-----

## 11. FUERA DE CONTRATO (acciones que NO realiza este agente/contrato)

- Rehacer el test MCMI-4 (rediseño total del contenido o scoring).
- Introducir IA o generadores automatizados de interpretaciones clínicas en artifacts por defecto.
- Cambiar el wiring existente entre SIGNAL, CTA y asignación 195.
- Ejecutar scripts que modifiquen `db.sqlite3` o que influyan en datos de producción sin orden explícita.

-----

## 12. Criterios de Aceptación (Checklist)

1. El archivo `docs/00_SOURCE_OF_TRUTH/CONTRATO_FUNCIONAL_MCMI4_MISTICO.md` existe y refleja lo descrito arriba.  
2. El documento es inequívoco respecto a límites, persistencia, y prohibiciones.  
3. No se modificó código, scoring, JSON de preguntas, motor de rotación, endpoints ni UX al crear este contrato.  
4. El contrato se marca como CANÓNICO / BLOQUEANTE y debe ser referenciado por futuros cambios.

-----

## 13. Gobernanza mínima para cambios futuros

- Toda desviación propuesta debe incluir:
  - Identificación de archivos afectados y diff propuesto.
  - Razonamiento clínico/operativo, impacto en datos previos y rollback plan.
  - Aprobación escrita de un `AGENTE_ARQ` o responsable de producto/arquitectura.

-----

## 14. Registro de creación

- Creado: 2026-01-23
- Autor: Agente ARQ (documento generado y añadido al repositorio como referencia canónica)

-----

### NOTA FINAL

Si algo no está explícitamente permitido en este contrato, se considera "FUERA DE CONTRATO" y no debe ejecutarse. Cualquier excepción requiere autorización formal y trazable.
