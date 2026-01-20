EXPLORACIÓN CANÓNICA I — Exploración de Activación Simbólica (Modelo Base)

Estado: CANÓNICO — V1
Fecha: 2026-01-11

1. Nombre simbólico

Exploración de Activación Simbólica (EAS) — modelo base de exploración canónica

2. Propósito de la exploración

La EAS está diseñada para facilitar la indagación y la reflexión simbólica sobre los patrones de activación interna de una persona, ofreciendo al terapeuta un artefacto interpretativo que sirva de base para la síntesis holística. No pretende diagnosticar ni medir condiciones clínicas.

3. Dominio simbólico

- Concepto central: energía, inclinación y equilibrio expresados en un marco cabalístico (Sefirot) u otra taxonomía simbólica aprobada por gobernanza.
- Alcance: representación simbólica de tendencias, no inferencias clínicas.

4. Inputs (alto nivel)

- Respuestas narrativas y elecciones simbólicas del usuario.
- Metadatos de sesión (timestamp, versión de exploración, permisos).
- No se requieren medidas clínicas ni acrónimos diagnósticos.

5. Outputs visibles al usuario (normativo)

- Feedback simbólico en lenguaje neutro y experiencial (p. ej., metáforas, orientaciones para reflexión).
- Visual simbólica neutral (iconografía o mapas estilizados) que NO muestran métricas cuantitativas.

Importante: POR PRINCIPIO DE GOBERNANZA está PROHIBIDO mostrar porcentajes, scores o recomendaciones automáticas al usuario; cualquier mención numérica queda reservada exclusivamente al terapeuta.

6. Outputs EXCLUSIVOS del terapeuta

- Artefacto técnico: TreeStructuralState o equivalente (nodos y pesos relativos), con algorithm_snapshot y metadatos.
- Lecturas interpretativas extensas y recomendaciones profesionales (texto marcado como "borrador para revisión del terapeuta").
- Series temporales y comparativas intra-individuo para seguimiento.

7. Reglas explícitas

- El usuario NO ve recomendaciones, diagnósticos ni métricas cuantitativas.
- El terapeuta es el único responsable de la interpretación final y de cualquier comunicación al usuario.
- La IA NO se usa en esta fase; cuando se habilite, sus outputs DEBEN ser exclusivas para terapeutas y estar claramente etiquetadas.

8. Persistencia y auditoría (alto nivel)

- Cada ejecución genera un AnalysisRecord inmutable que incluye raw_input protegido, computed_result (TreeStructuralState), algorithm_snapshot y metadatos.
- Los registros DEBEN ser versionados y auditables.

9. Notas de seguridad y ética

- Está PROHIBIDO usar lenguaje sugestivo o inducir respuestas dirigidas a obtener un resultado.
- El consentimiento informado del usuario DEBE explicitar la naturaleza no clínica y los límites de visibilidad.

10. Fuera de alcance

- Cualquier uso de IA, scoring algorítmico o exposición de métricas al usuario queda FUERA DE ALCANCE para esta versión canónica.

11. Declaración final

La EAS es el modelo base que deben seguir futuras exploraciones canónicas: estructura, separación de roles, persistencia y restricciones son obligatorias y forman parte de la Fuente de Verdad.
