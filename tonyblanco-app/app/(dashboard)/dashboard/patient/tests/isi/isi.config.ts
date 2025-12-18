export const isiDefinition = {
  name: "ISI (Índice de Severidad del Insomnio)",
  purpose: "Evaluar la severidad del insomnio y su impacto",
  target_population: "Adultos",
  execution_mode: "patient_self",
  estimated_time_minutes: "3–5",
  questions: [
    {
      id: "q1",
      text: "Dificultad para conciliar el sueño",
      scale: { min: 0, max: 4, labels: { "0": "Ninguno", "1": "Leve", "2": "Moderado", "3": "Grave", "4": "Muy grave" } }
    },
    {
      id: "q2",
      text: "Dificultad para mantener el sueño",
      scale: { min: 0, max: 4, labels: { "0": "Ninguno", "1": "Leve", "2": "Moderado", "3": "Grave", "4": "Muy grave" } }
    },
    {
      id: "q3",
      text: "Despertar demasiado temprano",
      scale: { min: 0, max: 4, labels: { "0": "Ninguno", "1": "Leve", "2": "Moderado", "3": "Grave", "4": "Muy grave" } }
    },
    {
      id: "q4",
      text: "Satisfacción con el patrón de sueño actual",
      scale: { min: 0, max: 4, labels: { "0": "Ninguno", "1": "Leve", "2": "Moderado", "3": "Grave", "4": "Muy grave" } }
    },
    {
      id: "q5",
      text: "Interferencia del problema de sueño con la vida diaria",
      scale: { min: 0, max: 4, labels: { "0": "Ninguno", "1": "Leve", "2": "Moderado", "3": "Grave", "4": "Muy grave" } }
    },
    {
      id: "q6",
      text: "Grado en que otros notan el problema de sueño",
      scale: { min: 0, max: 4, labels: { "0": "Ninguno", "1": "Leve", "2": "Moderado", "3": "Grave", "4": "Muy grave" } }
    },
    {
      id: "q7",
      text: "Preocupación o malestar causado por el problema de sueño",
      scale: { min: 0, max: 4, labels: { "0": "Ninguno", "1": "Leve", "2": "Moderado", "3": "Grave", "4": "Muy grave" } }
    }
  ],
  clinical_notes: [
    "Instrumento de severidad, no diagnóstico.",
    "Útil para seguimiento del tratamiento.",
    "Interpretar junto con evaluación clínica del sueño."
  ]
} as const;
