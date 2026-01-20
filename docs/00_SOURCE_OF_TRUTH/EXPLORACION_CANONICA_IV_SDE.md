EXPLORACIÓN CANÓNICA IV — Síntesis Dinámica Evolutiva (SDE)

Estado: CANÓNICA — V1
Fecha: 2026-01-11

1. Propósito

La Síntesis Dinámica Evolutiva (SDE) es una exploración canónica diseñada para agregar y sintetizar resultados de múltiples exploraciones simbólicas, generando una representación consolidada apta para la interpretación holística por un terapeuta y diseñada como entrada formal al HolisticSynthesisEngine.

La SDE NO genera diagnósticos; su salida es un artefacto de síntesis estructurada, destinado sólo a la interpretación profesional.

2. Qué ES / Qué NO ES
Qué ES

- Un proceso de agregación y normalización de múltiples TreeStructuralState en un estado consolidado.
- Una entrada formal y versionada para la HolisticSynthesisEngine.
- Un insumo para la planificación terapéutica y la evaluación longitudinal.

Qué NO ES

- No es una evaluación clínica ni un sistema de etiquetas diagnósticas.
- No expone recomendaciones automáticas al usuario.

3. Actores

Usuario

- No visualiza la síntesis ni recibe recomendaciones de la SDE.

Terapeuta

- Accede a la síntesis consolidada y a metadatos de las exploraciones que la componen.
- Interpreta la síntesis en su práctica profesional.

Sistema / IA

- Ejecuta la agregación determinista y produce un artefacto versionado (SDE record).
- Opera bajo gobernanza y con trazas suficientes para auditoría.

4. Flujo conceptual

Múltiples TreeStructuralState → Normalización de series → Agregación ponderada → SDE record → Terapeuta

5. Persistencia

- Se crea un SDE_Record con: componentes (referencias a AnalysisRecord), algoritmo_snapshot, timestamp, y computed_result consolidado.
- El SDE_Record es inmutable y versionado.

6. Gobernanza

- La SDE DEBE definirse con reglas claras de agregación y ponderación, aprobadas por gobernanza.
- PROHIBIDO usar la SDE para decisiones automáticas sin intervención humana.
- Cualquier cambio en las reglas de agregación DEBE pasar por control de cambios y mantener versiones para reproducibilidad.

Nota final de seguridad

La SDE es una herramienta de síntesis estratégica; su uso operativo DEBE requerir siempre la supervisión y validación del terapeuta.