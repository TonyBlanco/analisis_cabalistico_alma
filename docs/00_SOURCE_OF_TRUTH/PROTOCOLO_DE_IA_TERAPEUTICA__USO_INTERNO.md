PROTOCOLO DE IA TERAPÉUTICA — USO INTERNO

Ámbito: Uso exclusivo por terapeutas y comités de gobernanza dentro del sistema de Exploraciones Simbólicas.

Propósito

Este protocolo define las reglas, límites y obligaciones para el uso de componentes de IA en apoyo interpretativo de Exploraciones Simbólicas. Es normativa y de cumplimiento obligatorio: lo descrito en este documento SE APLICA a todas las exploraciones canónicas y derivadas.

Principios de Diseño (DEBE)

- La IA DEBE operar como asistente interpretativo, **nunca** como decisor.
- Los resultados cuantitativos DEBEN ser accesibles **solo** para el terapeuta y la gobernanza, no para el usuario.
- Las transformaciones a TreeStructuralState DEBEN ser deterministas, auditables y versionadas.
- Toda salida generada por la IA DEBE incluir un metadato de procedencia y versión del algoritmo (algorithm_snapshot).

Inputs Permitidos

- TreeStructuralState aprobado por la exploración (nodos = Sefirot, pesos relativos).
- Metadatos de sesión (timestamp, versión de exploración, permisos).
- Respuestas simbólicas en bruto **sólo** cuando el acceso y protección de datos estén garantizados.

Outputs Permitidos (para TERAPEUTA)

- Borradores interpretativos de naturaleza simbólica y heurística (etiquetado como "borrador para revisión por terapeuta").
- Resúmenes técnicos de la distribución por Sefirot (metadatos + algoritmo usado).
- Sugerencias de áreas para exploración adicional (formato borrador, no prescriptivo).

Prohibiciones Explícitas (PROHIBIDO)

- PROHIBIDO generar diagnósticos, terminología clínica o lenguaje médico.
- PROHIBIDO mostrar porcentajes, scores o recomendaciones al usuario final.
- PROHIBIDO tomar decisiones autónomas que afecten intervención o comunicación con el usuario.
- PROHIBIDO utilizar modelos o endpoints no documentados y aprobados en gobernanza.

Reglas Operativas

- Cualquier salida de la IA DEBE estar claramente etiquetada como "borrador" y requerir revisión y firma del terapeuta antes de ser usada en intervención.
- La IA DEBE registrar un algorithm_snapshot y producir un resumen de trazas suficiente para auditoría.
- La IA DEBE proporcionar explicaciones de nivel técnico sobre cómo se generó una interpretación (reglas, pesos de mapeo), en lenguaje comprensible para gobernanza y auditoría.

Seguridad, Privacidad y Acceso

- Los raw_input sensibles DEBEN almacenarse en repositorios cifrados con acceso restringido.
- Las salidas interpretativas DEBEN registrarse en el AnalysisRecord solo con permisos relativos al rol (terapeuta/gobernanza).

Auditoría y Versionado

- Todas las ejecuciones DEBEN registrar: versión del algoritmo, timestamp, identificador de sesión, y usuario/terapeuta solicitante.
- Cualquier cambio en la lógica de mapeo DEBE pasar por control de cambios y aprobación de gobernanza; las versiones antiguas DEBEN mantenerse para reproducibilidad.

Relación con el Terapeuta

- El terapeuta es el único responsable final de interpretar y decidir acciones basadas en las salidas de la IA.
- La IA DEBE ofrecer sólo apoyo interpretativo y jamás sustituir el criterio humano.

Cumplimiento

- La gobernanza DEBE revisar periódicamente el protocolo y certificar cumplimiento por auditoría.
- Cualquier incumplimiento DEBE reportarse y bloquear el uso hasta resolución.

FIN DEL PROTOCOLO