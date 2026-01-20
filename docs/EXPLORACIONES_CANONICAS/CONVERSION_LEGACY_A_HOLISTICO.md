# CONVERSIÓN LEGACY → EXPLORACIÓN CANÓNICA HOLÍSTICA

Documento canónico de gobernanza para la conversión conceptual de tests legacy a exploraciones holísticas simbólicas.

1) Principio rector (no clínico)
- Todas las conversiones deben preservar la integridad técnica del backend (DB, modelos, scoring) y transformar exclusivamente el naming, framing y capa interpretativa hacia un lenguaje simbólico, educativo y no diagnóstico.
- Objetivo: mantener operación técnica intacta y ofrecer una capa interpretativa holística accesible al usuario (resumen simbólico) y una lectura ampliada solo para terapeuta.

2) Qué se mantiene intacto y qué se transforma
- Se mantiene intacto (NO tocar): almacenamiento de datos, lógica de cálculo, mecanismos de scoring, modelos y APIs.
- Se transforma (documental / UX / interpretativa): títulos visibles, etiquetas de interfaz, textos explicativos al usuario, nomenclatura pública, capas interpretativas simbólicas (documentos, plantillas de lectura) y políticas de visibilidad.

3) Tabla de renombrado (legacy → exploración holística)
- PHQ-9 (legacy) → Exploración holística de estado anímico (legacy: PHQ-9)
- GAD-7 (legacy) → Exploración holística de activación ansiosa (legacy: GAD-7)
- BAI (legacy) → Exploración holística de manifestación emocional aguda (legacy: BAI)
- BDI-II (legacy) → Exploración holística de tono afectivo y narrativa (legacy: BDI-II)

Notas: las referencias entre paréntesis son referencias históricas internas; en títulos visibles al usuario NO usar acrónimos clínicos.

4) Modelo estándar de Exploración Canónica (plantilla mínima)
- Identificación: Título (no-clínico), ID interno (legacy preserved), versión estructural.
- Metadatos: autoría documental, fecha, contexto de uso (autoexploración / sesión).
- Propósito simbólico: breve enunciado no clínico.
- Inputs: lenguaje experiencial / respuestas de usuario (sin cambios técnicos).
- Outputs (usuario): resumen simbólico neutro (p. ej. inclinaciones porcentuales, indicadores simbólicos).
- Outputs (terapeuta): lectura interpretativa ampliada y recomendaciones simbólicas (acceso restringido).
- Limitaciones y avisos: texto normativo sobre no-diagnóstico y responsabilidad profesional.

5) Outputs visibles al usuario
- Resumen simbólico: indicadores neutrales y descriptivos (ej.: inclinación porcentual por eje sefirotico, etiquetas neutrales como "predominio de integración").
- Material educativo: explicaciones breves de significado simbólico y uso reflexivo.
- Restricción: NUNCA exponer lecturas interpretativas completas, labels clínicos ni puntuaciones presentadas como diagnóstico.

6) Outputs exclusivos del terapeuta
- Lectura interpretativa completa: análisis ampliado que integra histórico, contexto y recomendaciones simbólicas.
- Herramientas de apoyo: notas profesionales, export completo con metadatos y trazabilidad.
- Reglas: acceso protegido, registro de auditoría en exportaciones.

7) Rol de la IA terapéutica (uso interno)
- La IA puede apoyar al terapeuta en generación de lecturas interpretativas y sugerencias simbólicas, siempre bajo control humano y registro de uso.
- Prohibido: uso de IA para generar diagnósticos o recomendaciones clínicas automatizadas.

8) Ejemplo aplicado (PHQ-9 → Exploración holística de estado anímico)
- Origen técnico: las respuestas y el scoring numérico permanecen en la DB y se calculan exactamente igual.
- Renombrado público: en interfaces y materiales de usuario el título aparecerá como "Exploración holística de estado anímico"; en metadatos internos se mantiene `legacy: PHQ-9`.
- Capa usuario (visible): se presenta un resumen simbólico con una tabla de inclinaciones por ejes (ej.: Tiferet 42%, Gevurah 20%, Chesed 38%) y una explicación educativa: "Estos valores describen presencia simbólica en su relato; no representan diagnóstico".
- Capa terapeuta (visible solo para personal autorizado): texto interpretativo completo que explica relaciones entre ítems, historial y recomendaciones simbólicas para acompañamiento.
- Ejemplo de texto usuario (breve): "Resumen simbólico: predominio de integración (Tiferet) con tendencia a contención (Gevurah). Reflexione sobre prácticas de anclaje." 

9) Consideraciones legales y de seguridad
- Advertencia legal: al transformar la presentación, no se altera la fuente técnica de datos; toda comunicación debe incluir la cláusula de no-diagnóstico y consentimiento informado para uso interpretativo.
- Privacidad: exportaciones completas solo por terapeuta y con metadatos de trazabilidad.
- Auditoría: registrar cambios de nomenclatura y versiones en la gobernanza documental (`00_SOURCE_OF_TRUTH`).

10) Plan de implementación inmediata (sin tocar backend)
1. Documental: crear y commitear archivo de mapeo y guías de UX (este documento y la tabla de renombrado).
2. UX/Front: actualizar textos visibles y títulos para reemplazar acrónimos por nombres holísticos (solo en capas de presentación; no tocar APIs ni DB). Esto es trabajo de frontend/ux y debe ser desplegado con QA de gobernanza.
3. Material terapeuta: preparar plantillas de lectura interpretativa y controles de acceso (documental y de front-end), con etiquetas de exportación y trazabilidad.
4. Formación: difundir guía breve a equipos (terapeutas y producto) sobre uso, límites y proceso de autorización.
5. Registro: anotar la conversión en `00_SOURCE_OF_TRUTH` y versionar el cambio.

Limitaciones del plan: ninguna modificación técnica, de DB o de scoring; cualquier cambio técnico exige proceso de aprobación y pruebas.

---
Registro: documento de gobernanza-first para convertir presentaciones legacy en exploraciones holísticas no-clínicas. Listo para commit en `docs/EXPLORACIONES_CANONICAS/CONVERSION_LEGACY_A_HOLISTICO.md`.
