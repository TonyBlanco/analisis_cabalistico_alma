# TreeStructuralState (FASE 2)

## Propósito del TreeStructuralState

Definir un estado simbólico estructural canónico del Árbol de la Vida para FASE 2, con alcance observacional y determinista, que permita separar estructura de interpretación.

## Qué es

Un contrato de datos estructurales que describe la configuración simbólica del Árbol de la Vida a partir de entradas deterministas, sin narrativa y sin clínica.

## Qué NO es

No es interpretación simbólica, no es diagnóstico clínico, no es recomendación, no es narrativa, no es motor de decisión.

## Qué problemas resuelve

Establece una frontera clara entre estructura simbólica y contenido interpretativo, habilita interoperabilidad entre backend y UI, y evita ambigüedad en la migración del legacy.

## Principios de diseño

- determinista
- estructural
- observacional
- desacoplado de interpretación

## Entradas del estado (Inputs simbólicos)

El estado puede recibir únicamente datos simbólicos deterministas provenientes de:

- Tarot: cartas seleccionadas y posiciones estructurales.
- Árbol de la Vida legacy: numerología base, inclusión y mapeos de sefirot/senderos.
- Visualizadores: selecciones explícitas de nodos o senderos.
- Sesión simbólica: metadatos no clínicos (identificadores y contexto operativo).

Las entradas son conceptuales y se limitan a identificadores simbólicos, posiciones, conteos y relaciones estructurales.

## Salida canónica: TreeStructuralState

Descripción conceptual del objeto:

Estado estructural del Árbol de la Vida compuesto por nodos activos, senderos activos, ejes estructurales, polaridades, repeticiones y pesos simbólicos, con trazabilidad de fuentes.

Listado de campos estructurales obligatorios y su semántica:

- sefirot_activas: lista de sefirot con presencia estructural en el estado.
- senderos_activos: lista de senderos activados por correspondencia determinista.
- ejes: relaciones estructurales entre sefirot agrupadas por eje.
- polaridades: clasificación estructural yin/yang de nodos activos.
- repeticiones: símbolos reiterados detectados por conteo determinista.
- pesos: ponderaciones simbólicas derivadas de frecuencia o posición, sin interpretación.
- fuentes: origen de cada elemento estructural (tarot, numerología, inclusión, selección).

## Relación con legacy

El estado se alimenta de la lógica estructural legacy: mapeos de sefirot/senderos, numerología base e inclusión. Quedan excluidas todas las salidas narrativas, recomendaciones o textos interpretativos.

## Relación con otros módulos

- UI (visualizadores): consume TreeStructuralState para representación visual sin añadir narrativa.
- Tarot: aporta símbolos y posiciones; no interpreta.
- IA futura: solo consume el estado como insumo observacional y no decisorio.

## Límites explícitos del contrato

El contrato no puede:

- contener texto interpretativo o narrativo
- incorporar datos clínicos o diagnósticos
- incluir recomendaciones o acciones
- derivar conclusiones simbólicas
- ejecutar lógica decisoria
