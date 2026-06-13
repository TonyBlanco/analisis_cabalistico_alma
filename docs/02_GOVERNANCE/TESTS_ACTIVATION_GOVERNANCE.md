# GOBERNANZA DE ACTIVACION DE TESTS HOLISTICOS

**Version:** 1.0.0
**Estado:** CANONICO
**Fecha:** 2026-06-13
**Autoridad:** docs/02_GOVERNANCE/TEST_GOVERNANCE_RULES.md
**Fuente de verdad:** docs/00_SOURCE_OF_TRUTH/TESTS_HOLISTIC_CATALOG.md

---

## 1. Autorizacion y Marco de Uso

### 1.1 Declaracion de naturaleza no clinica

Todos los instrumentos listados en este documento son herramientas de exploracion simbolica y autoconocimiento. Ninguno de ellos constituye un instrumento de diagnostico medico, psiquiatrico ni psicologico. Sus resultados no tienen validez clinica ni sustituyen la evaluacion de un profesional de la salud mental o medicina.

La plataforma Analisis Cabalistico / Studios33 opera bajo el principio de que estos tests son espejos del alma: instrumentos de contemplacion basados en archetipos cabalísticos, numerologia y autoobservacion. El sistema nunca emitira etiquetas diagnosticas del tipo "tienes X trastorno" ni recomendaciones de tratamiento.

### 1.2 Marco legal aplicable

- El sistema no ofrece servicios sanitarios regulados en ninguna jurisdiccion.
- Los tests holisticos se enmarcan como actividades de desarrollo personal y bienestar espiritual.
- Los operadores de la plataforma no asumen responsabilidad clinica por las interpretaciones que los usuarios hagan de sus resultados.
- Los usuarios mayores de edad aceptan estos terminos al iniciar cualquier instrumento.
- En ningun caso el resultado de un test sustituye la consulta con un profesional cualificado.

### 1.3 Uso simbolico y espiritual

Los tests reinterpretan cuestionarios de cribado clinico establecidos mediante un marco cabalístico. La reinterpretacion es deliberada y sistematica:

| Test clinico original | Reinterpretacion holistica | Dominio simbolico |
|---|---|---|
| AUDIT | SHA — Sephirotic Harmony Audit | Equilibrio de Netzach (pasiones) |
| EAT-26 | EAT-26-Spirit — Eternal Abundance Threshold | Relacion sagrada con el sustento (Malkhut) |
| DUDIT | DUDIT-Spirit — Divine Unity Drug Introspection | Interferencias auricas, Hod/Yesod |
| Y-BOCS | Y-BOCS-Soul — Yetziratic Balance Sanctuary | Rituales repetitivos, purificacion (Gevurah) |
| ASRS | ASRS-Essence — Archetypal Soul Rhythm Scale | Gestion de la atencion (Tiferet/Malkhut) |
| AQ-50 | AQ-K — Aura Quotient for Kabbalistic Alignment | Estructuras mentales (Binah) y patrones |
| MCMI-4 | MCMI-4 SIGNAL (cribado 16 items) | Mundo predominante y mundo sombra |

---

## 2. Flags de activacion por test

La tabla siguiente define el estado de activacion de cada instrumento holistico en la base de datos. Todos los campos corresponden directamente a columnas del modelo `TestModule`.

| code | required_access_level | requires_license | available_for_personal | available_for_therapists | execution_mode | pilot_guard |
|---|---|---|---|---|---|---|
| `sha_harmony` | personal | False | True | True | patient_self | False |
| `eat26_spirit` | personal | False | True | True | patient_self | False |
| `dudit_spirit` | personal | False | True | True | patient_self | False |
| `ybocs_soul` | personal | False | True | True | patient_self | False |
| `asrs_essence` | personal | False | True | True | patient_self | False |
| `aq_kabbalah` | personal | False | True | True | patient_self | False |
| `mcmi4_signal` | personal | False | True | True | patient_self | False |

### 2.1 Notas sobre flags

- `required_access_level: personal` — Disponible con el plan base; no se requiere plan profesional ni premium.
- `requires_license: False` — No se requiere licencia de terapeuta para acceder como usuario final.
- `available_for_personal: True` — El consultante puede ejecutar el test de forma autonoma.
- `available_for_therapists: True` — El terapeuta puede asignar el test desde su panel.
- `execution_mode: patient_self` — El instrumento es auto-administrado; no requiere sesion sincrónica.
- `pilot_guard: False` — No esta bajo guarda piloto; el test es plenamente accesible en produccion.

