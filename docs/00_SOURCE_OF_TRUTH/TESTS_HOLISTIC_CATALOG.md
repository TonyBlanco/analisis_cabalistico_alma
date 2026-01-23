# CATÁLOGO DE TESTS HOLÍSTICOS (FUENTE DE VERDAD)

**Versión:** 1.0.1
**Estado:** CANÓNICO
**Fecha:** 2026-01-09

## Principios Fundamentales

1.  **Naturaleza No Clínica:** Ninguno de estos instrumentos tiene validez diagnóstica, clínica o médica en este sistema.
2.  **Propósito Simbólico:** Son herramientas de "espejo del alma" para la exploración interior, basadas en arquetipos, Kabbalah y autoconocimiento.
3.  **Gobernanza:** Este documento es la única fuente de verdad para la instanciación de tests en el sistema.

---

## Tabla Canónica de Tests

| code | name | test_type | execution_mode | assignable | source_files | notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `sha_harmony` | Sephirotic Harmony Audit (SHA) | holistic | patient_self | true | `audit_bank.py` | Reinterpretación del AUDIT. Foco en equilibrio de Netzach (pasiones). |
| `dudit_spirit` | Divine Unity Drug Introspection (DUDIT-Spirit) | holistic | patient_self | true | `dudit_schema.py` | Reinterpretación del DUDIT. Foco en interferencias áuricas y Hod/Yesod. |
| `asrs_essence` | Archetypal Soul Rhythm Scale (ASRS-Essence) | holistic | patient_self | true | `adhd_asrs6_schema.py` | Reinterpretación del ASRS. Foco en la gestión de la atención (Tiferet/Malkhut). |
| `aq_kabbalah` | Aura Quotient for Kabbalistic Alignment (AQ-K) | holistic | patient_self | true | `aq50_schema.py` | Reinterpretación del AQ-50. Foco en estructuras mentales (Binah) y patrones. |
| `ybocs_soul` | Yetziratic Balance Sanctuary (Y-BOCS-Soul) | holistic | patient_self | true | `ybocs_schema.py` | Reinterpretación del Y-BOCS. Foco en rituales repetitivos y purificación (Gevurah). |
| `eat26_spirit` | Eternal Abundance Threshold (EAT-26-Spirit) | holistic | patient_self | true | `eat26_bank.py` | Reinterpretación del EAT-26. Foco en la relación sagrada con el sustento (Malkhut). |
| `mcmi4_signal` | MCMI-4 SIGNAL (Cribado) | holistic | patient_self | true | `mcmi4_signal_bank.py` | Cribado inicial de 16 ítems. Detecta mundo predominante y mundo sombra. |
| `mcmi4_mystic` | Multiaxial Cosmic Matrix (MCMI-4-Mystic) | holistic | patient_self | true | `backend/data/mcmi4_mystic_questions_*.json` | 195 ítems en 4 Mundos (Atzilut/Briah/Yetzirah/Assiah). Pool 270, rotación anti-repetición. |

---

## Leyenda

*   **code:** Identificador único e inmutable en base de datos.
*   **test_type:** Siempre `holistic`. Diferencia de `diagnostic` (obsoleto).
*   **execution_mode:**
    *   `patient_self`: El consultante lo realiza solo como ejercicio reflexivo.
    *   `therapist_guided`: Requiere mediación sincrónica (no usado en este lote).
*   **source_files:** Archivo `.py` en `/tests_holistic_py/` (futuro) o raíz actual que contiene la lógica.