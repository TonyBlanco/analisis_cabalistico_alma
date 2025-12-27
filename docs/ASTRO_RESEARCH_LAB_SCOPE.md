# Research Lab (Alcance y Límites)

- Propósito: exploración de patrones simbólicos en dataset simulado o casos marcados como “research”.
- No usa pacientes reales sin permisos; no hay datos clínicos ni conclusiones.
- Consultivo y exploratorio: sin diagnóstico, sin predicción, sin causalidad.
- Queries permitidas (ejemplos): planeta en casa, aspecto entre planetas, conteos por casa/elemento.
- Resultados: listas, conteos y frecuencias; no se persisten nuevas inferencias.
- Sin endpoints nuevos ni cambios de motor; lógica 100% frontend sobre datos de ejemplo o snapshots.
- Se activa desde el Mode Switch del módulo de Astrología (modo RESEARCH); persiste en `astro_mode` sin tocar backend.
