RESULTADOS Y VISIBILIDAD — Normativa Canónica

Estado: CANÓNICO — V1
Fecha: 2026-01-11

1. Propósito

Establecer reglas claras sobre qué artefactos y visualizaciones están disponibles para cada actor (Usuario, Terapeuta, IA) y qué puede persistirse o exportarse.

2. Qué ES / Qué NO ES
Qué ES

- Un documento que define visibilidad, persistencia y restricciones de comunicación.

Qué NO ES

- No es una guía de implementación técnica ni un flujo de datos detallado.

3. Visibilidad por actor

Usuario

- Solo ve confirmación de exploración completada y, opcionalmente, visual simbólica NO cuantitativa.
- NO ve porcentajes, normalizaciones ni interpretaciones automáticas.

Terapeuta

- Accede a: TreeStructuralState completo, series temporales, metadatos, borradores interpretativos de la IA (si existen).
- Puede exportar reportes técnicos para uso profesional, siempre bajo políticas de privacidad.

IA

- La IA SOLO produce outputs para el terapeuta y NO comunica directamente con el usuario.
- La IA DEBE etiquetar todas sus salidas como "BORRADOR" y registrar algorithm_snapshot.

4. Persistencia y Exportación

- Se pueden persistir: AnalysisRecord (raw_input protegido), TreeStructuralState, algorithm_snapshot, notas del terapeuta.
- Exportación DEBE respetar permisos y anonimización cuando corresponda; PROHIBIDO exportar datos que permitan diagnósticos automáticos o identificación sin consentimiento.

5. Reglas de Comunicación

- Cualquier interpretación automatizada DEBE pasar por revisión humana antes de ser comunicada al usuario.
- PROHIBIDO mostrar porcentajes o recomendaciones generadas por IA al usuario sin validación y redacción por el terapeuta.

Nota final de seguridad

Las reglas de visibilidad preservan la separación de roles y aseguran que la interpretación sea humana y responsable.