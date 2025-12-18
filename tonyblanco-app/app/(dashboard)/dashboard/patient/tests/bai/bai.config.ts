export const baiDefinition = {
  name: "BAI (Inventario de Ansiedad de Beck)",
  purpose: "Evaluación de la severidad de síntomas de ansiedad",
  target_population: "Adultos",
  execution_mode: "patient_self",
  estimated_time_minutes: "5–10",
  questions: [
    {
      id: "q1",
      text: "Entumecimiento u hormigueo",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    },
    {
      id: "q2",
      text: "Sensación de calor",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    },
    {
      id: "q3",
      text: "Temblor en las piernas",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    },
    {
      id: "q4",
      text: "Incapaz de relajarse",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    },
    {
      id: "q5",
      text: "Miedo a que ocurra lo peor",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    },
    {
      id: "q6",
      text: "Mareado o aturdido",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    },
    {
      id: "q7",
      text: "Latidos del corazón fuertes o rápidos",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    },
    {
      id: "q8",
      text: "Inestable",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    },
    {
      id: "q9",
      text: "Asustado sin razón",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    },
    {
      id: "q10",
      text: "Nervioso",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    },
    {
      id: "q11",
      text: "Sensación de asfixia",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    },
    {
      id: "q12",
      text: "Temblor en las manos",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    },
    {
      id: "q13",
      text: "Temblor general",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    },
    {
      id: "q14",
      text: "Miedo a perder el control",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    },
    {
      id: "q15",
      text: "Dificultad para respirar",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    },
    {
      id: "q16",
      text: "Miedo a morir",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    },
    {
      id: "q17",
      text: "Asustado o sobresaltado",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    },
    {
      id: "q18",
      text: "Molestias digestivas o malestar abdominal",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    },
    {
      id: "q19",
      text: "Sensación de desmayo",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    },
    {
      id: "q20",
      text: "Rubor facial",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    },
    {
      id: "q21",
      text: "Sudoración (no debida al calor)",
      scale: { min: 0, max: 3, labels: { "0": "Nada", "1": "Leve", "2": "Moderado", "3": "Grave" } }
    }
  ],
  clinical_notes: [
    "Instrumento de severidad, no diagnóstico.",
    "Útil para seguimiento y respuesta al tratamiento.",
    "Interpretar junto con juicio clínico."
  ]
} as const;
