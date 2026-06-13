# Reglas de legibilidad — vista de paciente

**Ámbito:** páginas y modales del consultante (`/dashboard/patient/**`), incluido `/dashboard/patient/results`.

**Objetivo:** toda lectura de resultados debe sentirse humana, cálida y explícita. El paciente no interpreta payloads ni vocabulario clínico.

## Obligatorio en vista paciente

- Frases completas en español natural.
- Sugerencias estructuradas (`sugerencia`, `categoria`, `basado_en`) formateadas con `formatClientSuggestion()` en `tonyblanco-app/lib/formatClientReading.ts`.
- Contexto simbólico en lenguaje llano (p. ej. «Inspirado en tu Esencia 8 — Esplendor/Gloria»).

## Prohibido en vista paciente

- JSON crudo, `JSON.stringify`, o cadenas con `{` + claves.
- Claves de objeto visibles (`basado_en`, `categoria`, `sugerencia`, `texto`, `sefira`, etc.).
- `[object Object]`.
- Enums o flags internos (`gevurah_status`, `risk_zone`, `severity`, `clinical_diagnosis`, …).
- Nombres de instrumentos clínicos, códigos de test o jerga de scoring.

## Vista terapeuta

El detalle técnico, dominios numéricos, flags y datos estructurados viven en la vista de terapeuta (`isTherapist` / `clientFacing={false}`).

## Guardrail en código

Los tests en `tonyblanco-app/__tests__/unit/clientFacingReadability.test.tsx` fallan si un render de paciente contiene fugas (`{`, `[object Object]`, claves crudas). Ejecutar:

```bash
cd tonyblanco-app && npm run test:unit -- clientFacingReadability
```

## Implementación de referencia

| Pieza | Ubicación |
|-------|-----------|
| Formatter paciente | `lib/formatClientReading.ts` → `formatClientSuggestion()` |
| Coerción segura | `lib/normalizeText.ts` → `asText({ clientFacing: true })` |
| Render compartido | `components/test-results/ReadableResult.tsx` con `clientFacing` |
| Lista + modal paciente | `components/PatientResultsSection.tsx` |