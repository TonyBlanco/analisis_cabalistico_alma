# Catálogo de Exploraciones Holísticas (Canónico)

Documento canónico y definitivo que define el renombrado holístico, la función interpretativa y las reglas de visibilidad de las exploraciones derivadas de artefactos legacy. Este catálogo es la única referencia para frontend, producto y gobernanza. Lenguaje simbólico, no clínico.

Formato por exploración (obligatorio):
- Nombre holístico
- Código interno (existente)
- Qué observa (lenguaje simbólico)
- Qué NO hace (límites explícitos)
- Sefirá principal
- Sefirot secundarias
- Visibilidad:
  - Cliente: qué ve
  - Terapeuta: qué ve (incluye IA si aplica)
- Relación con MSHE / SCDF / SCDP (si aplica)

---

## Exploración de Vitalidad Emocional
- Código interno: `phq-9` (referencia interna)
- Qué observa: aspectos de energía anímica y variaciones en la vivencia afectiva, expresadas en lenguaje experiencial.
- Qué NO hace: no diagnostica, no etiqueta patologías ni sustituye evaluación clínica.
- Sefirá principal: `Tiferet` (integración)
- Sefirot secundarias: `Gevurah`, `Chesed`
- Visibilidad:
  - Cliente: `name` = "Exploración de Vitalidad Emocional"; resumen simbólico (2–3 frases) y aviso de no-diagnóstico.
  - Terapeuta: mapeo sefirotico completo, `analysis_record_id`, notas interpretativas y plantillas de acompañamiento; IA solo como asistente marcado.
- Relación con MSHE / SCDF / SCDP: se puede referenciar en plantillas terapeuta como contexto metodológico.

---

## Exploración de Activación y Calma Interior
- Código interno: `gad-7`
- Qué observa: características de activación emocional y recursos de regulación, descritas simbólicamente.
- Qué NO hace: not mide trastornos ni genera etiquetas clínicas.
- Sefirá principal: `Netzach` (persistencia/expresión)
- Sefirot secundarias: `Hod`, `Yesod`
- Visibilidad:
  - Cliente: `name` = "Exploración de Activación y Calma Interior"; síntesis reflexiva y sugerencias no prescriptivas.
  - Terapeuta: accesible el scoring técnico en vista restringida, mapeo detallado y notas interpretativas; IA como apoyo interno.
- Relación con MSHE / SCDF / SCDP: referencia conceptual en documentación terapeuta.

---

## Exploración de Sensibilidad Corporal y Alerta
- Código interno: `bai`
- Qué observa: sensibilidad somática, respuestas corporales y patrones de alerta bajo un lenguaje simbólico.
- Qué NO hace: no sustituye evaluación médica ni ofrece diagnóstico fisiológico.
- Sefirá principal: `Yesod` (anclaje/conexión)
- Sefirot secundarias: `Gevurah`, `Hod`
- Visibilidad:
  - Cliente: `name` = "Exploración de Sensibilidad Corporal y Alerta"; breve resumen y recomendaciones reflexivas generales.
  - Terapeuta: lectura estructural completa, mapa de correlaciones ítem→sefirá y notas de intervención simbólica; IA etiquetada y validada por humano.
- Relación con MSHE / SCDF / SCDP: uso restringido a contexto terapéutico.

---

## Exploración de Profundidad Emocional
- Código interno: `bdi-ii`
- Qué observa: matices profundos de la experiencia afectiva y su ritmo narrativo, presentados en un marco simbólico.
- Qué NO hace: no etiqueta gravedad ni establece diagnóstico.
- Sefirá principal: `Binah` (contención/estructura)
- Sefirot secundarias: `Tiferet`, `Chesed`
- Visibilidad:
  - Cliente: `name` = "Exploración de Profundidad Emocional"; resumen simbólico y guía reflexiva.
  - Terapeuta: acceso a análisis estructural completo, historial y plantillas de intervención simbólica; IA como apoyo interno bajo control humano.
- Relación con MSHE / SCDF / SCDP: referencias metodológicas en material terapeuta.

---

## Exploración de Dinámica Psicoemocional Global
- Código interno: `scl-90`
- Qué observa: patrones amplios de experiencia psicoemocional y dinámicas relacionales, desde una perspectiva holística.
- Qué NO hace: no ofrece diagnósticos ni clasificaciones clínicas.
- Sefirá principal: `Tiferet` / `Chesed` (integración y apertura)
- Sefirot secundarias: `Hod`, `Netzach`, `Yesod`
- Visibilidad:
  - Cliente: `name` = "Exploración de Dinámica Psicoemocional Global"; síntesis educativa y sugerencias de reflexión.
  - Terapeuta: mapeo completo, tendencias cross-dominio y notas interpretativas; IA asistida permitida en borrador.
- Relación con MSHE / SCDF / SCDP: se integra como capa interpretativa para análisis longitudinal.

---

## Exploración Holística Estructurada (uso terapeuta)
- Código interno: `scid-5` / `scdf` (referencias internas)
- Qué observa: instrumento estructurado para uso exclusivo terapeuta; orienta entrevistas y formulaciones, presentado en lenguaje holístico.
- Qué NO hace: no se presenta al cliente como test ni se usa como diagnóstico automatizado.
- Sefirá principal: variable según caso; se documenta en cada instancia terapeuta.
- Sefirot secundarias: según instancia.
- Visibilidad:
  - Cliente: NO visible como formulario ni como etiqueta.
  - Terapeuta: disponible como herramienta estructurada de evaluación y formulación clínica traducida a lenguaje holístico; IA solo como apoyo interno y siempre validado.
- Relación con MSHE / SCDF / SCDP: uso integrado en procesos clínicos profesionales, limitado a terapeutas autorizados.

---

## Reglas y notas finales (gobernanza)
- Prohibido en UI cliente: lenguaje clínico, acrónimos clínicos visibles, scores brutos y etiquetas de severidad.
- Todas las conversiones y nombres deben registrarse en `docs/00_SOURCE_OF_TRUTH.md` con responsable y versión.
- Las exploraciones son reinterpretaciones semánticas de artefactos existentes; no se crean nuevos tests ni se cambia la ejecución técnica.
- Cualquier excepción o petición de cambio requiere aprobación formal del comité de gobernanza documental.

Este catálogo es la fuente única y canónica para el renombrado holístico y las reglas de visibilidad. Listo para commit.
