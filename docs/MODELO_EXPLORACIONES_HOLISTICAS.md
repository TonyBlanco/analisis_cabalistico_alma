# Modelo de Exploraciones Holísticas (documento canónico)

Este documento define de forma breve y vinculante cómo se reinterpretan los tests legacy como Exploraciones Holísticas, cómo deben nombrarse y qué visibilidad corresponde a cliente y terapeuta. Documento corto, definitivo y sin lenguaje clínico.

1) Propósito del modelo (por qué NO son tests clínicos)
- Objetivo: transformar la presentación y el significado de artefactos legacy en exploraciones de carácter simbólico y educativo. No son ni pretenden ser tests clínicos ni diagnósticos; su función es ofrecer marcos de reflexión y acompañamiento.

2) Principio clave: “TestModule ≠ significado”
- El `TestModule` es el motor técnico (ejecución, scoring, almacenamiento). El significado holístico es una vista interpretativa separada y documentada. Las Exploraciones Holísticas referencian `TestModule`/`AnalysisRecord` por ID/version para trazabilidad, pero no alteran la ejecución técnica.

3) Tabla de renombrado (ejemplos)
- SCL-90 → Exploración de Patrones de Experiencia y Estrés
- PHQ-9 → Exploración de Vitalidad Emocional
- GAD-7 → Exploración de Activación y Calma
- BAI → Exploración de Respuesta Corporal al Entorno
- BDI-II → Exploración de Energía, Ritmo e Integración

4) Relación con Sefirot (sin numerología dura)
- Las Exploraciones Holísticas usan el marco sefirotico como lenguaje simbólico para describir tendencias y dinámicas (p. ej. "tendencia a integración/centrado"), sin correlaciones numéricas rígidas. La referencia a sefirot es conceptual y narrativa; no implica cálculos místicos ni reglas numéricas publicadas.

5) Visibilidad
- Cliente: solo experiencia simbólica. El cliente ve `name` (nombre holístico), `category`, `primary_sefirah` como tendencia descriptiva y un `summary` educativo de 2–3 frases con aviso de no-diagnóstico. No se muestran scores, labels clínicos ni recomendaciones terapéuticas detalladas.
- Terapeuta: lectura estructural y síntesis. El terapeuta accede a la referencia técnica (`analysis_record_id`), mapeo sefirotico completo, notas interpretativas y plantillas de recomendaciones simbólicas. Acceso restringido por rol y auditado.

6) Rol de IA
- La IA solo actúa como asistente del terapeuta (si se utiliza): genera borradores de lectura interpretativa o sugerencias simbólicas que deben ser validadas por el terapeuta. La IA nunca produce diagnósticos ni se expone al cliente.

7) Qué NO hacer (reglas de gobernanza)
- No usar lenguaje médico ni acrónimos clínicos en nombres visibles al cliente.
- No exponer scores clínicos, rangos ni labels de severidad al cliente.
- No modificar `TestModule`, `TestResult`, DB, scoring o SWM como parte de esta transformación.
- No crear nuevas fuentes de verdad: registrar todas las conversiones y nombres en `docs/00_SOURCE_OF_TRUTH.md`.

Relación con MSHE / SCDF / SCID-5
- Las Exploraciones Holísticas se integran conceptualmente con marcos como MSHE y SCDF como niveles interpretativos compartidos: MSHE/SCDF pueden referenciarse en plantillas terapeuta como contextos metodológicos, pero no se reescriben ni se usan como etiquetas clínicas en la vista cliente. Con SCID-5 y otros instrumentos clínicos, se mantiene separación clara: dichos instrumentos siguen siendo técnicos y solo referenciados internamente cuando corresponda, sin aparecer en la interfaz cliente.

Registro final: este archivo es la definición canónica y vinculante del modelo de Exploraciones Holísticas. Es corto, normativo y definitivo; cualquier cambio requiere aprobación de gobernanza y registro en la Source of Truth.
