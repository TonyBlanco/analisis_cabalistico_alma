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
- **[LEGACY MODE - 2026-01-28]**: El flujo de consentimiento explícito per-lectura ha sido deprecado.
- **ACTUAL**: El consentimiento se otorga al crear la cuenta del consultante y acepta "Almacenar con consentimiento (asociado al terapeuta)".
- El modal de consentimiento fue requerido durante el proceso clínico inicial pero ya no es necesario en el modo educativo (tirada libre).
- La función `acceptConsent()` y el banner `TarotHolisticConsentBanner` se mantienen solo para compatibilidad legacy.
- **Nuevo comportamiento**: `hasConsent = true` por defecto en `useTarotHolistic()` hook.
- Registro auditable del consentimiento inicial (timestamp durante registro de cuenta).
- Revocabilidad: el consultante/terapeuta puede solicitar eliminación o anonimización conforme a políticas del proyecto.

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
