export const duditSpiritDefinition = {
  code: 'dudit_spirit',
  name: 'DUDIT-Spirit — Divine Unity Drug Introspection',
  purpose: 'Exploración simbólica de la relación con sustancias y el equilibrio de Yesod',
  estimated_time_minutes: 5,
  disclaimer: 'Exploración simbólica no clínica. No sustituye diagnóstico médico.',
  questions: [
    {
      id: 'q1',
      text: '¿Con qué frecuencia usas sustancias (distintas del alcohol) para modificar tu estado de conciencia o buscar alivio emocional?',
      scale: {
        0: 'Nunca',
        1: 'Menos de una vez al mes',
        2: 'Mensualmente',
        3: 'Semanalmente',
        4: 'A diario o casi a diario',
      },
    },
    {
      id: 'q2',
      text: '¿Combinas varias sustancias en una misma ocasión para intensificar o variar el efecto?',
      scale: {
        0: 'Nunca',
        1: 'Menos de una vez al mes',
        2: 'Mensualmente',
        3: 'Semanalmente',
        4: 'A diario o casi a diario',
      },
    },
    {
      id: 'q3',
      text: '¿Cuántas tomas o dosis consumes en un día típico de uso?',
      scale: {
        0: 'Una o dos',
        1: 'Tres o cuatro',
        2: 'Cinco o seis',
        3: 'Siete a nueve',
        4: 'Diez o más',
      },
    },
    {
      id: 'q4',
      text: '¿Con qué frecuencia quedas profundamente alterado/a por los efectos de las sustancias?',
      scale: {
        0: 'Nunca',
        1: 'Menos de una vez al mes',
        2: 'Mensualmente',
        3: 'Semanalmente',
        4: 'A diario o casi a diario',
      },
    },
    {
      id: 'q5',
      text: 'En el último año, ¿con qué frecuencia sentiste que el impulso de consumir era tan intenso que no podías resistirlo?',
      scale: {
        0: 'Nunca',
        1: 'Menos de una vez al mes',
        2: 'Mensualmente',
        3: 'Semanalmente',
        4: 'A diario o casi a diario',
      },
    },
    {
      id: 'q6',
      text: 'En el último año, ¿con qué frecuencia no pudiste dejar de consumir una vez que habías empezado?',
      scale: {
        0: 'Nunca',
        1: 'Menos de una vez al mes',
        2: 'Mensualmente',
        3: 'Semanalmente',
        4: 'A diario o casi a diario',
      },
    },
    {
      id: 'q7',
      text: 'En el último año, ¿con qué frecuencia el consumo te impidió cumplir responsabilidades importantes?',
      scale: {
        0: 'Nunca',
        1: 'Menos de una vez al mes',
        2: 'Mensualmente',
        3: 'Semanalmente',
        4: 'A diario o casi a diario',
      },
    },
    {
      id: 'q8',
      text: 'En el último año, ¿con qué frecuencia necesitaste consumir a primera hora del día para superar el malestar del día anterior?',
      scale: {
        0: 'Nunca',
        1: 'Menos de una vez al mes',
        2: 'Mensualmente',
        3: 'Semanalmente',
        4: 'A diario o casi a diario',
      },
    },
    {
      id: 'q9',
      text: 'En el último año, ¿con qué frecuencia sentiste culpa, vergüenza o angustia tras el consumo?',
      scale: {
        0: 'Nunca',
        1: 'Menos de una vez al mes',
        2: 'Mensualmente',
        3: 'Semanalmente',
        4: 'A diario o casi a diario',
      },
    },
    {
      id: 'q10',
      text: '¿En algún momento tú u otra persona sufrió daño (físico o emocional) como consecuencia de tu consumo?',
      scale: { 0: 'No', 2: 'Sí, pero no en el último año', 4: 'Sí, en el último año' },
    },
    {
      id: 'q11',
      text: '¿Algún familiar, amigo o profesional de salud ha expresado preocupación por tu consumo o te ha sugerido reducirlo?',
      scale: { 0: 'No', 2: 'Sí, pero no en el último año', 4: 'Sí, en el último año' },
    },
  ],
} as const;
