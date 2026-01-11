EXPLORACIÓN CANÓNICA II — Exploración de Ritmos y Ciclos de Expresión

Estado: CANÓNICA — V1
Fecha: 2026-01-11

1. Propósito

La Exploración de Ritmos y Ciclos de Expresión está diseñada para identificar patrones temporales y cíclicos en la expresión simbólica de una persona, mapeándolos sobre el Árbol de la Vida (Sefirot) para facilitar observaciones longitudinales y síntesis holística.

No mide patología, no realiza diagnóstico y no utiliza lenguaje clínico. Sus resultados cuantitativos son relativos y accesibles únicamente al terapeuta.

2. Qué ES / Qué NO ES
Qué ES

- Un instrumento simbólico para observar ritmos y ciclos de expresión.
- Una entrada normalizada al TreeStructuralState para comparaciones intra-individuo en el tiempo.
- Un insumo para la síntesis holística y la planificación terapéutica humana.

Qué NO ES

- No es un examen clínico ni un instrumento diagnóstico.
- No proporciona puntuaciones visibles al usuario.
- No automatiza decisiones de intervención.

3. Actores

Usuario

- Experimenta y responde estímulos simbólicos.
- NO ve resultados técnicos ni interpretaciones algorítmicas.

Terapeuta

- Accede a series temporales y distribuciones relativas por Sefirá.
- Interpreta ciclos, ritmo y tendencias para la síntesis terapéutica.

Sistema / IA

- Normaliza entradas, genera series temporales y el TreeStructuralState correspondiente.
- Opera como herramienta de apoyo para el terapeuta; NO comunica resultados al usuario.

4. Flujo conceptual

Usuario → Estímulos cíclicos → Respuestas → CIE (normalización) → TreeStructuralState (series temporales) → Terapeuta

5. Persistencia

- Se genera un AnalysisRecord por ejecución con metadata: origen, versión de exploración, timestamp, raw_input protegido y computed_result (TreeStructuralState temporal).
- Series temporales se versionan y son reproducibles.

6. Gobernanza

- La creación y modificación de esta exploración DEBE pasar por revisión semántica y pruebas piloto con terapeutas.
- PROHIBIDO introducir terminología clínica o mostrar porcentajes al usuario.
- Cualquier cambio DEBE registrarse en DOCUMENT_INDEX.md y requerir aprobación de gobernanza.

Nota final de seguridad

La exploración DEBE utilizarse únicamente como insumo interpretativo por profesionales; la IA actúa solo como apoyo y nunca sustituye el criterio humano.