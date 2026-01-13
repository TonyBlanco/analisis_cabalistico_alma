---
*** Updated audit (corrected serializer mapping) ***

# Audit: TestModule vs /api/tests/ (therapist catalog)

**Therapist:** supertony (id 1)
**Endpoint:** `/api/tests/` (view: `api.test_views.AvailableTestsView`, serializer: `api.test_serializers.TestModuleSerializer`)

## Summary
- DB modules inspected: 20
- Catalog items returned by endpoint: 9
- Matches (appears_in_catalog=true): 9
- DB modules not present in catalog: 11
- Note: the serializer exposes the public name under the `name` field (mapped from `TestModule.display_name`). This audit maps `name` → `display_name` for clarity.

## Comparison table

| id | code | db_name | public_name | is_active | appears_in_catalog | display_name (from endpoint) | display_description (from endpoint) |
|---:|---|---|---|:---:|:---:|---|---|
| 24 | asrs_essence | Archetypal Soul Rhythm Scale (ASRS-Essence) | Archetypal Soul Rhythm Scale (ASRS-Essence) | false | false | Archetypal Soul Rhythm Scale (ASRS-Essence) |  |
| 25 | aq_kabbalah | Aura Quotient for Kabbalistic Alignment (AQ-K) | Aura Quotient for Kabbalistic Alignment (AQ-K) | false | false | Aura Quotient for Kabbalistic Alignment (AQ-K) |  |
| 4  | bai | BAI | Stillness Resonance Inventory | true | false | Stillness Resonance Inventory |  |
| 23 | dudit_spirit | Divine Unity Drug Introspection (DUDIT-Spirit) | Divine Unity Drug Introspection (DUDIT-Spirit) | false | false | Divine Unity Drug Introspection (DUDIT-Spirit) |  |
| 27 | eat26_spirit | Eternal Abundance Threshold (EAT-26-Spirit) | Eternal Abundance Threshold (EAT-26-Spirit) | false | false | Eternal Abundance Threshold (EAT-26-Spirit) |  |
| 3  | gad-7 | GAD-7 | Calm Alignment Gauge | true | false | Calm Alignment Gauge |  |
| 28 | mcmi4_mystic | Multiaxial Cosmic Matrix (MCMI-4-Mystic) | Multiaxial Cosmic Matrix (MCMI-4-Mystic) | false | false | Multiaxial Cosmic Matrix (MCMI-4-Mystic) |  |
| 2  | phq-9 | PHQ-9 | Pulse Resonance Mirror | true | false | Pulse Resonance Mirror |  |
| 22 | sha_harmony | Sephirotic Harmony Audit (SHA) | Sephirotic Harmony Audit (SHA) | false | false | Sephirotic Harmony Audit (SHA) |  |
| 1  | past-lives | Vidas Pasadas – Exploración de Memorias del Alma | Vidas Pasadas – Exploración de Memorias del Alma | true | true | Vidas Pasadas – Exploración de Memorias del Alma | Exploración personal y simbólica orientada a la reflexión sobre patrones, emociones y sentido vital. (includes disclaimer)
| 26 | ybocs_soul | Yetziratic Balance Sanctuary (Y-BOCS-Soul) | Yetziratic Balance Sanctuary (Y-BOCS-Soul) | false | false | Yetziratic Balance Sanctuary (Y-BOCS-Soul) |  |
| 9  | stress | Estrés — Carga y regulación | Estrés — Carga y regulación | false | false | Estrés — Carga y regulación |  |
| 13 | anxiety-state-trait | Ansiedad — Estado y rasgo | Ansiedad — Estado y rasgo | true | true | Ansiedad — Estado y rasgo | Wellness orientativo para mapear la ansiedad del presente y las tendencias personales.
| 10 | nutrition | Alimentación — Relación y hábitos | Alimentación — Relación y hábitos | true | true | Alimentación — Relación y hábitos | Evaluación wellness (no diagnóstico) sobre hábitos y relación con la alimentacion.
| 11 | stress-regulation | Estrés — Carga y regulación | Estrés — Carga y regulación | true | true | Estrés — Carga y regulación | Wellness orientativo (no diagnóstico) para explorar carga de estrés, regulación y recursos.
| 14 | scl90 | SCL-90 — Screening Holístico | Soul Symmetry Lens | true | true | Soul Symmetry Lens | Versión holística tipo Wellness del SCL-90 para evaluar síntomas generales sin diagnóstico.
| 8  | insomnia | Insomnia — Descanso y hábitos | Insomnia — Descanso y hábitos | true | true | Insomnia — Descanso y hábitos | Evaluación orientativa de hábitos de descanso y calidad del sueño (no médico).
| 6  | screening-general | Screening Psicologico General | Screening Psicologico General | true | true | Screening Psicologico General | Screening psicológico general
| 5  | wellness | Wellness Assessment | Wellness Assessment | true | true | Wellness Assessment | Holistic wellness screening
| 7  | bdi-ii | BDI-II - Inventario de Depresión de Beck | Dawn Reflection Index | true | true | Dawn Reflection Index | BDI-II legacy instrument (imported)

## Extra items in catalog without DB module
- none

## Notes
- Django setup emitted a RuntimeWarning about duplicate registration of `TherapistHolisticConfig` during the run; see `backend/api/models.py`.
- The apparent earlier "null display_name" was due to checking for a `display_name` key in the endpoint output; the serializer exposes that value as `name` (mapped from `TestModule.display_name`).
- Next suggested step: inspect `HolisticExploration` records and the semantic bridge helpers (`get_holistic_exploration_for_testmodule`, `get_client_view`) to see how longer descriptions are provided and why some tests include `display_description` while others do not.

