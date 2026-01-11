EXPLORACIÓN CANÓNICA I
Exploración de Armonía del Flujo Vital (EAFV)

Estado: CANÓNICA — V1
Dominio: Exploraciones Simbólicas Cabalísticas
Naturaleza: No clínica · No diagnóstica · Uso holístico
Visibilidad: Resultados e interpretación solo terapeuta
Ubicación prevista: docs/00_SOURCE_OF_TRUTH/

1. Propósito de la Exploración

La Exploración de Armonía del Flujo Vital (EAFV) es una exploración simbólica diseñada para observar la distribución del flujo vital de una persona a través del Árbol de la Vida (Sefirot), identificando tendencias de concentración, dispersión o bloqueo desde una perspectiva holística.

Esta exploración NO mide patología, NO evalúa conducta clínica y NO produce diagnóstico.
Su finalidad es ofrecer al terapeuta un mapa simbólico de inclinaciones energéticas, útil para el acompañamiento consciente y reflexivo.

2. Qué ES y qué NO ES
ES

Una exploración simbólica estructurada.

Un instrumento de observación holística.

Una entrada normalizada al Árbol / TreeStructuralState.

Un insumo para síntesis terapéutica consciente.

NO ES

Un test médico, psicológico o clínico.

Un sistema de puntuación visible para el usuario.

Una herramienta de autodiagnóstico.

Un instrumento de decisión automática.

3. Rol de los Actores
Usuario (Consultante)

Responde estímulos simbólicos.

No ve resultados, porcentajes ni recomendaciones.

No recibe interpretación automática.

Terapeuta

Accede al mapa completo de inclinaciones sefiroticas.

Visualiza porcentajes relativos de flujo por Sefirá.

Integra la información en su proceso de acompañamiento.

Decide qué compartir y cómo con el usuario.

Sistema / IA (si aplica)

Normaliza respuestas.

Calcula inclinaciones simbólicas.

Nunca muestra resultados directamente al usuario.

Opera bajo reglas de seguridad y no-clinicidad.

4. Estructura General de la Exploración
4.1 Metadatos Canónicos

Código: flow_harmony_exploration

Familia simbólica: Armonía · Flujo · Equilibrio

Árbol objetivo: Árbol de la Vida (10 Sefirot)

Modo de ejecución: Guiado por terapeuta

Persistencia: Sí (AnalysisRecord)

4.2 Estímulos Simbólicos

Los estímulos:

No son preguntas clínicas.

No inducen respuesta correcta/incorrecta.

Están formulados como situaciones de resonancia interna.

Ejemplos (conceptuales):

“Cuando actúas, ¿sientes expansión natural o esfuerzo constante?”

“¿Dónde percibes mayor resistencia interna al iniciar algo nuevo?”

“¿Qué áreas de tu vida se sienten más sostenidas por otros?”

⚠️ Nota:
El texto exacto de los estímulos se define en un documento posterior de diseño semántico.
Aquí solo se define la estructura, no el contenido final.

4.3 Vectores Simbólicos Ocultos

Cada estímulo alimenta uno o varios vectores simbólicos internos, no visibles al usuario:

Expansión ↔ Contención

Iniciativa ↔ Respuesta

Voluntad ↔ Forma

Relación ↔ Autonomía

Estos vectores se proyectan internamente sobre las Sefirot.

5. Motor Central
Cabalistic Inclination Engine (CIE)
Función

Traducir respuestas simbólicas en distribución relativa de flujo vital.

Normalizar resultados en porcentajes relativos, no absolutos.

Output principal

Mapa de inclinación por Sefirá (suma total = 100%).

Ejemplo (solo terapeuta):
Kéter: 6%
Jojmá: 9%
Biná: 8%
Jésed: 14%
Guevurá: 12%
Tiferet: 16%
Nétzaj: 10%
Hod: 7%
Yesod: 11%
Maljut: 7%

Qué NO hace

No clasifica.

No compara con normas.

No genera etiquetas.

No produce recomendaciones automáticas al usuario.

6. Normalización al Árbol (TreeStructuralState)

Los resultados se transforman a un TreeStructuralState estándar:

Nodo = Sefirá

Peso = porcentaje relativo de inclinación

Metadatos:

origen: flow_harmony_exploration

versión del motor

timestamp

Este estado puede:

Visualizarse en mapas de flujo.

Integrarse en síntesis holística.

Compararse solo dentro del mismo individuo en el tiempo.

7. Resultados y Visibilidad
Usuario

Solo ve: confirmación de exploración completada.

Opcional: visual simbólica neutra (sin métricas).

Terapeuta

Ve:

Distribución completa por Sefirot.

Lectura simbólica sugerida.

Evolución temporal (si existe).

IA

Puede generar borradores interpretativos solo para el terapeuta.

Nunca se expone directamente al usuario.

8. Persistencia y Auditoría

Se guarda un AnalysisRecord con:

kind: symbolic_exploration

subtype: flow_harmony

computed_result: TreeStructuralState

algorithm_snapshot: versión del CIE

raw_input: respuestas simbólicas (protegidas)

El registro es:

Inmutable

Auditable

Versionable

9. Gobernanza
Para crear nuevas exploraciones:

Deben seguir esta misma estructura.

Deben mapear explícitamente al Árbol.

Deben declarar visibilidad y límites.

Prohibido:

Introducir métricas clínicas.

Mostrar porcentajes al usuario.

Usar nomenclatura médica.

10. Estado de Aprobación

 Diseño conceptual completo

 Revisión semántica final

 Aprobación de gobernanza

 Implementación técnica (futura)

FIN DEL DOCUMENTO CANÓNICO