GOBERNANZA DE EXPLORACIONES — Marco Canónico

Estado: CANÓNICO — V1
Fecha: 2026-01-11

1. Propósito

Definir el proceso formal para la creación, revisión, aprobación y versionado de Exploraciones Canónicas y derivadas dentro del sistema holístico.

2. Qué ES / Qué NO ES
Qué ES

- Un marco de gobernanza que regula la introducción y modificación de exploraciones.

Qué NO ES

- No es una guía de implementación técnica ni un permiso para prácticas clínicas.

3. Proceso de creación

- Propuesta formal: autor conceptual presenta ficha con propósito, estructura, mapeo a Sefirot, metadatos y plan piloto.
- Revisión semántica: comité de gobernanza verifica que no exista lenguaje clínico, que las visibilidades estén correctas y que el mapeo al Árbol esté explícito.
- Prueba piloto: ejecución controlada con terapeutas y revisión de trazas.
- Aprobación: firma del comité de gobernanza y registro en DOCUMENT_INDEX.md.

4. Versionado

- Toda exploración DEBE tener un campo de versión en su metadatos.
- Cambios menores DEBEN incrementar la versión menor; cambios conceptuales DEBEN crear nueva versión mayor y pasar por toda la revisión.

5. Aprobaciones y Roles

- Comité de gobernanza: aprobación final sobre contenido semántico y reglas de visibilidad.
- Equipo técnico: verifica compatibilidad con AnalysisRecord y TreeStructuralState sin introducir detalles de implementación.
- Terapeutas piloto: validan idoneidad práctica y riesgos simbólicos.

6. Prohibiciones y Salvaguardas

- PROHIBIDO introducir terminología clínica, acrónimos médicos o sistemas de diagnóstico.
- PROHIBIDO exponer porcentajes/scores al usuario.
- Cualquier incumplimiento DEBE detener su uso y reportarse inmediatamente.

7. Auditoría

- La gobernanza DEBE auditar exploraciones y su uso periódicamente.
- Los registros de auditoría DEBEN conservarse y ser accesibles para revisiones.

Nota final de seguridad

La gobernanza mantiene la calidad, la coherencia ética y la seguridad del sistema; ninguna exploración entra en uso sin aprobación explícita.