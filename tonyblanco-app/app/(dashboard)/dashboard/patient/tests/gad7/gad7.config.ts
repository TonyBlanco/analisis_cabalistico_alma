export const gad7Definition = {
  name: "GAD-7",
  purpose: "Cribado de ansiedad generalizada",
  target_population: "Adultos",
  execution_mode: "patient_self",
  estimated_time_minutes: "2–3",
  questions: [
    {
      id: "q1",
      text: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado sentirse nervioso, ansioso o al borde?",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Nunca",
          "1": "Varios días",
          "2": "Más de la mitad de los días",
          "3": "Casi todos los días"
        }
      }
    },
    {
      id: "q2",
      text: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado no poder dejar de preocuparse o detener la preocupación?",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Nunca",
          "1": "Varios días",
          "2": "Más de la mitad de los días",
          "3": "Casi todos los días"
        }
      }
    },
    {
      id: "q3",
      text: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado preocuparse demasiado por diferentes cosas?",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Nunca",
          "1": "Varios días",
          "2": "Más de la mitad de los días",
          "3": "Casi todos los días"
        }
      }
    },
    {
      id: "q4",
      text: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado tener dificultades para relajarse?",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Nunca",
          "1": "Varios días",
          "2": "Más de la mitad de los días",
          "3": "Casi todos los días"
        }
      }
    },
    {
      id: "q5",
      text: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado estar tan inquieto que le es difícil permanecer quieto?",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Nunca",
          "1": "Varios días",
          "2": "Más de la mitad de los días",
          "3": "Casi todos los días"
        }
      }
    },
    {
      id: "q6",
      text: "Durante las últimas 2 semanas, ¿con qué frecuencia se ha molestado por enfadarse o irritarse con facilidad?",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Nunca",
          "1": "Varios días",
          "2": "Más de la mitad de los días",
          "3": "Casi todos los días"
        }
      }
    },
    {
      id: "q7",
      text: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado sentir miedo como si algo terrible fuera a pasar?",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Nunca",
          "1": "Varios días",
          "2": "Más de la mitad de los días",
          "3": "Casi todos los días"
        }
      }
    }
  ],
  clinical_notes: [
    "Instrumento de cribado para ansiedad generalizada; no reemplaza la evaluación clínica.",
    "Requiere seguimiento clínico para puntajes en rango moderado o superior.",
    "Usar en contexto de entrevista clínica cuando sea necesario."
  ]
} as const;
