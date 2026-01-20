# GOBERNANZA: EXPLORACIONES CANÓNICAS

Documento normativo para congelar y validar la estructura de la
`EXPLORACION_CANONICA_I` como MODELO BASE para futuras exploraciones.

## 1) Declaración de Congelación
- Modelo: `EXPLORACION_CANONICA_I` = MODELO BASE
- Estado: **CONGELADO (estructura)** — la estructura descrita en este documento queda fijada como referencia única para todas las exploraciones canónicas derivadas.

## 2) Estructura Obligatoria
Toda exploración que se identifique como canónica debe incluir, en este orden, las secciones mínimas e inmutables:

1. Identificación
   - Título
   - Identificador único (ID)
   - Versión estructural
2. Metadatos
   - Autoría (equipo responsable)
   - Fecha de creación / última revisión
   - Referencia a `EXPLORACION_CANONICA_I` cuando aplique
3. Propósito y Alcance
   - Objetivo de la exploración
   - Límites de uso (población, contexto)
4. Estructura de Contenido
   - Lista de secciones y campos obligatorios (encabezados y tipos de dato esperados)
   - Modelo de datos (campos, tipos, cardinalidad)
5. Procedimiento de Recolección
   - Instrucciones operativas y consideraciones de implementación
6. Limitaciones y Uso Aceptable
   - Advertencias explícitas sobre lo que la exploración NO es
7. Versionado y Trazabilidad
   - Historial de cambios estructurales y responsables

Prohibido: incluir secciones clínicas, scores cuantitativos que funcionen como diagnóstico, diagnósticos clínicos, o recomendaciones terapéuticas dentro de la estructura canónica.

## 3) Reglas de Creación
- Cuándo se puede crear una nueva exploración canónica:
  - Solo cuando exista una necesidad funcional claramente justificada que no pueda cubrirse con la estructura de `EXPLORACION_CANONICA_I`.
  - Requiere aprobación formal del comité de gobernanza documental.
- Qué NO se puede cambiar sin aprobación:
  - Los nombres y la existencia de las secciones obligatorias listadas en la sección 2.
  - El identificador único y el mecanismo de versionado estructural.
- Qué requiere aprobación de gobernanza:
  - Cualquier modificación estructural (añadir/eliminar secciones obligatorias, cambiar tipos de datos, cambiar cardinalidad).
  - La creación de una exploración que sea una variante substancial de `EXPLORACION_CANONICA_I`.

## 4) Relación con otros sistemas
- Esta gobernanza NO afecta al funcionamiento de SWM; no debe tocarse ni modificarse SWM como consecuencia de este documento.
- Esta exploración canónica NO reemplaza a un `TestModule` ni a otros artefactos funcionales.
- La exploración NO debe usarse como herramienta de diagnóstico clínico ni como sustituto de valoración profesional.

## 5) Prevención de Deriva
- Queda prohibida la duplicación del Source of Truth: no crear documentos paralelos que redefinan la estructura fijada aquí.
- Prohibido crear variantes o forks de `EXPLORACION_CANONICA_I` sin una justificación documentada y aprobación de gobernanza.
- Cualquier propuesta de variación debe incluir: motivo técnico/operativo, impacto, migración/compatibilidad y autorización firmada.

---
Registro: este documento congela la estructura de `EXPLORACION_CANONICA_I` como MODELO BASE. El archivo es normativo, breve y no incorpora contenido simbólico nuevo.