### 2.2 Tests excluidos de este documento

`mcmi4_mystic` (195 items, 4 Mundos) se excluye de esta tabla de activacion porque su ciclo de vida tiene una gobernanza independiente por volumen y complejidad de banco de preguntas.

---

## 3. Disclaimer canonico

El siguiente texto es obligatorio y canonico. Debe mostrarse al usuario antes de iniciar cualquier instrumento holistico (pantalla de introduccion) y al final (pantalla de resultados), inmediatamente antes de mostrar la interpretacion.

### Texto canonico (espanol)

> Este instrumento es una herramienta de exploracion simbolica y autoconocimiento, no un instrumento de diagnostico clinico. Sus resultados no sustituyen la evaluacion de un profesional de la salud. Si experimentas angustia emocional o necesitas apoyo, consulta con tu terapeuta o un profesional cualificado.

### Implementacion tecnica

- Componente de referencia: `GuidedBlock` con `variant="info"` o banner dedicado `HolisticDisclaimer`.
- El disclaimer debe estar visible sin necesidad de scroll en la pantalla de introduccion.
- En resultados, debe aparecer antes del bloque de interpretacion cabalistica.
- El texto canonico no debe abreviarse ni parafrasearse; puede traducirse si el sistema soporta multiples idiomas, pero la version espanola es autoritativa.

---

## 4. Politica de items de seguridad

### 4.1 Clasificacion de items por nivel de sensibilidad

Algunos items en los cuestionarios originales clinicos indagan sobre conductas de riesgo. La reinterpretacion cabalistica reformula el lenguaje, pero la semantica subyacente permanece. La siguiente tabla documenta la presencia de items sensibles por test:

| code | items sensibles presentes | descripcion | accion requerida |
|---|---|---|---|
| `sha_harmony` | No | Sin items de riesgo directo | Ninguna accion adicional |
| `eat26_spirit` | No | Sin items de riesgo directo | Ninguna accion adicional |
| `dudit_spirit` | No | Sin items de riesgo directo | Ninguna accion adicional |
| `ybocs_soul` | Si | Item sobre pensamientos intrusivos (compulsiones mentales) | Mostrar mensaje de derivacion al finalizar si item seleccionado con valor alto |
| `asrs_essence` | No | Sin items de riesgo directo | Ninguna accion adicional |
| `aq_kabbalah` | No | Sin items de riesgo directo | Ninguna accion adicional |
| `mcmi4_signal` | No | Cribado de 16 items; sin items de riesgo agudo | Ninguna accion adicional |

### 4.2 Plantilla de mensaje de derivacion por item

Cuando un item identificado como sensible recibe una puntuacion alta (valor >= umbral definido en el scorer), el sistema debe mostrar el siguiente mensaje inmediatamente tras registrar la respuesta, antes de continuar al siguiente item:

> Si alguna respuesta te genera preocupacion, te animamos a compartirlo con tu terapeuta o profesional de salud.

Este mensaje no bloquea el avance del test. Es informativo y no diagnostico.

### 4.3 Item especifico: ybocs_soul

El item cabalístico que reinterpreta la subescala de obsesiones (pensamientos intrusivos en el Y-BOCS original) activa el mensaje de derivacion si la respuesta seleccionada corresponde a una frecuencia "muy frecuente" o "casi siempre". El scorer de `ybocs_soul` es responsable de senalizar este estado mediante un flag `item_alert: true` en el payload de respuesta intermedia, que el frontend consume para mostrar el mensaje.

---

## 5. Politica de referral (derivacion al profesional)

El sistema mostrara un mensaje de derivacion al profesional al presentar los resultados cuando el score global del test caiga en las zonas indicadas. Estas zonas se mapean desde los umbrales clinicos originales, reinterpretados simbólicamente.

