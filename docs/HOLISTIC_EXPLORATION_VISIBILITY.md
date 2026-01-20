# Holistic Exploration — Visibilidad y lenguaje (documento vinculante)

Este documento fija de forma vinculante qué ve el cliente y qué ve el terapeuta en las Exploraciones Holísticas, qué se oculta explícitamente y qué lenguaje está prohibido en las interfaces visibles al usuario.

1) Principio de separación Cliente / Terapeuta
- Principio rector: separación estricta entre la capa de presentación al **cliente** (resúmenes simbólicos, educativos y no clínicos) y la capa profesional del **terapeuta** (lectura completa, notas y recomendaciones). Esta separación es obligatoria y auditada.
- Fuente de verdad técnica: `TestModule` y `AnalysisRecord` permanecen como verdad técnica; cualquier presentación holística es una vista derivada y documentada que referencia esos artefactos (ver `docs/HOLISTIC_EXPLORATION_MODEL.md`).

2) Visibilidad Cliente
- Elementos obligatoriamente visibles al cliente:
  - `title`: nombre holístico (sin acrónimos clínicos ni etiquetas diagnósticas).
  - `category`: categoría holística (p. ej. "Integración", "Emocional").
  - `sefira_principal`: etiqueta simbólica de tendencia (ej.: "Tiferet — tendencia a la integración").
  - Resumen simbólico breve y educativo: 2–3 frases, lenguaje orientado a reflexión y prácticas no prescriptivas.
  - Aviso explícito de no-diagnóstico y referencia a consentimiento/privacidad.

- Lenguaje permitido (ejemplos)
  - Permitido: "predominio de", "tendencia simbólica", "inclinación relativa", "sugerencia reflexiva", "práctica de anclaje".
  - Formato: frases declarativas, en presente, sin porcentajes médicos ni labels clínicos.

3) Visibilidad Terapeuta
- Elementos disponibles solo para terapeuta autorizado:
  - Mapeo sefirotico completo con justificación textual por ítem.
  - `AnalysisRecord` ID y versión, historial de ejecuciones y metadatos técnicos.
  - Notas interpretativas ampliadas: correlaciones, contexto histórico y puntos sugeridos para la intervención simbólica.
  - Recomendaciones simbólicas y plantillas de acompañamiento (marcadas como material profesional restringido).
  - Herramientas de exportación completas con metadatos, registro de responsable y fecha.

- Reglas de acceso: el acceso terapeuta debe estar limitado por roles y generar entradas de auditoría por cada visualización o exportación.

4) Prohibiciones explícitas
- Términos y prácticas prohibidas en la UI cliente:
  - Prohibido usar: "diagnóstico", "trastorno", "PATOLÓGICO", "clinical", "PHQ-9", "GAD-7", "BDI" (y cualquier acrónimo clínico) en títulos visibles.
  - Prohibido mostrar scores brutos, rangos clínicos, porcentajes médicos o labels de severidad clínica (p. ej. "moderado", "grave").
  - Prohibido mostrar recomendaciones terapéuticas prescriptivas o instrucciones clínicas (estas van solo para terapeuta).

5) Preparación para IA terapéutica (solo conceptual)
- Bandera documental: los artefactos pueden incluir `ia_assisted: true|false` para indicar si una lectura fue asistida por IA; esta bandera es solo metadato y no expone el modelo ni el contenido al cliente.
- Presentación: las propuestas generadas por IA deben presentarse al terapeuta como "borrador asistido por IA" y requieren validación humana antes de cualquier exportación.
- Auditoría: todas las interacciones IA deben registrar prompt, modelo, versión y responsable que validó la salida.

6) Ejemplos comparativos (ANTES / DESPUÉS)
- ANTES (legacy UI visible al cliente):
  - Título: "PHQ-9" — Visible: score = 15 (moderado) — Recomendación: "Evaluar depresión" (PROHIBIDO)

- DESPUÉS (holistic UI visible al cliente):
  - Título: "Exploración holística de estado anímico"
  - Sefirá principal: "Tiferet — tendencia a la integración"
  - Resumen simbólico: "Resumen simbólico: predominio de integración con tendencia a contención. Sugerencia: prácticas de anclaje y reflexión. Esto no es un diagnóstico."
  - Nota: lectura ampliada y recomendaciones disponibles solo para terapeuta.

- ANTES (legacy terapeuta view):
  - Visible: score clínico, rango, label "moderado".

- DESPUÉS (terapeuta view):
  - Visible: `AnalysisRecord` ID, scoring técnico (solo en vista terapeuta), mapeo sefirotico completo, notas interpretativas y plantilla de recomendaciones simbólicas.

Cumplimiento y trazabilidad
- Toda modificación de lenguaje o de plantillas debe registrarse en `docs/00_SOURCE_OF_TRUTH.md` con responsable y versión.
- Incumplimientos de estas reglas deben reportarse al comité de gobernanza documental.

Este documento es vinculante: su propósito es asegurar protección del cliente, claridad de comunicación y conservación de la integridad técnica. No propone cambios técnicos; todas las adaptaciones son de presentación y gobernanza.
