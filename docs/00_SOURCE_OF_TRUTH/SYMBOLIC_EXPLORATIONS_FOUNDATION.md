# FUNDACIÓN: EXPLORACIONES SIMBÓLICAS CABALÍSTICAS

## 1. Propósito del Sistema

Las *Exploraciones Simbólicas Cabalísticas* son instrumentos no clínicos diseñados para facilitar la indagación personal y la reflexión terapéutica guiada por terapeutas habilitados. Están concebidas como herramientas simbólicas que conectan estímulos, respuestas y representaciones internas mediante un marco estructurado y resguardado.

Qué son:

- Herramientas de exploración simbólica y narrativa, orientadas a apoyar procesos terapéuticos supervisados por un profesional.
- Sistemas que generan representaciones normalizadas (vectores simbólicos) para ayudar al terapeuta a interpretar patrones, sin reemplazar su juicio.

Qué NO son:

- No son diagnósticos, evaluaciones clínicas ni sustitutos de atención profesional presencial. 
- No presentan métricas interpretativas automáticas al usuario.

---

## 2. Principios No Negociables

- **Separación estrita de roles:** Usuario, Terapeuta e IA son agentes con permisos y visibilidad distintos; nunca se confunden responsabilidades ni accesos.
- **No diagnóstico:** El sistema no emite diagnósticos ni usa lenguaje clínico; sus salidas son simbólicas y deben interpretarse por el terapeuta.
- **No exhibición de métricas al usuario:** El usuario solo recibe contenido de interacción y acompañamiento; porcentajes, scores o interpretaciones automáticas solo son visibles para el terapeuta.
- **Transparencia y trazabilidad:** Todas las exploraciones quedan registradas con metadatos que permitan auditoría y revisión semántica por la gobernanza.
- **Control humano irreversible:** Cualquier recomendación o interpretación es responsabilidad del terapeuta; la IA apoya, no decide.

---

## 3. Arquitectura Conceptual

Flujo textual del proceso (conceptual):

Usuario → Motor simbólico → Terapeuta

Descripción:

- El **usuario** interactúa con estímulos simbólicos (imágenes, palabras, historias). 
- El **motor simbólico** procesa las respuestas, genera vectores simbólicos y tablas de normalización que enriquecen la representación. 
- El **terapeuta** accede a los resultados, interpreta y decide intervenciones o recomendaciones.

---

## 4. Motor Central

### Cabalistic Inclination Engine (CIE)

- **Qué hace:** Transforma entradas simbólicas (respuestas del usuario) en representaciones estructuradas: vectores simbólicos, mapeos a dimensiones cabalísticas (p. ej., Sefirot conceptuales), y reportes técnicos dirigidos al terapeuta.
- **Qué produce:** Artefactos deterministas y reproducibles: vectores numéricos normalizados, metadatos de sesión, y un resumen técnico destinado únicamente al terapeuta.
- **Qué NO hace:** No realiza diagnósticos, no genera recomendaciones médicas, y no decide intervenciones sin validación humana.
- **Por qué es determinista y no clínico:** El CIE opera con reglas fijas de transformación simbólica y normalización, auditables y reproducibles; su finalidad es producir representaciones consistentes para interpretación humana, no inferencias clínicas automáticas.

Principios de diseño del CIE:

- Reproducibilidad: mismas entradas → mismas salidas.
- Auditabilidad: trazas y metadatos que permiten explicar cómo se obtuvo cada vector.
- No opacidad algorítmica: reglas de normalización y mapeo documentadas en gobernanza.

---

## 5. Estructura de una Exploración

Cada exploración se compone de capas claramente definidas:

- **Metadatos:** Identificador, versión, autor/autora conceptual, fecha, permisos de acceso, y atributos de gobernanza.
- **Estímulos simbólicos:** Contenido presentado al usuario (imágenes, palabras, evocaciones), con sus anotaciones semánticas.
- **Respuestas:** Entradas del usuario en forma de texto libre, elecciones simbólicas o tiempos de respuesta.
- **Vectores ocultos:** Representaciones internas generadas por el CIE (vectores numéricos y estructuras relacionales) que resumen patrones simbólicos.
- **Normalización a Sefirot:** Mapeo conceptual de vectores hacia un conjunto cerrado de dimensiones cabalísticas (Sefirot conceptuales) para facilitar consistencia interpretativa.

Cada componente está sujeto a control de versiones y reglas de privacidad.

---

## 6. Resultados y Visibilidad

- **Qué ve el usuario:** La experiencia interactiva y contenido de acompañamiento (explicaciones no interpretativas, orientación para la reflexión). Nunca ve scores interpretativos ni normalizaciones técnicas.
- **Qué ve el terapeuta:** Acceso a los artefactos del CIE (vectores, normalizaciones, metadatos, y un resumen técnico orientativo) junto con herramientas de anotación y licencia de interpretación.
- **Qué maneja la IA:** Procesamiento simbólico, generación de vectores y metadatos; soporte técnico para visualizaciones que el terapeuta utilice. La IA no emite juicios clínicos ni recomendaciones autónomas.
- **Qué se persiste:** Metadatos de sesión, vectores simbólicos, versiones de exploración, y registros de interpretación del terapeuta. Los datos se guardan siguiendo políticas de privacidad y gobernanza y con permisos explícitos.

---

## 7. Catálogo Inicial de Exploraciones

Lista conceptual (sin contenido de preguntas):

- Exploración de Ejes Vitales (energía, dirección, prioridades)
- Exploración de Relaciones Simbólicas (vínculos, roles, resonancias)
- Exploración de Arquetipos Personales (imágenes internas, figuras guía)
- Exploración de Ciclos y Transiciones (estaciones, fases, rupturas)
- Exploración de Valores y Toma de Sentido (principios, contradicciones, compromisos)

Cada entrada en el catálogo es una ficha conceptual que será desarrollada y revisada por gobernanza antes de su uso.

---

## 8. Gobernanza y Evolución

- **Cómo se crean nuevas exploraciones:** Propuesta formal → Revisión semántica → Prueba piloto controlada con terapeutas → Aprobación de gobernanza → Publicación en el catálogo.
- **Reglas de revisión semántica:** Verificar ausencia de lenguaje clínico, coherencia simbólica, trazabilidad de versiones, evaluación de riesgos simbólicos y de privacidad.
- **Criterios de aprobación:** Claridad conceptual, consentimiento informado del usuario, alineación con principios no negociables, y plan de supervisión clínica (si aplica).
- **Relación con `TESTS_HOLISTIC_CATALOG.md`:** El catálogo fuente (`TESTS_HOLISTIC_CATALOG.md`) actúa como registro maestro de exploraciones aprobadas; las nuevas exploraciones solo se añaden al catálogo tras la aprobación documental y post-piloto. Las referencias entre ambos documentos deben ser unívocas y versionadas.

---

## 9. Relación con el Árbol / TreeStructuralState

Contrato conceptual (sin código):

- El **Árbol** (Tree / TreeStructuralState) es la representación canónica de la estructura simbólica y topologías de Sefirot utilizadas para normalización.
- Las exploraciones producen salidas que se mapean conceptualmente a nodos y relaciones del Árbol; este mapeo es una capa semántica definida por gobernanza.
- Cambios en la estructura del Árbol requieren revisión de compatibilidad de exploraciones y versión de normalización del CIE.

---

Este documento es la fuente de verdad para el diseño futuro de exploraciones simbólicas y su gobernanza. Debe ser revisado por el comité de gobernanza y aprobado antes de la incorporación de nuevas exploraciones al catálogo maestro.