| code | zona que activa referral | umbral | texto de zona en resultados |
|---|---|---|---|
| `sha_harmony` | Zona "alta resonancia disruptiva" | Score >= 16 (equivalente AUDIT zona riesgo) | "Tu patron energetico sugiere una carga elevada en Netzach. Considera compartir esta exploracion con tu acompanante." |
| `eat26_spirit` | Zona "alta tension con el sustento" | Score >= 20 (equivalente EAT-26 clinico) | "Tu relacion simbolica con el sustento muestra tension significativa. Te animamos a dialogarlo con tu terapeuta." |
| `dudit_spirit` | Zona "alta interferencia aurica" | Score >= 25 (equivalente DUDIT zona problemas) | "Las interferencias detectadas en tu campo aurico son elevadas. Compartelas con tu acompanante espiritual o terapeuta." |
| `ybocs_soul` | Zona "alta carga ritual" | Score >= 16 (equivalente Y-BOCS moderado-severo) | "Tu campo de Gevurah muestra una carga ritual elevada. Tu terapeuta puede acompanarte en este proceso." |
| `asrs_essence` | Zona "ritmo muy fluctuante" | 4 o mas items en frecuencia alta (equivalente ASRS positivo) | "Tu ritmo atencional muestra fluctuaciones significativas. Compartelo con tu acompanante." |
| `aq_kabbalah` | Zona "estructuras muy marcadas" | Score >= 32 (equivalente AQ-50 zona clinica) | "Tus patrones de Binah muestran estructuras muy marcadas. Considera explorarlos con apoyo profesional." |
| `mcmi4_signal` | Zona "sombra predominante" | Mundo sombra con intensidad alta segun scorer | "Tu mundo sombra predominante merece atencion. Tu terapeuta puede acompanarte en integrarlo." |

### 5.1 Implementacion del mensaje de referral

El mensaje de referral se renderiza como un bloque `GuidedBlock` con `variant="info"` y `role="patient"` al final de la pantalla de resultados, antes del cierre de sesion del test. No es modal ni bloqueante. El usuario puede ignorarlo y continuar.

### 5.2 Regla de no diagnostico en el referral

El texto del referral nunca menciona nombres de trastornos, categorias DSM/ICD ni terminos clinicos. El lenguaje es exclusivamente simbolico y de acompanamiento.

---

## 6. Ciclo de vida de activacion

Cada test holistico debe completar el siguiente checklist antes de considerarse plenamente activo en produccion. El estado actual de cada test se registra en esta tabla.

| Etapa | sha_harmony | eat26_spirit | dudit_spirit | ybocs_soul | asrs_essence | aq_kabbalah | mcmi4_signal |
|---|---|---|---|---|---|---|---|
| Banco de preguntas canonico definido | ok | ok | ok | ok | ok | ok | ok |
| Scorer deterministico implementado | ok | ok | ok | ok | ok | ok | ok |
| Dispatch cableado en /api/tests/execute/ | ok | ok | ok | ok | ok | ok | ok |
| Flags DB actualizados segun seccion 2 | ok | ok | ok | ok | ok | ok | ok |
| Frontend implementado (pantalla intro + items + resultados) | ok | ok | ok | ok | ok | ok | ok |
| Tests unitarios del scorer | ok | ok | ok | ok | ok | ok | ok |
| Documentado en este archivo | ok | ok | ok | ok | ok | ok | ok |

### 6.1 Criterio de completitud

Un test alcanza estado "plenamente activo" cuando todas las etapas de su columna marcan `ok`. Cualquier etapa en estado `pendiente` bloquea el despliegue en produccion del test correspondiente, independientemente de los flags de base de datos.

### 6.2 Responsabilidad de actualizacion

Este documento debe actualizarse cada vez que:

- Se incorpora un nuevo test holistico al catalogo.
- Cambia un flag de activacion en la base de datos.
- Se modifica el disclaimer canonico o la politica de referral.
- Se identifica un nuevo item sensible en un instrumento existente.

La actualizacion requiere commit a `main` con tipo `docs:` y referencia a este archivo.

---

## 7. Referencias

- `docs/00_SOURCE_OF_TRUTH/TESTS_HOLISTIC_CATALOG.md` — Definicion autoritativa de tests existentes.
- `docs/02_GOVERNANCE/TEST_GOVERNANCE_RULES.md` — Reglas generales de gobernanza de tests.
- `docs/11_DIAGNOSTICS/IMPLICIT_CLINICAL_BLOCKED_TESTS.md` — Tests con disponibilidad restringida por flags de bloqueo.
- `backend/api/tests/execute/` — Implementacion del endpoint de ejecucion.
- `tonyblanco-app/components/ui/guided-block.tsx` — Componente UI para bloques informativos y de derivacion.
