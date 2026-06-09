# Symbolic API v1 — BFF Contract (frozen)

**Fecha:** 2026-06-09 · **Borde:** Next.js `tonyblanco-app` · **Motor:** `@holistica/symbolic`

---

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/symbolic/v1/analyze` | `analyzeTreeState` sobre `TreeStructuralState` v0.2 |
| `GET` | `/api/symbolic/v1/correspondences?systemId=` | Tablas read-only por sistema |
| `POST` | `/api/symbolic/v1/interpret` | Interpretación simbólica (prompt TS + LLM Django) |

Todas las respuestas usan envelope:

```ts
interface SymbolicApiEnvelope<T> {
  version: 'v1';
  timestamp: string;
  data: T;
}
```

---

## `systemId`

| Valor | Sistema |
|---|---|
| `hermetic-golden-dawn` | Golden Dawn (`correspondences/`) — **default** |
| `jewish-traditional` | Cábala judía tradicional (`kabbalah-traditional/`) |

Validado contra `CORRESPONDENCE_SYSTEM_IDS`.

---

## Seguridad (borde)

- `treeState` validado con `validateTreeStateForInterpretation` (10 sefirot, sin PHI)
- `POST /interpret` requiere `swmV3Consent: true` (403 si falta)
- Prompt generado en servidor (`generateSymbolicPrompt` + `correspondenceSystem`)
- LLM solo vía Django `/api/symbolic-interpreter/generate/` (puente, sin lógica simbólica)
- Sin datos personales en payloads del motor TS

---

## Ejemplos

### Correspondencias judías

```http
GET /api/symbolic/v1/correspondences?systemId=jewish-traditional
```

`data.sefirot` incluye `keter.data.divineNameTranslit === 'Eheieh'`.

### Interpretación

```json
POST /api/symbolic/v1/interpret
{
  "treeState": { "...": "TreeStructuralState v0.2" },
  "safetyLevel": "educational",
  "correspondenceSystem": "jewish-traditional",
  "swmV3Consent": true
}
```

---

## Cliente frontend

```ts
import { analyzeTreeViaApi, fetchCorrespondencesViaApi, interpretViaApi } from '@/lib/api/symbolic-api-client';
```

---

## Relacionado

- `KABBALAH_TRADITIONAL_MODULE.md` — Fase 2 tradicional
- `TREE_MODULE_V02.md` — Árbol v0.2
- `packages/symbolic/api/dto.ts` — tipos congelados