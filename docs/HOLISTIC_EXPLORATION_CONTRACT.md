# Holistic Exploration — Contrato Canónico (VINCULANTE, read-only)

Este documento congela la definición canónica de `HolisticExploration` como vista semántica read-only sobre artefactos legacy. Es vinculante: ninguna modificación de campos ni reglas de visibilidad se realiza sin autorización de gobernanza y registro en `docs/00_SOURCE_OF_TRUTH.md`.

1) Qué es `HolisticExploration` (y qué NO es)
- Definición: una entidad semántica y de presentación que referencia `TestModule` y `AnalysisRecord` por ID/version. Su propósito es ofrecer nombres, categorías y lecturas simbólicas no clínicas para presentación y acompañamiento.
- No es: un reemplazo técnico de `TestModule`, un nuevo motor de scoring, ni una herramienta diagnóstica. No modifica ni sustituye la ejecución técnica.

2) Relación con `TestModule` legacy (bridge semántico)
- `HolisticExploration` actúa como puente: referencia los outputs técnicos y añade metadatos de presentación (nombre holístico, categoría, mapeo sefirotico). La verdad técnica permanece en `TestModule` / `AnalysisRecord`.
- Cualquier divergencia se resuelve preservando el resultado técnico; la corrección se documenta, no se reescribe la ejecución.

3) Campos del modelo (tabla breve)

| Campo | Descripción |
|---|---|
| `primary_sefirah` | Sefirá principal asociada (string). |
| `secondary_sefirot` | Sefirot secundarias (array[string]). |
| `client_visible_fields` | Campos permitidos en la vista cliente (ej.: `name`, `category`, `primary_sefirah`, `summary`). |
| `therapist_only_fields` | Campos restringidos a terapeuta (ej.: `analysis_record_id`, `sefirah_mapping_detail`, `interpretation_notes`). |

4) Visibilidad (reglas estrictas)
- Cliente (qué ve / qué NO ve):
  - Ve: `name` (nombre holístico, sin acrónimos clínicos), `category`, `primary_sefirah` como tendencia descriptiva, `summary` (2–3 frases educativas) y aviso de no-diagnóstico.
  - NO ve: `therapist_only_fields`, scores brutos, labels clínicos, rangos clínicos, diagnósticos o recomendaciones terapéuticas detalladas.

- Terapeuta (lectura completa):
  - Ve: todos los `therapist_only_fields`, `analysis_record_id` y versión, mapeo sefirotico completo, notas interpretativas, historial y plantillas de recomendaciones simbólicas.
  - Reglas de acceso: acceso restringido por rol; cada visualización o exportación debe quedar registrada en auditoría.

5) IA terapéutica (solo conceptual)
- `ia_assisted` puede existir como flag metadato; no implica exposición al cliente.
- La IA solo asiste al terapeuta; sus salidas deben marcarse como "borrador asistido por IA" y requerir validación humana antes de uso profesional o exportación.

6) Regla de congelación
- Este contrato congela los campos y las reglas de visibilidad: no se añaden ni eliminan campos, ni se altera la semántica sin aprobación formal y registro en `docs/00_SOURCE_OF_TRUTH.md`.

7) Ejemplo real (phq-9 → exploración holística)
- Legacy (referencia interna): `phq-9`  
- Holístico (cliente):
  - `name`: "Exploración holística de estado anímico"  
  - `primary_sefirah`: `Tiferet` (tendencia a la integración)  
  - `secondary_sefirot`: ["Gevurah", "Chesed"]  
  - `client_visible_fields`: `name`, `category`, `primary_sefirah`, `summary`  
  - `therapist_only_fields`: `analysis_record_id`, `sefirah_mapping_detail`, `interpretation_notes`

Cumplimiento y trazabilidad
- Cualquier cambio requiere aprobación de gobernanza y registro en `docs/00_SOURCE_OF_TRUTH.md` con responsable y versión.
- Incumplimientos deben reportarse al comité de gobernanza documental.

Registro final: este contrato es definitivo y vinculante; su propósito es proteger la integridad técnica y reglamentar la presentación holística sin introducir cambios operativos.
