# Prompts para agentes Claude Sonnet — Activación de Tests

> Prompts listos para copiar a un agente **Claude Sonnet** con acceso al repo `TonyBlanco/analisis_cabalistico_alma`. Exigen **subagentes** y **uso de skills de análisis**.

---

## Prompt 1 — Agente de implementación quirúrgica

```
ROL
Eres un ingeniero senior en modo QUIRÚRGICO trabajando sobre el repo
TonyBlanco/analisis_cabalistico_alma (Django backend + Next.js "tonyblanco-app").
Tu misión: activar y dejar FIABLES los tests hoy inactivos, construyendo su
cuestionario y su scorer adecuados, alineados con el proyecto holístico/cabalístico.

TESTS OBJETIVO
sha_harmony (AUDIT), eat26_spirit (EAT-26), dudit_spirit (DUDIT),
ybocs_soul (Y-BOCS), asrs_essence (ASRS), aq_kabbalah (AQ-50),
mcmi4_mystic (empezar por mcmi4_signal, 16 ítems). Retirar legacy "stress".

DECISIONES DE PRODUCTO (NO NEGOCIABLES)
1. LECTURA REAL CON CUTOFFS internamente.
2. PRESENTACIÓN CABALÍSTICA, NO DIAGNÓSTICA.
3. CLON PROPIO: ítems redactados de cero; sin marca registrada de cara al usuario.
4. SEGURIDAD: ítems sensibles levantan flag + mensaje de derivación.

MODO QUIRÚRGICO
- Cambios mínimos y localizados. Un instrumento por PR.
- Preserva contratos de result_data ya usados por el frontend.
- Determinismo obligatorio: mismas respuestas => mismo resultado.
- Nada se mergea sin tests verdes.

ARQUITECTURA CLAVE
- Scorers: backend/api/diagnostics.py (patrón compute_*).
- Dispatch: backend/api/test_views.py -> ExecuteTestView._process_test y TEST_COMPUTERS.
- Modelos/flags: backend/api/test_models.py.
- Capa simbólica: EXPLORATION_WORLD_BY_TEST_CODE, tarot_holistic_views.py.
- Bancos: audit_bank.py, eat26_bank.py, dudit_schema.py/json, ybocs_schema.py,
  adhd_asrs6_schema.py, aq50_schema.json, mcmi4_signal_bank.py, mcmi4_bank.py.
- Frontend registry: clinicalTests.registry.ts.

OBLIGATORIO: SUBAGENTES
- subagente "explorador": mapea bancos y contrato de result_data.
- un subagente por instrumento: schema + compute_* + mapa banda->sefirá + tests.
- subagente "QA/psicometría": valida cutoffs, ítems invertidos, vectores de borde.
- subagente "wiring": dispatch, migración de flags, registry FE.

ORDEN DE ATAQUE
1. sha_harmony, eat26_spirit
2. dudit_spirit, ybocs_soul
3. asrs_essence, aq_kabbalah
4. mcmi4_signal -> mcmi4_mystic
5. limpieza de "stress"
```

---

## Prompt 2 — Agente orquestador del plan (por fases)

```
ROL
Eres el TECH LEAD para ejecutar, fase por fase, el Plan de Implementación.
Conviertes el plan en trabajo real, con PRs pequeños y verificables, coordinando subagentes.

FASES
F0 Gobernanza/override: autorización, política de disclaimers, ítems de seguridad.
F1 Canonizar cuestionarios: bancos a ubicación canónica, schema_valid real.
F2 Scorers: compute_* por instrumento, cutoffs, determinismo, tests unitarios.
F3 Capa cabalística: banda->sefirá->narrativa reutilizando EXPLORATION_WORLD_BY_TEST_CODE.
F4 Cableado/activación: dispatch, migraciones, registry FE, pilot guard ajustado.
F5 Frontend: página por test + render severidad + disclaimer + derivación.
F6 QA/datos/CI: tests unitarios, smoke e2e, poblar campos TestResult.
F7 Limpieza legacy "stress".

ORDEN: sha_harmony, eat26_spirit -> dudit_spirit, ybocs_soul -> asrs_essence,
aq_kabbalah -> mcmi4_signal -> stress.
```

---

## Prompt 3 — Fix render `[object Object]` (AISLADO)

Bug: listas "Sugerencias simbólicas" muestran `[object Object]` en resultados de test.
Fix: añadir `asText()` en `ReadableResult.tsx`. Rama `fix/result-render-object-text`.

---

## Prompt 4 — Lecturas claras para el cliente (continúa Prompt 3)

Tras el fix de `[object Object]`, sugerencias salen como JSON crudo. Convertir a lenguaje
humano con `formatClientSuggestion()`. Crear `CLIENT_FACING_READABILITY_RULES.md`.
Rama `fix/client-readable-suggestions`.

---

## Prompt 5 — Fix cálculo `anxiety-state-trait` (AISLADO)

Bug: índice 0, subindices 0%. Causa: selección dinámica por seed no se reenvía al puntuar.
Fix: round-trip determinista seed/IDs + guard de completitud.
Rama `fix/anxiety-state-trait-scoring`.

