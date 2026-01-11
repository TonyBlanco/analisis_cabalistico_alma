SWM_IMMUTABILITY_CONTRACT — Contrato de Inmutabilidad para Specialized Workspace Modules (SWM)

Estado: CANÓNICO — V1
Fecha: 2026-01-11

1. Definición formal de SWM (Specialized Workspace Module)

Qué es un SWM

- Un SWM es un módulo especializado que contiene artefactos simbólicos centrados en una tradición o dominio específico (p. ej., Astrología Profesional, Tarot / B.O.T.A., Cábala / Árbol de la Vida, Bioemocional Experiencial, Árbol / TreeStructuralState).
- Un SWM contiene recursos semánticos, taxonomías, símbolos, decks, flujos y contratos de datos que son el núcleo inmutable del sistema simbólico.

Qué NO es un SWM

- No es una unidad de prueba ni un test clínico.
- No es un experimento temporal ni un repositorio de prototipos.

Diferencia entre SWM, Exploraciones y Tests

- SWM: artefacto fuente, inmutable salvo aprobación de gobernanza.
- Exploración: instancia operativa que usa SWM como referencia simbólica y produce AnalysisRecord.
- Test: instrumento clínico (PROHIBIDO dentro del dominio SWM), no aplicable ni contenido en SWM.

---

2. Lista de SWM EXISTENTES (Estado actual, INMUTABLE)

Los siguientes SWM existen en el proyecto y están expresamente marcados como NO TOCAR / NO MIGRAR / NO REFACTORIZAR:

- Astrología Profesional — NO TOCAR / NO MIGRAR / NO REFACTORIZAR
- Tarot / B.O.T.A. — NO TOCAR / NO MIGRAR / NO REFACTORIZAR
- Cábala / Árbol de la Vida — NO TOCAR / NO MIGRAR / NO REFACTORIZAR
- Bioemocional Experiencial — NO TOCAR / NO MIGRAR / NO REFACTORIZAR
- Árbol / TreeStructuralState — NO TOCAR / NO MIGRAR / NO REFACTORIZAR

Cualquier discrepancia entre esta lista y la estructura en el repositorio DEBE ser reportada inmediatamente a gobernanza.

---

3. Contrato de Inmutabilidad

Se establece y se obliga a cumplir el siguiente contrato:

- PATHS NO MODIFICABLES: Las rutas de los archivos y directorios que constituyen un SWM NO PUEDEN ser renombradas, movidas ni eliminadas sin aprobación formal del comité de gobernanza.
- CONTRATOS DE DATOS NO MODIFICABLES: Los contratos semánticos (nombres de símbolos, decks, sefirot, flows, y los nombres de campos en TreeStructuralState) NO PUEDEN ser alterados sin producir una nueva versión aprobada por gobernanza.
- PROHIBICIÓN DE RELOCALIZACIÓN: Está PROHIBIDO mover cualquier componente SWM a directorios destinados a tests (/tests), exploraciones gastadas (/explorations) o catálogos no autorizados (/catalog), salvo autorización expresa de gobernanza.
- PROHIBICIÓN DE RENOMBRADO: Está PROHIBIDO renombrar símbolos, decks, sefirot o flows pertenecientes a un SWM sin un proceso de migración versionado y aprobado.
- REGISTRO OBLIGATORIO: Cualquier cambio aprobado DEBE incluir un registro de motivación, revisión semántica y plan de migración; los cambios DEBEN distribuirse como versión mayor del SWM.

---

4. Reglas para AGENTES (OJO: VINCULANTE)

- AGENTE_CODE: NO PUEDE modificar ni ejecutar refactors sobre ningún SWM salvo que exista una orden explícita y firmada por gobernanza. Si recibe una tarea que implique un SWM, DEBE detenerse y elevar la petición al comité.
- AGENTE_DOCS: NO PUEDE reescribir la intención original de un SWM. Las modificaciones documentales que afecten el propósito del SWM requieren revisión de gobernanza y aprobación de la autoría original o del comité.
- AGENTE_DEBUG: PUEDE diagnosticar fallas en SWM y generar reportes de diagnóstico; PROHIBIDO aplicar correcciones automáticas o refactors sobre SWM sin autorización expresa y rastreada por gobernanza.

Todas las acciones de agentes que toquen SWM DEBEN registrar una traza y generar un aviso automático a gobernanza.

---

5. Resumen de lo ocurrido (sin buscar culpables)

- Hecho: Se produjo una ruptura funcional en módulos simbólicos debido a deriva documental y falta de un contrato explícito que protegiera paths, nombres y contratos de datos.
- Lección: La ausencia de reglas operativas claras permitirá refactors accidentales y migraciones indebidas; la corrección posterior es costosa y arriesga pérdida de integridad simbólica.

---

6. Procedimiento si algo falla en un SWM (MANDATORIO)

1. Diagnóstico: AGENTE_DEBUG o responsable técnico realiza diagnóstico y documenta evidencia en un reporte trazable.
2. Contención: Detener cualquier automatismo que haya causado la alteración y proteger artefactos afectados.
3. Rollback: Restaurar al último estado funcional conocido a partir de backups/versiones inmutables.
4. Revisión humana: El comité de gobernanza y el/los expertos del SWM revisan la causa y validan la estrategia de corrección.
5. Aprobación: Cualquier cambio posterior DEBE contar con aprobación formal y un plan de migración versionado.
6. Comunicación: Notificar a las partes interesadas y documentar la resolución.

---

7. Cláusula final (MANDATORIA)

CUALQUIER CAMBIO EN UN SWM SIN APROBACIÓN EXPLÍCITA ES UNA VIOLACIÓN DE GOBERNANZA

---

Referencias normativas

- Este contrato DEBE ser citado desde `docs/00_SOURCE_OF_TRUTH/` y referenciado en cualquier documentación sobre gobernanza de exploraciones, así como en las reglas de ejecución de agentes.

Nota final

Este documento es vinculante y tiene por objeto prevenir daño a los artefactos simbólicos que constituyen el núcleo del sistema. No constituye una guía técnica de implementación; su propósito es exclusivamente de gobernanza y protección.