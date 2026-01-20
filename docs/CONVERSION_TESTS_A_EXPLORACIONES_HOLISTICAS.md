# Conversión de Tests a Exploraciones Holísticas (Pre-MSHEv2)

Documento de gobernanza: lista los TestModule existentes, su estado actual y la conversión propuesta a nombres y funciones holísticas. Profesional, no clínico; no altera código ni ejecución.

## 1. Principios de conversión
- No diagnóstico: las exploraciones no diagnostican ni etiquetan condiciones.
- Uso exclusivo del terapeuta: los resultados técnicos quedan accesibles solo en vistas terapeuta; el cliente recibe solo resúmenes simbólicos y educativos.
- Lectura simbólica / energética / experiencial: las descripciones son interpretativas y destinadas a acompañamiento, no a evaluación clínica.

## 2. Tabla de Conversión

| Código | Nombre actual | Nuevo nombre holístico | Estado (propuesto) | Función simbólica | Sefirot implicadas | Visible cliente |
|---|---|---|---:|---|---|---:|
| phq-9 | PHQ-9 | Exploración de Vitalidad Emocional | Reactivada (holística, terapeuta-first) | Observar energía anímica y variaciones en la vivencia afectiva | Tiferet (primaria); Gevurah, Chesed (sec.) | Sí (resumen simbólico)
| gad-7 | GAD-7 | Exploración de Activación y Calma Interior | Reactivable (terapeuta-only por defecto) | Mapear activación, recursos de regulación y estrategias de calma | Netzach (primaria); Hod, Yesod | No (cliente solo resumen si gobernanza autoriza)
| bai | BAI | Exploración de Sensibilidad Corporal y Alerta | Reactivable (terapeuta-only) | Identificar patrones de sensibilidad corporal y respuestas de alerta en el relato | Yesod (primaria); Gevurah, Hod | No (cliente solo resumen)
| bdi-ii | BDI-II | Exploración de Profundidad Emocional | Reactivable (terapeuta-only) | Explorar ritmo y profundidad afectiva en narrativa simbólica | Binah (primaria); Tiferet, Chesed | No (cliente solo resumen)
| scl-90 | SCL-90 | Exploración de Dinámica Psicoemocional Global | Reactivable (terapeuta-only) | Detectar patrones transversales de experiencia y relación | Tiferet / Chesed (primarias); Hod, Netzach, Yesod | No (cliente solo resumen)
| scl-90-r | SCL-90-R | Exploración de Dinámica Psicoemocional (revisada) | Congelada (requiere revisión de esquema) | Amplio mapeo de dominios psicoemocionales (documental) | Tiferet, Chesed | No
| stai | STAI | Exploración de Estado/Tranquilidad (temporal) | Congelada | Mapear fluctuaciones de estado y calma | Netzach, Yesod | No
| pai | PAI | Exploración de Perfil de Acompañamiento (interno) | Congelada | Uso profesional interno (no holística pública) | Variable | No
| phq-9 (tests/phq-9 meta) | PHQ-9 (meta) | Exploración de Vitalidad Emocional | Activa (renderable) | Ver arriba | Tiferet | Sí
| adhd | ADHD | Exploración de Atención y Ritmo (borrador) | Congelada | Observación de atención y ritmo en experiencia | Hod, Netzach | No
| insomnia | Insomnia | Exploración de Sueño y Ciclos | Congelada | Patrones de sueño en relato simbólico | Yesod | No
| mcmi-iv | MCMI-IV | Exploración de Perfil Narrativo (profesional) | Congelada | Uso profesional avanzado | Variable | No
| ocd | OCD | Exploración de Rigidez y Repetición | Congelada | Identificar patrones repetitivos en la experiencia | Gevurah, Hod | No
| pai (professional-pai) | PAI (professional) | Exploración Profesional de Perfil | Congelada | Herramienta profesional (no cliente) | Variable | No
| ptsd | PTSD | Exploración de Huella y Recuperación | Congelada | Mapear huellas experienciales y recursos de recuperación | Yesod, Tiferet | No
| substance | Substance | Exploración de Relación a Sustancias | Congelada | Marco simbólico sobre relación y efectos experienciales | Gevurah, Yesod | No
| complete-numerology | Complete Numerology | Exploración Numerológica Completa | Activa (no clínica) | Correspondencias simbólicas y mapa cabalístico | Keter, Tiferet | Sí (material simbólico)
| cabalistic-astrology | Cabalistic Astrology | Exploración Astrológica Cabalística | Activa (SWM core — solo referencia documental) | Correlaciones simbólicas con natalidad | Keter, Binah | Sí (resumen simbólico)

> Nota: la tabla anterior se basa en el inventario actual (`tests_catalog_status.md`) y propone un estado operativo recomendado. Las decisiones finales requieren aprobación de gobernanza.

## 3. Exploraciones reactivadas
- Exploración de Vitalidad Emocional (`phq-9`): reactivada como exploración holística con vista cliente limitada a resumen simbólico; vista terapeuta completa.
- Exploración Numerológica Completa (`complete-numerology`) y Cabalistic Astrology (`cabalistic-astrology`): permanecen activas como materiales simbólicos (no-clínicos) y pueden mostrarse en UI como contenido educativo.

## 4. Exploraciones congeladas
- SCL-90-R, STAI, BAI, BDI-II, GAD-7, ADHD, PTSD, etc.: congeladas hasta revisión de esquema y aprobación de gobernanza para reactivación como holísticas.

## 5. Exploraciones excluidas definitivamente
- Ninguna exclusiva queda propuesta en este documento como "eliminada" por defecto; si un TestModule debe ser retirado, se documentará la razón y el proceso de archivado en `docs/00_SOURCE_OF_TRUTH.md`.

## 6. Preparación para MSHEv2
- Concepto: MSHEv2 recibirá como insumo exploraciones holísticas (lecturas estructuradas y metadatos) — no scores clínicos — para alimentar análisis longitudinal y dashboards terapeuta.
- Flujo conceptual: `TestModule (ejecución técnica)` → `AnalysisRecord` (referencia) → `HolisticExploration` (vista semántica) → MSHEv2 (agregación de tendencias simbólicas). MSHEv2 no debe recibir ni exponer datos clínicos sensibles ni etiquetas diagnósticas.

---
Registro: este documento es una propuesta de conversión pre-MSHEv2. Es normativo y requiere aprobación de gobernanza para ejecutar las reactivaciones o cambios de estado sugeridos.
