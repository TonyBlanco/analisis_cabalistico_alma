# Nombres canónicos en español para módulos holísticos

**Versión:** 1.0
**Autor:** Governance — Semantic Layer
**Fecha:** 2026-01-12

---

## Purpose & Scope

Este documento establece la fuente de verdad normativa para los nombres visibles en español que debe mostrar el catálogo del terapeuta (campo `display_name`) para los módulos holísticos/simbólicos listados en la sección de alcance.

Qué regula:
- El texto exacto a usar como `display_name` en español para los códigos incluidos en la tabla normativa.
- El tono, estilo y una nota semántica breve que acompaña cada nombre.

Qué NO regula:
- No cambia la lógica de ejecución, scoring, ni el comportamiento del backend o frontend.
- No modifica modelos, datos ni despliegues. Es únicamente copy canónico de interfaz.
- No introduce terminología clínica ni diagnóstica.

## Naming Principles

- Idioma y tono: Español neutro, profesional y holístico; evitar tecnicismos clínicos. Usar estructuras cortas y consistentes.
- Conservación de acrónimos: Se permite mantener el acrónimo original entre paréntesis si ayuda a la trazabilidad (p. ej. `ASRS‑Essence`).
- No inventar: No crear nombres para módulos inexistentes.
- Unicidad: Cada `TestModule.code` debe tener exactamente un `display_name` en este documento.
- Auditable: Cualquier cambio requiere versión y aprobación de governance.

## Canonical Naming Table (normativa)

Columna: `TestModule.code` | `Nombre visible en español` | `Nota semántica breve`

| TestModule.code | Nombre visible en español | Nota semántica breve |
|---|---|---|
| asrs_essence | Escala Arquetipal de Ritmo del Alma (ASRS‑Essence) | Foco en patrones atencionales y ritmo interior desde una lectura arquetipal. |
| sha_harmony | Auditoría de Armonía Sefirótica (SHA) | Lectura sobre equilibrio de pasiones y armonía energética. |
| dudit_spirit | Introspección de Unidad Divina (DUDIT‑Spirit) | Lectura simbólica de interferencias y estados tras experiencias psicoactivas. |
| eat26_spirit | Umbral de Abundancia Eterna (EAT‑26‑Spirit) | Lectura sobre la relación simbólica con la alimentación y el sustento. |
| mcmi4_mystic | Matriz Cósmica Multiaxial (MCMI‑4‑Mystic) | Mapa multiaxial narrativo de patrones de personalidad y correspondencias simbólicas. |
| ybocs_soul | Santuario de Equilibrio Yetzirático (Y‑BOCS‑Soul) | Lectura sobre rituales repetitivos y dinámicas de control desde una mirada simbólica. |

---

## Change control

- Versión inicial publicada: 1.0 — 2026-01-12.
- Cualquier modificación de estos nombres requerirá: ticket de change, justificación textual, y aprobación de governance.

*Fin del documento.*
