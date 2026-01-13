EXPLORACIONES CANÓNICAS — FASE 1 (MARCO FUNDACIONAL)

Estado: CANÓNICO — V1
Fecha: 2026-01-11

1. Propósito

Este documento define el marco BASE y CANÓNICO para la creación y gestión de las Exploraciones Holísticas que se desarrollarán en fases posteriores. Su finalidad es establecer principios, límites y contratos conceptuales que garanticen coherencia, seguridad y separación estricta entre exploraciones, SWM y cualquier práctica clínica o diagnóstica.

2. Qué es una Exploración Canónica

- Una Exploración Canónica es un instrumento simbólico y no clínico, diseñado para facilitar la indagación reflexiva y el acompañamiento profesional.
- Constituye un protocolo conceptual (metadatos, estímulos simbólicos, estructura de respuestas y contrato de persistencia) que produce artefactos interpretativos destinados exclusivamente al terapeuta.

3. Qué NO es

- NO es un test clínico ni un instrumento diagnóstico.
- NO es un SWM ni debe redefinir, sustituir o modificar SWM existentes.
- NO produce recomendaciones automáticas ni outputs clínicos visibles al usuario.

4. Principios de diseño (DEBE cumplirse)

- Holístico y simbólico: centrado en la experiencia y la representación simbólica, no en métricas clínicas.
- Separación de roles: Usuario / Terapeuta / IA son agentes con permisos y visibilidad distintos; la interpretación final siempre corresponde al terapeuta.
- No-clinicalidad: Prohibido lenguaje médico o diagnóstico en cuestionarios, estímulos o salidas.
- Auditabilidad: Todas las exploraciones DEBEN generar metadatos y trazas suficientes para auditoría.
- Reproducibilidad: Mismas entradas conceptuales → mismas salidas conceptuales (determinismo conceptual).

5. Relación con AnalysisRecord y TreeStructuralState (conceptual)

- Las exploraciones DEBEN producir artefactos que sean compatibles con el contrato semántico del AnalysisRecord (registro inmutable) y el TreeStructuralState (nodos=Sefirot, pesos relativos cuando corresponda).
- La persistencia conceptual DEBE incluir: identificador de exploración, versión, timestamp, raw_input protegido y computed_result (TreeStructuralState o artefacto equivalente).

6. Roles y visibilidad

- Usuario: recibe experiencia interactiva y feedback simbólico en lenguaje neutro y experiencial; NO accede a porcentajes, normalizaciones técnicas ni recomendaciones.
- Terapeuta: accede a artefactos interpretativos (TreeStructuralState, series temporales, borradores interpretativos) y es responsable de la interpretación y comunicación.
- IA (fuera de alcance en Fase 1): cuando se habilite, su uso DEBE estar definido por protocolos internos y los outputs DEBEN ser exclusivos para terapeutas.

7. Persistencia esperada (alto nivel)

- Cada ejecución genera un AnalysisRecord inmutable y versionado.
- Los resultados consolidados que empleen TreeStructuralState DEBEN incluir algorithm_snapshot y metadata de ejecución para auditoría.
- Los datos sensibles DEBEN almacenarse con protección y permisos basados en rol.

8. Fases futuras (FUERA DE ALCANCE)

- Fase 2: Integración de IA como asistente (solo para terapeuta) — FUERA DE ALCANCE para Fase 1.
- Fase 3: Scoring avanzado y agregaciones algorítmicas (SDE) — FUERA DE ALCANCE para Fase 1.
- Fase 4: Diseños de UI/UX y flujos de interacción — FUERA DE ALCANCE para Fase 1.

9. Nota de seguridad y ética

- Toda exploración DEBE incluir un enunciado claro sobre naturaleza no clínica y límites de visibilidad para el usuario.
- Está PROHIBIDO inducir respuestas mediante lenguaje sugestivo o preguntas que simulen evaluación clínica.

10. Declaración final

Este documento FUNGE como la fuente de verdad para la fase documental y fundacional de las exploraciones canónicas; cualquier desviación DEBE ser aprobada por la gobernanza.