---

## Prompt 6 — Iteración 3: `asrs_essence` + `aq_kabbalah`

Bancos sin textos → redactar ítems en clave cabalística. Aplicar patrón consolidado:
contrato de claves, determinismo, mapas de traducción, `referral_recommended`.
✅ COMPLETADO (commit `642deacc`, 46/46 tests, en prod).

---

## Prompt 7 — Modal de inicio del test (FE, AISLADO)

Modal con copy profesional + validación de completitud (botón deshabilitado + contador).
✅ IMPLEMENTADO — PR #33 draft, 94/94 tests.

---

## Prompt 8 — MCMI-4 SIGNAL: JSON crudo + Reflexión colgada (FE, AISLADO)

Bug 1: resultado muestra JSON crudo al paciente → gatear por rol.
Bug 2: spinner infinito "Preparando tu reflexión..." → validación + timeout + salidas de error.
Rama `fix/mcmi4-signal-result-and-reflection`.

---

## Prompt 9 — Consistencia "Tests Pendientes" Inicio vs. Tests (FE, AISLADO)

Fuentes distintas → unificar con util compartido `lib/patientPendingTests.ts`.
✅ IMPLEMENTADO — PR #34, 8/8 tests.

---

## Prompt 10 — Renombrar "SWM MCMI-4 SIGNAL" → "Señal de la Matriz Cósmica"

Sin tocar el `code` interno `mcmi4-signal`. Constante única + migración `TestModule.name`.
✅ MERGEADO — PR #35 → renumerado a `0107_rename_mcmi4_signal_public_name` (colisión con 0106).

---

## Prompt 11 — Resultados terapeuta (diagnóstico-indicativo) + bug `/therapist/scid5`

Frente A: hotfix wiring patientId + error boundary.
Frente B: crear `/dashboard/therapist/tests/results/[result_id]` con alertas + export.

---

## Prompt 12 — Catálogo terapeuta: refresh al asignar + estado completado

Bug A: no refresca al asignar.
Bug B: tests completados siguen diciendo "esperando respuesta".
✅ IMPLEMENTADO — commit `2d2c4112`.

---

## Prompt 13 — AQ-Kabbalah resultado pobre + cambia al reabrir

Crear página `/aq-kabbalah/result`; persistir `structured_data`; GET por id sin recompute.
✅ RESUELTO — rama `fix/aq-kabbalah-result-page-and-persistence` (commit `f821cea5`).

---

## Prompt 14 — Página "Proceso del cliente" (stub → timeline real)

`/dashboard/patient/process` → timeline con tests asignados/completados + actividad terapeuta.
✅ RESUELTO — rama `feat/patient-process-timeline-v2`, 4/4 tests.

---

## Prompt 15 — SCDF: alimentar con tests reales + plan/notas + métrica automática

Corregir `SCDF_MODULE_TEST_MAP` con codes reales. Métrica reactiva por módulo y global.
Plan de terapia + notas por módulo persistidos en `raw_input`.
✅ RESUELTO — rama `feat/scdf-test-evidence-plan-metric` (commit `3313aa35`), 4/4 tests.

---

## Prompt 16 — Consentimiento federado SCDF (desbloqueo + flujo)

Activar `consent_federation=True` para paciente actual + UI para que el cliente lo otorgue.
✅ RESUELTO — PR #37 (merge `36a21e0a`), 5/5 tests en Postgres prod.

---

## Prompts 17 & 18 — Resonance Map F1 (backbone) y F2 (Vista Árbol)

**F1** — Modelos `GenealogyPerson` + `ResonanciaRelation` + `ResonanceClientCapture`, 2 endpoints, fix SQLite.
✅ PR #39, 26/26 tests. Listo para merge.

**F2** — `GenealogyPersonPanel`, `GenealogyEventPanel`, `TransgenerationalDeepWorkspace` cableado.
✅ PR #40, 25/25 tests. Listo tras #39.

---

## Prompt 19 — Ampliar test "Vidas Pasadas" (past-lives)

De 6 a 11 secciones Likert (s7..s11), reflexión guiada, tarjeta intro, corregir descripción.
✅ MERGEADO — PR #38 → migración `0105_update_past_lives_description` en prod.

---

## Prompt 20 — Activar SHA en dashboard del terapeuta + guía

Migración `0108_activate_sha_harmony` (idempotente, dependencia sobre 0107).
Guía real en `clinicalTests.registry.ts`. 4/4 tests.
✅ MERGEADO Y DESPLEGADO EN PROD (commit `19a98932`).

---

## Prompt 21 — Página de Reportes del terapeuta

`/dashboard/therapist/reports` → reemplazar stub con 5 tarjetas + alertas + CSV export.
Endpoint `GET /api/therapist/reports/summary/` (sin migrate). 7/7 tests.
✅ Rama `feat/therapist-reports` (commit `463d5553`). Listo para merge.

---

## Prompt 22 — Ruta `/settings` da 404

No existe carpeta `settings` en la app. Localizar enlace y decidir: corregir href (Opción A)
o crear página de Ajustes (Opción B).
⏳ En ejecución.
