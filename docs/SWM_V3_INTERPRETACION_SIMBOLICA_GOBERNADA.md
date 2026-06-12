# SWM v3 — Interpretación Simbólica Gobernada (Interpretación educativa con IA)

Fecha: 2026-01-01

Introducción
- SWM v3 (Specialized Workspace Modules v3) define el marco documental y de gobernanza para introducir interpretaciones simbólicas asistidas por IA con carácter educativo y simbólico.

Qué es SWM v3
- Una extensión documental y de gobernanza del sistema simbólico que permite, bajo control y consentimiento, la ejecución de análisis simbólicos asistidos por IA destinados a apoyo formativo y educativo del terapeuta y consultante.

Por qué surge
- Limita la carga humana en tareas repetitivas de correlación simbólica.
- Permite producir hipótesis educativas y patrones interpretativos que el terapeuta valida.
- Mantiene separación clara entre visualización observacional (SWM v1) y análisis interpretativo asistido.

Diferencias entre SWM v1 y SWM v3
- SWM v1: visual / observacional — renderizado, navegación, origen de verdad en `src/symbolic/`.
- SWM v3: interpretativo / educativo — análisis generado por IA bajo acción humana explícita y gobernanza documental.

Principios NO negociables
- No médico, no diagnóstico, no prescriptivo.
- IA como motor de correlación y explicación; el juicio final es siempre humano (terapeuta).
- Salidas breves, originales y no literales de fuentes externas.

Capacidades permitidas en SWM v3
- Botón de acción explícita `Interpretar tirada` o equivalente.
- Ejecución de análisis simbólico por IA (cuando el feature flag y consentimiento estén activos).
- Producción de hipótesis educativas, correspondencias y alternativas interpretativas.

Persistencia gobernada
- Modos de almacenamiento soportados:
  - `no_store` — no persiste la lectura (default para privacidad por defecto).
  - `store_anonymized` — persiste metadatos y texto anonimizado.
  - `store_with_consent` — persiste lectura con consentimiento explícito y ownership asignado (terapeuta).
- Ownership: las lecturas persistidas pertenecen al terapeuta que las genera; acceso del consultante regulado por permisos y acuerdo.

Consentimiento
- **MODELO VIGENTE (consentimiento a nivel de cuenta, una sola vez):** el consultante otorga el consentimiento **una única vez al crear/registrar su cuenta** y ese consentimiento **cubre todas las superficies de lectura simbólica educativa** del producto. No se requiere re-consentir por lectura ni por funcionalidad.
- **Alcance (cubre todo):** tirada libre, Tirada del Árbol de la Vida (10 Sefirot), interpretación por carta, lecturas natales y cualquier otra lectura simbólica educativa, incluidas las que derivan una tirada **determinista** a partir de la identidad del consultante.
- **Uso de identidad para determinismo:** bajo este consentimiento de cuenta, la identidad del consultante (nombre + fecha de nacimiento) puede usarse de forma transitoria para sembrar una tirada determinista (misma persona → misma tirada). El uso de identidad para el sembrado **no** implica por sí mismo persistencia; el almacenamiento sigue gobernado por los modos `no_store` / `store_anonymized` / `store_with_consent`.
- **[HISTÓRICO - LEGACY MODE 2026-01-28]:** el flujo de consentimiento explícito **per-lectura** (modal/banner por cada interpretación) queda **deprecado**. El modal fue requerido durante el proceso clínico inicial y ya no es necesario en el modo educativo.
- Compatibilidad: la función `acceptConsent()` y el banner `TarotHolisticConsentBanner` se mantienen solo por compatibilidad legacy; `hasConsent = true` por defecto en `useTarotHolistic()`.
- Registro auditable: se conserva el timestamp del consentimiento inicial otorgado durante el registro de la cuenta.
- Revocabilidad: el consultante/terapeuta puede solicitar eliminación o anonimización conforme a las políticas del proyecto.
- **Excepción (consentimiento aparte):** la **federación cross-workspace** (síntesis de datos entre espacios de trabajo distintos) **NO** está cubierta por este consentimiento de cuenta y mantiene su propio opt-in explícito y revocable, según `docs/HOLISTIC_FEDERATION_POLICY.md`.

Auditoría y trazabilidad
- Registrar versión de motor IA, parámetros clave (`temperature`, `seed`), fecha/hora y metadatos del deck usado.
- No almacenar prompts crudos que contengan datos sensibles; guardar `explanationTrace` en forma redactada y metadatos del prompt (hash/descriptor) para auditoría.

Compatibilidad y gobernanza
- SWM v1 permanece intacto y operativo.
- SWM v3 es optativo, gobernado por feature flags (ej. `AI_TAROT_ENABLED`) y por el mode/permiso del workspace.
- Implementación futura deberá respetar la auditoría vigente y no alterar flujos del core ni contracts técnicos.

Nota explícita
- Este documento habilita la implementación futura de SWM v3 pero NO implica cambios inmediatos en código. Cualquier implementación posterior deberá seguir las fases y controles documentados en `docs/`.

Referencias
- docs/00_SOURCE_OF_TRUTH/AUDITORIA CABALA APP 12182025.md
- docs/00_SOURCE_OF_TRUTH/SOURCE_OF_TRUTH.md
- docs/ARCHITECTURE_SYMBOLIC_SYSTEM.md
