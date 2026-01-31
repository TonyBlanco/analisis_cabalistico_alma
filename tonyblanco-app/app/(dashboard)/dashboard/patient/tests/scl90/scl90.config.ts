export const scl90Definition = {
  code: "scl90",
  name: "Lente de Simetría del Alma",
  purpose: "Exploración holística para observar señales generales sin etiquetas.",
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
  disclaimer: "Resultado orientativo. No es diagnóstico.",
} as const;
