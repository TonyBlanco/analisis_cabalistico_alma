# HOLISTIC CATEGORY TAXONOMY

**Version:** 1.0
**Author:** Governance — Semantic Layer
**Date:** 2026-01-12

---

## Purpose & Scope

This document defines the canonical taxonomy of "holistic categories" used by the platform's read-only semantic layer (HolisticExploration). It is normative and auditable: it specifies what a holistic category is, lists the closed set of allowed categories, and provides a canonical mapping from `TestModule.code` to category for the codes listed below.

Scope and constraints:
- Applies only to narrative/semantic classification (metadata) of HolisticExploration instances.
- Does NOT introduce clinical scoring, diagnostic criteria, or any operational behavior.
- Does NOT change software; this is a documentation artifact for governance and review.

## Definition of Holistic Category

A Holistic Category is a short, human-readable label that groups HolisticExploration narratives by the primary thematic thread they represent from a symbolic, contextual, or energetic perspective.

What a Holistic Category IS:
- A metadata tag for narrative intent (e.g., memory, somatic patterning, regulation, wellbeing).
- A guidance label for therapists to interpret the focus area of an exploration in session context.

What a Holistic Category is NOT:
- It is NOT a clinical diagnosis, score, or decision rule.
- It is NOT an implementation artifact (no links to code, endpoints, or database schema).
- It is NOT a definitive medical taxonomy; it is a narrative-organizing layer used for therapeutic framing.

Governance rules:
- Categories must be chosen only when a textual rationale exists in canonical sources (e.g., approved narrative descriptions). Do not infer categories without textual justification.
- Once published, categories are considered normative and require governance approval to change.

## Allowed Categories (Closed List)

The following categories are the complete, closed set allowed by this taxonomy. Each category includes a short label and a one-line description of its narrative scope.

- `multidimensional` — Panorama amplio que integra múltiples dominios simbólicos.
- `emocional` — Foco en variaciones afectivas y procesos de ánimo.
- `mental` — Foco en activación cognitiva y procesos de pensamiento/contención.
- `corporal` — Foco en reactividad somática y manifestaciones físicas.
- `energia` — Foco en impulso vital, voluntad y dirección energética.
- `memoria` — Foco en hilos narrativos y memorias simbólicas que aportan contexto.
- `bienestar` — Foco en factores integrales de bienestar físico/psíquico/relacional.
- `tamizaje` — Foco en lectura de cribado para orientar diálogo inicial.
- `sueño` — Foco en patrones de sueño, recuperación y descanso.
- `somatico` — Foco en hábitos corporales y relación alimento-cuerpo.
- `regulacion` — Foco en cargas adaptativas y estrategias de autorregulación.
 

Note: The category set is intentionally concise; additions require governance review and justification against canonical narrative sources.

## Canonical Mapping (TestModule.code → Category)

The following table enumerates requested `TestModule.code` values and the canonical category assigned. Each row includes the HolisticExploration public/usual name (approved narrative) and a one-line holistic rationale that references the narrative scope (not implementation). If a TestModule was not present in the system at the time of authoring, the row explicitly states that the mapping is pending and requires creation/validation.

| TestModule.code | Holistic Exploration Name | Category | Rationale (one line, holistic) |
|---|---|---|---|
| phq-9 | Exploración de Vitalidad Emocional | emocional | Lectura centrada en variaciones del ánimo y la vitalidad afectiva. |
| gad-7 | Exploración de Activación y Contención | mental | Lectura sobre grado de activación sostenida y capacidad de contención mental. |
| bai | Exploración de Respuesta Energética al Entorno | corporal | Lectura simbólica de reactividad corporal y patrones somáticos. |
| bdi-ii | Exploración de Flujo de Voluntad y Sentido | energia | Lectura sobre impulso hacia objetivos y bloqueo de la voluntad. |
| scl90 | Mapa Global de Tensiones del Alma | multidimensional | Panorama transversal que integra múltiples dominios y tensiones simbólicas. |
| asrs_essence | Archetypal Soul Rhythm Scale (ASRS-Essence) | mental | Foco en gestión de la atención y procesos cognitivos (Tiferet/Malkhut). |
| sha_harmony | Sephirotic Harmony Audit (SHA) | emocional | Foco en equilibrio de pasiones y armonía afectiva (Netzach). |
| dudit_spirit | Divine Unity Drug Introspection (DUDIT-Spirit) | corporal | Foco en interferencias auricas y manifestaciones somáticas (Hod/Yesod). |
| eat26_spirit | Eternal Abundance Threshold (EAT-26-Spirit) | somatico | Foco en la relación con el sustento y prácticas alimentarias (Malkhut). |
| mcmi4_mystic | Multiaxial Cosmic Matrix (MCMI-4-Mystic) | multidimensional | Mapa multiaxial de estilos de personalidad y correspondencias sefiroticas. |
| ybocs_soul | Yetziratic Balance Sanctuary (Y-BOCS-Soul) | regulacion | Foco en rituales repetitivos y dinámicas de control/purificación (Gevurah). |
| past-lives | Exploración de Memorias del Alma | memoria | Lectura orientada a hilos narrativos y memorias simbólicas. |
| wellness | Exploración de Bienestar Integral | bienestar | Panorama simbólico de factores de bienestar integral. |
| screening-general | Exploración de Tamizaje General | tamizaje | Lectura de detección temprana para orientar la conversación inicial. |
| insomnia | Exploración de Sueño y Descanso | sueño | Foco en patrones de sueño y recuperación nocturna. |
| nutrition | Exploración de Alimentación y Hábitos | somatico | Lectura sobre relación con la comida y hábitos corporales. |
| stress-regulation | Exploración de Estrés y Regulación | regulacion | Lectura sobre cargas adaptativas y estrategias de regulación. |
| anxiety-state-trait | Exploración de Ansiedad - Estado/Rasgo | emocional | Foco en ansiedad situacional y rasgo desde una lectura simbólica. |


## Auditability & Change Process

- This document is the canonical reference for category labels and mappings. Any change to the closed list or to a mapping must be recorded as a formal governance change: include changelog entry, justification citing canonical narrative text, and approval from clinical/semantic owners.
- For any `TBD` entries above, responsible owners must either (a) create the TestModule and provide canonical narrative text, or (b) confirm the code will remain out of scope. The mapping must be updated and this document versioned.

## Revision History

- 1.0 — 2026-01-12 — Initial release (Governance)

---

*End of document.*
