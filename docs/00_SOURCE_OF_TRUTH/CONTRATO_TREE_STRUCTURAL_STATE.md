CONTRATO: TreeStructuralState — Especificación Canónica

Estado: CANÓNICO — V1
Fecha: 2026-01-11

1. Propósito

Definir el contrato técnico y semántico del objeto TreeStructuralState que sirve como representación canónica de salida para las exploraciones simbólicas.

2. Qué ES / Qué NO ES
Qué ES

- Un estado estructurado que representa nodos (Sefirot) y pesos relativos de inclinación o resonancia.
- Un artefacto versionado y reproducible que DEBE ser usado como input para procesos de síntesis y visualización.

Qué NO ES

- No es una inferencia clínica ni una etiqueta diagnóstica.
- No debe interpretarse sin la mediación profesional del terapeuta.

3. Campos (Obligatorios)

- nodes: lista de identificadores de Sefirot (ej: keter, jochma, bina, ...)
- weights: mapa node → porcentaje relativo (suma = 100%)
- origin: identificador de exploración (ej: flow_harmony_exploration)
- algorithm_snapshot: referencia a versión del motor (ID o hash)
- timestamp: ISO8601
- version: versión del esquema
- metadata: {session_id, therapist_id (si aplica), permissions}

4. Campos (Opcionales)

- axis_markers: marcadores de polaridad o ejes analizados
- notes: anotaciones del terapeuta

5. Reglas de Consistencia

- weights DEBEN sumar 100% dentro del contexto del mismo record.
- nodes DEBEN pertenecer al conjunto canónico de 10 Sefirot o a la taxonomía aprobada por gobernanza.

6. Qué NO se puede inferir

- No se DEBE inferir diagnóstico, condición clínica o etiquetas médicas a partir de cualquier TreeStructuralState.
- No se DEBE imputar causalidad directa entre nodos y comportamientos sin validación profesional.

7. Persistencia y Versionado

- Cada TreeStructuralState DEBE almacenarse como parte del AnalysisRecord con versiones inmutables.
- Cambios en el esquema DEBEN registrar migraciones y mantener compatibilidad retroactiva cuando sea posible.

Nota final de seguridad

El TreeStructuralState es un contrato semántico y técnico que facilta interoperabilidad entre exploraciones y herramientas; su uso DEBE estar sujeto a gobernanza.