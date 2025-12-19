export const staiDefinition = {
  name: "STAI (Ansiedad Estado-Rasgo)",
  purpose: "Evaluacion de ansiedad estado y rasgo",
  target_population: "Adultos",
  execution_mode: "patient_self",
  estimated_time_minutes: "8-12",
  questions: [
    {
      id: "q1",
      text: "Me siento calmado",
      scale: { min: 1, max: 4, labels: { "1": "Casi nunca", "2": "A veces", "3": "A menudo", "4": "Casi siempre" } }
    },
    {
      id: "q2",
      text: "Me preocupan posibles desgracias",
      scale: { min: 1, max: 4, labels: { "1": "Casi nunca", "2": "A veces", "3": "A menudo", "4": "Casi siempre" } }
    },
    {
      id: "q3",
      text: "Me siento tenso",
      scale: { min: 1, max: 4, labels: { "1": "Casi nunca", "2": "A veces", "3": "A menudo", "4": "Casi siempre" } }
    },
    {
      id: "q4",
      text: "Me siento satisfecho",
      scale: { min: 1, max: 4, labels: { "1": "Casi nunca", "2": "A veces", "3": "A menudo", "4": "Casi siempre" } }
    },
    {
      id: "q5",
      text: "Me siento preocupado",
      scale: { min: 1, max: 4, labels: { "1": "Casi nunca", "2": "A veces", "3": "A menudo", "4": "Casi siempre" } }
    },
    {
      id: "q6",
      text: "Me siento descansado",
      scale: { min: 1, max: 4, labels: { "1": "Casi nunca", "2": "A veces", "3": "A menudo", "4": "Casi siempre" } }
    },
    {
      id: "q7",
      text: "Me siento nervioso e inquieto",
      scale: { min: 1, max: 4, labels: { "1": "Casi nunca", "2": "A veces", "3": "A menudo", "4": "Casi siempre" } }
    },
    {
      id: "q8",
      text: "Me siento seguro",
      scale: { min: 1, max: 4, labels: { "1": "Casi nunca", "2": "A veces", "3": "A menudo", "4": "Casi siempre" } }
    },
    {
      id: "q9",
      text: "Me siento angustiado",
      scale: { min: 1, max: 4, labels: { "1": "Casi nunca", "2": "A veces", "3": "A menudo", "4": "Casi siempre" } }
    },
    {
      id: "q10",
      text: "Me siento cómodo",
      scale: { min: 1, max: 4, labels: { "1": "Casi nunca", "2": "A veces", "3": "A menudo", "4": "Casi siempre" } }
    }
  ],
  clinical_notes: [
    "Instrumento de severidad, no diagnostico.",
    "Interpretar junto con contexto clinico.",
    "Usar para seguimiento y comparacion longitudinal."
  ]
} as const;
