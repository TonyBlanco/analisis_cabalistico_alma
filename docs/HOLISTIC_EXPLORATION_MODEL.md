# Holistic Exploration Model (documento vinculante)

Este documento describe el modelo `HolisticExploration` y su relación con los `TestModule` legacy. Es vinculante: define propósito, límites y reglas de gobernanza para la capa semántica holística que actúa como puente interpretativo sobre los artefactos técnicos existentes.

1) Propósito del modelo
- Objetivo: proporcionar una capa semántica y no clínica (`HolisticExploration`) que renombre y rehúsa el framing clínico de tests legacy sin renombrar ni reimplementar `TestModule`.
- Por qué NO se renombra `TestModule`: `TestModule` permanece como artefacto técnico operativo (contratos, scoring, almacenamiento). `HolisticExploration` es una vista semántica y documental que reutiliza resultados técnicos para presentaciones y lecturas simbólicas.

2) Definición formal de `HolisticExploration`
- `HolisticExploration` es una entidad documental y de presentación que referencia un `TestModule` y su `AnalysisRecord` por ID y versión. Contiene metadatos holísticos (título no-clínico, dominio simbólico, plantilla interpretativa) y reglas de visibilidad.
- Propiedades mínimas:
  - `title` (visible al cliente, lenguaje holístico sin acrónimos clínicos)
  - `legacy_ref` (ID interno del `TestModule` o referencia `legacy`)
  - `domain` (categoría holística: emocional, integración, percepción, bloqueo, etc.)
  - `interpretation_template` (plantilla de lectura simbólica para terapeuta)
  - `visibility_policy` (definición de qué mostrar al cliente vs terapeuta)

3) Relación `TestModule` → `HolisticExploration` (bridge, no migración)
- Enfoque: puente semántico. No se migra ni transforma la lógica técnica. `HolisticExploration` referenciará los identificadores de `TestModule` y `AnalysisRecord` para mantener trazabilidad.
- Garantía operacional: las ejecuciones, cálculos y almacenamientos continúan usando `TestModule` y `TestResult`. Cualquier interpretación holística se genera en capa documental/UX y no altera resultados técnicos.

4) Categorías holísticas
- Propósito: clasificar exploraciones para guiar lectura simbólica.
- Categorías sugeridas (ejemplos):
  - Emocional: tono afectivo y variaciones.
  - Integración: coherencia entre relato y acción.
  - Percepción: estilo de atención y énfasis sensorial.
  - Bloqueo / Contención: límites, resistencia y contención.
  - Activación: energía, inquietud, impulso.

5) Visibilidad
- Cliente (visible):
  - `title` holístico (sin acrónimos clínicos).
  - Resumen simbólico y educativo: indicadores neutrales (p. ej. inclinaciones porcentuales simbólicas) y recomendaciones no prescriptivas.
  - Aviso explícito de no-diagnóstico.
- Terapeuta (exclusivo):
  - Acceso a mapeo completo: referencia a `AnalysisRecord`, justificación de la lectura, correlaciones entre ítems, historial y plantilla de recomendaciones simbólicas.
  - Herramientas de exportación profesional con metadatos y trazabilidad.

6) Relación con IA terapéutica (conceptual, futura)
- La documentación puede incluir banderas de uso de IA (por ejemplo: `ia_assisted: true/false`) pero NO implementa IA operativa ni automatiza resultados.
- Si se emplea IA en el futuro, su salida debe etiquetarse como "borrador asistido por IA" y requerir validación humana del terapeuta. La IA no debe aparecer en interfaces cliente.

7) Principios de gobernanza (vinculante)
- No clínico: el lenguaje visible al cliente debe evitar términos clínicos, acrónimos y etiquetas de diagnóstico.
- No modificar scoring/ejecución: está prohibido proponer cambios técnicos a `TestModule`, `TestResult` o DB en este documento.
- Trazabilidad: toda `HolisticExploration` debe referenciar `legacy_ref` y `AnalysisRecord` para auditoría.
- Versionado: cambios en plantillas o políticas requieren aprobación y registro en `docs/00_SOURCE_OF_TRUTH.md`.
- Acceso y privacidad: lecturas ampliadas y exportaciones quedan restringidas a roles autorizados; toda exportación registra responsable, fecha y versión.

8) Notas operativas
- Implantación: esta documentación autoriza la creación de vistas/plantillas de presentación que mapeen resultados técnicos a lecturas holísticas; no autoriza cambios en backend ni en SWM.
- Compatibilidad: cualquier inconsistencia entre una `HolisticExploration` y su `TestModule` de origen debe resolverse conservando la fuente técnica (TestModule) como verdad primaria.

Registro final: `HolisticExploration` es la capa semántica gobernada que facilita la transición del framing clínico a un marco holístico y educativo sin modificar la ejecución técnica. Este documento es vinculante y su incumplimiento requiere intervención del comité de gobernanza.
