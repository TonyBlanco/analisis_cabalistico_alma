# Exploraciones Canónicas — Introducción

Propósito
- Definir qué son las "Exploraciones Canónicas" dentro del repositorio: artefactos documentales y de presentación que traducen entradas técnicas en materiales simbólicos y educativos, sin crear nueva lógica ni modificar el backend.

Qué NO son
- No son tests clínicos ni herramientas de diagnóstico.
- No reemplazan ni modifican modelos, scoring, bases de datos ni SWM.

Relación con el backend existente
- Los datos, cálculos y resultados técnicos permanecen intactos en el backend. Las Exploraciones Canónicas son una capa de presentación e interpretación documentada (naming, framing, plantillas y reglas de visibilidad).

Relación con SWM
- SWM (Astrología, Tarot, Bioemocional, Cábala core) queda fuera de cambios por este paquete documental. Las exploraciones pueden referenciar conceptos cabalísticos de forma documental, pero no deben modificar ni depender de implementaciones de SWM.

Principios de estabilidad y no-deriva
- Una sola Source of Truth: todas las definiciones y conversiones deben registrarse en `docs/00_SOURCE_OF_TRUTH.md`.
- Congelamiento estructural: el `MODELO_EXPLORACION_CANONICA.md` define la estructura base que requiere aprobación para cambios.
- Separación estricta de visibilidad: lo que es visible al usuario y lo que queda reservado al terapeuta debe cumplirse sin excepciones.

Direccionamiento
- Este README orienta a equipos de producto, UX y terapeutas sobre el propósito y límites de las Exploraciones Canónicas. Para detalles operativos y plantillas ver los documentos del mismo directorio.
