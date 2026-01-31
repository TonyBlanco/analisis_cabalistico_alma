export const phq9Definition = {
  name: "Pulso del Ánimo — 9 señales",
  purpose: "Exploración del ánimo y la energía (no diagnóstica)",
  target_population: "Consultantes adultos",
  execution_mode: "patient_self",
  estimated_time_minutes: "2–3",
  questions: [
    {
      id: "q1",
      text: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado la falta de interés o placer en hacer cosas?",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Nada en absoluto",
          "1": "Varios días",
          "2": "Más de la mitad de los días",
          "3": "Casi todos los días"
        }
      }
    },
    {
      id: "q2",
      text: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado sentirse desanimado, deprimido o sin esperanza?",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Nada en absoluto",
          "1": "Varios días",
          "2": "Más de la mitad de los días",
          "3": "Casi todos los días"
        }
      }
    },
    {
      id: "q3",
      text: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado problemas para conciliar el sueño o mantenerse dormido, o dormir demasiado?",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Nada en absoluto",
          "1": "Varios días",
          "2": "Más de la mitad de los días",
          "3": "Casi todos los días"
        }
      }
    },
    {
      id: "q4",
      text: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado sentirse cansado o con poca energía?",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Nada en absoluto",
          "1": "Varios días",
          "2": "Más de la mitad de los días",
          "3": "Casi todos los días"
        }
      }
    },
    {
      id: "q5",
      text: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado falta de apetito o comer en exceso?",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Nada en absoluto",
          "1": "Varios días",
          "2": "Más de la mitad de los días",
          "3": "Casi todos los días"
        }
      }
    },
    {
      id: "q6",
      text: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado sentirse mal consigo mismo, que es un fracaso o que ha fallado a su familia?",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Nada en absoluto",
          "1": "Varios días",
          "2": "Más de la mitad de los días",
          "3": "Casi todos los días"
        }
      }
    },
    {
      id: "q7",
      text: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado problemas para concentrarse en cosas, como leer el periódico o ver la televisión?",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Nada en absoluto",
          "1": "Varios días",
          "2": "Más de la mitad de los días",
          "3": "Casi todos los días"
        }
      }
    },
    {
      id: "q8",
      text: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado moverse o hablar tan despacio que otras personas podrían haberlo notado? O lo contrario: estar tan inquieto o agitado que se ha movido mucho más de lo habitual?",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Nada en absoluto",
          "1": "Varios días",
          "2": "Más de la mitad de los días",
          "3": "Casi todos los días"
        }
      }
    },
    {
      id: "q9",
      text: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado pensamientos de que estaría mejor muerto o de hacerse daño de alguna manera?",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Nada en absoluto",
          "1": "Varios días",
          "2": "Más de la mitad de los días",
          "3": "Casi todos los días"
        }
      }
    }
  ]
} as const;
