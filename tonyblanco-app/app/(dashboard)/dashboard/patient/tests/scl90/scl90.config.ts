export const scl90Definition = {
  code: "scl90",
  name: "SCL-90 — Screening Holístico",
  purpose: "Evaluación holística para explorar síntomas generales sin etiqueta médica.",
  model: "wellness",
  estimatedTimeMinutes: "12-15",
  scale: {
    min: 0,
    max: 4,
    labels: {
      "0": "Nada",
      "1": "Muy poco",
      "2": "Un poco",
      "3": "Bastante",
      "4": "Mucho",
    } as Record<string, string>,
  },
  disclaimer: "Resultado orientativo. No diagnóstico.",
} as const;
