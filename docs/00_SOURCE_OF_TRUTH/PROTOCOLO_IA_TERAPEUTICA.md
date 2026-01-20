PROTOCOLO DE IA TERAPÉUTICA — Uso Interno Canónico

Estado: CANÓNICO — V1
Fecha: 2026-01-11

1. Propósito

Establecer las normas obligatorias para el uso de sistemas de IA en apoyo interpretativo de las Exploraciones Simbólicas. Este protocolo define qué puede y qué NO puede hacer la IA, sus entradas y salidas permitidas, reglas de seguridad y requisitos de auditoría.

2. Qué ES / Qué NO ES
Qué ES

- Un marco normativo que regula la IA como asistente del terapeuta.
- Un conjunto de obligaciones que DEBE respetar todo componente automatizado usado por el proyecto.

Qué NO ES

- No es un documento técnico de implementación ni un inventario de endpoints.
- No habilita uso clínico ni diagnósticos automatizados.

3. Principios Normativos (DEBE / PROHIBIDO)

- LA IA DEBE actuar exclusivamente como apoyo interpretativo; NUNCA como decisor.
- LA IA DEBE entregar salidas marcadas como "BORRADOR PARA REVISIÓN" y requerir validación del terapeuta antes de cualquier uso clínico o comunicacional.
- PROHIBIDO que la IA genere diagnósticos, etiquetas clínicas o mensajes automáticos dirigidos al usuario.
- PROHIBIDO utilizar modelos o endpoints no aprobados por gobernanza.

4. Inputs Permitidos

- TreeStructuralState consolidados (versionados).
- Metadatos de sesión (origen, timestamp, versión de exploración).
- Raw_input solo bajo condiciones estrictas de protección y con permisos explícitos.

5. Outputs Permitidos

- Borradores interpretativos simbólicos para TERAPEUTA, claramente etiquetados.
- Resúmenes técnicos y trazas de generación (algorithm_snapshot) para auditoría.
- Sugerencias de exploración adicional en formato no-prescriptivo.

6. Auditoría y Versionado

- Toda ejecución DEBE registrar: version del algoritmo, identificador de sesión, timestamp, usuario/terapeuta solicitante.
- Algoritmos DEBEN estar versionados; cualquier cambio DEBE pasar por control de cambios y aprobación de gobernanza.

7. Seguridad y Privacidad

- Raw_input sensibles DEBEN almacenarse cifrados con acceso restringido.
- Los outputs DEBEN registrarse en AnalysisRecord con permisos basados en roles.

8. Relación con el Terapeuta

- El terapeuta es responsable final de la interpretación y de cualquier comunicación al usuario.
- La IA solo asiste y nunca reemplaza juicio humano.

9. Cumplimiento

- La gobernanza DEBE auditar periódicamente la conformidad con este protocolo.
- Incumplimientos DEBEN ser reportados y mitigados antes de reanudar uso.

Nota final de seguridad

La IA se implementa como herramienta para aumentar interpretaciones profesionales, NO para sustituirlas.