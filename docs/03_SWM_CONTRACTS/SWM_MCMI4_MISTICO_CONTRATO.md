## Contrato Canónico: Workspace SWM MCMI-4 Místico

Fecha de emisión: 2026-01-18

---

**Propósito.** Este documento redefine, a nivel contractual, el significado y los límites del objeto denominado "Workspace SWM MCMI-4 Místico" en el sistema. El contrato especifica su naturaleza, fuentes válidas de entrada, separación de responsabilidades y las acciones que corresponden a su ámbito interpretativo.

---

### 1. Definición del Workspace

- Naturaleza: el Workspace SWM MCMI-4 Místico es un espacio interpretativo.
- Orden temporal: su existencia es posterior a la ejecución del test; el Workspace se crea para soportar tareas de interpretación sobre resultados ya generados.
- Dependencia semántica: su contenido y validez dependen exclusivamente de datos preexistentes originados en flujos de ejecución.

Declaraciones explícitas:
- No es un test ni un motor de ejecución de pruebas.
- No es un cuestionario ni un contenedor de ítems a responder.
- No ejecuta preguntas ni registra respuestas de ejecución dentro de su ámbito interpretativo.

---

### 2. Fuente de Señal (INPUT)

Fuentes válidas y únicas para la creación y la sesión interpretativa del Workspace:

- `TestResult` MCMI-4: resultado estructurado y persistido que contiene las puntuaciones/escala generadas por la ejecución del test.
- `Assignment` completado: registro de asignación que documenta que el consultante completó una ejecución vinculada al terapeuta y al dato de origen.
- `AnalysisRecord` existente: artefacto de análisis previo que documenta transformaciones, anotaciones o metadatos derivados del resultado.

Operaciones inválidas:

- No es válido crear un Workspace sin una de las fuentes listadas arriba.
- No es válido iniciar una sesión interpretativa asociada al Workspace si no existe un `TestResult` o equivalente que sirva como entrada semántica.

---

### 3. Separación de Roles (CRÍTICO)

Responsabilidades y límites por rol:

**Consultante**

- Ejecuta el cuestionario (flujo `patient_self`).
- Genera la señal de entrada — es decir, produce el `TestResult` mediante su interacción en el flujo de ejecución.
- No participa en las tareas de interpretación dentro del Workspace; el consultante no accede ni modifica artefactos interpretativos del terapeuta.

**Terapeuta**

- Crea el Workspace únicamente cuando dispone de la fuente de señal válida (ver sección 2).
- Realiza la interpretación simbólica y clínica dentro del Workspace.
- Registra decisiones, anotaciones y genera la síntesis final en el ámbito interpretativo.

Prohibiciones explícitas:

- El terapeuta no ejecuta cuestionarios en nombre del consultante como parte del Workspace interpretativo.
- El consultante no debe navegar ni editar workspaces que estén definidos como espacios terapéuticos de interpretación.

---

### 4. Acciones SÍ ocurren dentro del Workspace

Los siguientes procesos son parte del ámbito funcional del Workspace SWM MCMI-4 Místico:

- Interpretación simbólica o clínica de resultados (`TestResult`).
- Selección y aplicación de marcos interpretativos (p. ej. marcos cabalísticos, ajustes de lectura simbólica).
- Registro de notas interpretativas por parte del terapeuta.
- Registro de decisiones clínicas holísticas y metadatos asociados a dichas decisiones.
- Confección y persistencia de la síntesis final (documento interpretativo derivado de la evidencia).

---

### 5. Acciones NO ocurren dentro del Workspace

Las siguientes operaciones quedan fuera del contrato del Workspace y deben ocurrir en otros dominios o flujos:

- Ejecución de tests o respuesta a cuestionarios por parte del consultante.
- Respuesta a ítems o captura de `TestResult` en tiempo real.
- Inicio de la ejecución clínica primaria (la fase de ejecución ocurre en `patient_self` o en el flujo de asignación correspondiente).
- Redirecciones que pretendan entregar el cuestionario al consultante desde el Workspace interpretativo.

---

### 6. Relación con flujos existentes

- El Workspace HEREDA su semántica de los artefactos generados por el flujo `patient_self` (o por flujos equivalentes que produzcan `TestResult`/`Assignment`).
- No reemplaza ni duplica la lógica de ejecución: el Workspace consume resultados ya existentes y actúa como capa interpretativa sobre esos resultados.
- El Workspace se apoya en motores, registros y adaptadores presentes en el sistema; su contrato exige que esos artefactos previos estén disponibles y sean la única fuente de verdad para la interpretación.

---

### 7. Estado actual y nota de coherencia

Estado actual: el Workspace SWM MCMI-4 Místico puede existir a nivel de interfaz y de persistencia como contenedor. Sin embargo, para que el Workspace sea semánticamente válido y operativo debe cumplir el contrato aquí definido: disponer de una fuente de señal válida (ver sección 2) y observar la separación de roles (ver sección 3).

Esta especificación aclara que la mera creación de un contenedor sin fuente no constituye una interpretación válida y que cualquier uso operativo del Workspace debe ajustarse a las reglas contractuales descritas.

---

### 8. Autorización formal: Módulo SWM v3 de señal mínima

**Contexto.** Se ha identificado que el SWM MCMI-4 Místico fue creado como capa interpretativa, y que la capa de señal (test/cuestionario) no fue migrada a SWM; por lo tanto, el flujo Terapeuta → Consultante no es funcional bajo el contrato vigente (ver secciones 2 y 3).

**Autorización.** Se autoriza formalmente la creación de un módulo SWM v3 de SEÑAL MÍNIMA denominado **“SWM MCMI-4 SIGNAL”**, cuyo único propósito es generar un `TestResult` compatible (compatibilidad estructural/técnica, no clínica) para ser interpretado por el SWM MCMI-4 Místico existente, sin modificarlo.

**Restricciones (obligatorias).**
- NO implementar MCMI-4 clínico.
- NO usar bancos de preguntas clínicos reales.
- NO introducir diagnóstico ni scoring clínico.
- NO tocar el SWM MCMI-4 Místico existente.
- El módulo SIGNAL debe ser mínimo, no clínico y 100% SWM v3.
- Mantener arquitectura sellada y auditoría vigente.

**Alcance autorizado (único).**
- Definición y creación de un SWM_SIGNAL mínimo.
- Producción de `Assignment`, `Responses` y `TestResult` bajo flujos SWM v3.
- Uso exclusivo como fuente de señal simbólica para habilitar el consumo interpretativo del Workspace.

**Entregable habilitado (esta fase).**
- Queda autorizada la fase de diseño y documentación del módulo “SWM MCMI-4 SIGNAL”.
- Queda habilitada la continuidad a fases posteriores DOCS y CODE, sujeta a validación de cumplimiento de restricciones.

---

Este contrato redefine el significado del SWM MCMI-4 Místico conforme a la auditoría vigente, sin alterar la arquitectura sellada.
