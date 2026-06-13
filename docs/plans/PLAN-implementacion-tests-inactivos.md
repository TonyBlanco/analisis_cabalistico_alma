# Plan de Implementación — Activar Tests Inactivos (cuestionarios + scorers)

> **Override autorizado por el propietario (Tony White, 13 jun 2026):** el plan médico/profesional se ha extendido, por lo que se autoriza activar los instrumentos clínicos reinterpretados. Este plan los construye con cuestionario e interpretación adecuados, manteniendo la capa wellness/cabalística y los disclaimers de no-diagnóstico.

## Alcance y objetivo

Dejar **ejecutables y fiables** los 7 módulos hoy inactivos + retirar el legacy `stress`. Para cada uno: cuestionario completo cableado, `compute_*` con cutoffs validados, capa interpretativa cabalística (no diagnóstica), activación en BD + registry frontend, UI de paciente y pruebas.

## Instrumentos

| Code | Nombre público | Base | Ítems | Cutoffs | Sefirá | Esfuerzo |
|---|---|---|---|---|---|---|
| `sha_harmony` | Sephirotic Harmony Audit | AUDIT | 10 ítems, 0–4 | ≥8 riesgo; ≥15 dependencia | Netzaj | 🟢 |
| `eat26_spirit` | Eternal Abundance Threshold | EAT-26 | 26 ítems Likert 6 pts | ≥20 riesgo | Maljut | 🟢 |
| `dudit_spirit` | Divine Unity Drug Introspection | DUDIT | 11 ítems | ≥8(H)/≥2(M) problemático; ≥25 dependencia | Hod/Yesod | 🟡 |
| `ybocs_soul` | Yetziratic Balance Sanctuary | Y-BOCS | 10 ítems, 0–4 | 0–7 subclínico…32–40 extremo | Guevurá | 🟡 |
| `asrs_essence` | Archetypal Soul Rhythm Scale | ASRS v1.1 | Screener 6 ítems, 0–4 | ≥4/6 ítems zona sombreada | Tiferet/Maljut | 🔴 |
| `aq_kabbalah` | Aura Quotient for Kabbalistic Alignment | AQ-50 | 50 ítems 0/1 | ≥32 alto; ≥26 cribado | Biná | 🔴 |
| `mcmi4_mystic` | Multiaxial Cosmic Matrix | MCMI-IV | 195 ítems V/F | Escalas BR — empezar por `mcmi4_signal` (16 ítems) | Matriz 4 mundos | 🔴 |

## Decisiones de producto (NO negociables)

1. **Lectura real con cutoffs**: el scorer calcula puntaje + banda clínica con cutoffs validados, INTERNAMENTE.
2. **Presentación cabalística, no diagnóstica**: la salida traduce la banda a narrativa de sefirá/mundo + recomendación simbólica + disclaimer.
3. **Clon propio**: ítems redactados de cero; NO usar marca registrada de cara al usuario; cutoffs son umbrales internos de referencia.
4. **Seguridad**: ítems sensibles levantan flag + mensaje de derivación.

## Fases

### Fase 0 — Gobernanza y override
- [x] Autorización registrada en `docs/02_GOVERNANCE/TESTS_ACTIVATION_GOVERNANCE.md`
- [x] **DECIDIDO**: todos los tests usan lectura real con cutoffs presentada en clave cabalística (no diagnóstica).

### Fase 1 — Canonización de cuestionarios
- [x] Bancos canonizados `sha_harmony_bank.py` y `eat26_spirit_bank.py` (Iteración 1)
- [x] `asrs_essence_bank.py` y `aq_kabbalah_bank.py` (Iteración 3)
- [ ] Completar bancos faltantes donde aplique

### Fase 2 — Scorers en `diagnostics.py`
- [x] `compute_sha_harmony`, `compute_eat26_spirit` (Iter 1 · 14/14 tests)
- [x] `compute_dudit_spirit`, `compute_ybocs_soul` (Iter 2 · 30/30 tests)
- [x] `compute_asrs_essence`, `compute_aq_kabbalah` (Iter 3 · 46/46 tests)
- [ ] `compute_mcmi4_mystic` (sub-proyecto)

### Fase 3 — Capa interpretativa cabalística
- [x] Enums traducidos a etiquetas simbólicas en español por instrumento
- [x] `referral_recommended` en `structured_data`

### Fase 4 — Cableado y activación
- [x] Dispatch `ExecuteTestView._process_test` + `TEST_COMPUTERS` por instrumento
- [x] Migraciones `0103` → `0104` (activate_asrs_essence)
- [x] Registry FE `implemented: true` + `patient_route`

### Fase 5 — Frontend del cuestionario
- [x] Páginas `/sha-harmony/`, `/eat26-spirit/`, `/dudit-spirit/`, `/ybocs-soul/`, `/asrs-essence/`, `/aq-kabbalah/`
- [x] Modal de inicio del test (PR #33 draft, 94/94 tests)

### Fase 6 — QA, datos y CI
- [x] Tests unitarios verdes (46/46)
- [ ] Smoke QA manual en prod

### Fase 7 — Limpieza legacy `stress`
- [ ] Confirmar archivado/redirigido

## Cadena de migraciones

```
0103_activate_holistic_tests
0104_activate_asrs_essence
0105_update_past_lives_description   ← PR #38 mergeado
0106_resonance_map_backbone          ← en prod; cierra con PR #39
0107_rename_mcmi4_signal_public_name ← PR #35 mergeado
0108_activate_sha_harmony            ← feat/activate-sha-harmony, commiteada 19a98932, MERGEADA Y DESPLEGADA
```

Próximo libre: **0109** (para PR #39 F1 backbone si entra antes).

## Cola de merge (orden recomendado)

1. **PR #39** `feat/resonance-map-f1-backbone` → `migrate api 0108` → cierra drift modelos `0106`
2. **PR #40** `feat/resonance-map-f2-clean` → smoke árbol. Depende de #39.
3. **`feat/therapist-reports`** (commit `463d5553`) → sin migrate → smoke `/dashboard/therapist/reports` ✅
4. **`feat/activate-sha-harmony`** → ✅ MERGEADA Y DESPLEGADA EN PROD
5. **`fix/settings-route-404`** → smoke `/settings`
6. **PR #33** `feat/patient-test-intro-modal` → sacar de draft → last (huella ancha)

## Estado de prompts / iteraciones

| Iteración | Tests | Estado |
|---|---|---|
| Iter 1 · sha_harmony + eat26_spirit | 14/14 ✅ | En prod |
| Iter 2 · dudit_spirit + ybocs_soul | 30/30 ✅ | En prod |
| Iter 3 · asrs_essence + aq_kabbalah | 46/46 ✅ | En prod (commit `642deacc`) |
| Past-lives expansion (PR #38) | ✅ | Mergeado, en prod (0105) |
| SHA activation (Prompt 20) | 4/4 ✅ | ✅ MERGEADO Y DESPLEGADO |
| Reportes terapeuta (Prompt 21) | 7/7 ✅ | Listo para merge |
| Resonance Map F1 (PR #39) | 26/26 ✅ | Listo para merge |
| Resonance Map F2 (PR #40) | 25/25 ✅ | Listo tras #39 |
| /settings 404 (Prompt 22) | ⏳ | En ejecución |
