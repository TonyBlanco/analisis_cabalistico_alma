# Exports Holísticos (Terapeuta) — Diseño y Contrato

## Objetivo
Permitir que el terapeuta **exporte** (guarde) información relevante de distintos workspaces (Astrología, Tests, Tarot, Cábala, Bio-Emoción) como un **snapshot diagnóstico holístico**.

Este export es:
- **Solo terapeuta** por defecto.
- **Seleccionable**: se elige qué módulos y qué nivel de detalle guardar.
- **Versionable**: guarda snapshots de entrada y del “algoritmo” (config/selección) para auditoría.
- **Futuro-proof**: sirve como base para reportes, gráficas y plan terapéutico.

## Principio clave
No se “copia todo al perfil” como texto fijo.

En su lugar se guarda un **ledger** (`AnalysisRecord`) con:
- Referencias a las fuentes usadas
- Un JSON digest (para gráficas y evolución)
- Un Markdown derivado (para lectura rápida)

El **perfil** y/o el plan terapéutico puede “apuntar” a estos exports más adelante.

---

## Persistencia
Se usa el modelo **`AnalysisRecord`** (núcleo normalizado) para guardar exports.

- `module_code`: `HOLISTIC_EXPORT_V1`
- `visibility`: `therapist`
- `therapist_annotations.visible_to_patient`: `false`

Dentro de `computed_result.export` se guarda:
- `selected_sections` (qué módulos se exportaron)
- `level` (`summary` o `audit`)
- `source_trace` (IDs de fuentes)
- `sections` (digest JSON por módulo)
- `markdown` (texto derivado)

---

## Endpoints

### Listar exports
`GET /api/therapist/patients/<id>/holistic-exports/`

Respuesta (resumen):
```json
{
  "results": [
    {
      "id": "<uuid>",
      "created_at": "2025-12-25T12:00:00Z",
      "module_code": "HOLISTIC_EXPORT_V1",
      "visibility": "therapist",
      "summary": "Export holístico (interno) generado",
      "markdown": "# Export Holístico..."
    }
  ]
}
```

### Crear export
`POST /api/therapist/patients/<id>/holistic-exports/`

Body:
```json
{
  "selected_sections": {
    "astrology": true,
    "tests": true,
    "tarot": false,
    "kabbalah": true,
    "bioemotional": true
  },
  "level": "summary"
}
```

- `selected_sections` también puede ser lista: `[{"astrology"}, {"tests"}]` (normalizado a booleans)
- `level`:
  - `summary`: digest para diagnóstico (lo recomendado por defecto)
  - `audit`: incluye payloads más completos (más pesado)

Respuesta:
```json
{
  "id": "<uuid>",
  "created_at": "2025-12-25T12:00:00Z",
  "module_code": "HOLISTIC_EXPORT_V1",
  "export": {
    "export_version": "1",
    "generated_at": "...",
    "visibility": "therapist",
    "level": "summary",
    "selected_sections": {"astrology": true, "tests": true, "tarot": false, "kabbalah": true, "bioemotional": true},
    "source_trace": {
      "astrology_natal_chart_id": 12,
      "test_result_ids": [1,2,3],
      "cabalistic_analysis_ids": [9,10],
      "cabala_aplicada_analysis_record_ids": ["<uuid>", "<uuid>"],
      "bioemotional": {
        "observation_ids": ["..."],
        "hypothesis_ids": ["..."],
        "synthesis_ids": ["..."],
        "assisted_diagnosis_ids": ["..."],
        "patient_brief_ids": ["..."],
        "genealogy_person_ids": ["..."],
        "genealogy_event_ids": ["..."]
      }
    },
    "sections": {
      "astrology": {"sun": {"sign": "..."}},
      "tests": [{"test_name": "..."}],
      "cabalistic": {
        "tarot": [],
        "kabbalah": [],
        "cabala_aplicada": {
          "counts": {"analysis_records": 0},
          "records_recent": []
        }
      },
      "bioemotional": {
        "counts": {"observations": 0, "hypotheses": 0, "synthesis": 0},
        "synthesis_latest": null
      }
    },
    "markdown": "# Export Holístico..."
  }
}
```

Sección soportada:
- `bioemotional`: Observaciones, hipótesis, síntesis, lecturas asistidas (validadas por defecto), briefs para paciente y estructura del árbol/genealogía.

Nota sobre `cabala_aplicada`:
- Se incluye cuando `selected_sections.kabbalah=true`.
- Fuente principal: `AnalysisRecord` con `kind='kabbalah'` (ejecuciones del adapter/engine del workspace `/dashboard/therapist/cabala-aplicada`).
- Los UUID quedan en `source_trace.cabala_aplicada_analysis_record_ids`.

---

## Cómo se usará para reportes (futuro)
1) Terapeuta genera 1..N exports internos (distintas fechas y enfoques).
2) Un endpoint futuro de **“Informe para paciente”** toma:
   - el export seleccionado (o un rango)
   - notas humanas del terapeuta
   - y produce un informe detallado (AI) con reglas clínicas y de estilo.

Recomendación: el informe para paciente debe:
- Mantener trazabilidad a `source_trace`.
- Ser “no decisorio” (apoyo, no diagnóstico médico automatizado).
- Usar visibilidad explícita y control del terapeuta.

---

## Seguridad y visibilidad
- Por defecto, estos exports son **solo terapeuta**.
- No se exponen a `my-results/` del paciente salvo que en el futuro se cree un flujo de publicación controlado.

---

## Archivos relevantes
- Backend view: `backend/api/patient_holistic_export_views.py`
- URL route: `backend/api/urls.py`
- Modelo ledger: `backend/api/models.py` (`AnalysisRecord`)
